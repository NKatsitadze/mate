import { subscriptionRepository } from '@/features/billing/repository/subscription.repository';
import { webhookEventRepository } from '@/features/billing/repository/webhook-event.repository';
import { PaidPlanTier, SubscriptionResponse } from '@/features/billing/types/billing.types';
import { CreateCheckoutSessionType } from '@/features/billing/validations/billing.validation';
import { getShopByOwnerIdService, updateShopPlanService } from '@/features/shops/service/shop.service';
import { PlanTier, PLAN_TIER_VALUES } from '@/shared/const/plans.const';
import { dodo, DodoWebhookHeaders } from '@/shared/lib/dodo';
import { ServiceResult } from '@/shared/types/common';

function isPlanTier(value: string): value is PlanTier {
  return (PLAN_TIER_VALUES as readonly string[]).includes(value);
}

function getDodoProductId(plan: PaidPlanTier): string | undefined {
  return plan === 'pro' ? process.env.DODO_PRODUCT_ID_PRO : process.env.DODO_PRODUCT_ID_PREMIUM;
}

export async function createCheckoutSessionService(
  ownerId: string,
  userEmail: string,
  input: CreateCheckoutSessionType
): Promise<ServiceResult<{ checkoutUrl: string }>> {
  const shopResult = await getShopByOwnerIdService(ownerId);
  if ('error' in shopResult.data) return { data: { error: 'NO_SHOP' }, status: 404 };

  const productId = getDodoProductId(input.plan);
  if (!productId) return { data: { error: 'PLAN_NOT_CONFIGURED' }, status: 500 };

  const result = await dodo.createCheckoutSession({
    productId,
    customerEmail: userEmail,
    metadata: { shopId: shopResult.data.id, plan: input.plan },
    returnUrl: `${process.env.APP_URL}/dashboard/billing?status=success`,
  });

  if (!result.checkoutUrl) return { data: { error: 'CHECKOUT_UNAVAILABLE' }, status: 500 };

  return { data: { checkoutUrl: result.checkoutUrl }, status: 200 };
}

export async function getSubscriptionByShopService(ownerId: string): Promise<ServiceResult<SubscriptionResponse>> {
  const shopResult = await getShopByOwnerIdService(ownerId);
  if ('error' in shopResult.data) return { data: { error: 'NO_SHOP' }, status: 404 };

  const subscription = await subscriptionRepository.findByShopId(shopResult.data.id);
  if (!subscription) {
    return { data: { plan: shopResult.data.plan, status: null, currentPeriodEnd: null }, status: 200 };
  }

  return {
    data: {
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd ? subscription.currentPeriodEnd.toISOString() : null,
    },
    status: 200,
  };
}

export async function handleDodoWebhookService(
  rawBody: string,
  headers: DodoWebhookHeaders
): Promise<ServiceResult<{ message: string }>> {
  let event;
  try {
    event = dodo.verifyWebhook(rawBody, headers);
  } catch {
    return { data: { error: 'INVALID_SIGNATURE' }, status: 400 };
  }

  const alreadyProcessed = await webhookEventRepository.findByEventId(event.eventId);
  if (alreadyProcessed) {
    return { data: { message: 'Already processed' }, status: 200 };
  }

  const shopId = typeof event.metadata.shopId === 'string' ? event.metadata.shopId : null;
  const plan = typeof event.metadata.plan === 'string' && isPlanTier(event.metadata.plan) ? event.metadata.plan : null;

  if (shopId && plan) {
    const dodoCustomerId = event.customerId ?? '';
    const dodoSubscriptionId = event.subscriptionId ?? '';
    const currentPeriodEnd = event.nextBillingDate ? new Date(event.nextBillingDate) : undefined;

    switch (event.type) {
      case 'subscription.active':
      case 'subscription.renewed':
      case 'subscription.plan_changed':
      case 'subscription.updated':
        await subscriptionRepository.upsertByShopId(shopId, {
          dodoCustomerId,
          dodoSubscriptionId,
          plan,
          status: 'active',
          currentPeriodEnd,
        });
        await updateShopPlanService(shopId, plan);
        break;
      case 'subscription.on_hold':
      case 'subscription.failed':
        await subscriptionRepository.upsertByShopId(shopId, {
          dodoCustomerId,
          dodoSubscriptionId,
          plan,
          status: 'on_hold',
        });
        break;
      case 'subscription.cancelled':
      case 'subscription.expired':
        await subscriptionRepository.upsertByShopId(shopId, {
          dodoCustomerId,
          dodoSubscriptionId,
          plan,
          status: event.type === 'subscription.cancelled' ? 'cancelled' : 'expired',
        });
        await updateShopPlanService(shopId, 'free');
        break;
      default:
        break;
    }
  }

  try {
    await webhookEventRepository.create({ dodoEventId: event.eventId, type: event.type, payload: event });
  } catch {
    // Duplicate-key race from a concurrent identical delivery — already
    // handled above, safe to ignore.
  }

  return { data: { message: 'ok' }, status: 200 };
}

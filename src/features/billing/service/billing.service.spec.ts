import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/billing/repository/subscription.repository', () => ({
  subscriptionRepository: {
    findByShopId: vi.fn(),
    upsertByShopId: vi.fn(),
  },
}));

vi.mock('@/features/billing/repository/webhook-event.repository', () => ({
  webhookEventRepository: {
    findByEventId: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/features/shops/service/shop.service', () => ({
  getShopByOwnerIdService: vi.fn(),
  updateShopPlanService: vi.fn(),
}));

vi.mock('@/shared/lib/dodo', () => ({
  dodo: {
    createCheckoutSession: vi.fn(),
    verifyWebhook: vi.fn(),
  },
}));

import { subscriptionRepository } from '@/features/billing/repository/subscription.repository';
import { webhookEventRepository } from '@/features/billing/repository/webhook-event.repository';
import { getShopByOwnerIdService, updateShopPlanService } from '@/features/shops/service/shop.service';
import { dodo } from '@/shared/lib/dodo';

import {
  createCheckoutSessionService,
  getSubscriptionByShopService,
  handleDodoWebhookService,
} from './billing.service';

const mockSubscriptionRepo = vi.mocked(subscriptionRepository);
const mockWebhookEventRepo = vi.mocked(webhookEventRepository);
const mockGetShop = vi.mocked(getShopByOwnerIdService);
const mockUpdateShopPlan = vi.mocked(updateShopPlanService);
const mockDodo = vi.mocked(dodo);

const activeShop = {
  id: '507f1f77bcf86cd799439022',
  ownerId: '507f1f77bcf86cd799439099',
  name: 'Corner Grocery',
  category: 'grocery_store' as const,
  phone: '+995500000000',
  address: 'Vake, Tbilisi',
  lat: 41.72,
  lng: 44.78,
  plan: 'free' as const,
  status: 'active' as const,
  isVerified: false,
};

const headers = { 'webhook-id': 'evt_123', 'webhook-signature': 'sig', 'webhook-timestamp': '123' };

describe('createCheckoutSessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DODO_PRODUCT_ID_PRO = 'pdt_pro';
    process.env.DODO_PRODUCT_ID_PREMIUM = 'pdt_premium';
    process.env.APP_URL = 'https://mate.example.com';
  });

  it('returns 404 when the caller has no shop', async () => {
    mockGetShop.mockResolvedValueOnce({ data: { error: 'NOT_FOUND' }, status: 404 });
    const result = await createCheckoutSessionService('507f1f77bcf86cd799439099', 'owner@example.com', { plan: 'pro' });
    expect(result.status).toBe(404);
  });

  it('creates a checkout session with shopId/plan in metadata', async () => {
    mockGetShop.mockResolvedValueOnce({ data: activeShop, status: 200 });
    mockDodo.createCheckoutSession.mockResolvedValueOnce({
      sessionId: 'sess_1',
      checkoutUrl: 'https://checkout.dodo.dev/sess_1',
    });
    const result = await createCheckoutSessionService('507f1f77bcf86cd799439099', 'owner@example.com', {
      plan: 'pro',
    });
    expect(mockDodo.createCheckoutSession).toHaveBeenCalledWith({
      productId: 'pdt_pro',
      customerEmail: 'owner@example.com',
      metadata: { shopId: '507f1f77bcf86cd799439022', plan: 'pro' },
      returnUrl: 'https://mate.example.com/dashboard/billing?status=success',
    });
    expect(result).toEqual({ data: { checkoutUrl: 'https://checkout.dodo.dev/sess_1' }, status: 200 });
  });
});

describe('getSubscriptionByShopService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when the caller has no shop', async () => {
    mockGetShop.mockResolvedValueOnce({ data: { error: 'NOT_FOUND' }, status: 404 });
    const result = await getSubscriptionByShopService('507f1f77bcf86cd799439099');
    expect(result.status).toBe(404);
  });

  it('returns the shop\'s cached plan with no status when no Subscription doc exists', async () => {
    mockGetShop.mockResolvedValueOnce({ data: activeShop, status: 200 });
    mockSubscriptionRepo.findByShopId.mockResolvedValueOnce(null);
    const result = await getSubscriptionByShopService('507f1f77bcf86cd799439099');
    expect(result).toEqual({ data: { plan: 'free', status: null, currentPeriodEnd: null }, status: 200 });
  });

  it('maps an existing Subscription document', async () => {
    mockGetShop.mockResolvedValueOnce({ data: activeShop, status: 200 });
    mockSubscriptionRepo.findByShopId.mockResolvedValueOnce({
      plan: 'pro',
      status: 'active',
      currentPeriodEnd: new Date('2026-08-01T00:00:00.000Z'),
    } as never);
    const result = await getSubscriptionByShopService('507f1f77bcf86cd799439099');
    expect(result.data).toEqual({ plan: 'pro', status: 'active', currentPeriodEnd: '2026-08-01T00:00:00.000Z' });
  });
});

describe('handleDodoWebhookService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when the signature is invalid', async () => {
    mockDodo.verifyWebhook.mockImplementationOnce(() => {
      throw new Error('bad signature');
    });
    const result = await handleDodoWebhookService('{}', headers);
    expect(result).toEqual({ data: { error: 'INVALID_SIGNATURE' }, status: 400 });
    expect(mockWebhookEventRepo.findByEventId).not.toHaveBeenCalled();
  });

  it('returns 200 with zero writes when the event was already processed', async () => {
    mockDodo.verifyWebhook.mockReturnValueOnce({
      eventId: 'evt_123',
      type: 'subscription.active',
      subscriptionId: 'sub_1',
      customerId: 'cus_1',
      status: 'active',
      nextBillingDate: null,
      metadata: { shopId: '507f1f77bcf86cd799439022', plan: 'pro' },
    });
    mockWebhookEventRepo.findByEventId.mockResolvedValueOnce({ dodoEventId: 'evt_123' } as never);
    const result = await handleDodoWebhookService('{}', headers);
    expect(result).toEqual({ data: { message: 'Already processed' }, status: 200 });
    expect(mockSubscriptionRepo.upsertByShopId).not.toHaveBeenCalled();
    expect(mockUpdateShopPlan).not.toHaveBeenCalled();
  });

  it('upserts Subscription and upgrades shop.plan on subscription.active', async () => {
    mockDodo.verifyWebhook.mockReturnValueOnce({
      eventId: 'evt_123',
      type: 'subscription.active',
      subscriptionId: 'sub_1',
      customerId: 'cus_1',
      status: 'active',
      nextBillingDate: '2026-08-01T00:00:00.000Z',
      metadata: { shopId: '507f1f77bcf86cd799439022', plan: 'pro' },
    });
    mockWebhookEventRepo.findByEventId.mockResolvedValueOnce(null);
    const result = await handleDodoWebhookService('{}', headers);
    expect(mockSubscriptionRepo.upsertByShopId).toHaveBeenCalledWith('507f1f77bcf86cd799439022', {
      dodoCustomerId: 'cus_1',
      dodoSubscriptionId: 'sub_1',
      plan: 'pro',
      status: 'active',
      currentPeriodEnd: new Date('2026-08-01T00:00:00.000Z'),
    });
    expect(mockUpdateShopPlan).toHaveBeenCalledWith('507f1f77bcf86cd799439022', 'pro');
    expect(result.status).toBe(200);
  });

  it('leaves shop.plan untouched on subscription.on_hold (grace period)', async () => {
    mockDodo.verifyWebhook.mockReturnValueOnce({
      eventId: 'evt_123',
      type: 'subscription.on_hold',
      subscriptionId: 'sub_1',
      customerId: 'cus_1',
      status: 'on_hold',
      nextBillingDate: null,
      metadata: { shopId: '507f1f77bcf86cd799439022', plan: 'pro' },
    });
    mockWebhookEventRepo.findByEventId.mockResolvedValueOnce(null);
    await handleDodoWebhookService('{}', headers);
    expect(mockSubscriptionRepo.upsertByShopId).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439022',
      expect.objectContaining({ status: 'on_hold' })
    );
    expect(mockUpdateShopPlan).not.toHaveBeenCalled();
  });

  it('downgrades shop.plan to free on subscription.cancelled', async () => {
    mockDodo.verifyWebhook.mockReturnValueOnce({
      eventId: 'evt_123',
      type: 'subscription.cancelled',
      subscriptionId: 'sub_1',
      customerId: 'cus_1',
      status: 'cancelled',
      nextBillingDate: null,
      metadata: { shopId: '507f1f77bcf86cd799439022', plan: 'pro' },
    });
    mockWebhookEventRepo.findByEventId.mockResolvedValueOnce(null);
    await handleDodoWebhookService('{}', headers);
    expect(mockUpdateShopPlan).toHaveBeenCalledWith('507f1f77bcf86cd799439022', 'free');
  });

  it('treats a missing/malformed shopId as a no-op but still records the event (never throws)', async () => {
    mockDodo.verifyWebhook.mockReturnValueOnce({
      eventId: 'evt_123',
      type: 'subscription.active',
      subscriptionId: 'sub_1',
      customerId: 'cus_1',
      status: 'active',
      nextBillingDate: null,
      metadata: {},
    });
    mockWebhookEventRepo.findByEventId.mockResolvedValueOnce(null);
    const result = await handleDodoWebhookService('{}', headers);
    expect(mockSubscriptionRepo.upsertByShopId).not.toHaveBeenCalled();
    expect(mockUpdateShopPlan).not.toHaveBeenCalled();
    expect(mockWebhookEventRepo.create).toHaveBeenCalled();
    expect(result.status).toBe(200);
  });

  it('records but does not act on an unrecognized event type', async () => {
    mockDodo.verifyWebhook.mockReturnValueOnce({
      eventId: 'evt_123',
      type: 'payment.succeeded',
      subscriptionId: null,
      customerId: null,
      status: null,
      nextBillingDate: null,
      metadata: { shopId: '507f1f77bcf86cd799439022', plan: 'pro' },
    });
    mockWebhookEventRepo.findByEventId.mockResolvedValueOnce(null);
    const result = await handleDodoWebhookService('{}', headers);
    expect(mockSubscriptionRepo.upsertByShopId).not.toHaveBeenCalled();
    expect(mockWebhookEventRepo.create).toHaveBeenCalled();
    expect(result.status).toBe(200);
  });

  it('still returns 200 when recording the event hits a duplicate-key race', async () => {
    mockDodo.verifyWebhook.mockReturnValueOnce({
      eventId: 'evt_123',
      type: 'subscription.updated',
      subscriptionId: 'sub_1',
      customerId: 'cus_1',
      status: 'active',
      nextBillingDate: null,
      metadata: { shopId: '507f1f77bcf86cd799439022', plan: 'premium' },
    });
    mockWebhookEventRepo.findByEventId.mockResolvedValueOnce(null);
    mockWebhookEventRepo.create.mockRejectedValueOnce(new Error('duplicate key'));
    const result = await handleDodoWebhookService('{}', headers);
    expect(result.status).toBe(200);
  });
});

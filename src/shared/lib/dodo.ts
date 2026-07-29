import DodoPayments from 'dodopayments';
import { Webhook } from 'standardwebhooks';
import { z } from 'zod';

export type DodoCheckoutParams = {
  productId: string;
  customerEmail: string;
  metadata: Record<string, string>;
  returnUrl: string;
};

export type DodoCheckoutResult = {
  sessionId: string;
  checkoutUrl: string | null;
};

export type DodoWebhookHeaders = {
  'webhook-id': string;
  'webhook-signature': string;
  'webhook-timestamp': string;
};

export type DodoWebhookEvent = {
  eventId: string;
  type: string;
  subscriptionId: string | null;
  customerId: string | null;
  status: string | null;
  nextBillingDate: string | null;
  metadata: Record<string, string | number | boolean>;
};

const DodoWebhookPayloadSchema = z.object({
  type: z.string(),
  data: z.object({
    subscription_id: z.string().optional(),
    status: z.string().optional(),
    next_billing_date: z.string().optional(),
    customer: z.object({ customer_id: z.string() }).optional(),
    metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  }),
});

class DodoClientManager {
  private client: DodoPayments | null = null;
  private webhook: Webhook | null = null;

  private getClient(): DodoPayments {
    if (!this.client) {
      this.client = new DodoPayments({
        bearerToken: process.env.DODO_API_KEY,
        environment: process.env.DODO_ENVIRONMENT === 'live_mode' ? 'live_mode' : 'test_mode',
      });
    }
    return this.client;
  }

  private getWebhook(): Webhook {
    if (!this.webhook) {
      this.webhook = new Webhook(process.env.DODO_WEBHOOK_SECRET!);
    }
    return this.webhook;
  }

  async createCheckoutSession(params: DodoCheckoutParams): Promise<DodoCheckoutResult> {
    const response = await this.getClient().checkoutSessions.create({
      product_cart: [{ product_id: params.productId, quantity: 1 }],
      customer: { email: params.customerEmail },
      metadata: params.metadata,
      return_url: params.returnUrl,
    });

    return { sessionId: response.session_id, checkoutUrl: response.checkout_url ?? null };
  }

  verifyWebhook(rawBody: string, headers: DodoWebhookHeaders): DodoWebhookEvent {
    const rawPayload = this.getWebhook().verify(rawBody, headers);
    const payload = DodoWebhookPayloadSchema.parse(rawPayload);

    return {
      eventId: headers['webhook-id'],
      type: payload.type,
      subscriptionId: payload.data.subscription_id ?? null,
      customerId: payload.data.customer?.customer_id ?? null,
      status: payload.data.status ?? null,
      nextBillingDate: payload.data.next_billing_date ?? null,
      metadata: payload.data.metadata ?? {},
    };
  }
}

export const dodo = new DodoClientManager();
export { DodoClientManager };

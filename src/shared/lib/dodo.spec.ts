import { beforeEach, describe, expect, it, vi } from 'vitest';

const { checkoutSessionsCreateMock, dodoConstructorMock, webhookConstructorMock, webhookVerifyMock } = vi.hoisted(
  () => ({
    checkoutSessionsCreateMock: vi.fn(),
    dodoConstructorMock: vi.fn(),
    webhookConstructorMock: vi.fn(),
    webhookVerifyMock: vi.fn(),
  })
);

vi.mock('dodopayments', () => ({
  default: vi.fn().mockImplementation(function DodoPaymentsMock(...args: unknown[]) {
    dodoConstructorMock(...args);
    return { checkoutSessions: { create: checkoutSessionsCreateMock } };
  }),
}));

vi.mock('standardwebhooks', () => ({
  Webhook: vi.fn().mockImplementation(function WebhookMock(...args: unknown[]) {
    webhookConstructorMock(...args);
    return { verify: webhookVerifyMock };
  }),
}));

import { DodoClientManager } from './dodo';

describe('DodoClientManager', () => {
  let manager: DodoClientManager;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DODO_API_KEY = 'test-key';
    process.env.DODO_ENVIRONMENT = 'test_mode';
    process.env.DODO_WEBHOOK_SECRET = 'test-secret';
    manager = new DodoClientManager();
  });

  describe('createCheckoutSession', () => {
    it('maps params into the Dodo checkout session request shape', async () => {
      checkoutSessionsCreateMock.mockResolvedValue({
        session_id: 'sess_123',
        checkout_url: 'https://checkout.dodo.dev/sess_123',
      });

      const result = await manager.createCheckoutSession({
        productId: 'pdt_pro',
        customerEmail: 'owner@example.com',
        metadata: { shopId: 'shop_1', plan: 'pro' },
        returnUrl: 'https://mate.example.com/dashboard/billing?status=success',
      });

      expect(checkoutSessionsCreateMock).toHaveBeenCalledWith({
        product_cart: [{ product_id: 'pdt_pro', quantity: 1 }],
        customer: { email: 'owner@example.com' },
        metadata: { shopId: 'shop_1', plan: 'pro' },
        return_url: 'https://mate.example.com/dashboard/billing?status=success',
      });
      expect(result).toEqual({ sessionId: 'sess_123', checkoutUrl: 'https://checkout.dodo.dev/sess_123' });
    });

    it('falls back to a null checkoutUrl when Dodo omits it', async () => {
      checkoutSessionsCreateMock.mockResolvedValue({ session_id: 'sess_1', checkout_url: null });
      const result = await manager.createCheckoutSession({
        productId: 'p',
        customerEmail: 'e@x.com',
        metadata: {},
        returnUrl: 'https://x.com',
      });
      expect(result.checkoutUrl).toBeNull();
    });

    it('constructs the Dodo client lazily, only once across calls', async () => {
      checkoutSessionsCreateMock.mockResolvedValue({ session_id: 'sess_1', checkout_url: null });
      await manager.createCheckoutSession({ productId: 'p', customerEmail: 'e@x.com', metadata: {}, returnUrl: 'https://x.com' });
      await manager.createCheckoutSession({ productId: 'p2', customerEmail: 'e@x.com', metadata: {}, returnUrl: 'https://x.com' });
      expect(dodoConstructorMock).toHaveBeenCalledOnce();
    });
  });

  describe('verifyWebhook', () => {
    const headers = {
      'webhook-id': 'evt_123',
      'webhook-signature': 'sig',
      'webhook-timestamp': '1234567890',
    };

    it('calls Webhook.verify with the exact raw body and headers', () => {
      webhookVerifyMock.mockReturnValue({ type: 'subscription.updated', data: {} });
      manager.verifyWebhook('{"raw":"body"}', headers);
      expect(webhookVerifyMock).toHaveBeenCalledWith('{"raw":"body"}', headers);
    });

    it('maps a valid parsed payload to DodoWebhookEvent, using the webhook-id header as eventId', () => {
      webhookVerifyMock.mockReturnValue({
        type: 'subscription.active',
        data: {
          subscription_id: 'sub_1',
          customer: { customer_id: 'cus_1' },
          status: 'active',
          next_billing_date: '2026-08-01',
          metadata: { shopId: 'shop_1', plan: 'pro' },
        },
      });

      const result = manager.verifyWebhook('{"raw":"body"}', headers);

      expect(result).toEqual({
        eventId: 'evt_123',
        type: 'subscription.active',
        subscriptionId: 'sub_1',
        customerId: 'cus_1',
        status: 'active',
        nextBillingDate: '2026-08-01',
        metadata: { shopId: 'shop_1', plan: 'pro' },
      });
    });

    it('defaults missing optional fields to null/empty rather than throwing', () => {
      webhookVerifyMock.mockReturnValue({ type: 'subscription.paused', data: {} });
      const result = manager.verifyWebhook('{}', headers);
      expect(result).toEqual({
        eventId: 'evt_123',
        type: 'subscription.paused',
        subscriptionId: null,
        customerId: null,
        status: null,
        nextBillingDate: null,
        metadata: {},
      });
    });

    it('throws when the signature is invalid rather than swallowing the error', () => {
      webhookVerifyMock.mockImplementation(() => {
        throw new Error('bad signature');
      });
      expect(() => manager.verifyWebhook('{}', headers)).toThrow('bad signature');
    });

    it('constructs the Webhook instance lazily, only once across calls', () => {
      webhookVerifyMock.mockReturnValue({ type: 'subscription.updated', data: {} });
      manager.verifyWebhook('{}', headers);
      manager.verifyWebhook('{}', headers);
      expect(webhookConstructorMock).toHaveBeenCalledOnce();
    });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/mongo', () => ({
  mongo: {
    connect: vi.fn(),
  },
}));

vi.mock('@/features/billing/schema/webhook-event.schema', () => ({
  WebhookEventModel: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

import { WebhookEventModel } from '@/features/billing/schema/webhook-event.schema';
import { mongo } from '@/shared/lib/mongo';

import { webhookEventRepository } from './webhook-event.repository';

const mockMongo = vi.mocked(mongo);
const mockModel = vi.mocked(WebhookEventModel);

function makeLeanQuery<T>(result: T) {
  return { lean: () => ({ exec: () => Promise.resolve(result) }) };
}

describe('webhookEventRepository', () => {
  beforeEach(() => vi.clearAllMocks());

  it('findByEventId connects and calls findOne', async () => {
    (mockModel.findOne as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeLeanQuery({ dodoEventId: 'evt_1' }));
    const result = await webhookEventRepository.findByEventId('evt_1');
    expect(mockMongo.connect).toHaveBeenCalled();
    expect(mockModel.findOne).toHaveBeenCalledWith({ dodoEventId: 'evt_1' });
    expect(result).toEqual({ dodoEventId: 'evt_1' });
  });

  it('create calls model.create and returns id string', async () => {
    (mockModel.create as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      _id: { toString: () => '507f1f77bcf86cd799439011' },
    });
    const id = await webhookEventRepository.create({ dodoEventId: 'evt_1', type: 'subscription.active' } as never);
    expect(id).toBe('507f1f77bcf86cd799439011');
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/lib/mongo', () => ({
  mongo: {
    connect: vi.fn(),
  },
}));

vi.mock('@/features/billing/schema/subscription.schema', () => ({
  SubscriptionModel: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

import { SubscriptionModel } from '@/features/billing/schema/subscription.schema';
import { mongo } from '@/shared/lib/mongo';

import { subscriptionRepository } from './subscription.repository';

const mockMongo = vi.mocked(mongo);
const mockModel = vi.mocked(SubscriptionModel);

function makeLeanQuery<T>(result: T) {
  return { lean: () => ({ exec: () => Promise.resolve(result) }) };
}

describe('subscriptionRepository', () => {
  beforeEach(() => vi.clearAllMocks());

  it('findByShopId connects and calls findOne', async () => {
    (mockModel.findOne as ReturnType<typeof vi.fn>).mockReturnValueOnce(makeLeanQuery({ shopId: 'shop_1' }));
    const result = await subscriptionRepository.findByShopId('shop_1');
    expect(mockMongo.connect).toHaveBeenCalled();
    expect(mockModel.findOne).toHaveBeenCalledWith({ shopId: 'shop_1' });
    expect(result).toEqual({ shopId: 'shop_1' });
  });

  it('upsertByShopId calls findOneAndUpdate with upsert:true, new:true', async () => {
    (mockModel.findOneAndUpdate as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      makeLeanQuery({ shopId: 'shop_1', plan: 'pro' })
    );
    const result = await subscriptionRepository.upsertByShopId('shop_1', { plan: 'pro', status: 'active' });
    expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
      { shopId: 'shop_1' },
      { $set: { plan: 'pro', status: 'active' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    expect(result).toEqual({ shopId: 'shop_1', plan: 'pro' });
  });
});

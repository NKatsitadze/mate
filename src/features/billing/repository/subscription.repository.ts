import { SubscriptionDocument, SubscriptionModel } from '@/features/billing/schema/subscription.schema';
import { mongo } from '@/shared/lib/mongo';

export const subscriptionRepository = {
  async findByShopId(shopId: string): Promise<SubscriptionDocument | null> {
    await mongo.connect();
    return SubscriptionModel.findOne({ shopId }).lean<SubscriptionDocument>().exec();
  },

  async upsertByShopId(
    shopId: string,
    data: Partial<Omit<SubscriptionDocument, '_id' | 'shopId' | 'createdAt' | 'updatedAt'>>
  ): Promise<SubscriptionDocument> {
    await mongo.connect();
    const doc = await SubscriptionModel.findOneAndUpdate(
      { shopId },
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
      .lean<SubscriptionDocument>()
      .exec();
    // upsert:true + new:true guarantees a document is always returned.
    return doc!;
  },
};

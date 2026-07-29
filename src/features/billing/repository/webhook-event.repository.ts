import { WebhookEventDocument, WebhookEventModel } from '@/features/billing/schema/webhook-event.schema';
import { mongo } from '@/shared/lib/mongo';

export const webhookEventRepository = {
  async findByEventId(dodoEventId: string): Promise<WebhookEventDocument | null> {
    await mongo.connect();
    return WebhookEventModel.findOne({ dodoEventId }).lean<WebhookEventDocument>().exec();
  },

  async create(data: Omit<WebhookEventDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await mongo.connect();
    const doc = await WebhookEventModel.create(data);
    return doc._id.toString();
  },
};

import { AllowedEmailDocument, AllowedEmailModel } from '@/features/allowlist/schema/allowed-email.schema';
import { mongo } from '@/shared/lib/mongo';

export const allowedEmailRepository = {
  async findByEmail(email: string): Promise<AllowedEmailDocument | null> {
    await mongo.connect();
    return AllowedEmailModel.findOne({ email }).lean<AllowedEmailDocument>().exec();
  },

  async create(data: Omit<AllowedEmailDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await mongo.connect();
    const doc = await AllowedEmailModel.create(data);
    return doc._id.toString();
  },

  async findAll(page = 1, limit = 20): Promise<{ items: AllowedEmailDocument[] }> {
    await mongo.connect();
    const skip = (page - 1) * limit;
    const items = await AllowedEmailModel.find({}, null, { skip, limit })
      .sort({ createdAt: -1 })
      .lean<AllowedEmailDocument[]>()
      .exec();
    return { items };
  },
};

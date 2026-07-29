import { ShopDocument, ShopModel } from '@/features/shops/schema/shop.schema';
import { mongo } from '@/shared/lib/mongo';

export const shopRepository = {
  async findByOwnerId(ownerId: string): Promise<ShopDocument | null> {
    await mongo.connect();
    return ShopModel.findOne({ ownerId }).lean<ShopDocument>().exec();
  },

  async findById(id: string): Promise<ShopDocument | null> {
    await mongo.connect();
    return ShopModel.findById(id).lean<ShopDocument>().exec();
  },

  async create(data: Omit<ShopDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await mongo.connect();
    const doc = await ShopModel.create(data);
    return doc._id.toString();
  },

  async updateById(id: string, data: Partial<ShopDocument>): Promise<boolean> {
    await mongo.connect();
    const result = await ShopModel.findByIdAndUpdate(id, { $set: data });
    return result !== null;
  },

  async findAll(filter: Partial<Pick<ShopDocument, 'status'>>, page: number, limit: number): Promise<{ items: ShopDocument[] }> {
    await mongo.connect();
    const skip = (page - 1) * limit;
    const items = await ShopModel.find(filter, null, { skip, limit })
      .sort({ createdAt: -1 })
      .lean<ShopDocument[]>()
      .exec();
    return { items };
  },

  async countAll(filter: Partial<Pick<ShopDocument, 'status'>>): Promise<number> {
    await mongo.connect();
    return ShopModel.countDocuments(filter).exec();
  },
};

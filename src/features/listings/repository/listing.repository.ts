import { ListingDocument, ListingModel } from '@/features/listings/schema/listing.schema';
import { mongo } from '@/shared/lib/mongo';

type ListingSearchFilter = Partial<Pick<ListingDocument, 'status' | 'category'>> & {
  $or?: Array<{ title: RegExp } | { description: RegExp }>;
};

export const listingRepository = {
  async create(data: Omit<ListingDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await mongo.connect();
    const doc = await ListingModel.create(data);
    return doc._id.toString();
  },

  async findById(id: string): Promise<ListingDocument | null> {
    await mongo.connect();
    return ListingModel.findById(id).lean<ListingDocument>().exec();
  },

  async updateById(id: string, data: Partial<ListingDocument>): Promise<boolean> {
    await mongo.connect();
    const result = await ListingModel.findByIdAndUpdate(id, { $set: data });
    return result !== null;
  },

  async deleteById(id: string): Promise<boolean> {
    await mongo.connect();
    const result = await ListingModel.findByIdAndDelete(id);
    return result !== null;
  },

  async countByShopSince(shopId: string, since: Date): Promise<number> {
    await mongo.connect();
    return ListingModel.countDocuments({ shopId, createdAt: { $gte: since } }).exec();
  },

  async findByShopId(shopId: string, page: number, limit: number): Promise<{ items: ListingDocument[] }> {
    await mongo.connect();
    const skip = (page - 1) * limit;
    const items = await ListingModel.find({ shopId }, null, { skip, limit })
      .sort({ createdAt: -1 })
      .lean<ListingDocument[]>()
      .exec();
    return { items };
  },

  async findNearby(
    filter: ListingSearchFilter,
    coordinates: [number, number],
    radiusMeters: number,
    page: number,
    limit: number
  ): Promise<{ items: ListingDocument[] }> {
    await mongo.connect();
    const skip = (page - 1) * limit;
    const items = await ListingModel.find(
      { ...filter, location: { $near: { $geometry: { type: 'Point', coordinates }, $maxDistance: radiusMeters } } },
      null,
      { skip, limit }
    )
      .lean<ListingDocument[]>()
      .exec();
    return { items };
  },

  async findRecent(filter: ListingSearchFilter, page: number, limit: number): Promise<{ items: ListingDocument[] }> {
    await mongo.connect();
    const skip = (page - 1) * limit;
    const items = await ListingModel.find(filter, null, { skip, limit })
      .sort({ createdAt: -1 })
      .lean<ListingDocument[]>()
      .exec();
    return { items };
  },

  async updateManyByShopId(shopId: string, data: Partial<Pick<ListingDocument, 'shopName' | 'location'>>): Promise<number> {
    await mongo.connect();
    const result = await ListingModel.updateMany({ shopId }, { $set: data }).exec();
    return result.modifiedCount;
  },

  async deactivateActiveByShopId(shopId: string): Promise<number> {
    await mongo.connect();
    const result = await ListingModel.updateMany({ shopId, status: 'active' }, { $set: { status: 'deactivated' } }).exec();
    return result.modifiedCount;
  },
};

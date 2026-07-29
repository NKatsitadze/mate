import mongoose from 'mongoose';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 1000;

class MongoClientManager {
  async connect(retries = MAX_RETRIES): Promise<void> {
    if (mongoose.connection.readyState === 1) return;
    try {
      await mongoose.connect(process.env.MONGO_URI!);
      console.log('Connected to MongoDB');
    } catch (error) {
      if (retries <= 0) throw error;
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`MongoDB connection failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}): ${message}`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return this.connect(retries - 1);
    }
  }

  async disconnect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

export const mongo = new MongoClientManager();
export { MongoClientManager };

import mongoose from 'mongoose';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('mongoose', async (importOriginal) => {
  const actual = await importOriginal<typeof mongoose>();
  return {
    default: {
      ...actual,
      connect: vi.fn(),
      disconnect: vi.fn(),
      connection: { readyState: 0 },
    },
  };
});

import { MongoClientManager } from './mongo';

function setReadyState(state: number): void {
  Object.defineProperty(mongoose.connection, 'readyState', { value: state, configurable: true });
}

describe('MongoClientManager', () => {
  let manager: MongoClientManager;

  beforeEach(() => {
    vi.clearAllMocks();
    setReadyState(0);
    manager = new MongoClientManager();
  });

  it('connects to MongoDB on first call', async () => {
    vi.mocked(mongoose.connect).mockResolvedValueOnce(mongoose);
    await manager.connect();
    expect(mongoose.connect).toHaveBeenCalledOnce();
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
  });

  it('does not reconnect when already connected', async () => {
    vi.mocked(mongoose.connect).mockImplementationOnce(async () => {
      setReadyState(1);
      return mongoose;
    });
    await manager.connect();
    await manager.connect();
    expect(mongoose.connect).toHaveBeenCalledOnce();
  });

  it('retries on failure then succeeds', async () => {
    vi.mocked(mongoose.connect)
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(mongoose);
    await manager.connect();
    expect(mongoose.connect).toHaveBeenCalledTimes(2);
  });

  it('throws after max retries exhausted', async () => {
    vi.mocked(mongoose.connect).mockRejectedValue(new Error('always fail'));
    await expect(manager.connect(0)).rejects.toThrow('always fail');
  });

  it('disconnect calls mongoose.disconnect and resets state', async () => {
    vi.mocked(mongoose.connect).mockImplementationOnce(async () => {
      setReadyState(1);
      return mongoose;
    });
    vi.mocked(mongoose.disconnect).mockImplementationOnce(async () => {
      setReadyState(0);
    });
    await manager.connect();
    await manager.disconnect();
    expect(mongoose.disconnect).toHaveBeenCalledOnce();

    vi.mocked(mongoose.connect).mockResolvedValueOnce(mongoose);
    await manager.connect();
    expect(mongoose.connect).toHaveBeenCalledTimes(2);
  });

  it('disconnect is a no-op when not connected', async () => {
    vi.mocked(mongoose.disconnect).mockResolvedValueOnce();
    await manager.disconnect();
    expect(mongoose.disconnect).not.toHaveBeenCalled();
  });
});

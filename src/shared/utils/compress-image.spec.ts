import imageCompression from 'browser-image-compression';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('browser-image-compression', () => ({ default: vi.fn() }));

import { compressImage } from './compress-image';

function makeFile(name: string, type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

describe('compressImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('compresses a jpeg with the expected options', async () => {
    const input = makeFile('photo.jpg', 'image/jpeg', 5000);
    const compressed = makeFile('photo.jpg', 'image/jpeg', 1000);
    vi.mocked(imageCompression).mockResolvedValueOnce(compressed);

    const result = await compressImage(input);

    expect(imageCompression).toHaveBeenCalledWith(input, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: 'image/jpeg',
    });
    expect(result).toBe(compressed);
  });

  it('preserves png as the target type', async () => {
    const input = makeFile('logo.png', 'image/png', 5000);
    const compressed = makeFile('logo.png', 'image/png', 1000);
    vi.mocked(imageCompression).mockResolvedValueOnce(compressed);

    await compressImage(input);

    expect(imageCompression).toHaveBeenCalledWith(input, expect.objectContaining({ fileType: 'image/png' }));
  });

  it('preserves webp as the target type', async () => {
    const input = makeFile('photo.webp', 'image/webp', 5000);
    const compressed = makeFile('photo.webp', 'image/webp', 1000);
    vi.mocked(imageCompression).mockResolvedValueOnce(compressed);

    await compressImage(input);

    expect(imageCompression).toHaveBeenCalledWith(input, expect.objectContaining({ fileType: 'image/webp' }));
  });

  it('coerces an unrecognized type (e.g. HEIC) to jpeg', async () => {
    const input = makeFile('photo.heic', 'image/heic', 5000);
    const compressed = makeFile('photo.jpg', 'image/jpeg', 1000);
    vi.mocked(imageCompression).mockResolvedValueOnce(compressed);

    await compressImage(input);

    expect(imageCompression).toHaveBeenCalledWith(input, expect.objectContaining({ fileType: 'image/jpeg' }));
  });

  it('returns the original file when the same-format result is not smaller (size-regression guard)', async () => {
    const input = makeFile('logo.png', 'image/png', 1000);
    const compressed = makeFile('logo.png', 'image/png', 1500);
    vi.mocked(imageCompression).mockResolvedValueOnce(compressed);

    const result = await compressImage(input);

    expect(result).toBe(input);
  });

  it('returns the converted result even if larger, when a format conversion was required', async () => {
    const input = makeFile('photo.heic', 'image/heic', 1000);
    const compressed = makeFile('photo.jpg', 'image/jpeg', 1500);
    vi.mocked(imageCompression).mockResolvedValueOnce(compressed);

    const result = await compressImage(input);

    expect(result).toBe(compressed);
  });

  it('falls back to the original file when compression fails and the type is already allowed', async () => {
    const input = makeFile('photo.jpg', 'image/jpeg', 5000);
    vi.mocked(imageCompression).mockRejectedValueOnce(new Error('canvas failure'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = await compressImage(input);

    expect(result).toBe(input);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('throws a friendly error when compression fails and the type is not allowed', async () => {
    const input = makeFile('photo.heic', 'image/heic', 5000);
    vi.mocked(imageCompression).mockRejectedValueOnce(new Error('decode failure'));

    await expect(compressImage(input)).rejects.toThrow(
      'This photo format is not supported. Please choose a JPEG, PNG, or WEBP image.'
    );
  });

  it('falls back to the original file when compression never settles (timeout)', async () => {
    vi.useFakeTimers();
    const input = makeFile('photo.jpg', 'image/jpeg', 5000);
    vi.mocked(imageCompression).mockReturnValueOnce(new Promise(() => {}));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const resultPromise = compressImage(input);
    await vi.advanceTimersByTimeAsync(15000);
    const result = await resultPromise;

    expect(result).toBe(input);
    expect(warnSpy).toHaveBeenCalled();
  });
});

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/utils/compress-image', () => ({ compressImage: vi.fn() }));
vi.mock('@/shared/lib/http', () => ({ http: { post: vi.fn() } }));

import { http } from '@/shared/lib/http';
import { compressImage } from '@/shared/utils/compress-image';

import { useImageUpload } from './use-image-upload';

function makeFile(name: string): File {
  return new File(['x'], name, { type: 'image/jpeg' });
}

describe('useImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  it('uploads a single file and returns its object URL', async () => {
    const file = makeFile('a.jpg');
    vi.mocked(compressImage).mockResolvedValueOnce(file);
    vi.mocked(http.post).mockResolvedValueOnce({ uploadUrl: 'https://s3/upload', objectUrl: 'https://s3/a.jpg' });

    const { result } = renderHook(() => useImageUpload({ presignPath: '/listings/presign-upload' }));

    let urls: string[] = [];
    await act(async () => {
      urls = await result.current.uploadFiles([file]);
    });

    expect(urls).toEqual(['https://s3/a.jpg']);
    expect(result.current.uploading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('uploads multiple files concurrently and preserves selection order', async () => {
    const fileA = makeFile('a.jpg');
    const fileB = makeFile('b.jpg');
    vi.mocked(compressImage).mockImplementation((file) => Promise.resolve(file));
    vi.mocked(http.post)
      .mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({ uploadUrl: 'u1', objectUrl: 'url-a' }), 20))
      )
      .mockImplementationOnce(() => Promise.resolve({ uploadUrl: 'u2', objectUrl: 'url-b' }));

    const { result } = renderHook(() => useImageUpload({ presignPath: '/listings/presign-upload' }));

    let urls: string[] = [];
    await act(async () => {
      urls = await result.current.uploadFiles([fileA, fileB]);
    });

    expect(urls).toEqual(['url-a', 'url-b']);
  });

  it('returns partial results and sets an error when one of several uploads fails', async () => {
    const fileA = makeFile('a.jpg');
    const fileB = makeFile('b.jpg');
    vi.mocked(compressImage).mockImplementation((file) => Promise.resolve(file));
    vi.mocked(http.post)
      .mockResolvedValueOnce({ uploadUrl: 'u1', objectUrl: 'url-a' })
      .mockRejectedValueOnce(new Error('network down'));

    const { result } = renderHook(() => useImageUpload({ presignPath: '/listings/presign-upload' }));

    let urls: string[] = [];
    await act(async () => {
      urls = await result.current.uploadFiles([fileA, fileB]);
    });

    expect(urls).toEqual(['url-a']);
    expect(result.current.error).toContain('1 of 2 photos uploaded');
  });

  it('returns an empty array and sets an error when every upload fails', async () => {
    const file = makeFile('a.jpg');
    vi.mocked(compressImage).mockRejectedValueOnce(new Error('unsupported'));

    const { result } = renderHook(() => useImageUpload({ presignPath: '/listings/presign-upload' }));

    let urls: string[] = [];
    await act(async () => {
      urls = await result.current.uploadFiles([file]);
    });

    expect(urls).toEqual([]);
    expect(result.current.error).toContain('Could not upload photos');
  });

  it('sets uploading to true while the batch is in flight', async () => {
    const file = makeFile('a.jpg');
    vi.mocked(compressImage).mockResolvedValueOnce(file);
    vi.mocked(http.post).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ uploadUrl: 'u', objectUrl: 'url-a' }), 20))
    );

    const { result } = renderHook(() => useImageUpload({ presignPath: '/listings/presign-upload' }));

    let uploadPromise: Promise<string[]> = Promise.resolve([]);
    act(() => {
      uploadPromise = result.current.uploadFiles([file]);
    });

    expect(result.current.uploading).toBe(true);

    await act(async () => {
      await uploadPromise;
    });

    expect(result.current.uploading).toBe(false);
  });

  it('threads the configured presignPath through to http.post', async () => {
    const file = makeFile('a.jpg');
    vi.mocked(compressImage).mockResolvedValue(file);
    vi.mocked(http.post).mockResolvedValue({ uploadUrl: 'u', objectUrl: 'url' });

    const { result: listingsResult } = renderHook(() => useImageUpload({ presignPath: '/listings/presign-upload' }));
    await act(async () => {
      await listingsResult.current.uploadFiles([file]);
    });
    expect(http.post).toHaveBeenLastCalledWith('/listings/presign-upload', expect.anything());

    const { result: shopsResult } = renderHook(() => useImageUpload({ presignPath: '/shops/presign-upload' }));
    await act(async () => {
      await shopsResult.current.uploadFiles([file]);
    });
    expect(http.post).toHaveBeenLastCalledWith('/shops/presign-upload', expect.anything());
  });
});

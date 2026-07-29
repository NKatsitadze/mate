import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn().mockImplementation(function S3ClientMock() {
    return {};
  }),
  PutObjectCommand: vi.fn().mockImplementation(function PutObjectCommandMock(input: unknown) {
    return { input };
  }),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(),
}));

import { S3Manager } from './s3';

describe('S3Manager', () => {
  let manager: S3Manager;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AWS_REGION = 'eu-central-1';
    process.env.AWS_S3_BUCKET = 'mate-test-bucket';
    manager = new S3Manager();
  });

  it('constructs the S3 client lazily, only once across calls', async () => {
    vi.mocked(getSignedUrl).mockResolvedValue('https://signed-url.example.com');
    await manager.getPresignedUploadUrl('listings/abc.jpg', 'image/jpeg');
    await manager.getPresignedUploadUrl('listings/def.jpg', 'image/jpeg');
    expect(S3Client).toHaveBeenCalledOnce();
  });

  it('builds a PutObjectCommand with the exact bucket/key/content-type', async () => {
    vi.mocked(getSignedUrl).mockResolvedValue('https://signed-url.example.com');
    await manager.getPresignedUploadUrl('listings/abc.jpg', 'image/jpeg');
    expect(PutObjectCommand).toHaveBeenCalledWith({
      Bucket: 'mate-test-bucket',
      Key: 'listings/abc.jpg',
      ContentType: 'image/jpeg',
    });
  });

  it('signs the URL with a 300 second expiry', async () => {
    vi.mocked(getSignedUrl).mockResolvedValue('https://signed-url.example.com');
    await manager.getPresignedUploadUrl('listings/abc.jpg', 'image/jpeg');
    expect(getSignedUrl).toHaveBeenCalledWith(expect.anything(), expect.anything(), { expiresIn: 300 });
  });

  it('returns the presigned upload URL and the deterministic object URL', async () => {
    vi.mocked(getSignedUrl).mockResolvedValue('https://signed-url.example.com');
    const result = await manager.getPresignedUploadUrl('listings/abc.jpg', 'image/jpeg');
    expect(result).toEqual({
      uploadUrl: 'https://signed-url.example.com',
      objectUrl: 'https://mate-test-bucket.s3.eu-central-1.amazonaws.com/listings/abc.jpg',
    });
  });
});

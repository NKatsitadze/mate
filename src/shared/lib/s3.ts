import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const PRESIGN_EXPIRY_SECONDS = 300;

type PresignedUpload = {
  uploadUrl: string;
  objectUrl: string;
};

class S3Manager {
  private client: S3Client | null = null;

  private getClient(): S3Client {
    if (!this.client) {
      this.client = new S3Client({ region: process.env.AWS_REGION });
    }
    return this.client;
  }

  async getPresignedUploadUrl(key: string, contentType: string): Promise<PresignedUpload> {
    const bucket = process.env.AWS_S3_BUCKET!;
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
    const uploadUrl = await getSignedUrl(this.getClient(), command, { expiresIn: PRESIGN_EXPIRY_SECONDS });
    const objectUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, objectUrl };
  }
}

export const s3 = new S3Manager();
export { S3Manager };

import imageCompression from 'browser-image-compression';

import { ALLOWED_IMAGE_MIME_TYPES, AllowedImageMimeType } from '@/shared/const/images.const';

const MAX_SIZE_MB = 1;
const MAX_WIDTH_OR_HEIGHT = 1600;
const COMPRESSION_TIMEOUT_MS = 15000;
const UNSUPPORTED_FORMAT_MESSAGE = 'This photo format is not supported. Please choose a JPEG, PNG, or WEBP image.';

function isAllowedImageMimeType(type: string): type is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(type);
}

function resolveTargetType(type: string): AllowedImageMimeType {
  return type === 'image/png' || type === 'image/webp' ? type : 'image/jpeg';
}

function withTimeout(promise: Promise<File>, ms: number): Promise<File> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Compression timed out')), ms);
    }),
  ]);
}

export async function compressImage(file: File): Promise<File> {
  const targetType = resolveTargetType(file.type);

  try {
    const compressed = await withTimeout(
      imageCompression(file, {
        maxSizeMB: MAX_SIZE_MB,
        maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
        useWebWorker: true,
        fileType: targetType,
      }),
      COMPRESSION_TIMEOUT_MS
    );

    const noConversionNeeded = targetType === file.type;
    if (noConversionNeeded && compressed.size >= file.size) return file;

    return compressed;
  } catch (error) {
    if (isAllowedImageMimeType(file.type)) {
      console.warn('Image compression failed, uploading original file:', error);
      return file;
    }
    throw new Error(UNSUPPORTED_FORMAT_MESSAGE);
  }
}

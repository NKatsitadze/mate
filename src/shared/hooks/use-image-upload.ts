'use client';
import { useEffect, useRef, useState } from 'react';

import { http } from '@/shared/lib/http';
import { compressImage } from '@/shared/utils/compress-image';

type PresignedUpload = {
  uploadUrl: string;
  objectUrl: string;
};

type UseImageUploadOptions = {
  presignPath: string;
};

async function uploadOne(presignPath: string, file: File): Promise<string> {
  const compressed = await compressImage(file);
  const { uploadUrl, objectUrl } = await http.post<PresignedUpload>(presignPath, {
    fileName: compressed.name,
    contentType: compressed.type,
  });
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: compressed,
    headers: { 'Content-Type': compressed.type },
  });
  if (!response.ok) throw new Error('Upload failed');

  return objectUrl;
}

export const useImageUpload = ({ presignPath }: UseImageUploadOptions) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];

    setUploading(true);
    setError(null);

    const results = await Promise.allSettled(files.map((file) => uploadOne(presignPath, file)));

    const urls = results
      .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
      .map((result) => result.value);
    const failures = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');

    if (isMounted.current) {
      if (failures.length > 0) {
        const firstMessage = failures[0].reason instanceof Error ? failures[0].reason.message : 'Upload failed';
        setError(
          failures.length === files.length
            ? `Could not upload photos: ${firstMessage}`
            : `${urls.length} of ${files.length} photos uploaded — ${failures.length} failed: ${firstMessage}`
        );
      }
      setUploading(false);
    }

    return urls;
  };

  return { uploadFiles, uploading, error };
};

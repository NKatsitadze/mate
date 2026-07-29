'use client';
import { X } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/shared/components/ui/button';
import { ALLOWED_IMAGE_MIME_TYPES } from '@/shared/const/images.const';
import { useImageUpload } from '@/shared/hooks/use-image-upload';

type ShopImageUploaderProps = {
  value: string | undefined;
  onChange: (url: string | undefined) => void;
};

export const ShopImageUploader = ({ value, onChange }: ShopImageUploaderProps) => {
  const { uploadFiles, uploading, error } = useImageUpload({ presignPath: '/shops/presign-upload' });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const urls = await uploadFiles([files[0]]);
    if (urls.length > 0) onChange(urls[0]);
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative size-20 overflow-hidden rounded-md border border-border">
          <Image src={value} alt="Shop photo" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="absolute right-1 top-1 rounded-full bg-foreground/70 p-0.5 text-background"
            aria-label="Remove photo"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <div>
          <input
            id="shop-photo"
            type="file"
            accept={ALLOWED_IMAGE_MIME_TYPES.join(',')}
            className="hidden"
            onChange={(e) => {
              void handleFiles(e.target.files);
            }}
          />
          <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
            <label htmlFor="shop-photo" className="cursor-pointer">
              {uploading ? 'Uploading…' : 'Add photo'}
            </label>
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

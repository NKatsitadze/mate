'use client';
import { X } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/shared/components/ui/button';
import { ALLOWED_IMAGE_MIME_TYPES } from '@/shared/const/images.const';
import { useImageUpload } from '@/shared/hooks/use-image-upload';

type ListingImageUploaderProps = {
  value: string[];
  onChange: (urls: string[]) => void;
};

const MAX_IMAGES = 5;

export const ListingImageUploader = ({ value, onChange }: ListingImageUploaderProps) => {
  const { uploadFiles, uploading, error } = useImageUpload({ presignPath: '/listings/presign-upload' });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remainingSlots = MAX_IMAGES - value.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    const urls = await uploadFiles(filesToUpload);
    if (urls.length > 0) onChange([...value, ...urls]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {value.map((url) => (
          <div key={url} className="relative size-20 overflow-hidden rounded-md border border-border">
            <Image src={url} alt="Listing photo" fill className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((existing) => existing !== url))}
              className="absolute right-1 top-1 rounded-full bg-foreground/70 p-0.5 text-background"
              aria-label="Remove photo"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
      </div>
      {value.length < MAX_IMAGES && (
        <div>
          <input
            id="listing-images"
            type="file"
            accept={ALLOWED_IMAGE_MIME_TYPES.join(',')}
            multiple
            className="hidden"
            onChange={(e) => {
              void handleFiles(e.target.files);
            }}
          />
          <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
            <label htmlFor="listing-images" className="cursor-pointer">
              {uploading ? 'Uploading…' : 'Add photos'}
            </label>
          </Button>
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

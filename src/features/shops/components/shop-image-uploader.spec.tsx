import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/hooks/use-image-upload', () => ({ useImageUpload: vi.fn() }));

import { useImageUpload } from '@/shared/hooks/use-image-upload';

import { ShopImageUploader } from './shop-image-uploader';

function makeFile(name: string): File {
  return new File(['x'], name, { type: 'image/jpeg' });
}

function selectFile(file: File) {
  const input = document.getElementById('shop-photo') as HTMLInputElement;
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  fireEvent.change(input);
}

describe('ShopImageUploader', () => {
  const uploadFiles = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useImageUpload).mockReturnValue({ uploadFiles, uploading: false, error: null });
  });

  it('shows the add-photo control when there is no value', () => {
    render(<ShopImageUploader value={undefined} onChange={vi.fn()} />);

    expect(screen.getByText('Add photo')).toBeInTheDocument();
  });

  it('calls onChange with the uploaded URL when a photo is selected', async () => {
    uploadFiles.mockResolvedValue(['https://example.com/shop.jpg']);
    const onChange = vi.fn();

    render(<ShopImageUploader value={undefined} onChange={onChange} />);
    selectFile(makeFile('shop.jpg'));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('https://example.com/shop.jpg'));
  });

  it('does not call onChange when the upload fails', async () => {
    uploadFiles.mockResolvedValue([]);
    const onChange = vi.fn();

    render(<ShopImageUploader value={undefined} onChange={onChange} />);
    selectFile(makeFile('shop.jpg'));

    await waitFor(() => expect(uploadFiles).toHaveBeenCalled());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange with undefined when the remove button is clicked', () => {
    const onChange = vi.fn();
    render(<ShopImageUploader value="https://example.com/shop.jpg" onChange={onChange} />);

    fireEvent.click(screen.getByLabelText('Remove photo'));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('shows the error message from the hook', () => {
    vi.mocked(useImageUpload).mockReturnValue({ uploadFiles, uploading: false, error: 'Something failed' });
    render(<ShopImageUploader value={undefined} onChange={vi.fn()} />);

    expect(screen.getByText('Something failed')).toBeInTheDocument();
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/hooks/use-image-upload', () => ({ useImageUpload: vi.fn() }));

import { useImageUpload } from '@/shared/hooks/use-image-upload';

import { ListingImageUploader } from './listing-image-uploader';

function makeFile(name: string): File {
  return new File(['x'], name, { type: 'image/jpeg' });
}

function selectFiles(files: File[]) {
  const input = document.getElementById('listing-images') as HTMLInputElement;
  Object.defineProperty(input, 'files', { value: files, configurable: true });
  fireEvent.change(input);
}

describe('ListingImageUploader', () => {
  const uploadFiles = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useImageUpload).mockReturnValue({ uploadFiles, uploading: false, error: null });
  });

  it('only sends as many files as there are remaining slots', async () => {
    uploadFiles.mockResolvedValue(['url-4', 'url-5']);
    const onChange = vi.fn();

    render(
      <ListingImageUploader
        value={['https://example.com/e1.jpg', 'https://example.com/e2.jpg', 'https://example.com/e3.jpg']}
        onChange={onChange}
      />
    );
    selectFiles([makeFile('a.jpg'), makeFile('b.jpg'), makeFile('c.jpg')]);

    await waitFor(() => expect(uploadFiles).toHaveBeenCalled());
    expect(uploadFiles.mock.calls[0][0]).toHaveLength(2);
  });

  it('appends successful upload URLs to the existing value', async () => {
    uploadFiles.mockResolvedValue(['url-1']);
    const onChange = vi.fn();

    render(<ListingImageUploader value={['https://example.com/existing.jpg']} onChange={onChange} />);
    selectFiles([makeFile('a.jpg')]);

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['https://example.com/existing.jpg', 'url-1']));
  });

  it('does not call onChange when every upload in the batch fails', async () => {
    uploadFiles.mockResolvedValue([]);
    const onChange = vi.fn();

    render(<ListingImageUploader value={['https://example.com/existing.jpg']} onChange={onChange} />);
    selectFiles([makeFile('a.jpg')]);

    await waitFor(() => expect(uploadFiles).toHaveBeenCalled());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('still appends whatever succeeded on a partial-failure batch', async () => {
    uploadFiles.mockResolvedValue(['url-1']);
    const onChange = vi.fn();

    render(<ListingImageUploader value={[]} onChange={onChange} />);
    selectFiles([makeFile('a.jpg'), makeFile('b.jpg')]);

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(['url-1']));
  });

  it('removes a photo when its remove button is clicked', () => {
    const onChange = vi.fn();
    render(
      <ListingImageUploader
        value={['https://example.com/url-a.jpg', 'https://example.com/url-b.jpg']}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getAllByLabelText('Remove photo')[0]);

    expect(onChange).toHaveBeenCalledWith(['https://example.com/url-b.jpg']);
  });

  it('shows the error message from the hook', () => {
    vi.mocked(useImageUpload).mockReturnValue({ uploadFiles, uploading: false, error: 'Something failed' });
    render(<ListingImageUploader value={[]} onChange={vi.fn()} />);

    expect(screen.getByText('Something failed')).toBeInTheDocument();
  });
});

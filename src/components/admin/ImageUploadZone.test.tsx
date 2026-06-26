import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { toast } from 'sonner';
import { vi, afterEach } from 'vitest';

import { uploadImage } from '@/utils/imageUpload';

import { ImageUploadZone } from './ImageUploadZone';

vi.mock('@/utils/imageUpload', () => ({
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
  extractPathFromUrl: vi.fn(),
  validateImage: vi.fn(() => null),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));
const mockedUploadImage = uploadImage as unknown as ReturnType<typeof vi.fn>;
const mockedToast = toast as unknown as { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

afterEach(() => {
  vi.clearAllMocks();
});

const renderUploader = (props?: Partial<React.ComponentProps<typeof ImageUploadZone>>) => {
  return render(
    <ImageUploadZone
      images={props?.images ?? []}
      onImagesChange={props?.onImagesChange ?? vi.fn()}
      propertyId={props?.propertyId}
      maxImages={props?.maxImages ?? 10}
    />
  );
};

describe('ImageUploadZone', () => {
  it('uploads immediately when the property already exists', async () => {
    mockedUploadImage.mockResolvedValueOnce({ url: 'https://cdn.test/img.webp', path: 'test/path' });
    const handleChange = vi.fn();
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });

    const { container } = renderUploader({ onImagesChange: handleChange, propertyId: 'prop-1' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(mockedUploadImage).toHaveBeenCalledTimes(1));
    expect(mockedUploadImage).toHaveBeenCalledWith(file, 'prop-1');
    expect(handleChange).toHaveBeenCalledWith([{ url: 'https://cdn.test/img.webp', path: 'test/path' }]);
  });

  it('shows a long-lived error toast on failure', async () => {
    mockedUploadImage.mockRejectedValueOnce(new Error('No tienes permisos'));
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });

    const { container } = renderUploader({ propertyId: 'prop-1' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(mockedToast.error).toHaveBeenCalled());
    // Toast format: generic title with error details in description
    expect(mockedToast.error).toHaveBeenCalledWith(
      expect.stringContaining('Error al subir'),
      expect.objectContaining({
        duration: 10000,
        description: expect.stringContaining('No tienes permisos')
      })
    );
  });

  it('defers upload for a new property (no propertyId) and keeps the file for later', async () => {
    const handleChange = vi.fn();
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    const originalCreate = URL.createObjectURL;
    URL.createObjectURL = vi.fn(() => 'blob:preview') as unknown as typeof URL.createObjectURL;

    try {
      const { container } = renderUploader({ onImagesChange: handleChange });
      const input = container.querySelector('input[type="file"]') as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      await waitFor(() => expect(handleChange).toHaveBeenCalled());
      // Deferred: no upload happens yet; the raw File is preserved for the form to upload.
      expect(mockedUploadImage).not.toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledWith([
        expect.objectContaining({ url: 'blob:preview', file }),
      ]);
    } finally {
      URL.createObjectURL = originalCreate;
    }
  });
});

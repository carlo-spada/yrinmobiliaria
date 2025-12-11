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
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

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
  it('uploads and adds images on success', async () => {
    mockedUploadImage.mockResolvedValueOnce({ url: 'https://cdn.test/img.webp', path: 'test/path' });
    const handleChange = vi.fn();
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });

    const { container } = renderUploader({ onImagesChange: handleChange });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(mockedUploadImage).toHaveBeenCalledTimes(1));
    expect(mockedUploadImage).toHaveBeenCalledWith(file, undefined);
    expect(handleChange).toHaveBeenCalledWith([{ url: 'https://cdn.test/img.webp', path: 'test/path' }]);
  });

  it('shows a long-lived error toast on failure', async () => {
    mockedUploadImage.mockRejectedValueOnce(new Error('No tienes permisos'));
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });

    const { container } = renderUploader();
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
});

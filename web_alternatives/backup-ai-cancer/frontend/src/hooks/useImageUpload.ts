import { useState, useCallback } from 'react';

interface UseImageUploadReturn {
  uploadedFile: File | null;
  preview: string | null;
  error: string | null;
  handleFileSelect: (file: File) => void;
  removeFile: () => void;
}

export function useImageUpload(): UseImageUploadReturn {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setError(null);

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar');
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      setError('Ukuran file terlalu besar (maksimal 16MB)');
      return;
    }

    setUploadedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.onerror = () => {
      setError('Gagal membaca file');
    };
    reader.readAsDataURL(file);
  }, []);

  const removeFile = useCallback(() => {
    setUploadedFile(null);
    setPreview(null);
    setError(null);
  }, []);

  return {
    uploadedFile,
    preview,
    error,
    handleFileSelect,
    removeFile
  };
}

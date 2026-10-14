import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import clsx from 'clsx';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  uploadedImage: File | null;
  disabled?: boolean;
}

export default function ImageUploader({ onImageUpload, uploadedImage, disabled }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onImageUpload(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    maxSize: 16 * 1024 * 1024, // 16MB
    multiple: false,
    disabled
  });

  const removeImage = () => {
    setPreview(null);
    onImageUpload(null as any);
  };

  return (
    <div className="space-y-4">
      {!uploadedImage ? (
        <div
          {...getRootProps()}
          className={clsx(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? "Lepaskan gambar di sini" : "Upload gambar medis"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Drag & drop atau klik untuk memilih file
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Format: JPG, PNG, GIF (maksimal 16MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Gambar yang dipilih:</h3>
              <button
                onClick={removeImage}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                disabled={disabled}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            {preview && (
              <div className="relative w-full h-64 bg-white border rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            )}
            
            <div className="mt-3 text-sm text-gray-600">
              <p><span className="font-medium">Nama file:</span> {uploadedImage.name}</p>
              <p><span className="font-medium">Ukuran:</span> {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB</p>
              <p><span className="font-medium">Tipe:</span> {uploadedImage.type}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

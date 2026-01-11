"use client";

import { useState } from "react";
import { FiX, FiUpload } from "react-icons/fi";
import Image from "next/image";
import { getImageUrl as getFullImageUrl } from "@/lib/imageUrl";

type MultiImageUploaderProps = {
  images: (File | string)[];
  onChange: (images: (File | string)[]) => void;
  maxImages?: number;
  label?: string;
};

export default function MultiImageUploader({
  images,
  onChange,
  maxImages = 4,
  label = "Изображения",
}: MultiImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > maxImages) {
      alert(`Максимум ${maxImages} изображений`);
      return;
    }

    const newImages = [...images, ...files];
    onChange(newImages);

    // Create previews for new files
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);

    // Remove preview if it's a new file
    if (typeof images[index] !== "string") {
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const getImageUrl = (image: File | string, index: number): string => {
    if (typeof image === "string") {
      return getFullImageUrl(image);
    }
    return (
      previews[
        index - images.filter((img) => typeof img === "string").length
      ] || ""
    );
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} ({images.length}/{maxImages})
      </label>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-300">
                <Image
                  src={getImageUrl(image, index)}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiX size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-primary">
          <div className="flex flex-col items-center space-y-2">
            <FiUpload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              Нажмите для загрузки ({images.length}/{maxImages})
            </span>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { FiX, FiUpload } from "react-icons/fi";
import Image from "next/image";
import { getImageUrl } from "@/lib/imageUrl";

type SingleImageUploaderProps = {
  image: File | string | null;
  onChange: (image: File | null) => void;
  label?: string;
};

export default function SingleImageUploader({
  image,
  onChange,
  label = "Изображение",
}: SingleImageUploaderProps) {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (image && typeof image !== "string") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(image);
    } else if (typeof image === "string") {
      setPreview(getImageUrl(image));
    } else {
      setPreview("");
    }
  }, [image]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const removeImage = () => {
    onChange(null);
    setPreview("");
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {preview ? (
        <div className="relative group w-full h-48 rounded-lg overflow-hidden border-2 border-gray-300">
          <Image src={preview} alt="Preview" fill className="object-cover" />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <FiX size={20} />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center w-full h-48 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-primary">
          <div className="flex flex-col items-center space-y-2">
            <FiUpload className="w-12 h-12 text-gray-400" />
            <span className="text-sm text-gray-600">
              Нажмите для загрузки изображения
            </span>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}

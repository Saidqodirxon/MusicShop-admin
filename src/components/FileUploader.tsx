"use client";

import { useState, useEffect } from "react";
import { FiX, FiUpload, FiFile } from "react-icons/fi";
import { getImageUrl } from "@/lib/imageUrl";

type FileUploaderProps = {
  file: File | string | null;
  onChange: (file: File | null) => void;
  label?: string;
  accept?: string;
};

export default function FileUploader({
  file,
  onChange,
  label = "Файл",
  accept = ".pdf,.doc,.docx",
}: FileUploaderProps) {
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    if (file && typeof file !== "string") {
      setFileName(file.name);
    } else if (typeof file === "string") {
      setFileName(file.split("/").pop() || "");
    } else {
      setFileName("");
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onChange(selectedFile);
    }
  };

  const removeFile = () => {
    onChange(null);
    setFileName("");
  };

  const getFileUrl = () => {
    if (typeof file === "string") {
      return getImageUrl(file);
    }
    return null;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {fileName ? (
        <div className="flex items-center justify-between p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
          <div className="flex items-center space-x-3">
            <FiFile className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-700">{fileName}</p>
              {typeof file === "string" && (
                <a
                  href={getFileUrl() || ""}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Открыть файл
                </a>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-primary">
          <div className="flex flex-col items-center space-y-2">
            <FiUpload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              Нажмите для загрузки файла
            </span>
            <span className="text-xs text-gray-400">{accept}</span>
          </div>
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}

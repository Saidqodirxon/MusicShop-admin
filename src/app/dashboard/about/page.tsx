"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FiEdit } from "react-icons/fi";
import SingleImageUploader from "@/components/SingleImageUploader";
import { getImageUrl } from "@/lib/imageUrl";

type About = {
  _id: string;
  banner: string;
  mainText: { uz: string; ru: string; en: string };
  image: string;
  additionalText: { uz: string; ru: string; en: string };
};

type AboutForm = {
  mainText_uz: string;
  mainText_ru: string;
  mainText_en: string;
  additionalText_uz: string;
  additionalText_ru: string;
  additionalText_en: string;
  banner: FileList;
  image: FileList;
};

export default function AboutPage() {
  const [about, setAbout] = useState<About | null>(null);
  const [banner, setBanner] = useState<File | string | null>(null);
  const [image, setImage] = useState<File | string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, setValue } = useForm<AboutForm>();

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      const response = await api.get("/about");
      setAbout(response.data);
      if (response.data) {
        setValue("mainText_uz", response.data.mainText.uz);
        setValue("mainText_ru", response.data.mainText.ru);
        setValue("mainText_en", response.data.mainText.en);
        setValue("additionalText_uz", response.data.additionalText.uz);
        setValue("additionalText_ru", response.data.additionalText.ru);
        setValue("additionalText_en", response.data.additionalText.en);
        setBanner(response.data.banner || null);
        setImage(response.data.image || null);
      }
    } catch (error) {
      toast.error("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AboutForm) => {
    try {
      const formData = new FormData();
      formData.append(
        "mainText",
        JSON.stringify({
          uz: data.mainText_uz,
          ru: data.mainText_ru,
          en: data.mainText_en,
        })
      );
      formData.append(
        "additionalText",
        JSON.stringify({
          uz: data.additionalText_uz,
          ru: data.additionalText_ru,
          en: data.additionalText_en,
        })
      );
      if (banner && banner instanceof File) formData.append("banner", banner);
      if (image && image instanceof File) formData.append("image", image);

      if (about) {
        await api.put(`/about/${about._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Успешно обновлено");
      } else {
        await api.post("/about", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Успешно создано");
      }
      setShowModal(false);
      fetchAbout();
    } catch (error) {
      toast.error("Ошибка при сохранении");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Загрузка...</div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">О компании</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center"
        >
          <FiEdit className="mr-2" /> Редактировать
        </button>
      </div>

      {about ? (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Баннер</h3>
            {about.banner && (
              <img
                src={getImageUrl(about.banner)}
                alt="Banner"
                className="w-full max-w-2xl h-48 object-cover rounded"
              />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Основной текст</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>UZ:</strong> {about.mainText.uz}
              </p>
              <p className="text-sm text-gray-600">
                <strong>RU:</strong> {about.mainText.ru}
              </p>
              <p className="text-sm text-gray-600">
                <strong>EN:</strong> {about.mainText.en}
              </p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Изображение</h3>
            {about.image && (
              <img
                src={getImageUrl(about.image)}
                alt="About"
                className="w-64 h-48 object-cover rounded"
              />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Дополнительный текст</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>UZ:</strong> {about.additionalText.uz}
              </p>
              <p className="text-sm text-gray-600">
                <strong>RU:</strong> {about.additionalText.ru}
              </p>
              <p className="text-sm text-gray-600">
                <strong>EN:</strong> {about.additionalText.en}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">
            Информация о компании отсутствует. Нажмите "Редактировать" для
            добавления.
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Редактировать информацию о компании
              </h2>
              <button onClick={() => setShowModal(false)} className="text-2xl">
                &times;
              </button>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 max-h-[70vh] overflow-y-auto px-2"
            >
              <SingleImageUploader
                image={banner}
                onChange={setBanner}
                label="Баннер"
              />
              <SingleImageUploader
                image={image}
                onChange={setImage}
                label="Изображение"
              />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Основной текст (UZ)
                  </label>
                  <textarea
                    {...register("mainText_uz", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Основной текст (RU)
                  </label>
                  <textarea
                    {...register("mainText_ru", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Основной текст (EN)
                  </label>
                  <textarea
                    {...register("mainText_en", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Дополнительный текст (UZ)
                  </label>
                  <textarea
                    {...register("additionalText_uz", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Дополнительный текст (RU)
                  </label>
                  <textarea
                    {...register("additionalText_ru", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Дополнительный текст (EN)
                  </label>
                  <textarea
                    {...register("additionalText_en", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90"
              >
                Сохранить
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

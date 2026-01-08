"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FiEdit, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import SingleImageUploader from "@/components/SingleImageUploader";

type News = {
  _id: string;
  title: { uz: string; ru: string; en: string };
  content: { uz: string; ru: string; en: string };
  image: string;
  date: string;
};

type NewsForm = {
  title_uz: string;
  title_ru: string;
  title_en: string;
  content_uz: string;
  content_ru: string;
  content_en: string;
  date: string;
};

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [image, setImage] = useState<File | string | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<NewsForm>();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await api.get("/news");
      setNews(response.data);
    } catch (error) {
      toast.error("Не удалось загрузить новости");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: NewsForm) => {
    try {
      const formData = new FormData();
      formData.append(
        "title",
        JSON.stringify({
          uz: data.title_uz,
          ru: data.title_ru,
          en: data.title_en,
        })
      );
      formData.append(
        "content",
        JSON.stringify({
          uz: data.content_uz,
          ru: data.content_ru,
          en: data.content_en,
        })
      );
      formData.append("date", data.date);

      if (image instanceof File) {
        formData.append("image", image);
      }

      if (editingId) {
        await api.put(`/news/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Новость успешно обновлена");
      } else {
        await api.post("/news", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Новость успешно создана");
      }
      setShowModal(false);
      reset();
      setEditingId(null);
      setImage(null);
      fetchNews();
    } catch (error) {
      toast.error("Не удалось сохранить новость");
    }
  };

  const editNews = (item: News) => {
    setEditingId(item._id);
    setValue("title_uz", item.title.uz);
    setValue("title_ru", item.title.ru);
    setValue("title_en", item.title.en);
    setValue("content_uz", item.content.uz);
    setValue("content_ru", item.content.ru);
    setValue("content_en", item.content.en);
    setValue("date", item.date.split("T")[0]);
    setImage(item.image || null);
    setShowModal(true);
  };

  const deleteNews = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту новость?")) return;
    try {
      await api.delete(`/news/${id}`);
      toast.success("Новость успешно удалена");
      fetchNews();
    } catch (error) {
      toast.error("Не удалось удалить новость");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Загрузка...</div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Новости</h1>
        <button
          onClick={() => {
            reset();
            setEditingId(null);
            setImage(null);
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center"
        >
          <FiPlus className="mr-2" /> Добавить новость
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Заголовок
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Дата
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {news.map((item) => (
              <tr key={item._id}>
                <td className="px-6 py-4 text-sm">{item.title.ru}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(item.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                  <button
                    onClick={() => editNews(item)}
                    className="text-primary hover:text-opacity-80"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => deleteNews(item._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingId ? "Редактировать" : "Добавить"} новость
              </h2>
              <button onClick={() => setShowModal(false)}>
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Заголовок (Узбекский)
                  </label>
                  <input
                    {...register("title_uz", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Заголовок (Русский)
                  </label>
                  <input
                    {...register("title_ru", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Заголовок (Английский)
                  </label>
                  <input
                    {...register("title_en", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Содержание (Узбекский)
                  </label>
                  <textarea
                    {...register("content_uz", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Содержание (Русский)
                  </label>
                  <textarea
                    {...register("content_ru", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Содержание (Английский)
                  </label>
                  <textarea
                    {...register("content_en", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Дата</label>
                <input
                  type="date"
                  {...register("date", { required: true })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <SingleImageUploader
                image={image}
                onChange={setImage}
                label="Изображение новости"
              />

              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90"
              >
                {editingId ? "Обновить" : "Создать"} новость
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

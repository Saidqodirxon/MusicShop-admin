"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FiEdit, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import Image from "next/image";
import SingleImageUploader from "@/components/SingleImageUploader";

type WhoWeWorkFor = {
  _id: string;
  title: { uz: string; ru: string; en: string };
  description: { uz: string; ru: string; en: string };
  image: string;
  order: number;
};

type WhoWeWorkForForm = {
  title_uz: string;
  title_ru: string;
  title_en: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  order: number;
};

export default function WhoWeWorkForPage() {
  const [items, setItems] = useState<WhoWeWorkFor[]>([]);
  const [image, setImage] = useState<File | string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue } =
    useForm<WhoWeWorkForForm>();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get("/who-we-work-for");
      setItems(response.data);
    } catch (error) {
      toast.error("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: WhoWeWorkForForm) => {
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
        "description",
        JSON.stringify({
          uz: data.description_uz,
          ru: data.description_ru,
          en: data.description_en,
        })
      );
      formData.append("order", String(data.order || 0));
      if (image && image instanceof File) {
        formData.append("image", image);
      }

      if (editingId) {
        await api.put(`/who-we-work-for/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Успешно обновлено");
      } else {
        await api.post("/who-we-work-for", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Успешно создано");
      }
      setShowModal(false);
      reset();
      setEditingId(null);
      setImage(null);
      fetchItems();
    } catch (error) {
      toast.error("Ошибка при сохранении");
    }
  };

  const editItem = (item: WhoWeWorkFor) => {
    setEditingId(item._id);
    setValue("title_uz", item.title.uz);
    setValue("title_ru", item.title.ru);
    setValue("title_en", item.title.en);
    setValue("description_uz", item.description.uz);
    setValue("description_ru", item.description.ru);
    setValue("description_en", item.description.en);
    setValue("order", item.order);
    setImage(item.image || null);
    setShowModal(true);
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Вы уверены?")) return;
    try {
      await api.delete(`/who-we-work-for/${id}`);
      toast.success("Успешно удалено");
      fetchItems();
    } catch (error) {
      toast.error("Ошибка при удалении");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Загрузка...</div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Для кого мы работаем</h1>
        <button
          onClick={() => {
            reset();
            setEditingId(null);
            setImage(null);
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center"
        >
          <FiPlus className="mr-2" /> Добавить
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                № в списке
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Описание
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Изображение
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {item.order}
                </td>
                <td className="px-6 py-4 text-sm">{item.title.ru}</td>
                <td className="px-6 py-4 text-sm max-w-md truncate">
                  {item.description.ru}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {item.image && (
                    <img
                      src={`http://localhost:5000${item.image}`}
                      alt=""
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                  <button
                    onClick={() => editItem(item)}
                    className="text-primary hover:text-opacity-80"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => deleteItem(item._id)}
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
                {editingId ? "Редактировать" : "Добавить"}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Название (UZ)
                  </label>
                  <input
                    {...register("title_uz", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Название (RU)
                  </label>
                  <input
                    {...register("title_ru", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Название (EN)
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
                    Описание (UZ)
                  </label>
                  <textarea
                    {...register("description_uz", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Описание (RU)
                  </label>
                  <textarea
                    {...register("description_ru", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Описание (EN)
                  </label>
                  <textarea
                    {...register("description_en", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Позиция в списке (номер для сортировки)
                </label>
                <input
                  type="number"
                  placeholder="1, 2, 3..."
                  {...register("order")}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <SingleImageUploader
                image={image}
                onChange={setImage}
                label="Изображение"
              />
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90"
              >
                {editingId ? "Обновить" : "Создать"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

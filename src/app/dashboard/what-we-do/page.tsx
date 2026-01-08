"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FiEdit, FiTrash2, FiPlus, FiX } from "react-icons/fi";

type WhatWeDo = {
  _id: string;
  title: { uz: string; ru: string; en: string };
  description: { uz: string; ru: string; en: string };
  order: number;
};

type WhatWeDoForm = {
  title_uz: string;
  title_ru: string;
  title_en: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  order: number;
};

export default function WhatWeDoPage() {
  const [items, setItems] = useState<WhatWeDo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<WhatWeDoForm>();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get("/what-we-do");
      setItems(response.data);
    } catch (error) {
      toast.error("Не удалось загрузить элементы");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: WhatWeDoForm) => {
    try {
      const payload = {
        title: { uz: data.title_uz, ru: data.title_ru, en: data.title_en },
        description: {
          uz: data.description_uz,
          ru: data.description_ru,
          en: data.description_en,
        },
        order: data.order || 0,
      };
      if (editingId) {
        await api.put(`/what-we-do/${editingId}`, payload);
        toast.success("Успешно обновлено");
      } else {
        await api.post("/what-we-do", payload);
        toast.success("Успешно создано");
      }
      setShowModal(false);
      reset();
      setEditingId(null);
      fetchItems();
    } catch (error) {
      toast.error("Не удалось сохранить");
    }
  };

  const editItem = (item: WhatWeDo) => {
    setEditingId(item._id);
    setValue("title_uz", item.title.uz);
    setValue("title_ru", item.title.ru);
    setValue("title_en", item.title.en);
    setValue("description_uz", item.description.uz);
    setValue("description_ru", item.description.ru);
    setValue("description_en", item.description.en);
    setValue("order", item.order);
    setShowModal(true);
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Вы уверены?")) return;
    try {
      await api.delete(`/what-we-do/${id}`);
      toast.success("Успешно удалено");
      fetchItems();
    } catch (error) {
      toast.error("Не удалось удалить");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Загрузка...</div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Чем мы занимаемся</h1>
        <button
          onClick={() => {
            reset();
            setEditingId(null);
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center"
        >
          <FiPlus className="mr-2" /> Добавить элемент
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
                Заголовок (RU)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Описание (RU)
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
                {editingId ? "Редактировать" : "Добавить"} элемент
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
                    Описание (Узбекский)
                  </label>
                  <textarea
                    {...register("description_uz", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Описание (Русский)
                  </label>
                  <textarea
                    {...register("description_ru", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Описание (Английский)
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

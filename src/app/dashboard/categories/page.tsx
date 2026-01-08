"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FiEdit, FiTrash2, FiPlus, FiX } from "react-icons/fi";

type Category = {
  _id: string;
  name: {
    uz: string;
    ru: string;
    en: string;
  };
};

type CategoryForm = {
  name_uz: string;
  name_ru: string;
  name_en: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<CategoryForm>();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      toast.error("Не удалось загрузить категории");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CategoryForm) => {
    try {
      const payload = {
        name: {
          uz: data.name_uz,
          ru: data.name_ru,
          en: data.name_en,
        },
      };

      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
        toast.success("Категория успешно обновлена");
      } else {
        await api.post("/categories", payload);
        toast.success("Категория успешно создана");
      }

      setShowModal(false);
      reset();
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      toast.error("Не удалось сохранить категорию");
    }
  };

  const editCategory = (category: Category) => {
    setEditingId(category._id);
    setValue("name_uz", category.name.uz);
    setValue("name_ru", category.name.ru);
    setValue("name_en", category.name.en);
    setShowModal(true);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту категорию?")) return;

    try {
      await api.delete(`/categories/${id}`);
      toast.success("Категория успешно удалена");
      fetchCategories();
    } catch (error) {
      toast.error("Не удалось удалить категорию");
    }
  };

  const openAddModal = () => {
    reset();
    setEditingId(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Загрузка...</div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Категории</h1>
        <button
          onClick={openAddModal}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center"
        >
          <FiPlus className="mr-2" /> Добавить категорию
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Название (UZ)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Название (RU)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Название (EN)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {category.name.uz}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {category.name.ru}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {category.name.en}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                  <button
                    onClick={() => editCategory(category)}
                    className="text-primary hover:text-opacity-80"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => deleteCategory(category._id)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingId ? "Редактировать" : "Добавить"} категорию
              </h2>
              <button onClick={() => setShowModal(false)}>
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Название (Узбекский)
                </label>
                <input
                  {...register("name_uz", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Название (Русский)
                </label>
                <input
                  {...register("name_ru", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Название (Английский)
                </label>
                <input
                  {...register("name_en", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90"
              >
                {editingId ? "Обновить" : "Создать"} категорию
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

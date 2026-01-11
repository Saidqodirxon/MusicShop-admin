"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FiEdit, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import SingleImageUploader from "@/components/SingleImageUploader";

type Banner = {
  _id: string;
  image: string;
  link?: string;
  order: number;
  isActive: boolean;
};

type BannerForm = {
  link?: string;
  order: number;
  isActive: boolean;
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [image, setImage] = useState<File | string | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<BannerForm>({
    defaultValues: {
      order: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await api.get("/banners");
      setBanners(response.data);
    } catch (error) {
      toast.error("Не удалось загрузить баннеры");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: BannerForm) => {
    try {
      const formData = new FormData();
      formData.append("link", data.link || "");
      formData.append("order", data.order.toString());
      formData.append("isActive", data.isActive.toString());

      if (image instanceof File) {
        formData.append("image", image);
      }

      if (editingId) {
        await api.put(`/banners/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Баннер успешно обновлен");
      } else {
        await api.post("/banners", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Баннер успешно создан");
      }
      setShowModal(false);
      reset();
      setEditingId(null);
      setImage(null);
      fetchBanners();
    } catch (error) {
      toast.error("Не удалось сохранить баннер");
    }
  };

  const editBanner = (item: Banner) => {
    setEditingId(item._id);
    setValue("link", item.link || "");
    setValue("order", item.order);
    setValue("isActive", item.isActive);
    setImage(item.image || null);
    setShowModal(true);
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот баннер?")) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success("Баннер успешно удален");
      fetchBanners();
    } catch (error) {
      toast.error("Не удалось удалить баннер");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Загрузка...</div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Баннеры</h1>
        <button
          onClick={() => {
            reset({
              order: 0,
              isActive: true,
            });
            setEditingId(null);
            setImage(null);
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center"
        >
          <FiPlus className="mr-2" /> Добавить баннер
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Изображение
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Порядок
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {banners.map((item) => (
              <tr key={item._id}>
                <td className="px-6 py-4 text-sm">
                  <img 
                    src={`http://localhost:5000${item.image}`} 
                    alt="Banner" 
                    className="w-32 h-20 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {item.order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      item.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.isActive ? "Активен" : "Неактивен"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                  <button
                    onClick={() => editBanner(item)}
                    className="text-primary hover:text-opacity-80"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => deleteBanner(item._id)}
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
                {editingId ? "Редактировать" : "Добавить"} баннер
              </h2>
              <button onClick={() => setShowModal(false)}>
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ссылка
                  </label>
                  <input
                    {...register("link")}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Порядок
                  </label>
                  <input
                    type="number"
                    {...register("order", {
                      required: true,
                      valueAsNumber: true,
                    })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Статус
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register("isActive")}
                    className="w-4 h-4 text-primary border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm">Активен</label>
                </div>
              </div>

              <SingleImageUploader
                image={image}
                onChange={setImage}
                label="Изображение баннера"
              />

              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90"
              >
                {editingId ? "Обновить" : "Создать"} баннер
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

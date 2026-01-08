"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FiEdit, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import MultiImageUploader from "@/components/MultiImageUploader";

type Product = {
  _id: string;
  name: { uz: string; ru: string; en: string };
  description: { uz: string; ru: string; en: string };
  images: string[];
  category: { _id: string; name: { uz: string; ru: string; en: string } };
  inStock: boolean;
  showOnSite: boolean;
  isTopProduct: boolean;
  price: number;
};

type Category = {
  _id: string;
  name: { uz: string; ru: string; en: string };
};

type ProductForm = {
  name_uz: string;
  name_ru: string;
  name_en: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  category: string;
  inStock: boolean;
  showOnSite: boolean;
  isTopProduct: boolean;
  price: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [images, setImages] = useState<(File | string)[]>([]);
  const { register, handleSubmit, reset, setValue } = useForm<ProductForm>();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      toast.error("Не удалось загрузить продукты");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (error) {
      toast.error("Не удалось загрузить категории");
    }
  };

  const onSubmit = async (data: ProductForm) => {
    try {
      const formData = new FormData();
      formData.append(
        "name",
        JSON.stringify({ uz: data.name_uz, ru: data.name_ru, en: data.name_en })
      );
      formData.append(
        "description",
        JSON.stringify({
          uz: data.description_uz,
          ru: data.description_ru,
          en: data.description_en,
        })
      );
      formData.append("category", data.category);
      formData.append("inStock", String(data.inStock));
      formData.append("showOnSite", String(data.showOnSite));
      formData.append("isTopProduct", String(data.isTopProduct));
      formData.append("price", String(data.price));

      // Add new images (File objects)
      images.forEach((image) => {
        if (image instanceof File) {
          formData.append("images", image);
        }
      });

      // Keep existing images (string URLs)
      const existingImages = images.filter((img) => typeof img === "string");
      if (existingImages.length > 0) {
        formData.append("existingImages", JSON.stringify(existingImages));
      }

      if (editingId) {
        await api.put(`/products/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Продукт успешно обновлен");
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Продукт успешно создан");
      }

      setShowModal(false);
      reset();
      setEditingId(null);
      setImages([]);
      fetchProducts();
    } catch (error) {
      toast.error("Не удалось сохранить продукт");
    }
  };

  const editProduct = (product: Product) => {
    setEditingId(product._id);
    setValue("name_uz", product.name.uz);
    setValue("name_ru", product.name.ru);
    setValue("name_en", product.name.en);
    setValue("description_uz", product.description.uz);
    setValue("description_ru", product.description.ru);
    setValue("description_en", product.description.en);
    setValue("category", product.category._id);
    setValue("inStock", product.inStock);
    setValue("showOnSite", product.showOnSite);
    setValue("isTopProduct", product.isTopProduct);
    setValue("price", product.price);
    setImages(product.images || []);
    setShowModal(true);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот продукт?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Продукт успешно удален");
      fetchProducts();
    } catch (error) {
      toast.error("Не удалось удалить продукт");
    }
  };

  const openAddModal = () => {
    reset();
    setEditingId(null);
    setImages([]);
    setShowModal(true);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Загрузка...</div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Продукты</h1>
        <button
          onClick={openAddModal}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center"
        >
          <FiPlus className="mr-2" /> Добавить продукт
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Категория
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Цена
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                В наличии
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                На сайте
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Топ товар
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {product.name.ru}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {product.category.name.ru}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {product.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      product.inStock
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.inStock ? "Да" : "Нет"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      product.showOnSite
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.showOnSite ? "Да" : "Нет"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      product.isTopProduct
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.isTopProduct ? "Да" : "Нет"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                  <button
                    onClick={() => editProduct(product)}
                    className="text-primary hover:text-opacity-80"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => deleteProduct(product._id)}
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
                {editingId ? "Редактировать" : "Добавить"} продукт
              </h2>
              <button onClick={() => setShowModal(false)}>
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Название (Узбекский)
                  </label>
                  <input
                    {...register("name_uz", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Название (Русский)
                  </label>
                  <input
                    {...register("name_ru", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Название (Английский)
                  </label>
                  <input
                    {...register("name_en", { required: true })}
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
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Описание (Русский)
                  </label>
                  <textarea
                    {...register("description_ru", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Описание (Английский)
                  </label>
                  <textarea
                    {...register("description_en", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Категория
                  </label>
                  <select
                    {...register("category", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name.ru}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Цена</label>
                  <input
                    type="number"
                    {...register("price", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <MultiImageUploader
                images={images}
                onChange={setImages}
                maxImages={4}
                label="Изображения товара (максимум 4)"
              />

              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register("inStock")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">В наличии</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register("showOnSite")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Показать на сайте</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register("isTopProduct")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Топ товар</span>
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90"
              >
                {editingId ? "Обновить" : "Создать"} продукт
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

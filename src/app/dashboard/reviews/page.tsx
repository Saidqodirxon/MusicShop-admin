"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FiEdit, FiTrash2, FiPlus, FiX, FiStar } from "react-icons/fi";

type Review = {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  isActive: boolean;
  createdAt: string;
};

type ReviewForm = {
  name: string;
  rating: number;
  comment: string;
  isActive: boolean;
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<ReviewForm>();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get("/reviews/all");
      setReviews(response.data);
    } catch (error) {
      toast.error("Не удалось загрузить отзывы");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ReviewForm) => {
    try {
      if (editingId) {
        await api.put(`/reviews/${editingId}`, data);
        toast.success("Отзыв успешно обновлён");
      } else {
        await api.post("/reviews", data);
        toast.success("Отзыв успешно создан");
      }
      setShowModal(false);
      reset();
      setEditingId(null);
      fetchReviews();
    } catch (error) {
      toast.error("Не удалось сохранить отзыв");
    }
  };

  const editReview = (review: Review) => {
    setEditingId(review._id);
    setValue("name", review.name);
    setValue("rating", review.rating);
    setValue("comment", review.comment);
    setValue("isActive", review.isActive);
    setShowModal(true);
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Вы уверены?")) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success("Отзыв успешно удалён");
      fetchReviews();
    } catch (error) {
      toast.error("Не удалось удалить отзыв");
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FiStar
        key={i}
        className={
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }
        size={16}
      />
    ));
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Загрузка...</div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Отзывы</h1>
        <button
          onClick={() => {
            reset();
            setEditingId(null);
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center"
        >
          <FiPlus className="mr-2" /> Добавить отзыв
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Имя
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Рейтинг
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Комментарий
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Активен
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
            {reviews.map((review) => (
              <tr key={review._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {review.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex">{renderStars(review.rating)}</div>
                </td>
                <td className="px-6 py-4 text-sm max-w-xs truncate">
                  {review.comment}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      review.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {review.isActive ? "Да" : "Нет"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(review.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                  <button
                    onClick={() => editReview(review)}
                    className="text-primary hover:text-opacity-80"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => deleteReview(review._id)}
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
                {editingId ? "Редактировать" : "Добавить"} отзыв
              </h2>
              <button onClick={() => setShowModal(false)}>
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Имя</label>
                <input
                  {...register("name", { required: true })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Рейтинг (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  {...register("rating", { required: true })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Комментарий
                </label>
                <textarea
                  {...register("comment", { required: true })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                />
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="w-4 h-4"
                />
                <span className="text-sm">Активен (отображать на сайте)</span>
              </label>
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

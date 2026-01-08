"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FiEdit, FiTrash2, FiPlus, FiX } from "react-icons/fi";

type FAQ = {
  _id: string;
  question: { uz: string; ru: string; en: string };
  answer: { uz: string; ru: string; en: string };
  order: number;
};

type FAQForm = {
  question_uz: string;
  question_ru: string;
  question_en: string;
  answer_uz: string;
  answer_ru: string;
  answer_en: string;
  order: number;
};

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<FAQForm>();

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await api.get("/faq");
      setFaqs(response.data);
    } catch (error) {
      toast.error("Не удалось загрузить вопросы");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FAQForm) => {
    try {
      const payload = {
        question: {
          uz: data.question_uz,
          ru: data.question_ru,
          en: data.question_en,
        },
        answer: { uz: data.answer_uz, ru: data.answer_ru, en: data.answer_en },
        order: data.order || 0,
      };
      if (editingId) {
        await api.put(`/faq/${editingId}`, payload);
        toast.success("Вопрос успешно обновлён");
      } else {
        await api.post("/faq", payload);
        toast.success("Вопрос успешно создан");
      }
      setShowModal(false);
      reset();
      setEditingId(null);
      fetchFAQs();
    } catch (error) {
      toast.error("Не удалось сохранить вопрос");
    }
  };

  const editFAQ = (faq: FAQ) => {
    setEditingId(faq._id);
    setValue("question_uz", faq.question.uz);
    setValue("question_ru", faq.question.ru);
    setValue("question_en", faq.question.en);
    setValue("answer_uz", faq.answer.uz);
    setValue("answer_ru", faq.answer.ru);
    setValue("answer_en", faq.answer.en);
    setValue("order", faq.order);
    setShowModal(true);
  };

  const deleteFAQ = async (id: string) => {
    if (!confirm("Вы уверены?")) return;
    try {
      await api.delete(`/faq/${id}`);
      toast.success("Вопрос успешно удалён");
      fetchFAQs();
    } catch (error) {
      toast.error("Не удалось удалить вопрос");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Загрузка...</div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Частые вопросы (FAQ)</h1>
        <button
          onClick={() => {
            reset();
            setEditingId(null);
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center"
        >
          <FiPlus className="mr-2" /> Добавить вопрос
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
                Вопрос
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ответ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {faqs.map((faq) => (
              <tr key={faq._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {faq.order}
                </td>
                <td className="px-6 py-4 text-sm max-w-md">
                  {faq.question.ru}
                </td>
                <td className="px-6 py-4 text-sm max-w-md truncate">
                  {faq.answer.ru}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                  <button
                    onClick={() => editFAQ(faq)}
                    className="text-primary hover:text-opacity-80"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => deleteFAQ(faq._id)}
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
                {editingId ? "Редактировать" : "Добавить"} вопрос
              </h2>
              <button onClick={() => setShowModal(false)}>
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Вопрос (Узбекский)
                  </label>
                  <input
                    {...register("question_uz", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Вопрос (Русский)
                  </label>
                  <input
                    {...register("question_ru", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Вопрос (Английский)
                  </label>
                  <input
                    {...register("question_en", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ответ (Узбекский)
                  </label>
                  <textarea
                    {...register("answer_uz", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ответ (Русский)
                  </label>
                  <textarea
                    {...register("answer_ru", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ответ (Английский)
                  </label>
                  <textarea
                    {...register("answer_en", { required: true })}
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

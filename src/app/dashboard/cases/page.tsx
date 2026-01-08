"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FiEdit, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import SingleImageUploader from "@/components/SingleImageUploader";
import FileUploader from "@/components/FileUploader";

type Case = {
  _id: string;
  title: { uz: string; ru: string; en: string };
  description: { uz: string; ru: string; en: string };
  image: string;
  document: string;
};

type CaseForm = {
  title_uz: string;
  title_ru: string;
  title_en: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  image: FileList;
  document: FileList;
};

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [image, setImage] = useState<File | string | null>(null);
  const [document, setDocument] = useState<File | string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { register, handleSubmit, reset, setValue } = useForm<CaseForm>();

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await api.get("/cases");
      setCases(response.data);
    } catch (error) {
      toast.error("Не удалось загрузить кейсы");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CaseForm) => {
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
      if (image && image instanceof File) formData.append("image", image);
      if (document && document instanceof File)
        formData.append("document", document);

      if (editingId) {
        await api.put(`/cases/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Кейс успешно обновлен");
      } else {
        await api.post("/cases", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Кейс успешно создан");
      }
      setShowModal(false);
      reset();
      setEditingId(null);
      setImage(null);
      setDocument(null);
      fetchCases();
    } catch (error) {
      toast.error("Ошибка при сохранении кейса");
    }
  };

  const editCase = (caseItem: Case) => {
    setEditingId(caseItem._id);
    setValue("title_uz", caseItem.title.uz);
    setValue("title_ru", caseItem.title.ru);
    setValue("title_en", caseItem.title.en);
    setValue("description_uz", caseItem.description.uz);
    setValue("description_ru", caseItem.description.ru);
    setValue("description_en", caseItem.description.en);
    setImage(caseItem.image || null);
    setDocument(caseItem.document || null);
    setShowModal(true);
  };

  const deleteCase = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот кейс?")) return;
    try {
      await api.delete(`/cases/${id}`);
      toast.success("Кейс успешно удален");
      fetchCases();
    } catch (error) {
      toast.error("Ошибка при удалении кейса");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Загрузка...</div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Кейсы</h1>
        <button
          onClick={() => {
            reset();
            setEditingId(null);
            setImage(null);
            setDocument(null);
            setShowModal(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center"
        >
          <FiPlus className="mr-2" /> Добавить кейс
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
                Описание
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Изображение
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Документ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cases.map((caseItem) => (
              <tr key={caseItem._id}>
                <td className="px-6 py-4 text-sm">{caseItem.title.ru}</td>
                <td className="px-6 py-4 text-sm max-w-md truncate">
                  {caseItem.description.ru}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {caseItem.image && (
                    <img
                      src={`http://localhost:5000${caseItem.image}`}
                      alt=""
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {caseItem.document && (
                    <span className="text-blue-600">📄 Есть</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                  <button
                    onClick={() => editCase(caseItem)}
                    className="text-primary hover:text-opacity-80"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => deleteCase(caseItem._id)}
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
                {editingId ? "Редактировать" : "Добавить"} кейс
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
              <SingleImageUploader
                image={image}
                onChange={setImage}
                label="Изображение"
              />
              <FileUploader
                file={document}
                onChange={setDocument}
                label="Документ (PDF, DOC, DOCX)"
              />
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90"
              >
                {editingId ? "Обновить" : "Создать"} кейс
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2 } from "react-icons/fi";

type Application = {
  _id: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get("/applications");
      setApplications(response.data);
    } catch (error) {
      toast.error("Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/applications/${id}`, { status });
      toast.success("Статус успешно обновлен");
      fetchApplications();
    } catch (error) {
      toast.error("Не удалось обновить статус");
    }
  };

  const deleteApplication = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту заявку?")) return;

    try {
      await api.delete(`/applications/${id}`);
      toast.success("Заявка успешно удалена");
      fetchApplications();
    } catch (error) {
      toast.error("Не удалось удалить заявку");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Загрузка...</div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Заявки</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Тип
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Имя
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Телефон
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Статус
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
            {applications.map((app) => (
              <tr key={app._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {app.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {app.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {app.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {app.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app._id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="new">Новая</option>
                    <option value="in_progress">В процессе</option>
                    <option value="completed">Завершена</option>
                    <option value="rejected">Отклонена</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(app.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => deleteApplication(app._id)}
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
    </div>
  );
}

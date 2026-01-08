"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { FiEdit, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import Image from "next/image";

type Contact = {
  _id: string;
  address: { uz: string; ru: string; en: string };
  email: string;
  phones: string[];
  workingHours: { uz: string; ru: string; en: string };
};

type ContactForm = {
  address_uz: string;
  address_ru: string;
  address_en: string;
  email: string;
  phone1: string;
  phone2?: string;
  phone3?: string;
  workingHours_uz: string;
  workingHours_ru: string;
  workingHours_en: string;
};

export default function ContactsPage() {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm<ContactForm>();

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      const response = await api.get("/contacts");
      setContact(response.data);
      if (response.data) {
        setValue("address_uz", response.data.address.uz);
        setValue("address_ru", response.data.address.ru);
        setValue("address_en", response.data.address.en);
        setValue("email", response.data.email);
        setValue("phone1", response.data.phones[0] || "");
        setValue("phone2", response.data.phones[1] || "");
        setValue("phone3", response.data.phones[2] || "");
        setValue("workingHours_uz", response.data.workingHours.uz);
        setValue("workingHours_ru", response.data.workingHours.ru);
        setValue("workingHours_en", response.data.workingHours.en);
      }
    } catch (error) {
      toast.error("Не удалось загрузить контакты");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ContactForm) => {
    try {
      const phones = [data.phone1, data.phone2, data.phone3].filter(Boolean);
      const payload = {
        address: {
          uz: data.address_uz,
          ru: data.address_ru,
          en: data.address_en,
        },
        email: data.email,
        phones,
        workingHours: {
          uz: data.workingHours_uz,
          ru: data.workingHours_ru,
          en: data.workingHours_en,
        },
      };

      if (contact) {
        await api.put(`/contacts/${contact._id}`, payload);
        toast.success("Успешно обновлено");
      } else {
        await api.post("/contacts", payload);
        toast.success("Успешно создано");
      }
      setShowModal(false);
      fetchContact();
    } catch (error) {
      toast.error("Не удалось сохранить");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">Загрузка...</div>
    );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Контакты</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 flex items-center"
        >
          <FiEdit className="mr-2" /> Редактировать контакты
        </button>
      </div>

      {contact ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Адрес</h3>
              <p className="text-sm text-gray-600">
                <strong>UZ:</strong> {contact.address.uz}
              </p>
              <p className="text-sm text-gray-600">
                <strong>RU:</strong> {contact.address.ru}
              </p>
              <p className="text-sm text-gray-600">
                <strong>EN:</strong> {contact.address.en}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Email</h3>
              <p className="text-sm text-gray-600">{contact.email}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Телефоны</h3>
              {contact.phones.map((phone, i) => (
                <p key={i} className="text-sm text-gray-600">
                  {phone}
                </p>
              ))}
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Режим работы</h3>
              <p className="text-sm text-gray-600">
                <strong>UZ:</strong> {contact.workingHours.uz}
              </p>
              <p className="text-sm text-gray-600">
                <strong>RU:</strong> {contact.workingHours.ru}
              </p>
              <p className="text-sm text-gray-600">
                <strong>EN:</strong> {contact.workingHours.en}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">
            Контактные данные отсутствуют. Нажмите "Редактировать контакты"
            чтобы добавить.
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Редактировать контакты</h2>
              <button onClick={() => setShowModal(false)}>
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Адрес (Узбекский)
                  </label>
                  <textarea
                    {...register("address_uz", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Адрес (Русский)
                  </label>
                  <textarea
                    {...register("address_ru", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Адрес (Английский)
                  </label>
                  <textarea
                    {...register("address_en", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={2}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  {...register("email", { required: true })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Телефон 1
                  </label>
                  <input
                    {...register("phone1", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Телефон 2 (опционально)
                  </label>
                  <input
                    {...register("phone2")}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Телефон 3 (опционально)
                  </label>
                  <input
                    {...register("phone3")}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Режим работы (Узбекский)
                  </label>
                  <input
                    {...register("workingHours_uz", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Режим работы (Русский)
                  </label>
                  <input
                    {...register("workingHours_ru", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Режим работы (Английский)
                  </label>
                  <input
                    {...register("workingHours_en", { required: true })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90"
              >
                Сохранить контакты
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

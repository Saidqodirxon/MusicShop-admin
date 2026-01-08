"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { FiUser, FiMail, FiLock } from "react-icons/fi";

type ProfileForm = {
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/auth/me");
      setAdmin(response.data);
      reset({
        username: response.data.username,
        email: response.data.email,
      });
    } catch (error) {
      toast.error("Не удалось загрузить профиль");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileForm) => {
    if (data.newPassword && data.newPassword !== data.confirmPassword) {
      toast.error("Пароли не совпадают");
      return;
    }

    try {
      const payload: any = {
        username: data.username,
        email: data.email,
      };

      if (data.newPassword) {
        if (!data.currentPassword) {
          toast.error("Введите текущий пароль");
          return;
        }
        payload.currentPassword = data.currentPassword;
        payload.newPassword = data.newPassword;
      }

      await api.put("/auth/update", payload);
      toast.success("Профиль успешно обновлен");

      // Update local storage
      const updatedAdmin = {
        ...admin,
        username: data.username,
        email: data.email,
      };
      localStorage.setItem("admin", JSON.stringify(updatedAdmin));
      setAdmin(updatedAdmin);

      // Clear password fields
      reset({
        username: data.username,
        email: data.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Ошибка при обновлении профиля"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Загрузка...</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Профиль администратора</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiUser className="inline mr-2" />
              Имя пользователя
            </label>
            <input
              type="text"
              {...register("username", { required: "Обязательное поле" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiMail className="inline mr-2" />
              Email
            </label>
            <input
              type="email"
              {...register("email", { required: "Обязательное поле" })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <hr className="my-6" />

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-4">
              <FiLock className="inline mr-2" />
              Изменить пароль
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Оставьте поля пустыми, если не хотите менять пароль
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Текущий пароль
                </label>
                <input
                  type="password"
                  {...register("currentPassword")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Новый пароль
                </label>
                <input
                  type="password"
                  {...register("newPassword", {
                    minLength: { value: 6, message: "Минимум 6 символов" },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Подтвердите новый пароль
                </label>
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-opacity-90 transition-colors font-medium"
          >
            Сохранить изменения
          </button>
        </form>
      </div>
    </div>
  );
}

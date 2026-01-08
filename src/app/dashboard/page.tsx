"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "react-toastify";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    applications: 0,
    products: 0,
    categories: 0,
    news: 0,
    reviews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [applications, products, categories, news, reviews] =
        await Promise.all([
          api.get("/applications"),
          api.get("/products"),
          api.get("/categories"),
          api.get("/news"),
          api.get("/reviews/all"),
        ]);

      setStats({
        applications: applications.data.length,
        products: products.data.length,
        categories: categories.data.length,
        news: news.data.length,
        reviews: reviews.data.length,
      });
    } catch (error) {
      toast.error("Не удалось загрузить статистику");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Заявки", value: stats.applications, color: "bg-blue-500" },
    { title: "Продукты", value: stats.products, color: "bg-green-500" },
    { title: "Категории", value: stats.categories, color: "bg-yellow-500" },
    { title: "Новости", value: stats.news, color: "bg-purple-500" },
    { title: "Отзывы", value: stats.reviews, color: "bg-pink-500" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Загрузка...</div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Панель управления</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow-md p-6">
            <div
              className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center mb-4`}
            >
              <span className="text-white text-xl font-bold">{stat.value}</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          Добро пожаловать в админ панель музыкального магазина
        </h2>
        <p className="text-gray-600">
          Используйте боковое меню для навигации и управления контентом вашего
          музыкального магазина.
        </p>
      </div>
    </div>
  );
}

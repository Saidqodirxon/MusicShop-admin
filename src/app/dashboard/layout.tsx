"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiHome,
  FiFileText,
  FiUsers,
  FiBriefcase,
  FiShoppingBag,
  FiFolder,
  FiBook,
  FiInfo,
  FiMail,
  FiStar,
  FiHelpCircle,
  FiUser,
} from "react-icons/fi";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      const adminData = localStorage.getItem("admin");
      if (adminData) {
        setAdmin(JSON.parse(adminData));
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    router.push("/login");
  };

  const menuItems = [
    { name: "Панель управления", icon: FiHome, href: "/dashboard" },
    { name: "Заявки", icon: FiFileText, href: "/dashboard/applications" },
    { name: "Что мы делаем", icon: FiBriefcase, href: "/dashboard/what-we-do" },
    {
      name: "Для кого мы работаем",
      icon: FiUsers,
      href: "/dashboard/who-we-work-for",
    },
    {
      name: "Как мы работаем",
      icon: FiBriefcase,
      href: "/dashboard/how-we-work",
    },
    { name: "Категории", icon: FiFolder, href: "/dashboard/categories" },
    { name: "Продукты", icon: FiShoppingBag, href: "/dashboard/products" },
    { name: "Кейсы", icon: FiBook, href: "/dashboard/cases" },
    { name: "О компании", icon: FiInfo, href: "/dashboard/about" },
    { name: "Новости", icon: FiFileText, href: "/dashboard/news" },
    { name: "Контакты", icon: FiMail, href: "/dashboard/contacts" },
    { name: "Отзывы", icon: FiStar, href: "/dashboard/reviews" },
    { name: "FAQ", icon: FiHelpCircle, href: "/dashboard/faq" },
    { name: "Профиль", icon: FiUser, href: "/dashboard/profile" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-primary text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/20">
          {sidebarOpen && <h2 className="text-xl font-bold">Админ панель</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded hover:bg-white/10"
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-4 py-3 hover:bg-white/10 transition-colors"
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="ml-3">{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/20 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 rounded hover:bg-white/10 transition-colors"
          >
            <FiLogOut size={20} />
            {sidebarOpen && <span className="ml-3">Выход</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Музыкальный магазин - Админ панель
          </h1>
          {admin && (
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {admin.username}
                </p>
                <p className="text-xs text-gray-500">{admin.email}</p>
              </div>
            </div>
          )}
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

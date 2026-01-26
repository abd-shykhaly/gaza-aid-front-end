import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiHome,
  FiPlus,
  FiList,
  FiActivity,
  FiMessageSquare,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import { authStorage } from "../utils/auth";

export default function Layout() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = authStorage.getUser();

  const handleLogout = () => {
    authStorage.logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigation = [
    { name: "الرئيسية", href: "/", icon: FiHome },
    { name: "منشور جديد", href: "/new", icon: FiPlus },
    { name: "منشوراتي", href: "/my-posts", icon: FiList },
    { name: "سجل النشاط", href: "/feedback", icon: FiActivity },
    { name: "الرسائل", href: "/messages", icon: FiMessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold gradient-text">
                تبادل المساعدات في غزة
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-reverse space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-gray-100"
                >
                  {item.name}
                </Link>
              ))}

              <div className="flex items-center space-x-reverse space-x-3 border-l border-gray-300 pl-4">
                <div className="flex items-center space-x-reverse space-x-2">
                  <FiUser className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 font-medium">
                    مرحباً، {user?.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 transition-colors duration-200"
                >
                  <FiLogOut className="w-4 h-4" />
                  تسجيل الخروج
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {isMobileMenuOpen ? (
                  <FiX className="w-6 h-6" />
                ) : (
                  <FiMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200/50">
            <div className="px-4 pt-4 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={closeMobileMenu}
                    className="flex gap-2 flex-row-reverse items-center space-x-reverse space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-3 rounded-lg text-base font-medium transition-colors duration-200"
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center space-x-reverse space-x-3 px-3 py-3 bg-gray-50 rounded-lg">
                  <FiUser className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700 font-medium">
                    مرحباً، {user?.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-reverse space-x-3 w-full text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-3 rounded-lg text-base font-medium transition-colors duration-200 mt-2"
                >
                  <FiLogOut className="w-5 h-5" />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

import React from "react";

const AdminDashboard = () => {
  const commonCardStyles =
    "rounded-xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl";
  const adminStyles =
    "bg-gradient-to-br from-purple-500 to-pink-600 text-white";

  const CrudOperationsAdmin = [
    { operation: "create lecturers", link: "/admin/create-lecturers" },
    { operation: "create students", link: "/admin/create-students" },
    { operation: "manage sessions", link: "/admin/sessions" },
    {
      operation: "manage courses/programs/accolations",
      link: "/admin/courses",
    },
    { operation: "manage schedule", link: "/admin/schedule" },
    { operation: "manage lesson times", link: "/admin/lesson-times" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Приветствие */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600 text-lg">
            Here's your personalized dashboard
          </p>
        </div>

        {/* Основная карточка дашборда */}
        <div className="max-w-4xl mx-auto">
          <div className={`${commonCardStyles} ${adminStyles}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="text-4xl">⚙️</div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                Administrator
              </span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Admin Dashboard</h2>
            <p className="text-purple-100 mb-6">
              Manage users, system settings, and overall platform administration
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Админ статистика может быть добавлена здесь */}
            </div>
          </div>
        </div>

        {/* Быстрые действия - ТОЛЬКО для админа */}
        <div className="max-w-4xl mx-auto mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CrudOperationsAdmin.map((action, index) => (
              <button
                key={index}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center"
              >
                <a href={action.link} className="flex flex-col items-center">
                  <div className="text-2xl mb-2">📚</div>
                  <div className="font-medium text-gray-700">
                    {action.operation}
                  </div>
                </a>
              </button>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="max-w-4xl mx-auto mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Security Settings
          </h3>
          <div className="grid gap-4">
            <a
              href="/change-password"
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border border-slate-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
                  🔒
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-lg">
                    Change Password
                  </div>
                  <div className="text-slate-600 text-sm">
                    Update your account password
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
      <a href="/logout">logout</a>
    </div>
  );
};

export default AdminDashboard;

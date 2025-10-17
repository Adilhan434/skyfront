import React from 'react'
import { ROLE } from '../constants'

const Dashboard = () => {
  const currentRole = localStorage.getItem(ROLE)

  // Общие стили для всех карточек
  const commonCardStyles = "rounded-xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl"

  // Стили для разных ролей
  const roleStyles = {
    student: "bg-gradient-to-br from-blue-500 to-purple-600 text-white",
    teacher: "bg-gradient-to-br from-green-500 to-teal-600 text-white",
    parent: "bg-gradient-to-br from-orange-500 to-red-500 text-white",
    admin: "bg-gradient-to-br from-purple-500 to-pink-600 text-white"
  }

  const CrudOperationsAdmin = [
    {operation:'create lecturers', link:'/admin/create-lecturers'},   
    {operation:'create students', link:'/admin/create-students'},   
  ]

  // Иконки для разных ролей
  const roleIcons = {
    student: "🎓",
    teacher: "👨‍🏫",
    parent: "👨‍👩‍👧‍👦",
    admin: "⚙️"
  }

  // Заголовки для разных ролей
  const roleTitles = {
    student: "Student Dashboard",
    teacher: "Teacher Dashboard",
    parent: "Parent Dashboard",
    admin: "Admin Dashboard"
  }

  // Описания для разных ролей
  const roleDescriptions = {
    student: "Manage your courses, assignments, and track your progress",
    teacher: "Create courses, manage students, and grade assignments",
    parent: "Monitor your child's progress and communicate with teachers",
    admin: "Manage users, system settings, and overall platform administration"
  }

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
          {currentRole === "student" && (
            <div className={`${commonCardStyles} ${roleStyles.student}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="text-4xl">{roleIcons.student}</div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  Student
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-4">{roleTitles.student}</h2>
              <p className="text-blue-100 mb-6">{roleDescriptions.student}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-sm">Active Courses</div>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm">Pending Assignments</div>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold">A-</div>
                  <div className="text-sm">Current GPA</div>
                </div>
              </div>
            </div>
          )}

          {currentRole === "teacher" && (
            <div className={`${commonCardStyles} ${roleStyles.teacher}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="text-4xl">{roleIcons.teacher}</div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  Teacher
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-4">{roleTitles.teacher}</h2>
              <p className="text-green-100 mb-6">{roleDescriptions.teacher}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold">8</div>
                  <div className="text-sm">Active Courses</div>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-sm">Students</div>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm">Assignments to Grade</div>
                </div>
              </div>
            </div>
          )}

          {currentRole === "parent" && (
            <div className={`${commonCardStyles} ${roleStyles.parent}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="text-4xl">{roleIcons.parent}</div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  Parent
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-4">{roleTitles.parent}</h2>
              <p className="text-orange-100 mb-6">{roleDescriptions.parent}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold">2</div>
                  <div className="text-sm">Children</div>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold">B+</div>
                  <div className="text-sm">Average Grade</div>
                </div>
                <div className="bg-white/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-sm">New Notifications</div>
                </div>
              </div>
            </div>
          )}

          {currentRole === "admin" && (
            <div className={`${commonCardStyles} ${roleStyles.admin}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="text-4xl">{roleIcons.admin}</div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  Administrator
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-4">{roleTitles.admin}</h2>
              <p className="text-purple-100 mb-6">{roleDescriptions.admin}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
               
                
              </div>
            </div>
          )}

          {/* Если роль не определена */}
          {!currentRole && (
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Role Not Defined
              </h2>
              <p className="text-gray-600">
                Please set your role to view the dashboard
              </p>
            </div>
          )}
        </div>

        {/* Быстрые действия */}
        <div className="max-w-4xl mx-auto mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CrudOperationsAdmin.map((action, index) => (
            <button key={index} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 text-center">
              <a href={action.link} className="flex flex-col items-center">
                <div className="text-2xl mb-2">📚</div>
                <div className="font-medium text-gray-700">{action.operation}</div>
              </a>
            </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
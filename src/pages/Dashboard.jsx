import React from 'react'
import { ROLE } from '../constants'
import AdminDashboard from './users/admin.jsx'
import TeacherDashboard from './users/teacher.jsx'
import StudentDashboard from './users/student.jsx'

const Dashboard = () => {
  const currentRole = localStorage.getItem(ROLE)

  // Рендерим соответствующий дашборд в зависимости от роли
  switch (currentRole) {
    case 'admin':
      return <AdminDashboard />
    case 'lecturer':
      return <TeacherDashboard />
    case 'student':
      return <StudentDashboard />
    case 'parent':
      // Для родителя можно создать отдельный компонент или использовать существующую логику
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <a href="/logout">logout</a>
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Welcome back!
              </h1>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="rounded-xl p-8 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-4xl">👨‍👩‍👧‍👦</div>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    Parent
                  </span>
                </div>
                <h2 className="text-3xl font-bold mb-4">Parent Dashboard</h2>
                <p className="text-orange-100 mb-6">Monitor your child's progress and communicate with teachers</p>
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
            </div>
          </div>
        </div>
      )
    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Role Not Defined
              </h2>
              <p className="text-gray-600">
                Please set your role to view the dashboard
              </p>
            </div>
          </div>
        </div>
      )
  }
}

export default Dashboard
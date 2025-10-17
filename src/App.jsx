// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./componenets/ProtectedRoute"
import LecturersPanel from './pages/crud/LecturersCrud.jsx';
import StudentsPanel from './pages/crud/StudentsCrud.jsx';
import TeacherEdit from './pages/crud/TeacherEdit.jsx';
import TeacherDetail from './pages/crud/TeacherDetail.jsx';


function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}


function App() {
  return (
      <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path='/admin/create-lecturers' element={
          <ProtectedRoute>
            <LecturersPanel />
          </ProtectedRoute>

        } />
        <Route path='/admin/create-students' element={
          <ProtectedRoute>
            <StudentsPanel />
          </ProtectedRoute>

        } />
       <Route path='/admin/teacher/:id' element={
          <ProtectedRoute>
            <TeacherDetail />
          </ProtectedRoute>

        } />
        <Route path='/admin/teacher/:id/edit' element={
          <ProtectedRoute>
            <TeacherEdit />
          </ProtectedRoute>

        } />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </Router>
  )
}

export default App
// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./componenets/ProtectedRoute"

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
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </Router>
  )
}

export default App
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Recipes from './pages/Recipes'
import Users from './pages/Users'
import RecipeEdit from './pages/RecipeEdit'
import { useAuth } from './context/AuthContext'
import Imports from './pages/Imports'

function LoginRoute() {
  const { token, user } = useAuth()
  if (token && user?.role === 'admin') return <Navigate to="/dashboard" replace />
  return <Login />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/:id" element={<RecipeEdit />} />
          <Route path="/users" element={<Users />} />
          <Route path="/imports" element={<Imports />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, token, loading } = useAuth()
  // Allow route while verifying if we have a token; avoid redirect loop
  if (loading && token) return <div className="p-6">Loading...</div>
  if (!token) return <Navigate to="/login" replace />
  if (!user) return <div className="p-6">Loading...</div>
  if (user.role !== 'admin') return <Navigate to="/login" replace />
  return children
}

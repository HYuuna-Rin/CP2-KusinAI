import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

const __raw = import.meta.env.VITE_API_URL || ''
const __trim = __raw.replace(/\/$/, '')
const __base = __trim.endsWith('/api') ? __trim : `${__trim}/api`
const api = axios.create({ baseURL: __base })

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) localStorage.setItem('admin_token', token)
    else localStorage.removeItem('admin_token')
  }, [token])

  useEffect(() => {
    if (!token) return
    setLoading(true)
    api.get('/auth/verify', { headers: { Authorization: `Bearer ${token}` }})
      .then(res => setUser(res.data?.user || null))
      .catch(() => { setToken(''); setUser(null) })
      .finally(() => setLoading(false))
  }, [token])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const token = res?.data?.token
    if (!token) throw new Error(res?.data?.message || 'Login failed')

    let role = res?.data?.user?.role
    let userPayload = res?.data?.user
    try {
      const decoded = jwtDecode(token)
      role = role || decoded?.role
      userPayload = userPayload || { id: decoded?.id, name: decoded?.name, email: decoded?.email, role: decoded?.role }
    } catch {}

    if (role !== 'admin') throw new Error('Admin access required')
    setToken(token)
    setUser(userPayload)
  }

  const logout = () => { setToken(''); setUser(null) }

  const value = useMemo(() => ({ token, user, loading, login, logout }), [token, user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }

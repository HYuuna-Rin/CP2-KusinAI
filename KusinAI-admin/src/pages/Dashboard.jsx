import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiMail, FiRefreshCw } from 'react-icons/fi'

const __raw = import.meta.env.VITE_API_URL || ''
const __trim = __raw.replace(/\/$/, '')
const __base = __trim.endsWith('/api') ? __trim : `${__trim}/api`
const api = axios.create({ baseURL: __base })

export default function Dashboard() {
  const { token } = useAuth()
  const nav = useNavigate()

  const [recipes, setRecipes] = useState([])
  const [stats, setStats] = useState({ totalUsers: 0, totalRecipes: 0, totalComments: 0, totalReplies: 0 })

  const [health, setHealth] = useState({ ok: false, latencyMs: 0, lastChecked: null })
  const [users, setUsers] = useState([])

  const fetchRecipes = async () => {
    try {
      const res = await api.get('/recipes')
      const list = Array.isArray(res.data) ? res.data : []
      // sort newest first for Recent Recipes
      list.sort((a,b)=> new Date(b.createdAt||0) - new Date(a.createdAt||0))
      setRecipes(list)
    } catch (e) {
      setRecipes([])
    }
  }

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      setStats({
        totalUsers: res.data?.totalUsers || 0,
        totalRecipes: res.data?.totalRecipes || 0,
        totalComments: res.data?.totalComments || 0,
        totalReplies: res.data?.totalReplies || 0,
      })
    } catch (e) {
      setStats({ totalUsers: 0, totalRecipes: 0, totalComments: 0, totalReplies: 0 })
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      setUsers(Array.isArray(res.data) ? res.data : [])
    } catch { setUsers([]) }
  }

  const checkHealth = async () => {
    const start = performance.now()
    try {
      await api.get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      const latencyMs = Math.round(performance.now() - start)
      setHealth({ ok: true, latencyMs, lastChecked: new Date().toISOString() })
    } catch {
      setHealth({ ok: false, latencyMs: 0, lastChecked: new Date().toISOString() })
    }
  }

  useEffect(() => { fetchRecipes(); fetchStats(); fetchUsers(); checkHealth() }, [token])

  // No create/delete actions on dashboard; moved to Recipes page

  // derive recent items (simple, from fetched lists)
  const recentUsers = useMemo(() => {
    const sevenDays = Date.now() - 7*24*60*60*1000
    return users
      .filter(u => new Date(u.createdAt || 0).getTime() >= sevenDays)
      .sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0))
      .slice(0,5)
  }, [users])
  const topEngaged = useMemo(() => {
    return recipes
      .map(r => ({
        id: r._id,
        title: r.title,
        score: (r.comments?.length || 0) + (r.comments?.reduce((s,c)=> s + (c.replies?.length||0),0) || 0)
      }))
      .sort((a,b)=> b.score - a.score)
      .slice(0,5)
  }, [recipes])
  const recentRecipes = recipes.slice(0, 5)

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-100 rounded p-4 text-center">
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <div className="text-gray-600">Users</div>
        </div>
        <div className="bg-gray-100 rounded p-4 text-center">
          <div className="text-2xl font-bold">{stats.totalRecipes}</div>
          <div className="text-gray-600">Recipes</div>
        </div>
        <div className="bg-gray-100 rounded p-4 text-center">
          <div className="text-2xl font-bold">{stats.totalComments}</div>
          <div className="text-gray-600">Comments</div>
        </div>
        <div className="bg-gray-100 rounded p-4 text-center">
          <div className="text-2xl font-bold">{stats.totalReplies}</div>
          <div className="text-gray-600">Replies</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={()=>nav('/recipes')} className="px-3 py-2 rounded bg-primary text-white">Manage Recipes</button>
          <button onClick={()=>nav('/users')} className="px-3 py-2 rounded bg-blue-600 text-white">Manage Users</button>
          <a href="https://mail.google.com/" target="_blank" rel="noreferrer" className="px-3 py-2 rounded bg-accent text-white inline-flex items-center gap-2"><FiMail/>Open Gmail</a>
          <button onClick={checkHealth} className="px-3 py-2 rounded bg-gray-600 text-white inline-flex items-center gap-2"><FiRefreshCw/>Check Health</button>
        </div>
      </div>

      {/* System Health */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">System Health</h3>
        <div className="flex items-center gap-3 bg-gray-100 rounded p-3">
          <span className={`inline-block h-3 w-3 rounded-full ${health.ok ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>Backend: {health.ok ? 'Online' : 'Offline'}</span>
          <span className="text-sm text-gray-600">Latency: {health.latencyMs} ms</span>
          <span className="text-sm text-gray-600">Last Checked: {health.lastChecked ? new Date(health.lastChecked).toLocaleString() : '—'}</span>
        </div>
      </div>

      {/* Quick glance: Recent Recipes */}
      <div className="mt-2">
        <h3 className="text-lg font-semibold mb-2">Recent Recipes</h3>
        {recentRecipes.length === 0 ? (
          <div className="text-gray-500">No recipes yet.</div>
        ) : (
          <ul className="space-y-2">
            {recentRecipes.map(r => (
              <li key={r._id} className="flex justify-between items-center bg-gray-100 rounded p-2">
                <span className="font-medium">{r.title}</span>
                <span className="text-sm text-gray-600">{r.region}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Top Engaged */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Top Engaged Recipes</h3>
        {topEngaged.length === 0 ? (
          <div className="text-gray-500">No engagement yet.</div>
        ) : (
          <ul className="space-y-2">
            {topEngaged.map(t => (
              <li key={t.id} className="flex justify-between items-center bg-gray-100 rounded p-2">
                <span className="font-medium">{t.title}</span>
                <span className="text-sm text-gray-600">Score: {t.score}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* New Users (last 7 days) */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">New Users (7 days)</h3>
        {recentUsers.length === 0 ? (
          <div className="text-gray-500">No new users in the last week.</div>
        ) : (
          <ul className="space-y-2">
            {recentUsers.map(u => (
              <li key={u._id} className="flex justify-between items-center bg-gray-100 rounded p-2">
                <span className="font-medium">{u.email}</span>
                <span className="text-sm text-gray-600">{new Date(u.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Management functions moved to Recipes and Users sidebars */}
    </div>
  )
}

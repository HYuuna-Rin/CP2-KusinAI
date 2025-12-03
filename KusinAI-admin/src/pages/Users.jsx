import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { ConfirmDialog } from '../components/ModalPortal'

const __raw = import.meta.env.VITE_API_URL || ''
const __trim = __raw.replace(/\/$/, '')
const __base = __trim.endsWith('/api') ? __trim : `${__trim}/api`
const api = axios.create({ baseURL: __base })

export default function Users() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [banTarget, setBanTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get('/admin/users', { headers: { Authorization: `Bearer ${token}` }})
      .then(res => setItems(res.data))
      .finally(() => setLoading(false))
  }, [token])

  const performBanToggle = async (id) => {
    try {
      await api.put(`/admin/users/${id}/toggle-ban`, {}, { headers: { Authorization: `Bearer ${token}` }})
      setItems(items => items.map(u => u._id === id ? { ...u, isBanned: !u.isBanned } : u))
    } finally {
      setBanTarget(null)
    }
  }

  const performDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` }})
      setItems(items => items.filter(u => u._id !== id))
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="w-full max-w-md">
          <input className="w-full p-2 border rounded" placeholder="Search users by name" value={query} onChange={e=>setQuery(e.target.value)} />
        </div>
      </div>
      {loading ? 'Loading...' : (
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="text-left">
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Status</th>
              <th className="p-2 w-48">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items
              .filter(u => {
                const q = query.trim().toLowerCase()
                if (!q) return true
                return (
                  (u.email||'').toLowerCase().includes(q) ||
                  (u.name||'').toLowerCase().includes(q)
                )
              })
              .map(u => (
              <tr key={u._id} className="border-t">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.isBanned ? 'Banned' : 'Active'}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={()=>setBanTarget({ id: u._id, email: u.email, isBanned: u.isBanned })} className={`px-3 py-1 rounded text-white ${u.isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-danger hover:bg-red-700'}`}>
                    {u.isBanned ? 'Unban' : 'Ban'}
                  </button>
                  <button onClick={()=>setDeleteTarget({ id: u._id, email: u.email })} className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-white">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <ConfirmDialog
        open={!!banTarget}
        title={banTarget?.isBanned ? 'Unban User' : 'Ban User'}
        message={banTarget ? `${banTarget.isBanned ? 'Restore access to' : 'Restrict access for'} ${banTarget.email}?` : ''}
        confirmLabel={banTarget?.isBanned ? 'Unban' : 'Ban'}
        destructive={!banTarget?.isBanned}
        onCancel={()=>setBanTarget(null)}
        onConfirm={()=>banTarget && performBanToggle(banTarget.id)}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        message={deleteTarget ? `Permanently delete ${deleteTarget.email}? This cannot be undone.` : ''}
        confirmLabel="Delete"
        destructive
        onCancel={()=>setDeleteTarget(null)}
        onConfirm={()=>deleteTarget && performDelete(deleteTarget.id)}
      />
    </div>
  )
}

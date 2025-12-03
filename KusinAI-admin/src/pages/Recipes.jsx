import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'
import ModalPortal, { ConfirmDialog } from '../components/ModalPortal'

const __raw = import.meta.env.VITE_API_URL || ''
const __trim = __raw.replace(/\/$/, '')
const __base = __trim.endsWith('/api') ? __trim : `${__trim}/api`
const api = axios.create({ baseURL: __base })

export default function Recipes() {
  const { token } = useAuth()
  const nav = useNavigate()
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [addModal, setAddModal] = useState(false)
  const [newRecipe, setNewRecipe] = useState({ title: '', region: '', image: '', ingredients: '', steps: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmAdd, setConfirmAdd] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get('/recipes', { headers: { Authorization: `Bearer ${token}` }})
      .then(res => setItems(res.data))
      .finally(() => setLoading(false))
  }, [token])

  const remove = async (id) => {
    try {
      await api.delete(`/recipes/${id}`, { headers: { Authorization: `Bearer ${token}` }})
      setItems(items => items.filter(r => r._id !== id))
    } finally {
      setConfirmDelete(null)
    }
  }

  const addRecipe = async () => {
    const payload = {
      ...newRecipe,
      ingredients: newRecipe.ingredients.split('\n').map(s=>s.trim()).filter(Boolean),
      steps: newRecipe.steps.split('\n').map(s=>s.trim()).filter(Boolean),
    }
    try {
      await api.post('/recipes', payload, { headers: { Authorization: `Bearer ${token}` }})
      setAddModal(false)
      setNewRecipe({ title: '', region: '', image: '', ingredients: '', steps: '' })
      setLoading(true)
      const res = await api.get('/recipes')
      setItems(res.data)
      setLoading(false)
    } finally {
      setConfirmAdd(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recipes</h2>
        <div className="flex items-center gap-2 w-full max-w-md">
          <input className="w-full p-2 border rounded" placeholder="Search recipes by name" value={query} onChange={e=>setQuery(e.target.value)} />
          <button onClick={()=>setAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"><FiPlus /> Add Recipe</button>
        </div>
      </div>
      {loading ? 'Loading...' : (
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="text-left">
              <th className="p-2">Title</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items
              .filter(r => {
                const q = query.trim().toLowerCase()
                if (!q) return true
                return (
                  (r.title||'').toLowerCase().includes(q) ||
                  (r.region||'').toLowerCase().includes(q)
                )
              })
              .map(r => (
              <tr key={r._id} className="border-t">
                 <td className="p-2">
                   <button onClick={()=>nav(`/recipes/${r._id}`)} className="text-primary hover:underline">
                     {r.title}
                   </button>
                 </td>
                <td className="p-2 flex gap-2">
                  <button onClick={()=>nav(`/recipes/${r._id}`)} className="px-3 py-1 rounded bg-primary text-white">Edit</button>
                  <button onClick={()=>setConfirmDelete({ id: r._id, title: r.title })} className="px-3 py-1 rounded bg-danger text-white">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      

      {addModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[2000] pointer-events-auto">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={()=>setAddModal(false)} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
              <h2 className="text-lg font-bold mb-4">Add New Recipe</h2>
              <input className="w-full p-2 border rounded mb-2" placeholder="Title" value={newRecipe.title} onChange={e=>setNewRecipe({...newRecipe,title:e.target.value})} />
              <input className="w-full p-2 border rounded mb-2" placeholder="Region" value={newRecipe.region} onChange={e=>setNewRecipe({...newRecipe,region:e.target.value})} />
              <input className="w-full p-2 border rounded mb-2" placeholder="Image URL" value={newRecipe.image} onChange={e=>setNewRecipe({...newRecipe,image:e.target.value})} />
              <textarea className="w-full p-2 border rounded mb-2" rows={5} placeholder="Ingredients (one per line)" value={newRecipe.ingredients} onChange={e=>setNewRecipe({...newRecipe,ingredients:e.target.value})} />
              <textarea className="w-full p-2 border rounded mb-2" rows={5} placeholder="Steps (one per line)" value={newRecipe.steps} onChange={e=>setNewRecipe({...newRecipe,steps:e.target.value})} />
              <div className="flex justify-end gap-2">
                <button onClick={()=>setConfirmAdd(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Save</button>
                <button onClick={()=>setAddModal(false)} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Recipe"
        message={confirmDelete ? `Delete recipe: ${confirmDelete.title}? This cannot be undone.` : ''}
        confirmLabel="Delete"
        destructive
        onCancel={()=>setConfirmDelete(null)}
        onConfirm={()=>confirmDelete && remove(confirmDelete.id)}
      />
      <ConfirmDialog
        open={confirmAdd}
        title="Add Recipe"
        message={newRecipe.title ? `Save new recipe: ${newRecipe.title}?` : 'Save this new recipe?'}
        confirmLabel="Save"
        onCancel={()=>setConfirmAdd(false)}
        onConfirm={addRecipe}
      />
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import ModalPortal, { ConfirmDialog } from '../components/ModalPortal'

const __raw = import.meta.env.VITE_API_URL || ''
const __trim = __raw.replace(/\/$/, '')
const __base = __trim.endsWith('/api') ? __trim : `${__trim}/api`
const api = axios.create({ baseURL: __base })

export default function RecipeEdit() {
  const { id } = useParams()
  const nav = useNavigate()
  const { token } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title:'', region:'', image:'', ingredients:'', steps:'', substitutions:'' })
  const [error, setError] = useState('')
  const [confirmSave, setConfirmSave] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [comments, setComments] = useState([])
  const [editCommentId, setEditCommentId] = useState(null)
  const [editCommentText, setEditCommentText] = useState('')
  const [deleteCommentId, setDeleteCommentId] = useState(null)
  const [replyEditMap, setReplyEditMap] = useState({})
  const [replyDeleteTarget, setReplyDeleteTarget] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api.get(`/recipes/id/${id}`)
      .then(res => {
        if (!mounted) return
        const r = res.data || {}
        setForm({
          title: r.title || '',
          region: r.region || '',
          image: r.image || '',
          ingredients: Array.isArray(r.ingredients) ? r.ingredients.join('\n') : (r.ingredients || ''),
          steps: Array.isArray(r.steps) ? r.steps.join('\n') : (r.steps || ''),
          substitutions: Array.isArray(r.substitutions) ? r.substitutions.join('\n') : (r.substitutions || ''),
        })
      })
      .catch(()=> setError('Failed to load recipe'))
      .finally(()=> setLoading(false))
    // fetch comments for management
    api.get(`/recipes/${id}/comments`)
      .then(res => setComments(Array.isArray(res.data) ? res.data : []))
      .catch(() => setComments([]))
    return () => { mounted = false }
  }, [id])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSaveConfirmed = async () => {
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        region: form.region,
        image: form.image,
        ingredients: String(form.ingredients).split('\n').map(s=>s.trim()).filter(Boolean),
        steps: String(form.steps).split('\n').map(s=>s.trim()).filter(Boolean),
        substitutions: String(form.substitutions).split('\n').map(s=>s.trim()).filter(Boolean)
      }
      await api.put(`/recipes/${id}`, payload, { headers: { Authorization: `Bearer ${token}` }})
      nav('/recipes')
    } catch (e) {
      setError('Save failed')
    } finally { setSaving(false); setConfirmSave(false) }
  }

  const onDeleteConfirmed = async () => {
    try {
      await api.delete(`/recipes/${id}`, { headers: { Authorization: `Bearer ${token}` }})
      nav('/recipes')
    } catch (e) { setError('Delete failed') }
    finally { setConfirmDelete(false) }
  }

  // ===== COMMENT MANAGEMENT =====
  const refreshComments = async () => {
    try {
      const res = await api.get(`/recipes/${id}/comments`)
      setComments(Array.isArray(res.data) ? res.data : [])
    } catch {}
  }

  const startEditComment = (comment) => {
    setEditCommentId(comment._id)
    setEditCommentText(comment.comment || '')
  }
  const cancelEditComment = () => {
    setEditCommentId(null)
    setEditCommentText('')
  }
  const saveEditComment = async () => {
    try {
      const token = localStorage.getItem('admin_token') || ''
      await api.put(`/recipes/${id}/comments/${editCommentId}`, { comment: editCommentText }, { headers: { Authorization: `Bearer ${token}` } })
      await refreshComments()
    } catch {}
    finally { cancelEditComment() }
  }
  const confirmDeleteComment = (commentId) => setDeleteCommentId(commentId)
  const performDeleteComment = async () => {
    try {
      const token = localStorage.getItem('admin_token') || ''
      await api.delete(`/recipes/${id}/comments/${deleteCommentId}`, { headers: { Authorization: `Bearer ${token}` } })
      await refreshComments()
    } catch {}
    finally { setDeleteCommentId(null) }
  }

  const startEditReply = (commentId, reply) => {
    setReplyEditMap(prev => ({ ...prev, [reply._id]: reply.comment || '' }))
  }
  const changeReplyText = (replyId, text) => setReplyEditMap(prev => ({ ...prev, [replyId]: text }))
  const cancelEditReply = (replyId) => setReplyEditMap(prev => { const p={...prev}; delete p[replyId]; return p })
  const saveEditReply = async (commentId, replyId) => {
    try {
      const token = localStorage.getItem('admin_token') || ''
      await api.put(`/recipes/${id}/comments/${commentId}/replies/${replyId}`, { comment: replyEditMap[replyId] }, { headers: { Authorization: `Bearer ${token}` } })
      await refreshComments()
    } catch {}
    finally { cancelEditReply(replyId) }
  }
  const confirmDeleteReply = (commentId, replyId) => setReplyDeleteTarget({ commentId, replyId })
  const performDeleteReply = async () => {
    try {
      const token = localStorage.getItem('admin_token') || ''
      await api.delete(`/recipes/${id}/comments/${replyDeleteTarget.commentId}/replies/${replyDeleteTarget.replyId}`, { headers: { Authorization: `Bearer ${token}` } })
      await refreshComments()
    } catch {}
    finally { setReplyDeleteTarget(null) }
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Edit Recipe</h1>
      </div>
      {error && <div className="mb-3 text-danger">{error}</div>}
      <div className="grid grid-cols-1 gap-3">
        <label className="block">
          <span className="text-sm text-text">Title</span>
          <input name="title" value={form.title} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm text-text">Region</span>
          <input name="region" value={form.region} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm text-text">Image URL</span>
          <input name="image" value={form.image} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm text-text">Ingredients (one per line)</span>
          <textarea name="ingredients" rows={6} value={form.ingredients} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm text-text">Steps (one per line)</span>
          <textarea name="steps" rows={6} value={form.steps} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm text-text">Ingredient Substitutions (one per line)</span>
          <textarea name="substitutions" rows={4} value={form.substitutions} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </label>
      </div>
      <div className="mt-4 flex gap-2">
        <button disabled={saving} onClick={()=>setConfirmSave(true)} className="px-4 py-2 rounded bg-primary text-white">Save</button>
        <button onClick={()=>nav('/recipes')} className="px-4 py-2 rounded bg-gray-500 text-white">Cancel</button>
        <button onClick={()=>setConfirmDelete(true)} className="ml-auto px-4 py-2 rounded bg-danger text-white">Delete</button>
      </div>
      <ConfirmDialog
        open={confirmSave}
        title="Save Changes"
        message={`Save updates to recipe: ${form.title || '(untitled)'}?`}
        confirmLabel="Save"
        onCancel={()=>setConfirmSave(false)}
        onConfirm={onSaveConfirmed}
      />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete Recipe"
        message={`Delete recipe: ${form.title || '(untitled)'}? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onCancel={()=>setConfirmDelete(false)}
        onConfirm={onDeleteConfirmed}
      />

      {/* Comment management */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Comments (Manage)</h2>
        {comments.length === 0 ? (
          <div className="text-gray-600">No comments yet.</div>
        ) : (
          <ul className="space-y-3">
            {comments.map(c => (
              <li key={c._id} className="border rounded p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">{c.username}</div>
                    {editCommentId === c._id ? (
                      <textarea className="w-full border rounded p-2 mt-1" value={editCommentText} onChange={e=>setEditCommentText(e.target.value)} />
                    ) : (
                      <div className="mt-1">{c.comment}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editCommentId === c._id ? (
                      <>
                        <button onClick={saveEditComment} className="px-3 py-1 rounded bg-primary text-white">Save</button>
                        <button onClick={cancelEditComment} className="px-3 py-1 rounded bg-gray-600 text-white">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={()=>startEditComment(c)} className="px-3 py-1 rounded bg-primary text-white">Edit</button>
                        <button onClick={()=>confirmDeleteComment(c._id)} className="px-3 py-1 rounded bg-danger text-white">Delete</button>
                      </>
                    )}
                  </div>
                </div>
                {Array.isArray(c.replies) && c.replies.length > 0 && (
                  <div className="mt-3 pl-4 border-l">
                    {c.replies.map(r => (
                      <div key={r._id} className="flex items-start justify-between py-2">
                        <div className="flex-1">
                          <div className="text-sm text-gray-600">{r.username}</div>
                          {replyEditMap[r._id] != null ? (
                            <textarea className="w-full border rounded p-2 mt-1" value={replyEditMap[r._id]} onChange={e=>changeReplyText(r._id, e.target.value)} />
                          ) : (
                            <div className="mt-1">{r.comment}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {replyEditMap[r._id] != null ? (
                            <>
                              <button onClick={()=>saveEditReply(c._id, r._id)} className="px-3 py-1 rounded bg-primary text-white">Save</button>
                              <button onClick={()=>cancelEditReply(r._id)} className="px-3 py-1 rounded bg-gray-600 text-white">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={()=>startEditReply(c._id, r)} className="px-3 py-1 rounded bg-primary text-white">Edit</button>
                              <button onClick={()=>confirmDeleteReply(c._id, r._id)} className="px-3 py-1 rounded bg-danger text-white">Delete</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirm dialogs for comment/reply deletes */}
      <ConfirmDialog
        open={deleteCommentId != null}
        title="Delete Comment"
        message="Permanently delete this comment? This cannot be undone."
        confirmLabel="Delete"
        destructive
        onCancel={()=>setDeleteCommentId(null)}
        onConfirm={performDeleteComment}
      />
      <ConfirmDialog
        open={!!replyDeleteTarget}
        title="Delete Reply"
        message="Permanently delete this reply? This cannot be undone."
        confirmLabel="Delete"
        destructive
        onCancel={()=>setReplyDeleteTarget(null)}
        onConfirm={performDeleteReply}
      />
    </div>
  )
}

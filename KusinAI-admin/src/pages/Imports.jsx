import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const __raw = import.meta.env.VITE_API_URL || ''
const __trim = __raw.replace(/\/$/, '')
const __base = __trim.endsWith('/api') ? __trim : `${__trim}/api`
const api = axios.create({ baseURL: __base })

export default function Imports() {
  const { token } = useAuth()

  const [manualUrl, setManualUrl] = useState('')
  const [bulkUrls, setBulkUrls] = useState('')
  const [discover, setDiscover] = useState(true)

  const [log, setLog] = useState('')
  const [toast, setToast] = useState(null)
  const [busy, setBusy] = useState(false)

  const appendLog = (line) => setLog(l => `${l}${l? '\n':''}${line}`)

  const manualImport = async () => {
    if (!manualUrl.trim()) return
    setBusy(true)
    setLog('')
    try {
      appendLog(`→ Importing: ${manualUrl}`)
      const res = await api.post('/import/manual', { url: manualUrl.trim() }, { headers: { Authorization: `Bearer ${token}` } })
      const msg = `${res.data.message || 'Done'} — ${res.data.recipe?.title || ''}`
      appendLog(`✔ ${msg}`)
      setToast({ type: 'success', text: `Imported: ${res.data.recipe?.title || ''}` })
    } catch (e) {
      appendLog(`✖ Failed: ${e?.response?.data?.error || e.message}`)
    } finally {
      setBusy(false)
    }
  }

  const bulkImport = async () => {
    const urls = bulkUrls.split(/\n|,/).map(s=>s.trim()).filter(Boolean)
    if (urls.length === 0) return
    setBusy(true)
    setLog('')
    try {
      appendLog(`→ Bulk importing ${urls.length} URLs...`)
      const res = await api.post('/import/bulk', { urls }, { headers: { Authorization: `Bearer ${token}` } })
      res.data.results.forEach(r => {
        if (r.status === 'failed') appendLog(`✖ ${r.url} — ${r.error}`)
        else appendLog(`✔ ${r.status}: ${r.url} (id: ${r.recipeId})`)
      })
      setToast({ type: 'success', text: `Bulk import finished (${res.data.results.filter(r=>r.status!=='failed').length} ok)` })
    } catch (e) {
      appendLog(`✖ Failed: ${e?.response?.data?.error || e.message}`)
    } finally {
      setBusy(false)
    }
  }

  const runAutoUpdate = async () => {
    setBusy(true)
    setLog('')
    try {
      appendLog(`→ Running auto-update (discover=${discover})...`)
      const res = await api.post('/cron/auto-update', { discover }, { headers: { Authorization: `Bearer ${token}` } })
      const s = res.data.summary
      appendLog(`✔ Updated: ${s.updated}, Imported: ${s.imported}, Skipped: ${s.skipped}, Failed: ${s.failed}`)
        setToast({ type: 'success', text: `Auto-update OK: ${s.updated} updated, ${s.imported} imported` })
      if (s.errors?.length) {
        appendLog('Errors:')
        s.errors.slice(0,20).forEach(e => appendLog(`• ${e.url || e.stage}: ${e.error}`))
      }
    } catch (e) {
      appendLog(`✖ Failed: ${e?.response?.data?.error || e.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Recipe Imports</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Manual URL Import</h3>
          <input className="w-full p-2 border rounded mb-2" placeholder="https://..." value={manualUrl} onChange={e=>setManualUrl(e.target.value)} />
          <button disabled={busy} onClick={manualImport} className="px-4 py-2 rounded bg-primary text-white disabled:opacity-60">Import</button>
        </section>

        <section className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Bulk Multi-URL Import</h3>
          <textarea className="w-full p-2 border rounded mb-2" rows={8} placeholder={`One URL per line or comma-separated`}
            value={bulkUrls} onChange={e=>setBulkUrls(e.target.value)} />
          <button disabled={busy} onClick={bulkImport} className="px-4 py-2 rounded bg-primary text-white disabled:opacity-60">Run Bulk Import</button>
        </section>
      </div>

      <section className="bg-white rounded shadow p-4 mt-6">
        <h3 className="font-semibold mb-2">Auto-Update (Cron)</h3>
        <label className="inline-flex items-center gap-2 mb-2">
          <input type="checkbox" checked={discover} onChange={e=>setDiscover(e.target.checked)} />
          <span>Discover new recipes via sitemaps</span>
        </label>
        <div>
          <button disabled={busy} onClick={runAutoUpdate} className="px-4 py-2 rounded bg-primary text-white disabled:opacity-60">Run Auto-Update Now</button>
        </div>
      </section>

      <section className="bg-white rounded shadow p-4 mt-6">
        <h3 className="font-semibold mb-2">Logs</h3>
        <pre className="whitespace-pre-wrap text-sm p-3 bg-gray-50 rounded border min-h-[120px] max-h-96 overflow-auto">{log}</pre>
      </section>

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] px-4 py-2 rounded shadow ${toast.type==='success' ? 'bg-green-600 text-white' : 'bg-gray-700 text-white'}`}
             onAnimationEnd={()=>setToast(null)}>
          {toast.text}
        </div>
      )}
    </div>
  )
}

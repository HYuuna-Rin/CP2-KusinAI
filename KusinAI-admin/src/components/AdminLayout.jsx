import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-surface text-text">
      <header className="sticky top-0 bg-primary text-white shadow">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          <div className="font-semibold">KusinAI Admin</div>
          <div className="flex items-center gap-3">
            <span className="text-sm opacity-90">{user?.email}</span>
            <button className="px-3 py-1 rounded bg-white/10 hover:bg-white/20" onClick={logout}>Logout</button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-3 md:col-span-2">
          <nav className="flex flex-col gap-2">
            <NavLink to="/dashboard" className={({isActive}) => `px-3 py-2 rounded ${isActive? 'bg-white text-primary shadow':'hover:bg-white/70'}`}>Dashboard</NavLink>
            <NavLink to="/recipes" className={({isActive}) => `px-3 py-2 rounded ${isActive? 'bg-white text-primary shadow':'hover:bg-white/70'}`}>Recipes</NavLink>
            <NavLink to="/users" className={({isActive}) => `px-3 py-2 rounded ${isActive? 'bg-white text-primary shadow':'hover:bg-white/70'}`}>Users</NavLink>
            <NavLink to="/imports" className={({isActive}) => `px-3 py-2 rounded ${isActive? 'bg-white text-primary shadow':'hover:bg-white/70'}`}>Imports</NavLink>
          </nav>
        </aside>
        <main className="col-span-9 md:col-span-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

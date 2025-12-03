import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import Input from '../components/ui/input'
import Button from '../components/ui/button'

export default function Login() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      nav('/dashboard')
    } catch (err) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Background image */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none" aria-hidden="true">
        <img src="/assets/KusinAIBG.png" alt="background" className="w-full h-full object-cover" style={{ opacity: 0.18 }} />
      </div>
      {/* Top logo bar */}
      <div className="flex justify-between items-center p-4 relative z-10">
        <div onClick={()=>nav('/dashboard')} className="flex items-center gap-2 cursor-pointer select-none" style={{ fontFamily: 'Poppins, Montserrat, Quicksand, Arial, sans-serif', fontWeight:700 }}>
          <img src="/assets/KusinAILogo.png" alt="logo" className="h-10 w-10 object-contain" />
          <span className="bg-gradient-to-r from-leaf/90 to-accent/90 bg-clip-text text-transparent text-xl tracking-wide">KusinAI Admin</span>
        </div>
      </div>
      <div className="flex-grow flex justify-center items-center relative z-10 p-4">
        <form onSubmit={onSubmit} className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full max-w-md space-y-5 border border-white/40">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-leaf bg-clip-text text-transparent text-center">Admin Sign In</h1>

          {error && (
            <div className="bg-danger/10 border border-danger text-danger px-4 py-2 rounded text-center">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-text mb-1 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoComplete="username"
            />
          </div>

          <div className="relative">
            <label className="text-sm text-text mb-1 block">Password</label>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e=>setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-[34px] text-leaf"
              onClick={() => setShowPassword(v=>!v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <Button disabled={loading} variant="primary" size="lg" className="w-full">
            {loading? 'Signing in...' : 'Sign In'}
          </Button>
          <p className="text-[11px] text-center text-gray-500 pt-2">Authorized personnel only. All actions are logged.</p>
        </form>
      </div>
    </div>
  )
}

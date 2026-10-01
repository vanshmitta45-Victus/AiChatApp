import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react'

export default function EnterpriseLoginModal({ isOpen, onClose }) {
  const { login } = useAuth()
  const [identifier, setIdentifier] = useState('vansh')
  const [password, setPassword] = useState('1234')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const enterpriseProfiles = [
    {
      username: 'vansh',
      name: 'Vansh Mittal',
      role: 'ADMIN',
      dept: 'Executive Leadership',
      color: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10'
    },
    {
      username: 'manager',
      name: 'Sarah Jenkins',
      role: 'MANAGER',
      dept: 'Engineering Management',
      color: 'border-purple-500/40 text-purple-300 bg-purple-500/10'
    },
    {
      username: 'lead',
      name: 'Alex Rivera',
      role: 'TEAM_LEADER',
      dept: 'Core Engineering',
      color: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10'
    },
    {
      username: 'staff',
      name: 'Sam Taylor',
      role: 'STAFF',
      dept: 'Product Operations',
      color: 'border-slate-500/40 text-slate-300 bg-slate-500/10'
    }
  ]

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!identifier.trim() || !password) {
      setError('Please provide both username/email and password.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await login(identifier.trim(), password)
      if (onClose) onClose()
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const selectAccount = (profile) => {
    setIdentifier(profile.username)
    setPassword('1234')
    setError('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900/95 border border-white/15 rounded-3xl p-6 shadow-2xl overflow-hidden specular-top">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 bg-indigo-600/30 blur-3xl pointer-events-none rounded-full" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-1.5">
                Enterprise Identity Access
              </h2>
              <p className="text-xs text-slate-400 font-mono">RBAC Security Gateway</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Username or Corporate Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. vansh"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-white text-xs placeholder:text-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 text-white text-xs placeholder:text-slate-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-medium text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Enterprise Profiles Filler */}
        <div className="mt-5 pt-4 border-t border-white/10 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Authorized Enterprise Accounts
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Password: 1234</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {enterpriseProfiles.map((p) => {
              const isSelected = identifier === p.username
              return (
                <button
                  key={p.username}
                  type="button"
                  onClick={() => selectAccount(p)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-400/50 ring-1 ring-indigo-500/30'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white truncate">{p.username}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${p.color}`}>
                      {p.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{p.name}</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

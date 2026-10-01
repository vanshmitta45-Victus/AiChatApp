import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-400 font-mono">Authenticating session...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = role || 'STAFF'
    const isAllowed = allowedRoles.includes(userRole)

    if (!isAllowed) {
      return (
        <div className="h-full flex items-center justify-center p-6">
          <div className="glass-panel-elevated bg-slate-900/80 border border-rose-500/20 max-w-md w-full p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center shadow-lg shadow-rose-500/10">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">403 Forbidden Access</h2>
              <p className="text-xs text-slate-400 mt-1">
                This endpoint and view is restricted strictly to <span className="text-indigo-400 font-semibold">{allowedRoles.join(' and ')}</span> roles. Your current role is <span className="text-rose-400 font-semibold">{userRole}</span>.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      )
    }
  }

  return children
}

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import EnterpriseLoginModal from '../auth/EnterpriseLoginModal'
import {
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  Building2,
  Check,
  Shield,
  LogOut,
  AtSign,
  UserCheck,
  Lock,
  UserCog,
  CheckCircle2,
  KeyRound
} from 'lucide-react'

export default function SpatialTopBar({ onOpenCommandPalette }) {
  const { user, role, isAdminOrManager, logout } = useAuth()
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [activeWorkspace, setActiveWorkspace] = useState('Enterprise AI HQ')

  const profileRef = useRef(null)
  const workspaceRef = useRef(null)
  const notifRef = useRef(null)

  // Mock mention notifications
  const [mentions] = useState([
    { id: 1, sender: 'Alex Rivera (Lead)', content: 'Assigned NEX-104 task to you in Core Engineering', time: '10m ago', unread: true },
    { id: 2, sender: 'System Audit', content: 'Immutable SHA-256 block anchored successfully', time: '1h ago', unread: true },
  ])

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }
      if (workspaceRef.current && !workspaceRef.current.contains(event.target)) {
        setWorkspaceMenuOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const workspaces = [
    { name: 'Enterprise AI HQ', id: 'hq', desc: 'Main corporate workspace' },
    { name: 'Core Engineering', id: 'eng', desc: 'Sprints, repositories, PRs' },
    { name: 'Operations & IT', id: 'ops', desc: 'Infrastructure & Helpdesk' },
  ]

  const getRoleBadgeStyle = (userRole) => {
    switch (userRole) {
      case 'ADMIN':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
      case 'MANAGER':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'TEAM_LEADER':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    }
  }

  return (
    <>
      <header className="relative z-20 mb-4">
        <div className="glass-panel bg-slate-900/70 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-2xl px-4 py-2.5 flex items-center justify-between gap-4">
          {/* Left: Workspace Switcher */}
          <div className="relative shrink-0" ref={workspaceRef}>
            <button
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-pill hover:bg-white/10 text-slate-200 transition-all text-xs font-medium"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium tracking-tight">{activeWorkspace}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {workspaceMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 glass-panel-elevated bg-slate-900/95 border border-white/15 rounded-xl p-1.5 shadow-2xl z-40 animate-fadeIn">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Workspaces
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws.name)
                      setWorkspaceMenuOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                      activeWorkspace === ws.name
                        ? 'bg-indigo-600/30 text-white font-medium'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <div>{ws.name}</div>
                      <div className="text-[10px] text-slate-400">{ws.desc}</div>
                    </div>
                    {activeWorkspace === ws.name && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Center: Universal Command Bar Trigger (Ctrl+K) */}
          <div className="flex-1 max-w-xl">
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-slate-400 text-xs transition-all duration-200 group active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-3.5 h-3.5 text-indigo-400 group-hover:text-cyan-400 transition-colors" />
                <span className="truncate">Type <span className="text-slate-200 font-medium">Ctrl + K</span> to search or run commands...</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <kbd className="px-1.5 py-0.5 text-[10px] bg-black/40 border border-white/10 rounded text-slate-400 font-mono">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>

          {/* Right: Notifications & Profile Capsule */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl glass-pill hover:bg-white/10 text-slate-300 transition-all"
                title="Mentions & Notifications"
              >
                <Bell className="w-4 h-4" />
                {mentions.some(m => m.unread) && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-900 animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 glass-panel-elevated bg-slate-900/95 border border-white/15 rounded-2xl p-2.5 shadow-2xl z-40 animate-fadeIn">
                  <div className="flex items-center justify-between px-2 py-1.5 mb-1 border-b border-white/10">
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Workspace Alerts</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {mentions.length} unread
                    </span>
                  </div>

                  <div className="space-y-1">
                    {mentions.map((m) => (
                      <div
                        key={m.id}
                        className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] transition-colors cursor-pointer text-xs"
                      >
                        <div className="flex items-center justify-between text-slate-200 font-medium">
                          <span>{m.sender}</span>
                          <span className="text-[10px] text-slate-400">{m.time}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5">{m.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Current User Profile Capsule or Sign In */}
            {!user ? (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            ) : (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-full glass-pill hover:bg-white/10 transition-all text-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
                    {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </div>
                  <span className="text-slate-200 font-medium max-w-[100px] truncate hidden sm:inline">
                    {user?.fullName || user?.username || 'User'}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(role)}`}>
                    {role || 'STAFF'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Profile Account Details Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-72 glass-panel-elevated bg-slate-900/95 border border-white/15 rounded-2xl p-3 shadow-2xl z-40 animate-fadeIn specular-top">
                    {/* User Summary */}
                    <div className="pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                          {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-semibold text-white truncate">{user?.fullName || 'System User'}</div>
                          <div className="text-[11px] text-slate-400 truncate font-mono">@{user?.username || 'username'}</div>
                        </div>
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getRoleBadgeStyle(role)}`}>
                          Role: {role || 'STAFF'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10 font-medium">
                          {user?.department || 'Operations'}
                        </span>
                      </div>
                    </div>

                    {/* Security & Access Status */}
                    <div className="py-2.5 border-b border-white/10 space-y-1.5 text-[11px] text-slate-300">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Session Status</span>
                        </span>
                        <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-mono">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>JWT Active</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>RBAC Level</span>
                        </span>
                        <span className="text-slate-200 font-mono text-[10px]">
                          {isAdminOrManager ? 'Elevated Access' : 'Standard Access'}
                        </span>
                      </div>
                    </div>

                    {/* Account Switcher / Sign Out */}
                    <div className="pt-2 space-y-1">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false)
                          setIsLoginModalOpen(true)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/10 transition-colors"
                      >
                        <UserCog className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Switch Enterprise Account</span>
                      </button>
                      <button
                        onClick={() => {
                          logout()
                          setProfileMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Enterprise Login Modal */}
      <EnterpriseLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  )
}

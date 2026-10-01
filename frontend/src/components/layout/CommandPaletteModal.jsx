import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Search,
  LayoutDashboard,
  Kanban,
  FolderKanban,
  Users,
  MessageSquare,
  StickyNote,
  FileText,
  FileSearch,
  Code2,
  ShieldCheck,
  History,
  Settings,
  PlusCircle,
  UserPlus,
  ArrowRight,
  Sparkles,
  Command,
  X,
  Bot
} from 'lucide-react'

export default function CommandPaletteModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { user, isAdminOrManager, quickLogin } = useAuth()

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Key navigation within the palette
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const navigationItems = [
    { id: 'dash', label: 'Dashboard', path: '/', icon: LayoutDashboard, category: 'Navigation', shortcut: 'G D' },
    { id: 'chat', label: 'Spatial Chat Hub', path: '/chat', icon: MessageSquare, category: 'Navigation', shortcut: 'G C' },
    { id: 'tasks', label: 'Kanban Task Board', path: '/tasks', icon: Kanban, category: 'Navigation', shortcut: 'G T' },
    { id: 'notes', label: 'Google Keep Notes', path: '/notes', icon: StickyNote, category: 'Navigation', shortcut: 'G N' },
    { id: 'projects', label: 'Projects Registry', path: '/projects', icon: FolderKanban, category: 'Navigation', shortcut: 'G P' },
    { id: 'teams', label: 'Teams & Directory', path: '/teams', icon: Users, category: 'Navigation', shortcut: 'G M' },
    { id: 'ai-chat', label: 'AI Workspace Chatbot (Agent Loop)', path: '/ai-chat', icon: Bot, category: 'AI Suite', shortcut: 'G B' },
    { id: 'docs', label: 'AI Document Analyzer (RAG)', path: '/documents', icon: FileSearch, category: 'AI Suite', shortcut: 'G A' },
    { id: 'resume', label: 'AI Resume Studio', path: '/resumes', icon: FileText, category: 'AI Suite', shortcut: 'G R' },
    { id: 'code', label: 'AI Code & PR Inspector', path: '/code', icon: Code2, category: 'AI Suite', shortcut: 'G I' },
    ...(isAdminOrManager ? [
      { id: 'admin-users', label: 'Identity & User Management', path: '/admin/users', icon: ShieldCheck, category: 'Administration', shortcut: 'G U' },
      { id: 'admin-audit', label: 'Immutable Audit Ledger', path: '/admin/audit', icon: History, category: 'Administration', shortcut: 'G L' }
    ] : []),
    { id: 'settings', label: 'Workspace Settings', path: '/settings', icon: Settings, category: 'System', shortcut: 'G S' },
  ]

  const actionItems = [
    {
      id: 'act-task',
      label: 'Create New Kanban Task',
      category: 'Quick Actions',
      icon: PlusCircle,
      action: () => {
        navigate('/tasks?create=true')
        onClose()
      }
    },
    {
      id: 'act-note',
      label: 'Compose Keep-Style Note',
      category: 'Quick Actions',
      icon: StickyNote,
      action: () => {
        navigate('/notes?create=true')
        onClose()
      }
    },
    ...(isAdminOrManager ? [
      {
        id: 'act-user',
        label: 'Provision New User Identity',
        category: 'Quick Actions',
        icon: UserPlus,
        action: () => {
          navigate('/admin/users?create=true')
          onClose()
        }
      }
    ] : []),
    {
      id: 'act-role-admin',
      label: 'Switch Identity to Admin (Vansh Mittal)',
      category: 'Role Switcher',
      icon: ShieldCheck,
      action: async () => {
        await quickLogin('vansh', '1234')
        onClose()
      }
    },
    {
      id: 'act-role-manager',
      label: 'Switch Identity to Manager (Engineering Manager)',
      category: 'Role Switcher',
      icon: ShieldCheck,
      action: async () => {
        await quickLogin('manager@company.com', 'password123')
        onClose()
      }
    },
    {
      id: 'act-role-lead',
      label: 'Switch Identity to Team Leader (Alex Lead)',
      category: 'Role Switcher',
      icon: Users,
      action: async () => {
        await quickLogin('leader@company.com', 'password123')
        onClose()
      }
    },
    {
      id: 'act-role-staff',
      label: 'Switch Identity to Staff (Sam Staff)',
      category: 'Role Switcher',
      icon: Users,
      action: async () => {
        await quickLogin('staff@company.com', 'password123')
        onClose()
      }
    }
  ]

  const allItems = [...navigationItems, ...actionItems]
  const filtered = allItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (item) => {
    if (item.action) {
      item.action()
    } else if (item.path) {
      navigate(item.path)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl glass-panel-elevated bg-slate-900/80 border border-white/15 shadow-2xl rounded-2xl overflow-hidden z-10 animate-scaleUp">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-white/10">
          <Search className="w-5 h-5 text-indigo-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or jump to workspace..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex(prev => (prev + 1) % (filtered.length || 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex(prev => (prev - 1 + filtered.length) % (filtered.length || 1))
              } else if (e.key === 'Enter' && filtered[selectedIndex]) {
                e.preventDefault()
                handleSelect(filtered[selectedIndex])
              }
            }}
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-base focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-slate-400 bg-white/5 border border-white/10 rounded">
              ESC to exit
            </kbd>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Command className="w-8 h-8 mx-auto mb-2 text-slate-500 opacity-60" />
              <p className="text-sm">No commands matching "{query}"</p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon
              const isSelected = idx === selectedIndex
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-indigo-600/25 border border-indigo-500/40 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-slate-400">{item.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-[11px] text-slate-400 bg-black/40 border border-white/10 rounded">
                        {item.shortcut}
                      </kbd>
                    )}
                    {isSelected && <ArrowRight className="w-4 h-4 text-indigo-400" />}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-black/40 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded">↑</kbd>
              <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">↵</kbd>
              <span>Select</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-indigo-400/80">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Role: {user?.role || 'STAFF'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

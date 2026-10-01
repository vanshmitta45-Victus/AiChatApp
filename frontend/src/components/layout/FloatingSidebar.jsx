import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Kanban,
  FolderKanban,
  Users,
  MessageSquare,
  StickyNote,
  FileSearch,
  FileText,
  Code2,
  ShieldCheck,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bot,
  Activity,
  Wrench
} from 'lucide-react'

export default function FloatingSidebar({ isCollapsed, onToggleCollapse }) {
  const { user, isAdminOrManager, role } = useAuth()

  const workspaceNav = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Task Board', path: '/tasks', icon: Kanban },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Teams', path: '/teams', icon: Users },
    { label: 'Chat', path: '/chat', icon: MessageSquare, badge: 'Live' },
    { label: 'Keep Notes', path: '/notes', icon: StickyNote },
  ]

  const aiSuiteNav = [
    { label: 'AI Chatbot', path: '/ai-chat', icon: Bot, badge: 'Agent' },
    { label: 'Doc Analyzer', path: '/documents', icon: FileSearch, badge: 'RAG' },
    { label: 'Resume Studio', path: '/resumes', icon: FileText },
    { label: 'Code Inspector', path: '/code', icon: Code2 },
    { label: 'AI QA Harness', path: '/ai-eval', icon: Activity, badge: 'QA' },
    { label: 'Test Healer', path: '/self-heal', icon: Wrench, badge: 'Auto' },
  ]

  const adminNav = [
    ...(isAdminOrManager ? [
      { label: 'Identity Management', path: '/admin/users', icon: ShieldCheck, highlight: true },
      { label: 'Audit History', path: '/admin/audit', icon: History }
    ] : []),
    { label: 'Settings', path: '/settings', icon: Settings },
  ]

  return (
    <aside
      className={`relative z-30 transition-all duration-300 ease-in-out select-none flex flex-col ${
        isCollapsed ? 'w-[76px]' : 'w-[260px]'
      }`}
    >
      <div className="h-full glass-panel-elevated bg-slate-900/60 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-3xl p-3 flex flex-col justify-between overflow-hidden">
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between px-2 py-3 mb-2 border-b border-white/10">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950/80 rounded-[15px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-300" />
                </div>
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <div className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
                    Spatial AI <Sparkles className="w-3 h-3 text-cyan-400 inline" />
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">Workspace OS</div>
                </div>
              )}
            </div>

            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Sections */}
          <div className="space-y-5 overflow-y-auto max-h-[calc(100vh-210px)] pr-1">
            {/* 1. Workspace Section */}
            <div>
              {!isCollapsed && (
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Workspace
                </div>
              )}
              <div className="space-y-1">
                {workspaceNav.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </div>
            </div>

            {/* 2. AI Suite Section */}
            <div>
              {!isCollapsed && (
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400/90 flex items-center gap-1">
                  <span>AI Suite</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                </div>
              )}
              <div className="space-y-1">
                {aiSuiteNav.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    isCollapsed={isCollapsed}
                    glow={true}
                  />
                ))}
              </div>
            </div>

            {/* 3. Admin Section (Conditional on ADMIN/MANAGER) */}
            <div>
              {!isCollapsed && (
                <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400/90 flex items-center justify-between">
                  <span>Administration</span>
                  {isAdminOrManager && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                      {role}
                    </span>
                  )}
                </div>
              )}
              <div className="space-y-1">
                {adminNav.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer User Capsule */}
        <div className="pt-2 border-t border-white/10">
          <div
            className={`flex items-center gap-2.5 p-2 rounded-2xl bg-white/[0.03] border border-white/5 ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
              </div>

              {!isCollapsed && (
                <div className="truncate">
                  <div className="text-xs font-medium text-white truncate">
                    {user?.fullName || user?.username || 'Authenticated User'}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize truncate">
                    {user?.department || 'Workspace Member'}
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                isAdminOrManager
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
              }`}>
                {role || 'STAFF'}
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

function NavItem({ item, isCollapsed, glow }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 ${
          isActive
            ? 'glass-pill-active text-white font-medium shadow-lg'
            : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] active:scale-[0.97]'
        } ${isCollapsed ? 'justify-center px-0' : ''}`
      }
      title={isCollapsed ? item.label : undefined}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4] transition-all" />
          )}

          <div className="relative shrink-0">
            <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${glow ? 'text-indigo-400' : ''}`} />
          </div>

          {!isCollapsed && (
            <div className="flex items-center justify-between w-full overflow-hidden">
              <span className="text-xs truncate tracking-tight">{item.label}</span>
              {item.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-semibold">
                  {item.badge}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </NavLink>
  )
}

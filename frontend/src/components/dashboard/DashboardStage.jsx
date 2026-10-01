import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  MessageSquare,
  Kanban,
  StickyNote,
  FileSearch,
  FileText,
  Code2,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Users,
  Activity,
  Layers,
  Radio
} from 'lucide-react'

export default function DashboardStage() {
  const { user, role, isAdminOrManager } = useAuth()

  const stats = [
    { label: 'Role Permissions', value: role || 'STAFF', icon: ShieldCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30' },
    { label: 'Chat Topologies', value: '4 Active', desc: '1:1, Mesh, Broadcast, Helpdesk', icon: Radio, color: 'text-cyan-400', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30' },
    { label: 'AI Suite Status', value: 'Online', desc: 'Ollama Llama-3.2 & RAG Ready', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
    { label: 'Security Chain', value: 'RBAC Active', desc: 'Spring Boot 3 + Method Security', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  ]

  const quickLaunch = [
    { title: 'Spatial Chat Hub', desc: 'STOMP real-time messaging with 6 media types, @mentions & topology controls', path: '/chat', icon: MessageSquare, gradient: 'from-blue-600/30 via-indigo-600/20 to-transparent', glow: 'text-blue-400', badge: 'Realtime' },
    { title: 'Google Keep Notes', desc: 'Masonry cards with vivid color palettes, pin states, and dynamic tag filters', path: '/notes', icon: StickyNote, gradient: 'from-amber-600/30 via-orange-600/20 to-transparent', glow: 'text-amber-400', badge: 'Masonry' },
    { title: 'Kanban Task Board', desc: 'Jira-style task workflow: 6 lanes from Backlog to Done with persistent state', path: '/tasks', icon: Kanban, gradient: 'from-cyan-600/30 via-blue-600/20 to-transparent', glow: 'text-cyan-400', badge: 'Jira UI' },
    { title: 'Document Analyzer', desc: 'RAG knowledge engine with Apache PDFBox text extraction & pgvector similarity', path: '/documents', icon: FileSearch, gradient: 'from-purple-600/30 via-indigo-600/20 to-transparent', glow: 'text-purple-400', badge: 'RAG' },
    { title: 'Resume Studio', desc: 'ATS score evaluation, line-item refactor critique, and instant ATS PDF export', path: '/resumes', icon: FileText, gradient: 'from-pink-600/30 via-rose-600/20 to-transparent', glow: 'text-pink-400', badge: 'ATS PDF' },
    { title: 'Code Inspector', desc: 'Automated syntax & vulnerability review on code or PR diffs via local Ollama LLM', path: '/code', icon: Code2, gradient: 'from-emerald-600/30 via-teal-600/20 to-transparent', glow: 'text-emerald-400', badge: 'LLM' },
  ]

  const systemTelemetry = [
    { name: 'Core Engine', status: 'Spring Boot 3.4.3 (Java 21)', live: true },
    { name: 'Vector DB', status: 'PostgreSQL pgvector (768d)', live: true },
    { name: 'Messaging', status: 'STOMP over WebSocket', live: true },
    { name: 'AI Models', status: 'Llama 3.2 + nomic-embed-text', live: true }
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* Welcome Hero Banner with Spatial Radial Glare */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-elevated p-6 md:p-8 border border-white/15 bg-gradient-to-r from-indigo-950/50 via-slate-900/60 to-slate-950/50 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/20 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold tracking-wide flex items-center gap-1.5 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
                <Sparkles className="w-3 h-3 text-cyan-300 animate-pulse" />
                Spatial Computing Workspace
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 font-mono border border-white/10">
                v2.0-spatial
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, <span className="bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">{user?.fullName || 'Operator'}</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300/80 mt-1.5 max-w-2xl leading-relaxed">
              Spatial Computing AI Suite connecting real-time STOMP messaging, Google Keep notes, Jira Kanban boards, and local vector RAG intelligence.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isAdminOrManager && (
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Identity Panel</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* System Live Telemetry Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {systemTelemetry.map((t, idx) => (
          <div
            key={idx}
            className="glass-panel-subtle px-3.5 py-2.5 rounded-2xl border border-white/10 flex items-center justify-between"
          >
            <div className="overflow-hidden">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{t.name}</div>
              <div className="text-xs font-semibold text-slate-200 truncate mt-0.5">{t.status}</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] shrink-0" />
          </div>
        ))}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon
          return (
            <div
              key={idx}
              className={`glass-card p-4 rounded-2xl flex items-center justify-between transition-all hover:bg-white/[0.05] border ${s.border}`}
            >
              <div>
                <div className="text-[11px] font-medium text-slate-400">{s.label}</div>
                <div className="text-xl font-extrabold text-white mt-0.5">{s.value}</div>
                {s.desc && <div className="text-[10px] text-slate-400 truncate mt-0.5">{s.desc}</div>}
              </div>
              <div className={`p-3 rounded-2xl ${s.bg} ${s.color} shadow-sm`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Workspace Quick Launchers */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Spatial Subsystems & Modules
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Click card to launch stage</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLaunch.map((app, idx) => {
            const Icon = app.icon
            return (
              <Link
                key={idx}
                to={app.path}
                className="group glass-card p-5 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${app.gradient} rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none`} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 text-slate-100 shadow-md group-hover:scale-105 transition-transform">
                      <Icon className={`w-5 h-5 ${app.glow}`} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-slate-300">
                        {app.badge}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {app.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {app.desc}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import {
  FolderKanban,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BarChart3
} from 'lucide-react'

const INITIAL_PROJECTS = [
  {
    id: 'PRJ-1',
    name: 'Spatial Workspace Core Engine',
    key: 'SPACE',
    lead: 'Alex Lead',
    status: 'ACTIVE',
    progress: 78,
    tasksCount: 24,
    description: 'Next-gen enterprise collaboration operating system with multi-topology STOMP messaging and pgvector AI suite.',
    dueDate: '2026-10-15',
    color: 'from-indigo-600 to-cyan-500'
  },
  {
    id: 'PRJ-2',
    name: 'Ollama LLM & GitHub Review Automation',
    key: 'AUTO',
    lead: 'Sam Staff',
    status: 'ACTIVE',
    progress: 60,
    tasksCount: 16,
    description: 'Local private intelligence pipeline with AST bug fixing, automated PR reviews, and OpenPDF CV generation.',
    dueDate: '2026-10-30',
    color: 'from-emerald-600 to-teal-500'
  },
  {
    id: 'PRJ-3',
    name: 'SOC2 & RBAC Enterprise Compliance Audit',
    key: 'AUDIT',
    lead: 'Engineering Manager',
    status: 'PLANNED',
    progress: 25,
    tasksCount: 12,
    description: 'Cryptographic immutable state diff audit logging and method-level Spring Security permission hardening.',
    dueDate: '2026-11-15',
    color: 'from-purple-600 to-pink-500'
  }
]

export default function ProjectsStage() {
  const [projects] = useState(INITIAL_PROJECTS)
  const [search, setSearch] = useState('')

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase()) ||
    p.lead.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <FolderKanban className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">Project Portfolios</h1>
          </div>
          <p className="text-xs text-slate-400">
            Sprint velocity tracking, cross-functional milestones, and delivery roadmaps
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((prj) => (
          <div
            key={prj.id}
            className="group glass-panel-subtle bg-slate-900/40 hover:bg-slate-900/70 border border-white/10 hover:border-indigo-500/40 rounded-2xl p-5 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 font-bold">
                  {prj.key}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  prj.status === 'ACTIVE'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
                }`}>
                  {prj.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                {prj.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                {prj.description}
              </p>
            </div>

            <div className="mt-5 space-y-3 pt-4 border-t border-white/5">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 text-[11px]">Sprint Completion</span>
                  <span className="font-mono text-cyan-400 font-bold text-[11px]">{prj.progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${prj.color}`}
                    style={{ width: `${prj.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Lead: {prj.lead}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{prj.dueDate}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

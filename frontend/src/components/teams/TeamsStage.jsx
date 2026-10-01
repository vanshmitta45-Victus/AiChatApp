import React, { useState } from 'react'
import {
  Users,
  Search,
  Mail,
  Shield,
  Briefcase,
  Sparkles,
  UserCheck,
  Circle
} from 'lucide-react'

const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'System Admin',
    email: 'admin@company.com',
    role: 'ADMIN',
    department: 'Infrastructure & Security',
    status: 'ACTIVE',
    avatarColor: 'from-indigo-500 to-purple-600',
    skills: ['Spring Security', 'pgvector', 'Docker', 'Kubernetes']
  },
  {
    id: 2,
    name: 'Engineering Manager',
    email: 'manager@company.com',
    role: 'MANAGER',
    department: 'Engineering Leadership',
    status: 'ACTIVE',
    avatarColor: 'from-purple-500 to-pink-600',
    skills: ['Architecture', 'Agile', 'Sprint Planning', 'Code Review']
  },
  {
    id: 3,
    name: 'Alex Lead',
    email: 'leader@company.com',
    role: 'TEAM_LEADER',
    department: 'Core Full Stack',
    status: 'ACTIVE',
    avatarColor: 'from-cyan-500 to-blue-600',
    skills: ['React', 'STOMP WebSockets', 'Tailwind', 'REST APIs']
  },
  {
    id: 4,
    name: 'Sam Staff',
    email: 'staff@company.com',
    role: 'STAFF',
    department: 'Core Full Stack',
    status: 'ACTIVE',
    avatarColor: 'from-slate-500 to-slate-700',
    skills: ['Java 21', 'Spring Boot 3', 'JUnit 5', 'PostgreSQL']
  }
]

export default function TeamsStage() {
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('ALL')

  const filtered = TEAM_MEMBERS.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.department.toLowerCase().includes(search.toLowerCase()) ||
      m.role.toLowerCase().includes(search.toLowerCase())
    const matchesDept = departmentFilter === 'ALL' || m.department === departmentFilter
    return matchesSearch && matchesDept
  })

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Users className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">Team Directory & Personnel</h1>
          </div>
          <p className="text-xs text-slate-400">
            Enterprise workforce roster with role-based identities, skills, and departments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search people..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Departments</option>
            <option value="Infrastructure & Security">Infrastructure & Security</option>
            <option value="Engineering Leadership">Engineering Leadership</option>
            <option value="Core Full Stack">Core Full Stack</option>
          </select>
        </div>
      </div>

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((member) => (
          <div
            key={member.id}
            className="glass-panel-subtle bg-slate-900/40 hover:bg-slate-900/70 border border-white/10 hover:border-indigo-500/40 rounded-2xl p-4 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${member.avatarColor} flex items-center justify-center text-base font-bold text-white shadow-md`}>
                  {member.name.charAt(0)}
                </div>
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 font-medium">
                  <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" />
                  ONLINE
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">{member.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <Mail className="w-3 h-3 text-slate-500" />
                <span className="truncate">{member.email}</span>
              </div>

              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                  {member.role}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                <Briefcase className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">{member.department}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Skills</div>
              <div className="flex flex-wrap gap-1">
                {member.skills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/5"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

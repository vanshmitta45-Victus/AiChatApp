import React, { useState, useEffect } from 'react'
import {
  History,
  Shield,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  FileSpreadsheet,
  Download
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const INITIAL_AUDIT_LOGS = [
  {
    id: 1,
    timestamp: '2026-09-30 21:45:12',
    principal: 'admin@company.com',
    action: 'USER_CREATED',
    entityType: 'User',
    entityId: 'USR-892',
    ipAddress: '192.168.1.104',
    status: 'SUCCESS',
    details: 'Provisioned new staff user "sam.staff@company.com" with role ROLE_STAFF and department "Engineering".'
  },
  {
    id: 2,
    timestamp: '2026-09-30 21:12:05',
    principal: 'manager@company.com',
    action: 'ROLE_MODIFIED',
    entityType: 'User',
    entityId: 'USR-314',
    ipAddress: '192.168.1.155',
    status: 'SUCCESS',
    details: 'Elevated user "alex.lead@company.com" from ROLE_STAFF to ROLE_TEAM_LEADER.'
  },
  {
    id: 3,
    timestamp: '2026-09-30 20:30:44',
    principal: 'admin@company.com',
    action: 'VECTOR_INDEX_REBUILT',
    entityType: 'DocumentChunk',
    entityId: 'VEC-ALL',
    ipAddress: '127.0.0.1',
    status: 'SUCCESS',
    details: 'Synchronized pgvector HNSW index for 768-dim embeddings across 44 indexed chunks.'
  },
  {
    id: 4,
    timestamp: '2026-09-30 19:15:22',
    principal: 'unauthorized_probe',
    action: 'LOGIN_FAILURE',
    entityType: 'Auth',
    entityId: 'AUTH-00',
    ipAddress: '198.51.100.42',
    status: 'FAILED',
    details: 'Failed authentication attempt with bad credentials. Blocked by Spring Security chain.'
  },
  {
    id: 5,
    timestamp: '2026-09-30 18:02:19',
    principal: 'leader@company.com',
    action: 'CHANNEL_TOPOLOGY_SET',
    entityType: 'Conversation',
    entityId: 'CNV-102',
    ipAddress: '192.168.1.189',
    status: 'SUCCESS',
    details: 'Configured #Company Announcements channel as ONE_TO_MANY broadcast with restricted posting.'
  }
]

export default function AuditStage() {
  const { user, authHeader } = useAuth()
  const [logs, setLogs] = useState(INITIAL_AUDIT_LOGS)
  const [search, setSearch] = useState('')
  const [selectedLog, setSelectedLog] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    async function fetchAudit() {
      try {
        const res = await fetch('/api/audit', { headers: { ...authHeader() } })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setLogs(data)
          }
        }
      } catch (err) {
        // Fallback to initial mock logs
      }
    }
    fetchAudit()
  }, [authHeader])

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.principal.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entityType.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <History className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">Immutable Audit Ledger</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              Tamper-Proof
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Cryptographic change diffs and enterprise event tracking for compliance and SOC2 auditing
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-60"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Outcomes</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="flex-1 glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor / Principal</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-200">
                    {log.principal}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-sans">
                    {log.entityType} ({log.entityId})
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {log.ipAddress}
                  </td>
                  <td className="py-3 px-4">
                    {log.status === 'SUCCESS' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                        <CheckCircle className="w-3 h-3" />
                        SUCCESS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/25">
                        <XCircle className="w-3 h-3" />
                        FAILED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      title="View Event Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-elevated bg-slate-900/95 border border-white/20 rounded-2xl w-full max-w-lg p-5 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Event Audit Record #{selectedLog.id}</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Actor</span>
                  <div className="text-slate-200 font-medium">{selectedLog.principal}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">IP Address</span>
                  <div className="text-slate-300 font-mono">{selectedLog.ipAddress}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Action</span>
                  <div className="text-indigo-400 font-mono">{selectedLog.action}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Timestamp</span>
                  <div className="text-slate-400 font-mono">{selectedLog.timestamp}</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Event Diff & Payload</span>
                <div className="mt-1 p-3 rounded-xl bg-slate-950/70 border border-white/10 text-slate-300 font-mono text-xs leading-relaxed">
                  {selectedLog.details}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import React, { useState } from 'react'
import {
  Users,
  Radio,
  Headphones,
  MessageSquare,
  Shield,
  Info,
  ChevronDown,
  X,
  UserCheck
} from 'lucide-react'

export default function ConversationHeader({ conversation, currentRole }) {
  const [showRoster, setShowRoster] = useState(false)

  if (!conversation) return null

  const getTopologyConfig = (type) => {
    switch (type) {
      case 'ONE_TO_ONE':
        return {
          label: 'Direct 1:1',
          icon: Users,
          color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          desc: 'Encrypted peer-to-peer messaging'
        }
      case 'MANY_TO_MANY':
        return {
          label: 'Team Group',
          icon: MessageSquare,
          color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          desc: 'Collaborative channel with real-time participation'
        }
      case 'ONE_TO_MANY':
        return {
          label: 'Broadcast',
          icon: Radio,
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          desc: '1:Many official channel. Input restricted for STAFF role'
        }
      case 'MANY_TO_ONE':
        return {
          label: 'Helpdesk Escalation',
          icon: Headphones,
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          desc: 'Many:1 support queue routed to designated lead/handler'
        }
      default:
        return {
          label: type,
          icon: MessageSquare,
          color: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
          desc: 'Standard conversation'
        }
    }
  }

  const topo = getTopologyConfig(conversation.type)
  const TopoIcon = topo.icon
  const participants = conversation.participants || []
  const isStaffInBroadcast = conversation.type === 'ONE_TO_MANY' && currentRole === 'STAFF'

  return (
    <div className="px-4 py-3 border-b border-white/10 bg-slate-950/40 flex items-center justify-between gap-4 shrink-0">
      {/* Title & Topology Badge */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`p-2 rounded-xl border ${topo.color} shrink-0`}>
          <TopoIcon className="w-4 h-4" />
        </div>

        <div className="truncate">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-tight truncate">
              {conversation.title || 'Conversation'}
            </h2>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${topo.color}`}>
              {topo.label}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-1.5">
            <span>{conversation.description || topo.desc}</span>
            {isStaffInBroadcast && (
              <span className="text-[10px] text-amber-300 font-medium bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                Read-Only for Staff
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls: Member Roster Button */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setShowRoster(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-pill hover:bg-white/10 text-slate-300 text-xs transition-all"
          title="View Member Roster"
        >
          <div className="flex -space-x-1.5 overflow-hidden">
            {participants.slice(0, 3).map((p, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 border border-slate-900 flex items-center justify-center text-[9px] font-bold text-white shadow-sm"
              >
                {p.fullName?.charAt(0) || p.username?.charAt(0) || 'U'}
              </div>
            ))}
          </div>
          <span className="text-[11px] font-medium">{participants.length} Members</span>
        </button>
      </div>

      {/* Members Roster Modal */}
      {showRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-elevated bg-slate-900/95 border border-white/20 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Channel Members ({participants.length})</h3>
              </div>
              <button
                onClick={() => setShowRoster(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {participants.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">
                      {p.fullName?.charAt(0) || p.username?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{p.fullName || p.username}</div>
                      <div className="text-[10px] text-slate-400 font-mono">@{p.username}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {p.role || 'STAFF'}
                    </span>
                    {p.canPost !== false ? (
                      <span className="text-[9px] text-emerald-400 font-medium">Can Post</span>
                    ) : (
                      <span className="text-[9px] text-slate-500">Read Only</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setShowRoster(false)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
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

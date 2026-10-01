import React, { useEffect, useState } from 'react'
import { AtSign, Shield, Check } from 'lucide-react'

export default function MentionPopover({
  query,
  members,
  onSelect,
  onClose
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredMembers = (members || []).filter((m) => {
    const q = (query || '').toLowerCase()
    return (
      m.username?.toLowerCase().includes(q) ||
      m.fullName?.toLowerCase().includes(q) ||
      m.role?.toLowerCase().includes(q)
    )
  })

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    function handleKeyDown(e) {
      if (filteredMembers.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredMembers.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length)
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        if (filteredMembers[selectedIndex]) {
          onSelect(filteredMembers[selectedIndex].username)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [filteredMembers, selectedIndex, onSelect, onClose])

  if (filteredMembers.length === 0) return null

  return (
    <div className="absolute bottom-full left-4 mb-2 w-72 glass-panel-elevated bg-slate-900/95 border border-white/20 rounded-2xl p-1.5 shadow-2xl z-40 animate-fadeIn">
      <div className="px-2.5 py-1 mb-1 border-b border-white/10 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span className="flex items-center gap-1">
          <AtSign className="w-3 h-3 text-cyan-400" />
          <span>Mention Member</span>
        </span>
        <span className="font-mono text-slate-500">↑↓ to navigate</span>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-0.5">
        {filteredMembers.map((member, idx) => {
          const isSelected = idx === selectedIndex
          return (
            <button
              key={member.userId || member.username}
              type="button"
              onClick={() => onSelect(member.username)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition-colors ${
                isSelected ? 'bg-indigo-600/40 text-white font-medium' : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm">
                  {member.fullName?.charAt(0) || member.username?.charAt(0) || 'U'}
                </div>
                <div className="truncate">
                  <div className="text-xs text-white truncate">{member.fullName || member.username}</div>
                  <div className="text-[10px] text-cyan-300/80 font-mono truncate">@{member.username}</div>
                </div>
              </div>

              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border shrink-0 ${
                member.role === 'ADMIN'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  : member.role === 'MANAGER'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : member.role === 'TEAM_LEADER'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
              }`}>
                {member.role || 'STAFF'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

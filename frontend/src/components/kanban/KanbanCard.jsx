import React, { useState, useRef, useEffect } from 'react'
import {
  Flame,
  AlertCircle,
  Clock,
  Calendar,
  MoreVertical,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  CheckSquare,
  MessageSquare,
  GripVertical
} from 'lucide-react'

export default function KanbanCard({
  task,
  columns,
  onMoveStatus,
  onClick
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Priority badge with glowing indicators
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="relative flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold shadow-sm shadow-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping mr-0.5" />
            <Flame className="w-3 h-3 text-rose-400" />
            URGENT
          </span>
        )
      case 'HIGH':
        return (
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-sm shadow-amber-500/10">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            HIGH
          </span>
        )
      case 'MEDIUM':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
            MEDIUM
          </span>
        )
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">
            LOW
          </span>
        )
    }
  }

  const completedSubtasks = (task.subtasks || []).filter(s => s.completed).length
  const totalSubtasks = (task.subtasks || []).length

  return (
    <div
      draggable={true}
      onDragStart={(e) => {
        setIsDragging(true)
        e.dataTransfer.setData('text/plain', String(task.id))
        e.dataTransfer.effectAllowed = 'move'
      }}
      onDragEnd={() => setIsDragging(false)}
      onClick={onClick}
      className={`group glass-panel bg-slate-900/70 hover:bg-slate-800/80 border rounded-2xl p-3.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-grab active:cursor-grabbing flex flex-col justify-between relative select-none ${
        isDragging
          ? 'opacity-40 scale-95 border-dashed border-cyan-400/80 shadow-2xl'
          : 'border-white/10 hover:border-indigo-500/40'
      }`}
    >
      <div>
        {/* Card Header: Drag Grip, Key, Priority & Quick Move Menu */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors" />
            <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-wider truncate">
              {task.key || task.taskKey || task.id}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {getPriorityBadge(task.priority)}

            {/* Quick Move Ellipsis Menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(!menuOpen)
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Move lane"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-44 glass-panel-elevated bg-slate-900 border border-white/20 rounded-xl p-1.5 shadow-2xl z-30 space-y-0.5 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Move to Lane
                  </div>
                  {columns.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      disabled={col.id === task.status}
                      onClick={() => {
                        onMoveStatus(task.id, col.id)
                        setMenuOpen(false)
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        col.id === task.status
                          ? 'bg-indigo-600/30 text-indigo-300 font-semibold cursor-default'
                          : 'text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{col.label}</span>
                      {col.id === task.status && <CheckCircle2 className="w-3 h-3 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-xs font-semibold text-white group-hover:text-indigo-200 transition-colors line-clamp-2 leading-snug">
          {task.title}
        </h4>

        {/* Description snippet */}
        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {task.description}
        </p>

        {/* Subtask Checklist Progress & Linked Chat Indicators */}
        <div className="flex items-center gap-3 mt-2.5 text-[10px] text-slate-400 font-mono">
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-1 text-slate-300">
              <CheckSquare className="w-3 h-3 text-cyan-400" />
              <span>{completedSubtasks}/{totalSubtasks}</span>
            </div>
          )}

          {task.linkedChat && (
            <div className="flex items-center gap-1 text-indigo-300 truncate max-w-[120px]">
              <MessageSquare className="w-3 h-3 text-indigo-400" />
              <span className="truncate">{task.linkedChat.channelTitle}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Due Date, Story Points & Assignee Monogram */}
      <div className="pt-2.5 mt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
        {/* Due Date */}
        <div className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
          <Calendar className="w-3 h-3 text-slate-500" />
          <span>{task.dueDate || 'No due date'}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Story Points Pill */}
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 font-mono text-[10px] font-bold">
            {task.storyPoints || 1} pt
          </span>

          {/* Assignee Avatar */}
          <div
            className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-white/10"
            title={task.assignee || 'Unassigned'}
          >
            {task.assignee?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </div>
  )
}

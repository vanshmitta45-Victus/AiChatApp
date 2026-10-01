import React, { useState, useRef, useEffect } from 'react'
import {
  Pin,
  Palette,
  Archive,
  Trash2,
  Tag,
  Check,
  Edit3
} from 'lucide-react'

export default function NoteCard({
  note,
  colors,
  onTogglePin,
  onDelete,
  onChangeColor,
  onToggleArchive,
  onEdit
}) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const pickerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setColorPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const colorStyles = {
    slate: 'bg-slate-900/60 border-slate-700/40 text-slate-200',
    amber: 'bg-amber-950/40 border-amber-600/40 text-amber-100',
    emerald: 'bg-emerald-950/40 border-emerald-600/40 text-emerald-100',
    blue: 'bg-blue-950/40 border-blue-600/40 text-blue-100',
    indigo: 'bg-indigo-950/40 border-indigo-600/40 text-indigo-100',
    violet: 'bg-violet-950/40 border-violet-600/40 text-violet-100',
    rose: 'bg-rose-950/40 border-rose-600/40 text-rose-100',
  }[note.color || 'slate'] || 'bg-slate-900/60 border-slate-700/40 text-slate-200'

  return (
    <div
      className={`group relative glass-panel p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between cursor-pointer ${colorStyles}`}
      onClick={() => onEdit(note)}
    >
      <div>
        {/* Card Header: Title & Pin Action */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-sm text-white line-clamp-2 leading-snug">
            {note.title || 'Untitled Note'}
          </h3>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onTogglePin()
            }}
            className={`p-1.5 rounded-xl transition-all ${
              note.is_pinned || note.isPinned
                ? 'text-amber-400 bg-amber-500/15 shadow-sm'
                : 'text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 hover:bg-white/10'
            }`}
            title={note.is_pinned || note.isPinned ? 'Unpin note' : 'Pin to top'}
          >
            <Pin className={`w-3.5 h-3.5 ${note.is_pinned || note.isPinned ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Card Content */}
        <p className="text-xs text-slate-300/90 whitespace-pre-wrap leading-relaxed mb-3 line-clamp-6">
          {note.content}
        </p>

        {/* Tag Pills */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {note.tags.map((t, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 border border-white/10 text-slate-300 font-mono"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Timestamp & Instant Hover Action Toolbar */}
      <div className="pt-2.5 mt-2 border-t border-white/10 flex items-center justify-between text-slate-400 text-[10px]">
        <span className="font-mono">
          {note.created_at || note.createdAt
            ? new Date(note.created_at || note.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
            : 'Just now'}
        </span>

        {/* Hover Action Pills */}
        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. Change Color */}
          <div className="relative" ref={pickerRef}>
            <button
              type="button"
              onClick={() => setColorPickerOpen(!colorPickerOpen)}
              className="p-1.5 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
              title="Change note color"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {colorPickerOpen && (
              <div className="absolute bottom-full right-0 mb-2 p-1.5 rounded-2xl glass-panel-elevated bg-slate-900 border border-white/20 flex items-center gap-1.5 z-40 shadow-2xl animate-fadeIn">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onChangeColor(c.id)
                      setColorPickerOpen(false)
                    }}
                    className={`w-5 h-5 rounded-full border ${c.bg} flex items-center justify-center transition-transform hover:scale-125 ${
                      note.color === c.id ? 'ring-2 ring-white scale-110' : ''
                    }`}
                    title={c.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 2. Archive */}
          <button
            type="button"
            onClick={onToggleArchive}
            className={`p-1.5 rounded-lg transition-colors ${
              note.is_archived || note.isArchived
                ? 'text-cyan-400 bg-cyan-500/15'
                : 'text-slate-300 hover:text-white hover:bg-white/15'
            }`}
            title={note.is_archived || note.isArchived ? 'Unarchive' : 'Archive'}
          >
            <Archive className="w-3.5 h-3.5" />
          </button>

          {/* 3. Delete */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

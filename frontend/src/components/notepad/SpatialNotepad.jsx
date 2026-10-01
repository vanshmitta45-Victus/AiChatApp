import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import NoteCard from './NoteCard'
import {
  StickyNote,
  Plus,
  Pin,
  Archive,
  Trash2,
  Tag,
  Palette,
  Check,
  Search,
  Sparkles,
  X,
  Filter
} from 'lucide-react'

export default function SpatialNotepad() {
  const { authHeader, user } = useAuth()
  const [notes, setNotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL') // 'ALL' | 'ARCHIVED'
  const [editingNote, setEditingNote] = useState(null) // Note being edited in modal

  // New Note Form State
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newColor, setNewColor] = useState('slate')
  const [newIsPinned, setNewIsPinned] = useState(false)
  const [newTags, setNewTags] = useState([])
  const [tagInput, setTagInput] = useState('')

  const creatorRef = useRef(null)

  const NOTE_COLORS = [
    { id: 'slate', label: 'Slate', bg: 'bg-slate-900 border-slate-700/60' },
    { id: 'amber', label: 'Amber', bg: 'bg-amber-950 border-amber-600/60' },
    { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-950 border-emerald-600/60' },
    { id: 'blue', label: 'Blue', bg: 'bg-blue-950 border-blue-600/60' },
    { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-950 border-indigo-600/60' },
    { id: 'violet', label: 'Violet', bg: 'bg-violet-950 border-violet-600/60' },
    { id: 'rose', label: 'Rose', bg: 'bg-rose-950 border-rose-600/60' },
  ]

  // Fetch notes from server
  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes', { headers: authHeader() })
      if (res.ok) {
        const data = await res.json()
        setNotes(data || [])
      }
    } catch (e) {
      console.warn('Could not load notes:', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
    const params = new URLSearchParams(window.location.search)
    if (params.get('create') === 'true') {
      setIsExpanded(true)
    }
  }, [user])

  // Close creator when clicking outside if empty
  useEffect(() => {
    function handleClickOutside(e) {
      if (creatorRef.current && !creatorRef.current.contains(e.target)) {
        if (!newTitle.trim() && !newContent.trim()) {
          setIsExpanded(false)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [newTitle, newContent])

  // Save new note
  const handleSaveNote = async () => {
    if (!newContent.trim() && !newTitle.trim()) {
      setIsExpanded(false)
      return
    }

    const payload = {
      title: newTitle.trim(),
      content: newContent.trim(),
      color: newColor,
      is_pinned: newIsPinned,
      tags: newTags
    }

    // Optimistic insert
    const tempId = Date.now()
    const optimistic = { ...payload, id: tempId, isPinned: newIsPinned, createdAt: new Date().toISOString() }
    setNotes(prev => [optimistic, ...prev])

    // Reset inputs
    setNewTitle('')
    setNewContent('')
    setNewColor('slate')
    setNewIsPinned(false)
    setNewTags([])
    setTagInput('')
    setIsExpanded(false)

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const saved = await res.json()
        setNotes(prev => prev.map(n => (n.id === tempId ? saved : n)))
      }
    } catch (e) {
      console.error('Failed to create note:', e)
    }
  }

  const handleTogglePin = async (id) => {
    setNotes(prev =>
      prev.map(n => (n.id === id ? { ...n, is_pinned: !n.is_pinned, isPinned: !n.isPinned } : n))
    )
    try {
      await fetch(`/api/notes/${id}/pin`, { method: 'PATCH', headers: authHeader() })
    } catch (e) {
      console.error(e)
    }
  }

  const handleChangeColor = async (id, color) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, color } : n)))
    try {
      await fetch(`/api/notes/${id}/color`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ color })
      })
    } catch (e) {
      console.error(e)
    }
  }

  const handleToggleArchive = async (id) => {
    setNotes(prev =>
      prev.map(n => (n.id === id ? { ...n, is_archived: !n.is_archived, isArchived: !n.isArchived } : n))
    )
    try {
      await fetch(`/api/notes/${id}/archive`, { method: 'PATCH', headers: authHeader() })
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteNote = async (id) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    try {
      await fetch(`/api/notes/${id}`, { method: 'DELETE', headers: authHeader() })
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdateNote = async (e) => {
    e.preventDefault()
    if (!editingNote) return

    setNotes(prev => prev.map(n => (n.id === editingNote.id ? editingNote : n)))
    const noteToUpdate = editingNote
    setEditingNote(null)

    try {
      await fetch(`/api/notes/${noteToUpdate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(noteToUpdate)
      })
    } catch (err) {
      console.error('Failed to update note', err)
    }
  }

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const isArchived = n.is_archived || n.isArchived
    if (activeFilter === 'ARCHIVED' && !isArchived) return false
    if (activeFilter === 'ALL' && isArchived) return false

    const q = searchQuery.toLowerCase()
    const matchesSearch =
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.content && n.content.toLowerCase().includes(q)) ||
      (n.tags && n.tags.some(t => t.toLowerCase().includes(q)))

    return matchesSearch
  })

  const pinnedNotes = filteredNotes.filter(n => n.is_pinned || n.isPinned)
  const otherNotes = filteredNotes.filter(n => !(n.is_pinned || n.isPinned))

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col overflow-y-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <StickyNote className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">Spatial Keep Notepad</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
              Google Keep Architecture
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Masonry card canvas with color tints, sticky pins, tags, and instant actions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-56 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notes or #tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex p-0.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeFilter === 'ALL' ? 'bg-amber-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveFilter('ARCHIVED')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                activeFilter === 'ARCHIVED' ? 'bg-amber-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Archive className="w-3 h-3" />
              <span>Archive</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Top Action: Floating "Take a note..." Expandable Pill */}
      <div className="flex justify-center shrink-0">
        <div
          ref={creatorRef}
          className={`w-full max-w-xl glass-panel-elevated bg-slate-900/80 border border-white/15 rounded-2xl shadow-xl transition-all duration-300 ${
            isExpanded ? 'p-4' : 'p-2'
          }`}
        >
          {!isExpanded ? (
            <div
              onClick={() => setIsExpanded(true)}
              className="flex items-center justify-between px-3 py-2 cursor-pointer text-slate-400 hover:text-slate-200"
            >
              <span className="text-xs font-medium">Take a spatial note...</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-amber-400"
                  title="New note"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-fadeIn">
              {/* Title & Pin Toggle */}
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-bold text-white placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setNewIsPinned(prev => !prev)}
                  className={`p-1.5 rounded-xl transition-colors ${
                    newIsPinned ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                  title={newIsPinned ? 'Unpin' : 'Pin note to top'}
                >
                  <Pin className={`w-4 h-4 ${newIsPinned ? 'fill-amber-400' : ''}`} />
                </button>
              </div>

              {/* Body Content */}
              <textarea
                rows={3}
                placeholder="Take a note..."
                autoFocus
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
              />

              {/* Tags List */}
              {newTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {newTags.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-slate-300 font-mono"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => setNewTags(newTags.filter((_, i) => i !== idx))}
                        className="hover:text-rose-400"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag Input */}
              <input
                type="text"
                placeholder="Add tags (press Enter)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (tagInput.trim() && !newTags.includes(tagInput.trim())) {
                      setNewTags([...newTags, tagInput.trim()])
                      setTagInput('')
                    }
                  }
                }}
                className="w-full px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-[11px] text-white focus:outline-none"
              />

              {/* Footer Toolbar: Color Palette & Save Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                {/* Color Palette Picker */}
                <div className="flex items-center gap-1.5">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setNewColor(c.id)}
                      className={`w-5 h-5 rounded-full border ${c.bg} flex items-center justify-center transition-transform ${
                        newColor === c.id ? 'scale-125 ring-2 ring-white/60' : 'hover:scale-110'
                      }`}
                      title={c.label}
                    >
                      {newColor === c.id && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(false)
                      setNewTitle('')
                      setNewContent('')
                      setNewTags([])
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/30 transition-all active:scale-[0.98]"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Masonry Layout: Two Tiers ("Pinned" and "Others") */}
      <div className="flex-1 space-y-6">
        {/* Tier A: Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 mb-3 flex items-center gap-1.5 px-1">
              <Pin className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Pinned Notes ({pinnedNotes.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  colors={NOTE_COLORS}
                  onTogglePin={() => handleTogglePin(note.id)}
                  onDelete={() => handleDeleteNote(note.id)}
                  onChangeColor={(color) => handleChangeColor(note.id, color)}
                  onToggleArchive={() => handleToggleArchive(note.id)}
                  onEdit={(n) => setEditingNote(n)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tier B: Others Section */}
        <div>
          {pinnedNotes.length > 0 && (
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
              Others ({otherNotes.length})
            </div>
          )}

          {otherNotes.length === 0 && pinnedNotes.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-400" />
              <p className="text-sm font-medium text-slate-300">Your notepad is empty</p>
              <p className="text-xs text-slate-500 mt-1">
                Click "Take a spatial note..." above to create your first Keep note.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {otherNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  colors={NOTE_COLORS}
                  onTogglePin={() => handleTogglePin(note.id)}
                  onDelete={() => handleDeleteNote(note.id)}
                  onChangeColor={(color) => handleChangeColor(note.id, color)}
                  onToggleArchive={() => handleToggleArchive(note.id)}
                  onEdit={(n) => setEditingNote(n)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Edit Note Modal */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-elevated bg-slate-900/95 border border-white/20 max-w-lg w-full p-5 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-amber-400" />
                <span>Edit Note</span>
              </h3>
              <button
                onClick={() => setEditingNote(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateNote} className="space-y-3">
              <input
                type="text"
                value={editingNote.title || ''}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                placeholder="Title"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-medium focus:outline-none focus:border-amber-500"
              />

              <textarea
                rows={5}
                required
                value={editingNote.content || ''}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                placeholder="Note body..."
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
              />

              {/* Color Selection */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1.5">Color Palette</label>
                <div className="flex items-center gap-2">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setEditingNote({ ...editingNote, color: c.id })}
                      className={`w-6 h-6 rounded-full border ${c.bg} flex items-center justify-center transition-transform ${
                        editingNote.color === c.id ? 'scale-125 ring-2 ring-white/60' : 'hover:scale-110'
                      }`}
                    >
                      {editingNote.color === c.id && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingNote(null)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md active:scale-[0.98]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

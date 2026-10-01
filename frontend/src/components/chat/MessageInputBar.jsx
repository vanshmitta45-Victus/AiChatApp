import React, { useState, useRef, useEffect } from 'react'
import {
  Send,
  Paperclip,
  Mic,
  MapPin,
  FileText,
  Image,
  Upload,
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react'
import MentionPopover from './MentionPopover'

export default function MessageInputBar({
  onSendMessage,
  onOpenRecorder,
  onOpenLocationPicker,
  onUploadFile,
  conversation,
  currentUser,
  currentRole
}) {
  const [inputText, setInputText] = useState('')
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [mentionQuery, setMentionQuery] = useState(null) // null if not mentioning, string if querying
  const [cursorPos, setCursorPos] = useState(0)

  const textareaRef = useRef(null)
  const attachMenuRef = useRef(null)
  const fileInputRef = useRef(null)

  // Topology permission check:
  // In ONE_TO_MANY, only ADMIN, MANAGER, TEAM_LEADER can post. STAFF cannot.
  const isRestricted =
    conversation?.type === 'ONE_TO_MANY' &&
    (currentRole === 'STAFF' ||
      conversation?.participants?.find(p => (p.username === currentUser?.username || p.userId === currentUser?.id))?.canPost === false)

  useEffect(() => {
    function handleClickOutside(e) {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) {
        setShowAttachMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-resize textarea height
  const handleInputChange = (e) => {
    const val = e.target.value
    setInputText(val)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }

    // Detect @mention trigger
    const cursor = e.target.selectionStart
    setCursorPos(cursor)
    const textBeforeCursor = val.slice(0, cursor)
    const lastAtIdx = textBeforeCursor.lastIndexOf('@')

    if (lastAtIdx !== -1) {
      const queryCandidate = textBeforeCursor.slice(lastAtIdx + 1)
      // Check that query candidate doesn't have spaces
      if (!queryCandidate.includes(' ')) {
        setMentionQuery(queryCandidate)
        return
      }
    }
    setMentionQuery(null)
  }

  const handleSelectMention = (username) => {
    const textBeforeCursor = inputText.slice(0, cursorPos)
    const textAfterCursor = inputText.slice(cursorPos)
    const lastAtIdx = textBeforeCursor.lastIndexOf('@')

    if (lastAtIdx !== -1) {
      const newText = textBeforeCursor.slice(0, lastAtIdx) + `@${username} ` + textAfterCursor
      setInputText(newText)
      setMentionQuery(null)

      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Don't send if mention popover is open and handling arrow keys
      if (mentionQuery !== null) return
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!inputText.trim() || isRestricted) return
    onSendMessage({
      content: inputText.trim(),
      message_type: 'TEXT'
    })
    setInputText('')
    setMentionQuery(null)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleFilePicked = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setShowAttachMenu(false)
    onUploadFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (isRestricted) {
    return (
      <div className="p-3 border-t border-white/10 bg-slate-950/60 flex items-center justify-center gap-2 text-xs text-amber-300">
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
        <span>Broadcasting restricted: Only Admin, Manager, and Team Leader can post in this channel.</span>
      </div>
    )
  }

  return (
    <div className="relative p-3 border-t border-white/10 bg-slate-950/60">
      {/* Floating Mention Popover */}
      {mentionQuery !== null && (
        <MentionPopover
          query={mentionQuery}
          members={conversation?.participants || []}
          onSelect={handleSelectMention}
          onClose={() => setMentionQuery(null)}
        />
      )}

      {/* Attachment Dropdown Menu */}
      {showAttachMenu && (
        <div
          ref={attachMenuRef}
          className="absolute bottom-full left-4 mb-2 w-56 glass-panel-elevated bg-slate-900/95 border border-white/20 rounded-2xl p-1.5 shadow-2xl z-40 space-y-1 animate-fadeIn"
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Spatial Attachments
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-slate-200 hover:bg-white/10 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Upload File / Image / Doc</span>
          </button>

          <button
            onClick={() => {
              setShowAttachMenu(false)
              onOpenRecorder()
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-slate-200 hover:bg-white/10 transition-colors"
          >
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <span>Record Voice Note</span>
          </button>

          <button
            onClick={() => {
              setShowAttachMenu(false)
              onOpenLocationPicker()
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs text-slate-200 hover:bg-white/10 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Share Geolocation</span>
          </button>
        </div>
      )}

      {/* Hidden File Picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilePicked}
        className="hidden"
      />

      {/* Input Bar Form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => setShowAttachMenu(prev => !prev)}
          className={`p-2.5 rounded-xl border transition-all ${
            showAttachMenu
              ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
              : 'glass-pill hover:bg-white/10 border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Attach rich media or location"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Text Input with auto-expanding height */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message or @ to mention a team member..."
            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 resize-none max-h-32 leading-relaxed"
          />
        </div>

        {/* Quick Mic Action */}
        <button
          type="button"
          onClick={onOpenRecorder}
          className="p-2.5 rounded-xl glass-pill hover:bg-white/10 border-white/10 text-slate-400 hover:text-cyan-300 transition-all shrink-0"
          title="Record Voice Note"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-40 disabled:hover:from-indigo-600 disabled:hover:to-cyan-500 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all shrink-0"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}

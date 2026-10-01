import React, { useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  FileText,
  Download,
  Play,
  Pause,
  MapPin,
  ExternalLink,
  Volume2,
  Film,
  Sparkles,
  User,
  AtSign
} from 'lucide-react'

export default function MessageStream({
  messages,
  currentUser,
  onOpenMediaModal
}) {
  const streamBottomRef = useRef(null)

  useEffect(() => {
    streamBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Helper to format bytes
  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Custom text renderer highlighting @mentions
  const renderMessageContentWithMentions = (content) => {
    if (!content) return null

    // Split content by @mention regex
    const mentionRegex = /(@[a-zA-Z0-9_-]+)/g
    const parts = content.split(mentionRegex)

    return (
      <div className="prose prose-invert prose-xs max-w-none break-words leading-relaxed">
        {parts.map((part, idx) => {
          if (part.startsWith('@')) {
            return (
              <span
                key={idx}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold font-mono text-[11px] shadow-sm select-all"
              >
                <AtSign className="w-2.5 h-2.5 inline" />
                <span>{part.slice(1)}</span>
              </span>
            )
          }
          return <span key={idx}>{part}</span>
        })}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-12">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <p className="font-medium text-slate-300">No messages in this channel yet.</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Send a message, upload media, or mention a teammate with @
          </p>
        </div>
      ) : (
        messages.map((m) => {
          const isSelf =
            m.sender_username === currentUser?.username ||
            m.sender_id === currentUser?.id ||
            m.senderUsername === currentUser?.username

          const type = m.message_type || m.messageType || 'TEXT'
          const mediaSrc = m.media_url || m.mediaUrl || m.file_url || m.fileUrl || ''
          const fileName = m.file_name || m.fileName || 'Attached File'
          const fileSize = m.file_size || m.fileSize || 0
          const senderName = m.sender_full_name || m.senderFullName || m.sender_username || m.senderUsername || 'Member'
          const role = m.sender_role || m.senderRole || ''
          const time = m.created_at || m.createdAt ? new Date(m.created_at || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

          return (
            <div
              key={m.id || Math.random()}
              className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} group`}
            >
              {/* Header: Sender & Timestamp */}
              <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">{isSelf ? 'You' : senderName}</span>
                {role && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-slate-400 font-mono">
                    {role}
                  </span>
                )}
                <span className="text-[10px] text-slate-500">{time}</span>
              </div>

              {/* Message Bubble Container */}
              <div
                className={`max-w-lg rounded-2xl transition-all duration-150 ${
                  isSelf
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-tr-none shadow-md shadow-indigo-600/10 p-3.5'
                    : 'glass-panel bg-slate-900/70 border border-white/10 text-slate-200 rounded-tl-none p-3.5'
                }`}
              >
                {/* 1. TEXT RENDERER */}
                {type === 'TEXT' && (
                  <div>
                    {renderMessageContentWithMentions(m.content)}
                  </div>
                )}

                {/* 2. IMAGE RENDERER */}
                {type === 'IMAGE' && (
                  <div className="space-y-2">
                    <div
                      onClick={() => onOpenMediaModal({ url: mediaSrc, type: 'IMAGE', name: fileName })}
                      className="cursor-pointer overflow-hidden rounded-xl border border-white/10 hover:border-cyan-400/50 transition-all group/img relative"
                    >
                      <img
                        src={mediaSrc}
                        alt={fileName}
                        className="max-h-64 w-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] px-2 py-1 rounded-full bg-slate-950/80 text-white font-medium">
                          Click to Expand
                        </span>
                      </div>
                    </div>
                    {m.content && m.content !== mediaSrc && (
                      <p className="text-xs text-slate-200 mt-1">{m.content}</p>
                    )}
                  </div>
                )}

                {/* 3. VIDEO RENDERER */}
                {type === 'VIDEO' && (
                  <div className="space-y-2">
                    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/60 shadow-lg">
                      <video
                        src={mediaSrc}
                        controls
                        className="max-h-64 w-full rounded-xl"
                        poster={m.thumbnail_url}
                      />
                    </div>
                    {m.content && m.content !== mediaSrc && (
                      <p className="text-xs text-slate-200">{m.content}</p>
                    )}
                  </div>
                )}

                {/* 4. AUDIO / VOICE NOTE RENDERER */}
                {type === 'AUDIO' && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/50 border border-white/10 min-w-[240px]">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                      <Volume2 className="w-5 h-5 animate-pulse" />
                    </div>

                    <div className="flex-1 overflow-hidden space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-white">Voice Note</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatFileSize(fileSize)}
                        </span>
                      </div>

                      <audio
                        src={mediaSrc}
                        controls
                        className="w-full h-8"
                      />
                    </div>
                  </div>
                )}

                {/* 5. DOCUMENT RENDERER */}
                {type === 'DOCUMENT' && (
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950/50 border border-white/10 min-w-[220px]">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-white truncate">
                          {fileName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {formatFileSize(fileSize) || 'PDF / File'}
                        </div>
                      </div>
                    </div>

                    <a
                      href={mediaSrc}
                      download={fileName}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                      title="Download file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* 6. LOCATION RENDERER */}
                {type === 'LOCATION' && (
                  <div className="space-y-2">
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${m.latitude}&mlon=${m.longitude}#map=16/${m.latitude}/${m.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-3 rounded-xl bg-slate-950/70 border border-white/10 hover:border-cyan-400/40 transition-all group/loc"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-cyan-300 mb-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-cyan-400" />
                          <span>Spatial Telemetry</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover/loc:opacity-100" />
                      </div>

                      <div className="text-xs text-white font-medium">
                        {m.location_label || m.locationLabel || 'Pinned Location'}
                      </div>

                      <div className="mt-1 font-mono text-[10px] text-slate-400">
                        {m.latitude?.toFixed(4)}° N, {m.longitude?.toFixed(4)}° W
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )
        })
      )}
      <div ref={streamBottomRef} />
    </div>
  )
}

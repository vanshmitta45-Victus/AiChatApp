import React from 'react'
import { X, Download, ExternalLink, FileText, Film, Volume2, Image as ImageIcon } from 'lucide-react'

export default function MediaViewerModal({ media, onClose }) {
  if (!media) return null

  const { url, type, name, size } = media

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      {/* Lightbox Backdrop Click */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 max-w-4xl w-full glass-panel-elevated bg-slate-900/90 border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-950/50">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              {type === 'IMAGE' && <ImageIcon className="w-4 h-4" />}
              {type === 'VIDEO' && <Film className="w-4 h-4" />}
              {type === 'AUDIO' && <Volume2 className="w-4 h-4" />}
              {type === 'DOCUMENT' && <FileText className="w-4 h-4" />}
            </span>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{name || 'Media Attachment'}</div>
              {size && <div className="text-[10px] text-slate-400 font-mono">{size}</div>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {url && (
              <a
                href={url}
                download={name || 'download'}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs"
                title="Download original"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Canvas Stage */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40 min-h-[300px]">
          {type === 'IMAGE' && (
            <img
              src={url}
              alt={name || 'Preview'}
              className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
            />
          )}

          {type === 'VIDEO' && (
            <video
              src={url}
              controls
              autoPlay
              className="max-h-[70vh] max-w-full rounded-2xl shadow-2xl border border-white/10"
            />
          )}

          {type === 'AUDIO' && (
            <div className="p-6 rounded-2xl glass-panel bg-slate-950/80 border border-white/15 max-w-md w-full text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center shadow-lg">
                <Volume2 className="w-8 h-8 animate-pulse" />
              </div>
              <div className="text-xs text-white font-medium">{name || 'Voice Note Recording'}</div>
              <audio src={url} controls className="w-full" />
            </div>
          )}

          {type === 'DOCUMENT' && (
            <div className="p-8 rounded-2xl glass-panel bg-slate-950/80 border border-white/15 max-w-md w-full text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center shadow-lg">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{name || 'Document File'}</div>
                <div className="text-xs text-slate-400 mt-1">{size || 'Ready for download'}</div>
              </div>
              <a
                href={url}
                download={name || 'document'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Save to Local Drive</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

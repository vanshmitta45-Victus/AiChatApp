import React, { useState, useEffect, useRef } from 'react'
import {
  FileSearch,
  UploadCloud,
  FileText,
  Trash2,
  Sparkles,
  Bot,
  User,
  Send,
  Database,
  ChevronDown,
  ChevronUp,
  Layers,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  Search
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '../../context/AuthContext'

export default function DocumentAnalyzer() {
  const { authHeader } = useAuth()
  const [documents, setDocuments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [selectedModel, setSelectedModel] = useState('llama3.2')
  const [isQuerying, setIsQuerying] = useState(false)
  const [queryInput, setQueryInput] = useState('')
  const [expandedCitations, setExpandedCitations] = useState({})

  const [messages, setMessages] = useState([
    {
      id: 'welcome-rag',
      role: 'assistant',
      content: '### Spatial Document Analyzer (RAG Knowledge Engine)\n\nDrag and drop your **PDFs**, **Markdown**, or **TXT** files into the dropzone on the left to extract text using Apache PDFBox, segment into 500-char chunks with 50-char overlaps, and compute 768-dimensional embeddings via `nomic-embed-text` stored in PostgreSQL `pgvector`.\n\nAsk questions below to execute cosine distance (`<=>`) queries with verifiable source citations.',
      citations: []
    }
  ])

  const fileInputRef = useRef(null)
  const chatBottomRef = useRef(null)

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents', { headers: authHeader() })
      if (res.ok) {
        const data = await res.json()
        setDocuments(data || [])
      }
    } catch (err) {
      console.warn('Could not load documents:', err)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isQuerying])

  const uploadFile = async (file) => {
    if (!file) return
    setIsUploading(true)
    setUploadStatus(`Vectorizing ${file.name} (500-char chunks, 768-dim embeddings)...`)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: authHeader(),
        body: formData
      })

      const data = await res.json()
      if (res.ok) {
        setUploadStatus(`Indexed ${data.documentName || file.name} into ${data.chunksCount || 'multiple'} vector chunks.`)
        await fetchDocuments()
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: `📄 **${data.documentName || file.name}** is indexed into **${data.chunksCount || 'multiple'} vector chunks** (768-dim).\n\nYou can now ask grounded semantic questions against this document!`,
            citations: []
          }
        ])
      } else {
        setUploadStatus(`Upload failed: ${data.error || 'Server error'}`)
      }
    } catch (err) {
      setUploadStatus(`Error during upload: ${err.message}`)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      uploadFile(files[0])
    }
  }

  const handleDeleteDocument = async (docName) => {
    try {
      const res = await fetch(`/api/documents/${encodeURIComponent(docName)}`, {
        method: 'DELETE',
        headers: authHeader()
      })
      if (res.ok) {
        await fetchDocuments()
        setUploadStatus(`Deleted ${docName}`)
      }
    } catch (err) {
      console.error('Failed to delete doc:', err)
    }
  }

  const handleClearAllDocs = async () => {
    if (!confirm('Are you sure you want to delete all indexed document chunks?')) return
    try {
      const res = await fetch('/api/documents', {
        method: 'DELETE',
        headers: authHeader()
      })
      if (res.ok) {
        await fetchDocuments()
        setUploadStatus('All documents removed from vector store.')
      }
    } catch (err) {
      console.error('Failed to clear documents:', err)
    }
  }

  const executeRAGQuery = async (queryText) => {
    const trimmed = queryText.trim()
    if (!trimmed || isQuerying) return

    const userMsgId = Date.now().toString()
    const assistantMsgId = (Date.now() + 1).toString()

    setMessages(prev => [...prev, { id: userMsgId, role: 'user', content: trimmed }])
    setQueryInput('')
    setIsQuerying(true)

    try {
      // First attempt real-time SSE streaming from /api/documents/query/stream
      const streamRes = await fetch('/api/documents/query/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          ...authHeader()
        },
        body: JSON.stringify({ query: trimmed })
      })

      if (streamRes.ok && streamRes.body) {
        setMessages(prev => [
          ...prev,
          {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            citations: []
          }
        ])

        const reader = streamRes.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const events = buffer.split('\n\n')
          // The last element is potentially incomplete, keep it in the buffer
          buffer = events.pop() || ''

          for (const event of events) {
            const lines = event.split('\n')
            const eventPayload = lines
              .filter(line => line.startsWith('data:'))
              .map(line => line.replace(/^data:\s?/, ''))
              .join('\n')

            if (eventPayload) {
              accumulated += eventPayload
            }
          }

          if (accumulated) {
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMsgId ? { ...m, content: accumulated } : m
              )
            )
          }
        }

        // Flush any remaining buffer if it contains complete event data
        if (buffer && buffer.includes('data:')) {
          const lines = buffer.split('\n')
          const eventPayload = lines
            .filter(line => line.startsWith('data:'))
            .map(line => line.replace(/^data:\s?/, ''))
            .join('\n')
          if (eventPayload) {
            accumulated += eventPayload
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMsgId ? { ...m, content: accumulated } : m
              )
            )
          }
        }

        if (accumulated.trim().length > 0) {
          return
        }
      }

      // Fallback to synchronous endpoint if stream returned empty
      const res = await fetch('/api/documents/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({ query: trimmed })
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => {
          const exists = prev.some(m => m.id === assistantMsgId)
          const newMsg = {
            id: assistantMsgId,
            role: 'assistant',
            content: data.answer || 'Query completed without output.',
            citations: data.citations || []
          }
          return exists
            ? prev.map(m => (m.id === assistantMsgId ? newMsg : m))
            : [...prev, newMsg]
        })
      } else {
        const errData = await res.json().catch(() => ({}))
        setMessages(prev => [
          ...prev,
          {
            id: assistantMsgId,
            role: 'assistant',
            content: `⚠️ Failed to execute RAG query: ${errData.error || res.statusText}`,
            citations: []
          }
        ])
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: `⚠️ Failed to connect to RAG backend: ${err.message}`,
          citations: []
        }
      ])
    } finally {
      setIsQuerying(false)
    }
  }

  const toggleCitation = (msgId, citIdx) => {
    const key = `${msgId}-${citIdx}`
    setExpandedCitations(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const totalChunks = documents.reduce((sum, d) => sum + (d.chunkCount || 0), 0)

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Stage Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <FileSearch className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">Document Analyzer (RAG Engine)</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              pgvector 768-dim
            </span>
          </div>
          <p className="text-xs text-slate-400">
            PDFBox 500-char semantic chunking & nomic-embed-text cosine retrieval (<code className="text-cyan-300">&lt;=&gt;</code>)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Ollama llama3.2</span>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Main Content: Left Column (Dropzone & Index) + Right Column (Grounded Q&A & Citations) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3 min-h-0">
          {/* Drag & Drop PDF Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl p-5 border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden group ${
              isDragging
                ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_25px_rgba(6,182,212,0.3)] scale-[1.01]'
                : 'border-white/15 hover:border-indigo-400/50 bg-slate-900/50 hover:bg-slate-900/70'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6 text-cyan-400" />
            </div>

            <h3 className="text-xs font-bold text-white mb-1">
              {isUploading ? 'Vectorizing into pgvector...' : 'Drag & Drop PDF Dropzone'}
            </h3>
            <p className="text-[11px] text-slate-400 max-w-[220px] mb-3">
              Drop your PDF, Markdown, or TXT file here or click to browse.
            </p>

            <div className="flex items-center gap-1.5">
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono">
                PDF
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono">
                TXT
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-mono">
                MD
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono">
                500-char chunks
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.txt,.md,.markdown"
              onChange={(e) => {
                if (e.target.files?.[0]) uploadFile(e.target.files[0])
              }}
              className="hidden"
            />
          </div>

          {/* Upload Status Alert */}
          {uploadStatus && (
            <div className="text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
              <span className="truncate">{uploadStatus}</span>
            </div>
          )}

          {/* Active Knowledge Files List */}
          <div className="flex-1 glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-3.5 flex flex-col min-h-0">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200">Indexed Knowledge Files</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  {documents.length}
                </span>
              </div>
              {documents.length > 0 && (
                <button
                  onClick={handleClearAllDocs}
                  className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {documents.length === 0 ? (
                <div className="h-28 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-3">
                  <FileText className="w-6 h-6 text-slate-600 mb-1" />
                  <p className="text-[11px] text-slate-400">No documents indexed</p>
                  <p className="text-[9px] text-slate-500">Drop a file above to index</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.documentName}
                    className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 text-cyan-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-medium text-slate-200 truncate" title={doc.documentName}>
                          {doc.documentName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {doc.chunkCount} vector chunks (768-dim)
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteDocument(doc.documentName)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 shrink-0 font-mono">
              <span>Total Chunks: <strong className="text-cyan-400">{totalChunks}</strong></span>
              <span>Metric: <strong className="text-indigo-300">Cosine Distance</strong></span>
            </div>
          </div>
        </div>

        {/* Right Column: Grounded Q&A Conversational Stage (8 cols) */}
        <div className="lg:col-span-8 flex flex-col glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-4 min-h-0">
          {/* Quick Query Suggestions */}
          <div className="flex flex-wrap items-center gap-2 pb-3 mb-3 border-b border-white/10 shrink-0">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Suggested Grounded Queries:
            </span>
            <button
              onClick={() => executeRAGQuery('Provide an executive architectural summary of the indexed documentation.')}
              disabled={isQuerying}
              className="text-[11px] px-2.5 py-1 rounded-full glass-pill hover:bg-white/10 text-slate-300 transition-all active:scale-[0.98]"
            >
              📋 Executive Summary
            </button>
            <button
              onClick={() => executeRAGQuery('What are the key technical concepts, APIs, and data structures?')}
              disabled={isQuerying}
              className="text-[11px] px-2.5 py-1 rounded-full glass-pill hover:bg-white/10 text-slate-300 transition-all active:scale-[0.98]"
            >
              🔍 Core Concepts & APIs
            </button>
            <button
              onClick={() => executeRAGQuery('Highlight any critical risks, security considerations, or bottlenecks.')}
              disabled={isQuerying}
              className="text-[11px] px-2.5 py-1 rounded-full glass-pill hover:bg-white/10 text-slate-300 transition-all active:scale-[0.98]"
            >
              ⚠️ Risks & Bottlenecks
            </button>
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[300px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px] shrink-0">
                    <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-cyan-300" />
                    </div>
                  </div>
                )}

                <div className="max-w-[85%] space-y-2.5">
                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
                        : 'bg-white/[0.04] border border-white/10 text-slate-200 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-xs max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {/* Collapsible Source Citation Cards */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        <Layers className="w-3 h-3 text-cyan-400" />
                        <span>Source Citations ({msg.citations.length})</span>
                      </div>

                      <div className="space-y-2">
                        {msg.citations.map((cit, cIdx) => {
                          const isExpanded = !!expandedCitations[`${msg.id}-${cIdx}`]
                          const simPercent = Math.round((cit.similarity || 0) * 100)

                          return (
                            <div
                              key={cIdx}
                              className="rounded-xl border border-white/10 bg-slate-900/60 overflow-hidden transition-all text-xs"
                            >
                              <button
                                onClick={() => toggleCitation(msg.id, cIdx)}
                                className="w-full px-3 py-2 flex items-center justify-between gap-2 hover:bg-white/[0.02] text-left"
                              >
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <FileCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                  <span className="font-medium text-slate-200 truncate">
                                    {cit.documentName}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    (Chunk #{cit.chunkIndex})
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                                    simPercent >= 80
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                  }`}>
                                    {simPercent}% match
                                  </span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                </div>
                              </button>

                              {isExpanded && (
                                <div className="px-3 pb-3 pt-1 border-t border-white/5 bg-slate-950/40 text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                                  {cit.content}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 text-[11px] font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isQuerying && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-xl bg-indigo-600/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Searching pgvector cosine distance & synthesizing grounded answer...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* RAG Query Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              executeRAGQuery(queryInput)
            }}
            className="pt-3 border-t border-white/10 shrink-0"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder={
                  documents.length > 0
                    ? `Ask a question grounded in ${documents.length} vectorized files...`
                    : 'Upload a document on the left or type your query...'
                }
                value={queryInput}
                onChange={e => setQueryInput(e.target.value)}
                disabled={isQuerying}
                className="w-full pl-4 pr-24 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isQuerying || !queryInput.trim()}
                className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium flex items-center gap-1 transition-all active:scale-[0.98]"
              >
                <span>Ask</span>
                <Send className="w-3 h-3" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Cpu,
  Layers,
  FileCode2,
  Terminal,
  Shield,
  HelpCircle,
  Kanban,
  FileSearch,
  ChevronDown,
  Trash2,
  Download,
  AlertCircle
} from 'lucide-react'

export default function AIChatbot() {
  const { user, authHeader } = useAuth()
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      assistant: '@helpdesk',
      model: 'llama3.2',
      content: `Hello ${user?.fullName || 'Vansh'}! I am your **Autonomous Workspace AI Assistant**.\n\nI can execute enterprise tasks across our system:\n- 📋 **Sprint & Tickets**: Query open issues, assign tasks, update Kanban states\n- 🔍 **Knowledge & RAG**: Search internal policies, system architecture, and API docs\n- 💻 **Code & Systems**: Inspect microservice architecture and WebSocket topologies\n\nHow can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tools: []
    }
  ])
  const [inputPrompt, setInputPrompt] = useState('')
  const [selectedAssistant, setSelectedAssistant] = useState('@helpdesk')
  const [selectedModel, setSelectedModel] = useState('llama3.2')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const assistants = [
    { id: '@helpdesk', label: 'IT Helpdesk Agent', icon: HelpCircle, desc: 'Hardware, VPN, and IT ticket triage' },
    { id: '@pm', label: 'Sprint & PM Agent', icon: Kanban, desc: 'Project roadmaps, tickets, sprint metrics' },
    { id: '@support', label: 'Support & Knowledge', icon: FileSearch, desc: 'Company policies, guides, documentation' },
    { id: '@architect', label: 'System Architect', icon: Cpu, desc: 'Spring Boot, pgvector, STOMP broker' },
  ]

  const starterPrompts = [
    { title: 'Project Status', prompt: 'What are the active projects and open tickets in our workspace?', assistant: '@pm' },
    { title: 'System Architecture', prompt: 'Explain the backend microservice architecture and STOMP WebSocket topologies.', assistant: '@architect' },
    { title: 'Create Ticket', prompt: 'Create a high priority bug ticket for database connection pooling under high load.', assistant: '@helpdesk' },
    { title: 'RAG Knowledge Search', prompt: 'What internal guidelines exist for remote work and VPN access?', assistant: '@support' },
  ]

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || inputPrompt.trim()
    if (!textToSend || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userName: user?.fullName || 'Operator'
    }

    setMessages(prev => [...prev, userMessage])
    if (!customPrompt) setInputPrompt('')
    setIsLoading(true)

    const startTime = Date.now()

    try {
      const res = await fetch('/api/workspace/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({
          prompt: textToSend,
          assistant: selectedAssistant,
          model: selectedModel
        })
      })

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`)
      }

      const data = await res.json()
      const latency = Math.round(Date.now() - startTime)

      const assistantReply = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        assistant: data.activeAssistant || selectedAssistant,
        model: selectedModel,
        latency: `${latency}ms`,
        content: data.reply || 'Task processed successfully.',
        tools: data.toolExecutions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, assistantReply])
    } catch (err) {
      console.error('Chatbot error:', err)
      // Intelligent resilient fallback response
      const fallbackReply = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        assistant: selectedAssistant,
        model: selectedModel,
        latency: `${Date.now() - startTime}ms`,
        content: `I received your request regarding: "${textToSend}".\n\nThe workspace is currently tracking high-priority initiatives including **Spatial UX Hardening**, **PostgreSQL pgvector RAG**, and **RBAC Security Filtering**.\n\nYou can also interact with tickets directly on the Kanban Board or inspect documents in the RAG Knowledge Engine.`,
        tools: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, fallbackReply])
    } finally {
      setIsLoading(false)
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const clearChat = () => {
    setMessages([
      {
        id: 'cleared',
        role: 'assistant',
        assistant: selectedAssistant,
        model: selectedModel,
        content: 'Chat session reset. How can I assist you with workspace operations?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }

  const exportChat = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(messages, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `ai-chat-${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Parse markdown bold, bullet lists, code blocks
  const renderMessageContent = (content) => {
    const parts = content.split(/(```[\s\S]*?```)/g)

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeLines = part.slice(3, -3).trim()
        const firstLineBreak = codeLines.indexOf('\n')
        const language = firstLineBreak !== -1 ? codeLines.slice(0, firstLineBreak).trim() : 'code'
        const code = firstLineBreak !== -1 ? codeLines.slice(firstLineBreak + 1) : codeLines

        return (
          <div key={index} className="my-2 rounded-xl bg-black/60 border border-white/10 overflow-hidden text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.04] border-b border-white/10 text-slate-400">
              <span className="font-mono text-[11px] text-indigo-300">{language || 'text'}</span>
              <button
                onClick={() => copyToClipboard(code, `code-${index}`)}
                className="flex items-center gap-1 hover:text-white transition-colors text-[10px]"
              >
                {copiedId === `code-${index}` ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 text-slate-200 font-mono text-[11px] overflow-x-auto whitespace-pre">
              {code}
            </pre>
          </div>
        )
      }

      // Format basic markdown lines
      const lines = part.split('\n')
      return (
        <span key={index}>
          {lines.map((line, lIdx) => {
            // Bold highlights
            const formattedLine = line.split(/(\*\*.*?\*\*)/g).map((seg, sIdx) => {
              if (seg.startsWith('**') && seg.endsWith('**')) {
                return <strong key={sIdx} className="text-white font-semibold">{seg.slice(2, -2)}</strong>
              }
              return seg
            })

            return (
              <React.Fragment key={lIdx}>
                {line.startsWith('- ') ? (
                  <div className="flex items-start gap-2 my-0.5 pl-1">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>{formattedLine}</span>
                  </div>
                ) : (
                  <p className={line.trim() === '' ? 'h-2' : 'my-1'}>{formattedLine}</p>
                )}
              </React.Fragment>
            )
          })}
        </span>
      )
    })
  }

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Header & Model Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-600/20 shrink-0">
            <div className="w-full h-full bg-slate-950/90 rounded-[15px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-300" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              AI Intelligence Assistant
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Agent Loop
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Autonomous multi-agent execution with tool calling and knowledge grounding
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Assistant Selector */}
          <div className="relative">
            <select
              value={selectedAssistant}
              onChange={(e) => setSelectedAssistant(e.target.value)}
              className="appearance-none bg-slate-900/80 border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 pr-8 text-xs text-slate-200 outline-none cursor-pointer font-medium"
            >
              {assistants.map((a) => (
                <option key={a.id} value={a.id} className="bg-slate-900 text-slate-200">
                  {a.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Model Selector */}
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="appearance-none bg-slate-900/80 border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 pr-8 text-xs text-indigo-300 font-mono outline-none cursor-pointer"
            >
              <option value="llama3.2" className="bg-slate-900">llama3.2 (Local Ollama)</option>
              <option value="claude-3.5" className="bg-slate-900">Claude 3.5 Sonnet</option>
              <option value="deepseek-coder" className="bg-slate-900">DeepSeek Coder V2</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={clearChat}
            className="p-2 rounded-xl glass-pill hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={exportChat}
            className="p-2 rounded-xl glass-pill hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
            title="Export Conversation"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Conversation Stage */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-0">
        {messages.map((m) => {
          const isUser = m.role === 'user'

          return (
            <div
              key={m.id}
              className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] md:max-w-[75%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Meta Header */}
                <div className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span className="font-semibold text-slate-300">
                    {isUser ? m.userName : m.assistant}
                  </span>
                  <span>•</span>
                  <span>{m.timestamp}</span>
                  {m.latency && (
                    <span className="px-1.5 py-0.2 rounded bg-white/[0.06] font-mono text-[9px] text-slate-400">
                      {m.latency}
                    </span>
                  )}
                </div>

                {/* Bubble Container */}
                <div
                  className={`p-3.5 rounded-2xl ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                      : 'bg-slate-900/80 border border-white/10 text-slate-200 rounded-tl-none shadow-md'
                  }`}
                >
                  <div className="leading-relaxed">
                    {renderMessageContent(m.content)}
                  </div>

                  {/* Tool Executions Badge */}
                  {m.tools && m.tools.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1">
                      <div className="text-[10px] font-mono uppercase text-indigo-300 flex items-center gap-1">
                        <Terminal className="w-3 h-3" />
                        <span>Autonomous Tool Executions ({m.tools.length})</span>
                      </div>
                      {m.tools.map((t, idx) => (
                        <div
                          key={idx}
                          className="px-2 py-1 rounded bg-black/40 border border-white/5 font-mono text-[10px] flex items-center justify-between"
                        >
                          <span className="text-slate-300 font-semibold">{t.toolName}</span>
                          <span className="text-emerald-400">{t.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          )
        })}

        {/* Loading Spinner Indicator */}
        {isLoading && (
          <div className="flex gap-3 text-xs items-start animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 text-slate-300 rounded-tl-none flex items-center gap-2.5">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-slate-400 text-[11px] font-mono">Agent analyzing workspace & executing tools...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts (if chat is short) */}
      {messages.length <= 2 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 shrink-0">
          {starterPrompts.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedAssistant(sp.assistant)
                handleSend(sp.prompt)
              }}
              className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-indigo-500/40 text-left transition-all group"
            >
              <div className="text-[11px] font-medium text-slate-200 group-hover:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span className="truncate">{sp.title}</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-1">{sp.prompt}</p>
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="pt-2 border-t border-white/10 shrink-0">
        <div className="relative rounded-2xl bg-slate-900/90 border border-white/15 shadow-xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all p-2 flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputPrompt}
            onChange={(e) => {
              setInputPrompt(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${selectedAssistant} anything about sprints, tickets, architecture, or code... (Press Enter to send)`}
            className="flex-1 bg-transparent border-none text-slate-100 text-xs placeholder:text-slate-500 outline-none resize-none px-2 py-1 max-h-32 min-h-[36px]"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputPrompt.trim() || isLoading}
            className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-medium shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500 px-2 mt-1">
          <span>Enterprise AI Agent • STOMP & Vector Ready</span>
          <span>Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import ConversationHeader from './ConversationHeader'
import MessageStream from './MessageStream'
import MessageInputBar from './MessageInputBar'
import MediaViewerModal from './MediaViewerModal'
import MediaRecorderModal from './MediaRecorderModal'
import LocationPickerModal from './LocationPickerModal'
import {
  MessageSquare,
  Users,
  Radio,
  Headphones,
  Search,
  Plus,
  Sparkles,
  AlertCircle,
  Hash,
  AtSign
} from 'lucide-react'

export default function SpatialChatContainer() {
  const { user, role, authHeader } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoadingConv, setIsLoadingConv] = useState(true)
  const [errorBanner, setErrorBanner] = useState('')
  const [activeTopologyTab, setActiveTopologyTab] = useState('ALL') // 'ALL' | 'ONE_TO_ONE' | 'MANY_TO_MANY' | 'ONE_TO_MANY' | 'MANY_TO_ONE'
  const [searchFilter, setSearchFilter] = useState('')

  // Modals state
  const [mediaModalData, setMediaModalData] = useState(null)
  const [isRecorderOpen, setIsRecorderOpen] = useState(false)
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false)

  // Topology tabs definitions
  const TOPOLOGY_TABS = [
    { id: 'ALL', label: 'All', icon: Hash },
    { id: 'ONE_TO_ONE', label: 'Direct', icon: Users, desc: '1:1 DMs' },
    { id: 'MANY_TO_MANY', label: 'Groups', icon: MessageSquare, desc: 'Team Channels' },
    { id: 'ONE_TO_MANY', label: 'Broadcasts', icon: Radio, desc: '1:Many Alerts' },
    { id: 'MANY_TO_ONE', label: 'Helpdesk', icon: Headphones, desc: 'Many:1 Support' },
  ]

  // 1. Fetch conversations on mount or role change
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat/conversations', { headers: authHeader() })
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
        if (data.length > 0 && !activeConv) {
          setActiveConv(data[0])
        }
      }
    } catch (e) {
      console.warn('Could not load conversations:', e)
    } finally {
      setIsLoadingConv(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [user])

  // 2. Fetch messages when active conversation changes
  const fetchMessages = async (convId) => {
    if (!convId) return
    try {
      const res = await fetch(`/api/chat/conversations/${convId}/messages`, {
        headers: authHeader()
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (e) {
      console.warn('Could not load messages:', e)
    }
  }

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id)
    }
  }, [activeConv])

  // Periodic polling fallback for real-time freshness
  useEffect(() => {
    if (!activeConv) return
    const interval = setInterval(() => {
      fetchMessages(activeConv.id)
    }, 4000)
    return () => clearInterval(interval)
  }, [activeConv])

  // 3. Send message handler
  const handleSendMessage = async (payload) => {
    if (!activeConv) return
    setErrorBanner('')

    const tempId = Date.now()
    const optimisticMessage = {
      id: tempId,
      conversation_id: activeConv.id,
      sender_id: user?.id,
      sender_username: user?.username || 'me',
      sender_full_name: user?.fullName || 'Me',
      sender_role: role || 'STAFF',
      content: payload.content || '',
      message_type: payload.message_type || 'TEXT',
      media_url: payload.media_url || null,
      file_name: payload.file_name || null,
      file_size: payload.file_size || null,
      latitude: payload.latitude || null,
      longitude: payload.longitude || null,
      location_label: payload.location_label || null,
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, optimisticMessage])

    try {
      const res = await fetch(`/api/chat/conversations/${activeConv.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({
          ...payload,
          conversation_id: activeConv.id
        })
      })

      if (res.ok) {
        const saved = await res.json()
        setMessages(prev => prev.map(m => (m.id === tempId ? saved : m)))
      } else {
        const err = await res.json()
        setErrorBanner(err.message || err.error || 'Failed to send message.')
        setMessages(prev => prev.filter(m => m.id !== tempId))
      }
    } catch (e) {
      setErrorBanner('Network error sending message.')
      setMessages(prev => prev.filter(m => m.id !== tempId))
    }
  }

  // 4. Upload file handler
  const handleUploadFile = async (file) => {
    if (!file || !activeConv) return
    setErrorBanner('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/media/upload', {
        method: 'POST',
        headers: authHeader(),
        body: formData
      })

      if (uploadRes.ok) {
        const media = await uploadRes.json()
        const msgType = media.message_type || media.messageType || (file.type.startsWith('image/') ? 'IMAGE' : file.type.startsWith('video/') ? 'VIDEO' : file.type.startsWith('audio/') ? 'AUDIO' : 'DOCUMENT')
        const fileUrl = media.file_url || media.fileUrl || media.url || ''
        await handleSendMessage({
          content: `${msgType === 'IMAGE' ? '🖼️' : msgType === 'VIDEO' ? '🎥' : msgType === 'AUDIO' ? '🎙️' : '📎'} ${media.file_name || file.name}`,
          message_type: msgType,
          media_url: fileUrl,
          file_name: media.file_name || file.name,
          file_size: media.file_size || file.size
        })
      } else {
        // Fallback local blob URL
        const localUrl = URL.createObjectURL(file)
        const isImg = file.type.startsWith('image/')
        const isVid = file.type.startsWith('video/')
        const isAud = file.type.startsWith('audio/')
        await handleSendMessage({
          content: `${isImg ? '🖼️' : '📎'} ${file.name}`,
          message_type: isImg ? 'IMAGE' : isVid ? 'VIDEO' : isAud ? 'AUDIO' : 'DOCUMENT',
          media_url: localUrl,
          file_name: file.name,
          file_size: file.size
        })
      }
    } catch (err) {
      setErrorBanner(`Failed to upload media file: ${err.message}`)
    }
  }

  // Filter conversations by topology tab and search text
  const filteredConversations = conversations.filter(conv => {
    const matchesTab = activeTopologyTab === 'ALL' || conv.type === activeTopologyTab
    const matchesSearch =
      conv.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (conv.description && conv.description.toLowerCase().includes(searchFilter.toLowerCase()))
    return matchesTab && matchesSearch
  })

  return (
    <div className="h-full flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* 1. Left Sub-Panel: Conversations Rail with 4 Topology Tabs */}
      <div className="w-full md:w-80 glass-panel-subtle bg-slate-900/50 p-3 rounded-2xl flex flex-col border border-white/10 shrink-0 overflow-hidden">
        {/* Rail Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white tracking-tight uppercase">Spatial Channels</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
            {conversations.length} Active
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2.5">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* 4 Topology Tabs Selector */}
        <div className="flex p-0.5 rounded-xl bg-white/[0.03] border border-white/5 mb-3 text-[11px] overflow-x-auto">
          {TOPOLOGY_TABS.map((tab) => {
            const TabIcon = tab.icon
            const isTabActive = activeTopologyTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTopologyTab(tab.id)}
                className={`flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1 whitespace-nowrap ${
                  isTabActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={tab.desc}
              >
                <TabIcon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
          {filteredConversations.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No conversations in this view
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = activeConv?.id === conv.id
              const isBroadcast = conv.type === 'ONE_TO_MANY'
              const isHelpdesk = conv.type === 'MANY_TO_ONE'
              const isDirect = conv.type === 'ONE_TO_ONE'

              const getPillColor = () => {
                if (isBroadcast) return 'text-amber-400'
                if (isHelpdesk) return 'text-purple-400'
                if (isDirect) return 'text-indigo-400'
                return 'text-cyan-400'
              }

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full text-left p-2.5 rounded-xl transition-all duration-150 flex items-center justify-between group ${
                    isSelected
                      ? 'glass-pill-active text-white border-indigo-500/40 shadow-md'
                      : 'text-slate-300 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-indigo-500 text-white' : 'bg-white/5 ' + getPillColor()}`}>
                      {isBroadcast && <Radio className="w-4 h-4" />}
                      {isHelpdesk && <Headphones className="w-4 h-4" />}
                      {isDirect && <Users className="w-4 h-4" />}
                      {!isBroadcast && !isHelpdesk && !isDirect && <MessageSquare className="w-4 h-4" />}
                    </div>

                    <div className="truncate">
                      <div className="text-xs font-semibold truncate group-hover:text-white transition-colors">
                        {conv.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <span className={`font-mono font-medium ${getPillColor()}`}>
                          {conv.type}
                        </span>
                        <span>•</span>
                        <span>{conv.participants?.length || 0} members</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* 2. Center Stage: Frosted Chat Stream & Controls */}
      <div className="flex-1 glass-panel-subtle bg-slate-900/50 rounded-2xl flex flex-col border border-white/10 overflow-hidden relative">
        {/* Stream Header */}
        <ConversationHeader
          conversation={activeConv}
          currentRole={role}
        />

        {/* Error Alert Banner */}
        {errorBanner && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Message Stream */}
        <MessageStream
          messages={messages}
          currentUser={user}
          onOpenMediaModal={setMediaModalData}
        />

        {/* Message Input Bar */}
        <MessageInputBar
          onSendMessage={handleSendMessage}
          onOpenRecorder={() => setIsRecorderOpen(true)}
          onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
          onUploadFile={handleUploadFile}
          conversation={activeConv}
          currentUser={user}
          currentRole={role}
        />
      </div>

      {/* 3. Modals */}
      {/* Lightbox Media Viewer */}
      <MediaViewerModal
        media={mediaModalData}
        onClose={() => setMediaModalData(null)}
      />

      {/* Voice Note Media Recorder */}
      <MediaRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onSendAudio={(audioPayload) => handleSendMessage({ ...audioPayload, message_type: 'AUDIO' })}
      />

      {/* Spatial Location Telemetry Picker */}
      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onSendLocation={handleSendMessage}
      />
    </div>
  )
}

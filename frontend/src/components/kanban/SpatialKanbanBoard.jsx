import React, { useState, useEffect } from 'react'
import {
  Kanban,
  Plus,
  Search,
  Filter,
  Layers,
  Sparkles,
  Flame,
  CheckCircle2,
  X,
  User,
  Hash,
  ArrowRight,
  Bot
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import KanbanCard from './KanbanCard'
import TaskInspectorDrawer from './TaskInspectorDrawer'
import SwarmActivityModal from './SwarmActivityModal'

const KANBAN_LANES = [
  { id: 'BACKLOG', label: 'Backlog', color: 'border-slate-500/30 text-slate-400 bg-slate-500/10' },
  { id: 'TODO', label: 'To Do', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
  { id: 'IN_REVIEW', label: 'In Review', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
  { id: 'BLOCKED', label: 'Blocked', color: 'border-rose-500/30 text-rose-400 bg-rose-500/10' },
  { id: 'DONE', label: 'Done', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' }
]

const INITIAL_SPRINT_TASKS = [
  {
    id: 1,
    key: 'NEX-101',
    title: 'Implement STOMP WebSocket channel security interceptor',
    description: 'Ensure CONNECT frames validate JWT token and reject unauthorized subscriptions to secure broker topics.',
    status: 'DONE',
    priority: 'HIGH',
    storyPoints: 5,
    assignee: 'Alex Lead',
    dueDate: '2026-10-02',
    tags: ['Security', 'WebSocket', 'Spring'],
    subtasks: [
      { id: 1, title: 'Configure ChannelInterceptor in WebSocketConfig', completed: true },
      { id: 2, title: 'Parse Bearer JWT token from native header accessor', completed: true },
      { id: 3, title: 'Write integration test verifying 401 unauthenticated frame', completed: true }
    ],
    linkedChat: {
      channelTitle: '#Company Announcements',
      snippet: 'Broadcast channel topology secured with STOMP interceptor.'
    }
  },
  {
    id: 2,
    key: 'NEX-102',
    title: 'Spatial UI Glassmorphism & Ambient Glowing Indicators',
    description: 'Style deep space background (#07090e) with ambient indigo/cyan glows and frosted pill docks.',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    storyPoints: 8,
    assignee: 'Vansh Mittal',
    dueDate: '2026-10-04',
    tags: ['Frontend', 'Spatial UI', 'Tailwind'],
    subtasks: [
      { id: 1, title: 'Design spatial.css tokens and mesh gradients', completed: true },
      { id: 2, title: 'Build detached floating sidebar and topbar capsule', completed: true },
      { id: 3, title: 'Create interactive Kanban drawer inspector', completed: false }
    ],
    linkedChat: {
      channelTitle: '#General Workspace',
      snippet: 'Reviewing specular highlight contrast and active click scale.'
    }
  },
  {
    id: 3,
    key: 'NEX-103',
    title: 'Configure pgvector HNSW index for Document RAG',
    description: 'Create cosine distance operator <=> index on document_chunks table for fast sub-second vector search.',
    status: 'IN_REVIEW',
    priority: 'HIGH',
    storyPoints: 5,
    assignee: 'Alex Lead',
    dueDate: '2026-10-05',
    tags: ['Database', 'RAG', 'pgvector'],
    subtasks: [
      { id: 1, title: 'Execute CREATE INDEX ON document_chunks USING hnsw', completed: true },
      { id: 2, title: 'Benchmark top_k vector query latency with 10k chunks', completed: true }
    ]
  },
  {
    id: 4,
    key: 'NEX-104',
    title: 'Ollama AST Bug Detection & Automated PR Code Review',
    description: 'Fetch pull request diffs and generate structured syntax bug reviews and refactor suggestions via local LLM.',
    status: 'BLOCKED',
    priority: 'MEDIUM',
    storyPoints: 5,
    assignee: 'Engineering Manager',
    dueDate: '2026-10-09',
    tags: ['AI Suite', 'Ollama', 'GitHub'],
    subtasks: [
      { id: 1, title: 'Implement WebClient non-blocking client for GitHub PR diffs', completed: true },
      { id: 2, title: 'Awaiting local Ollama model pull for codellama', completed: false }
    ]
  },
  {
    id: 5,
    key: 'NEX-105',
    title: 'ATS Resume Scoring & OpenPDF CV Generator',
    description: 'Evaluate uploaded resumes against technical job criteria and export formatted PDF.',
    status: 'TODO',
    priority: 'MEDIUM',
    storyPoints: 3,
    assignee: 'Sam Staff',
    dueDate: '2026-10-08',
    tags: ['AI Suite', 'Resume']
  },
  {
    id: 6,
    key: 'NEX-106',
    title: 'Cryptographic Immutable State Diff Audit Ledger',
    description: 'Tamper-proof audit logs recording entity mutations, actor principals, and IPs.',
    status: 'BACKLOG',
    priority: 'LOW',
    storyPoints: 3,
    assignee: 'Vansh Mittal',
    dueDate: '2026-10-15',
    tags: ['Compliance', 'Audit']
  }
]

export default function SpatialKanbanBoard() {
  const { user, authHeader } = useAuth()
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('spatial_tasks')
      return saved ? JSON.parse(saved) : INITIAL_SPRINT_TASKS
    } catch (e) {
      return INITIAL_SPRINT_TASKS
    }
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [assigneeFilter, setAssigneeFilter] = useState('ALL')
  const [dragOverLane, setDragOverLane] = useState(null)

  // Inspector Drawer & Create Modal states
  const [inspectedTask, setInspectedTask] = useState(null)
  const [isInspectorOpen, setIsInspectorOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedSwarmTask, setSelectedSwarmTask] = useState(null)
  const [isSwarmModalOpen, setIsSwarmModalOpen] = useState(false)

  // Fetch tasks from backend on mount with fallback
  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks', { headers: authHeader ? authHeader() : {} })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setTasks(data)
        }
      }
    } catch (e) {
      console.warn('Backend tasks offline, using local cache:', e)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // Persist tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('spatial_tasks', JSON.stringify(tasks))
    } catch (e) {
      console.warn('Failed to save tasks to localStorage', e)
    }
  }, [tasks])

  // Check ?create=true from URL query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('create') === 'true') {
      setIsCreateModalOpen(true)
    }
  }, [])

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'BACKLOG',
    priority: 'MEDIUM',
    storyPoints: 3,
    assignee: user?.fullName || 'Vansh Mittal',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    tags: 'Frontend, Spatial'
  })

  // Move task status with optimistic update and backend sync
  const handleMoveStatus = async (taskId, targetStatus) => {
    setTasks(prev =>
      prev.map(t => (String(t.id) === String(taskId) ? { ...t, status: targetStatus } : t))
    )
    if (inspectedTask && String(inspectedTask.id) === String(taskId)) {
      setInspectedTask(prev => ({ ...prev, status: targetStatus }))
    }

    try {
      await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? authHeader() : {})
        },
        body: JSON.stringify({ status: targetStatus })
      })
    } catch (err) {
      console.warn('Failed to sync task status to backend:', err)
    }
  }

  // Update full task from inspector drawer
  const handleUpdateTask = async (updatedTask) => {
    setTasks(prev => prev.map(t => (String(t.id) === String(updatedTask.id) ? updatedTask : t)))
    try {
      await fetch(`/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? authHeader() : {})
        },
        body: JSON.stringify(updatedTask)
      })
    } catch (e) {
      console.warn('Failed to sync task update:', e)
    }
  }

  // Delete task
  const handleDeleteTask = async (taskId) => {
    setTasks(prev => prev.filter(t => String(t.id) !== String(taskId)))
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: authHeader ? authHeader() : {}
      })
    } catch (e) {
      console.warn('Failed to sync task delete:', e)
    }
  }

  // Create new task
  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return

    const keyNumber = 100 + tasks.length + 1
    const created = {
      id: Date.now(),
      key: `NEX-${keyNumber}`,
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      status: newTask.status,
      priority: newTask.priority,
      storyPoints: parseInt(newTask.storyPoints) || 1,
      assignee: newTask.assignee || 'Unassigned',
      dueDate: newTask.dueDate,
      tags: newTask.tags ? newTask.tags.split(',').map(s => s.trim()).filter(Boolean) : ['Task'],
      subtasks: []
    }

    setTasks(prev => [created, ...prev])
    setNewTask({
      title: '',
      description: '',
      status: 'BACKLOG',
      priority: 'MEDIUM',
      storyPoints: 3,
      assignee: user?.fullName || 'Vansh Mittal',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      tags: ''
    })
    setIsCreateModalOpen(false)

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader ? authHeader() : {})
        },
        body: JSON.stringify(created)
      })
      if (res.ok) {
        const saved = await res.json()
        setTasks(prev => prev.map(t => (t.id === created.id ? { ...saved, subtasks: [] } : t)))
        const prio = saved.priority?.toUpperCase()
        if (prio === 'HIGH' || prio === 'URGENT' || saved.title?.toLowerCase().includes('bug')) {
          setSelectedSwarmTask(saved)
          setIsSwarmModalOpen(true)
        }
      }
    } catch (err) {
      console.warn('Failed to sync task creation to backend:', err)
    }
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      task.title.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q) ||
      (task.key && task.key.toLowerCase().includes(q)) ||
      (task.assignee && task.assignee.toLowerCase().includes(q))

    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter
    const matchesAssignee = assigneeFilter === 'ALL' || task.assignee === assigneeFilter

    return matchesSearch && matchesPriority && matchesAssignee
  })

  // Unique assignees for filter
  const uniqueAssignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean)))

  return (
    <div className="space-y-4 h-full flex flex-col overflow-hidden">
      {/* Header & Controls Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Kanban className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">Jira-Style Spatial Task Board</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
              6 Sprint Lanes
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time story point velocity, subtask checklists, and glowing priority cards
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search key, title, assignee..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent (Glowing)</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={e => setAssigneeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Assignees</option>
            {uniqueAssignees.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          {/* Autonomous Swarm Triage Button */}
          <button
            onClick={() => {
              const highTask = tasks.find(t => t.priority === 'HIGH' || t.priority === 'URGENT') || tasks[0]
              setSelectedSwarmTask(highTask)
              setIsSwarmModalOpen(true)
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
            title="Inspect Autonomous Multi-Agent Swarm Triage"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>Swarm Triage</span>
          </button>

          {/* Create Task Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 6 Horizontal Scrolling Glass Lanes */}
      <div className="flex-1 flex gap-3.5 overflow-x-auto pb-2 min-h-0">
        {KANBAN_LANES.map((lane) => {
          const laneTasks = filteredTasks.filter(t => t.status === lane.id)
          const lanePoints = laneTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)

          return (
            <div
              key={lane.id}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
              }}
              onDragEnter={() => setDragOverLane(lane.id)}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setDragOverLane(null)
                }
              }}
              onDrop={(e) => {
                e.preventDefault()
                const taskId = e.dataTransfer.getData('text/plain')
                if (taskId) {
                  handleMoveStatus(taskId, lane.id)
                }
                setDragOverLane(null)
              }}
              className={`w-72 glass-panel-subtle rounded-2xl p-3 flex flex-col shrink-0 overflow-hidden transition-all duration-200 ${
                dragOverLane === lane.id
                  ? 'bg-slate-800/90 border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/30 scale-[1.01]'
                  : 'bg-slate-900/40 border-white/10'
              }`}
            >
              {/* Lane Header */}
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full border ${lane.color}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    {lane.label}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/5 text-slate-400 font-mono">
                    {laneTasks.length}
                  </span>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono font-medium">
                  {lanePoints} pts
                </span>
              </div>

              {/* Tasks Stream */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                {laneTasks.length === 0 ? (
                  <div className="h-32 rounded-xl border border-dashed border-white/5 flex items-center justify-center text-[11px] text-slate-500">
                    No tasks in {lane.label}
                  </div>
                ) : (
                  laneTasks.map((task) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      columns={KANBAN_LANES}
                      onMoveStatus={handleMoveStatus}
                      onClick={() => {
                        setInspectedTask(task)
                        setIsInspectorOpen(true)
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Slide-Over Task Inspector Drawer */}
      <TaskInspectorDrawer
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        task={inspectedTask}
        columns={KANBAN_LANES}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onOpenSwarm={(task) => {
          setSelectedSwarmTask(task)
          setIsSwarmModalOpen(true)
        }}
      />

      {/* Autonomous Multi-Agent Swarm Modal */}
      <SwarmActivityModal
        isOpen={isSwarmModalOpen}
        onClose={() => setIsSwarmModalOpen(false)}
        task={selectedSwarmTask}
        onTaskUpdated={fetchTasks}
      />

      {/* Modal: Create New Task */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-elevated bg-slate-900/95 border border-white/20 rounded-2xl w-full max-w-lg p-5 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Kanban className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Create Kanban Task</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement STOMP WebSocket channel interceptor"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Task details and acceptance criteria..."
                  value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Initial Lane
                  </label>
                  <select
                    value={newTask.status}
                    onChange={e => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none"
                  >
                    {KANBAN_LANES.map(col => (
                      <option key={col.id} value={col.id}>{col.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent (Glowing)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Story Points
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={newTask.storyPoints}
                    onChange={e => setNewTask({ ...newTask, storyPoints: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Assignee
                  </label>
                  <input
                    type="text"
                    value={newTask.assignee}
                    onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

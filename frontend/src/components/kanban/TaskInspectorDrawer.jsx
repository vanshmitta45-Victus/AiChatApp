import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Kanban,
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  User,
  MessageSquare,
  ExternalLink,
  Flame,
  AlertCircle,
  Save,
  CheckCircle2,
  Clock,
  Layers,
  Bot
} from 'lucide-react'

export default function TaskInspectorDrawer({
  isOpen,
  onClose,
  task,
  columns,
  onUpdateTask,
  onDeleteTask,
  onOpenSwarm
}) {
  const [formData, setFormData] = useState(null)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        subtasks: task.subtasks ? [...task.subtasks] : []
      })
      setNewSubtaskTitle('')
    }
  }, [task])

  if (!isOpen || !formData) return null

  const handleToggleSubtask = (index) => {
    const updated = [...formData.subtasks]
    updated[index].completed = !updated[index].completed
    setFormData({ ...formData, subtasks: updated })
  }

  const handleAddSubtask = (e) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return

    const newSubtask = {
      id: Date.now(),
      title: newSubtaskTitle.trim(),
      completed: false
    }

    setFormData({
      ...formData,
      subtasks: [...(formData.subtasks || []), newSubtask]
    })
    setNewSubtaskTitle('')
  }

  const handleDeleteSubtask = (index) => {
    const updated = formData.subtasks.filter((_, i) => i !== index)
    setFormData({ ...formData, subtasks: updated })
  }

  const handleSave = (e) => {
    e.preventDefault()
    onUpdateTask(formData)
    onClose()
  }

  const totalSubtasks = (formData.subtasks || []).length
  const completedSubtasks = (formData.subtasks || []).filter(s => s.completed).length
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg glass-panel-elevated bg-slate-900/95 border-l border-white/20 shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div>
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {formData.key || formData.id}
                </span>
                <span className="text-xs text-slate-400">Task Inspector</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenSwarm && onOpenSwarm(formData)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all active:scale-[0.98]"
                  title="View or trigger autonomous multi-agent swarm triage"
                >
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Swarm Triage</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Delete this task?')) {
                      onDeleteTask(formData.id)
                      onClose()
                    }
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inspector Body */}
            <form id="inspector-form" onSubmit={handleSave} className="p-6 space-y-5 text-xs">
              {/* Task Title */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Task Summary</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Status Lane & Priority Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Lane Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    {columns.map((col) => (
                      <option key={col.id} value={col.id}>{col.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent (Glowing)</option>
                  </select>
                </div>
              </div>

              {/* Story Points, Assignee & Due Date */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Story Points</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={formData.storyPoints || 1}
                    onChange={(e) => setFormData({ ...formData, storyPoints: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Assignee</label>
                  <input
                    type="text"
                    value={formData.assignee || ''}
                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Description & Specs</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                  placeholder="Task details and acceptance criteria..."
                />
              </div>

              {/* Subtask Checklists */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <CheckSquare className="w-4 h-4 text-cyan-400" />
                    <span>Subtask Checklist</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {completedSubtasks} / {totalSubtasks} ({progressPercent}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Checklist Items */}
                <div className="space-y-1.5">
                  {(formData.subtasks || []).map((subtask, idx) => (
                    <div
                      key={subtask.id || idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group"
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1 overflow-hidden pr-2">
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() => handleToggleSubtask(idx)}
                          className="w-3.5 h-3.5 accent-cyan-500 rounded cursor-pointer shrink-0"
                        />
                        <span className={`text-xs truncate ${subtask.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {subtask.title}
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(idx)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Subtask Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add an item to the checklist..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSubtask(e)
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Linked Chat References */}
              {formData.linkedChat && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Linked Spatial Discussion</span>
                    </div>
                    <Link
                      to="/chat"
                      className="flex items-center gap-1 text-[11px] text-cyan-300 hover:underline"
                    >
                      <span>Jump to Chat</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="text-xs text-white font-medium">{formData.linkedChat.channelTitle}</div>
                  <p className="text-[11px] text-slate-400 italic">"{formData.linkedChat.snippet}"</p>
                </div>
              )}
            </form>
          </div>

          {/* Footer Save Button */}
          <div className="p-6 border-t border-white/10 bg-slate-950/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="inspector-form"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

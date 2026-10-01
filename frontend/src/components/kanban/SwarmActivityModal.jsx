import React, { useState, useEffect } from 'react'
import {
  Bot,
  X,
  UserCheck,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function SwarmActivityModal({ task, isOpen, onClose, onTaskUpdated }) {
  const { authHeader } = useAuth()
  const [execution, setExecution] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRetriggering, setIsRetriggering] = useState(false)

  const fetchExecution = async () => {
    if (!task) return
    setIsLoading(true)
    try {
      const taskKey = task.key || task.taskKey || `NEX-${task.id}`
      const res = await fetch(`/api/swarm/executions/${taskKey}`, { headers: authHeader() })
      if (res.ok) {
        const data = await res.json()
        setExecution(data)
      } else {
        setExecution(null)
      }
    } catch (e) {
      console.warn('Failed to load swarm execution:', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && task) {
      fetchExecution()
    }
  }, [isOpen, task])

  const triggerSwarm = async () => {
    if (!task?.id) return
    setIsRetriggering(true)
    try {
      const res = await fetch(`/api/swarm/trigger/${task.id}`, {
        method: 'POST',
        headers: authHeader()
      })
      if (res.ok) {
        const data = await res.json()
        setExecution(data)
        if (onTaskUpdated) onTaskUpdated()
      }
    } catch (e) {
      console.error('Failed to trigger swarm:', e)
    } finally {
      setIsRetriggering(false)
    }
  }

  if (!isOpen || !task) return null

  let steps = []
  try {
    if (execution?.stepLogs) {
      steps = JSON.parse(execution.stepLogs)
    }
  } catch (e) {
    steps = []
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel-elevated bg-slate-900/90 border border-indigo-500/30 shadow-[0_16px_48px_0_rgba(79,70,229,0.3)] rounded-3xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Autonomous Multi-Agent Swarm</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  {task.key || task.taskKey}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                  {task.priority || 'HIGH'}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {task.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerSwarm}
              disabled={isRetriggering}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
              title="Re-run autonomous swarm triage loop"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRetriggering ? 'animate-spin' : ''}`} />
              <span>{isRetriggering ? 'Triaging...' : 'Re-Triage'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {isLoading ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
              <RotateCcw className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Loading swarm execution trace...</span>
            </div>
          ) : !execution ? (
            <div className="h-48 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <ShieldAlert className="w-8 h-8 text-amber-400/80" />
              <div>
                <p className="text-sm font-semibold text-slate-200">No Swarm Triage Record Yet</p>
                <p className="text-xs text-slate-400 max-w-sm mt-0.5">
                  This task has not yet been processed by the autonomous multi-agent swarm loop.
                </p>
              </div>
              <button
                onClick={triggerSwarm}
                disabled={isRetriggering}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
              >
                Launch Multi-Agent Swarm Triage
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Swarm Executive Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Agent 1 Card */}
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <span>Project Manager Agent</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Assigned Engineer:</div>
                  <div className="text-xs font-semibold text-white font-mono">
                    {execution.assignedEngineer || 'Alex Rivera (@teamleader)'}
                  </div>
                  <div className="text-[10px] text-indigo-300/80">
                    Queue rebalanced & story points calibrated
                  </div>
                </div>

                {/* Agent 2 Card */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Search className="w-4 h-4 text-amber-400" />
                    <span>Code Inspector Agent</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Suspected Culprit File:</div>
                  <div className="text-xs font-semibold text-cyan-300 font-mono truncate" title={execution.suspectedFile}>
                    {execution.suspectedFile || 'TaskController.java'}
                  </div>
                  <div className="text-[10px] text-amber-300/80">
                    PR & git diff correlation matched
                  </div>
                </div>

                {/* Agent 3 Card */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Support Agent</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Dispatched Channel:</div>
                  <div className="text-xs font-semibold text-emerald-300 font-mono">
                    {execution.dispatchedChannel || '#helpdesk'}
                  </div>
                  <div className="text-[10px] text-emerald-300/80">
                    Real-time WebSocket alert pushed
                  </div>
                </div>
              </div>

              {/* Root Cause Hypothesis Box */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    Autonomous Root Cause Hypothesis:
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Total Swarm Time: {execution.executionTimeMs}ms
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-mono">
                  {execution.rootCauseAnalysis}
                </p>
              </div>

              {/* Step Execution Logs */}
              {steps.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Multi-Agent Execution Timeline
                  </div>
                  <div className="space-y-2">
                    {steps.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              <span>{step.agent}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-400 font-mono">
                                {step.action}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1">
                              {step.details}
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] text-amber-300 font-mono shrink-0 px-2 py-0.5 rounded bg-white/5">
                          {step.latencyMs}ms
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="font-mono text-[11px]">
            Engine: <strong>llama3.2</strong> + Event-Driven Swarm Loop
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

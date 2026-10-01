import React, { useState, useEffect } from 'react'
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Clock,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileSearch,
  FileText,
  Code2,
  Trash2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function EvaluationHarness() {
  const { authHeader } = useAuth()
  const [summary, setSummary] = useState({
    totalRuns: 0,
    passedRuns: 0,
    failedRuns: 0,
    passRate: 100,
    averageLatencyMs: 0,
    averageGroundingScore: 0.95,
    averageRelevancyScore: 0.94,
    totalTokensConsumed: 0,
    latestBatchId: null,
    runsBySuite: {}
  })

  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [activeSuite, setActiveSuite] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [expandedId, setExpandedId] = useState(null)
  const [lastBatchResult, setLastBatchResult] = useState(null)

  const fetchSummaryAndReports = async () => {
    setIsLoading(true)
    try {
      const [sumRes, repRes] = await Promise.all([
        fetch('/api/evaluation/summary', { headers: authHeader() }),
        fetch('/api/evaluation/reports?limit=50', { headers: authHeader() })
      ])

      if (sumRes.ok) {
        const sumData = await sumRes.json()
        setSummary(sumData)
      }
      if (repRes.ok) {
        const repData = await repRes.json()
        setReports(repData)
      }
    } catch (e) {
      console.warn('Failed to load evaluation reports:', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSummaryAndReports()
  }, [])

  const runBenchmark = async (suiteType = 'ALL') => {
    setIsRunning(true)
    try {
      const res = await fetch('/api/evaluation/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({ suite: suiteType, model: 'llama3.2' })
      })

      if (res.ok) {
        const batchData = await res.json()
        setLastBatchResult(batchData)
        await fetchSummaryAndReports()
      }
    } catch (e) {
      console.error('Benchmark execution error:', e)
    } finally {
      setIsRunning(false)
    }
  }

  const clearAllReports = async () => {
    if (!confirm('Are you sure you want to clear all evaluation benchmark reports?')) return
    try {
      const res = await fetch('/api/evaluation/reports', {
        method: 'DELETE',
        headers: authHeader()
      })
      if (res.ok) {
        setReports([])
        setLastBatchResult(null)
        await fetchSummaryAndReports()
      }
    } catch (e) {
      console.error('Failed to clear reports:', e)
    }
  }

  const filteredReports = reports.filter((r) => {
    if (activeSuite !== 'ALL') {
      const suiteMatch = r.testSuiteName?.toLowerCase().includes(activeSuite.toLowerCase()) ||
                         r.endpointTested?.toLowerCase().includes(activeSuite.toLowerCase())
      if (!suiteMatch) return false
    }
    if (statusFilter !== 'ALL') {
      if (r.status?.toUpperCase() !== statusFilter.toUpperCase()) return false
    }
    return true
  })

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto pr-1">
      {/* Header Stage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">AI Evaluation & Reliability Harness</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
              QA Benchmark Suite
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Automated verification of RAG grounding facts, Resume ATS schema contracts, and code linter latency metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => runBenchmark('ALL')}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-white" />
                <span>Running Benchmarks...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run All Benchmarks</span>
              </>
            )}
          </button>

          {reports.length > 0 && (
            <button
              onClick={clearAllReports}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Clear all reports"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Metrics Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 shrink-0">
        {/* Metric 1: Total Runs */}
        <div className="glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Total Test Cases</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{summary.totalRuns || 0}</span>
            <span className="text-[10px] text-slate-400">executed</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400 truncate">
            {summary.latestBatchId ? `Batch: ${summary.latestBatchId}` : 'Ready for test run'}
          </div>
        </div>

        {/* Metric 2: Pass Rate */}
        <div className="glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Overall Pass Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {summary.passRate !== undefined ? `${summary.passRate}%` : '100%'}
            </span>
            <span className="text-[10px] text-emerald-300/80">passed</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">
            {summary.passedRuns || 0} pass / {summary.failedRuns || 0} fail
          </div>
        </div>

        {/* Metric 3: Average Latency */}
        <div className="glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Avg Request Latency</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">
              {summary.averageLatencyMs || 0}
            </span>
            <span className="text-[10px] text-amber-300">ms</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">P95 Sub-second target</div>
        </div>

        {/* Metric 4: Grounding & Relevancy */}
        <div className="glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Grounding Index</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-300 font-mono">
              {summary.averageGroundingScore ? `${Math.round(summary.averageGroundingScore * 100)}%` : '96%'}
            </span>
            <span className="text-[10px] text-indigo-400">cosine match</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">Zero Hallucination target</div>
        </div>

        {/* Metric 5: Token Consumption */}
        <div className="glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Tokens Consumed</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-300 font-mono">
              {summary.totalTokensConsumed?.toLocaleString() || 0}
            </span>
            <span className="text-[10px] text-purple-400">tokens</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-400">llama3.2 local model</div>
        </div>
      </div>

      {/* Target Suite Triggers & Filters */}
      <div className="glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Suite:
          </span>
          {[
            { id: 'ALL', label: 'All Suites' },
            { id: 'RAG', label: 'RAG Grounding' },
            { id: 'RESUME', label: 'Resume ATS' },
            { id: 'CODE', label: 'Code Inspector' },
            { id: 'AGENT', label: 'Tool Dispatch' }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSuite(s.id)}
              className={`text-xs px-3 py-1 rounded-xl transition-all font-medium ${
                activeSuite === s.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center bg-black/30 rounded-xl p-0.5 border border-white/5">
            {['ALL', 'PASSED', 'FAILED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-[11px] px-2.5 py-0.5 rounded-lg transition-all ${
                  statusFilter === st
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Quick trigger current active suite */}
          <button
            onClick={() => runBenchmark(activeSuite)}
            disabled={isRunning}
            className="text-xs px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 transition-all font-medium flex items-center gap-1.5 active:scale-[0.98]"
          >
            <Play className="w-3 h-3 text-cyan-400" />
            <span>Run {activeSuite} Suite</span>
          </button>
        </div>
      </div>

      {/* Test Cases Results List */}
      <div className="flex-1 glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-4 flex flex-col min-h-0">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Benchmark Executions & Verification Assertions</h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
              {filteredReports.length} cases
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredReports.length === 0 ? (
            <div className="h-44 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-6">
              <Activity className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-sm text-slate-300 font-medium">No benchmark evaluation runs recorded</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Click "Run All Benchmarks" above to execute automated precision, latency, and grounding tests across our AI endpoints.
              </p>
              <button
                onClick={() => runBenchmark('ALL')}
                className="mt-4 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
              >
                Execute Initial Benchmark
              </button>
            </div>
          ) : (
            filteredReports.map((report) => {
              const isExpanded = expandedId === report.id
              let assertions = []
              try {
                if (report.assertionResults) {
                  assertions = JSON.parse(report.assertionResults)
                }
              } catch (e) {
                assertions = []
              }

              const isPassed = report.status === 'PASSED'

              return (
                <div
                  key={report.id}
                  className={`rounded-2xl border transition-all ${
                    isPassed
                      ? 'bg-white/[0.02] border-white/5 hover:border-emerald-500/30'
                      : 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
                  }`}
                >
                  {/* Collapsed Header Bar */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="shrink-0">
                        {isPassed ? (
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                            <XCircle className="w-4 h-4 text-rose-400" />
                          </div>
                        )}
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white truncate">
                            {report.testCaseName}
                          </span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-white/10 text-slate-300 font-mono">
                            {report.endpointTested}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                          <span>{report.testSuiteName}</span>
                          <span className="text-slate-600">•</span>
                          <span>Model: <code className="text-indigo-300">{report.modelUsed}</code></span>
                          <span className="text-slate-600">•</span>
                          <span>Batch: <code className="text-cyan-300 font-mono">{report.runBatchId}</code></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Grounding Meter */}
                      <div className="hidden sm:flex flex-col items-end text-right">
                        <span className="text-[10px] text-slate-400">Grounding</span>
                        <span className="text-xs font-mono font-semibold text-indigo-300">
                          {Math.round((report.groundingScore || 1.0) * 100)}%
                        </span>
                      </div>

                      {/* Latency Badge */}
                      <div className="flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-amber-300">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{report.latencyMs}ms</span>
                      </div>

                      {/* Tokens Badge */}
                      <div className="hidden md:flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-purple-300">
                        <Cpu className="w-3 h-3 text-purple-400" />
                        <span>{report.totalTokens} tok</span>
                      </div>

                      <div className="text-slate-400 p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-3 text-xs">
                      {/* Assertions Grid */}
                      {assertions.length > 0 && (
                        <div>
                          <div className="text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                            Assertion Results ({assertions.length})
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {assertions.map((a, idx) => (
                              <div
                                key={idx}
                                className="p-2 rounded-xl bg-black/30 border border-white/5 flex items-start gap-2"
                              >
                                {a.passed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                )}
                                <div className="truncate">
                                  <div className="font-medium text-slate-200">{a.name}</div>
                                  <div className="text-[10px] text-slate-400 truncate">{a.details}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Input Payload & Output Response */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Input Prompt / Context:
                          </span>
                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-slate-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
                            {report.inputPayload || 'N/A'}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Verified AI Output:
                          </span>
                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-slate-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
                            {report.outputPayload || 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Error if present */}
                      {report.errorMessage && (
                        <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                          <span>Error logged: {report.errorMessage}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

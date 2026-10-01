import React, { useState, useEffect } from 'react'
import {
  Wrench,
  Sparkles,
  Bug,
  Code,
  Copy,
  Check,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Layers,
  ArrowRight,
  BookOpen
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function SelfHealingTestAssistant() {
  const { authHeader } = useAuth()
  const [samples, setSamples] = useState([])
  const [selectedSampleId, setSelectedSampleId] = useState('')
  const [targetFramework, setTargetFramework] = useState('SELENIUM_JAVA')
  const [errorLog, setErrorLog] = useState('')
  const [brokenLocator, setBrokenLocator] = useState('')
  const [domSnippet, setDomSnippet] = useState('')
  const [isHealing, setIsHealing] = useState(false)
  const [healedResult, setHealedResult] = useState(null)
  const [copiedType, setCopiedType] = useState(null)

  useEffect(() => {
    async function loadSamples() {
      try {
        const res = await fetch('/api/qa/self-heal/samples', { headers: authHeader() })
        if (res.ok) {
          const data = await res.json()
          setSamples(data || [])
          if (data && data.length > 0) {
            applySample(data[0])
          }
        }
      } catch (e) {
        console.warn('Could not load self-healing samples:', e)
      }
    }
    loadSamples()
  }, [])

  const applySample = (sample) => {
    setSelectedSampleId(sample.id)
    setErrorLog(sample.errorLog || '')
    setBrokenLocator(sample.brokenLocator || '')
    setDomSnippet(sample.domSnippet || '')
    setTargetFramework(sample.framework || 'SELENIUM_JAVA')
    setHealedResult(null)
  }

  const handleSampleChange = (e) => {
    const sId = e.target.value
    if (!sId) {
      setSelectedSampleId('')
      setErrorLog('')
      setBrokenLocator('')
      setDomSnippet('')
      setHealedResult(null)
      return
    }
    const found = samples.find(s => s.id === sId)
    if (found) {
      applySample(found)
    }
  }

  const executeSelfHeal = async () => {
    if (!domSnippet.trim() && !errorLog.trim()) return
    setIsHealing(true)
    try {
      const res = await fetch('/api/qa/self-heal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({
          errorLog,
          brokenLocator,
          domSnippet,
          targetFramework
        })
      })

      if (res.ok) {
        const data = await res.json()
        setHealedResult(data)
      }
    } catch (e) {
      console.error('Self-healing test assistant error:', e)
    } finally {
      setIsHealing(false)
    }
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => setCopiedType(null), 2000)
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto pr-1">
      {/* Header Stage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Wrench className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">AI-Powered Self-Healing Test Assistant</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              QA Autonomous Healer
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Ingest broken Selenium, Playwright, or Cypress test error logs & modified HTML DOMs. llama3.2 synthesizes resilient locators.
          </p>
        </div>

        {/* Framework & Preset Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Selector */}
          <select
            value={selectedSampleId}
            onChange={handleSampleChange}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-200 focus:outline-none focus:border-indigo-400"
          >
            <option value="">-- Custom Input / Blank --</option>
            {samples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>

          {/* Target Framework Switcher */}
          <select
            value={targetFramework}
            onChange={(e) => setTargetFramework(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 font-semibold focus:outline-none focus:border-cyan-400"
          >
            <option value="SELENIUM_JAVA">Selenium (Java)</option>
            <option value="PLAYWRIGHT_TS">Playwright (TypeScript)</option>
            <option value="PLAYWRIGHT_JAVA">Playwright (Java)</option>
            <option value="CYPRESS">Cypress (JS/TS)</option>
          </select>
        </div>
      </div>

      {/* Main Dual-Column Input Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Error Log & Broken Locator (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* Broken Locator Input */}
          <div className="glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5 text-rose-400" />
                Failing / Broken Locator
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Original XPath / CSS</span>
            </div>
            <input
              type="text"
              value={brokenLocator}
              onChange={(e) => setBrokenLocator(e.target.value)}
              placeholder="e.g. #checkout-btn-legacy or //button[@id='submit']"
              className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-rose-300 placeholder:text-slate-600 focus:outline-none focus:border-rose-400"
            />
          </div>

          {/* Test Error Log / Stacktrace */}
          <div className="glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-3.5 space-y-2 flex-1 flex flex-col">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                Test Failure Stack Trace / Error Log
              </span>
              <span className="text-[10px] text-slate-500 font-mono">NoSuchElementException</span>
            </div>
            <textarea
              value={errorLog}
              onChange={(e) => setErrorLog(e.target.value)}
              placeholder="Paste terminal error log or Selenium/Playwright stack trace here..."
              rows={8}
              className="w-full flex-1 text-[11px] font-mono p-3 rounded-xl bg-black/40 border border-white/10 text-amber-300/90 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Right Column: Modified HTML DOM Context & Trigger (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-3.5 space-y-2 flex-1 flex flex-col">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                Modified HTML DOM Snippet / Page Source Context
              </span>
              <span className="text-[10px] text-slate-500 font-mono">React 19 / Modern DOM</span>
            </div>
            <textarea
              value={domSnippet}
              onChange={(e) => setDomSnippet(e.target.value)}
              placeholder="Paste updated HTML DOM context containing the modified target element..."
              rows={11}
              className="w-full flex-1 text-[11px] font-mono p-3 rounded-xl bg-black/40 border border-white/10 text-cyan-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 resize-none leading-relaxed"
            />
          </div>

          {/* Glowing Action Button */}
          <button
            onClick={executeSelfHeal}
            disabled={isHealing || (!domSnippet.trim() && !errorLog.trim())}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {isHealing ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-white" />
                <span>llama3.2 Analyzing DOM Structure & Synthesizing Healed Locator...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                <span>Heal Locator & Generate Resilient Test Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Healed Results Stage */}
      {healedResult && (
        <div className="glass-panel-elevated bg-slate-900/70 border border-indigo-500/30 shadow-[0_8px_32px_0_rgba(79,70,229,0.2)] rounded-3xl p-5 space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Healed Locator Synthesis</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                {Math.round((healedResult.confidenceScore || 0.95) * 100)}% Confidence
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                {healedResult.locatorType || 'DATA_TESTID'}
              </span>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Execution Latency: <strong className="text-amber-300">{healedResult.executionLatencyMs}ms</strong>
            </div>
          </div>

          {/* Primary Healed Locator Card */}
          <div className="p-4 rounded-2xl bg-black/40 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Primary Recommended Locator:
              </div>
              <div className="text-sm font-mono font-bold text-cyan-300 select-all">
                {healedResult.primaryHealedLocator}
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(healedResult.primaryHealedLocator, 'primary')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all active:scale-[0.98] shrink-0"
            >
              {copiedType === 'primary' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Locator</span>
                </>
              )}
            </button>
          </div>

          {/* Framework Code Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                Synthesized Code Replacement ({targetFramework})
              </span>
              <button
                onClick={() => copyToClipboard(healedResult.healedCodeSnippet, 'code')}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                {copiedType === 'code' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                {copiedType === 'code' ? 'Copied Snippet' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-3.5 rounded-2xl bg-black/50 border border-white/10 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
              {healedResult.healedCodeSnippet}
            </pre>
          </div>

          {/* Root Cause Analysis & Explanation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Root Cause Analysis
              </div>
              <p className="text-slate-300 leading-relaxed">
                {healedResult.rootCauseAnalysis}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Resilience Justification
              </div>
              <p className="text-slate-300 leading-relaxed">
                {healedResult.explanation}
              </p>
            </div>
          </div>

          {/* Alternative Fallback Locators */}
          {healedResult.alternativeLocators && healedResult.alternativeLocators.length > 0 && (
            <div className="pt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" />
                Alternative Fallback Locators:
              </div>
              <div className="flex flex-wrap gap-2">
                {healedResult.alternativeLocators.map((alt, aIdx) => (
                  <button
                    key={aIdx}
                    onClick={() => copyToClipboard(alt, `alt-${aIdx}`)}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-1.5 transition-all"
                  >
                    <span>{alt}</span>
                    {copiedType === `alt-${aIdx}` ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

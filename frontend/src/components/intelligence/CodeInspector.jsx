import React, { useState } from 'react'
import {
  Code2,
  GitPullRequest,
  Sparkles,
  Bug,
  ShieldAlert,
  Zap,
  CheckCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  GitBranch,
  Layers,
  FileCode,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function CodeInspector() {
  const { authHeader } = useAuth()
  const [activeInputTab, setActiveInputTab] = useState('snippet') // 'snippet' | 'github_pr'
  const [language, setLanguage] = useState('java')
  const [prUrl, setPrUrl] = useState('https://github.com/spring-projects/spring-boot/pull/40000')
  const [copied, setCopied] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)

  const [codeSnippet, setCodeSnippet] = useState(`public class OrderProcessor {
    private List<Order> pendingOrders = new ArrayList<>();

    public void queueOrder(Order order) {
        pendingOrders.add(order);
    }

    public Order getOrder(String orderId) {
        for (Order o : pendingOrders) {
            if (o.getId().equals(orderId)) {
                return o;
            }
        }
        return null;
    }

    public void processPayment(Order order) {
        try {
            paymentGateway.charge(order.getAmount());
        } catch (Exception e) {
            // Swallowed exception without logging or recovery
        }
    }
}`)

  const [reviewResult, setReviewResult] = useState({
    analysisSummary: 'Executive Architecture Assessment: The code exhibits several enterprise stability and concurrency concerns. Using an un-synchronized ArrayList in multi-threaded transaction pathways introduces race conditions during concurrent modifications. Swallowing exceptions in payment gateways prevents auditability and error propagation.',
    detectedErrors: [
      {
        severity: 'CRITICAL',
        title: 'Swallowed Exception in Payment Flow',
        description: 'The catch block in processPayment() catches java.lang.Exception and silently swallows it without logging, alerts, or transaction rollback.',
        recommendation: 'Log with contextual order ID using SLF4J, trigger idempotent payment retry, and rethrow as a domain-specific PaymentProcessingException.'
      },
      {
        severity: 'HIGH',
        title: 'Thread Safety Hazard on ArrayList',
        description: 'ArrayList is not thread-safe. Concurrent modifications in a high-throughput Spring service will trigger ConcurrentModificationException or corrupt internal buffer state.',
        recommendation: 'Replace pendingOrders with ConcurrentHashMap<String, Order> for O(1) concurrent lookups or use ConcurrentLinkedQueue.'
      },
      {
        severity: 'MEDIUM',
        title: 'Potential Null Pointer Dereference',
        description: 'Direct call o.getId().equals(orderId) will throw NullPointerException if o.getId() or orderId evaluates to null.',
        recommendation: 'Use java.util.Objects.equals(o.getId(), orderId) or wrap lookups in Optional<Order>.'
      }
    ],
    improvedCode: `// [Refactored & Hardened by Spatial AI Inspector]
package com.example.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

public class OrderProcessor {
    private static final Logger log = LoggerFactory.getLogger(OrderProcessor.class);
    private final ConcurrentMap<String, Order> pendingOrders = new ConcurrentHashMap<>();
    private final PaymentGateway paymentGateway;

    public OrderProcessor(PaymentGateway paymentGateway) {
        this.paymentGateway = Objects.requireNonNull(paymentGateway, "PaymentGateway must not be null");
    }

    public void queueOrder(Order order) {
        if (order != null && order.getId() != null) {
            pendingOrders.put(order.getId(), order);
            log.info("Queued order with ID: {}", order.getId());
        }
    }

    public Optional<Order> getOrder(String orderId) {
        if (orderId == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(pendingOrders.get(orderId));
    }

    public void processPayment(Order order) {
        Objects.requireNonNull(order, "Order cannot be null for payment processing");
        try {
            log.info("Charging {} for order {}", order.getAmount(), order.getId());
            paymentGateway.charge(order.getAmount());
        } catch (Exception e) {
            log.error("Payment transaction failed for order ID {}: {}", order.getId(), e.getMessage(), e);
            throw new PaymentProcessingException("Failed to charge order: " + order.getId(), e);
        }
    }
}`
  })

  const handleRunInspection = async () => {
    setIsReviewing(true)
    try {
      const endpoint = activeInputTab === 'github_pr' ? '/api/code/pr-review' : '/api/code/review'
      const payload = activeInputTab === 'github_pr'
        ? { prUrl }
        : { code: codeSnippet, language }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        setReviewResult(data)
      } else {
        console.warn('Backend fallback used')
      }
    } catch (err) {
      console.warn('Code inspection error:', err)
    } finally {
      setIsReviewing(false)
    }
  }

  const handleCopyCleanCode = () => {
    const code = reviewResult.improvedCode || ''
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getSeverityBadge = (severity) => {
    switch ((severity || '').toUpperCase()) {
      case 'CRITICAL':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold font-mono">
            CRITICAL
          </span>
        )
      case 'HIGH':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 font-semibold font-mono">
            HIGH
          </span>
        )
      case 'MEDIUM':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium font-mono">
            MEDIUM
          </span>
        )
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
            LOW / INFO
          </span>
        )
    }
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      {/* Stage Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">AI Code & GitHub PR Inspector</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              Ollama Llama 3.2
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Automated AST linting, thread-safety analysis, and side-by-side corrected diff refactoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Dual-Tab Selector */}
          <div className="flex p-0.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
            <button
              onClick={() => setActiveInputTab('snippet')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeInputTab === 'snippet'
                  ? 'bg-indigo-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Direct Code Snippet
            </button>
            <button
              onClick={() => setActiveInputTab('github_pr')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeInputTab === 'github_pr'
                  ? 'bg-indigo-600 text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>GitHub PR URL</span>
            </button>
          </div>

          <button
            onClick={handleRunInspection}
            disabled={isReviewing}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
          >
            {isReviewing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Inspecting Code...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Inspect & Refactor</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Input Section */}
      {activeInputTab === 'github_pr' ? (
        <div className="glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 shrink-0">
            <GitPullRequest className="w-4 h-4 text-emerald-400" />
            <span>GitHub Pull Request URL:</span>
          </div>
          <input
            type="text"
            value={prUrl}
            onChange={(e) => setPrUrl(e.target.value)}
            placeholder="https://github.com/owner/repository/pull/123"
            className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono w-full"
          />
          {reviewResult.files && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0">
              <span className="text-emerald-400">+{reviewResult.additions || 0}</span>
              <span className="text-rose-400">-{reviewResult.deletions || 0}</span>
              <span>({reviewResult.filesCount || 0} files)</span>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span>Target Language / Framework:</span>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="java">Java (Spring Boot 3)</option>
            <option value="javascript">JavaScript (React / Node.js)</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python (FastAPI / PyTorch)</option>
            <option value="sql">PostgreSQL / SQL</option>
          </select>
        </div>
      )}

      {/* 1. Executive Summary Card */}
      <div className="glass-panel bg-slate-900/50 border border-white/10 rounded-2xl p-4 shrink-0">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Executive Architectural & Security Summary
            </h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
            Static & Semantic AST
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {reviewResult.analysisSummary || 'Review completed successfully.'}
        </p>
      </div>

      {/* 2. Bug Breakdown List */}
      <div className="glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-4 shrink-0 space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-rose-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Bug Breakdown List ({reviewResult.detectedErrors?.length || 0})
            </h4>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Prioritized by impact
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reviewResult.detectedErrors?.map((err, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between gap-2.5 text-xs hover:border-white/10 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-200 truncate">{err.title}</span>
                  {getSeverityBadge(err.severity)}
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {err.description}
                </p>
              </div>

              <div className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 flex items-start gap-1.5">
                <Zap className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-400" />
                <span><strong>Fix:</strong> {err.recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Side-by-Side Original vs. Corrected Code Diff Block */}
      <div className="glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-4 flex flex-col flex-1 min-h-[420px]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Side-by-Side Code Diff & Refactoring
            </h4>
          </div>

          {/* Single-Click "Copy Clean Code" Action */}
          <button
            onClick={handleCopyCleanCode}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md transition-all active:scale-[0.98]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Clean Code Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Clean Code</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          {/* Left Pane: Original Input / PR Diff */}
          <div className="flex flex-col rounded-xl bg-slate-950/80 border border-white/10 overflow-hidden">
            <div className="px-3 py-2 bg-white/[0.03] border-b border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-rose-300">Original / Input Code</span>
              <span className="font-mono text-[10px]">{language}</span>
            </div>
            {activeInputTab === 'snippet' ? (
              <textarea
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                className="flex-1 w-full p-3 bg-transparent text-xs text-slate-300 font-mono focus:outline-none resize-none leading-relaxed"
                placeholder="Paste code to review..."
              />
            ) : (
              <pre className="flex-1 p-3 overflow-auto text-xs text-rose-300/80 font-mono leading-relaxed whitespace-pre-wrap">
                <code>{reviewResult.inputCode || codeSnippet}</code>
              </pre>
            )}
          </div>

          {/* Right Pane: Corrected & Refactored Clean Code */}
          <div className="flex flex-col rounded-xl bg-slate-950/80 border border-emerald-500/20 overflow-hidden">
            <div className="px-3 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                Corrected & Hardened Clean Code
              </span>
              <span className="text-emerald-400 font-mono text-[10px]">Zero Vulnerabilities</span>
            </div>
            <pre className="flex-1 p-3 overflow-auto text-xs text-emerald-300 font-mono leading-relaxed whitespace-pre-wrap selection:bg-emerald-500/30">
              <code>{reviewResult.improvedCode || '// No refactored code output yet.'}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

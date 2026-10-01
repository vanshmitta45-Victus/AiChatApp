import React, { useState, useRef } from 'react'
import {
  FileText,
  Sparkles,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Tag,
  AlertOctagon,
  FileCheck
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

// Circular Radial Gauge Component
function RadialScoreGauge({ score = 85, label = 'Score', color = 'emerald' }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  const colorMap = {
    emerald: {
      stroke: 'stroke-emerald-400',
      text: 'text-emerald-400',
      glow: 'drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]'
    },
    cyan: {
      stroke: 'stroke-cyan-400',
      text: 'text-cyan-400',
      glow: 'drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]'
    },
    indigo: {
      stroke: 'stroke-indigo-400',
      text: 'text-indigo-400',
      glow: 'drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]'
    }
  }

  const selectedTheme = colorMap[color] || colorMap.emerald

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.02] border border-white/5">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={`${selectedTheme.stroke} ${selectedTheme.glow} transition-all duration-1000 ease-out`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-2xl font-black font-mono tracking-tight ${selectedTheme.text}`}>
            {score}%
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            {score >= 85 ? 'Optimized' : score >= 70 ? 'Moderate' : 'Needs Work'}
          </span>
        </div>
      </div>
      <span className="text-xs font-semibold text-slate-300 mt-2">{label}</span>
    </div>
  )
}

export default function ResumeStudio() {
  const { authHeader } = useAuth()
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer')
  const [activeTab, setActiveTab] = useState('critique') // 'critique' | 'keywords' | 'refactor'
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [analysisId, setAnalysisId] = useState(null)
  const fileInputRef = useRef(null)

  const [resumeText, setResumeText] = useState(`ALEX RIVERA
alex.rivera@company.com | +1 (555) 234-5678 | San Francisco, CA

SUMMARY
Senior Full Stack & AI Systems Engineer with 5+ years building enterprise SaaS platforms, real-time messaging pipelines, and AI RAG knowledge backends.

EXPERIENCE
Full Stack Engineer — CloudTech Labs (2022 - Present)
• Built backend microservices with Java and Spring Boot.
• Maintained legacy REST APIs in Java 11.
• Implemented STOMP WebSocket messaging for spatial chat and live collaborative rooms.
• Integrated PostgreSQL pgvector with 768-dim embeddings for semantic doc search.

Junior Developer — Nexus Systems (2020 - 2022)
• Developed CRUD endpoints for user access management.
• Wrote unit tests in JUnit and maintained Docker container build pipelines.

EDUCATION & SKILLS
B.S. in Computer Science — University of California, Berkeley (2020)
Languages & Tools: Java 21, Spring Boot 3, React, Tailwind CSS, PostgreSQL, Docker, Kafka, Ollama.`)

  const [evaluation, setEvaluation] = useState({
    id: 1,
    overallScore: 88,
    atsScore: 91,
    criticalIssues: [
      'Bullet points lack quantifiable business metrics (e.g. latency reduction %, throughput, or users served).',
      'Header lacks direct links to verified GitHub or technical portfolio repositories.'
    ],
    missingKeywords: [
      'Distributed Systems',
      'STOMP WebSockets',
      'pgvector',
      'Resilience4j',
      'Docker Compose',
      'Kubernetes',
      'OAuth2/OIDC',
      'Reactive Streams'
    ],
    structuralImprovements: [
      {
        currentText: 'Built backend microservices with Java and Spring Boot.',
        whyChange: 'Passive phrasing without quantifiable engineering impact or scale.',
        suggestedText: 'Architected high-throughput Spring Boot 3 microservices, reducing API response times by 38% under 10,000 concurrent requests.'
      },
      {
        currentText: 'Maintained legacy REST APIs in Java 11.',
        whyChange: 'Does not showcase technical modernization initiative or performance wins.',
        suggestedText: 'Modernized legacy Java 11 endpoints to non-blocking Spring WebFlux, boosting request concurrency by 55%.'
      },
      {
        currentText: 'Developed CRUD endpoints for user access management.',
        whyChange: 'Lacks security rigor or enterprise RBAC method authorization framing.',
        suggestedText: 'Implemented fine-grained RBAC and JWT token filters adhering to OAuth2 specifications across 12 distributed services.'
      }
    ]
  })

  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setResumeFile(file)
    setIsAnalyzing(true)
    setStatusMessage(`Analyzing and extracting text from ${file.name}...`)
    setErrorMessage('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('targetRole', targetRole)

    try {
      const res = await fetch('/api/resumes/analyze', {
        method: 'POST',
        headers: authHeader(),
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        setEvaluation(data)
        if (data.extractedText) {
          setResumeText(data.extractedText)
        }
        if (data.id) setAnalysisId(data.id)
        setStatusMessage(`Successfully analyzed ${file.name}! Overall: ${data.overallScore}%, ATS: ${data.atsScore}%`)
      } else {
        const err = await res.json().catch(() => ({}))
        setErrorMessage(err.error || 'Failed to analyze resume file')
      }
    } catch (err) {
      setErrorMessage(`Network error during analysis: ${err.message}`)
    } finally {
      setIsAnalyzing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAnalyzeText = async () => {
    if (!resumeText.trim()) return
    setIsAnalyzing(true)
    setStatusMessage('Evaluating resume text against target role criteria...')
    setErrorMessage('')

    try {
      const res = await fetch('/api/resumes/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({
          text: resumeText,
          targetRole,
          fileName: resumeFile ? resumeFile.name : 'resume.txt'
        })
      })

      if (res.ok) {
        const data = await res.json()
        setEvaluation(data)
        if (data.id) setAnalysisId(data.id)
        setStatusMessage(`Resume evaluation complete! Overall: ${data.overallScore}%, ATS: ${data.atsScore}%`)
      } else {
        const err = await res.json().catch(() => ({}))
        setErrorMessage(err.error || 'Evaluation failed on backend')
      }
    } catch (err) {
      setErrorMessage(`Evaluation error: ${err.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleLoadSample = (sampleType) => {
    if (sampleType === 'ARCHITECT') {
      setTargetRole('Staff AI Systems Architect')
      setResumeText(`VANSH MITTAL
vansh@company.com | +1 (555) 901-2345 | San Francisco, CA

SUMMARY
Principal AI Systems Architect with 8+ years leading enterprise distributed architectures, real-time streaming engines, and PostgreSQL pgvector RAG microservices.

PROFESSIONAL EXPERIENCE
Principal Architect — Spatial Intelligence Corp (2022 - Present)
• Architected high-throughput Spring Boot 3 reactive microservices processing 25,000 requests/sec.
• Deployed PostgreSQL pgvector with 768-dimensional nomic-embed-text embeddings, reducing search latency by 45%.
• Integrated STOMP over WebSockets for multi-topology real-time chat with end-to-end RBAC security.

Senior Backend Engineer — Nexus Cloud Systems (2019 - 2022)
• Built RESTful and gRPC microservices in Java 17 and Docker containers.
• Implemented OAuth2 and JWT token validation across 15 distributed services.

EDUCATION
B.S. in Computer Science — UC Berkeley (2019)
Skills: Java 21, Spring Boot 3, PostgreSQL, pgvector, Docker, Kubernetes, React, Tailwind CSS, Ollama.`)
    } else {
      setTargetRole('Senior Full Stack Engineer')
      setResumeText(`SARAH JENKINS
sarah.jenkins@company.com | +1 (555) 789-0123 | New York, NY

SUMMARY
Senior Full Stack Engineer specializing in React, Spring Boot, and enterprise real-time collaboration tools.

EXPERIENCE
Lead Software Engineer — Enterprise Core (2021 - Present)
• Developed responsive spatial computing web interfaces using React, Vite, and Tailwind CSS.
• Built Jira-style Kanban sprint boards with subtask checklists and optimistic UI updates.
• Configured Apache PDFBox text extraction pipelines and OpenPDF automated CV builder.

Full Stack Developer — Delta Systems (2018 - 2021)
• Built CRUD microservices and SQL stored procedures for identity and user access control.
• Maintained CI/CD pipelines and automated integration test suites with 95% code coverage.

EDUCATION
B.S. in Software Engineering — MIT (2018)
Skills: React, TypeScript, Java, Spring Boot, PostgreSQL, Git, Kafka, Jest, Vite.`)
    }
    setStatusMessage('Sample loaded into editor. Click "Evaluate Resume" to analyze!')
  }

  const handleDownloadPdf = () => {
    const targetId = analysisId || evaluation.id || 1
    window.open(`/api/resumes/${targetId}/download-pdf`, '_blank')
  }

  const handleCopySuggestion = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto">
      {/* Stage Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Award className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">AI Resume Studio & ATS CV Builder</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              OpenPDF + Llama 3.2
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Automated ATS scoring, line-item bullet refactoring, and instant modern ATS-compliant PDF generation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-200 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            <span>{resumeFile ? resumeFile.name : 'Upload PDF / CV'}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.txt,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Download Modern ATS PDF</span>
          </button>
        </div>
      </div>

      {/* Target Role Selector & Action Bar */}
      <div className="glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-3 shrink-0">
        <span className="text-xs font-semibold text-slate-300 shrink-0">Target Career Role:</span>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Senior Full Stack Engineer, AI Architect"
          className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full"
        />
        <button
          onClick={handleAnalyzeText}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all active:scale-[0.98] shrink-0"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Evaluating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Re-Evaluate CV</span>
            </>
          )}
        </button>
      </div>

      {/* Feedback Banners */}
      {statusMessage && (
        <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-center justify-between gap-2 shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage('')} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between gap-2 shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Main Grid: Left editor (5 cols) + Right score & critique inspector (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Left Column: Editable Raw CV Content */}
        <div className="lg:col-span-5 flex flex-col glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-4 min-h-[360px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 shrink-0">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              Candidate Resume Data
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleLoadSample('ARCHITECT')}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-colors"
                title="Load sample architect resume"
              >
                Sample 1
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('FULLSTACK')}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-colors"
                title="Load sample fullstack resume"
              >
                Sample 2
              </button>
            </div>
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={18}
            className="flex-1 w-full p-3 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            placeholder="Paste resume content here..."
          />
        </div>

        {/* Right Column: Circular Radial Progress Gauges & Tabbed Critique Inspector */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Radial Progress Score Banner */}
          <div className="glass-panel bg-slate-900/50 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white">Algorithmic Resume Diagnostics</h3>
                <p className="text-[11px] text-slate-400">Targeting {targetRole}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold font-mono">
                ATS Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <RadialScoreGauge
                score={evaluation.overallScore || 85}
                label="Overall Profile Score"
                color="cyan"
              />
              <RadialScoreGauge
                score={evaluation.atsScore || 90}
                label="ATS Machine Parsing Score"
                color="emerald"
              />
            </div>
          </div>

          {/* Tabbed Critique Inspector */}
          <div className="glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-4 flex-1 flex flex-col min-h-0">
            {/* Tabs Bar */}
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10 shrink-0">
              <button
                onClick={() => setActiveTab('critique')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'critique'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Critical Issues</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-200 font-mono">
                  {evaluation.criticalIssues?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('keywords')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'keywords'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Missing Keywords</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-200 font-mono">
                  {evaluation.missingKeywords?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('refactor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'refactor'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Line-Item Refactor</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-200 font-mono">
                  {evaluation.structuralImprovements?.length || 0}
                </span>
              </button>
            </div>

            {/* Tab 1: Critical Issues */}
            {activeTab === 'critique' && (
              <div className="space-y-2.5 overflow-y-auto pr-1">
                {(!evaluation.criticalIssues || evaluation.criticalIssues.length === 0) ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>No critical ATS parsing blockers detected!</span>
                  </div>
                ) : (
                  evaluation.criticalIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200 flex items-start gap-2.5 leading-relaxed"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{issue}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Missing Keywords */}
            {activeTab === 'keywords' && (
              <div className="space-y-3 overflow-y-auto pr-1">
                <p className="text-xs text-slate-400">
                  Adding these high-frequency recruiter terms will increase keyword match density in candidate filtering pipelines:
                </p>

                <div className="flex flex-wrap gap-2">
                  {evaluation.missingKeywords?.map((kw, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-medium flex items-center gap-1.5 hover:bg-indigo-500/20 transition-colors"
                    >
                      <Tag className="w-3 h-3 text-cyan-400" />
                      <span>{kw}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Line-Item Refactor */}
            {activeTab === 'refactor' && (
              <div className="space-y-3 overflow-y-auto pr-1">
                {evaluation.structuralImprovements?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5 text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                        Current Phrasing:
                      </span>
                      <p className="text-slate-400 mt-0.5 font-mono line-through opacity-80">
                        {item.currentText}
                      </p>
                    </div>

                    <div className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
                      <strong>Why Change:</strong> {item.whyChange}
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          ATS High-Impact Recommendation:
                        </span>
                        <button
                          onClick={() => handleCopySuggestion(item.suggestedText, idx)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-medium transition-colors"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Bullet</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-emerald-200 font-mono leading-relaxed">
                        {item.suggestedText}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

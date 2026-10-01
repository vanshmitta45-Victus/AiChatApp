import React, { useState } from 'react'
import {
  Settings,
  User,
  Shield,
  Sparkles,
  Sliders,
  Database,
  Radio,
  Save,
  Check
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function SettingsStage() {
  const { user, role } = useAuth()
  const [displayName, setDisplayName] = useState(user?.fullName || 'System User')
  const [department, setDepartment] = useState(user?.department || 'Core Engineering')
  const [selectedModel, setSelectedModel] = useState('llama3.2')
  const [ambientGlow, setAmbientGlow] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">System Settings & Preferences</h1>
          </div>
          <p className="text-xs text-slate-400">
            Configure profile identities, spatial display parameters, and local Ollama model routing
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saved ? 'Saved Preferences' : 'Save Changes'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* User Identity Section */}
        <div className="glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Profile & Identity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="text"
                disabled
                value={user?.email || 'user@company.com'}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/50 border border-white/5 text-xs text-slate-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Department</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Security Role</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold font-mono">
                  {role || 'STAFF'}
                </span>
                <span className="text-[11px] text-slate-500">Managed via Identity Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spatial UI Controls */}
        <div className="glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Spatial Computing Canvas</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <div className="text-xs font-semibold text-slate-200">Ambient Glow Orbs</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Render radial background glow orbs in deep indigo (#4338ca22) and cyan (#06b6d418)
                </div>
              </div>
              <input
                type="checkbox"
                checked={ambientGlow}
                onChange={e => setAmbientGlow(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <div className="text-xs font-semibold text-slate-200">Specular Top Highlights</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Subtle 1px specular lighting on glassmorphic borders
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Local AI Engine Configuration */}
        <div className="glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span>AI Suite & Vector Settings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Default Ollama Model</label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="llama3.2">llama3.2 (Recommended)</option>
                <option value="mistral">mistral</option>
                <option value="codellama">codellama</option>
                <option value="deepseek-r1">deepseek-r1</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Vector Dimensions</label>
              <input
                type="text"
                disabled
                value="768 dimensions (nomic-embed-text / pgvector)"
                className="w-full px-3 py-2 rounded-xl bg-slate-950/50 border border-white/5 text-xs text-slate-400 font-mono"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

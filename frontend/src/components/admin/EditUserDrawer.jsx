import React, { useState, useEffect } from 'react'
import {
  X,
  Shield,
  Save,
  KeyRound,
  Building,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  Lock,
  Power
} from 'lucide-react'

export default function EditUserDrawer({
  isOpen,
  onClose,
  user,
  onSaveUser
}) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    department: '',
    role: 'STAFF',
    status: 'ACTIVE',
    password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        department: user.department || 'General',
        role: user.role ? user.role.replace('ROLE_', '') : 'STAFF',
        status: user.status || 'ACTIVE',
        password: ''
      })
      setErrorMsg('')
    }
  }, [user])

  if (!isOpen || !user) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        department: formData.department.trim(),
        role: formData.role,
        status: formData.status
      }

      if (formData.password && formData.password.trim().length >= 4) {
        payload.password = formData.password.trim()
      }

      await onSaveUser(user.id, payload)
      onClose()
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update user profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Dimmed backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-panel-elevated bg-slate-900/95 border-l border-white/20 shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Drawer Header */}
          <div>
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20 shrink-0">
                  <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center font-bold text-white text-sm">
                    {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Edit Identity Credentials</h3>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ID #{user.id} • @{user.username}
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form Fields */}
            <form id="edit-user-form" onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Assigned Department</label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Security Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="STAFF">STAFF</option>
                    <option value="TEAM_LEADER">TEAM_LEADER</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Activation Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="DEACTIVATED">DEACTIVATED</option>
                  </select>
                </div>
              </div>

              {/* Password Reset Section */}
              <div className="pt-3 border-t border-white/10">
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>Reset Password</span>
                  <span className="text-[10px] text-slate-500 font-normal">Leave blank to keep current</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Enter new credential..."
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Status Switch Toggle */}
              <div className="pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Account Access</div>
                    <div className="text-[11px] text-slate-400">
                      {formData.status === 'ACTIVE' ? 'User can log in & access workspace' : 'Account is locked/suspended'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: formData.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Drawer Actions Footer */}
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
              form="edit-user-form"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import EditUserDrawer from './EditUserDrawer'
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  X,
  Mail,
  Lock,
  Building,
  KeyRound,
  Power
} from 'lucide-react'

export default function IdentityManagementPanel() {
  const { authHeader, role, isAdminOrManager } = useAuth()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modals & Drawers state
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // New user form state
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'STAFF',
    department: 'Engineering'
  })

  // Fetch all users from backend
  const fetchUsers = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const res = await fetch('/api/admin/users', { headers: authHeader() })
      if (res.ok) {
        const data = await res.json()
        setUsers(data || [])
      } else {
        const err = await res.json()
        setErrorMessage(err.message || 'Failed to load user directory.')
      }
    } catch (e) {
      setErrorMessage('Network error while connecting to /api/admin/users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    const params = new URLSearchParams(window.location.search)
    if (params.get('create') === 'true') {
      setIsCreateModalOpen(true)
    }
  }, [])

  // Create new user handler
  const handleCreateUser = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify(newUser)
      })

      if (res.ok) {
        const created = await res.json()
        setSuccessMessage(`User @${created.username || newUser.username} successfully provisioned!`)
        setIsCreateModalOpen(false)
        setNewUser({
          username: '',
          email: '',
          password: '',
          full_name: '',
          role: 'STAFF',
          department: 'Engineering'
        })
        fetchUsers()
      } else {
        const data = await res.json()
        setErrorMessage(data.error || 'Failed to provision user')
      }
    } catch (e) {
      setErrorMessage('Error provisioning user')
    }
  }

  // Update existing user handler (from EditUserDrawer)
  const handleSaveUser = async (id, updatedPayload) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader()
      },
      body: JSON.stringify(updatedPayload)
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to update user identity')
    }

    setSuccessMessage(`User #${id} updated successfully!`)
    fetchUsers()
  }

  // Quick toggle status directly on table
  const handleQuickToggleStatus = async (userObj) => {
    const nextStatus = userObj.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    // Optimistic update
    setUsers(prev => prev.map(u => (u.id === userObj.id ? { ...u, status: nextStatus } : u)))

    try {
      await fetch(`/api/admin/users/${userObj.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
        body: JSON.stringify({
          full_name: userObj.full_name,
          email: userObj.email,
          department: userObj.department,
          role: userObj.role,
          status: nextStatus
        })
      })
    } catch (err) {
      fetchUsers()
    }
  }

  const openDrawerForUser = (u) => {
    setSelectedUserForEdit(u)
    setIsDrawerOpen(true)
  }

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q))

    const userRole = u.role ? u.role.replace('ROLE_', '') : 'STAFF'
    const matchesRole = roleFilter === 'ALL' || userRole === roleFilter
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  return (
    <div className="space-y-5 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold font-mono">
              RBAC Security Shield
            </span>
            <span className="text-xs text-slate-400">Authenticated as {role}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Identity & Access Management Workspace</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Provision user accounts, adjust roles, enforce department security, and manage activation states
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchUsers}
            className="p-2 rounded-xl glass-pill hover:bg-white/10 text-slate-300 transition-all"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New ID</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 shrink-0">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 shrink-0">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="glass-panel-subtle bg-slate-900/40 p-3 border border-white/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, username, email, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="TEAM_LEADER">TEAM_LEADER</option>
              <option value="STAFF">STAFF</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="DEACTIVATED">DEACTIVATED</option>
            </select>
          </div>
        </div>
      </div>

      {/* High-Density Frosted Glass Data Table */}
      <div className="flex-1 glass-panel-subtle bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">User Avatar & Name</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status / Switch</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No identities match the current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const cleanRole = u.role ? u.role.replace('ROLE_', '') : 'STAFF'
                  const isActive = u.status === 'ACTIVE'

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Avatar & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                            {u.full_name?.charAt(0) || u.username?.charAt(0) || 'U'}
                          </div>
                          <div className="truncate">
                            <div className="font-semibold text-white truncate">{u.full_name || 'System User'}</div>
                            <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3 px-4 font-mono text-cyan-400/90 text-xs">
                        @{u.username}
                      </td>

                      {/* Role Pill */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          cleanRole === 'ADMIN'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : cleanRole === 'MANAGER'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : cleanRole === 'TEAM_LEADER'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                        }`}>
                          {cleanRole}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="py-3 px-4 text-slate-300">
                        {u.department || 'General'}
                      </td>

                      {/* Status & Switch */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuickToggleStatus(u)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              isActive ? 'bg-emerald-500' : 'bg-slate-700'
                            }`}
                            title={`Click to ${isActive ? 'Suspend' : 'Activate'}`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                isActive ? 'translate-x-4' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className={`text-[10px] font-semibold ${
                            isActive ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {u.status}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openDrawerForUser(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Drawer: EditUserDrawer */}
      <EditUserDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={selectedUserForEdit}
        onSaveUser={handleSaveUser}
      />

      {/* Modal: Create New ID */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel-elevated bg-slate-900/95 border border-white/20 max-w-lg w-full p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <span>Create New User Identity</span>
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elena Rostova"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. elena_r"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="elena@company.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters..."
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="STAFF">STAFF</option>
                    <option value="TEAM_LEADER">TEAM_LEADER</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="Engineering / Product"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
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
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

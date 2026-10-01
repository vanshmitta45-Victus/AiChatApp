import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const normalizeUser = (u) => {
  if (!u) return null
  return {
    ...u,
    fullName: u.fullName || u.full_name || u.username || 'Operator',
    full_name: u.full_name || u.fullName || u.username || 'Operator',
    avatarUrl: u.avatarUrl || u.avatar_url || '',
    avatar_url: u.avatar_url || u.avatarUrl || ''
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [isLoading, setIsLoading] = useState(true)

  const quickLogin = useCallback(async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('token', data.token)
        setToken(data.token)
        setUser(normalizeUser(data.user))
        return normalizeUser(data.user)
      }
    } catch (e) {
      console.warn('Quick login error', e)
    }
    return null
  }, [])

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('token')
      if (!storedToken) {
        // Automatically default to admin (vansh / 1234)
        await quickLogin('vansh', '1234')
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        })
        if (res.ok) {
          const userData = await res.json()
          setUser(normalizeUser(userData))
          setToken(storedToken)
        } else {
          // Token expired or invalid, auto-login vansh / 1234
          await quickLogin('vansh', '1234')
        }
      } catch (e) {
        console.error('Failed to load user session', e)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [quickLogin])

  const login = async (identifier, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: identifier, password })
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Login failed')
    }

    const norm = normalizeUser(data.user)
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(norm)
    return norm
  }

  const signup = async (payload) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Signup failed')
    }

    const norm = normalizeUser(data.user)
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(norm)
    return norm
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken('')
    setUser(null)
  }

  const authHeader = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {}
  }, [token])

  const normalizedRole = user?.role ? user.role.toUpperCase().replace('ROLE_', '') : ''
  const isAdmin = normalizedRole === 'ADMIN'
  const isManager = normalizedRole === 'MANAGER'
  const isAdminOrManager = isAdmin || isManager
  const isTeamLeader = normalizedRole === 'TEAM_LEADER'
  const isStaff = normalizedRole === 'STAFF'

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        isManager,
        isAdminOrManager,
        isTeamLeader,
        isStaff,
        role: normalizedRole,
        login,
        signup,
        logout,
        quickLogin,
        authHeader
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

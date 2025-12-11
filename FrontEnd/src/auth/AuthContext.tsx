import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

interface AuthState {
  token: string | null
  username: string | null
  userId: number | null
  role: string | null
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'fitnessapp_token'
const USERNAME_KEY = 'fitnessapp_username'

function decodeJwt(token: string | null): { userId: number | null; role: string | null } {
  if (!token) return { userId: null, role: null }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))

    return {
      userId: payload.loggedUserId ? Number(payload.loggedUserId) : null,
      role: payload.role ?? null
    }
  } catch {
    return { userId: null, role: null }
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storedToken = localStorage.getItem(TOKEN_KEY)
  const decoded = decodeJwt(storedToken)

  const [token, setToken] = useState<string | null>(storedToken)
  const [username, setUsername] = useState<string | null>(localStorage.getItem(USERNAME_KEY))
  const [userId, setUserId] = useState<number | null>(decoded.userId)
  const [role, setRole] = useState<string | null>(decoded.role)

  // Persist token
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
      const info = decodeJwt(token)
      setUserId(info.userId)
      setRole(info.role)
    } else {
      localStorage.removeItem(TOKEN_KEY)
      setUserId(null)
      setRole(null)
    }
  }, [token])

  // Persist username
  useEffect(() => {
    if (username) localStorage.setItem(USERNAME_KEY, username)
    else localStorage.removeItem(USERNAME_KEY)
  }, [username])

  const login = useCallback(async (u: string, p: string) => {
    const base = import.meta.env.VITE_AUTH_BASE_URL ?? import.meta.env.VITE_API_BASE_URL
    const res = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: u, password: p }).toString()
    })

    if (!res.ok) return false

    const data = await res.json().catch(() => null)
    const t = data?.token ?? null
    if (!t) return false

    setToken(t)
    setUsername(u)

    const info = decodeJwt(t)
    setUserId(info.userId)
    setRole(info.role)

    return true
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUsername(null)
    setUserId(null)
    setRole(null)
  }, [])

  const value = useMemo(
    () => ({
      token,
      username,
      userId,
      role,
      login,
      logout
    }),
    [token, username, userId, role, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

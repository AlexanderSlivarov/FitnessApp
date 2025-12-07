import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

interface AuthState {
  token: string | null
  username: string | null
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'fitnessapp_token'
const USERNAME_KEY = 'fitnessapp_username'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem(USERNAME_KEY))

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  }, [token])

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
    // Expect { token: string } or similar
    const t = data?.token ?? data?.accessToken ?? null
    if (!t) return false
    setToken(t)
    setUsername(u)
    return true
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUsername(null)
  }, [])

  const value = useMemo(() => ({ token, username, login, logout }), [token, username, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

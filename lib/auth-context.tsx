'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { UserSession } from './auth'

interface AuthContextType {
  user: UserSession | null
  isLoading: boolean
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string; message?: string; user?: UserSession }>
  register: (data: {
    name: string
    phone: string
    password: string
    email?: string
    district?: string
    state?: string
    farmSizeAcres?: number
    primaryCrop?: string
  }) => Promise<{ success: boolean; error?: string; message?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if (data.success && data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      })
      const data = await res.json()
      if (data.success && data.user) {
        setUser(data.user)
        return { success: true, message: data.message, user: data.user }
      }
      return { success: false, error: data.error || 'Login failed' }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' }
    }
  }

  const register = async (regData: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      })
      const data = await res.json()
      if (data.success && data.user) {
        setUser(data.user)
        return { success: true, message: data.message }
      }
      return { success: false, error: data.error || 'Registration failed' }
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'DELETE' })
      setUser(null)
      window.location.href = '/'
    } catch (err) {
      console.error('Logout error:', err)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

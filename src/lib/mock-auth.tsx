'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name: string
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: Date
}

export interface AuthState {
  user: User | null
  isLoading: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  loginAsGuest: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ user: User | null; error: string | null }>
  signOut: () => Promise<void>
  hasProAccess: () => boolean
  getUsageLimits: () => { projectsPerMonth: number; templatesAccess: string }
  upgradePlan: () => Promise<{ success: boolean; message: string }>
  downgradePlan: () => Promise<{ success: boolean; message: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data
const MOCK_USERS: Record<string, User> = {
  'demo@bookmagic.com': {
    id: '1',
    email: 'demo@bookmagic.com',
    name: 'Demo User',
    plan: 'pro',
    createdAt: new Date('2024-01-01')
  },
  'free@bookmagic.com': {
    id: '2',
    email: 'free@bookmagic.com',
    name: 'Free User',
    plan: 'free',
    createdAt: new Date('2024-01-15')
  }
}

// Guest user for quick access (starts as free)
const GUEST_USER: User = {
  id: 'guest',
  email: 'guest@bookmagic.com',
  name: 'Guest User',
  plan: 'free',
  createdAt: new Date()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session in localStorage on mount
    const stored = localStorage.getItem('bookmagic_user')
    if (stored) {
      try {
        const userData = JSON.parse(stored)
        setUser(userData)
      } catch (e) {
        localStorage.removeItem('bookmagic_user')
      }
    }
    setIsLoading(false)
  }, [])

  const updateUserInStorage = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('bookmagic_user', JSON.stringify(updatedUser))
    
    // Also update the mock users database if it's a registered user
    if (MOCK_USERS[updatedUser.email]) {
      MOCK_USERS[updatedUser.email] = updatedUser
    }
  }

  const loginAsGuest = async (): Promise<void> => {
    setUser(GUEST_USER)
    localStorage.setItem('bookmagic_user', JSON.stringify(GUEST_USER))
  }

  const signIn = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const userData = MOCK_USERS[email.toLowerCase()]

    if (!userData || password !== 'demo123') {
      return { user: null, error: 'Invalid email or password' }
    }

    setUser(userData)
    localStorage.setItem('bookmagic_user', JSON.stringify(userData))

    return { user: userData, error: null }
  }

  const signUp = async (email: string, password: string, name: string): Promise<{ user: User | null; error: string | null }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (MOCK_USERS[email.toLowerCase()]) {
      return { user: null, error: 'User already exists' }
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      name,
      plan: 'free',
      createdAt: new Date()
    }

    MOCK_USERS[email.toLowerCase()] = newUser
    setUser(newUser)
    localStorage.setItem('bookmagic_user', JSON.stringify(newUser))

    return { user: newUser, error: null }
  }

  const signOut = async (): Promise<void> => {
    setUser(null)
    localStorage.removeItem('bookmagic_user')
  }

  const hasProAccess = (): boolean => {
    return user?.plan === 'pro' || user?.plan === 'enterprise'
  }

  const getUsageLimits = () => {
    const plan = user?.plan || 'free'

    switch (plan) {
      case 'free':
        return { projectsPerMonth: 3, templatesAccess: 'basic' }
      case 'pro':
        return { projectsPerMonth: 50, templatesAccess: 'all' }
      case 'enterprise':
        return { projectsPerMonth: -1, templatesAccess: 'all' } // unlimited
      default:
        return { projectsPerMonth: 0, templatesAccess: 'none' }
    }
  }

  const upgradePlan = async (): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'No user logged in' }
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const upgradedUser: User = {
      ...user,
      plan: 'pro'
    }

    updateUserInStorage(upgradedUser)

    return { 
      success: true, 
      message: "You're now on Pro! Enjoy watermark-free exports and unlimited projects." 
    }
  }

  const downgradePlan = async (): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'No user logged in' }
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const downgradedUser: User = {
      ...user,
      plan: 'free'
    }

    updateUserInStorage(downgradedUser)

    return { 
      success: true, 
      message: "You've been downgraded to Free. Future exports will include watermarks." 
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    loginAsGuest,
    signIn,
    signUp,
    signOut,
    hasProAccess,
    getUsageLimits,
    upgradePlan,
    downgradePlan
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useMockAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useMockAuth must be used within an AuthProvider')
  }
  return context
}

// Legacy exports for backward compatibility
export const mockAuth = {
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem('bookmagic_user')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        return null
      }
    }
    return null
  },
  hasProAccess: () => {
    const user = mockAuth.getCurrentUser()
    return user?.plan === 'pro' || user?.plan === 'enterprise'
  }
} 
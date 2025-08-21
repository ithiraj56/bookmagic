'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMockAuth } from '@/lib/mock-auth'

interface RouteProtectionProps {
  children: React.ReactNode
}

export default function RouteProtection({ children }: RouteProtectionProps) {
  const { user, isLoading } = useMockAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isLoading, router])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render children if not authenticated
  if (!user) {
    return null
  }

  return <>{children}</>
} 
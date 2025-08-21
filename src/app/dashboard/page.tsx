'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OldDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new protected dashboard route
    router.replace('/app/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  )
} 
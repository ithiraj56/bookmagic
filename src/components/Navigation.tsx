'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMockAuth } from '@/lib/mock-auth'

export default function Navigation() {
  const { user, signOut } = useMockAuth()
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  // Don't show navigation on auth pages
  if (pathname?.startsWith('/auth/')) {
    return null
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={user ? '/app/dashboard' : '/'} className="text-2xl font-bold text-blue-600">
              BookMagic
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  Welcome, {user.name}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user.plan} plan
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
} 
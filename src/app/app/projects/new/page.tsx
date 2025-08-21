'use client'

import Link from 'next/link'
import { useMockAuth } from '@/lib/mock-auth'
import RouteProtection from '@/components/RouteProtection'
import { ChevronLeftIcon, PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

function NewProjectContent() {
  const { user } = useMockAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link
              href="/app/dashboard"
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
              <p className="text-sm text-gray-600">
                Start formatting your manuscript
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center">
            <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Create New Project
            </h2>
            <p className="mt-2 text-gray-600">
              This is a placeholder for the project creation flow.
            </p>
            
            <div className="mt-8 space-y-4">
              <p className="text-sm text-gray-600">
                In a full implementation, this page would include:
              </p>
              <ul className="text-sm text-gray-600 space-y-2 max-w-md mx-auto">
                <li className="flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-2 text-blue-500" />
                  File upload for manuscripts (.docx, .md, .rtf)
                </li>
                <li className="flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Template selection interface
                </li>
                <li className="flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Project settings and metadata
                </li>
                <li className="flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-2 text-blue-500" />
                  Preview and customization options
                </li>
              </ul>
            </div>

            <div className="mt-8 flex justify-center space-x-4">
              <Link
                href="/app/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Dashboard
              </Link>
              <button
                disabled
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
              >
                Create Project (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewProjectPage() {
  return (
    <RouteProtection>
      <NewProjectContent />
    </RouteProtection>
  )
} 
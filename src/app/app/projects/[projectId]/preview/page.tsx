'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMockAuth } from '@/lib/mock-auth'
import { getProjectById } from '@/lib/mock-db'
import { getUpload, getSelectedTemplate } from '@/lib/mock-storage'
import { getTemplateById } from '@/lib/templates'
import { generatePreview, createPreviewBlobUrl, revokePreviewBlobUrl, getTemplatePreviewStyles } from '@/lib/usePreview'
import RouteProtection from '@/components/RouteProtection'
import { ChevronLeftIcon, ArrowPathIcon, EyeIcon } from '@heroicons/react/24/outline'

function PreviewContent() {
  const { user } = useMockAuth()
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  
  const project = getProjectById(projectId)
  const uploadedFile = getUpload(projectId)
  const selectedTemplateId = getSelectedTemplate(projectId)
  const selectedTemplate = selectedTemplateId ? getTemplateById(selectedTemplateId) : undefined

  useEffect(() => {
    generatePreviewContent()
    
    // Cleanup blob URL on unmount
    return () => {
      if (previewUrl) {
        revokePreviewBlobUrl(previewUrl)
      }
    }
  }, [projectId, uploadedFile, selectedTemplateId])

  const generatePreviewContent = async () => {
    setIsLoading(true)
    setError('')

    try {
      if (!uploadedFile?.file) {
        setError('No file uploaded for this project')
        return
      }

      if (!selectedTemplateId) {
        setError('No template selected for this project')
        return
      }

      // Generate the preview HTML
      const html = await generatePreview(uploadedFile.file, selectedTemplateId)
      
      // Inject template-specific styles
      const templateStyles = getTemplatePreviewStyles(selectedTemplateId)
      const enhancedHtml = html.replace(
        '</style>',
        `${templateStyles}\n        </style>`
      )
      
      setPreviewHtml(enhancedHtml)
      
      // Create blob URL for iframe
      const blobUrl = createPreviewBlobUrl(enhancedHtml)
      setPreviewUrl(blobUrl)
      
    } catch (err) {
      console.error('Failed to generate preview:', err)
      setError('Failed to generate preview. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegeneratePreview = () => {
    if (previewUrl) {
      revokePreviewBlobUrl(previewUrl)
      setPreviewUrl('')
    }
    generatePreviewContent()
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <p className="text-gray-600 mb-6">The project you're looking for doesn't exist.</p>
          <Link
            href="/app/dashboard"
            className="text-blue-600 hover:text-blue-500"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!uploadedFile || !selectedTemplateId) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <Link
                href={`/app/projects/${projectId}`}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Preview - {project.title}</h1>
                <p className="text-sm text-gray-600">
                  Project preview is not available
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <EyeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Preview Not Available</h3>
            <p className="mt-2 text-gray-600">
              {!uploadedFile 
                ? 'Please upload a manuscript file first.' 
                : 'Please select a formatting template first.'
              }
            </p>
            <div className="mt-6">
              <Link
                href={`/app/projects/${projectId}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Project
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link
                href={`/app/projects/${projectId}`}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Preview - {project.title}</h1>
                <p className="text-sm text-gray-600">
                  {uploadedFile.file.name} • {selectedTemplate?.name} template
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRegeneratePreview}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Regenerate Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Preview Content */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Generating preview...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                      onClick={handleRegeneratePreview}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : previewUrl ? (
                <iframe
                  ref={iframeRef}
                  src={previewUrl}
                  className="w-full h-screen border-0"
                  title="Manuscript Preview"
                  sandbox="allow-same-origin"
                />
              ) : null}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Preview Details
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">File</dt>
                  <dd className="text-sm text-gray-900">{uploadedFile.file.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Template</dt>
                  <dd className="text-sm text-gray-900">{selectedTemplate?.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Size</dt>
                  <dd className="text-sm text-gray-900">{selectedTemplate?.size}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Font</dt>
                  <dd className="text-sm text-gray-900">{selectedTemplate?.font}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Pages Shown</dt>
                  <dd className="text-sm text-gray-900">~6 pages (sample)</dd>
                </div>
              </dl>
            </div>

            {/* Preview Notes */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Preview Notes</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• This is a sample preview with placeholder content</li>
                <li>• Your actual manuscript content will be used in the final version</li>
                <li>• Template formatting and styling are accurately represented</li>
                <li>• Page breaks and layout match the final output</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href={`/app/projects/${projectId}`}
                  className="block w-full text-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Project
                </Link>
                <button
                  disabled
                  className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
                >
                  Start Processing (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PreviewPage() {
  return (
    <RouteProtection>
      <PreviewContent />
    </RouteProtection>
  )
} 
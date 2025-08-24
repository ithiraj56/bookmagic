'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMockAuth } from '@/lib/mock-auth'
import { getProjectById } from '@/lib/mock-db'
import { getUpload, getSelectedTemplate } from '@/lib/mock-storage'
import { getTemplateById } from '@/lib/templates'
import RouteProtection from '@/components/RouteProtection'
import { ChevronLeftIcon, ArrowPathIcon, EyeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

function PreviewContent() {
  const { user } = useMockAuth()
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [previewDetails, setPreviewDetails] = useState<any>(null)
  
  const project = getProjectById(projectId)
  const uploadedFile = getUpload(projectId)
  const selectedTemplateId = getSelectedTemplate(projectId)
  const selectedTemplate = selectedTemplateId ? getTemplateById(selectedTemplateId) : undefined

  useEffect(() => {
    if (selectedTemplateId) {
      generatePreviewContent()
    } else {
      setIsLoading(false)
    }
  }, [projectId, selectedTemplateId])

  const generatePreviewContent = async () => {
    setIsLoading(true)
    setError('')
    setPreviewDetails(null)

    try {
      if (!selectedTemplateId) {
        setError('No template selected for this project')
        return
      }

      console.log(`Generating preview for project ${projectId} with template ${selectedTemplateId}`)

      // Call the preview API
      const response = await fetch(`/api/preview?projectId=${encodeURIComponent(projectId)}&templateId=${encodeURIComponent(selectedTemplateId)}`)
      const result = await response.json()

      if (result.success) {
        setPreviewHtml(result.html)
        setPreviewDetails(result.details)
        console.log('Preview generated successfully:', result)
      } else {
        console.error('Preview generation failed:', result)
        setError(result.error || 'Failed to generate preview')
        setPreviewDetails(result.details)
      }
      
    } catch (err) {
      console.error('Failed to generate preview:', err)
      setError('Failed to generate preview. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegeneratePreview = () => {
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

  if (!selectedTemplateId) {
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
                <p className="text-gray-600">Live preview of your formatted manuscript</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Preview Not Available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Please select a template first.
              </p>
              <div className="mt-6">
                <Link
                  href={`/app/projects/${projectId}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Select Template
                </Link>
              </div>
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
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Preview - {project.title}</h1>
                <p className="text-gray-600">
                  {selectedTemplate?.name} template • {uploadedFile?.file?.name || 'sample_manuscript.docx'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRegeneratePreview}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
              <Link
                href={`/app/projects/${projectId}/export`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Export
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Preview Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Live Preview</h3>
                <p className="text-sm text-gray-600">
                  {isLoading ? 'Generating preview...' : 'Your manuscript formatted with the selected template'}
                </p>
              </div>
              
              <div className="p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <ArrowPathIcon className="mx-auto h-8 w-8 text-blue-600 animate-spin" />
                      <p className="mt-2 text-sm text-gray-600">
                        Generating preview from your manuscript...
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        This may take a few moments for large files
                      </p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <ExclamationTriangleIcon className="mx-auto h-8 w-8 text-red-500" />
                      <p className="mt-2 text-sm text-red-600">{error}</p>
                      {previewDetails && (
                        <details className="mt-4 text-left">
                          <summary className="text-xs text-gray-500 cursor-pointer">Debug Details</summary>
                          <pre className="mt-2 text-xs text-gray-400 bg-gray-50 p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(previewDetails, null, 2)}
                          </pre>
                        </details>
                      )}
                      <button
                        onClick={handleRegeneratePreview}
                        className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : previewHtml ? (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <iframe
                      ref={iframeRef}
                      srcDoc={previewHtml}
                      className="w-full h-96 lg:h-[600px]"
                      title="Manuscript Preview"
                      sandbox="allow-same-origin"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <EyeIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">No preview available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Preview Information</h4>
              
              <div className="space-y-4">
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">File</dt>
                  <dd className="mt-1 text-sm text-gray-900">{uploadedFile?.file?.name || 'sample_manuscript.docx'}</dd>
                  <dd className="text-xs text-gray-500">
                    {uploadedFile?.file ? (uploadedFile.file.size / 1024).toFixed(1) : '36.2'} KB
                  </dd>
                </div>
                
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Template</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedTemplate?.name}</dd>
                  <dd className="text-xs text-gray-500">{selectedTemplate?.description}</dd>
                </div>

                {previewDetails && (
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Processing</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {previewDetails.usedPandoc ? 'Pandoc conversion' : 'Fallback conversion'}
                    </dd>
                    <dd className="text-xs text-gray-500">
                      {previewDetails.cached ? `Cached (${previewDetails.age})` : 'Freshly generated'}
                    </dd>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Preview Notes</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• This preview shows your actual manuscript content</li>
                    <li>• {uploadedFile?.file.name.endsWith('.docx')
                      ? 'For .docx files, Pandoc provides the most accurate conversion'
                      : 'Markdown and RTF files show your real content with template formatting applied'
                    }</li>
                    <li>• Template formatting and styling are accurately represented</li>
                    <li>• The final export will include your complete document with professional formatting</li>
                  </ul>
                </div>
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
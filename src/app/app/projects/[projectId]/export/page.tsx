'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMockAuth } from '@/lib/mock-auth'
import { getProjectById } from '@/lib/mock-db'
import { getUpload, getSelectedTemplate } from '@/lib/mock-storage'
import { getTemplateById } from '@/lib/templates'
import RouteProtection from '@/components/RouteProtection'
import ExportResult from '@/components/ExportResult'
import { 
  ChevronLeftIcon, 
  ArrowDownTrayIcon, 
  DocumentTextIcon, 
  BookOpenIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  StarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface ExportStatus {
  ready: boolean
  projectId: string
  exportPath?: string
  size?: number
  createdAt?: string
}

function ExportContent() {
  const { user, upgradePlan, downgradePlan } = useMockAuth()
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<ExportStatus | null>(null)
  const [error, setError] = useState<string>('')
  const [exportLogs, setExportLogs] = useState<string>('')
  const [showResults, setShowResults] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [upgradeMessage, setUpgradeMessage] = useState<string>('')
  
  const project = getProjectById(projectId)
  const uploadedFile = getUpload(projectId)
  const selectedTemplateId = getSelectedTemplate(projectId)
  const selectedTemplate = selectedTemplateId ? getTemplateById(selectedTemplateId) : undefined

  useEffect(() => {
    checkExportStatus()
  }, [projectId])

  const checkExportStatus = async () => {
    try {
      const response = await fetch(`/api/export?projectId=${projectId}`)
      const data = await response.json()
      setExportStatus(data)
      
      // If export is ready, show results
      if (data.ready) {
        setShowResults(true)
      }
    } catch (error) {
      console.error('Failed to check export status:', error)
    }
  }

  const startExport = async () => {
    if (!selectedTemplateId) {
      setError('Please select a template first')
      return
    }

    setIsExporting(true)
    setError('')
    setExportLogs('')
    setShowResults(false)

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          templateId: selectedTemplateId,
          userPlan: user?.plan || 'free',
        }),
      })

      const data = await response.json()

      if (data.success) {
        setExportLogs(data.stdout || 'Export completed successfully')
        await checkExportStatus() // Refresh status
        setShowResults(true) // Show results immediately after successful export
      } else {
        setError(data.error || 'Export failed')
        setExportLogs(data.stderr || data.stdout || '')
      }
    } catch (error) {
      setError('Failed to start export process')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleRetryExport = () => {
    setShowResults(false)
    setError('')
    setExportLogs('')
    startExport()
  }

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    setUpgradeMessage('')
    
    try {
      const result = await upgradePlan()
      if (result.success) {
        setUpgradeMessage(result.message)
        // Refresh the page after a short delay to show the upgrade
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('Failed to upgrade plan')
    } finally {
      setIsUpgrading(false)
    }
  }

  const handleDowngrade = async () => {
    if (window.confirm('Are you sure you want to downgrade to the Free plan? Future exports will include watermarks.')) {
      try {
        const result = await downgradePlan()
        if (result.success) {
          setUpgradeMessage(result.message)
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        }
      } catch (error) {
        setError('Failed to downgrade plan')
      }
    }
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

  const isReadyForExport = uploadedFile && selectedTemplateId
  const isFreeUser = user?.plan === 'free'

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
              <h1 className="text-2xl font-bold text-gray-900">Export - {project.title}</h1>
              <p className="text-sm text-gray-600">
                Generate EPUB and print-ready PDF files
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isFreeUser 
                  ? 'bg-gray-100 text-gray-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user?.plan?.toUpperCase()} Plan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Success Message */}
      {upgradeMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">{upgradeMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Free Plan Notice */}
            {isFreeUser && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 mr-3" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-yellow-800">
                      You're on the Free plan
                    </h3>
                    <p className="mt-1 text-sm text-yellow-700">
                      Your PDF exports will include a watermark. Upgrade to Pro for clean, professional exports.
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={handleUpgrade}
                        disabled={isUpgrading}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpgrading ? (
                          <>
                            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                            Upgrading...
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="h-4 w-4 mr-2" />
                            Upgrade to Pro
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Show Export Results if available */}
            {showResults && (
              <ExportResult 
                projectId={projectId} 
                onRetry={handleRetryExport}
              />
            )}

            {/* Export Control Section - only show if results aren't being displayed */}
            {!showResults && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Export Status
                </h2>

                {!isReadyForExport ? (
                  <div className="text-center py-8">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Not Ready for Export</h3>
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
                        Back to Project Setup
                      </Link>
                    </div>
                  </div>
                ) : exportStatus?.ready ? (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Export Available</h3>
                    <p className="mt-2 text-gray-600">
                      Your files have been exported and are ready for download.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setShowResults(true)}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                        View Download Options
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Ready to Export</h3>
                    <p className="mt-2 text-gray-600">
                      Generate your formatted book files including EPUB, PDF, and publishing resources.
                      {isFreeUser && (
                        <span className="block mt-1 text-yellow-600 font-medium">
                          Note: PDF will include a watermark (Free plan)
                        </span>
                      )}
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={startExport}
                        disabled={isExporting}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isExporting ? (
                          <>
                            <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                            Start Export
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Export Progress/Logs */}
                {(isExporting || exportLogs) && (
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Export Progress</h4>
                    <div className="bg-black text-green-400 p-3 rounded font-mono text-sm max-h-48 overflow-y-auto">
                      {isExporting && !exportLogs && (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-2"></div>
                          Starting export process...
                        </div>
                      )}
                      {exportLogs && (
                        <pre className="whitespace-pre-wrap">{exportLogs}</pre>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Export Failed</h3>
                        <div className="mt-2 text-sm text-red-700">
                          {error}
                        </div>
                        <div className="mt-4">
                          <button
                            onClick={startExport}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Try Again
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Export Contents Info */}
            {!showResults && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Export Package Contents
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                    <BookOpenIcon className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">EPUB File</h3>
                      <p className="text-sm text-gray-600">Digital book format for e-readers and apps</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                    <DocumentTextIcon className="h-8 w-8 text-red-500 mr-3" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">Print-Ready PDF</h3>
                      <p className="text-sm text-gray-600">
                        Formatted for print-on-demand services
                        {isFreeUser && (
                          <span className="block text-yellow-600 font-medium">
                            ⚠️ Will include watermark (Free plan)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                    <DocumentTextIcon className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Font Licenses</h3>
                      <p className="text-sm text-gray-600">Legal documentation for included fonts</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                    <DocumentTextIcon className="h-8 w-8 text-purple-500 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">KDP Checklist</h3>
                      <p className="text-sm text-gray-600">Publishing guidelines and requirements</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Plan
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Current Plan</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isFreeUser 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user?.plan?.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">PDF Watermark</span>
                  <span className={`text-sm ${isFreeUser ? 'text-yellow-600' : 'text-green-600'}`}>
                    {isFreeUser ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Projects/Month</span>
                  <span className="text-sm text-gray-900">
                    {isFreeUser ? '3' : 'Unlimited'}
                  </span>
                </div>
              </div>
              
              {isFreeUser ? (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isUpgrading ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        Upgrading...
                      </>
                    ) : (
                      <>
                        <StarIcon className="h-4 w-4 mr-2" />
                        Upgrade to Pro
                      </>
                    )}
                  </button>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Remove watermarks • Unlimited projects
                  </p>
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-green-600 mb-2">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Pro Benefits Active</span>
                  </div>
                  <button
                    onClick={handleDowngrade}
                    className="w-full text-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Downgrade to Free (Demo)
                  </button>
                </div>
              )}
            </div>

            {/* Project Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Export Details
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Project</dt>
                  <dd className="text-sm text-gray-900">{project.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">File</dt>
                  <dd className="text-sm text-gray-900">{uploadedFile?.file.name || 'None'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Template</dt>
                  <dd className="text-sm text-gray-900">{selectedTemplate?.name || 'None'}</dd>
                </div>
                {selectedTemplate && (
                  <>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Size</dt>
                      <dd className="text-sm text-gray-900">{selectedTemplate.size}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Font</dt>
                      <dd className="text-sm text-gray-900">{selectedTemplate.font}</dd>
                    </div>
                  </>
                )}
              </dl>
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
                <Link
                  href={`/app/projects/${projectId}/preview`}
                  className={`block w-full text-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isReadyForExport
                      ? 'text-gray-700 bg-white hover:bg-gray-50'
                      : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  View Preview
                </Link>
                <button
                  onClick={checkExportStatus}
                  className="block w-full text-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Refresh Status
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExportPage() {
  return (
    <RouteProtection>
      <ExportContent />
    </RouteProtection>
  )
} 
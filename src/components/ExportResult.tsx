'use client'

import { useState, useEffect } from 'react'
import { 
  CheckCircleIcon, 
  ArrowDownTrayIcon, 
  DocumentTextIcon, 
  BookOpenIcon,
  ArchiveBoxIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface ExportResultProps {
  projectId: string
  onRetry?: () => void
  className?: string
}

interface ExportFiles {
  epub: boolean
  pdf: boolean
  zip: boolean
}

export default function ExportResult({ projectId, onRetry, className = '' }: ExportResultProps) {
  const [files, setFiles] = useState<ExportFiles>({ epub: false, pdf: false, zip: false })
  const [isChecking, setIsChecking] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkExportFiles = async () => {
    setIsChecking(true)
    
    try {
      // Check each file individually
      const checks = await Promise.all([
        fetch(`/exports/${projectId}/${projectId}.epub`, { method: 'HEAD' }),
        fetch(`/exports/${projectId}/${projectId}.pdf`, { method: 'HEAD' }),
        fetch(`/exports/${projectId}/export.zip`, { method: 'HEAD' })
      ])

      setFiles({
        epub: checks[0].ok,
        pdf: checks[1].ok,
        zip: checks[2].ok
      })
      
      setLastChecked(new Date())
    } catch (error) {
      console.error('Error checking export files:', error)
      setFiles({ epub: false, pdf: false, zip: false })
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkExportFiles()
    
    // Poll every 3 seconds if not all files are ready
    const interval = setInterval(() => {
      if (!files.epub || !files.pdf || !files.zip) {
        checkExportFiles()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [projectId, files.epub, files.pdf, files.zip])

  const allFilesReady = files.epub && files.pdf && files.zip
  const someFilesReady = files.epub || files.pdf || files.zip

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = (filename: string, label: string) => {
    const link = document.createElement('a')
    link.href = `/exports/${projectId}/${filename}`
    link.download = filename
    link.click()
    
    // Optional: Track download analytics
    console.log(`Downloaded: ${label} for project ${projectId}`)
  }

  if (isChecking && !someFilesReady) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-8 text-center ${className}`}>
        <div className="flex flex-col items-center">
          <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Checking Export Status...
          </h3>
          <p className="text-gray-600">
            Looking for your exported files...
          </p>
        </div>
      </div>
    )
  }

  if (!someFilesReady) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-8 text-center ${className}`}>
        <div className="flex flex-col items-center">
          <ArchiveBoxIcon className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Export Not Ready
          </h3>
          <p className="text-gray-600 mb-4">
            Your export files are not available yet. Please start the export process first.
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Retry Check
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Success Header */}
      {allFilesReady && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-green-900">
                Your export is ready!
              </h3>
              <p className="text-sm text-green-700">
                All files have been successfully generated and are ready for download.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Partial Success Header */}
      {someFilesReady && !allFilesReady && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4 rounded-t-lg">
          <div className="flex items-center">
            <ArrowPathIcon className="h-8 w-8 text-yellow-500 mr-3 animate-spin" />
            <div>
              <h3 className="text-lg font-medium text-yellow-900">
                Export in progress...
              </h3>
              <p className="text-sm text-yellow-700">
                Some files are ready. Waiting for remaining files to complete.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Download Buttons */}
      <div className="p-6">
        <h4 className="text-base font-medium text-gray-900 mb-4">Download Files</h4>
        
        <div className="space-y-3">
          {/* EPUB Download */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <BookOpenIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <h5 className="text-sm font-medium text-gray-900">EPUB File</h5>
                <p className="text-xs text-gray-500">Digital book format for e-readers</p>
              </div>
            </div>
            <button
              onClick={() => handleDownload(`${projectId}.epub`, 'EPUB')}
              disabled={!files.epub}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                files.epub
                  ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                  : 'border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed'
              }`}
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              {files.epub ? 'Download EPUB' : 'Processing...'}
            </button>
          </div>

          {/* PDF Download */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <h5 className="text-sm font-medium text-gray-900">Print PDF</h5>
                <p className="text-xs text-gray-500">Print-ready PDF for publishing</p>
              </div>
            </div>
            <button
              onClick={() => handleDownload(`${projectId}.pdf`, 'Print PDF')}
              disabled={!files.pdf}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                files.pdf
                  ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                  : 'border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed'
              }`}
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              {files.pdf ? 'Download PDF' : 'Processing...'}
            </button>
          </div>

          {/* ZIP Download */}
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <ArchiveBoxIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <h5 className="text-sm font-medium text-gray-900">Complete Package</h5>
                <p className="text-xs text-gray-500">ZIP with all files, licenses & checklist</p>
              </div>
            </div>
            <button
              onClick={() => handleDownload('export.zip', 'ZIP Bundle')}
              disabled={!files.zip}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                files.zip
                  ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                  : 'border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed'
              }`}
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              {files.zip ? 'Download ZIP Bundle' : 'Processing...'}
            </button>
          </div>
        </div>

        {/* Status Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Files ready: {Object.values(files).filter(Boolean).length} of 3
            </span>
            {lastChecked && (
              <span>
                Last checked: {lastChecked.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          {!allFilesReady && (
            <div className="mt-2">
              <div className="flex items-center text-xs text-gray-500">
                <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
                Checking for updates every 3 seconds...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMockAuth } from '@/lib/mock-auth'
import { getProjectById, formatProjectDate } from '@/lib/mock-db'
import { getUpload, formatFileSize, getFileExtension, getSelectedTemplate } from '@/lib/mock-storage'
import { getTemplateById } from '@/lib/templates'
import RouteProtection from '@/components/RouteProtection'
import UploadForm from '@/components/UploadForm'
import TemplateSelector from '@/components/TemplateSelector'
import { ChevronLeftIcon, DocumentTextIcon, CalendarIcon, CloudArrowUpIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'

function ProjectDetailContent() {
  const { user } = useMockAuth()
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>()
  const project = getProjectById(projectId)

  useEffect(() => {
    // Check if there's already an uploaded file for this project
    const existingUpload = getUpload(projectId)
    if (existingUpload) {
      setUploadedFile(existingUpload.file)
    }

    // Check if there's already a selected template for this project
    const existingTemplate = getSelectedTemplate(projectId)
    if (existingTemplate) {
      setSelectedTemplateId(existingTemplate)
    }
  }, [projectId])

  const handleUploadComplete = (file: File) => {
    setUploadedFile(file)
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId)
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

  const selectedTemplate = selectedTemplateId ? getTemplateById(selectedTemplateId) : undefined
  const isReadyForProcessing = uploadedFile && selectedTemplateId

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
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-sm text-gray-600">
                Project ID: {project.id}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload Section */}
            <div className="bg-white shadow rounded-lg p-6">
              <UploadForm 
                projectId={projectId}
                onUploadComplete={handleUploadComplete}
                existingFile={uploadedFile}
              />
            </div>

            {/* Uploaded File Display */}
            {uploadedFile && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded File</h3>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-10 w-10 text-blue-500 mr-4" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{uploadedFile.name}</h4>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span>{formatFileSize(uploadedFile.size)}</span>
                        <span className="mx-2">•</span>
                        <span>{getFileExtension(uploadedFile.name).toUpperCase()} file</span>
                        <span className="mx-2">•</span>
                        <span>Ready for processing</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Uploaded
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Template Selection Section */}
            {uploadedFile && (
              <div className="bg-white shadow rounded-lg p-6">
                <TemplateSelector 
                  projectId={projectId}
                  onTemplateSelect={handleTemplateSelect}
                />
              </div>
            )}

            {/* Project Overview */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Project Overview
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-600">Book formatting project</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Progress</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className={uploadedFile ? 'line-through text-gray-400' : ''}>
                          • Upload your manuscript file
                        </li>
                        <li className={selectedTemplateId ? 'line-through text-gray-400' : !uploadedFile ? 'text-gray-400' : ''}>
                          • Choose formatting template
                        </li>
                        <li className={!isReadyForProcessing ? 'text-gray-400' : ''}>
                          • Preview and customize
                        </li>
                        <li className={!isReadyForProcessing ? 'text-gray-400' : ''}>
                          • Export formatted files
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Current Selection</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>
                          <strong>File:</strong> {uploadedFile ? uploadedFile.name : 'None selected'}
                        </li>
                        <li>
                          <strong>Template:</strong> {selectedTemplate ? selectedTemplate.name : 'None selected'}
                        </li>
                        {selectedTemplate && (
                          <>
                            <li>
                              <strong>Size:</strong> {selectedTemplate.size}
                            </li>
                            <li>
                              <strong>Font:</strong> {selectedTemplate.font}
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/app/projects/${projectId}/preview`}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isReadyForProcessing
                    ? 'text-gray-700 bg-white hover:bg-gray-50'
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
                onClick={(e) => {
                  if (!isReadyForProcessing) {
                    e.preventDefault()
                  }
                }}
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Preview
              </Link>
              <Link
                href={`/app/projects/${projectId}/export`}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isReadyForProcessing
                    ? 'text-white bg-blue-600 hover:bg-blue-700'
                    : 'text-gray-400 bg-gray-300 cursor-not-allowed'
                }`}
                onClick={(e) => {
                  if (!isReadyForProcessing) {
                    e.preventDefault()
                  }
                }}
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export Files
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Project Details
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Project ID</dt>
                  <dd className="text-sm text-gray-900">{project.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Title</dt>
                  <dd className="text-sm text-gray-900">{project.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {formatProjectDate(project.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Owner</dt>
                  <dd className="text-sm text-gray-900">{user?.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm">
                    {isReadyForProcessing ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ready to export
                      </span>
                    ) : selectedTemplateId ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Template selected
                      </span>
                    ) : uploadedFile ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        File uploaded
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Waiting for upload
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/app/dashboard"
                  className="block w-full text-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Dashboard
                </Link>
                <Link
                  href="/app/projects/new"
                  className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create New Project
                </Link>
                {isReadyForProcessing && (
                  <>
                    <Link
                      href={`/app/projects/${projectId}/preview`}
                      className="block w-full text-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <EyeIcon className="h-4 w-4 inline mr-2" />
                      View Preview
                    </Link>
                    <Link
                      href={`/app/projects/${projectId}/export`}
                      className="block w-full text-center px-4 py-2 border border-green-300 shadow-sm text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 inline mr-2" />
                      Export Files
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  return (
    <RouteProtection>
      <ProjectDetailContent />
    </RouteProtection>
  )
} 
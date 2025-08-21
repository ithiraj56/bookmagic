'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { mockAuth, User } from '@/lib/mock-auth'
import { mockDb, Project, ConversionJob } from '@/lib/mock-db'
import { getTemplate } from '@/lib/templates'
import { 
  ChevronLeftIcon, 
  DocumentTextIcon, 
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function ProjectDetailPage() {
  const [user, setUser] = useState<User | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [job, setJob] = useState<ConversionJob | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const projectId = params.projectId as string

  useEffect(() => {
    const currentUser = mockAuth.getCurrentUser()
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    setUser(currentUser)
    loadProjectData()
  }, [router, projectId])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    // Poll for job updates if project is processing
    if (project?.status === 'processing') {
      interval = setInterval(async () => {
        const updatedJob = await mockDb.getJobByProjectId(projectId)
        const updatedProject = await mockDb.getProject(projectId)
        
        if (updatedJob) setJob(updatedJob)
        if (updatedProject) setProject(updatedProject)
        
        // Stop polling if job is completed or failed
        if (updatedJob?.status === 'completed' || updatedJob?.status === 'failed') {
          if (interval) clearInterval(interval)
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [project?.status, projectId])

  const loadProjectData = async () => {
    try {
      const [projectData, jobData] = await Promise.all([
        mockDb.getProject(projectId),
        mockDb.getJobByProjectId(projectId)
      ])
      
      setProject(projectData)
      setJob(jobData)
    } catch (error) {
      console.error('Failed to load project data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = (fileType: 'epub' | 'pdf' | 'zip') => {
    // In a real app, this would trigger a download
    alert(`Downloading ${fileType.toUpperCase()} file... (This is a demo)`)
  }

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-8 w-8 text-green-500" />
      case 'processing':
        return <ClockIcon className="h-8 w-8 text-blue-500 animate-spin" />
      case 'failed':
        return <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
      default:
        return <DocumentTextIcon className="h-8 w-8 text-gray-500" />
    }
  }

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'Conversion Completed'
      case 'processing':
        return 'Converting...'
      case 'failed':
        return 'Conversion Failed'
      case 'uploaded':
        return 'Ready to Process'
      default:
        return 'Unknown Status'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-500"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const template = getTemplate(project.templateId)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link
              href="/dashboard"
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-sm text-gray-600">
                {project.originalFilename} • {template?.name || 'Unknown Template'}
              </p>
            </div>
            <div className="flex items-center">
              {getStatusIcon(project.status)}
              <span className="ml-2 text-lg font-medium text-gray-900">
                {getStatusText(project.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Section */}
            {project.status === 'processing' && job && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Conversion Progress
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Progress: {job.progress}%
                    </span>
                    <span className="text-sm text-gray-500">
                      {job.status === 'processing' ? 'In Progress' : 'Queued'}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  
                  {/* Job Logs */}
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Processing Log
                    </h3>
                    <div className="bg-gray-50 rounded-md p-4 max-h-48 overflow-y-auto">
                      <div className="space-y-1">
                        {job.logs.map((log, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Download Section */}
            {project.status === 'completed' && project.outputFiles && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Download Your Files
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {project.outputFiles.epub && (
                    <div className="border border-gray-200 rounded-lg p-4 text-center">
                      <DocumentTextIcon className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                      <h3 className="font-medium text-gray-900">EPUB File</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        E-reader compatible format
                      </p>
                      <button
                        onClick={() => handleDownload('epub')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  )}
                  
                  {project.outputFiles.pdf && (
                    <div className="border border-gray-200 rounded-lg p-4 text-center">
                      <DocumentTextIcon className="h-12 w-12 text-red-500 mx-auto mb-2" />
                      <h3 className="font-medium text-gray-900">PDF File</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Print-ready format
                      </p>
                      <button
                        onClick={() => handleDownload('pdf')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  )}
                  
                  {project.outputFiles.zip && (
                    <div className="border border-gray-200 rounded-lg p-4 text-center">
                      <DocumentTextIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <h3 className="font-medium text-gray-900">Complete Package</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        All files + extras
                      </p>
                      <button
                        onClick={() => handleDownload('zip')}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download All
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Section */}
            {project.status === 'failed' && job?.error && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-red-900 mb-4">
                  Conversion Failed
                </h2>
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-700">{job.error}</p>
                </div>
                <div className="mt-4">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Project Details
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">File Type</dt>
                  <dd className="text-sm text-gray-900">{project.fileType.toUpperCase()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Template</dt>
                  <dd className="text-sm text-gray-900">{template?.name || 'Unknown'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900">
                    {project.createdAt.toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="text-sm text-gray-900">
                    {project.updatedAt.toLocaleDateString()}
                  </dd>
                </div>
                {project.metadata?.wordCount && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Word Count</dt>
                    <dd className="text-sm text-gray-900">
                      {project.metadata.wordCount.toLocaleString()}
                    </dd>
                  </div>
                )}
                {project.metadata?.pageCount && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Estimated Pages</dt>
                    <dd className="text-sm text-gray-900">
                      {project.metadata.pageCount}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Template Info */}
            {template && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Template Settings
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Page Size</dt>
                    <dd className="text-sm text-gray-900">{template.styles.pageSize.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Font</dt>
                    <dd className="text-sm text-gray-900">{template.styles.fontFamily}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Font Size</dt>
                    <dd className="text-sm text-gray-900">{template.styles.fontSize}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
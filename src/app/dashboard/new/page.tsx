'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { mockAuth, User } from '@/lib/mock-auth'
import { mockDb } from '@/lib/mock-db'
import { Template } from '@/lib/templates'
import UploadForm from '@/components/UploadForm'
import TemplateSelector from '@/components/TemplateSelector'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'

type Step = 'upload' | 'template'

export default function NewProjectPage() {
  const [user, setUser] = useState<User | null>(null)
  const [currentStep, setCurrentStep] = useState<Step>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [projectTitle, setProjectTitle] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const currentUser = mockAuth.getCurrentUser()
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    setUser(currentUser)
  }, [router])

  const handleFileSelect = (file: File, title: string) => {
    setSelectedFile(file)
    setProjectTitle(title)
    setCurrentStep('template')
  }

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
  }

  const handleStartFormatting = async () => {
    if (!user || !selectedFile || !selectedTemplate) return

    setIsLoading(true)
    
    try {
      // Determine file type from file extension
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase()
      let fileType: 'docx' | 'md' | 'rtf' = 'docx'
      
      if (fileExtension === 'md') fileType = 'md'
      else if (fileExtension === 'rtf') fileType = 'rtf'

      // Create the project
      const project = await mockDb.createProject({
        userId: user.id,
        title: projectTitle,
        originalFilename: selectedFile.name,
        fileType,
        templateId: selectedTemplate.id,
        status: 'uploaded'
      })

      // Create and start the conversion job
      const job = await mockDb.createJob(project.id)
      
      // Start the job processing simulation in the background
      mockDb.simulateJobProcessing(job.id)

      // Update project status to processing
      await mockDb.updateProject(project.id, { status: 'processing' })

      // Redirect to the project page
      router.push(`/dashboard/${project.id}`)
      
    } catch (error) {
      console.error('Failed to create project:', error)
      setIsLoading(false)
    }
  }

  const handleBackToUpload = () => {
    setCurrentStep('upload')
    setSelectedTemplate(null)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Project</h1>
              <p className="text-sm text-gray-600">
                {currentStep === 'upload' 
                  ? 'Upload your manuscript to get started' 
                  : 'Choose a formatting template'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <div className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${currentStep === 'upload' ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'}
              `}>
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Upload</span>
            </div>
            
            <div className="flex-1 mx-4">
              <div className="h-1 bg-gray-200 rounded">
                <div className={`
                  h-1 rounded transition-all duration-300
                  ${currentStep === 'template' ? 'w-full bg-blue-600' : 'w-0 bg-gray-200'}
                `} />
              </div>
            </div>
            
            <div className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${currentStep === 'template' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                2
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Template</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {currentStep === 'upload' && (
            <UploadForm
              onFileSelect={handleFileSelect}
              isLoading={isLoading}
            />
          )}
          
          {currentStep === 'template' && (
            <div className="space-y-6">
              {/* Back Button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleBackToUpload}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                  disabled={isLoading}
                >
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Back to Upload
                </button>
                
                {selectedFile && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">File:</span> {selectedFile.name}
                  </div>
                )}
              </div>

              <TemplateSelector
                hasProAccess={mockAuth.hasProAccess()}
                selectedTemplateId={selectedTemplate?.id}
                onTemplateSelect={handleTemplateSelect}
                onContinue={handleStartFormatting}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
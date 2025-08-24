'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { DocumentTextIcon, CloudArrowUpIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { uploadFile, formatFileSize, getFileExtension } from '@/lib/mock-storage'

// Helper function to validate file type
function isValidFileType(file: File): boolean {
  const validTypes = ['docx', 'md', 'rtf']
  const extension = getFileExtension(file.name)
  return validTypes.includes(extension)
}

interface UploadFormProps {
  projectId: string
  onUploadComplete?: (file: File) => void
  existingFile?: File | null
}

export default function UploadForm({ projectId, onUploadComplete, existingFile }: UploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(existingFile || null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [error, setError] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      if (!isValidFileType(file)) {
        setError('Invalid file type. Please upload a .docx, .md, or .rtf file.')
        return
      }
      
      setSelectedFile(file)
      setError('')
      setUploadComplete(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/markdown': ['.md'],
      'application/rtf': ['.rtf'],
      'text/rtf': ['.rtf']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDropRejected: (fileRejections: any[]) => {
      const rejection = fileRejections[0]
      if (rejection) {
        const error = rejection.errors[0]
        if (error?.code === 'file-too-large') {
          setError('File is too large. Maximum size is 50MB.')
        } else if (error?.code === 'file-invalid-type') {
          setError('Invalid file type. Please upload a .docx, .md, or .rtf file.')
        } else {
          setError('Failed to upload file. Please try again.')
        }
      }
    }
  })

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload.')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      await uploadFile(projectId, selectedFile)
      setUploadComplete(true)
      onUploadComplete?.(selectedFile)
    } catch (err) {
      setError('Failed to upload file. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setError('')
    setUploadComplete(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Manuscript</h3>
        
        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          >
            <input {...getInputProps()} />
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {isDragActive ? (
                  'Drop your manuscript here...'
                ) : (
                  <>
                    <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Supports .docx, .md, and .rtf files up to 50MB
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DocumentTextIcon className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {uploadComplete && (
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                )}
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isUploading}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {!uploadComplete && (
              <div className="mt-4">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    'Upload File'
                  )}
                </button>
              </div>
            )}

            {uploadComplete && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-sm text-green-700">
                    File uploaded successfully! You can now proceed with formatting.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
      </div>
    </div>
  )
} 
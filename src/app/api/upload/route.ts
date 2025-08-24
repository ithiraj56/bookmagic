import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

// Ensure uploads directory exists
const ensureUploadsDir = () => {
  const uploadsDir = path.join(process.cwd(), 'converter', 'uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
  return uploadsDir
}

// Save file buffer to disk
const saveFileToDisk = async (projectId: string, file: File): Promise<string> => {
  const uploadsDir = ensureUploadsDir()
  
  // Get file extension from original filename
  const fileExtension = path.extname(file.name) || '.docx'
  const fileName = `${projectId}${fileExtension}`
  const filePath = path.join(uploadsDir, fileName)
  
  // Convert File to Buffer and save
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  fs.writeFileSync(filePath, buffer)
  console.log(`File saved to disk: ${filePath} (${buffer.length} bytes)`)
  
  return filePath
}

// Check if a real uploaded file exists on disk for this project
export function getUploadedFilePath(projectId: string): string | null {
  // Check for common file extensions in converter uploads directory
  const uploadsDir = path.join(process.cwd(), 'converter', 'uploads')
  const extensions = ['.docx', '.md', '.rtf']
  
  for (const ext of extensions) {
    const filePath = path.join(uploadsDir, `${projectId}${ext}`)
    if (fs.existsSync(filePath)) {
      console.log(`Found existing file: ${filePath}`)
      return filePath
    }
  }
  
  return null
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string

    if (!file || !projectId) {
      return NextResponse.json(
        { error: 'Missing file or projectId' },
        { status: 400 }
      )
    }

    // Validate file type
    const validExtensions = ['.docx', '.md', '.rtf']
    const fileExtension = path.extname(file.name).toLowerCase()
    
    if (!validExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: `Invalid file type. Supported formats: ${validExtensions.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      )
    }

    console.log(`Uploading file for project ${projectId}: ${file.name} (${file.size} bytes)`)

    // Save file to disk
    const savedPath = await saveFileToDisk(projectId, file)

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      projectId,
      fileName: file.name,
      fileSize: file.size,
      savedPath,
      fileExtension
    })

  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 
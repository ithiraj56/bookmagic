type Upload = { 
  projectId: string; 
  file: File;
  uploadedAt: Date;
  savedPath?: string; // Path where file was saved on disk
}

type TemplateSelection = {
  projectId: string;
  templateId: string;
  selectedAt: Date;
}

let uploads: Upload[] = [
  // Default upload record for existing projects
  {
    projectId: 'proj-5',
    file: new File([new ArrayBuffer(37068)], 'sample_manuscript.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    uploadedAt: new Date('2025-08-21T10:54:00Z'),
    savedPath: '/Users/ithi/Desktop/bookmagic/converter/uploads/proj-5.docx'
  }
]
let templateSelections: TemplateSelection[] = [
  // Default template selection for existing projects
  {
    projectId: 'proj-5',
    templateId: 'novella-a5',
    selectedAt: new Date('2025-08-21T10:54:00Z')
  }
]

export async function uploadFile(projectId: string, file: File): Promise<void> {
  // Remove any existing upload for this project (only one file per project)
  uploads = uploads.filter(u => u.projectId !== projectId)
  
  // Save file to server via API
  const formData = new FormData()
  formData.append('file', file)
  formData.append('projectId', projectId)
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log(`Upload completed for project ${projectId}: ${file.name} -> ${result.savedPath}`)
    
    // Add the new upload with saved path
    uploads.push({ 
      projectId, 
      file,
      uploadedAt: new Date(),
      savedPath: result.savedPath
    })
    
    // Simulate upload delay
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(undefined)
      }, 1500) // 1.5 second delay to simulate upload
    })
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

export function getUpload(projectId: string): Upload | undefined {
  return uploads.find((u) => u.projectId === projectId)
}

// Check if a real uploaded file exists on disk for this project (server-side only)
export function getUploadedFilePath(projectId: string): string | null {
  const upload = getUpload(projectId)
  if (upload?.savedPath) {
    return upload.savedPath
  }
  return null
}

export function removeUpload(projectId: string): void {
  uploads = uploads.filter(u => u.projectId !== projectId)
}

export function selectTemplate(projectId: string, templateId: string): void {
  // Remove any existing selection for this project
  templateSelections = templateSelections.filter(t => t.projectId !== projectId)
  
  // Add the new selection
  templateSelections.push({
    projectId,
    templateId,
    selectedAt: new Date()
  })
}

export function getSelectedTemplate(projectId: string): string | undefined {
  const selection = templateSelections.find(t => t.projectId === projectId)
  return selection?.templateId
}

export function removeTemplateSelection(projectId: string): void {
  templateSelections = templateSelections.filter(t => t.projectId !== projectId)
}

// Utility functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
} 
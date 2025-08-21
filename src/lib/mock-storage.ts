type Upload = { 
  projectId: string; 
  file: File;
  uploadedAt: Date;
}

type TemplateSelection = {
  projectId: string;
  templateId: string;
  selectedAt: Date;
}

let uploads: Upload[] = []
let templateSelections: TemplateSelection[] = []

export function uploadFile(projectId: string, file: File): Promise<void> {
  // Remove any existing upload for this project (only one file per project)
  uploads = uploads.filter(u => u.projectId !== projectId)
  
  // Add the new upload
  uploads.push({ 
    projectId, 
    file,
    uploadedAt: new Date()
  })
  
  // Simulate upload delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 1500) // 1.5 second delay to simulate upload
  })
}

export function getUpload(projectId: string): Upload | undefined {
  return uploads.find((u) => u.projectId === projectId)
}

export function removeUpload(projectId: string): void {
  uploads = uploads.filter(u => u.projectId !== projectId)
}

export function getAllUploads(): Upload[] {
  return uploads
}

// Template selection functions
export function selectTemplate(projectId: string, templateId: string): void {
  // Remove any existing template selection for this project
  templateSelections = templateSelections.filter(t => t.projectId !== projectId)
  
  // Add the new template selection
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

export function getAllTemplateSelections(): TemplateSelection[] {
  return templateSelections
}

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Helper function to get file extension
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// Helper function to validate file type
export function isValidFileType(file: File): boolean {
  const validTypes = ['docx', 'md', 'rtf']
  const extension = getFileExtension(file.name)
  return validTypes.includes(extension)
} 
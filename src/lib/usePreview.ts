// Process different file types and extract content
async function processUploadedFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase()
  const fileExtension = fileName.split('.').pop()
  
  try {
    if (fileExtension === 'md') {
      // Process Markdown files
      const text = await file.text()
      console.log(`Processing markdown file: ${file.name} (${text.length} characters)`)
      return text
    } else if (fileExtension === 'rtf') {
      // Basic RTF processing - strip RTF formatting
      const text = await file.text()
      console.log(`Processing RTF file: ${file.name} (${text.length} characters)`)
      // Very basic RTF to plain text conversion
      const plainText = text
        .replace(/\\[a-z]+\d*\s?/g, '') // Remove RTF commands
        .replace(/[{}]/g, '') // Remove braces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
      
      return `# Document from ${file.name}\n\n${plainText}`
    } else if (fileExtension === 'docx') {
      // For .docx files, we'll show a placeholder indicating the file was uploaded
      // In production, you'd use a library like mammoth.js to extract the actual content
      console.log(`Processing DOCX file: ${file.name} (${file.size} bytes)`)
      
      return `# Document from ${file.name}

This document was uploaded as a .docx file (${Math.round(file.size / 1024)}KB).

## Chapter One: Uploaded Content

Your uploaded .docx file has been detected and will be processed. In a production environment, this would contain the actual extracted text from your Word document using a proper .docx parser library like mammoth.js.

## Chapter Two: Processing Notes

- **File**: ${file.name}
- **Size**: ${Math.round(file.size / 1024)}KB
- **Type**: Microsoft Word Document
- **Uploaded**: ${new Date().toLocaleString()}

## Chapter Three: Next Steps

This preview shows that your file has been successfully uploaded and recognized. The actual content from your .docx file would appear here in a production system with proper .docx parsing.

### Sample Formatting

This preview demonstrates how your content will be formatted:

- **Headers** will be styled according to your selected template
- *Italic text* and **bold text** will be preserved
- Paragraph spacing and indentation will follow book formatting standards
- Page breaks will be inserted appropriately

> Block quotes like this one will be formatted with proper styling

The final export will contain your actual document content with professional book formatting applied.

*Note: This is a demonstration of the conversion pipeline using your uploaded ${file.name}. A production system would extract and display the actual text content from your Word document.*`
    } else {
      // Fallback for other file types
      console.log(`Processing unknown file type: ${file.name}`)
      return `# Document from ${file.name}

This file (${fileExtension?.toUpperCase()} format) has been uploaded but requires additional processing.

Supported formats:
- .docx (Microsoft Word)
- .md (Markdown)
- .rtf (Rich Text Format)

Please ensure your file is in one of these supported formats for proper conversion.`
    }
  } catch (error) {
    console.error(`Error processing file ${file.name}:`, error)
    return `# Error Processing ${file.name}

There was an error processing your uploaded file. Please try uploading the file again or contact support if the issue persists.

**Error details**: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}

// Convert markdown-like content to HTML
function markdownToHtml(markdown: string): string {
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="section-title">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="section-title">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="chapter-title">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Block quotes
    .replace(/^> (.*$)/gim, '<blockquote class="quote">$1</blockquote>')
    // Lists
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/g, '<ul class="chapter-list">$1</ul>')
    // Paragraphs
    .split('\n\n')
    .map(paragraph => {
      paragraph = paragraph.trim()
      if (paragraph.startsWith('<h') || paragraph.startsWith('<blockquote') || 
          paragraph.startsWith('<ul') || paragraph === '') {
        return paragraph
      }
      // Add appropriate paragraph classes
      if (paragraph.includes('<strong>') && paragraph.length < 100) {
        return `<p class="first-paragraph">${paragraph.replace(/\n/g, ' ')}</p>`
      }
      return `<p>${paragraph.replace(/\n/g, ' ')}</p>`
    })
    .join('\n')

  return html
}

export async function generatePreview(file: File, templateId: string): Promise<string> {
  console.log(`Generating preview for ${file.name} with template ${templateId}`)
  
  // Process the uploaded file to extract content
  const markdownContent = await processUploadedFile(file)
  
  // Convert to HTML
  const bodyContent = markdownToHtml(markdownContent)
  
  // Extract some basic info from the file
  const fileName = file.name.replace(/\.[^/.]+$/, '') // Remove extension
  const fileSize = Math.round(file.size / 1024) // Size in KB
  
  const previewHTML = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview - ${fileName}</title>
        <link rel="stylesheet" href="/template-css/${templateId}.css" />
        <style>
          /* Base preview styles */
          body {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .page-break {
            border-top: 2px dashed #ccc;
            margin: 2rem 0;
            padding-top: 2rem;
            position: relative;
          }
          .page-break::before {
            content: "Page Break";
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 0 1rem;
            font-size: 0.8rem;
            color: #666;
          }
          .preview-note {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 2rem 0;
            font-size: 0.9rem;
            color: #0c4a6e;
          }
          /* Ensure proper styling for converted content */
          .chapter-title {
            page-break-before: always;
          }
          .first-paragraph {
            text-indent: 0;
          }
          p {
            text-indent: 1.5em;
            margin-bottom: 0.5em;
          }
          .quote {
            margin: 1.5em 2em;
            font-style: italic;
            border-left: 3px solid #ccc;
            padding-left: 1em;
          }
          .chapter-list {
            margin: 1em 0;
            padding-left: 2em;
          }
        </style>
      </head>
      <body>
        <div class="preview-note">
          <strong>Live Preview:</strong> This preview shows your uploaded file "${fileName}" (${fileSize}KB) formatted with the ${templateId} template. 
          ${file.name.endsWith('.docx') ? 'Note: .docx content extraction is simulated - a production system would show your actual document text.' : 'This is your actual file content formatted for book publishing.'}
        </div>

        ${bodyContent}

        <div class="preview-note">
          <strong>End of Preview</strong> - This shows your uploaded content formatted according to the selected template. The final export will include your complete document with professional book formatting.
        </div>
      </body>
    </html>
`;
  
  return previewHTML;
}

// Helper function to create a blob URL from HTML content
export function createPreviewBlobUrl(htmlContent: string): string {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  return URL.createObjectURL(blob);
}

// Helper function to revoke a blob URL
export function revokePreviewBlobUrl(url: string): void {
  URL.revokeObjectURL(url);
}

// Get template-specific preview styles
export function getTemplatePreviewStyles(templateId: string): string {
  // These styles will be injected into the preview to match the selected template
  const templateStyles = {
    'serif-classic': `
      body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.4; }
      .chapter-title { font-size: 18pt; font-weight: bold; text-align: center; margin: 2em 0 1em 0; }
      .section-title { font-size: 14pt; font-weight: bold; margin: 1.5em 0 0.5em 0; }
      p { text-align: justify; }
    `,
    'trade-clean': `
      body { font-family: 'Georgia', serif; font-size: 10pt; line-height: 1.5; }
      .chapter-title { font-size: 16pt; font-weight: normal; margin: 3em 0 2em 0; }
      .section-title { font-size: 12pt; font-weight: bold; margin: 2em 0 1em 0; }
      p { text-align: left; }
    `,
    'novella-a5': `
      body { font-family: 'Book Antiqua', serif; font-size: 9pt; line-height: 1.3; }
      .chapter-title { font-size: 14pt; font-weight: bold; margin: 1.5em 0 1em 0; }
      .section-title { font-size: 11pt; font-weight: bold; margin: 1em 0 0.5em 0; }
      p { text-align: justify; }
    `
  }
  
  return templateStyles[templateId as keyof typeof templateStyles] || templateStyles['serif-classic']
} 
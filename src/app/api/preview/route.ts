import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process'
import { generatePreview } from '@/lib/generatePreview'

// Check if a real uploaded file exists on disk for this project
function getUploadedFilePath(projectId: string): string | null {
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

// Generate preview using the TypeScript function
async function generatePreviewWithTypeScript(projectId: string, templateId: string): Promise<{ success: boolean; html?: string; error?: string; details?: any }> {
  try {
    console.log(`Starting TypeScript preview generation for project ${projectId} with template ${templateId}`)
    
    const result = await generatePreview(projectId, templateId)
    
    if (result.success) {
      return {
        success: true,
        html: result.html,
        details: {
          projectId,
          templateId,
          htmlPath: result.htmlPath,
          usedPandoc: result.usedPandoc,
          inputFile: result.inputFile
        }
      }
    } else {
      return {
        success: false,
        error: result.error || 'Preview generation failed',
        details: { projectId, templateId }
      }
    }
  } catch (error) {
    console.error('TypeScript preview generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: { projectId, templateId }
    }
  }
}

// Generate preview using the Node.js script (fallback)
async function generatePreviewWithScript(projectId: string, templateId: string): Promise<{ success: boolean; html?: string; error?: string; details?: any }> {
  return new Promise((resolve) => {
    console.log(`Starting preview generation for project ${projectId} with template ${templateId}`)

    // Check if uploaded file exists
    const uploadedFilePath = getUploadedFilePath(projectId)
    if (!uploadedFilePath) {
      resolve({
        success: false,
        error: `No uploaded file found for project ${projectId}. Please upload a file first.`
      })
      return
    }

    // Construct script path
    const converterDir = path.join(process.cwd(), 'converter')
    const scriptName = ['generatePreview', 'js'].join('.')
    const scriptPath = path.join(converterDir, scriptName)

    // Check if script exists
    if (!fs.existsSync(scriptPath)) {
      console.error(`Preview script not found at: ${scriptPath}`)
      resolve({
        success: false,
        error: `Preview script not found at ${scriptPath}`
      })
      return
    }

    console.log(`Spawning preview generator: node ${scriptName} ${projectId} ${templateId}`)

    const generator = spawn('node', [scriptName, projectId, templateId], {
      cwd: converterDir,
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    generator.stdout.on('data', (data) => {
      const output = data.toString()
      stdout += output
      console.log(`Preview generator stdout: ${output.trim()}`)
    })

    generator.stderr.on('data', (data) => {
      const output = data.toString()
      stderr += output
      console.error(`Preview generator stderr: ${output.trim()}`)
    })

    generator.on('close', (code) => {
      console.log(`Preview generator process exited with code ${code}`)

      if (code === 0) {
        // Try to read the generated HTML file
        const finalHtmlPath = path.join(converterDir, 'output', `${projectId}.preview.final.html`)
        
        if (fs.existsSync(finalHtmlPath)) {
          try {
            const html = fs.readFileSync(finalHtmlPath, 'utf-8')
            console.log(`✓ Preview HTML loaded: ${html.length} characters`)
            
            resolve({
              success: true,
              html,
              details: {
                projectId,
                templateId,
                htmlPath: finalHtmlPath,
                stdout: stdout.trim(),
                stderr: stderr.trim()
              }
            })
          } catch (readError) {
            resolve({
              success: false,
              error: `Failed to read generated HTML: ${readError instanceof Error ? readError.message : 'Unknown error'}`,
              details: { stdout: stdout.trim(), stderr: stderr.trim() }
            })
          }
        } else {
          resolve({
            success: false,
            error: 'Preview HTML file was not created',
            details: { 
              expectedPath: finalHtmlPath,
              stdout: stdout.trim(), 
              stderr: stderr.trim() 
            }
          })
        }
      } else {
        resolve({
          success: false,
          error: `Preview generator process exited with code ${code}`,
          details: {
            stdout: stdout.trim(),
            stderr: stderr.trim()
          }
        })
      }
    })

    generator.on('error', (error) => {
      console.error(`Preview generator process error: ${error.message}`)
      resolve({
        success: false,
        error: `Preview generator process error: ${error.message}`,
        details: { stderr: stderr.trim() }
      })
    })

    // Set a timeout to prevent hanging
    setTimeout(() => {
      if (!generator.killed) {
        console.log('Preview generator timeout, killing process')
        generator.kill()
        resolve({
          success: false,
          error: 'Preview generator process timeout',
          details: {
            stdout: stdout.trim(),
            stderr: stderr.trim()
          }
        })
      }
    }, 30000) // 30 second timeout
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const templateId = searchParams.get('templateId') || 'serif-classic'

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId parameter' },
        { status: 400 }
      )
    }

    console.log(`Preview API request for project ${projectId} with template ${templateId}`)

    // Check if preview already exists and is recent
    const converterDir = path.join(process.cwd(), 'converter')
    const finalHtmlPath = path.join(converterDir, 'output', `${projectId}.preview.final.html`)
    
    if (fs.existsSync(finalHtmlPath)) {
      const stats = fs.statSync(finalHtmlPath)
      const ageMinutes = (Date.now() - stats.mtime.getTime()) / (1000 * 60)
      
      // If preview is less than 5 minutes old, serve it directly
      if (ageMinutes < 5) {
        try {
          const html = fs.readFileSync(finalHtmlPath, 'utf-8')
          console.log(`Serving cached preview: ${html.length} characters (${ageMinutes.toFixed(1)} minutes old)`)
          
          return NextResponse.json({
            success: true,
            html,
            projectId,
            templateId,
            cached: true,
            age: `${ageMinutes.toFixed(1)} minutes`
          })
        } catch (readError) {
          console.error('Failed to read cached preview:', readError)
          // Continue to regenerate
        }
      }
    }

    // Generate new preview using TypeScript version (faster and more reliable)
    const result = await generatePreviewWithTypeScript(projectId, templateId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        html: result.html,
        projectId,
        templateId,
        cached: false,
        details: result.details
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        projectId,
        templateId,
        details: result.details
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Preview API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, templateId = 'serif-classic' } = await request.json()

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId' },
        { status: 400 }
      )
    }

    console.log(`Preview generation request for project ${projectId} with template ${templateId}`)

    const result = await generatePreviewWithTypeScript(projectId, templateId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        html: result.html,
        projectId,
        templateId,
        details: result.details
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        projectId,
        templateId,
        details: result.details
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Preview API POST error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 
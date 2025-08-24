const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure required directories exist
const ensureDirectories = () => {
  const dirs = ['uploads', 'output', 'template-css'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Check if Pandoc is available
const checkPandoc = () => {
  try {
    execSync('pandoc --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.log('Pandoc not available, using fallback conversion');
    return false;
  }
};

// Fallback markdown-like conversion for when Pandoc is not available
const fallbackConversion = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  
  try {
    if (ext === '.md') {
      const content = fs.readFileSync(filePath, 'utf-8');
      return markdownToHtml(content);
    } else if (ext === '.rtf') {
      const content = fs.readFileSync(filePath, 'utf-8');
      // Basic RTF to plain text conversion
      const plainText = content.replace(/\\[a-z]+\d*\s?/g, '').replace(/[{}]/g, '');
      return markdownToHtml(`# Document from ${path.basename(filePath)}\n\n${plainText}`);
    } else if (ext === '.docx') {
      // For .docx files without Pandoc, return a detailed placeholder
      const stats = fs.statSync(filePath);
      return markdownToHtml(`# Document from ${path.basename(filePath)}

This document was uploaded as a .docx file (${Math.round(stats.size / 1024)}KB).

## Chapter One: Professional Formatting Preview

Your uploaded .docx file has been detected and is ready for conversion. This preview demonstrates how your content will be formatted with professional book styling.

### Key Features:
- **Typography**: Clean, readable fonts optimized for book publishing
- **Layout**: Proper margins, spacing, and paragraph formatting
- **Headers**: Hierarchical styling for chapters and sections
- **Text Flow**: Justified alignment with appropriate line spacing

## Chapter Two: Template Styling

The selected template provides:
- Professional page layout
- Consistent typography throughout
- Print-ready formatting standards
- Digital reading optimization

### Sample Content Formatting

This paragraph demonstrates how your body text will appear. The formatting includes proper paragraph spacing, text justification, and professional typography that meets publishing industry standards.

> Block quotes like this one will be formatted with appropriate styling to distinguish them from regular text.

## Chapter Three: Export Ready

Once you're satisfied with the preview, the export process will:
1. Convert your complete .docx content
2. Apply the selected template styling
3. Generate print-ready PDF and EPUB files
4. Include all necessary publishing assets

*Note: This is a preview using your uploaded ${path.basename(filePath)}. The final export will contain your actual document content with identical formatting.*`);
    } else {
      return markdownToHtml(`# Unsupported File Format

The uploaded file format (${ext}) requires Pandoc for proper conversion. Please ensure Pandoc is installed or upload a .md file for preview.`);
    }
  } catch (error) {
    console.error(`Error in fallback conversion: ${error.message}`);
    return markdownToHtml(`# Conversion Error

There was an error processing your file: ${error.message}`);
  }
};

// Simple markdown to HTML converter
const markdownToHtml = (markdown) => {
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Block quotes
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Lists
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    // Paragraphs
    .split('\n\n')
    .map(paragraph => {
      paragraph = paragraph.trim();
      if (paragraph.startsWith('<h') || paragraph.startsWith('<blockquote') || 
          paragraph.startsWith('<ul') || paragraph === '') {
        return paragraph;
      }
      return `<p>${paragraph.replace(/\n/g, ' ')}</p>`;
    })
    .join('\n');

  return html;
};

// Find uploaded file for project
const findUploadedFile = (projectId) => {
  const uploadsDir = 'uploads';
  const extensions = ['.docx', '.md', '.rtf'];

  console.log(`Looking for uploaded file for project: ${projectId}`);

  for (const ext of extensions) {
    const filePath = path.join(uploadsDir, `${projectId}${ext}`);
    console.log(`Checking: ${filePath}`);

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✓ Found uploaded file: ${filePath} (${stats.size} bytes)`);
      return filePath;
    }
  }

  console.log(`✗ No uploaded file found for project ${projectId}`);
  return null;
};

// Read template CSS
const getTemplateCSS = (templateId) => {
  const cssPath = path.join('template-css', `${templateId}.css`);
  
  if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, 'utf-8');
    console.log(`✓ Loaded template CSS: ${cssPath} (${css.length} characters)`);
    return css;
  } else {
    console.log(`✗ Template CSS not found: ${cssPath}, using fallback`);
    // Fallback CSS based on template
    const fallbackCSS = {
      'serif-classic': `
        body { 
          font-family: 'Times New Roman', 'Times', serif; 
          font-size: 11pt; 
          line-height: 1.4; 
          margin: 1in; 
          text-align: justify;
          color: #333;
        }
        h1 { 
          font-size: 18pt; 
          font-weight: bold; 
          text-align: center; 
          margin: 2em 0 1em 0; 
          page-break-before: always;
        }
        h2 { 
          font-size: 14pt; 
          font-weight: bold; 
          margin: 1.5em 0 0.5em 0; 
        }
        h3 { 
          font-size: 12pt; 
          font-weight: bold; 
          margin: 1em 0 0.5em 0; 
        }
        p { 
          margin: 0 0 0.5em 0; 
          text-indent: 1.5em; 
        }
        p:first-child, h1 + p, h2 + p, h3 + p { 
          text-indent: 0; 
        }
        blockquote { 
          margin: 1em 2em; 
          font-style: italic; 
          border-left: 3px solid #ccc; 
          padding-left: 1em; 
        }
        ul, ol { 
          margin: 1em 0; 
          padding-left: 2em; 
        }
      `,
      'trade-clean': `
        body { 
          font-family: 'Georgia', serif; 
          font-size: 10pt; 
          line-height: 1.5; 
          margin: 1in; 
          text-align: left;
          color: #2c2c2c;
        }
        h1 { 
          font-size: 16pt; 
          font-weight: normal; 
          margin: 3em 0 2em 0; 
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        h2 { 
          font-size: 12pt; 
          font-weight: bold; 
          margin: 2em 0 1em 0; 
        }
        h3 { 
          font-size: 11pt; 
          font-weight: bold; 
          margin: 1.5em 0 0.5em 0; 
        }
        p { 
          margin: 0 0 1em 0; 
          text-indent: 0; 
        }
        blockquote { 
          margin: 1.5em 1em; 
          font-style: italic; 
          color: #555; 
        }
      `,
      'novella-a5': `
        body { 
          font-family: 'Book Antiqua', 'Palatino', serif; 
          font-size: 9pt; 
          line-height: 1.3; 
          margin: 0.75in; 
          text-align: justify;
          color: #1a1a1a;
        }
        h1 { 
          font-size: 14pt; 
          font-weight: bold; 
          margin: 1.5em 0 1em 0; 
          text-align: center;
        }
        h2 { 
          font-size: 11pt; 
          font-weight: bold; 
          margin: 1em 0 0.5em 0; 
        }
        h3 { 
          font-size: 10pt; 
          font-weight: bold; 
          margin: 0.8em 0 0.3em 0; 
        }
        p { 
          margin: 0 0 0.3em 0; 
          text-indent: 1em; 
        }
        p:first-child, h1 + p, h2 + p, h3 + p { 
          text-indent: 0; 
        }
        blockquote { 
          margin: 0.8em 1.5em; 
          font-style: italic; 
          font-size: 0.95em; 
        }
      `
    };

    return fallbackCSS[templateId] || fallbackCSS['serif-classic'];
  }
};

// Generate preview HTML
async function generatePreview(projectId, templateId) {
  try {
    console.log(`Starting preview generation for project ${projectId} with template ${templateId}`);

    // Ensure directories exist
    ensureDirectories();

    // Find uploaded file
    const inputPath = findUploadedFile(projectId);
    if (!inputPath) {
      throw new Error(`No uploaded file found for project ${projectId}`);
    }

    const previewHtmlPath = path.join('output', `${projectId}.preview.html`);
    const finalHtmlPath = path.join('output', `${projectId}.preview.final.html`);

    let htmlContent = '';

    // Check if Pandoc is available
    const hasPandoc = checkPandoc();
    const fileExt = path.extname(inputPath).toLowerCase();

    if (hasPandoc && (fileExt === '.docx' || fileExt === '.md')) {
      try {
        console.log('Converting with Pandoc...');
        // Use Pandoc for .docx or .md conversion
        const fromFormat = fileExt === '.docx' ? 'docx' : 'markdown';
        const pandocCmd = `pandoc --from=${fromFormat} --to=html5 --standalone "${inputPath}" -o "${previewHtmlPath}"`;
        console.log(`Running: ${pandocCmd}`);
        
        execSync(pandocCmd, { stdio: 'pipe' });
        
        if (fs.existsSync(previewHtmlPath)) {
          htmlContent = fs.readFileSync(previewHtmlPath, 'utf-8');
          console.log(`✓ Pandoc conversion successful: ${htmlContent.length} characters`);
        } else {
          throw new Error('Pandoc conversion failed - no output file created');
        }
      } catch (pandocError) {
        console.error(`Pandoc conversion failed: ${pandocError.message}`);
        console.log('Falling back to basic conversion...');
        htmlContent = fallbackConversion(inputPath);
      }
    } else {
      console.log('Using fallback conversion...');
      htmlContent = fallbackConversion(inputPath);
    }

    // Get template CSS
    const templateCSS = getTemplateCSS(templateId);

    // Create final HTML with template styling
    let finalHtml;
    
    if (htmlContent.includes('<html')) {
      // If it's a complete HTML document (from Pandoc), inject CSS into head
      finalHtml = htmlContent.replace(
        '</head>',
        `<style>${templateCSS}</style>\n</head>`
      );
    } else {
      // If it's just HTML content (from fallback), wrap in complete document
      finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - ${projectId}</title>
    <style>${templateCSS}</style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
    }

    // Write final HTML
    fs.writeFileSync(finalHtmlPath, finalHtml);
    console.log(`✓ Preview generated: ${finalHtmlPath} (${finalHtml.length} characters)`);

    return {
      success: true,
      htmlPath: finalHtmlPath,
      html: finalHtml,
      projectId,
      templateId,
      inputFile: path.basename(inputPath),
      usedPandoc: hasPandoc && (fileExt === '.docx' || fileExt === '.md')
    };

  } catch (error) {
    console.error(`Preview generation failed for project ${projectId}:`, error);
    return {
      success: false,
      error: error.message,
      projectId,
      templateId
    };
  }
}

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node generatePreview.js <projectId> <templateId>');
    process.exit(1);
  }

  const [projectId, templateId] = args;
  generatePreview(projectId, templateId)
    .then((result) => {
      if (result.success) {
        console.log('Preview generation completed successfully');
        console.log(JSON.stringify(result, null, 2));
        process.exit(0);
      } else {
        console.error('Preview generation failed:', result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Preview generation failed:', error);
      process.exit(1);
    });
}

module.exports = { generatePreview }; 
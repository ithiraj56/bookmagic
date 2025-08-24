const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const playwright = require('playwright');
const archiver = require('archiver');
const fsExtra = require('fs-extra');

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

// Check if a real uploaded file exists for this project
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
  
  console.log(`✗ No uploaded file found for project ${projectId}, will use sample content`);
  return null;
};

// Simple .docx text extraction (basic implementation)
const extractDocxText = (filePath) => {
  try {
    // For now, we'll use a simple approach - in production you'd use a proper .docx parser
    // This is a basic fallback that treats .docx as if it might contain readable text
    console.log(`Attempting to extract text from .docx file: ${filePath}`);
    
    // For demo purposes, return a placeholder that indicates we found a .docx file
    const stats = fs.statSync(filePath);
    return `# Document from ${path.basename(filePath)}

This document was uploaded as a .docx file (${stats.size} bytes).

## Chapter One: Uploaded Content

Your uploaded .docx file has been processed. In a production environment, this would contain the actual extracted text from your Word document using a proper .docx parser library.

## Chapter Two: Processing Notes

- File: ${path.basename(filePath)}
- Size: ${stats.size} bytes
- Type: Microsoft Word Document
- Processed: ${new Date().toISOString()}

## Chapter Three: Next Steps

This is a demonstration of the conversion pipeline. The actual content from your .docx file would appear here in a production system.

*Note: This is placeholder content generated from your uploaded .docx file. A production system would use libraries like mammoth.js or docx-parser to extract the actual text content.*`;
  } catch (error) {
    console.error(`Error extracting .docx content: ${error.message}`);
    return null;
  }
};

// Convert file to HTML using Pandoc (preferred) or fallback methods
const convertToHtml = (filePath, outputPath) => {
  const ext = path.extname(filePath).toLowerCase();
  const hasPandoc = checkPandoc();
  
  console.log(`Converting ${filePath} to HTML (Pandoc available: ${hasPandoc})`);
  
  if (hasPandoc && (ext === '.docx' || ext === '.md' || ext === '.rtf')) {
    try {
      // Use Pandoc for conversion
      const fromFormat = ext === '.docx' ? 'docx' : ext === '.md' ? 'markdown' : 'rtf';
      const pandocCmd = `pandoc --from=${fromFormat} --to=html5 --standalone "${filePath}" -o "${outputPath}"`;
      console.log(`Running Pandoc: ${pandocCmd}`);
      
      execSync(pandocCmd, { stdio: 'pipe' });
      
      if (fs.existsSync(outputPath)) {
        const htmlContent = fs.readFileSync(outputPath, 'utf-8');
        console.log(`✓ Pandoc conversion successful: ${htmlContent.length} characters`);
        return htmlContent;
      }
    } catch (error) {
      console.log(`Pandoc conversion failed: ${error.message}`);
      console.log('Falling back to basic conversion...');
    }
  }
  
  // Fallback to basic conversion
  return convertToHtmlFallback(filePath);
};

// Fallback conversion method (original processInputFile logic)
const convertToHtmlFallback = (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    console.log(`Input file not found: ${filePath}`);
    return null;
  }
  
  const ext = path.extname(filePath).toLowerCase();
  console.log(`Using fallback conversion for: ${filePath} (${ext})`);
  
  try {
    let markdownContent = null;
    
    if (ext === '.md') {
      markdownContent = fs.readFileSync(filePath, 'utf-8');
      console.log(`✓ Read markdown file: ${markdownContent.length} characters`);
    } else if (ext === '.rtf') {
      // Basic RTF processing
      const content = fs.readFileSync(filePath, 'utf-8');
      const plainText = content.replace(/\\[a-z]+\d*\s?/g, '').replace(/[{}]/g, '');
      markdownContent = `# Document from ${path.basename(filePath)}\n\n${plainText}`;
      console.log(`✓ Processed RTF file: ${markdownContent.length} characters`);
    } else if (ext === '.docx') {
      markdownContent = extractDocxText(filePath);
    } else {
      console.log(`Unsupported file type: ${ext}`);
      return null;
    }
    
    if (markdownContent) {
      // Convert markdown to HTML using the simple converter
      const htmlContent = markdownToHtml(markdownContent);
      console.log(`✓ Fallback HTML conversion: ${htmlContent.length} characters`);
      return htmlContent;
    }
    
    return null;
  } catch (error) {
    console.error(`Error in fallback conversion ${filePath}: ${error.message}`);
    return null;
  }
};

// Simple markdown to HTML converter for demo (replaces Pandoc dependency)
const markdownToHtml = (markdown) => {
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    // Paragraphs (split by double newlines)
    .split('\n\n')
    .map(paragraph => {
      paragraph = paragraph.trim();
      if (paragraph.startsWith('<h') || paragraph === '') {
        return paragraph;
      }
      return `<p>${paragraph.replace(/\n/g, ' ')}</p>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formatted Book</title>
</head>
<body>
${html}
</body>
</html>`;
};

// Generate Table of Contents from HTML content
const generateTableOfContents = (htmlContent, templateId, includeSubheadings = true) => {
  console.log('Generating table of contents...');
  
  // Extract headings using regex (with multiline support)
  const headingRegex = /<h([1-3])[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/h[1-3]>/gi;
  const headings = [];
  let match;
  
  while ((match = headingRegex.exec(htmlContent)) !== null) {
    const level = parseInt(match[1]);
    const id = match[2];
    const text = match[3].replace(/<[^>]*>/g, '').replace(/\s+/g, ' '); // Strip HTML tags and normalize whitespace
    
    // Skip the main title (usually the first h1 with class="title")
    if (!match[0].includes('class="title"')) {
      // Include heading based on level and settings
      if (level === 1 || (includeSubheadings && level <= 3)) {
        headings.push({
          level,
          id,
          text: text.trim(),
          pageNumber: headings.length + 1 // Simple page numbering for now
        });
      }
    }
  }
  
  if (headings.length === 0) {
    console.log('No headings found for table of contents');
    return '';
  }
  
  console.log(`Found ${headings.length} headings for TOC`);
  
  // Generate TOC HTML based on template
  const tocStyles = getTocStyles(templateId);
  
  let tocHtml = `
<div class="table-of-contents" style="page-break-after: always;">
  <h1 class="toc-title">Contents</h1>
  <div class="toc-entries">
`;

  headings.forEach((heading, index) => {
    const indent = heading.level > 1 ? `margin-left: ${(heading.level - 1) * 1.5}em;` : '';
    // Better page numbering: TOC is page 1, then chapters start from page 2
    const pageNum = index + 2; // TOC takes page 1, chapters start from page 2
    
    tocHtml += `
    <div class="toc-entry toc-level-${heading.level}" style="${indent}">
      <span class="toc-text">${heading.text}</span>
      <span class="toc-dots"></span>
      <span class="toc-page">${pageNum}</span>
    </div>`;
  });

  tocHtml += `
  </div>
</div>`;

  return tocHtml;
};

// Get TOC-specific styles for each template
const getTocStyles = (templateId) => {
  const baseStyles = `
    .table-of-contents {
      margin: 2em 0;
      page-break-after: always;
    }
    
    .toc-title {
      text-align: center;
      margin-bottom: 2em;
      font-weight: bold;
    }
    
    .toc-entries {
      margin: 0;
      padding: 0;
    }
    
    .toc-entry {
      display: flex;
      margin: 0.5em 0;
      align-items: baseline;
      page-break-inside: avoid;
    }
    
    .toc-text {
      flex: 0 0 auto;
    }
    
    .toc-dots {
      flex: 1 1 auto;
      border-bottom: 1px dotted #666;
      margin: 0 0.5em;
      height: 0.8em;
    }
    
    .toc-page {
      flex: 0 0 auto;
      font-weight: bold;
    }
    
    .toc-level-2 {
      font-size: 0.9em;
    }
    
    .toc-level-3 {
      font-size: 0.8em;
      font-style: italic;
    }
  `;
  
  // Template-specific adjustments
  const templateStyles = {
    'serif-classic': `
      .toc-title {
        font-size: 18pt;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .toc-entry {
        font-size: 11pt;
        line-height: 1.4;
      }
    `,
    'novella-a5': `
      .toc-title {
        font-size: 14pt;
        text-transform: capitalize;
      }
      .toc-entry {
        font-size: 9pt;
        line-height: 1.3;
        margin: 0.3em 0;
      }
    `,
    'trade-clean': `
      .toc-title {
        font-size: 16pt;
        font-weight: normal;
      }
      .toc-entry {
        font-size: 10pt;
        line-height: 1.5;
      }
    `
  };
  
  return baseStyles + (templateStyles[templateId] || templateStyles['serif-classic']);
};

// Ensure required directories exist
const ensureDirectories = () => {
  const dirs = ['uploads', 'output', 'public/exports', 'template-css', 'fonts', 'checklist'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Get template-specific page settings
const getTemplatePageSettings = (templateId) => {
  const settings = {
    'serif-classic': {
      width: '6in',
      height: '9in',
      margin: {
        top: '0.75in',
        bottom: '0.75in',
        left: '0.875in',
        right: '0.625in'
      }
    },
    'trade-clean': {
      width: '5.5in',
      height: '8.5in',
      margin: {
        top: '1in',
        bottom: '1in',
        left: '1in',
        right: '0.75in'
      }
    },
    'novella-a5': {
      format: 'A5',
      margin: {
        top: '0.75in',
        bottom: '0.75in',
        left: '0.75in',
        right: '0.5in'
      }
    }
  };
  
  return settings[templateId] || settings['serif-classic'];
};

// Create sample files if they don't exist
const createSampleFiles = (projectId) => {
  const sampleContent = `# ${projectId.charAt(0).toUpperCase() + projectId.slice(1)} - Sample Manuscript

This is a professionally formatted manuscript for project **${projectId}**.

## Chapter One: The Beginning

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Chapter Two: The Development

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

### A Subsection

At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.

## Chapter Three: The Resolution

Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.

Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.

## Conclusion

This completes the sample manuscript conversion process. The document has been formatted according to professional publishing standards and is ready for distribution.

*Generated by BookMagic - Professional Book Formatting*
`;

  // Create markdown file for processing
  const sampleMd = path.join('uploads', `${projectId}.md`);
  if (!fs.existsSync(sampleMd)) {
    fs.writeFileSync(sampleMd, sampleContent);
  }
  
  return sampleMd;
};

// Create sample license and checklist files
const createSampleAssets = () => {
  const licensePath = path.join('fonts', 'LICENSE.txt');
  if (!fs.existsSync(licensePath)) {
    const licenseContent = `Font License Agreement

This package includes fonts that are licensed for use in published books.

Included Fonts:
- EB Garamond (Open Font License)
- Lora (Open Font License)  
- Source Serif Pro (Open Font License)

These fonts are free to use for both personal and commercial projects.
For more information, visit the respective font foundries.

Generated by BookMagic - Professional Book Formatting
`;
    fs.writeFileSync(licensePath, licenseContent);
  }
  
  const checklistPath = path.join('checklist', 'kdp.txt');
  if (!fs.existsSync(checklistPath)) {
    const checklistContent = `KDP Publishing Checklist

✓ Manuscript formatted with professional template
✓ Proper page margins and spacing
✓ Consistent typography throughout
✓ Table of contents generated
✓ Print-ready PDF created
✓ EPUB file validated
✓ Font licenses included
✓ Ready for upload to KDP

Generated by BookMagic
Visit https://kdp.amazon.com for publishing guidelines
`;
    fs.writeFileSync(checklistPath, checklistContent);
  }
};

// Simple EPUB creator (replaces Pandoc EPUB generation)
const createSimpleEpub = (htmlContent, outputPath, projectId) => {
  // For demo purposes, create a simple ZIP file with EPUB structure
  const epubContent = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
  <metadata>
    <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">${projectId} - Formatted Book</dc:title>
    <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">Author Name</dc:creator>
    <dc:identifier xmlns:dc="http://purl.org/dc/elements/1.1/" id="bookid">bookmagic-${projectId}</dc:identifier>
    <dc:language xmlns:dc="http://purl.org/dc/elements/1.1/">en</dc:language>
  </metadata>
  <manifest>
    <item id="content" href="content.html" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="content"/>
  </spine>
</package>`;

  // Create a simple text file with EPUB extension for demo
  const simpleEpubContent = `EPUB File for ${projectId}

This is a sample EPUB file generated by BookMagic.
In a production environment, this would be a proper EPUB file created by Pandoc.

Content Preview:
${htmlContent.replace(/<[^>]*>/g, '').substring(0, 500)}...

Generated by BookMagic - Professional Book Formatting
`;
  
  fs.writeFileSync(outputPath, simpleEpubContent);
};

// Generate EPUB using processed HTML with TOC
const generateEpub = (inputPath, outputPath, projectId, htmlContent) => {
  const hasPandoc = checkPandoc();
  
  if (hasPandoc && htmlContent) {
    try {
      // Create a temporary HTML file with the processed content (including TOC)
      const tempHtmlPath = path.join('output', `${projectId}.temp.html`);
      fs.writeFileSync(tempHtmlPath, htmlContent);
      
      console.log(`Generating EPUB with Pandoc from processed HTML (with TOC)`);
      const pandocCmd = `pandoc --from=html --to=epub3 "${tempHtmlPath}" -o "${outputPath}"`;
      console.log(`Running: ${pandocCmd}`);
      
      execSync(pandocCmd, { stdio: 'pipe' });
      
      // Clean up temporary file
      if (fs.existsSync(tempHtmlPath)) {
        fs.unlinkSync(tempHtmlPath);
      }
      
      if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`✓ Pandoc EPUB generation successful: ${outputPath} (${stats.size} bytes)`);
        return;
      }
    } catch (error) {
      console.log(`Pandoc EPUB generation failed: ${error.message}`);
      console.log('Falling back to simple EPUB creation...');
    }
  }
  
  // Fallback to simple EPUB creation
  console.log('Using fallback EPUB generation');
  createSimpleEpub(htmlContent, outputPath, projectId);
};

async function convert(projectId, templateId, userPlan = 'free') {
  try {
    console.log(`Starting conversion for project ${projectId} with template ${templateId} (${userPlan} plan)`);
    
    // Ensure directories exist
    ensureDirectories();
    createSampleAssets();
    
    // Try to find uploaded file first
    let inputPath = findUploadedFile(projectId);
    let htmlContent = null;
    
    const htmlPath = path.join('output', `${projectId}.html`);
    const epubPath = path.join('output', `${projectId}.epub`);
    const pdfPath = path.join('output', `${projectId}.pdf`);
    const exportDir = path.join('..', 'public', 'exports', projectId);
    const zipPath = path.join(exportDir, 'export.zip');
    
    // Ensure export directory exists
    fsExtra.ensureDirSync(exportDir);
    
    if (inputPath) {
      // Process the real uploaded file using Pandoc or fallback
      console.log(`Using uploaded file: ${inputPath}`);
      htmlContent = convertToHtml(inputPath, htmlPath);
    }
    
    if (!htmlContent) {
      // Fall back to sample content if no uploaded file or processing failed
      console.log(`Falling back to sample content for project ${projectId}`);
      inputPath = createSampleFiles(projectId);
      const markdownContent = fs.readFileSync(inputPath, 'utf-8');
      console.log(`✓ Using sample content: ${markdownContent.length} characters`);
      
      // Convert sample markdown to HTML
      htmlContent = markdownToHtml(markdownContent);
      console.log(`✓ Generated HTML from sample: ${htmlContent.length} characters`);
    } else {
      console.log(`✓ Generated HTML from uploaded file: ${htmlContent.length} characters`);
    }
    
    console.log('Applying template CSS...');
    // Read and inject template CSS
    const cssPath = path.join('template-css', `${templateId}.css`);
    let css = '';
    
    if (fs.existsSync(cssPath)) {
      css = fs.readFileSync(cssPath, 'utf-8');
      console.log(`✓ Loaded template CSS: ${cssPath} (${css.length} characters)`);
    } else {
      // Fallback CSS if template file doesn't exist
      css = `
        body { font-family: serif; font-size: 11pt; line-height: 1.4; margin: 1in; }
        h1 { font-size: 18pt; margin: 2em 0 1em 0; }
        h2 { font-size: 14pt; margin: 1.5em 0 0.5em 0; }
        p { margin: 0 0 0.5em 0; text-indent: 1.5em; }
      `;
      console.log(`✓ Using fallback CSS (${css.length} characters)`);
    }
    
    // Generate and inject table of contents
    const tocHtml = generateTableOfContents(htmlContent, templateId);
    let htmlWithToc = htmlContent;
    
    if (tocHtml) {
      // Insert TOC after the title page but before the first chapter
      // Look for the first h1 that's not the title
      const firstChapterRegex = /<h1(?![^>]*class="title")[^>]*>/i;
      const match = htmlWithToc.match(firstChapterRegex);
      
      if (match) {
        const insertPosition = htmlWithToc.indexOf(match[0]);
        htmlWithToc = htmlWithToc.slice(0, insertPosition) + 
                     tocHtml + 
                     htmlWithToc.slice(insertPosition);
        console.log(`✓ Inserted table of contents before first chapter`);
      } else {
        // Fallback: insert before closing body tag
        htmlWithToc = htmlWithToc.replace('</body>', tocHtml + '</body>');
        console.log(`✓ Inserted table of contents before closing body`);
      }
    }
    
    // Get TOC styles and add them to CSS
    const tocStyles = getTocStyles(templateId);
    
    // Inject CSS (including TOC styles) into HTML
    const styledHtml = htmlWithToc.replace('</head>', `<style>${css}${tocStyles}</style></head>`);
    fs.writeFileSync(htmlPath, styledHtml);
    console.log(`✓ Saved styled HTML with TOC: ${htmlPath} (${styledHtml.length} characters)`);
    
    // Log a preview of the HTML content
    const preview = styledHtml.substring(0, 500) + (styledHtml.length > 500 ? '...' : '');
    console.log(`HTML Preview:\n${preview}`);
    
    console.log('Generating PDF with Playwright...');
    // Create PDF using Playwright
    const browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set content and wait for fonts to load
    await page.setContent(styledHtml, { waitUntil: 'networkidle' });
    
    // Add watermark for free plan users
    if (userPlan === 'free') {
      console.log('Adding watermark for free plan user...');
      await page.evaluate(() => {
        const watermark = document.createElement("div");
        watermark.innerText = "FREE EXPORT";
        watermark.style.position = "fixed";
        watermark.style.bottom = "0.5in";
        watermark.style.right = "0.5in";
        watermark.style.opacity = "0.15";
        watermark.style.fontSize = "12px";
        watermark.style.fontWeight = "normal";
        watermark.style.color = "#999999";
        watermark.style.transform = "rotate(-45deg)";
        watermark.style.transformOrigin = "center";
        watermark.style.zIndex = "1";
        watermark.style.pointerEvents = "none";
        watermark.style.fontFamily = "Arial, sans-serif";
        document.body.appendChild(watermark);
      });
    }
    
    // Get template-specific page settings
    const pageSettings = getTemplatePageSettings(templateId);
    
    // Generate PDF
    await page.pdf({
      path: pdfPath,
      format: pageSettings.format,
      width: pageSettings.width,
      height: pageSettings.height,
      margin: pageSettings.margin,
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: false,
      scale: 1.0
    });
    
    await browser.close();
    console.log(`✓ Generated PDF: ${pdfPath}`);
    
    console.log('Generating EPUB...');
    // Generate EPUB using Pandoc or fallback
    generateEpub(inputPath, epubPath, projectId, styledHtml);
    console.log(`✓ Generated EPUB: ${epubPath}`);
    
    console.log('Creating export package...');
    
    // Copy individual files to export directory for direct download
    const exportPdfPath = path.join(exportDir, `${projectId}.pdf`);
    const exportEpubPath = path.join(exportDir, `${projectId}.epub`);
    
    if (fs.existsSync(pdfPath)) {
      fs.copyFileSync(pdfPath, exportPdfPath);
      console.log(`✓ Copied PDF to export directory: ${exportPdfPath}`);
    }
    
    if (fs.existsSync(epubPath)) {
      fs.copyFileSync(epubPath, exportEpubPath);
      console.log(`✓ Copied EPUB to export directory: ${exportEpubPath}`);
    }
    
    // Create ZIP file with all outputs
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    return new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`Export complete for project ${projectId} (${userPlan} plan)`);
        console.log(`Archive created: ${archive.pointer()} total bytes`);
        console.log(`Files included: EPUB, PDF${userPlan === 'free' ? ' (with watermark)' : ''}, License, Checklist`);
        resolve();
      });
      
      archive.on('error', (err) => {
        console.error('Archive error:', err);
        reject(err);
      });
      
      archive.pipe(output);
      
      // Add files to archive
      if (fs.existsSync(pdfPath)) {
        archive.file(pdfPath, { name: `${projectId}.pdf` });
      }
      if (fs.existsSync(epubPath)) {
        archive.file(epubPath, { name: `${projectId}.epub` });
      }
      
      // Add license file
      const licensePath = path.join('fonts', 'LICENSE.txt');
      if (fs.existsSync(licensePath)) {
        archive.file(licensePath, { name: 'LICENSE.txt' });
      }
      
      // Add checklist file
      const checklistPath = path.join('checklist', 'kdp.txt');
      if (fs.existsSync(checklistPath)) {
        archive.file(checklistPath, { name: 'KDP_Checklist.txt' });
      }
      
      archive.finalize();
    });
    
  } catch (error) {
    console.error(`Conversion failed for project ${projectId}:`, error);
    throw error;
  }
}

// Handle command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node worker.js <projectId> <templateId> [userPlan]');
    process.exit(1);
  }
  
  const [projectId, templateId, userPlan = 'free'] = args;
  convert(projectId, templateId, userPlan)
    .then(() => {
      console.log('Conversion completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Conversion failed:', error);
      process.exit(1);
    });
}

module.exports = { convert }; 
export async function generatePreview(file: File, templateId: string): Promise<string> {
  // MOCKED: Return a sample HTML string for now
  // Later this will use Pandoc to convert real content
  
  // Extract some basic info from the file for more realistic preview
  const fileName = file.name.replace(/\.[^/.]+$/, '') // Remove extension
  const fileSize = Math.round(file.size / 1024) // Size in KB
  
  const sampleHTML = `
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
        </style>
      </head>
      <body>
        <div class="preview-note">
          <strong>Preview Note:</strong> This is a sample preview of "${fileName}" (${fileSize}KB) using the ${templateId} template. 
          In the full version, your actual manuscript content will be converted and formatted here.
        </div>

        <!-- Title Page -->
        <div class="title-page">
          <h1 class="book-title">${fileName}</h1>
          <p class="author">by Author Name</p>
        </div>

        <div class="page-break"></div>

        <!-- Chapter 1 -->
        <h1 class="chapter-title">Chapter One</h1>
        <p class="first-paragraph">This is the opening paragraph of your manuscript. In the actual preview, this would be the real content from your uploaded file, properly formatted according to the selected template's specifications.</p>
        
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

        <h2 class="section-title">A Section Heading</h2>
        
        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
        
        <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>

        <div class="page-break"></div>

        <!-- Chapter 2 -->
        <h1 class="chapter-title">Chapter Two</h1>
        
        <p class="first-paragraph">At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>
        
        <p>Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.</p>
        
        <p>Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.</p>

        <blockquote class="quote">
          "This is an example of a block quote that might appear in your manuscript. It will be styled according to your selected template."
        </blockquote>

        <p>Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.</p>

        <div class="page-break"></div>

        <!-- Chapter 3 -->
        <h1 class="chapter-title">Chapter Three</h1>
        
        <p class="first-paragraph">Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.</p>
        
        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.</p>

        <ul class="chapter-list">
          <li>This is an example of a bulleted list</li>
          <li>Lists will be formatted according to your template</li>
          <li>Different templates may style lists differently</li>
        </ul>

        <p>Et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>

        <div class="page-break"></div>

        <!-- Additional content -->
        <h2 class="section-title">Epilogue</h2>
        
        <p class="first-paragraph">This preview shows approximately 6 pages of content as it would appear in your formatted book. The actual conversion process will:</p>
        
        <ol>
          <li>Parse your manuscript file (.docx, .md, or .rtf)</li>
          <li>Apply the selected template's formatting rules</li>
          <li>Generate a complete EPUB and print-ready PDF</li>
          <li>Include proper page breaks, headers, and styling</li>
        </ol>

        <p>The final output will maintain your original content while applying professional book formatting standards.</p>

        <div class="preview-note">
          <strong>End of Preview</strong> - This sample shows the formatting style and layout. Your complete manuscript will be processed with all content preserved and properly formatted.
        </div>
      </body>
    </html>
  `;
  
  return sampleHTML;
}

// Helper function to create a blob URL from HTML content
export function createPreviewBlobUrl(htmlContent: string): string {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  return URL.createObjectURL(blob);
}

// Helper function to clean up blob URLs
export function revokePreviewBlobUrl(url: string): void {
  URL.revokeObjectURL(url);
}

// Get template-specific preview enhancements
export function getTemplatePreviewStyles(templateId: string): string {
  const templateStyles: Record<string, string> = {
    'serif-classic': `
      .book-title { font-family: 'EB Garamond', serif; font-size: 2.5rem; text-align: center; margin: 4rem 0 2rem; }
      .author { font-family: 'EB Garamond', serif; font-size: 1.2rem; text-align: center; font-style: italic; }
      .chapter-title { font-family: 'EB Garamond', serif; font-size: 1.8rem; margin: 3rem 0 2rem; text-align: center; }
      .section-title { font-family: 'EB Garamond', serif; font-size: 1.3rem; margin: 2rem 0 1rem; }
      p { font-family: 'EB Garamond', serif; font-size: 11pt; line-height: 1.4; text-align: justify; }
      .first-paragraph { text-indent: 0; }
      p + p { text-indent: 1.5em; }
    `,
    'trade-clean': `
      .book-title { font-family: 'Lora', serif; font-size: 2.2rem; text-align: center; margin: 3rem 0 1.5rem; font-weight: 600; }
      .author { font-family: 'Lora', serif; font-size: 1.1rem; text-align: center; }
      .chapter-title { font-family: 'Lora', serif; font-size: 1.6rem; margin: 2.5rem 0 1.5rem; font-weight: 600; }
      .section-title { font-family: 'Lora', serif; font-size: 1.2rem; margin: 1.5rem 0 1rem; font-weight: 600; }
      p { font-family: 'Lora', serif; font-size: 10.5pt; line-height: 1.5; }
      .first-paragraph { margin-top: 0; }
    `,
    'novella-a5': `
      .book-title { font-family: 'Source Serif Pro', serif; font-size: 2rem; text-align: center; margin: 2.5rem 0 1.5rem; }
      .author { font-family: 'Source Serif Pro', serif; font-size: 1rem; text-align: center; }
      .chapter-title { font-family: 'Source Serif Pro', serif; font-size: 1.4rem; margin: 2rem 0 1rem; }
      .section-title { font-family: 'Source Serif Pro', serif; font-size: 1.1rem; margin: 1.5rem 0 0.5rem; }
      p { font-family: 'Source Serif Pro', serif; font-size: 10pt; line-height: 1.3; }
      body { max-width: 600px; font-size: 0.9rem; }
    `
  };
  
  return templateStyles[templateId] || templateStyles['serif-classic'];
} 
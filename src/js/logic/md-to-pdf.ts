/**
 * Markdown to PDF Converter
 * Purpose: Convert Markdown content to PDF with support for multiple markdown flavors
 * Features:
 * - GitHub Flavored Markdown support
 * - CommonMark support  
 * - Pandoc Markdown support
 * - Real-time preview
 * - File upload support
 * @version 1.0
 * @package BentoPDF
 */

import { showLoader, hideLoader, showAlert } from '../ui.js';
import { downloadFile } from '../utils/helpers.js';
import { marked } from 'marked';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Configure marked for different markdown flavors
const configureMarked = (flavor: string) => {
  switch (flavor) {
    case 'github':
      return marked.setOptions({
        gfm: true,
        breaks: true,
        pedantic: false
      });
    case 'commonmark':
      return marked.setOptions({
        gfm: false,
        breaks: false,
        pedantic: true
      });
    case 'pandoc':
      return marked.setOptions({
        gfm: true,
        breaks: true,
        pedantic: false
      });
    default:
      return marked.setOptions({
        gfm: true,
        breaks: true,
        pedantic: false
      });
  }
};

// Function to preprocess markdown content to handle math expressions
function preprocessMathContent(content: string): string {
  // Handle inline math: $...$
  content = content.replace(/\$([^$]+)\$/g, '<span class="math-inline">$1</span>');
  
  // Handle block math: $$...$$
  content = content.replace(/\$\$([\s\S]*?)\$\$/g, '<div class="math-block">$1</div>');
  
  return content;
}

// Function to render KaTeX mathematical expressions using local installation
function renderMathExpressions(container: HTMLElement) {
  try {
    // Render math expressions using local KaTeX
    const mathElements = container.querySelectorAll('.math-inline, .math-block');
    mathElements.forEach((element) => {
      try {
        const mathText = element.textContent || '';
        if (mathText.trim()) {
          const rendered = katex.renderToString(mathText, {
            throwOnError: false,
            displayMode: element.classList.contains('math-block'),
            strict: false
          });
          element.innerHTML = rendered;
          element.classList.add('katex-rendered');
        }
      } catch (error) {
        console.warn('Failed to render math expression:', error);
        // Keep the original text as fallback
      }
    });
  } catch (error) {
    console.warn('Failed to render math expressions:', error);
  }
}

export async function mdToPdf() {
  const markdownContent = (document.getElementById('md-input') as HTMLTextAreaElement)?.value?.trim();
  
  if (!markdownContent) {
    showAlert('Content Required', 'Please enter your Markdown content in the text area or upload a .md file to get started.');
    return;
  }

  showLoader('Preparing your document for conversion...');

  try {
    const flavor = (document.getElementById('markdown-flavor') as HTMLSelectElement)?.value || 'github';
    const pageFormat = (document.getElementById('page-format') as HTMLSelectElement)?.value || 'a4';
    const orientation = (document.getElementById('orientation') as HTMLSelectElement)?.value || 'portrait';
    const marginSize = (document.getElementById('margin-size') as HTMLSelectElement)?.value || 'normal';
    const imageQuality = (document.getElementById('image-quality') as HTMLSelectElement)?.value || 'high';

    // Configure marked based on flavor
    configureMarked(flavor);
    
    // Preprocess content to handle math expressions
    const processedContent = preprocessMathContent(markdownContent);
    
    // Parse markdown to HTML
    const htmlContent = await marked.parse(processedContent);

    // Create temporary container for rendering
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      position: absolute; 
      top: -9999px; 
      left: -9999px; 
      width: 800px; 
      padding: 40px; 
      background: white; 
      color: black;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Add comprehensive styling for markdown elements
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      /* KaTeX Math Rendering Styles */
      .math-inline, .math-block {
        font-size: 1.1em;
        line-height: 1.2;
      }
      
      .math-block {
        text-align: center;
        margin: 16px 0;
        padding: 8px 0;
      }
      
      /* Fallback for math rendering when KaTeX is not loaded */
      .math-inline:not(.katex-rendered),
      .math-block:not(.katex-rendered) {
        background-color: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 4px;
        padding: 2px 6px;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
      }
      
      .math-block:not(.katex-rendered) {
        display: block;
        text-align: center;
        margin: 16px 0;
        padding: 8px;
      }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        line-height: 1.6; 
        font-size: 14px; 
        color: #24292e;
      }
      h1, h2, h3, h4, h5, h6 { 
        margin: 24px 0 16px 0; 
        font-weight: 600; 
        line-height: 1.25;
        border-bottom: 1px solid #eaecef; 
        padding-bottom: 0.3em; 
      }
      h1 { font-size: 2em; }
      h2 { font-size: 1.5em; }
      h3 { font-size: 1.25em; }
      h4 { font-size: 1em; }
      h5 { font-size: 0.875em; }
      h6 { font-size: 0.85em; color: #6a737d; }
      
      p, blockquote, ul, ol, pre, table { 
        margin: 0 0 16px 0; 
      }
      
      blockquote { 
        padding: 0 1em; 
        color: #6a737d; 
        border-left: 0.25em solid #dfe2e5; 
        margin: 0 0 16px 0;
      }
      
      pre { 
        padding: 16px; 
        overflow: auto; 
        font-size: 85%; 
        line-height: 1.45; 
        background-color: #f6f8fa; 
        border-radius: 6px; 
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      }
      
      code { 
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; 
        background-color: rgba(27,31,35,.05); 
        border-radius: 3px; 
        padding: 0.2em 0.4em; 
        font-size: 85%;
      }
      
      pre code {
        background-color: transparent;
        padding: 0;
        border-radius: 0;
      }
      
      table { 
        width: 100%; 
        border-collapse: collapse; 
        border-spacing: 0;
        margin: 0 0 16px 0;
        display: table;
        border: 1px solid #dfe2e5;
      }
      
      th, td { 
        padding: 8px 12px; 
        border: 1px solid #dfe2e5; 
        text-align: left;
        vertical-align: top;
        display: table-cell;
      }
      
      th {
        font-weight: 600;
        background-color: #f6f8fa;
        border-bottom: 2px solid #dfe2e5;
      }
      
      tr {
        display: table-row;
      }
      
      thead {
        display: table-header-group;
      }
      
      tbody {
        display: table-row-group;
      }
      
      img { 
        max-width: 100%; 
        height: auto;
        box-sizing: border-box;
      }
      
      ul, ol {
        padding-left: 2em;
        margin: 0 0 16px 0;
      }
      
      li {
        margin: 0.25em 0;
      }
      
      hr {
        height: 2px;
        padding: 0;
        margin: 24px 0;
        background-color: #e1e4e8;
        border: 0;
        border-top: 2px solid #e1e4e8;
        display: block;
        width: 100%;
      }
      
      a {
        color: #0366d6;
        text-decoration: none;
      }
      
      a:hover {
        text-decoration: underline;
      }
      
      strong {
        font-weight: 600;
      }
      
      em {
        font-style: italic;
      }
    `;

    tempContainer.appendChild(styleSheet);
    tempContainer.innerHTML += htmlContent;
    document.body.appendChild(tempContainer);

    // Render KaTeX mathematical expressions using local installation
    renderMathExpressions(tempContainer);

    // Configure quality settings based on user selection
    const renderSettings = {
      high: { scale: 2, imageTimeout: 10000 },
      medium: { scale: 1.5, imageTimeout: 5000 },
      low: { scale: 1, imageTimeout: 3000 }
    };
    
    const settings = renderSettings[imageQuality as keyof typeof renderSettings] || renderSettings.high;

    // Update progress
    showLoader('Processing your Markdown content...');
    
    // Generate canvas from HTML with optimized settings
    const canvas = await html2canvas(tempContainer, {
      scale: settings.scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false, // Disable logging for better performance
      width: 800,
      height: tempContainer.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: false, // Better compatibility
      removeContainer: false,
      imageTimeout: settings.imageTimeout,
      onclone: (clonedDoc) => {
        // Optimize cloned document
        const clonedContainer = clonedDoc.querySelector('div');
        if (clonedContainer) {
          // Remove any problematic elements
          const images = clonedContainer.querySelectorAll('img');
          images.forEach(img => {
            if (img.src.startsWith('data:') && img.src.length > 100000) {
              // Skip very large inline images
              img.style.display = 'none';
            }
          });
        }
      }
    });
    
    document.body.removeChild(tempContainer);

    // Update progress
    showLoader('Generating your PDF document...');

    // Create PDF
    const pdf = new jsPDF({ 
      orientation: orientation as 'portrait' | 'landscape', 
      unit: 'mm', 
      format: pageFormat as 'a4' | 'letter' | 'legal'
    });

    const pageFormats = { 
      a4: [210, 297], 
      letter: [216, 279], 
      legal: [216, 356] 
    };
    
    const format = pageFormats[pageFormat as keyof typeof pageFormats] || pageFormats.a4;
    const [pageWidth, pageHeight] = orientation === 'landscape' ? [format[1], format[0]] : format;
    
    const margins = { 
      narrow: 10, 
      normal: 20, 
      wide: 30 
    };
    
    const margin = margins[marginSize as keyof typeof margins] || margins.normal;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;
    
    // Configure image quality based on user selection
    const imageQualitySettings = {
      high: 0.95,   // 95% quality for high
      medium: 0.85, // 85% quality for medium
      low: 0.7      // 70% quality for low
    };
    
    const quality = imageQualitySettings[imageQuality as keyof typeof imageQualitySettings] || 0.95;
    const imgData = canvas.toDataURL('image/jpeg', quality);
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;
    
    pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight);
    heightLeft -= contentHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = position - pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight);
      heightLeft -= contentHeight;
    }

    // Generate PDF with compression
    const pdfBlob = pdf.output('blob');
    
    // Show file size information
    const fileSizeMB = (pdfBlob.size / (1024 * 1024)).toFixed(2);
    
    downloadFile(pdfBlob, 'markdown-document.pdf');
    
    // Show success message
    hideLoader();
    showAlert('PDF Conversion Complete', 'Your PDF has been generated and downloaded successfully.', () => {
      // Navigate back to the markdown tool
      const markdownTool = document.querySelector('[data-tool-id="md-to-pdf"]') as HTMLElement;
      if (markdownTool) {
        markdownTool.click();
      }
    });
    
    if (parseFloat(fileSizeMB) > 15) {
      console.warn(`Large PDF generated: ${fileSizeMB} MB. Consider using "Low Quality" setting for smaller files.`);
    }
    
  } catch (error) {
    console.error('MD to PDF conversion error:', error);
    hideLoader();
    showAlert('Conversion Failed', 'We encountered an issue while converting your Markdown to PDF.\n\nPlease check your content and try again. If the problem persists, try using a different Markdown flavor or reducing the content length.');
  }
}

export function setupMarkdownTool() {
  const mdInput = document.getElementById('md-input') as HTMLTextAreaElement;
  const preview = document.getElementById('markdown-preview') as HTMLDivElement;
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  
  if (mdInput && preview) {
    // Real-time preview functionality
    const updatePreview = async () => {
      const content = mdInput.value;
      const flavor = (document.getElementById('markdown-flavor') as HTMLSelectElement)?.value || 'github';
      
      if (content.trim()) {
        configureMarked(flavor);
        const processedContent = preprocessMathContent(content);
        const htmlContent = await marked.parse(processedContent);
        preview.innerHTML = htmlContent;
        
        // Render math expressions in preview
        renderMathExpressions(preview);
      } else {
        preview.innerHTML = '<p class="text-gray-500 italic">Preview will appear here...</p>';
      }
    };

    // Update preview on input change
    mdInput.addEventListener('input', updatePreview);
    
    // Update preview when flavor changes
    const flavorSelect = document.getElementById('markdown-flavor') as HTMLSelectElement;
    if (flavorSelect) {
      flavorSelect.addEventListener('change', updatePreview);
    }
  }

  // File upload functionality
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && file.type === 'text/markdown' || file?.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content && mdInput) {
            mdInput.value = content;
            // Trigger preview update
            mdInput.dispatchEvent(new Event('input'));
          }
        };
        reader.readAsText(file);
      } else {
        showAlert('Invalid File', 'Please select a valid Markdown (.md) file to upload.');
      }
    });
  }
}

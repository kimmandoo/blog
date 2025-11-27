'use client';

import { useEffect } from 'react';
import { themeConfig } from '@/config/theme.config';

export function CodeBlockEnhancer() {
  useEffect(() => {
    const { codeBlock } = themeConfig;
    
    // Add copy buttons and line numbers to all code blocks
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach((codeElement) => {
      const pre = codeElement.parentElement;
      if (!pre) return;

      // Skip if already wrapped
      if (pre.parentElement?.classList.contains('code-block-wrapper')) return;

      // Get language from class
      const className = codeElement.className;
      const languageMatch = className.match(/language-(\w+)/);
      const language = languageMatch ? languageMatch[1] : 'code';

      // Set data attribute for CSS ::before content
      codeElement.setAttribute('data-language', language);

      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      // Add line numbers if enabled
      if (codeBlock.showLineNumbers) {
        addLineNumbers(codeElement, codeBlock.startLineNumber);
        pre.classList.add('has-line-numbers');
      }

      // Create copy button if enabled
      if (codeBlock.showCopyButton) {
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.textContent = 'Copy';
        button.setAttribute('aria-label', 'Copy code to clipboard');
        
        button.addEventListener('click', async () => {
          // Get only the actual code content (excluding line numbers)
          const codeLines = codeElement.querySelectorAll('.code-line');
          let code: string;
          
          if (codeLines.length > 0) {
            code = Array.from(codeLines).map(line => line.textContent || '').join('\n');
          } else {
            code = codeElement.textContent || '';
          }
          
          try {
            await navigator.clipboard.writeText(code);
            button.textContent = 'Copied!';
            button.classList.add('copied');
            
            setTimeout(() => {
              button.textContent = 'Copy';
              button.classList.remove('copied');
            }, 2000);
          } catch (err) {
            console.error('Failed to copy code:', err);
            button.textContent = 'Error';
            
            setTimeout(() => {
              button.textContent = 'Copy';
            }, 2000);
          }
        });

        wrapper.appendChild(button);
      }

      // Add language badge if enabled
      if (codeBlock.showLanguageBadge && language !== 'code') {
        const badge = document.createElement('span');
        badge.className = 'language-badge';
        badge.textContent = language;
        wrapper.appendChild(badge);
      }
    });
  }, []);

  return null;
}

// Helper function to add line numbers to code blocks
// Note: This function processes pre-sanitized HTML content from rehype-highlight.
// The source content comes from trusted markdown files in the repository,
// not from user input. See lib/posts.ts for the content processing pipeline.
function addLineNumbers(codeElement: Element, startLine: number) {
  // Get the existing HTML content which includes syntax highlighting spans
  const originalContent = codeElement.innerHTML;
  const lines = originalContent.split('\n');
  
  // Remove empty last line if it exists (common with code blocks)
  if (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }
  
  // Clear the code element
  codeElement.innerHTML = '';
  
  // Create line wrappers using DOM methods for safety
  lines.forEach((lineHtml, index) => {
    const lineNumber = startLine + index;
    
    // Create wrapper span
    const wrapper = document.createElement('span');
    wrapper.className = 'code-line-wrapper';
    
    // Create line number span
    const lineNumSpan = document.createElement('span');
    lineNumSpan.className = 'line-number';
    lineNumSpan.textContent = String(lineNumber);
    
    // Create code line span
    // The lineHtml contains pre-processed syntax highlighting from rehype-highlight
    // which only generates safe span elements with class attributes
    const codeLineSpan = document.createElement('span');
    codeLineSpan.className = 'code-line';
    codeLineSpan.innerHTML = lineHtml;
    
    wrapper.appendChild(lineNumSpan);
    wrapper.appendChild(codeLineSpan);
    codeElement.appendChild(wrapper);
    
    // Add newline text node between lines (except for the last line)
    if (index < lines.length - 1) {
      codeElement.appendChild(document.createTextNode('\n'));
    }
  });
}

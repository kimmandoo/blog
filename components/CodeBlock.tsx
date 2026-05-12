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

      // Mermaid blocks are handled by MermaidRenderer.
      if (codeElement.classList.contains('language-mermaid')) return;

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

      const toolbar = document.createElement('div');
      toolbar.className = 'code-block-toolbar';

      if (codeBlock.showLanguageBadge && language !== 'code') {
        const badge = document.createElement('span');
        badge.className = 'language-badge';
        badge.textContent = language;
        toolbar.appendChild(badge);
      } else {
        const spacer = document.createElement('span');
        spacer.setAttribute('aria-hidden', 'true');
        toolbar.appendChild(spacer);
      }

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
        setCopyButtonState(button, 'copy');
        
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
            setCopyButtonState(button, 'copied');
            
            setTimeout(() => {
              setCopyButtonState(button, 'copy');
            }, 2000);
          } catch (err) {
            console.error('Failed to copy code:', err);
            setCopyButtonState(button, 'error');
            
            setTimeout(() => {
              setCopyButtonState(button, 'copy');
            }, 2000);
          }
        });

        toolbar.appendChild(button);
      }

      if (toolbar.childElementCount > 1 || toolbar.textContent?.trim()) {
        wrapper.classList.add('has-code-block-toolbar');
        wrapper.insertBefore(toolbar, pre);
      }
    });
  }, []);

  return null;
}

type CopyButtonState = 'copy' | 'copied' | 'error';

const copyButtonContent: Record<CopyButtonState, { label: string; ariaLabel: string; icon: string }> = {
  copy: {
    label: 'Copy',
    ariaLabel: 'Copy code to clipboard',
    icon: [
      '<svg class="copy-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>',
      '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>',
      '</svg>',
    ].join(''),
  },
  copied: {
    label: 'Copied',
    ariaLabel: 'Copied code to clipboard',
    icon: [
      '<svg class="copy-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">',
      '<path d="m20 6-11 11-5-5"></path>',
      '</svg>',
    ].join(''),
  },
  error: {
    label: 'Copy failed',
    ariaLabel: 'Copy failed',
    icon: [
      '<svg class="copy-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      '<circle cx="12" cy="12" r="10"></circle>',
      '<path d="M12 8v5"></path>',
      '<path d="M12 17h.01"></path>',
      '</svg>',
    ].join(''),
  },
};

function setCopyButtonState(button: HTMLButtonElement, state: CopyButtonState) {
  const content = copyButtonContent[state];

  button.setAttribute('aria-label', content.ariaLabel);
  button.innerHTML = `${content.icon}<span class="copy-button-label">${content.label}</span>`;
  button.classList.toggle('copied', state === 'copied');
  button.classList.toggle('error', state === 'error');
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
  });
}

'use client';

import { useEffect } from 'react';

export function CodeBlockEnhancer() {
  useEffect(() => {
    // Add copy buttons to all code blocks
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach((codeBlock) => {
      const pre = codeBlock.parentElement;
      if (!pre) return;

      // Skip if already wrapped
      if (pre.parentElement?.classList.contains('code-block-wrapper')) return;

      // Get language from class
      const className = codeBlock.className;
      const languageMatch = className.match(/language-(\w+)/);
      const language = languageMatch ? languageMatch[1] : 'code';

      // Set data attribute for CSS ::before content
      codeBlock.setAttribute('data-language', language);

      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      // Create copy button
      const button = document.createElement('button');
      button.className = 'copy-button';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy code to clipboard');
      
      button.addEventListener('click', async () => {
        const code = codeBlock.textContent || '';
        
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
    });
  }, []);

  return null;
}

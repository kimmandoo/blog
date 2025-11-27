'use client';

import { useEffect } from 'react';
import mermaid from 'mermaid';

export function MermaidRenderer() {
  useEffect(() => {
    // Check if dark mode is active
    const isDarkMode = document.documentElement.classList.contains('dark') ||
      (!document.documentElement.classList.contains('light') && 
       window.matchMedia('(prefers-color-scheme: dark)').matches);

    mermaid.initialize({
      startOnLoad: false,
      theme: isDarkMode ? 'dark' : 'default',
      securityLevel: 'strict',
    });

    // Find all code blocks with language-mermaid class
    const mermaidBlocks = document.querySelectorAll('pre code.language-mermaid');

    mermaidBlocks.forEach((codeBlock, index) => {
      const pre = codeBlock.parentElement;
      if (!pre) return;

      // Get the mermaid diagram definition
      const graphDefinition = codeBlock.textContent || '';

      // Create a container for the rendered diagram
      const container = document.createElement('div');
      container.className = 'mermaid-container';
      container.id = `mermaid-${index}`;
      // Store original content for theme change re-rendering
      container.setAttribute('data-original', graphDefinition);

      // Replace the pre element with the container
      pre.parentNode?.replaceChild(container, pre);

      // Render the mermaid diagram
      mermaid.render(`mermaid-svg-${index}`, graphDefinition)
        .then(({ svg }) => {
          container.innerHTML = svg;
        })
        .catch((error) => {
          console.error('Mermaid rendering error:', error);
          container.textContent = `Mermaid diagram error: ${error.message}`;
        });
    });

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          // Theme changed, re-render mermaid diagrams
          const newIsDarkMode = document.documentElement.classList.contains('dark') ||
            (!document.documentElement.classList.contains('light') && 
             window.matchMedia('(prefers-color-scheme: dark)').matches);

          mermaid.initialize({
            startOnLoad: false,
            theme: newIsDarkMode ? 'dark' : 'default',
            securityLevel: 'strict',
          });

          // Re-render all mermaid diagrams
          document.querySelectorAll('.mermaid-container').forEach((container, idx) => {
            const originalContent = container.getAttribute('data-original');
            if (originalContent) {
              mermaid.render(`mermaid-svg-rerender-${idx}-${Date.now()}`, originalContent)
                .then(({ svg }) => {
                  container.innerHTML = svg;
                })
                .catch(console.error);
            }
          });
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}

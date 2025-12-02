import { APP_VERSION } from '../../version.js';

// Handle simple mode footer replacement for tool pages
if (__SIMPLE_MODE__) {
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.display = 'none';

        const simpleFooter = document.createElement('footer');
        simpleFooter.className = 'mt-16 border-t-2 border-gray-700 py-8';
        simpleFooter.innerHTML = `
      <div class="container mx-auto px-4">
        <div class="flex items-center mb-4">
          <img src="../../images/favicon.svg" alt="Bento PDF Logo" class="h-8 w-8 mr-2">
          <span class="text-white font-bold text-lg">BentoPDF</span>
        </div>
        <p class="text-gray-400 text-sm">
          &copy; 2025 BentoPDF. All rights reserved.
        </p>
        <p class="text-gray-500 text-xs mt-2">
          Version <span id="app-version-simple">${APP_VERSION}</span>
        </p>
      </div>
    `;
        document.body.appendChild(simpleFooter);
    }
}

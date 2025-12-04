import { APP_VERSION } from '../../version.js';

// Handle simple mode footer replacement for tool pages
if (true || __SIMPLE_MODE__) {
  const footer = document.querySelector('footer');
  if (footer) {
    footer.innerHTML = `
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
  }

  // also header nav
  const nav = document.querySelector('nav');
  if (nav) {
    nav.innerHTML = `
          <div class="container mx-auto px-4">
            <div class="flex justify-start items-center h-16">
              <div class="flex-shrink-0 flex items-center cursor-pointer" id="home-logo">
                <img src="/images/favicon.svg" alt="Bento PDF Logo" class="h-8 w-8">
                <span class="text-white font-bold text-xl ml-2">
                  <a href="index.html">BentoPDF</a>
                </span>
              </div>
            </div>
          </div>
        `;
  }
}

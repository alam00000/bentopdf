import { categories } from './config/tools.js';
import { dom, switchView, hideAlert } from './ui.js';
import { setupToolInterface } from './handlers/toolSelectionHandler.js';
import { createIcons, icons } from 'lucide';
import * as pdfjsLib from 'pdfjs-dist';
import '../css/styles.css';

const init = () => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();

  // Handle simple mode - hide branding sections but keep logo and copyright
  if (__SIMPLE_MODE__) {
    const hideBrandingSections = () => {
      // Hide navigation but keep logo
      const nav = document.querySelector('nav');
      if (nav) {
        // Hide the entire nav but we'll create a minimal one with just logo
        nav.style.display = 'none';

        // Create a simple nav with just logo on the right
        const simpleNav = document.createElement('nav');
        simpleNav.className =
          'bg-gray-800 border-b border-gray-700 sticky top-0 z-30';
        simpleNav.innerHTML = `
          <div class="container mx-auto px-4">
            <div class="flex justify-start items-center h-16">
              <div class="flex-shrink-0 flex items-center">
                <img src="images/favicon.svg" alt="Bento PDF Logo" class="h-8 w-8">
                <span class="text-white font-bold text-xl ml-2">BentoPDF</span>
              </div>
            </div>
          </div>
        `;
        document.body.insertBefore(simpleNav, document.body.firstChild);
      }

      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        heroSection.style.display = 'none';
      }

      const featuresSection = document.getElementById('features-section');
      if (featuresSection) {
        featuresSection.style.display = 'none';
      }

      const securitySection = document.getElementById(
        'security-compliance-section'
      );
      if (securitySection) {
        securitySection.style.display = 'none';
      }

      const faqSection = document.getElementById('faq-accordion');
      if (faqSection) {
        faqSection.style.display = 'none';
      }

      const testimonialsSection = document.getElementById(
        'testimonials-section'
      );
      if (testimonialsSection) {
        testimonialsSection.style.display = 'none';
      }

      const supportSection = document.getElementById('support-section');
      if (supportSection) {
        supportSection.style.display = 'none';
      }

      // Hide footer but keep copyright
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.display = 'none';

        const simpleFooter = document.createElement('footer');
        simpleFooter.className = 'mt-16 border-t-2 border-gray-700 py-8';
        simpleFooter.innerHTML = `
          <div class="container mx-auto px-4">
            <div class="flex items-center mb-4">
              <img src="images/favicon.svg" alt="Bento PDF Logo" class="h-8 w-8 mr-2">
              <span class="text-white font-bold text-lg">BentoPDF</span>
            </div>
            <p class="text-gray-400 text-sm">
              &copy; 2025 BentoPDF. All rights reserved.
            </p>
          </div>
        `;
        document.body.appendChild(simpleFooter);
      }

      const sectionDividers = document.querySelectorAll('.section-divider');
      sectionDividers.forEach((divider) => {
        (divider as HTMLElement).style.display = 'none';
      });

      document.title = 'BentoPDF - PDF Tools';

      const toolsHeader = document.getElementById('tools-header');
      if (toolsHeader) {
        const title = toolsHeader.querySelector('h2');
        const subtitle = toolsHeader.querySelector('p');
        if (title) {
          title.textContent = 'PDF Tools';
          title.className = 'text-4xl md:text-5xl font-bold text-white mb-3';
        }
        if (subtitle) {
          subtitle.textContent = 'Select a tool to get started';
          subtitle.className = 'text-lg text-gray-400';
        }
      }

      const app = document.getElementById('app');
      if (app) {
        app.style.paddingTop = '1rem';
      }
    };

    hideBrandingSections();
  }

  dom.toolGrid.textContent = '';

  categories.forEach((category) => {
    const categoryGroup = document.createElement('div');
    categoryGroup.className = 'category-group col-span-full';

    const title = document.createElement('h2');
    title.className = 'text-xl font-bold text-indigo-400 mb-4 mt-8 first:mt-0';
    title.textContent = category.name;

    const toolsContainer = document.createElement('div');
    toolsContainer.className =
      'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6';

    category.tools.forEach((tool) => {
      const toolCard = document.createElement('div');
      toolCard.className =
        'tool-card bg-gray-800 rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center text-center';
      toolCard.dataset.toolId = tool.id;

      const icon = document.createElement('i');
      icon.className = 'w-10 h-10 mb-3 text-indigo-400';
      icon.setAttribute('data-lucide', tool.icon);

      const toolName = document.createElement('h3');
      toolName.className = 'font-semibold text-white';
      toolName.textContent = tool.name;

      toolCard.append(icon, toolName);

      if (tool.subtitle) {
        const toolSubtitle = document.createElement('p');
        toolSubtitle.className = 'text-xs text-gray-400 mt-1 px-2';
        toolSubtitle.textContent = tool.subtitle;
        toolCard.appendChild(toolSubtitle);
      }

      toolsContainer.appendChild(toolCard);
    });

    categoryGroup.append(title, toolsContainer);
    dom.toolGrid.appendChild(categoryGroup);
  });

  const searchBar = document.getElementById('search-bar');
  const categoryGroups = dom.toolGrid.querySelectorAll('.category-group');

  searchBar.addEventListener('input', () => {
    // @ts-expect-error TS(2339) FIXME: Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const searchTerm = searchBar.value.toLowerCase().trim();

    categoryGroups.forEach((group) => {
      const toolCards = group.querySelectorAll('.tool-card');
      let visibleToolsInCategory = 0;

      toolCards.forEach((card) => {
        const toolName = card.querySelector('h3').textContent.toLowerCase();
        const toolSubtitle =
          card.querySelector('p')?.textContent.toLowerCase() || '';
        const isMatch =
          toolName.includes(searchTerm) || toolSubtitle.includes(searchTerm);

        card.classList.toggle('hidden', !isMatch);
        if (isMatch) {
          visibleToolsInCategory++;
        }
      });

      group.classList.toggle('hidden', visibleToolsInCategory === 0);
    });
  });

  window.addEventListener('keydown', function (e) {
    const key = e.key.toLowerCase();
    const isMac = navigator.userAgent.toUpperCase().includes('MAC');
    const isCtrlK = e.ctrlKey && key === 'k';
    const isCmdK = isMac && e.metaKey && key === 'k';

    if (isCtrlK || isCmdK) {
      e.preventDefault();
      searchBar.focus();
    }
  });

  const shortcutK = document.getElementById('shortcut');
  const isIosOrAndroid = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isIosOrAndroid) {
    shortcutK.style.display = 'none';
  } else {
    shortcutK.textContent = navigator.userAgent.toUpperCase().includes('MAC')
      ? '⌘ + K'
      : 'Ctrl + K';
  }

  dom.toolGrid.addEventListener('click', (e) => {
    // @ts-expect-error TS(2339) FIXME: Property 'closest' does not exist on type 'EventTa... Remove this comment to see the full error message
    const card = e.target.closest('.tool-card');
    if (card) {
      const toolId = card.dataset.toolId;
      setupToolInterface(toolId);
    }
  });
  dom.backToGridBtn.addEventListener('click', () => switchView('grid'));
  dom.alertOkBtn.addEventListener('click', hideAlert);

  const faqAccordion = document.getElementById('faq-accordion');
  if (faqAccordion) {
    faqAccordion.addEventListener('click', (e) => {
      // @ts-expect-error TS(2339) FIXME: Property 'closest' does not exist on type 'EventTa... Remove this comment to see the full error message
      const questionButton = e.target.closest('.faq-question');
      if (!questionButton) return;

      const faqItem = questionButton.parentElement;
      const answer = faqItem.querySelector('.faq-answer');

      faqItem.classList.toggle('open');

      if (faqItem.classList.contains('open')) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      } else {
        answer.style.maxHeight = '0px';
      }
    });
  }

  createIcons({ icons });
  console.log('Please share our tool and share the love!');
};

document.addEventListener('DOMContentLoaded', init);

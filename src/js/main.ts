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

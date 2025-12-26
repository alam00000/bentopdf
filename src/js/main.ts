import { categories } from './config/tools.js';
import { dom, hideAlert } from './ui.js';
import { ShortcutsManager } from './logic/shortcuts.js';
import { createIcons, icons } from 'lucide';
import * as pdfjsLib from 'pdfjs-dist';
import '../css/styles.css';
import { formatShortcutDisplay } from './utils/helpers.js';

// ============================================================================
// Types
// ============================================================================

interface Tool {
  href: string;
  name: string;
  icon: string;
  subtitle: string;
}

interface Category {
  name: string;
  tools: Tool[];
}

// ============================================================================
// State Management
// ============================================================================

const PINNED_TOOLS_KEY = 'bentopdf-pinned-tools';
const SIDEBAR_COLLAPSED_KEY = 'bentopdf-sidebar-collapsed';
const EXPANDED_CATEGORIES_KEY = 'bentopdf-expanded-categories';

function getPinnedTools(): string[] {
  try {
    const stored = localStorage.getItem(PINNED_TOOLS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePinnedTools(tools: string[]): void {
  localStorage.setItem(PINNED_TOOLS_KEY, JSON.stringify(tools));
}

function togglePinnedTool(toolId: string): boolean {
  const pinned = getPinnedTools();
  const index = pinned.indexOf(toolId);
  if (index === -1) {
    pinned.push(toolId);
    savePinnedTools(pinned);
    return true; // now pinned
  } else {
    pinned.splice(index, 1);
    savePinnedTools(pinned);
    return false; // now unpinned
  }
}

function isToolPinned(toolId: string): boolean {
  return getPinnedTools().includes(toolId);
}

function getExpandedCategories(): string[] {
  try {
    const stored = localStorage.getItem(EXPANDED_CATEGORIES_KEY);
    // Default: first category expanded
    return stored ? JSON.parse(stored) : [categories[0]?.name || ''];
  } catch {
    return [categories[0]?.name || ''];
  }
}

function saveExpandedCategories(cats: string[]): void {
  localStorage.setItem(EXPANDED_CATEGORIES_KEY, JSON.stringify(cats));
}

function toggleCategoryExpanded(categoryName: string): boolean {
  const expanded = getExpandedCategories();
  const index = expanded.indexOf(categoryName);
  if (index === -1) {
    expanded.push(categoryName);
    saveExpandedCategories(expanded);
    return true;
  } else {
    expanded.splice(index, 1);
    saveExpandedCategories(expanded);
    return false;
  }
}

function isCategoryExpanded(categoryName: string): boolean {
  return getExpandedCategories().includes(categoryName);
}

// ============================================================================
// Utility Functions
// ============================================================================

function getToolId(tool: Tool): string {
  if (tool.href) {
    const match = tool.href.match(/([^/]+)\.html$/);
    return match ? match[1] : tool.href;
  }
  return 'unknown';
}

function getToolById(toolId: string): Tool | undefined {
  for (const category of categories) {
    for (const tool of category.tools) {
      if (getToolId(tool) === toolId) {
        return tool;
      }
    }
  }
  return undefined;
}

function fuzzyMatch(searchTerm: string, targetText: string): boolean {
  if (!searchTerm) return true;
  const search = searchTerm.toLowerCase();
  const target = targetText.toLowerCase();

  // Simple contains match
  if (target.includes(search)) return true;

  // Fuzzy character match
  let searchIndex = 0;
  for (let i = 0; i < target.length && searchIndex < search.length; i++) {
    if (search[searchIndex] === target[i]) {
      searchIndex++;
    }
  }
  return searchIndex === search.length;
}

// ============================================================================
// Sidebar Rendering
// ============================================================================

function createToolItem(tool: Tool, showUnpin: boolean = false): HTMLElement {
  const toolId = getToolId(tool);
  const isPinned = isToolPinned(toolId);

  const item = document.createElement('a');
  item.href = tool.href;
  item.className = 'tool-item group flex items-center gap-2 px-2 py-1.5 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm';
  item.dataset.toolId = toolId;

  // Icon
  const icon = document.createElement('i');
  icon.className = 'w-4 h-4 text-gray-400 group-hover:text-indigo-400 flex-shrink-0';
  icon.setAttribute('data-lucide', tool.icon);

  // Name
  const name = document.createElement('span');
  name.className = 'flex-1 truncate';
  name.textContent = tool.name;

  // Pin/Unpin button
  const pinBtn = document.createElement('button');
  pinBtn.className = `pin-btn flex-shrink-0 p-0.5 rounded transition-all ${
    showUnpin
      ? 'text-gray-400 hover:text-red-400 opacity-100'
      : isPinned
        ? 'text-indigo-400 opacity-100'
        : 'text-gray-500 opacity-0 group-hover:opacity-100 hover:text-indigo-400'
  }`;
  pinBtn.title = isPinned ? 'Unpin' : 'Pin to top';
  pinBtn.innerHTML = showUnpin
    ? '<i data-lucide="x" class="w-3.5 h-3.5"></i>'
    : '<i data-lucide="pin" class="w-3.5 h-3.5"></i>';

  pinBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    togglePinnedTool(toolId);
    renderSidebar();
  });

  item.append(icon, name, pinBtn);
  return item;
}

function createCategorySection(category: Category): HTMLElement {
  const section = document.createElement('div');
  section.className = 'category-section';
  section.dataset.category = category.name;

  const isExpanded = isCategoryExpanded(category.name);

  // Header
  const header = document.createElement('button');
  header.className = 'category-header w-full flex items-center gap-2 px-2 py-2 text-left text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-md transition-colors';

  const chevron = document.createElement('i');
  chevron.className = `w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`;
  chevron.setAttribute('data-lucide', 'chevron-right');

  const title = document.createElement('span');
  title.className = 'text-xs font-semibold uppercase tracking-wider';
  title.textContent = category.name;

  const count = document.createElement('span');
  count.className = 'ml-auto text-xs text-gray-500';
  count.textContent = `${category.tools.length}`;

  header.append(chevron, title, count);

  // Tools container
  const toolsContainer = document.createElement('div');
  toolsContainer.className = `category-tools pl-2 space-y-0.5 overflow-hidden transition-all ${isExpanded ? '' : 'hidden'}`;

  category.tools.forEach(tool => {
    toolsContainer.appendChild(createToolItem(tool));
  });

  // Toggle expand/collapse
  header.addEventListener('click', () => {
    const nowExpanded = toggleCategoryExpanded(category.name);
    toolsContainer.classList.toggle('hidden', !nowExpanded);
    chevron.classList.toggle('rotate-90', nowExpanded);
  });

  section.append(header, toolsContainer);
  return section;
}

function renderPinnedSection(): void {
  const pinnedSection = document.getElementById('pinned-section');
  const pinnedContainer = document.getElementById('pinned-tools');
  if (!pinnedSection || !pinnedContainer) return;

  const pinnedIds = getPinnedTools();

  if (pinnedIds.length === 0) {
    pinnedSection.classList.add('hidden');
    return;
  }

  pinnedSection.classList.remove('hidden');
  pinnedContainer.innerHTML = '';

  pinnedIds.forEach(toolId => {
    const tool = getToolById(toolId);
    if (tool) {
      pinnedContainer.appendChild(createToolItem(tool, true));
    }
  });
}

function renderCategories(): void {
  const container = document.getElementById('tool-categories');
  if (!container) return;

  container.innerHTML = '';

  categories.forEach(category => {
    container.appendChild(createCategorySection(category as Category));
  });
}

function renderSidebar(): void {
  renderPinnedSection();
  renderCategories();
  createIcons({ icons });
}

// ============================================================================
// Search Functionality
// ============================================================================

function setupSearch(): void {
  const searchInput = document.getElementById('sidebar-search') as HTMLInputElement;
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    const term = searchInput.value.trim();
    filterTools(term);
  });

  // Keyboard shortcut: Ctrl/Cmd + K to focus search
  window.addEventListener('keydown', (e) => {
    const isMac = navigator.userAgent.toUpperCase().includes('MAC');
    if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    // Escape to clear and blur
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      filterTools('');
      searchInput.blur();
    }
  });
}

function filterTools(searchTerm: string): void {
  const pinnedSection = document.getElementById('pinned-section');
  const categorySections = document.querySelectorAll('.category-section');

  if (!searchTerm) {
    // Reset to normal view
    if (pinnedSection) {
      const hasPinned = getPinnedTools().length > 0;
      pinnedSection.classList.toggle('hidden', !hasPinned);
    }

    categorySections.forEach(section => {
      section.classList.remove('hidden');
      const tools = section.querySelectorAll('.tool-item');
      tools.forEach(tool => tool.classList.remove('hidden'));

      // Restore expand/collapse state
      const categoryName = (section as HTMLElement).dataset.category || '';
      const toolsContainer = section.querySelector('.category-tools');
      const chevron = section.querySelector('.category-header i');
      const isExpanded = isCategoryExpanded(categoryName);
      toolsContainer?.classList.toggle('hidden', !isExpanded);
      chevron?.classList.toggle('rotate-90', isExpanded);
    });
    return;
  }

  // Hide pinned section during search
  pinnedSection?.classList.add('hidden');

  // Filter and expand all categories
  categorySections.forEach(section => {
    const tools = section.querySelectorAll('.tool-item');
    let hasVisibleTool = false;

    tools.forEach(toolEl => {
      const toolItem = toolEl as HTMLElement;
      const toolName = toolItem.querySelector('span')?.textContent || '';
      const toolId = toolItem.dataset.toolId || '';
      const tool = getToolById(toolId);
      const subtitle = tool?.subtitle || '';

      const matches = fuzzyMatch(searchTerm, toolName) || fuzzyMatch(searchTerm, subtitle);
      toolItem.classList.toggle('hidden', !matches);
      if (matches) hasVisibleTool = true;
    });

    // Show/hide category based on matches
    section.classList.toggle('hidden', !hasVisibleTool);

    // Expand category if it has matches
    if (hasVisibleTool) {
      const toolsContainer = section.querySelector('.category-tools');
      const chevron = section.querySelector('.category-header i');
      toolsContainer?.classList.remove('hidden');
      chevron?.classList.add('rotate-90');
    }
  });
}

// ============================================================================
// Sidebar Toggle
// ============================================================================

function setupSidebarToggle(): void {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebarCollapsedToggle = document.getElementById('sidebar-collapsed-toggle') as HTMLInputElement;

  if (!sidebar || !toggleBtn) return;

  // Load saved preference
  const savedCollapsed = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  if (savedCollapsed) {
    sidebar.classList.add('sidebar-collapsed');
  }

  // Update preferences toggle
  if (sidebarCollapsedToggle) {
    sidebarCollapsedToggle.checked = savedCollapsed;
    sidebarCollapsedToggle.addEventListener('change', (e) => {
      const collapsed = (e.target as HTMLInputElement).checked;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed.toString());
    });
  }

  toggleBtn.addEventListener('click', () => {
    const isCollapsed = sidebar.classList.toggle('sidebar-collapsed');
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, isCollapsed.toString());
  });
}

// ============================================================================
// Settings Modal
// ============================================================================

function setupSettingsModal(): void {
  const openBtn = document.getElementById('open-shortcuts-btn');
  const closeBtn = document.getElementById('close-shortcuts-modal');
  const modal = document.getElementById('shortcuts-modal');

  if (!openBtn || !closeBtn || !modal) return;

  openBtn.addEventListener('click', () => {
    renderShortcutsList();
    modal.classList.remove('hidden');
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });

  // Tab switching
  const shortcutsTabBtn = document.getElementById('shortcuts-tab-btn');
  const preferencesTabBtn = document.getElementById('preferences-tab-btn');
  const shortcutsTabContent = document.getElementById('shortcuts-tab-content');
  const preferencesTabContent = document.getElementById('preferences-tab-content');
  const shortcutsTabFooter = document.getElementById('shortcuts-tab-footer');
  const preferencesTabFooter = document.getElementById('preferences-tab-footer');
  const resetShortcutsBtn = document.getElementById('reset-shortcuts-btn');

  if (shortcutsTabBtn && preferencesTabBtn) {
    shortcutsTabBtn.addEventListener('click', () => {
      shortcutsTabBtn.classList.add('bg-indigo-600', 'text-white');
      shortcutsTabBtn.classList.remove('text-gray-300');
      preferencesTabBtn.classList.remove('bg-indigo-600', 'text-white');
      preferencesTabBtn.classList.add('text-gray-300');
      shortcutsTabContent?.classList.remove('hidden');
      preferencesTabContent?.classList.add('hidden');
      shortcutsTabFooter?.classList.remove('hidden');
      preferencesTabFooter?.classList.add('hidden');
      resetShortcutsBtn?.classList.remove('hidden');
    });

    preferencesTabBtn.addEventListener('click', () => {
      preferencesTabBtn.classList.add('bg-indigo-600', 'text-white');
      preferencesTabBtn.classList.remove('text-gray-300');
      shortcutsTabBtn.classList.remove('bg-indigo-600', 'text-white');
      shortcutsTabBtn.classList.add('text-gray-300');
      preferencesTabContent?.classList.remove('hidden');
      shortcutsTabContent?.classList.add('hidden');
      preferencesTabFooter?.classList.remove('hidden');
      shortcutsTabFooter?.classList.add('hidden');
      resetShortcutsBtn?.classList.add('hidden');
    });
  }

  // Reset shortcuts
  if (resetShortcutsBtn) {
    resetShortcutsBtn.addEventListener('click', async () => {
      if (confirm('Reset all shortcuts to defaults?')) {
        ShortcutsManager.reset();
        renderShortcutsList();
      }
    });
  }

  // Import/Export
  const exportBtn = document.getElementById('export-shortcuts-btn');
  const importBtn = document.getElementById('import-shortcuts-btn');

  exportBtn?.addEventListener('click', () => {
    ShortcutsManager.exportSettings();
  });

  importBtn?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (ShortcutsManager.importSettings(content)) {
            renderShortcutsList();
            alert('Shortcuts imported successfully!');
          } else {
            alert('Failed to import shortcuts. Invalid file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  });

  // Shortcut search
  const shortcutSearch = document.getElementById('shortcut-search') as HTMLInputElement;
  shortcutSearch?.addEventListener('input', (e) => {
    const term = (e.target as HTMLInputElement).value.toLowerCase();
    const sections = document.querySelectorAll('#shortcuts-list .category-section');

    sections.forEach(section => {
      const items = section.querySelectorAll('.shortcut-item');
      let visibleCount = 0;

      items.forEach(item => {
        const text = item.textContent?.toLowerCase() || '';
        const isMatch = text.includes(term);
        item.classList.toggle('hidden', !isMatch);
        if (isMatch) visibleCount++;
      });

      section.classList.toggle('hidden', visibleCount === 0);
    });
  });
}

function renderShortcutsList(): void {
  const container = document.getElementById('shortcuts-list');
  if (!container) return;

  container.innerHTML = '';
  const allShortcuts = ShortcutsManager.getAllShortcuts();
  const isMac = navigator.userAgent.toUpperCase().includes('MAC');
  const allTools = categories.flatMap(c => c.tools);

  categories.forEach(category => {
    const section = document.createElement('div');
    section.className = 'category-section mb-6 last:mb-0';

    const header = document.createElement('h3');
    header.className = 'text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 pl-1';
    header.textContent = category.name;
    section.appendChild(header);

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'space-y-2';

    category.tools.forEach(tool => {
      const toolId = getToolId(tool as Tool);
      const currentShortcut = allShortcuts.get(toolId) || '';

      const item = document.createElement('div');
      item.className = 'shortcut-item flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors';

      const left = document.createElement('div');
      left.className = 'flex items-center gap-3';

      const icon = document.createElement('i');
      icon.className = 'w-5 h-5 text-indigo-400';
      icon.setAttribute('data-lucide', tool.icon);

      const name = document.createElement('span');
      name.className = 'text-gray-200 font-medium';
      name.textContent = tool.name;

      left.append(icon, name);

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'shortcut-input w-32 bg-gray-800 border border-gray-600 text-white text-center text-sm rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all';
      input.placeholder = 'Click to set';
      input.value = formatShortcutDisplay(currentShortcut, isMac);
      input.readOnly = true;

      input.onfocus = () => {
        input.value = 'Press keys...';
        input.classList.add('border-indigo-500');
      };

      input.onblur = () => {
        input.value = formatShortcutDisplay(ShortcutsManager.getShortcut(toolId) || '', isMac);
        input.classList.remove('border-indigo-500');
      };

      input.onkeydown = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.key === 'Backspace' || e.key === 'Delete') {
          ShortcutsManager.setShortcut(toolId, '');
          renderShortcutsList();
          return;
        }

        const keys: string[] = [];
        if (isMac) {
          if (e.metaKey) keys.push('mod');
          if (e.ctrlKey) keys.push('ctrl');
        } else {
          if (e.ctrlKey || e.metaKey) keys.push('mod');
        }
        if (e.altKey) keys.push('alt');
        if (e.shiftKey) keys.push('shift');

        let key = e.key.toLowerCase();
        if (e.altKey && e.code) {
          if (e.code.startsWith('Key')) {
            key = e.code.slice(3).toLowerCase();
          } else if (e.code.startsWith('Digit')) {
            key = e.code.slice(5);
          }
        }

        const isModifier = ['control', 'shift', 'alt', 'meta'].includes(key);
        if (!isModifier) {
          keys.push(key);
          const combo = keys.join('+');

          // Check for conflicts
          const existingToolId = ShortcutsManager.findToolByShortcut(combo);
          if (existingToolId && existingToolId !== toolId) {
            const existingTool = allTools.find(t => getToolId(t as Tool) === existingToolId);
            alert(`This shortcut is already assigned to "${existingTool?.name || existingToolId}"`);
            input.blur();
            return;
          }

          ShortcutsManager.setShortcut(toolId, combo);
          renderShortcutsList();
        }
      };

      item.append(left, input);
      itemsContainer.appendChild(item);
    });

    section.appendChild(itemsContainer);
    container.appendChild(section);
  });

  createIcons({ icons });
}

// ============================================================================
// Alert Modal
// ============================================================================

function setupAlertModal(): void {
  if (dom.alertOkBtn) {
    dom.alertOkBtn.addEventListener('click', hideAlert);
  }
}

// ============================================================================
// Full Width Mode
// ============================================================================

function setupFullWidthMode(): void {
  const toggle = document.getElementById('full-width-toggle') as HTMLInputElement;
  if (!toggle) return;

  const savedValue = localStorage.getItem('fullWidthMode') === 'true';
  toggle.checked = savedValue;

  toggle.addEventListener('change', (e) => {
    const enabled = (e.target as HTMLInputElement).checked;
    localStorage.setItem('fullWidthMode', enabled.toString());
  });
}

// ============================================================================
// Initialization
// ============================================================================

const init = async () => {
  // Initialize PDF.js worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

  // Render sidebar
  renderSidebar();

  // Setup features
  setupSearch();
  setupSidebarToggle();
  setupSettingsModal();
  setupAlertModal();
  setupFullWidthMode();

  // Initialize shortcuts system
  ShortcutsManager.init();

  // Initialize icons
  createIcons({ icons });

  console.log('BentoPDF initialized');
};

window.addEventListener('load', init);

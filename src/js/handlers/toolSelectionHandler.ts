import { state } from '../state.js';
import { dom, switchView, toolTemplates } from '../ui.js';
import { setupFileInputHandler } from './fileHandler.js';
import { toolLogic } from '../logic/index.js';
import { createIcons, icons } from 'lucide';

const SETUP_AFTER_UPLOAD = ['sign-pdf'];

export function setupToolInterface(toolId: any) {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant' as ScrollBehavior,
  });

  state.activeTool = toolId;
  dom.toolContent.innerHTML = toolTemplates[toolId]();
  createIcons({ icons });
  switchView('tool');

  const fileInput = document.getElementById('file-input');
  const processBtn = document.getElementById('process-btn');

  if (!fileInput && processBtn) {
    const logic = toolLogic[toolId];
    if (logic) {
      const func = typeof logic.process === 'function' ? logic.process : logic;
      processBtn.onclick = func;
    }
  }

  if (toolLogic[toolId] && typeof toolLogic[toolId].setup === 'function') {
    if (!SETUP_AFTER_UPLOAD.includes(toolId)) {
      toolLogic[toolId].setup();
    }
  }

  if (fileInput) {
    setupFileInputHandler(toolId);
  }
}

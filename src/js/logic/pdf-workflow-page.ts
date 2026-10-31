import { showAlert } from '@/js/ui.js';
import { createWorkflowEditor, updateNodeDisplay } from '@/js/workflow/editor';
import type { WorkflowEditor } from '@/js/workflow/editor';
import { executeWorkflow } from '@/js/workflow/engine';
import { translateCategory, translateNodeLabel } from '@/js/workflow/i18n';
import { onPageReady, trText } from '@/js/i18n/i18n.js';
import type { NodeCategory } from '@/js/workflow/types';
import {
  type BaseWorkflowNode,
  nodeRegistry,
  getNodesByCategory,
  createNodeByType,
  PDFInputNode,
  EncryptedPDFError,
  ImageInputNode,
  WordToPdfNode,
  ExcelToPdfNode,
  PowerPointToPdfNode,
  TextToPdfNode,
  SvgToPdfNode,
  EpubToPdfNode,
  EmailToPdfNode,
  DigitalSignNode,
  XpsToPdfNode,
  MobiToPdfNode,
  Fb2ToPdfNode,
  CbzToPdfNode,
  MarkdownToPdfNode,
  JsonToPdfNode,
  XmlToPdfNode,
  WpdToPdfNode,
  WpsToPdfNode,
  PagesToPdfNode,
  OdgToPdfNode,
  PubToPdfNode,
  VsdToPdfNode,
} from '@/js/workflow/nodes';
import {
  saveWorkflow,
  loadWorkflow,
  exportWorkflow,
  importWorkflow,
  getSavedTemplateNames,
  templateNameExists,
  deleteTemplate,
} from '@/js/workflow/serialization';
import { getControlSpec } from '@/js/workflow/nodes/control-specs';
import { isToolDisabled } from '@/js/utils/disabled-tools.js';
import { IMAGE_ACCEPT } from '@/js/utils/image-input-utils.js';

let workflowEditor: WorkflowEditor | null = null;
let selectedNodeId: string | null = null;
let deleteNodeHandler: EventListener | null = null;

onPageReady(initializePage);

async function initializePage() {
  const container = document.getElementById('rete-container');
  if (!container) return;

  workflowEditor = await createWorkflowEditor(container);
  const { editor, area, engine } = workflowEditor;

  buildToolbox();

  editor.addPipe((context) => {
    if (context.type === 'nodecreated' || context.type === 'noderemoved') {
      updateNodeCount();
    }
    if (
      context.type === 'connectioncreated' ||
      context.type === 'connectionremoved'
    ) {
      const conn = context.data;
      updateNodeDisplay(conn.source, editor, area);
      updateNodeDisplay(conn.target, editor, area);
    }
    return context;
  });

  document.getElementById('run-btn')?.addEventListener('click', async () => {
    const allNodes = editor.getNodes() as BaseWorkflowNode[];
    if (allNodes.length === 0) {
      showAlert('Error', 'Add at least one node to run the workflow.');
      return;
    }
    const hasInput = allNodes.some((n) => n.category === 'Input');
    const hasOutput = allNodes.some((n) => n.category === 'Output');
    if (!hasInput || !hasOutput) {
      showAlert(
        'Error',
        'Your workflow needs at least one input node and one output node to run.'
      );
      return;
    }

    const statusText = document.getElementById('status-text');
    const runBtn = document.getElementById('run-btn') as HTMLButtonElement;
    runBtn.disabled = true;
    runBtn.classList.add('opacity-50', 'pointer-events-none');

    try {
      await executeWorkflow(editor, engine, area, (progress) => {
        const msg =
          progress.message ||
          trText('Processing {{nodeName}}...', { nodeName: progress.nodeName });
        if (statusText) statusText.textContent = msg;
      });
      if (statusText) statusText.textContent = trText('Workflow completed');
    } catch (err) {
      if (statusText) statusText.textContent = trText('Error during execution');
      showAlert('Error', (err as Error).message);
    } finally {
      runBtn.disabled = false;
      runBtn.classList.remove('opacity-50', 'pointer-events-none');
    }
  });

  document.getElementById('clear-btn')?.addEventListener('click', async () => {
    await editor.clear();
    updateNodeCount();
    const statusText = document.getElementById('status-text');
    if (statusText) statusText.textContent = trText('Ready');
    document.getElementById('settings-sidebar')?.classList.add('hidden');
  });

  document.getElementById('close-settings')?.addEventListener('click', () => {
    document.getElementById('settings-sidebar')?.classList.add('hidden');
  });

  document.getElementById('save-btn')?.addEventListener('click', () => {
    showSaveTemplateModal(editor, area);
  });

  document.getElementById('load-btn')?.addEventListener('click', () => {
    showLoadTemplateModal(editor, area);
  });

  document.getElementById('export-btn')?.addEventListener('click', () => {
    exportWorkflow(editor, area);
  });

  document.getElementById('import-btn')?.addEventListener('click', async () => {
    await importWorkflow(editor, area);
    updateNodeCount();
  });

  // Mobile toolbox sidebar toggle
  const toolboxSidebar = document.getElementById('toolbox-sidebar');
  const toolboxBackdrop = document.getElementById('toolbox-backdrop');

  function closeToolbox() {
    toolboxSidebar?.classList.add('hidden');
    toolboxSidebar?.classList.remove('flex');
    toolboxBackdrop?.classList.add('hidden');
  }

  function openToolbox() {
    toolboxSidebar?.classList.remove('hidden');
    toolboxSidebar?.classList.add('flex');
    toolboxBackdrop?.classList.remove('hidden');
  }

  document.getElementById('toolbox-toggle')?.addEventListener('click', () => {
    if (toolboxSidebar?.classList.contains('hidden')) {
      openToolbox();
    } else {
      closeToolbox();
    }
  });

  toolboxBackdrop?.addEventListener('click', closeToolbox);

  document.getElementById('node-search')?.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value.toLowerCase();
    const items = document.querySelectorAll<HTMLElement>('.toolbox-node-item');
    const categories =
      document.querySelectorAll<HTMLElement>('.toolbox-category');

    items.forEach((item) => {
      const label = item.dataset.label?.toLowerCase() ?? '';
      item.style.display = label.includes(query) ? '' : 'none';
    });

    categories.forEach((cat) => {
      const itemsContainer = cat.querySelector<HTMLElement>('.toolbox-items');
      if (itemsContainer) itemsContainer.style.display = '';
      const visibleItems = cat.querySelectorAll<HTMLElement>(
        '.toolbox-node-item:not([style*="display: none"])'
      );
      cat.style.display = visibleItems.length > 0 ? '' : 'none';
    });
  });

  let justPicked = false;
  let dragDistance = 0;
  let pickedNodeId: string | null = null;

  area.addPipe((context) => {
    if (context.type === 'nodepicked') {
      const nodeId = context.data.id;
      selectedNodeId = nodeId;
      justPicked = true;
      pickedNodeId = nodeId;
      dragDistance = 0;
    }
    if (context.type === 'nodetranslated') {
      const dx = context.data.position.x - context.data.previous.x;
      const dy = context.data.position.y - context.data.previous.y;
      dragDistance += Math.abs(dx) + Math.abs(dy);
    }
    if (context.type === 'nodedragged') {
      if (pickedNodeId && dragDistance < 5) {
        const node = editor.getNode(pickedNodeId) as BaseWorkflowNode;
        if (node) {
          showNodeSettings(node);
        }
      }
      pickedNodeId = null;
    }
    if (context.type === 'translated') {
      container.classList.add('is-panning');
    }
    return context;
  });

  container.addEventListener('mouseup', () =>
    container.classList.remove('is-panning')
  );
  container.addEventListener('mouseleave', () =>
    container.classList.remove('is-panning')
  );

  container.addEventListener('click', (e) => {
    if (justPicked) {
      justPicked = false;
      return;
    }
    if ((e.target as HTMLElement).closest('[data-testid="node"]')) return;
    selectedNodeId = null;
    document.getElementById('settings-sidebar')?.classList.add('hidden');
  });

  document.addEventListener('keydown', (e) => {
    if (!selectedNodeId || !workflowEditor) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      deleteSelectedNode();
    }
  });

  if (deleteNodeHandler) {
    document.removeEventListener('wf-delete-node', deleteNodeHandler);
  }
  deleteNodeHandler = ((e: CustomEvent) => {
    const nodeId = e.detail?.nodeId;
    if (nodeId) deleteNodeById(nodeId);
  }) as EventListener;
  document.addEventListener('wf-delete-node', deleteNodeHandler);
}

async function deleteNodeById(nodeId: string) {
  if (!workflowEditor) return;
  const { editor } = workflowEditor;

  const conns = editor
    .getConnections()
    .filter((c) => c.source === nodeId || c.target === nodeId);
  for (const conn of conns) {
    await editor.removeConnection(conn.id);
  }
  await editor.removeNode(nodeId);

  if (selectedNodeId === nodeId) {
    selectedNodeId = null;
    document.getElementById('settings-sidebar')?.classList.add('hidden');
  }
  updateNodeCount();
}

async function deleteSelectedNode() {
  if (!selectedNodeId) return;
  await deleteNodeById(selectedNodeId);
}

function updateNodeCount() {
  if (!workflowEditor) return;
  const count = workflowEditor.editor.getNodes().length;
  const el = document.getElementById('node-count');
  if (el)
    el.textContent =
      count !== 1
        ? trText('{{count}} nodes', { count })
        : trText('{{count}} node', { count });
}

function showSaveTemplateModal(
  editor: WorkflowEditor['editor'],
  area: WorkflowEditor['area']
) {
  const modal = document.getElementById('save-template-modal')!;
  const nameInput = document.getElementById(
    'save-template-name'
  ) as HTMLInputElement;
  const errorEl = document.getElementById('save-template-error')!;
  const confirmBtn = document.getElementById('save-template-confirm')!;
  const cancelBtn = document.getElementById('save-template-cancel')!;

  nameInput.value = '';
  errorEl.classList.add('hidden');
  modal.classList.remove('hidden');
  nameInput.focus();

  const cleanup = () => {
    modal.classList.add('hidden');
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    nameInput.removeEventListener('keydown', onKeydown);
  };

  const doSave = () => {
    const name = nameInput.value.trim();
    if (!name) {
      errorEl.textContent = trText('Please enter a name.');
      errorEl.classList.remove('hidden');
      return;
    }
    if (templateNameExists(name)) {
      errorEl.textContent = trText('A template with this name already exists.');
      errorEl.classList.remove('hidden');
      return;
    }
    saveWorkflow(editor, area, name);
    cleanup();
    showAlert(
      'Saved',
      trText('Template "{{name}}" saved.', { name }),
      'success'
    );
  };

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') doSave();
    if (e.key === 'Escape') cleanup();
  };

  nameInput.addEventListener('keydown', onKeydown);
  document
    .getElementById('save-template-confirm')!
    .addEventListener('click', doSave);
  document
    .getElementById('save-template-cancel')!
    .addEventListener('click', cleanup);
}

function showLoadTemplateModal(
  editor: WorkflowEditor['editor'],
  area: WorkflowEditor['area']
) {
  const modal = document.getElementById('load-template-modal')!;
  const listEl = document.getElementById('load-template-list')!;
  const emptyEl = document.getElementById('load-template-empty')!;
  const cancelBtn = document.getElementById('load-template-cancel')!;

  const names = getSavedTemplateNames();
  listEl.innerHTML = '';

  if (names.length === 0) {
    emptyEl.classList.remove('hidden');
  } else {
    emptyEl.classList.add('hidden');
    for (const name of names) {
      const row = document.createElement('div');
      row.className =
        'group flex items-center gap-2 bg-gray-900/60 hover:bg-gray-700/50 rounded-lg px-3 py-2.5 border border-gray-700/50 transition-colors cursor-pointer';

      const icon = document.createElement('i');
      icon.className = 'ph ph-file-text text-base text-gray-500 flex-shrink-0';
      row.appendChild(icon);

      const label = document.createElement('span');
      label.className = 'text-gray-200 text-sm truncate flex-1';
      label.textContent = name;
      row.appendChild(label);

      const loadBtn = document.createElement('button');
      loadBtn.className =
        'bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors flex-shrink-0';
      loadBtn.textContent = trText('Load');
      loadBtn.addEventListener('click', async () => {
        const loaded = await loadWorkflow(editor, area, name);
        cleanup();
        if (loaded) {
          updateNodeCount();
          showAlert(
            'Loaded',
            trText('Template "{{name}}" loaded.', { name }),
            'success'
          );
        } else {
          showAlert('Error', 'Failed to load template.');
        }
      });
      row.appendChild(loadBtn);

      const delBtn = document.createElement('button');
      delBtn.className =
        'text-gray-600 hover:text-red-400 transition-colors flex-shrink-0';
      delBtn.innerHTML = '<i class="ph ph-trash text-sm"></i>';
      delBtn.addEventListener('click', () => {
        deleteTemplate(name);
        row.remove();
        const remaining = getSavedTemplateNames();
        if (remaining.length === 0) emptyEl.classList.remove('hidden');
      });
      row.appendChild(delBtn);

      listEl.appendChild(row);
    }
  }

  modal.classList.remove('hidden');

  const cleanup = () => {
    modal.classList.add('hidden');
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
  };

  document
    .getElementById('load-template-cancel')!
    .addEventListener('click', cleanup);
}

function buildToolbox() {
  const container = document.getElementById('toolbox-categories');
  if (!container) return;

  const categorized = getNodesByCategory();
  const categoryOrder: Array<{
    key: NodeCategory;
    color: string;
  }> = [
    { key: 'Input', color: 'text-blue-400' },
    { key: 'Edit & Annotate', color: 'text-indigo-300' },
    { key: 'Organize & Manage', color: 'text-violet-300' },
    { key: 'Optimize & Repair', color: 'text-amber-300' },
    { key: 'Secure PDF', color: 'text-rose-300' },
    { key: 'Output', color: 'text-teal-300' },
  ];

  for (const cat of categoryOrder) {
    const entries = (categorized[cat.key] ?? []).filter(
      (entry) => !entry.toolPageId || !isToolDisabled(entry.toolPageId)
    );
    if (entries.length === 0) continue;

    const section = document.createElement('div');
    section.className = 'toolbox-category';

    const header = document.createElement('button');
    header.className = `w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider ${cat.color} mb-1.5 px-1 hover:opacity-80 transition-opacity`;
    header.type = 'button';

    const headerLabel = document.createElement('span');
    headerLabel.textContent = translateCategory(cat.key);
    header.appendChild(headerLabel);

    const chevronWrap = document.createElement('span');
    chevronWrap.className = 'flex-shrink-0';
    chevronWrap.innerHTML = '<i class="ph ph-caret-down text-xs"></i>';
    header.appendChild(chevronWrap);

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'toolbox-items';

    header.addEventListener('click', () => {
      const collapsed = itemsContainer.style.display === 'none';
      itemsContainer.style.display = collapsed ? '' : 'none';
      const iconName = collapsed ? 'ph-caret-down' : 'ph-caret-up';
      chevronWrap.innerHTML = `<i class="ph ${iconName} text-xs"></i>`;
    });

    section.appendChild(header);

    for (const entry of entries) {
      const item = document.createElement('button');
      item.className =
        'toolbox-node-item w-full text-left px-2 py-1.5 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-xs flex items-center gap-2';
      const nodeType = Object.keys(nodeRegistry).find(
        (k) => nodeRegistry[k] === entry
      )!;
      const translatedLabel = translateNodeLabel(nodeType, entry);
      item.dataset.label = translatedLabel;
      item.dataset.type = nodeType;

      const iconEl = document.createElement('i');
      iconEl.className = `ph ${entry.icon} text-sm flex-shrink-0`;
      item.appendChild(iconEl);

      const labelEl = document.createElement('span');
      labelEl.textContent = translatedLabel;
      item.appendChild(labelEl);

      item.addEventListener('click', () => {
        addNodeToCanvas(item.dataset.type!);
        if (window.innerWidth < 768) {
          document.getElementById('toolbox-sidebar')?.classList.add('hidden');
          document.getElementById('toolbox-sidebar')?.classList.remove('flex');
          document.getElementById('toolbox-backdrop')?.classList.add('hidden');
        }
      });

      item.draggable = true;
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer?.setData(
          'application/rete-node-type',
          item.dataset.type!
        );
        e.dataTransfer!.effectAllowed = 'copy';
      });

      itemsContainer.appendChild(item);
    }

    section.appendChild(itemsContainer);
    container.appendChild(section);
  }

  const reteContainer = document.getElementById('rete-container');
  if (reteContainer) {
    reteContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'copy';
    });
    reteContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      const nodeType = e.dataTransfer?.getData('application/rete-node-type');
      if (!nodeType || !workflowEditor) return;

      const { area } = workflowEditor;
      const rect = reteContainer.getBoundingClientRect();
      const { x: tx, y: ty, k } = area.area.transform;
      const x = (e.clientX - rect.left - tx) / k;
      const y = (e.clientY - rect.top - ty) / k;
      addNodeToCanvas(nodeType, { x, y });
    });
  }
}

async function addNodeToCanvas(
  type: string,
  position?: { x: number; y: number }
) {
  if (!workflowEditor) return;
  const { editor, area } = workflowEditor;

  try {
    const node = createNodeByType(type);
    if (!node) {
      console.error(
        'Node type not found in registry:',
        String(type).replace(/[\r\n]+/g, ' ')
      );
      return;
    }
    await editor.addNode(node);

    const pos = position || getCanvasCenter(area);
    await area.translate(node.id, pos);
  } catch (err) {
    console.error('Failed to add node to canvas:', err);
  }
}

function getCanvasCenter(area: WorkflowEditor['area']): {
  x: number;
  y: number;
} {
  const container = area.container;
  const rect = container.getBoundingClientRect();
  const { x: tx, y: ty, k } = area.area.transform;
  const cx = (rect.width / 2 - tx) / k;
  const cy = (rect.height / 2 - ty) / k;
  return {
    x: cx + (Math.random() - 0.5) * 100,
    y: cy + (Math.random() - 0.5) * 100,
  };
}

function buildFileList(
  container: HTMLElement,
  filenames: string[],
  onRemove: (index: number) => void
) {
  const list = document.createElement('div');
  list.className = 'flex flex-col gap-1.5 mb-2';

  filenames.forEach((name, i) => {
    const row = document.createElement('div');
    row.className =
      'flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2';

    const nameEl = document.createElement('span');
    nameEl.className = 'text-sm text-white truncate flex-1 mr-2';
    nameEl.textContent = name;
    row.appendChild(nameEl);

    const removeBtn = document.createElement('button');
    removeBtn.className =
      'text-gray-500 hover:text-red-400 text-lg leading-none flex-shrink-0';
    removeBtn.innerHTML = '&times;';
    removeBtn.addEventListener('click', () => onRemove(i));
    row.appendChild(removeBtn);

    list.appendChild(row);
  });

  container.appendChild(list);
}

function promptPdfPassword(filename: string): Promise<string | null> {
  return new Promise((resolve) => {
    const modal = document.getElementById('pdf-password-modal')!;
    const filenameEl = document.getElementById('pdf-password-filename')!;
    const input = document.getElementById(
      'pdf-password-input'
    ) as HTMLInputElement;
    const errorEl = document.getElementById('pdf-password-error')!;
    const skipBtn = document.getElementById('pdf-password-skip')!;
    const unlockBtn = document.getElementById('pdf-password-unlock')!;

    filenameEl.textContent = filename;
    input.value = '';
    errorEl.classList.add('hidden');
    modal.classList.remove('hidden');
    input.focus();

    const cleanup = () => {
      modal.classList.add('hidden');
      skipBtn.replaceWith(skipBtn.cloneNode(true));
      unlockBtn.replaceWith(unlockBtn.cloneNode(true));
      input.removeEventListener('keydown', onKeydown);
    };

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        cleanup();
        resolve(input.value || null);
      }
      if (e.key === 'Escape') {
        cleanup();
        resolve(null);
      }
    };

    input.addEventListener('keydown', onKeydown);
    document
      .getElementById('pdf-password-skip')!
      .addEventListener('click', () => {
        cleanup();
        resolve(null);
      });
    document
      .getElementById('pdf-password-unlock')!
      .addEventListener('click', () => {
        cleanup();
        resolve(input.value || null);
      });
  });
}

function showNodeSettings(node: BaseWorkflowNode) {
  const sidebar = document.getElementById('settings-sidebar');
  const title = document.getElementById('settings-title');
  const content = document.getElementById('settings-content');
  if (!sidebar || !title || !content) return;

  sidebar.classList.remove('hidden');
  title.textContent = node.label;
  content.innerHTML = '';

  if (node instanceof PDFInputNode) {
    const fileSection = document.createElement('div');

    const label = document.createElement('label');
    label.className = 'block text-xs text-gray-400 mb-1';
    label.textContent = trText('PDF Files');
    fileSection.appendChild(label);

    if (node.hasFile()) {
      buildFileList(fileSection, node.getFilenames(), (index) => {
        node.removeFile(index);
        showNodeSettings(node);
      });
    }

    const uploadBtn = document.createElement('button');
    uploadBtn.className =
      'w-full bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded-lg transition-colors';
    uploadBtn.textContent = node.hasFile()
      ? trText('Add More Files')
      : trText('Upload PDFs');

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf';
    fileInput.multiple = true;
    fileInput.className = 'hidden';
    fileInput.addEventListener('change', async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files ?? []);
      if (files.length === 0) return;
      for (const file of files) {
        try {
          await node.addFile(file);
        } catch (err) {
          if (err instanceof EncryptedPDFError) {
            const password = await promptPdfPassword(file.name);
            if (password) {
              try {
                await node.addDecryptedFile(file, password);
              } catch {
                showAlert(
                  'Error',
                  trText('Wrong password or failed to decrypt "{{name}}".', {
                    name: file.name,
                  })
                );
              }
            }
          } else {
            showAlert('Error', 'Failed to load PDF: ' + (err as Error).message);
          }
        }
      }
      showNodeSettings(node);
    });

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileSection.appendChild(uploadBtn);
    fileSection.appendChild(fileInput);
    content.appendChild(fileSection);
    return;
  }

  if (node instanceof ImageInputNode) {
    const fileSection = document.createElement('div');

    const label = document.createElement('label');
    label.className = 'block text-xs text-gray-400 mb-1';
    label.textContent = trText('Images');
    fileSection.appendChild(label);

    const formatHint = document.createElement('p');
    formatHint.className = 'text-[10px] text-gray-500 mb-2';
    formatHint.textContent = trText(
      'Supported: JPG, PNG, BMP, GIF, TIFF, WebP, HEIC, PSD, SVG, PNM, PGM, PBM, PPM, PAM, JXR, JPX, JP2'
    );
    fileSection.appendChild(formatHint);

    if (node.hasFile()) {
      buildFileList(fileSection, node.getFilenames(), (index) => {
        node.removeFile(index);
        showNodeSettings(node);
      });
    }

    const uploadBtn = document.createElement('button');
    uploadBtn.className =
      'w-full bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded-lg transition-colors';
    uploadBtn.textContent = node.hasFile()
      ? trText('Add More Images')
      : trText('Upload Images');

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = IMAGE_ACCEPT;
    fileInput.multiple = true;
    fileInput.className = 'hidden';
    fileInput.addEventListener('change', async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files ?? []);
      if (files.length === 0) return;
      try {
        await node.addFiles(files);
        showNodeSettings(node);
      } catch (err) {
        showAlert('Error', 'Failed to load images: ' + (err as Error).message);
      }
    });

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileSection.appendChild(uploadBtn);
    fileSection.appendChild(fileInput);
    content.appendChild(fileSection);
    return;
  }

  if (node instanceof DigitalSignNode) {
    const certSection = document.createElement('div');

    const certLabel = document.createElement('label');
    certLabel.className = 'block text-xs text-gray-400 mb-1';
    certLabel.textContent = trText('Certificate (.pfx, .p12, .pem)');
    certSection.appendChild(certLabel);

    if (node.hasCertFile()) {
      const certFileDiv = document.createElement('div');
      certFileDiv.className =
        'flex items-center justify-between bg-gray-700 px-3 py-2 rounded-lg mb-2';

      const certName = document.createElement('span');
      certName.className = 'text-xs text-gray-200 truncate flex-1';
      certName.textContent = node.getCertFilename();

      const statusDot = document.createElement('span');
      statusDot.className = `w-2 h-2 rounded-full flex-shrink-0 mx-2 ${node.hasCert() ? 'bg-green-400' : 'bg-yellow-400'}`;

      const removeBtn = document.createElement('button');
      removeBtn.className =
        'text-red-400 hover:text-red-300 text-xs flex-shrink-0';
      removeBtn.textContent = trText('Remove');
      removeBtn.addEventListener('click', () => {
        node.removeCert();
        showNodeSettings(node);
      });

      certFileDiv.append(certName, statusDot, removeBtn);
      certSection.appendChild(certFileDiv);

      if (node.needsPassword()) {
        const pwSection = document.createElement('div');
        pwSection.className = 'mb-2';

        const pwLabel = document.createElement('label');
        pwLabel.className = 'block text-xs text-gray-400 mb-1';
        pwLabel.textContent = trText('Certificate Password');
        pwSection.appendChild(pwLabel);

        const pwRow = document.createElement('div');
        pwRow.className = 'flex gap-2';

        const pwInput = document.createElement('input');
        pwInput.type = 'password';
        pwInput.placeholder = trText('Enter password...');
        pwInput.className =
          'flex-1 bg-gray-700 border border-gray-600 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-indigo-500';

        const unlockBtn = document.createElement('button');
        unlockBtn.className =
          'bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded-lg transition-colors flex-shrink-0';
        unlockBtn.textContent = trText('Unlock');

        const statusMsg = document.createElement('div');
        statusMsg.className = 'text-xs mt-1 hidden';

        const doUnlock = async () => {
          const pw = pwInput.value;
          if (!pw) return;
          unlockBtn.textContent = trText('Unlocking...');
          unlockBtn.disabled = true;
          const success = await node.unlockCert(pw);
          if (success) {
            showNodeSettings(node);
          } else {
            unlockBtn.textContent = trText('Unlock');
            unlockBtn.disabled = false;
            statusMsg.textContent = trText('Incorrect password');
            statusMsg.className = 'text-xs mt-1 text-red-400';
            statusMsg.classList.remove('hidden');
          }
        };

        unlockBtn.addEventListener('click', doUnlock);
        pwInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') doUnlock();
        });

        pwRow.append(pwInput, unlockBtn);
        pwSection.append(pwRow, statusMsg);
        certSection.appendChild(pwSection);
      } else if (node.hasCert()) {
        const okMsg = document.createElement('div');
        okMsg.className = 'text-xs text-green-400 mb-2';
        okMsg.textContent = trText('Certificate unlocked');
        certSection.appendChild(okMsg);
      }
    }

    const uploadBtn = document.createElement('button');
    uploadBtn.className =
      'w-full bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded-lg transition-colors';
    uploadBtn.textContent = node.hasCertFile()
      ? trText('Change Certificate')
      : trText('Upload Certificate');

    const certInput = document.createElement('input');
    certInput.type = 'file';
    certInput.accept = '.pfx,.p12,.pem';
    certInput.className = 'hidden';
    certInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      node.setCertFile(file);

      const isPem = file.name.toLowerCase().endsWith('.pem');
      if (isPem) {
        file.text().then(async (pemContent) => {
          const isEncrypted = pemContent.includes('ENCRYPTED');
          if (!isEncrypted) {
            await node.unlockCert('');
          }
          showNodeSettings(node);
        });
      } else {
        showNodeSettings(node);
      }
    });

    uploadBtn.addEventListener('click', () => certInput.click());
    certSection.append(uploadBtn, certInput);
    content.appendChild(certSection);

    const divider = document.createElement('div');
    divider.className = 'border-t border-gray-700 my-3';
    content.appendChild(divider);
  }

  interface FileInputNode extends BaseWorkflowNode {
    hasFile(): boolean;
    getFilenames(): string[];
    removeFile(index: number): void;
    addFiles(files: File[]): Promise<void>;
  }

  const fileInputConfigs: {
    cls: new (...args: unknown[]) => FileInputNode;
    label: string;
    accept: string;
    uploadLabel: string;
    addMoreLabel: string;
    hint?: string;
  }[] = [
    {
      cls: WordToPdfNode,
      label: trText('Word Documents'),
      accept: '.doc,.docx,.odt,.rtf',
      uploadLabel: trText('Upload Documents'),
      addMoreLabel: trText('Add More Documents'),
      hint: trText('Supported: DOC, DOCX, ODT, RTF'),
    },
    {
      cls: ExcelToPdfNode,
      label: trText('Spreadsheets'),
      accept: '.xlsx,.xls,.ods,.csv',
      uploadLabel: trText('Upload Spreadsheets'),
      addMoreLabel: trText('Add More Spreadsheets'),
      hint: trText('Supported: XLSX, XLS, ODS, CSV'),
    },
    {
      cls: PowerPointToPdfNode,
      label: trText('Presentations'),
      accept: '.ppt,.pptx,.odp',
      uploadLabel: trText('Upload Presentations'),
      addMoreLabel: trText('Add More Presentations'),
      hint: trText('Supported: PPT, PPTX, ODP'),
    },
    {
      cls: TextToPdfNode,
      label: trText('Text Files'),
      accept: '.txt',
      uploadLabel: trText('Upload Text Files'),
      addMoreLabel: trText('Add More Text Files'),
    },
    {
      cls: SvgToPdfNode,
      label: trText('SVG Files'),
      accept: '.svg',
      uploadLabel: trText('Upload SVG Files'),
      addMoreLabel: trText('Add More SVG Files'),
    },
    {
      cls: EpubToPdfNode,
      label: trText('EPUB Files'),
      accept: '.epub',
      uploadLabel: trText('Upload EPUB Files'),
      addMoreLabel: trText('Add More EPUB Files'),
    },
    {
      cls: EmailToPdfNode,
      label: trText('Email Files'),
      accept: '.eml,.msg',
      uploadLabel: trText('Upload Email Files'),
      addMoreLabel: trText('Add More Email Files'),
      hint: trText('Supported: EML, MSG'),
    },
    {
      cls: XpsToPdfNode,
      label: trText('XPS Files'),
      accept: '.xps,.oxps',
      uploadLabel: trText('Upload XPS Files'),
      addMoreLabel: trText('Add More XPS Files'),
      hint: trText('Supported: XPS, OXPS'),
    },
    {
      cls: MobiToPdfNode,
      label: trText('MOBI Files'),
      accept: '.mobi',
      uploadLabel: trText('Upload MOBI Files'),
      addMoreLabel: trText('Add More MOBI Files'),
    },
    {
      cls: Fb2ToPdfNode,
      label: trText('FB2 Files'),
      accept: '.fb2',
      uploadLabel: trText('Upload FB2 Files'),
      addMoreLabel: trText('Add More FB2 Files'),
    },
    {
      cls: CbzToPdfNode,
      label: trText('Comic Archives'),
      accept: '.cbz,.cbr',
      uploadLabel: trText('Upload Comics'),
      addMoreLabel: trText('Add More Comics'),
      hint: trText('Supported: CBZ, CBR'),
    },
    {
      cls: MarkdownToPdfNode,
      label: trText('Markdown Files'),
      accept: '.md,.markdown',
      uploadLabel: trText('Upload Markdown Files'),
      addMoreLabel: trText('Add More Markdown Files'),
    },
    {
      cls: JsonToPdfNode,
      label: trText('JSON Files'),
      accept: '.json',
      uploadLabel: trText('Upload JSON Files'),
      addMoreLabel: trText('Add More JSON Files'),
    },
    {
      cls: XmlToPdfNode,
      label: trText('XML Files'),
      accept: '.xml',
      uploadLabel: trText('Upload XML Files'),
      addMoreLabel: trText('Add More XML Files'),
    },
    {
      cls: WpdToPdfNode,
      label: trText('WordPerfect Files'),
      accept: '.wpd',
      uploadLabel: trText('Upload WPD Files'),
      addMoreLabel: trText('Add More WPD Files'),
    },
    {
      cls: WpsToPdfNode,
      label: trText('WPS Files'),
      accept: '.wps',
      uploadLabel: trText('Upload WPS Files'),
      addMoreLabel: trText('Add More WPS Files'),
    },
    {
      cls: PagesToPdfNode,
      label: trText('Pages Files'),
      accept: '.pages',
      uploadLabel: trText('Upload Pages Files'),
      addMoreLabel: trText('Add More Pages Files'),
    },
    {
      cls: OdgToPdfNode,
      label: trText('ODG Files'),
      accept: '.odg',
      uploadLabel: trText('Upload ODG Files'),
      addMoreLabel: trText('Add More ODG Files'),
    },
    {
      cls: PubToPdfNode,
      label: trText('Publisher Files'),
      accept: '.pub',
      uploadLabel: trText('Upload PUB Files'),
      addMoreLabel: trText('Add More PUB Files'),
    },
    {
      cls: VsdToPdfNode,
      label: trText('Visio Files'),
      accept: '.vsd,.vsdx',
      uploadLabel: trText('Upload Visio Files'),
      addMoreLabel: trText('Add More Visio Files'),
      hint: trText('Supported: VSD, VSDX'),
    },
  ];

  const fileInputConfig = fileInputConfigs.find((c) => node instanceof c.cls);
  if (fileInputConfig) {
    const fileNode = node as InstanceType<typeof fileInputConfig.cls>;
    const fileSection = document.createElement('div');

    const label = document.createElement('label');
    label.className = 'block text-xs text-gray-400 mb-1';
    label.textContent = fileInputConfig.label;
    fileSection.appendChild(label);

    if (fileInputConfig.hint) {
      const hint = document.createElement('p');
      hint.className = 'text-[10px] text-gray-500 mb-2';
      hint.textContent = fileInputConfig.hint;
      fileSection.appendChild(hint);
    }

    if (fileNode.hasFile()) {
      buildFileList(fileSection, fileNode.getFilenames(), (index) => {
        fileNode.removeFile(index);
        showNodeSettings(node);
      });
    }

    const uploadBtn = document.createElement('button');
    uploadBtn.className =
      'w-full bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-2 rounded-lg transition-colors';
    uploadBtn.textContent = fileNode.hasFile()
      ? fileInputConfig.addMoreLabel
      : fileInputConfig.uploadLabel;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = fileInputConfig.accept;
    fileInput.multiple = true;
    fileInput.className = 'hidden';
    fileInput.addEventListener('change', async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files ?? []);
      if (files.length === 0) return;
      try {
        await fileNode.addFiles(files);
        showNodeSettings(node);
      } catch (err) {
        showAlert(
          'Error',
          trText('Failed to load files: {{error}}', {
            error: (err as Error).message,
          })
        );
      }
    });

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileSection.appendChild(uploadBtn);
    fileSection.appendChild(fileInput);
    content.appendChild(fileSection);

    const controlEntries = Object.entries(node.controls);
    if (controlEntries.length > 0) {
      const divider = document.createElement('div');
      divider.className = 'border-t border-gray-700 my-3';
      content.appendChild(divider);
    } else {
      return;
    }
  }

  const controlEntries = Object.entries(node.controls);
  if (controlEntries.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'text-xs text-gray-500';
    empty.textContent = trText('No configurable settings for this node.');
    content.appendChild(empty);
    return;
  }

  const advancedControls = new Set(['resolution', 'binarize', 'whitelist']);

  const controlHints: Record<string, string> = {
    pages: 'e.g. 1-3, 5, 7-9',
    whitelist: trText('Limit recognized characters (leave empty for all)'),
    afterPage: trText('Insert blank pages after this page number'),
    x0: trText('Left edge in points (1 inch = 72 pts)'),
    y0: trText('Top edge in points'),
    x1: trText('Right edge in points'),
    y1: trText('Bottom edge in points'),
    targetKilobytes: trText(
      'Finds the best quality under this size. 0 means no target.'
    ),
    retainPageLabels: trText(
      "Off (default): natural 1–N numbering. On: each file's original page labels are preserved (may produce duplicate labels)."
    ),
  };

  const inputClass =
    'w-full bg-gray-900 border border-gray-600 text-white rounded-md px-2 py-1.5 text-xs focus:border-indigo-500 focus:outline-none';

  const conditionalVisibility: Record<string, Record<string, string[]>> = {
    redactMode: {
      text: ['text'],
      area: ['x0', 'y0', 'x1', 'y1'],
    },
    targetSize: {
      Custom: ['customWidth', 'customHeight', 'customUnits'],
    },
  };

  const controlWrappers: Record<string, HTMLElement> = {};
  const hasAdvanced = controlEntries.some(([key]) => advancedControls.has(key));
  const advancedWrappers: HTMLElement[] = [];

  for (const [key, control] of controlEntries) {
    const wrapper = document.createElement('div');
    controlWrappers[key] = wrapper;
    const ctrl = control as { value?: unknown; type?: string };
    const currentValue = String(ctrl.value ?? '');
    const spec = getControlSpec(node.nodeType, key);

    const controlLabel = document.createElement('label');
    controlLabel.className = 'block text-xs text-gray-400 mb-1';
    controlLabel.textContent = trText(formatLabel(key));
    wrapper.appendChild(controlLabel);

    if (spec?.kind === 'multiselect') {
      const { options, separator } = spec;
      const selectedValues = new Set(
        currentValue ? currentValue.split(separator) : []
      );
      const container = document.createElement('div');
      container.className = 'flex flex-col gap-1';

      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = trText('Search languages...');
      searchInput.className = inputClass;
      container.appendChild(searchInput);

      const tagsDiv = document.createElement('div');
      tagsDiv.className = 'flex flex-wrap gap-1 min-h-[24px]';
      container.appendChild(tagsDiv);

      const listDiv = document.createElement('div');
      listDiv.className =
        'max-h-32 overflow-y-auto bg-gray-800 rounded border border-gray-600 mt-1';
      container.appendChild(listDiv);

      function updateTags() {
        tagsDiv.innerHTML = '';
        for (const val of selectedValues) {
          const opt = options.find((o) => o.value === val);
          if (!opt) continue;
          const tag = document.createElement('span');
          tag.className =
            'inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px]';
          tag.textContent = trText(opt.label);
          const removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          removeBtn.textContent = '\u00d7';
          removeBtn.className =
            'text-white/70 hover:text-white text-xs leading-none';
          removeBtn.addEventListener('click', () => {
            selectedValues.delete(val);
            updateTags();
            updateCtrl();
            renderList(searchInput.value);
          });
          tag.appendChild(removeBtn);
          tagsDiv.appendChild(tag);
        }
      }

      function updateCtrl() {
        (ctrl as { value: string }).value =
          Array.from(selectedValues).join(separator);
      }

      function renderList(filter: string) {
        listDiv.innerHTML = '';
        const lowerFilter = filter.toLowerCase();
        for (const opt of options) {
          if (
            lowerFilter &&
            !trText(opt.label).toLowerCase().includes(lowerFilter)
          )
            continue;
          const label = document.createElement('label');
          label.className =
            'flex items-center gap-2 px-2 py-1 hover:bg-gray-700 cursor-pointer text-xs text-gray-300';
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.checked = selectedValues.has(opt.value);
          cb.className =
            'w-3 h-3 rounded text-indigo-600 bg-gray-700 border-gray-600';
          cb.addEventListener('change', () => {
            if (cb.checked) {
              selectedValues.add(opt.value);
            } else {
              selectedValues.delete(opt.value);
            }
            updateTags();
            updateCtrl();
          });
          label.appendChild(cb);
          label.appendChild(document.createTextNode(trText(opt.label)));
          listDiv.appendChild(label);
        }
      }

      searchInput.addEventListener('input', () => {
        renderList(searchInput.value);
      });

      updateTags();
      renderList('');
      wrapper.appendChild(container);
    } else if (spec?.kind === 'select') {
      const select = document.createElement('select');
      select.className = inputClass;
      for (const opt of spec.options) {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = trText(opt.label);
        if (currentValue === opt.value) option.selected = true;
        select.appendChild(option);
      }
      select.addEventListener('change', () => {
        ctrl.value =
          typeof ctrl.value === 'number' ? Number(select.value) : select.value;
        if (conditionalVisibility[key]) {
          applyConditionalVisibility(key, select.value);
        }
      });
      wrapper.appendChild(select);
    } else if (spec?.kind === 'boolean') {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      const isOn = currentValue === 'true';
      toggle.className = `relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${isOn ? 'bg-indigo-500' : 'bg-gray-600'}`;
      const dot = document.createElement('span');
      dot.className = `pointer-events-none absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-md transition-transform duration-200 ${isOn ? 'translate-x-5' : 'translate-x-0'}`;
      toggle.appendChild(dot);
      toggle.addEventListener('click', () => {
        const newVal =
          (ctrl as { value: string }).value === 'true' ? 'false' : 'true';
        (ctrl as { value: string }).value = newVal;
        const on = newVal === 'true';
        toggle.className = `relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${on ? 'bg-indigo-500' : 'bg-gray-600'}`;
        dot.className = `pointer-events-none absolute top-[3px] left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-md transition-transform duration-200 ${on ? 'translate-x-5' : 'translate-x-0'}`;
      });
      wrapper.appendChild(toggle);
    } else if (spec?.kind === 'color') {
      const colorRow = document.createElement('div');
      colorRow.className = 'flex items-center gap-2';
      const colorInput = document.createElement('input');
      colorInput.type = 'color';
      colorInput.value = currentValue || '#000000';
      colorInput.className = 'w-8 h-8 rounded bg-transparent cursor-pointer';
      const hexInput = document.createElement('input');
      hexInput.type = 'text';
      hexInput.value = currentValue || '#000000';
      hexInput.className = inputClass + ' flex-1';
      colorInput.addEventListener('input', () => {
        hexInput.value = colorInput.value;
        (ctrl as { value: string }).value = colorInput.value;
      });
      hexInput.addEventListener('input', () => {
        if (/^#[0-9a-fA-F]{6}$/.test(hexInput.value)) {
          colorInput.value = hexInput.value;
        }
        (ctrl as { value: string }).value = hexInput.value;
      });
      colorRow.appendChild(colorInput);
      colorRow.appendChild(hexInput);
      wrapper.appendChild(colorRow);
    } else if (ctrl.type === 'number' || typeof ctrl.value === 'number') {
      const input = document.createElement('input');
      input.type = 'number';
      input.className = inputClass;
      if (spec?.kind === 'number') {
        input.min = String(spec.min);
        input.max = String(spec.max);
        input.step = spec.step === undefined ? 'any' : String(spec.step);
      }
      input.value = currentValue;
      input.addEventListener('input', () => {
        const num = parseFloat(input.value);
        if (!isNaN(num)) {
          ctrl.value = node.sanitizeControlValue(key, num);
        }
      });
      input.addEventListener('change', () => {
        input.value = String(ctrl.value ?? '');
      });
      wrapper.appendChild(input);
    } else {
      const input = document.createElement('input');
      input.type = spec?.kind === 'password' ? 'password' : 'text';
      input.className = inputClass;
      input.value = currentValue;
      input.addEventListener('input', () => {
        (ctrl as { value: string }).value = input.value;
      });
      wrapper.appendChild(input);
    }

    if (controlHints[key]) {
      const hint = document.createElement('p');
      hint.className = 'text-[10px] text-gray-500 mt-1';
      hint.textContent = controlHints[key];
      wrapper.appendChild(hint);
    }

    if (advancedControls.has(key)) {
      advancedWrappers.push(wrapper);
    } else {
      content.appendChild(wrapper);
    }
  }

  function applyConditionalVisibility(
    dropdownKey: string,
    selectedValue: string
  ) {
    const mapping = conditionalVisibility[dropdownKey];
    if (!mapping) return;
    const allControlled = new Set(Object.values(mapping).flat());
    for (const controlKey of allControlled) {
      const el = controlWrappers[controlKey];
      if (el) el.style.display = 'none';
    }
    const visible = mapping[selectedValue] ?? [];
    for (const controlKey of visible) {
      const el = controlWrappers[controlKey];
      if (el) el.style.display = '';
    }
  }

  for (const [dropdownKey] of Object.entries(conditionalVisibility)) {
    const ctrl = controlEntries.find(([k]) => k === dropdownKey)?.[1] as
      | { value?: unknown }
      | undefined;
    if (ctrl) {
      applyConditionalVisibility(dropdownKey, String(ctrl.value ?? ''));
    }
  }

  if (hasAdvanced && advancedWrappers.length > 0) {
    const details = document.createElement('details');
    details.className =
      'bg-gray-800/50 border border-gray-700 rounded-lg p-2 mt-1';
    const summary = document.createElement('summary');
    summary.className =
      'text-xs font-medium text-gray-400 cursor-pointer select-none flex items-center justify-between';
    const summaryText = document.createElement('span');
    summaryText.textContent = trText('Advanced Settings');
    summary.appendChild(summaryText);
    const chevron = document.createElement('i');
    chevron.className =
      'ph ph-caret-down text-xs text-gray-500 transition-transform duration-200';
    summary.appendChild(chevron);
    details.addEventListener('toggle', () => {
      chevron.style.transform = details.open
        ? 'rotate(180deg)'
        : 'rotate(0deg)';
    });
    details.appendChild(summary);
    const advancedContent = document.createElement('div');
    advancedContent.className = 'mt-2 space-y-3';
    for (const w of advancedWrappers) {
      advancedContent.appendChild(w);
    }
    details.appendChild(advancedContent);
    content.appendChild(details);
  }
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

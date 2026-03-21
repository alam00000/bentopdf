import type { NodeEditor } from 'rete';
import type { AreaPlugin } from 'rete-area-plugin';
import type { ClassicScheme, LitArea2D } from '@retejs/lit-plugin';
import type { BaseWorkflowNode } from './nodes/base-node';
import { createNodeByType } from './nodes/registry';
import { ClassicPreset } from 'rete';
import type { SerializedWorkflow } from './types';
import { WORKFLOW_VERSION } from './types';

type AreaExtra = LitArea2D<ClassicScheme>;

interface SerializedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  controls: Record<string, unknown>;
}

interface SerializedConnection {
  id: string;
  source: string;
  sourceOutput: string;
  target: string;
  targetInput: string;
}

function getNodeType(node: BaseWorkflowNode): string | null {
  return node.nodeType || null;
}

function serializeWorkflow(
  editor: NodeEditor<ClassicScheme>,
  area: AreaPlugin<ClassicScheme, AreaExtra>
): SerializedWorkflow {
  const nodes: SerializedNode[] = [];
  const connections: SerializedConnection[] = [];

  for (const node of editor.getNodes()) {
    const view = area.nodeViews.get(node.id);
    const position = view
      ? { x: view.position.x, y: view.position.y }
      : { x: 0, y: 0 };

    const controls: Record<string, unknown> = {};
    for (const [key, control] of Object.entries(node.controls)) {
      if (control && 'value' in control) {
        controls[key] = (control as { value: unknown }).value;
      }
    }

    nodes.push({
      id: node.id,
      type: getNodeType(node as BaseWorkflowNode) || 'unknown',
      position,
      controls,
    });
  }

  for (const conn of editor.getConnections()) {
    connections.push({
      id: conn.id,
      source: conn.source,
      sourceOutput: conn.sourceOutput as string,
      target: conn.target,
      targetInput: conn.targetInput as string,
    });
  }

  return {
    version: WORKFLOW_VERSION,
    nodes,
    connections,
  } as SerializedWorkflow;
}

async function deserializeWorkflow(
  data: SerializedWorkflow,
  editor: NodeEditor<ClassicScheme>,
  area: AreaPlugin<ClassicScheme, AreaExtra>
): Promise<void> {
  if (
    !data ||
    !Array.isArray((data as any).nodes) ||
    !Array.isArray((data as any).connections)
  ) {
    throw new Error(
      'Invalid workflow file: missing nodes or connections array.'
    );
  }

  if ((data as any).version !== WORKFLOW_VERSION) {
    console.warn(
      `Workflow version mismatch: expected ${WORKFLOW_VERSION}, got ${(data as any).version}. Attempting load anyway.`
    );
  }

  for (const conn of editor.getConnections()) {
    await editor.removeConnection(conn.id);
  }
  for (const node of editor.getNodes()) {
    await editor.removeNode(node.id);
  }

  const idMap = new Map<string, string>();
  const skippedTypes: string[] = [];

  for (const serializedNode of (data as any).nodes) {
    const node = createNodeByType(serializedNode.type);
    if (!node) {
      skippedTypes.push(serializedNode.type);
      continue;
    }

    for (const [key, value] of Object.entries(serializedNode.controls || {})) {
      const control = node.controls[key];
      if (control && 'value' in control) {
        (control as any).value = value;
      }
    }

    await editor.addNode(node as any);
    idMap.set(serializedNode.id, node.id);

    await area.translate(node.id, serializedNode.position);
  }

  for (const serializedConn of (data as any).connections) {
    const sourceId = idMap.get(serializedConn.source);
    const targetId = idMap.get(serializedConn.target);
    if (!sourceId || !targetId) continue;

    const sourceNode = editor.getNode(sourceId);
    const targetNode = editor.getNode(targetId);
    if (!sourceNode || !targetNode) continue;

    const conn = new ClassicPreset.Connection(
      sourceNode,
      serializedConn.sourceOutput,
      targetNode,
      serializedConn.targetInput
    );
    await editor.addConnection(conn as any);
  }

  if (skippedTypes.length > 0) {
    console.warn('Skipped unknown node types during load:', skippedTypes);
  }
}

const TEMPLATES_KEY = 'bento-pdf-workflow-templates';

interface StoredTemplates {
  [name: string]: SerializedWorkflow;
}

function getStoredTemplates(): StoredTemplates {
  const json = localStorage.getItem(TEMPLATES_KEY);
  if (!json) return {};
  try {
    return JSON.parse(json) as StoredTemplates;
  } catch {
    return {};
  }
}

export function getSavedTemplateNames(): string[] {
  return Object.keys(getStoredTemplates());
}

export function saveWorkflow(
  editor: NodeEditor<ClassicScheme>,
  area: AreaPlugin<ClassicScheme, AreaExtra>,
  name: string
): void {
  const data = serializeWorkflow(editor, area);
  const templates = getStoredTemplates();
  const backup = templates[name];
  templates[name] = data;
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch (e) {
    if (backup !== undefined) {
      templates[name] = backup;
    } else {
      delete templates[name];
    }
    throw new Error(
      'Failed to save workflow: storage quota exceeded. Try deleting old templates.'
    );
  }
}

export function templateNameExists(name: string): boolean {
  const templates = getStoredTemplates();
  return name in templates;
}

export async function loadWorkflow(
  editor: NodeEditor<ClassicScheme>,
  area: AreaPlugin<ClassicScheme, AreaExtra>,
  name: string
): Promise<boolean> {
  const templates = getStoredTemplates();
  const data = templates[name];
  if (!data) return false;

  try {
    await deserializeWorkflow(data, editor, area);
    return true;
  } catch (err) {
    console.error(`Failed to load workflow "${name}":`, err);
    return false;
  }
}

export function deleteTemplate(name: string): void {
  const templates = getStoredTemplates();
  delete templates[name];
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function exportWorkflow(
  editor: NodeEditor<ClassicScheme>,
  area: AreaPlugin<ClassicScheme, AreaExtra>
): void {
  const data = serializeWorkflow(editor, area);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'workflow.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importWorkflow(
  editor: NodeEditor<ClassicScheme>,
  area: AreaPlugin<ClassicScheme, AreaExtra>
): Promise<void> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    let settled = false;

    input.onchange = async () => {
      settled = true;
      const file = input.files?.[0];
      if (!file) {
        resolve();
        return;
      }
      try {
        const text = await file.text();
        const data = JSON.parse(text) as SerializedWorkflow;
        await deserializeWorkflow(data, editor, area);
        resolve();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        reject(new Error(`Failed to import workflow: ${message}`));
      }
    };

    const onFocus = () => {
      window.removeEventListener('focus', onFocus);
      setTimeout(() => {
        if (!settled) resolve();
      }, 300);
    };
    window.addEventListener('focus', onFocus);

    input.click();
  });
}

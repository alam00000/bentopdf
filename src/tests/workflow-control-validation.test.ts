import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createNodeByType, nodeRegistry } from '@/js/workflow/nodes/registry';
import type { BaseWorkflowNode } from '@/js/workflow/nodes/base-node';
import {
  getControlSpec,
  MAX_TEXT_CONTROL_LENGTH,
} from '@/js/workflow/nodes/control-specs';
import {
  exportWorkflow,
  getSavedTemplateNames,
  loadWorkflow,
  saveWorkflow,
} from '@/js/workflow/serialization';

vi.mock('heic2any', () => ({ default: vi.fn() }));

type Editor = Parameters<typeof loadWorkflow>[0];
type Area = Parameters<typeof loadWorkflow>[1];

const TEMPLATES_KEY = 'bento-pdf-workflow-templates';

function createFakeEditor(initial: BaseWorkflowNode[] = []) {
  const nodes = new Map<string, BaseWorkflowNode>(
    initial.map((node) => [node.id, node])
  );
  const editor = {
    getNodes: () => [...nodes.values()],
    getConnections: (): unknown[] => [],
    getNode: (id: string) => nodes.get(id),
    addNode: async (node: BaseWorkflowNode) => {
      nodes.set(node.id, node);
      return true;
    },
    removeNode: async (id: string) => nodes.delete(id),
    removeConnection: async () => true,
    addConnection: async () => true,
  };
  const area = {
    nodeViews: new Map(),
    translate: async () => true,
  };
  return {
    nodes,
    editor: editor as unknown as Editor,
    area: area as unknown as Area,
  };
}

function controlValue(node: BaseWorkflowNode, key: string): unknown {
  const control = node.controls[key];
  return control && 'value' in control ? control.value : undefined;
}

function setControl(node: BaseWorkflowNode, key: string, value: unknown) {
  const control = node.controls[key];
  if (!control || !('value' in control)) throw new Error(`missing ${key}`);
  control.value = value;
}

function storeTemplate(name: string, json: string) {
  localStorage.setItem(TEMPLATES_KEY, `{"${name}":${json}}`);
}

function workflowJson(
  nodes: { type: string; controls: Record<string, unknown> }[]
): string {
  return JSON.stringify({
    version: 1,
    nodes: nodes.map((node, index) => ({
      id: `n${index}`,
      type: node.type,
      position: { x: 0, y: 0 },
      controls: node.controls,
    })),
    connections: [],
  });
}

async function loadNodes(json: string): Promise<BaseWorkflowNode[]> {
  storeTemplate('imported', json);
  const { editor, area, nodes } = createFakeEditor();
  expect(await loadWorkflow(editor, area, 'imported')).toBe(true);
  return [...nodes.values()];
}

function findNode(nodes: BaseWorkflowNode[], type: string): BaseWorkflowNode {
  const node = nodes.find((candidate) => candidate.nodeType === type);
  if (!node) throw new Error(`missing ${type}`);
  return node;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('workflow import validation', () => {
  it('replaces select values outside the option list with the default', async () => {
    const nodes = await loadNodes(
      workflowJson([
        {
          type: 'RedactNode',
          controls: { redactMode: 'Area', text: 'secret' },
        },
        { type: 'NUpNode', controls: { pagesPerSheet: 7 } },
        { type: 'RotateNode', controls: { angle: '45' } },
        { type: 'CompressNode', controls: { compressionLevel: 'aggressive' } },
      ])
    );

    const redact = findNode(nodes, 'RedactNode');
    expect(controlValue(redact, 'redactMode')).toBe('text');
    expect(controlValue(redact, 'text')).toBe('secret');
    expect(controlValue(findNode(nodes, 'NUpNode'), 'pagesPerSheet')).toBe(4);
    expect(controlValue(findNode(nodes, 'RotateNode'), 'angle')).toBe('90');
    expect(
      controlValue(findNode(nodes, 'CompressNode'), 'compressionLevel')
    ).toBe('high');
  });

  it('keeps only known multi-select values', async () => {
    const nodes = await loadNodes(
      workflowJson([
        { type: 'OCRNode', controls: { language: 'eng+../../x+fra+eng' } },
        { type: 'OCRNode', controls: { language: 'zz+../evil' } },
      ])
    );

    const [mixed, unknown] = nodes;
    expect(controlValue(mixed, 'language')).toBe('eng+fra');
    expect(controlValue(unknown, 'language')).toBe('eng');
  });

  it('clamps out-of-range numbers and resets non-finite ones', async () => {
    const json = workflowJson([
      {
        type: 'WatermarkNode',
        controls: { opacity: 5000, fontSize: 1, angle: 0 },
      },
      { type: 'PosterizeNode', controls: { rows: 0, cols: 0 } },
      { type: 'RedactNode', controls: { x0: -50, x1: 0 } },
    ])
      .replace('"angle":0', '"angle":-1e999')
      .replace('"cols":0', '"cols":1e999')
      .replace('"x1":0', '"x1":1e999');
    const nodes = await loadNodes(json);

    const watermark = findNode(nodes, 'WatermarkNode');
    expect(controlValue(watermark, 'opacity')).toBe(100);
    expect(controlValue(watermark, 'fontSize')).toBe(10);
    expect(controlValue(watermark, 'angle')).toBe(-45);
    const posterize = findNode(nodes, 'PosterizeNode');
    expect(controlValue(posterize, 'rows')).toBe(1);
    expect(controlValue(posterize, 'cols')).toBe(2);
    const redact = findNode(nodes, 'RedactNode');
    expect(controlValue(redact, 'x0')).toBe(0);
    expect(controlValue(redact, 'x1')).toBe(200);

    const scanner = createNodeByType('ScannerEffectNode');
    expect(scanner?.sanitizeControlValue('resolution', Number.NaN)).toBe(150);
  });

  it('validates booleans, colors and text length', async () => {
    const nodes = await loadNodes(
      workflowJson([
        { type: 'SanitizeNode', controls: { removeJavascript: 'nope' } },
        { type: 'BackgroundColorNode', controls: { color: 'red;x' } },
        {
          type: 'EditMetadataNode',
          controls: { title: 'a'.repeat(MAX_TEXT_CONTROL_LENGTH + 500) },
        },
      ])
    );

    expect(
      controlValue(findNode(nodes, 'SanitizeNode'), 'removeJavascript')
    ).toBe('true');
    expect(controlValue(findNode(nodes, 'BackgroundColorNode'), 'color')).toBe(
      '#ffffff'
    );
    expect(
      String(controlValue(findNode(nodes, 'EditMetadataNode'), 'title'))
    ).toHaveLength(MAX_TEXT_CONTROL_LENGTH);
  });

  it('skips inherited property names used as node types', async () => {
    const nodes = await loadNodes(
      workflowJson([
        { type: 'constructor', controls: {} },
        { type: 'toString', controls: {} },
        { type: '__proto__', controls: {} },
        { type: 'hasOwnProperty', controls: {} },
        { type: 'RotateNode', controls: { constructor: 'x', angle: '180' } },
      ])
    );

    expect(nodes).toHaveLength(1);
    expect(nodes[0].nodeType).toBe('RotateNode');
    expect(controlValue(nodes[0], 'angle')).toBe('180');
    expect(createNodeByType('constructor')).toBeNull();
    expect(createNodeByType('toString')).toBeNull();
  });

  it('covers every registered node control with a valid spec', () => {
    for (const type of Object.keys(nodeRegistry)) {
      const node = createNodeByType(type);
      expect(node).not.toBeNull();
      if (!node) continue;
      for (const key of Object.keys(node.controls)) {
        const initial = controlValue(node, key);
        const spec = getControlSpec(type, key);
        if (/password/i.test(key)) {
          expect(spec?.kind, `${type}.${key}`).toBe('password');
          continue;
        }
        if (typeof initial === 'number') {
          expect(['number', 'select'], `${type}.${key}`).toContain(spec?.kind);
          expect(
            node.sanitizeControlValue(key, Number.POSITIVE_INFINITY),
            `${type}.${key}`
          ).toBe(initial);
        }
        expect(node.sanitizeControlValue(key, initial), `${type}.${key}`).toBe(
          initial
        );
      }
    }
  });
});

describe('workflow password controls', () => {
  function createSecretNodes(): BaseWorkflowNode[] {
    const encrypt = createNodeByType('EncryptNode');
    const decrypt = createNodeByType('DecryptNode');
    if (!encrypt || !decrypt) throw new Error('missing nodes');
    setControl(encrypt, 'userPassword', 'user-secret-1');
    setControl(encrypt, 'ownerPassword', 'owner-secret-2');
    setControl(decrypt, 'password', 'decrypt-secret-3');
    return [encrypt, decrypt];
  }

  const secrets = ['user-secret-1', 'owner-secret-2', 'decrypt-secret-3'];

  it('never writes passwords into saved templates', () => {
    const { editor, area } = createFakeEditor(createSecretNodes());
    saveWorkflow(editor, area, 'secure');

    const stored = localStorage.getItem(TEMPLATES_KEY) ?? '';
    for (const secret of secrets) expect(stored).not.toContain(secret);
    expect(stored).toContain('"userPassword":""');
  });

  it('never writes passwords into exported workflow JSON', async () => {
    const blobs: Blob[] = [];
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      blobs.push(blob as Blob);
      return 'blob:workflow';
    });
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const nodes = createSecretNodes();
    const { editor, area } = createFakeEditor(nodes);
    exportWorkflow(editor, area);

    expect(blobs).toHaveLength(1);
    const exported = await blobs[0].text();
    for (const secret of secrets) expect(exported).not.toContain(secret);
    expect(controlValue(nodes[0], 'userPassword')).toBe('user-secret-1');
  });

  it('drops passwords from imported workflows and legacy templates', async () => {
    storeTemplate(
      'legacy',
      workflowJson([
        {
          type: 'EncryptNode',
          controls: {
            userPassword: 'user-secret-1',
            ownerPassword: 'owner-secret-2',
          },
        },
        { type: 'DecryptNode', controls: { password: 'decrypt-secret-3' } },
      ])
    );

    expect(getSavedTemplateNames()).toEqual(['legacy']);
    const stored = localStorage.getItem(TEMPLATES_KEY) ?? '';
    for (const secret of secrets) expect(stored).not.toContain(secret);

    const legacyJson = workflowJson([
      { type: 'EncryptNode', controls: { userPassword: 'user-secret-1' } },
    ]);
    const nodes = await loadNodes(legacyJson);
    expect(controlValue(nodes[0], 'userPassword')).toBe('');
    expect(
      createNodeByType('DecryptNode')?.sanitizeControlValue(
        'password',
        'decrypt-secret-3'
      )
    ).toBe('');
  });
});

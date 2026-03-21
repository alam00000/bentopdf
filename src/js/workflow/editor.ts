import { NodeEditor } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from 'rete-connection-plugin';
import { LitPlugin, Presets as LitPresets } from '@retejs/lit-plugin';
import type { ClassicScheme, LitArea2D } from '@retejs/lit-plugin';
import { DataflowEngine } from 'rete-engine';
import type { DataflowEngineScheme } from 'rete-engine';
import { LitElement, html } from 'lit';
import type { BaseWorkflowNode } from './nodes/base-node';
// @ts-ignore -- Vite ?inline import for injecting into Shadow DOM
import phosphorCSS from '@phosphor-icons/web/regular?inline';

// Shared stylesheet for Phosphor icons (font-face already loaded globally, strip it)
const phosphorSheet = new CSSStyleSheet();
phosphorSheet.replaceSync(phosphorCSS.replace(/@font-face[^}]*\}/g, ''));

type AreaExtra = LitArea2D<ClassicScheme>;

export interface WorkflowEditor {
  editor: NodeEditor<ClassicScheme>;
  area: AreaPlugin<ClassicScheme, AreaExtra>;
  engine: DataflowEngine<DataflowEngineScheme>;
  destroy: () => void;
}

const categoryColors: Record<string, string> = {
  Input: '#60a5fa',
  'Edit & Annotate': '#a5b4fc',
  'Organize & Manage': '#c4b5fd',
  'Optimize & Repair': '#fcd34d',
  'Secure PDF': '#fda4af',
  Output: '#5eead4',
};

function getStatusInfo(status: string, connected: boolean) {
  if (status === 'running')
    return { color: '#eab308', label: 'Running...', animate: true };
  if (status === 'completed')
    return { color: '#22c55e', label: 'Complete', animate: false };
  if (status === 'error')
    return { color: '#ef4444', label: 'Failed', animate: false };
  return {
    color: connected ? '#22c55e' : '#6b7280',
    label: connected ? 'Connected' : 'Not connected',
    animate: false,
  };
}

class WorkflowNodeElement extends LitElement {
  static properties = {
    data: { attribute: false },
    emit: { attribute: false },
  };

  declare data: BaseWorkflowNode | undefined;
  declare emit: ((data: unknown) => void) | undefined;

  createRenderRoot(): HTMLElement | ShadowRoot {
    return this;
  }

  render() {
    if (!this.data) return html``;
    const node = this.data;
    const inputs = Object.entries(node.inputs || {});
    const outputs = Object.entries(node.outputs || {});
    const color = categoryColors[node.category] || '#6b7280';
    const emitFn = this.emit;

    return html`
      <div
        style="
        position: relative; display: flex; flex-direction: column;
        align-items: center; width: 280px;
      "
      >
        ${inputs.length > 0
          ? html`
              <div
                style="display: flex; justify-content: center; gap: 8px; position: relative; z-index: 1; margin-bottom: -7px;"
              >
                ${inputs.map(([key, input]) =>
                  input
                    ? html`
                        <div
                          style="display: flex; align-items: center; justify-content: center;"
                        >
                          <rete-ref
                            .data=${{
                              type: 'socket',
                              side: 'input',
                              key,
                              nodeId: node.id,
                              payload: input.socket,
                            }}
                            .emit=${emitFn}
                          ></rete-ref>
                        </div>
                      `
                    : null
                )}
              </div>
            `
          : null}
        <div
          style="
          background: #1f2937; border: 1px solid #374151;
          border-radius: 12px; width: 100%; overflow: hidden;
        "
        >
          <div
            style="height: 3px; border-radius: 10px 10px 0 0; overflow: hidden;"
          >
            <div
              data-wf="bar"
              style="
              height: 100%; width: 100%;
              background: #6b7280; opacity: 0.25;
            "
            ></div>
          </div>
          <div
            style="padding: 6px 14px; display: flex; align-items: center; gap: 6px;"
          >
            <span
              data-wf="dot"
              style="
              width: 7px; height: 7px; border-radius: 50%; background: #6b7280; flex-shrink: 0;
            "
            ></span>
            <span
              data-wf="label"
              style="font-size: 10px; color: #6b7280; font-weight: 500; flex: 1;"
              >Not connected</span
            >
            <span
              data-wf-delete="${node.id}"
              style="
              cursor: pointer; display: flex; align-items: center; justify-content: center;
              width: 18px; height: 18px; border-radius: 4px;
              color: #6b7280; transition: all 0.15s;
            "
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </span>
          </div>
          <div style="height: 1px; background: #374151; margin: 0 14px;"></div>
          <div
            style="padding: 10px 14px 12px; display: flex; align-items: flex-start; gap: 10px;"
          >
            <i
              class="ph ${node.icon}"
              style="font-size: 18px; color: ${color}; flex-shrink: 0; margin-top: 1px; line-height: 1;"
            ></i>
            <div style="flex: 1; min-width: 0;">
              <div
                style="font-size: 13px; font-weight: 600; color: #f3f4f6; line-height: 1.3;"
              >
                ${node.label}
              </div>
              <div
                style="font-size: 11px; color: #9ca3af; margin-top: 2px; line-height: 1.3;"
              >
                ${node.description}
              </div>
            </div>
          </div>
        </div>
        ${outputs.length > 0
          ? html`
              <div
                style="display: flex; justify-content: center; gap: 8px; position: relative; z-index: 1; margin-top: -7px;"
              >
                ${outputs.map(([key, output]) =>
                  output
                    ? html`
                        <div
                          style="display: flex; align-items: center; justify-content: center;"
                        >
                          <rete-ref
                            .data=${{
                              type: 'socket',
                              side: 'output',
                              key,
                              nodeId: node.id,
                              payload: output.socket,
                            }}
                            .emit=${emitFn}
                          ></rete-ref>
                        </div>
                      `
                    : null
                )}
              </div>
            `
          : null}
      </div>
    `;
  }
}

if (!customElements.get('wf-node')) {
  customElements.define('wf-node', WorkflowNodeElement);
}

export function updateNodeDisplay(
  nodeId: string,
  editor: NodeEditor<ClassicScheme>,
  area: AreaPlugin<ClassicScheme, AreaExtra>
) {
  const view = area.nodeViews.get(nodeId);
  if (!view) return;
  const el = view.element;
  const node = editor.getNode(nodeId) as BaseWorkflowNode;
  if (!node) return;

  const conns = editor.getConnections();
  const connected = conns.some(
    (c) => c.target === nodeId || c.source === nodeId
  );
  const status = node.execStatus || 'idle';
  const st = getStatusInfo(status, connected);

  const bar = el.querySelector<HTMLElement>('[data-wf="bar"]');
  const dot = el.querySelector<HTMLElement>('[data-wf="dot"]');
  const label = el.querySelector<HTMLElement>('[data-wf="label"]');

  if (bar) {
    bar.className = st.animate ? 'wf-bar-slide' : '';
    bar.style.background = st.animate
      ? `linear-gradient(90deg, #1f2937 0%, ${st.color} 50%, #1f2937 100%)`
      : st.color;
    bar.style.opacity =
      status === 'idle' && !connected
        ? '0.25'
        : status === 'idle'
          ? '0.5'
          : '1';
    bar.style.backgroundSize = st.animate ? '200% 100%' : '';
  }

  if (dot) {
    dot.className = st.animate ? 'wf-dot-pulse' : '';
    dot.style.background = st.color;
    dot.style.boxShadow = 'none';
  }

  if (label) {
    label.style.color = st.color;
    label.textContent = st.label;
  }
}

export async function createWorkflowEditor(
  container: HTMLElement
): Promise<WorkflowEditor> {
  const editor = new NodeEditor<ClassicScheme>();
  const area = new AreaPlugin<ClassicScheme, AreaExtra>(container);
  const connection = new ConnectionPlugin<ClassicScheme, AreaExtra>();
  const litPlugin = new LitPlugin<ClassicScheme, AreaExtra>();
  const engine = new DataflowEngine<DataflowEngineScheme>();

  litPlugin.addPreset(
    LitPresets.classic.setup({
      customize: {
        node(data) {
          return ({ emit }: { emit: (data: unknown) => void }) => {
            return html`<wf-node
              .data=${data.payload}
              .emit=${emit}
            ></wf-node>`;
          };
        },
        socket() {
          return () => {
            return html`<div
              style="
            width: 14px; height: 14px; border-radius: 50%;
            background: #6366f1; border: 2px solid #1f2937;
            box-shadow: 0 0 0 1px #6366f1; cursor: crosshair;
          "
            ></div>`;
          };
        },
      },
    })
  );

  connection.addPreset(ConnectionPresets.classic.setup());

  // Override connection path to use vertical bezier curves (top-to-bottom flow)
  litPlugin.addPipe((context) => {
    if ((context as any).type === 'connectionpath') {
      const { points } = (context as any).data;
      const [start, end] = points as [
        { x: number; y: number },
        { x: number; y: number },
      ];
      const curvature = 0.3;
      const horizontal = Math.abs(start.x - end.x);
      const dy =
        Math.max(horizontal / 2, Math.abs(end.y - start.y)) * curvature;
      const path = `M ${start.x} ${start.y} C ${start.x} ${start.y + dy} ${end.x} ${end.y - dy} ${end.x} ${end.y}`;
      return {
        ...context,
        data: { ...(context as any).data, path },
      } as typeof context;
    }
    return context;
  });

  editor.use(area);
  area.use(connection);
  area.use(litPlugin);
  (editor as NodeEditor<DataflowEngineScheme>).use(engine);

  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  AreaExtensions.simpleNodesOrder(area);

  // Inject Phosphor icon styles into Shadow DOM roots created by the Lit plugin
  let phosphorTimer: ReturnType<typeof setTimeout> | null = null;
  const injectPhosphor = () => {
    if (phosphorTimer) return;
    phosphorTimer = setTimeout(() => {
      phosphorTimer = null;
      for (const el of container.querySelectorAll('*')) {
        const sr = (el as HTMLElement).shadowRoot;
        if (sr && !sr.adoptedStyleSheets.includes(phosphorSheet)) {
          sr.adoptedStyleSheets = [...sr.adoptedStyleSheets, phosphorSheet];
        }
      }
    }, 50);
  };
  const observer = new MutationObserver(injectPhosphor);
  observer.observe(container, { childList: true, subtree: true });

  const onPointerDown = (e: Event) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      '[data-wf-delete]'
    );
    if (!target) return;
    e.stopPropagation();
    e.preventDefault();
    const nodeId = target.getAttribute('data-wf-delete');
    if (nodeId) {
      document.dispatchEvent(
        new CustomEvent('wf-delete-node', { detail: { nodeId } })
      );
    }
  };

  const onMouseEnter = (e: Event) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      '[data-wf-delete]'
    );
    if (!target) return;
    target.style.color = '#f87171';
    target.style.background = 'rgba(248,113,113,0.1)';
  };

  const onMouseLeave = (e: Event) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      '[data-wf-delete]'
    );
    if (!target) return;
    target.style.color = '#6b7280';
    target.style.background = 'transparent';
  };

  container.addEventListener('pointerdown', onPointerDown, true);
  container.addEventListener('mouseenter', onMouseEnter, true);
  container.addEventListener('mouseleave', onMouseLeave, true);

  return {
    editor,
    area,
    engine,
    destroy: () => {
      observer.disconnect();
      if (phosphorTimer) {
        clearTimeout(phosphorTimer);
        phosphorTimer = null;
      }
      container.removeEventListener('pointerdown', onPointerDown, true);
      container.removeEventListener('mouseenter', onMouseEnter, true);
      container.removeEventListener('mouseleave', onMouseLeave, true);
      area.destroy();
    },
  };
}

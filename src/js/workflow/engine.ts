import type { ClassicScheme, LitArea2D } from '@retejs/lit-plugin';
import { NodeEditor } from 'rete';
import { AreaPlugin } from 'rete-area-plugin';
import { DataflowEngine } from 'rete-engine';
import type { DataflowEngineScheme } from 'rete-engine';
import type { BaseWorkflowNode } from './nodes/base-node';
import { WorkflowError } from './types';
import type { ExecutionProgress } from './types';
import { updateNodeDisplay } from './editor';

type AreaExtra = LitArea2D<ClassicScheme>;

function getUpstreamNodes(
  nodeId: string,
  editor: NodeEditor<ClassicScheme>
): Set<string> {
  const visited = new Set<string>();
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    const incoming = editor
      .getConnections()
      .filter((c) => c.target === current);
    for (const conn of incoming) {
      queue.push(conn.source);
    }
  }
  return visited;
}

function topologicalSort(
  nodeIds: Set<string>,
  editor: NodeEditor<ClassicScheme>
): string[] {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const id of nodeIds) {
    inDegree.set(id, 0);
    adj.set(id, []);
  }
  for (const conn of editor.getConnections()) {
    if (nodeIds.has(conn.source) && nodeIds.has(conn.target)) {
      adj.get(conn.source)!.push(conn.target);
      inDegree.set(conn.target, (inDegree.get(conn.target) || 0) + 1);
    }
  }
  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }
  const sorted: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    for (const next of adj.get(current) || []) {
      const newDeg = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, newDeg);
      if (newDeg === 0) queue.push(next);
    }
  }
  if (sorted.length < nodeIds.size) {
    throw new WorkflowError(
      'Circular dependency detected in workflow. Please remove any loops between nodes.'
    );
  }

  return sorted;
}

function tick(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

function validateEncryptOrdering(
  editor: NodeEditor<ClassicScheme>,
  pipelineNodes: string[]
): string | null {
  for (const nodeId of pipelineNodes) {
    const node = editor.getNode(nodeId) as BaseWorkflowNode;
    if (node?.label !== 'Encrypt') continue;

    const outConns = editor.getConnections().filter((c) => c.source === nodeId);
    for (const conn of outConns) {
      const target = editor.getNode(conn.target) as BaseWorkflowNode;
      if (target && target.category !== 'Output') {
        return `The Encrypt node feeds into "${target.label}", which may fail on encrypted data. Move Encrypt to just before the output node.`;
      }
    }
  }
  return null;
}

export async function executeWorkflow(
  editor: NodeEditor<ClassicScheme>,
  engine: DataflowEngine<DataflowEngineScheme>,
  area: AreaPlugin<ClassicScheme, AreaExtra>,
  onProgress: (progress: ExecutionProgress) => void
): Promise<void> {
  const nodes = editor.getNodes() as BaseWorkflowNode[];
  const connections = editor.getConnections();

  const nodesWithOutputConnections = new Set(connections.map((c) => c.source));
  const terminalNodes = nodes.filter(
    (n) => !nodesWithOutputConnections.has(n.id)
  );

  if (terminalNodes.length === 0) {
    throw new Error(
      'No output nodes found. Add a Download node to complete your workflow.'
    );
  }

  const pipelineNodes = new Set<string>();
  for (const terminal of terminalNodes) {
    const upstream = getUpstreamNodes(terminal.id, editor);
    for (const id of upstream) pipelineNodes.add(id);
  }

  for (const node of nodes) {
    node.execStatus = 'idle';
    updateNodeDisplay(node.id, editor, area);
  }
  await tick();

  const sorted = topologicalSort(pipelineNodes, editor);

  const encryptWarning = validateEncryptOrdering(editor, sorted);
  if (encryptWarning) {
    throw new WorkflowError(encryptWarning, 'Encrypt');
  }

  engine.reset();

  for (const nodeId of sorted) {
    const node = editor.getNode(nodeId) as BaseWorkflowNode;
    if (!node) continue;

    node.execStatus = 'running';
    updateNodeDisplay(node.id, editor, area);
    onProgress({
      nodeId: node.id,
      nodeName: node.label,
      status: 'running',
      message: `Processing ${node.label}...`,
    });
    await tick();

    try {
      await engine.fetch(nodeId);

      node.execStatus = 'completed';
      updateNodeDisplay(node.id, editor, area);
      onProgress({
        nodeId: node.id,
        nodeName: node.label,
        status: 'completed',
      });
      await tick();
    } catch (error) {
      node.execStatus = 'error';
      updateNodeDisplay(node.id, editor, area);

      for (const remainingId of sorted) {
        const remaining = editor.getNode(remainingId) as BaseWorkflowNode;
        if (remaining && remaining.execStatus === 'running') {
          remaining.execStatus = 'idle';
          updateNodeDisplay(remaining.id, editor, area);
        }
      }

      const message = error instanceof Error ? error.message : String(error);
      const wrapped =
        error instanceof WorkflowError
          ? error
          : new WorkflowError(message, node.label);

      onProgress({
        nodeId: node.id,
        nodeName: node.label,
        status: 'error',
        message: wrapped.message,
      });
      throw wrapped;
    }
  }
}

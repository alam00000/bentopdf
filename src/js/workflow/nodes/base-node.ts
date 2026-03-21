import { ClassicPreset } from 'rete';
import type { NodeCategory, NodeMeta, SocketData } from '../types';

export abstract class BaseWorkflowNode extends ClassicPreset.Node {
  abstract readonly category: NodeCategory;
  abstract readonly icon: string;
  abstract readonly description: string;

  width = 280;
  height = 140;
  execStatus: 'idle' | 'running' | 'completed' | 'error' = 'idle';
  nodeType: string = '';

  constructor(label: string) {
    super(label);
  }

  abstract data(
    inputs: Record<string, SocketData[]>
  ): Promise<Record<string, SocketData>>;

  getMeta(): NodeMeta {
    return {
      id: this.id,
      label: this.label,
      category: this.category,
      icon: this.icon,
      description: this.description,
    };
  }
}

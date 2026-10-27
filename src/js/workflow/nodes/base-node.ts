import { ClassicPreset } from 'rete';
import type { NodeCategory, NodeMeta, SocketData } from '../types';
import { getControlSpec, sanitizeWithControlSpec } from './control-specs';

export abstract class BaseWorkflowNode extends ClassicPreset.Node {
  abstract readonly category: NodeCategory;
  abstract readonly icon: string;
  abstract description: string;

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

  sanitizeControlValue(key: string, value: unknown): unknown {
    const control = this.controls[key];
    if (!control || typeof control !== 'object' || !('value' in control)) {
      return value;
    }
    const current = (control as { value: unknown }).value;
    if (current === null || current === undefined) {
      return value;
    }
    if (typeof value !== typeof current) {
      return current;
    }
    return sanitizeWithControlSpec(
      getControlSpec(this.nodeType, key),
      value,
      current
    );
  }
}

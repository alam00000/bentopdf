export interface WorkflowControlOption {
  label: string;
  value: string;
}

export type WorkflowControlSpec =
  | { kind: 'select'; options: WorkflowControlOption[] }
  | { kind: 'multiselect'; options: WorkflowControlOption[]; separator: string }
  | { kind: 'number'; min: number; max: number; step?: number }
  | { kind: 'boolean' }
  | { kind: 'color' }
  | { kind: 'password' };

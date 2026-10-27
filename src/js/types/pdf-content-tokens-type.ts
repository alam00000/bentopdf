export interface ContentToken {
  kind: 'name' | 'dict' | 'operand' | 'operator';
  value: string;
  start: number;
  end: number;
}

export interface ContentOperation {
  operator: string;
  operands: ContentToken[];
  start: number;
  end: number;
}

export interface Assignment {
  id: string;
  title: string;
  classLabel: string;
  pageCount: number;
  qrMode: 'generic' | 'anonymous';
  packetCount: number;
  createdAt: string;
}

export interface Packet {
  id: string;
  assignmentId: string;
  packetCode: string;
  mode: 'anonymous' | 'generic';
  createdAt: string;
}

export interface QRToken {
  token: string;
  assignmentId: string;
  templateVersion: number;
  packetId: string | null;
  pageNumber: number;
}

const KEYS = {
  assignments: 'pb_assignments',
  packets: 'pb_packets',
  tokens: 'pb_qr_tokens',
} as const;

function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  } catch {
    return [];
  }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getAssignments(): Assignment[] {
  return load<Assignment>(KEYS.assignments);
}

export function getAssignment(id: string): Assignment | undefined {
  return getAssignments().find((a) => a.id === id);
}

export function saveAssignment(assignment: Assignment): void {
  const all = getAssignments().filter((a) => a.id !== assignment.id);
  save(KEYS.assignments, [...all, assignment]);
}

export function deleteAssignment(id: string): void {
  save(
    KEYS.assignments,
    getAssignments().filter((a) => a.id !== id)
  );
  save(
    KEYS.packets,
    getPackets().filter((p) => p.assignmentId !== id)
  );
  save(
    KEYS.tokens,
    getTokens().filter((t) => t.assignmentId !== id)
  );
}

export function getPackets(assignmentId?: string): Packet[] {
  const all = load<Packet>(KEYS.packets);
  return assignmentId
    ? all.filter((p) => p.assignmentId === assignmentId)
    : all;
}

export function savePacket(packet: Packet): void {
  const all = getPackets().filter((p) => p.id !== packet.id);
  save(KEYS.packets, [...all, packet]);
}

export function savePackets(packets: Packet[]): void {
  const ids = new Set(packets.map((p) => p.id));
  const existing = getPackets().filter((p) => !ids.has(p.id));
  save(KEYS.packets, [...existing, ...packets]);
}

export function getTokens(assignmentId?: string): QRToken[] {
  const all = load<QRToken>(KEYS.tokens);
  return assignmentId
    ? all.filter((t) => t.assignmentId === assignmentId)
    : all;
}

export function saveTokens(tokens: QRToken[]): void {
  const keys = new Set(tokens.map((t) => t.token));
  const existing = getTokens().filter((t) => !keys.has(t.token));
  save(KEYS.tokens, [...existing, ...tokens]);
}

export function resolveToken(token: string): QRToken | undefined {
  return getTokens().find((t) => t.token === token);
}

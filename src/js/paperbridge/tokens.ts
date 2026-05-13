import type { Packet, QRToken } from './store.js';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generatePacketCode(): string {
  let code = '';
  const array = new Uint8Array(5);
  crypto.getRandomValues(array);
  for (const byte of array) {
    code += CHARS[byte % CHARS.length];
  }
  return code;
}

export function generateAssignmentCode(): string {
  let code = '';
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  for (const byte of array) {
    code += CHARS[byte % CHARS.length];
  }
  return code;
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function buildQRUrl(token: string): string {
  const base =
    (import.meta.env.VITE_QR_BASE_URL as string | undefined)?.replace(
      /\/$/,
      ''
    ) ?? `${window.location.origin}/p`;
  return `${base}/${token}`;
}

export function buildTokenForPacketPage(
  packetCode: string,
  pageNumber: number
): string {
  return `${packetCode}${pageNumber}`;
}

export function buildTokenForGenericPage(
  assignmentCode: string,
  pageNumber: number
): string {
  return `${assignmentCode}P${pageNumber}`;
}

export function buildPacketTokens(
  packet: Packet,
  assignmentId: string,
  pageCount: number
): QRToken[] {
  return Array.from({ length: pageCount }, (_, i) => {
    const pageNumber = i + 1;
    const token = buildTokenForPacketPage(packet.packetCode, pageNumber);
    return {
      token,
      assignmentId,
      templateVersion: 1,
      packetId: packet.id,
      pageNumber,
    };
  });
}

export function buildGenericTokens(
  assignmentCode: string,
  assignmentId: string,
  pageCount: number
): QRToken[] {
  return Array.from({ length: pageCount }, (_, i) => {
    const pageNumber = i + 1;
    const token = buildTokenForGenericPage(assignmentCode, pageNumber);
    return {
      token,
      assignmentId,
      templateVersion: 1,
      packetId: null as string | null,
      pageNumber,
    };
  });
}

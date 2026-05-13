import {
  buildGenericTokens,
  buildPacketTokens,
  buildTokenForGenericPage,
  buildTokenForPacketPage,
  buildQRUrl,
  generateAssignmentCode,
  generateId,
  generatePacketCode,
} from '../js/paperbridge/tokens';

describe('PaperBridge token helpers', () => {
  it('generates packet and assignment codes with the expected lengths', () => {
    expect(generatePacketCode()).toMatch(/^[A-Z2-9]{5}$/);
    expect(generateAssignmentCode()).toMatch(/^[A-Z2-9]{6}$/);
  });

  it('builds packet and generic page token strings', () => {
    expect(buildTokenForPacketPage('7KQ4M', 2)).toBe('7KQ4M2');
    expect(buildTokenForGenericPage('EX10R2', 3)).toBe('EX10R2P3');
  });

  it('creates packet-scoped QR metadata for each page', () => {
    const packet = {
      id: 'packet_1',
      assignmentId: 'assignment_1',
      packetCode: '7KQ4M',
      mode: 'anonymous' as const,
      createdAt: '2026-05-13T00:00:00.000Z',
    };

    expect(buildPacketTokens(packet, 'assignment_1', 3)).toEqual([
      {
        token: '7KQ4M1',
        assignmentId: 'assignment_1',
        templateVersion: 1,
        packetId: 'packet_1',
        pageNumber: 1,
      },
      {
        token: '7KQ4M2',
        assignmentId: 'assignment_1',
        templateVersion: 1,
        packetId: 'packet_1',
        pageNumber: 2,
      },
      {
        token: '7KQ4M3',
        assignmentId: 'assignment_1',
        templateVersion: 1,
        packetId: 'packet_1',
        pageNumber: 3,
      },
    ]);
  });

  it('creates generic QR metadata without packet ids', () => {
    expect(buildGenericTokens('EX10R2', 'assignment_1', 2)).toEqual([
      {
        token: 'EX10R2P1',
        assignmentId: 'assignment_1',
        templateVersion: 1,
        packetId: null,
        pageNumber: 1,
      },
      {
        token: 'EX10R2P2',
        assignmentId: 'assignment_1',
        templateVersion: 1,
        packetId: null,
        pageNumber: 2,
      },
    ]);
  });

  it('builds stable prefixed ids', () => {
    expect(generateId('assignment')).toMatch(
      /^assignment_[a-z0-9]+_[a-z0-9]{5}$/
    );
  });
});

describe('buildQRUrl', () => {
  const originalEnv = import.meta.env.VITE_QR_BASE_URL;

  afterEach(() => {
    (import.meta.env as Record<string, unknown>).VITE_QR_BASE_URL = originalEnv;
  });

  it('uses VITE_QR_BASE_URL when set', () => {
    (import.meta.env as Record<string, unknown>).VITE_QR_BASE_URL =
      'https://scan.example.com';
    expect(buildQRUrl('7KQ4M2')).toBe('https://scan.example.com/7KQ4M2');
  });

  it('strips trailing slash from VITE_QR_BASE_URL', () => {
    (import.meta.env as Record<string, unknown>).VITE_QR_BASE_URL =
      'https://scan.example.com/';
    expect(buildQRUrl('EX10R2P1')).toBe('https://scan.example.com/EX10R2P1');
  });

  it('appends the token as the final path segment', () => {
    (import.meta.env as Record<string, unknown>).VITE_QR_BASE_URL =
      'https://scan.example.com/qr';
    expect(buildQRUrl('MYTOKEN')).toMatch(/\/MYTOKEN$/);
  });

  // The window.location.origin fallback is browser-only: Vite statically
  // inlines import.meta.env values, making runtime env mutation unreliable
  // in the test environment. It is verified by code inspection in tokens.ts.
});

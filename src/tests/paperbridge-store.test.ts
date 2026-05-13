import {
  deleteAssignment,
  getAssignment,
  getAssignments,
  getPackets,
  getTokens,
  resolveToken,
  saveAssignment,
  savePacket,
  savePackets,
  saveTokens,
} from '../js/paperbridge/store';
import type { Assignment, Packet, QRToken } from '../js/paperbridge/store';

function makeAssignment(overrides: Partial<Assignment> = {}): Assignment {
  return {
    id: 'assignment_1',
    title: 'Test Assignment',
    classLabel: 'Period 1',
    pageCount: 3,
    qrMode: 'generic',
    packetCount: 0,
    createdAt: '2026-05-13T00:00:00.000Z',
    ...overrides,
  };
}

function makePacket(overrides: Partial<Packet> = {}): Packet {
  return {
    id: 'packet_1',
    assignmentId: 'assignment_1',
    packetCode: 'ABCDE',
    mode: 'anonymous',
    createdAt: '2026-05-13T00:00:00.000Z',
    ...overrides,
  };
}

function makeToken(overrides: Partial<QRToken> = {}): QRToken {
  return {
    token: 'ABCDE1',
    assignmentId: 'assignment_1',
    templateVersion: 1,
    packetId: 'packet_1',
    pageNumber: 1,
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('Assignment CRUD', () => {
  it('returns empty array when no assignments saved', () => {
    expect(getAssignments()).toEqual([]);
  });

  it('saves and retrieves an assignment', () => {
    const a = makeAssignment();
    saveAssignment(a);
    expect(getAssignments()).toEqual([a]);
    expect(getAssignment('assignment_1')).toEqual(a);
  });

  it('upserts an assignment (same id replaces existing)', () => {
    saveAssignment(makeAssignment({ title: 'Old Title' }));
    saveAssignment(makeAssignment({ title: 'New Title' }));
    const all = getAssignments();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('New Title');
  });

  it('stores multiple distinct assignments', () => {
    saveAssignment(makeAssignment({ id: 'a1' }));
    saveAssignment(makeAssignment({ id: 'a2' }));
    expect(getAssignments()).toHaveLength(2);
  });

  it('getAssignment returns undefined for missing id', () => {
    expect(getAssignment('nope')).toBeUndefined();
  });
});

describe('deleteAssignment cascade', () => {
  it('removes the assignment', () => {
    saveAssignment(makeAssignment());
    deleteAssignment('assignment_1');
    expect(getAssignments()).toHaveLength(0);
  });

  it('cascades to packets belonging to the assignment', () => {
    saveAssignment(makeAssignment());
    savePacket(makePacket({ assignmentId: 'assignment_1' }));
    savePacket(
      makePacket({ id: 'packet_2', assignmentId: 'assignment_other' })
    );
    deleteAssignment('assignment_1');
    const remaining = getPackets();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('packet_2');
  });

  it('cascades to tokens belonging to the assignment', () => {
    saveAssignment(makeAssignment());
    saveTokens([makeToken({ assignmentId: 'assignment_1' })]);
    saveTokens([
      makeToken({ token: 'OTHER1', assignmentId: 'assignment_other' }),
    ]);
    deleteAssignment('assignment_1');
    const remaining = getTokens();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].token).toBe('OTHER1');
  });

  it('is a no-op when assignment does not exist', () => {
    saveAssignment(makeAssignment({ id: 'a1' }));
    deleteAssignment('nonexistent');
    expect(getAssignments()).toHaveLength(1);
  });
});

describe('Packet CRUD', () => {
  it('returns empty array when no packets saved', () => {
    expect(getPackets()).toEqual([]);
  });

  it('saves and retrieves a packet', () => {
    const p = makePacket();
    savePacket(p);
    expect(getPackets()).toContainEqual(p);
  });

  it('filters packets by assignmentId', () => {
    savePacket(makePacket({ id: 'p1', assignmentId: 'a1' }));
    savePacket(makePacket({ id: 'p2', assignmentId: 'a2' }));
    expect(getPackets('a1')).toHaveLength(1);
    expect(getPackets('a1')[0].id).toBe('p1');
    expect(getPackets('a2')).toHaveLength(1);
  });

  it('savePackets bulk-upserts without duplication', () => {
    const p1 = makePacket({ id: 'p1', packetCode: 'AAAAA' });
    savePacket(p1);
    const updated = { ...p1, packetCode: 'BBBBB' };
    savePackets([updated, makePacket({ id: 'p2' })]);
    const all = getPackets();
    expect(all).toHaveLength(2);
    expect(all.find((p) => p.id === 'p1')?.packetCode).toBe('BBBBB');
  });

  it('savePackets adds new packets to existing ones', () => {
    savePacket(makePacket({ id: 'existing' }));
    savePackets([makePacket({ id: 'new1' }), makePacket({ id: 'new2' })]);
    expect(getPackets()).toHaveLength(3);
  });
});

describe('Token CRUD', () => {
  it('returns empty array when no tokens saved', () => {
    expect(getTokens()).toEqual([]);
  });

  it('saves and retrieves tokens', () => {
    const t = makeToken();
    saveTokens([t]);
    expect(getTokens()).toContainEqual(t);
  });

  it('filters tokens by assignmentId', () => {
    saveTokens([makeToken({ token: 'T1', assignmentId: 'a1' })]);
    saveTokens([makeToken({ token: 'T2', assignmentId: 'a2' })]);
    expect(getTokens('a1')).toHaveLength(1);
    expect(getTokens('a1')[0].token).toBe('T1');
  });

  it('saveTokens deduplicates by token key', () => {
    saveTokens([makeToken({ token: 'T1', pageNumber: 1 })]);
    saveTokens([makeToken({ token: 'T1', pageNumber: 99 })]);
    const all = getTokens();
    expect(all).toHaveLength(1);
    expect(all[0].pageNumber).toBe(99);
  });

  it('resolveToken finds a token by its string', () => {
    saveTokens([makeToken({ token: 'ABCDE1' })]);
    expect(resolveToken('ABCDE1')).toMatchObject({ token: 'ABCDE1' });
  });

  it('resolveToken returns undefined for unknown token', () => {
    expect(resolveToken('ZZZZZ9')).toBeUndefined();
  });
});

describe('localStorage resilience', () => {
  it('returns empty array when stored value is malformed JSON', () => {
    localStorage.setItem('pb_assignments', '{bad json}');
    expect(getAssignments()).toEqual([]);
  });

  it('returns empty array when stored value is null', () => {
    localStorage.removeItem('pb_packets');
    expect(getPackets()).toEqual([]);
  });
});

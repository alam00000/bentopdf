import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TIMESTAMP_TSA_PRESETS } from '@/js/config/timestamp-tsa';

// Mock external dependencies before importing the node
vi.mock('rete', () => ({
  ClassicPreset: {
    Node: class {
      addInput() {}
      addOutput() {}
      addControl() {}
      controls: Record<string, unknown> = {};
    },
    Input: class {
      constructor(
        public socket: unknown,
        public label: string
      ) {}
    },
    Output: class {
      constructor(
        public socket: unknown,
        public label: string
      ) {}
    },
    InputControl: class {
      value: string;
      constructor(
        public type: string,
        public options: { initial: string }
      ) {
        this.value = options.initial;
      }
    },
  },
}));

vi.mock('@/js/workflow/sockets', () => ({
  pdfSocket: {},
}));

vi.mock('@/js/workflow/nodes/base-node', () => ({
  BaseWorkflowNode: class {
    addInput() {}
    addOutput() {}
    addControl() {}
    controls: Record<string, unknown> = {};
  },
}));

vi.mock('@/js/utils/load-pdf-document', () => ({
  loadPdfDocument: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/js/logic/digital-sign-pdf', () => ({
  timestampPdf: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
}));

vi.mock('@/js/workflow/types', () => ({
  requirePdfInput: vi.fn((inputs: Record<string, unknown[]>) => inputs['pdf']),
  processBatch: vi.fn(
    async (
      inputs: Array<{ bytes: Uint8Array; filename: string }>,
      fn: (input: { bytes: Uint8Array; filename: string }) => Promise<unknown>
    ) => {
      const results = [];
      for (const input of inputs) {
        results.push(await fn(input));
      }
      return results;
    }
  ),
}));

import { TimestampNode } from '@/js/workflow/nodes/timestamp-node';
import { timestampPdf } from '@/js/logic/digital-sign-pdf';

describe('TimestampNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be instantiable', () => {
    const node = new TimestampNode();
    expect(node).toBeDefined();
  });

  it('should have the correct category', () => {
    const node = new TimestampNode();
    expect(node.category).toBe('Secure PDF');
  });

  it('should have the correct icon', () => {
    const node = new TimestampNode();
    expect(node.icon).toBe('ph-clock');
  });

  it('should have a description', () => {
    const node = new TimestampNode();
    expect(node.description).toBe('Add an RFC 3161 document timestamp');
  });

  it('should return TSA presets', () => {
    const node = new TimestampNode();
    const presets = node.getTsaPresets();
    expect(presets).toBe(TIMESTAMP_TSA_PRESETS);
    expect(presets.length).toBeGreaterThan(0);
  });

  it('should use the first TSA preset as default URL', () => {
    const node = new TimestampNode();
    const presets = node.getTsaPresets();
    expect(presets[0].url).toBe(TIMESTAMP_TSA_PRESETS[0].url);
  });

  it('should call timestampPdf with correct TSA URL via data()', async () => {
    const node = new TimestampNode();
    const mockInput = [
      {
        type: 'pdf' as const,
        document: {} as never,
        bytes: new Uint8Array([1, 2, 3]),
        filename: 'test.pdf',
      },
    ];

    await node.data({ pdf: mockInput });

    expect(timestampPdf).toHaveBeenCalledWith(
      mockInput[0].bytes,
      TIMESTAMP_TSA_PRESETS[0].url
    );
  });

  it('should generate _timestamped suffix in output filename via data()', async () => {
    const node = new TimestampNode();
    const mockInput = [
      {
        type: 'pdf' as const,
        document: {} as never,
        bytes: new Uint8Array([1, 2, 3]),
        filename: 'report.pdf',
      },
    ];

    const result = (await node.data({ pdf: mockInput })) as unknown as {
      pdf: Array<{ filename: string }>;
    };

    expect(result.pdf[0].filename).toBe('report_timestamped.pdf');
  });

  it('should wrap errors from timestampPdf with TSA context', async () => {
    vi.mocked(timestampPdf).mockRejectedValueOnce(new Error('Network error'));
    const node = new TimestampNode();

    await expect(
      node.data({
        pdf: [
          {
            type: 'pdf' as const,
            document: {} as never,
            bytes: new Uint8Array([1]),
            filename: 'test.pdf',
          },
        ],
      })
    ).rejects.toThrow(/Failed to timestamp using TSA/);
  });
});

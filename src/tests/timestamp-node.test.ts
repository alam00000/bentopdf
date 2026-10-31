import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TIMESTAMP_TSA_PRESETS } from '@/js/config/timestamp-tsa';
import type { ClassicPreset } from 'rete';

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

vi.mock('@/js/i18n/i18n', () => ({ t: (key: string) => key }));

vi.mock('@/js/workflow/nodes/base-node', () => ({
  BaseWorkflowNode: class {
    addInput() {}
    addOutput() {}
    addControl(key: string, control: unknown) {
      this.controls[key] = control;
    }
    controls: Record<string, unknown> = {};
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
      return value;
    }
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

  it('should initialize the TSA control with the HTTPS default', () => {
    const node = new TimestampNode();
    const control = node.controls[
      'tsaUrl'
    ] as ClassicPreset.InputControl<'text'>;
    expect(control.value).toBe(TIMESTAMP_TSA_PRESETS[0].url);
    expect(new URL(control.value).protocol).toBe('https:');
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

    const control = node.controls[
      'tsaUrl'
    ] as ClassicPreset.InputControl<'text'>;
    expect(new URL(control.value).protocol).toBe('https:');
    expect(timestampPdf).toHaveBeenCalledExactlyOnceWith(
      mockInput[0].bytes,
      control.value
    );
  });

  it.each(['absent', 'empty', 'invalid import'])(
    'should use the HTTPS default for an %s TSA control',
    async (scenario) => {
      const node = new TimestampNode();
      const control = node.controls[
        'tsaUrl'
      ] as ClassicPreset.InputControl<'text'>;
      if (scenario === 'absent') {
        delete node.controls['tsaUrl'];
      } else {
        control.value =
          scenario === 'empty'
            ? ''
            : (node.sanitizeControlValue(
                'tsaUrl',
                'https://attacker.example.com/steal-tsr'
              ) as string);
      }
      const bytes = new Uint8Array([1, 2, 3]);
      await node.data({
        pdf: [
          { type: 'pdf', document: {} as never, bytes, filename: 'test.pdf' },
        ],
      });
      expect(new URL(TIMESTAMP_TSA_PRESETS[0].url).protocol).toBe('https:');
      expect(timestampPdf).toHaveBeenCalledExactlyOnceWith(
        bytes,
        TIMESTAMP_TSA_PRESETS[0].url
      );
    }
  );

  it('should preserve and use an explicitly imported HTTP provider', async () => {
    const node = new TimestampNode();
    const control = node.controls[
      'tsaUrl'
    ] as ClassicPreset.InputControl<'text'>;
    const explicitUrl = 'http://timestamp.digicert.com';
    control.value = node.sanitizeControlValue('tsaUrl', explicitUrl) as string;
    expect(control.value).toBe(explicitUrl);
    const bytes = new Uint8Array([1, 2, 3]);
    await node.data({
      pdf: [
        { type: 'pdf', document: {} as never, bytes, filename: 'test.pdf' },
      ],
    });
    expect(timestampPdf).toHaveBeenCalledExactlyOnceWith(bytes, explicitUrl);
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

  it('should wrap errors from timestampPdf with TSA context and original cause', async () => {
    const originalError = new Error('Network error');
    vi.mocked(timestampPdf).mockRejectedValueOnce(originalError);
    const node = new TimestampNode();

    let caught: Error | null = null;
    try {
      await node.data({
        pdf: [
          {
            type: 'pdf' as const,
            document: {} as never,
            bytes: new Uint8Array([1]),
            filename: 'test.pdf',
          },
        ],
      });
    } catch (err) {
      caught = err as Error;
    }

    expect(caught).toBeInstanceOf(Error);
    expect(caught?.cause).toBe(originalError);
  });
});

describe('TimestampNode.sanitizeControlValue (workflow import hardening)', () => {
  it('keeps a preset tsaUrl from an imported workflow', () => {
    const node = new TimestampNode();
    expect(
      node.sanitizeControlValue('tsaUrl', TIMESTAMP_TSA_PRESETS[0].url)
    ).toBe(TIMESTAMP_TSA_PRESETS[0].url);
    expect(node.sanitizeControlValue('tsaUrl', 'https://freetsa.org/tsr')).toBe(
      'https://freetsa.org/tsr'
    );
  });

  it('resets an untrusted imported tsaUrl to the default preset', () => {
    const node = new TimestampNode();
    expect(
      node.sanitizeControlValue(
        'tsaUrl',
        'https://attacker.example.com/steal-tsr'
      )
    ).toBe(TIMESTAMP_TSA_PRESETS[0].url);
  });

  it('resets non-string tsaUrl values injected via import', () => {
    const node = new TimestampNode();
    expect(node.sanitizeControlValue('tsaUrl', { evil: true })).toBe(
      TIMESTAMP_TSA_PRESETS[0].url
    );
    expect(node.sanitizeControlValue('tsaUrl', null)).toBe(
      TIMESTAMP_TSA_PRESETS[0].url
    );
  });

  it('does not constrain non-tsaUrl controls', () => {
    const node = new TimestampNode();
    expect(node.sanitizeControlValue('other', 'anything')).toBe('anything');
  });
});

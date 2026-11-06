import { describe, it, expect } from 'vitest';
import DOMPurify, { type Config } from 'dompurify';

// Broken when applied after mermaid.render() — strips foreignObject labels.
const PIXELPDF_SVG_ONLY_SANITIZE_OPTIONS: Config = {
  USE_PROFILES: { svg: true, svgFilters: true },
};

/** Matches Mermaid 11 strict-mode output sanitization in mermaid.render(). */
const MERMAID_STRICT_SVG_SANITIZE_OPTIONS: Config = {
  ADD_TAGS: ['foreignobject'],
  ADD_ATTR: ['dominant-baseline'],
  HTML_INTEGRATION_POINTS: { foreignobject: true },
};

describe('Markdown to PDF — Mermaid SVG sanitization', () => {
  it('documents that SVG-only DOMPurify strips foreignObject labels (regression guard)', () => {
    const htmlLabelsSvg = `<svg xmlns="http://www.w3.org/2000/svg">
      <g class="node">
        <rect width="100" height="50"/>
        <foreignObject width="100" height="50">
          <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex">
            <span>Start</span>
          </div>
        </foreignObject>
      </g>
    </svg>`;

    const clean = DOMPurify.sanitize(
      htmlLabelsSvg,
      PIXELPDF_SVG_ONLY_SANITIZE_OPTIONS
    );

    expect(clean).not.toContain('Start');
    expect(clean).not.toContain('foreignObject');
  });

  it('preserves foreignObject labels with Mermaid strict sanitizer settings', () => {
    const htmlLabelsSvg = `<svg xmlns="http://www.w3.org/2000/svg">
      <foreignObject width="120" height="40">
        <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex">
          <span class="nodeLabel">Start</span>
        </div>
      </foreignObject>
    </svg>`;

    const clean = DOMPurify.sanitize(
      htmlLabelsSvg,
      MERMAID_STRICT_SVG_SANITIZE_OPTIONS
    );

    expect(clean).toContain('Start');
    expect(clean).toContain('foreignObject');
    expect(clean).toContain('nodeLabel');
  });

  it('preserves native SVG text labels under SVG-only profile', () => {
    const svgTextLabels = `<svg xmlns="http://www.w3.org/2000/svg">
      <g class="node">
        <rect width="100" height="50"/>
        <text x="10" y="20" fill="#333">Start</text>
      </g>
    </svg>`;

    const clean = DOMPurify.sanitize(
      svgTextLabels,
      PIXELPDF_SVG_ONLY_SANITIZE_OPTIONS
    );

    expect(clean).toContain('Start');
    expect(clean).toContain('<text');
  });
});

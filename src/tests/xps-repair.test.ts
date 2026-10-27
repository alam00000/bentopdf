// @vitest-environment node
import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { repairXml, repairXpsPackage } from '@/js/utils/xps-repair';

describe('repairXml', () => {
  it('turns stray characters between attributes into plain spaces', () => {
    expect(repairXml('<A B="1"　C="2"\0/>')).toBe('<A B="1" C="2"/>');
  });

  it('drops attributes MuPDF cannot read and fixes "/ >"', () => {
    expect(repairXml('<A Ïd="x" Width="1" / >')).toBe('<A Width="1"/>');
  });

  it('keeps comments, CDATA, values with > and closing tags intact', () => {
    const xml =
      '<?xml version="1.0" encoding="windows-1252"?><!-- a > b --><A N="a>b"><![CDATA[<x y>]]></A >';
    expect(repairXml(xml)).toBe(
      '<?xml version="1.0" encoding="utf-8"?><!-- a > b --><A N="a>b"><![CDATA[<x y>]]></A>'
    );
  });
});

describe('repairXpsPackage', () => {
  it('decodes BOM-less UTF-16 and joins interleaved pieces', async () => {
    const page = '<FixedPage Width="816"/>';
    const zip = new JSZip();
    zip.file(
      '_rels/.rels',
      new Uint8Array(
        Buffer.from('<?xml version="1.0" encoding="utf-16"?><R/>', 'utf16le')
      )
    );
    zip.file('1.fpage/[1].last.piece', page.slice(10));
    zip.file('1.fpage/[0].piece', page.slice(0, 10));
    zip.file('a.png', new Uint8Array([0, 0xff, 1]));

    const out = await JSZip.loadAsync(
      await (
        await repairXpsPackage(
          new Blob([await zip.generateAsync({ type: 'arraybuffer' })])
        )
      ).arrayBuffer()
    );

    expect(await out.file('_rels/.rels')?.async('string')).toBe(
      '<?xml version="1.0" encoding="utf-8"?><R/>'
    );
    expect(await out.file('1.fpage')?.async('string')).toBe(
      '<FixedPage Width="816"/>'
    );
    expect(Array.from(await out.file('a.png')!.async('uint8array'))).toEqual([
      0, 0xff, 1,
    ]);
    expect(out.file(/piece/)).toHaveLength(0);
  });
});

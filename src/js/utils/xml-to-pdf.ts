import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { XMLParser } from 'fast-xml-parser';

export interface XmlToPdfOptions {
  onProgress?: (percent: number, message: string) => void;
}

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: { finalY: number };
}

const ATTR_PREFIX = '@_';
const TEXT_KEY = '#text';

export async function convertXmlToPdf(
  file: File,
  options?: XmlToPdfOptions
): Promise<Blob> {
  const { onProgress } = options || {};

  onProgress?.(10, 'Reading XML file...');
  const rawXmlText = await file.text();
  const xmlText = String(rawXmlText)
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<!ENTITY[\s\S]*?>/gi, '')
    .replace(/<\?xml-stylesheet[\s\S]*?\?>/gi, '');

  onProgress?.(30, 'Parsing XML structure...');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: ATTR_PREFIX,
    textNodeName: TEXT_KEY,
    allowBooleanAttributes: true,
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: true,
    processEntities: true,
    ignoreDeclaration: true,
    ignorePiTags: true,
  });

  let parsed: Record<string, unknown>;
  try {
    parsed = parser.parse(xmlText) as Record<string, unknown>;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error('Invalid XML: ' + toSafeText(msg), { cause: err });
  }

  const rootKeys = Object.keys(parsed);
  if (rootKeys.length === 0) {
    throw new Error('Invalid XML: no root element');
  }
  const rootName = rootKeys[0];
  const rootValue = parsed[rootName];

  onProgress?.(50, 'Analyzing data structure...');

  const doc: jsPDFWithAutoTable = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(formatTitle(rootName), pageWidth / 2, yPosition, {
    align: 'center',
  });
  yPosition += 15;

  onProgress?.(60, 'Generating formatted content...');

  if (isPlainObject(rootValue)) {
    const rootObj = rootValue;
    const childEntries = Object.entries(rootObj).filter(
      ([k]) => !k.startsWith(ATTR_PREFIX) && k !== TEXT_KEY
    );

    if (childEntries.length > 0) {
      const groups = groupChildrenByTagName(childEntries);

      const renderableGroups: Array<[string, Record<string, unknown>[]]> = [];
      for (const [groupName, elements] of Object.entries(groups)) {
        const { headers, rows } = extractTableData(elements);
        if (headers.length > 0 && rows.length > 0) {
          renderableGroups.push([groupName, elements]);
        }
      }

      for (const [groupName, elements] of renderableGroups) {
        const { headers, rows } = extractTableData(elements);

        if (renderableGroups.length > 1) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(formatTitle(groupName), 14, yPosition);
          yPosition += 8;
        }

        autoTable(doc, {
          head: [headers.map((h) => formatTitle(h))],
          body: rows,
          startY: yPosition,
          styles: {
            fontSize: 9,
            cellPadding: 4,
            overflow: 'linebreak',
          },
          headStyles: {
            fillColor: [79, 70, 229],
            textColor: 255,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [243, 244, 246],
          },
          margin: { top: 20, left: 14, right: 14 },
          theme: 'striped',
          didDrawPage: (data) => {
            yPosition = (data.cursor?.y || yPosition) + 10;
          },
        });

        yPosition = (doc.lastAutoTable?.finalY || yPosition) + 15;
      }
    } else {
      const kvPairs = extractKeyValuePairs(rootObj);
      if (kvPairs.length > 0) {
        autoTable(doc, {
          head: [['Property', 'Value']],
          body: kvPairs,
          startY: yPosition,
          styles: {
            fontSize: 10,
            cellPadding: 5,
          },
          headStyles: {
            fillColor: [79, 70, 229],
            textColor: 255,
            fontStyle: 'bold',
          },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 60 },
            1: { cellWidth: 'auto' },
          },
          margin: { left: 14, right: 14 },
          theme: 'striped',
        });
      }
    }
  }

  onProgress?.(90, 'Finalizing PDF...');

  const pdfBlob = doc.output('blob');

  onProgress?.(100, 'Complete!');
  return pdfBlob;
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

function groupChildrenByTagName(
  entries: [string, unknown][]
): Record<string, Record<string, unknown>[]> {
  const groups: Record<string, Record<string, unknown>[]> = {};
  for (const [tagName, value] of entries) {
    const items = Array.isArray(value) ? value : [value];
    const normalized: Record<string, unknown>[] = items.map((v) => {
      if (isPlainObject(v)) return v;
      if (v == null) return {};
      return { [TEXT_KEY]: String(v) };
    });
    groups[tagName] = normalized;
  }
  return groups;
}

function extractTableData(elements: Record<string, unknown>[]): {
  headers: string[];
  rows: string[][];
} {
  if (elements.length === 0) return { headers: [], rows: [] };

  const headerSet = new Set<string>();
  for (const element of elements) {
    for (const key of Object.keys(element)) {
      if (key.startsWith(ATTR_PREFIX)) continue;
      if (key === TEXT_KEY) continue;
      headerSet.add(key);
    }
  }
  const headers = Array.from(headerSet);
  if (headers.length === 0) return { headers: [], rows: [] };

  const rows: string[][] = [];
  for (const element of elements) {
    const row: string[] = [];
    for (const header of headers) {
      row.push(toSafeText(stringifyValue(element[header])));
    }
    rows.push(row);
  }

  return { headers, rows };
}

function extractKeyValuePairs(obj: Record<string, unknown>): string[][] {
  const pairs: string[][] = [];

  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith(ATTR_PREFIX)) continue;
    if (key === TEXT_KEY) continue;
    const strVal = toSafeText(stringifyValue(val));
    if (strVal) {
      pairs.push([formatTitle(key), strVal]);
    }
  }

  for (const [key, val] of Object.entries(obj)) {
    if (!key.startsWith(ATTR_PREFIX)) continue;
    const attrName = key.slice(ATTR_PREFIX.length);
    pairs.push([formatTitle(attrName), toSafeText(stringifyValue(val))]);
  }

  return pairs;
}

function stringifyValue(val: unknown): string {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    return val
      .map((v) => stringifyValue(v))
      .filter((s) => s.length > 0)
      .join(', ');
  }
  if (isPlainObject(val)) {
    const parts: string[] = [];
    if (TEXT_KEY in val) {
      const t = stringifyValue(val[TEXT_KEY]);
      if (t) parts.push(t);
    }
    for (const [k, v] of Object.entries(val)) {
      if (k.startsWith(ATTR_PREFIX)) continue;
      if (k === TEXT_KEY) continue;
      const inner = stringifyValue(v);
      if (inner) parts.push(inner);
    }
    return parts.join(' ');
  }
  return String(val);
}

function toSafeText(raw: string | null | undefined): string {
  if (raw == null) return '';
  return (
    String(raw)
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .trim()
  );
}

function formatTitle(tagName: string): string {
  return tagName
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

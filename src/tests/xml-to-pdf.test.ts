import { describe, it, expect } from 'vitest';

function groupByTagName(elements: Element[]): Record<string, Element[]> {
  const groups: Record<string, Element[]> = {};
  for (const element of elements) {
    const tagName = element.tagName;
    if (!groups[tagName]) {
      groups[tagName] = [];
    }
    groups[tagName].push(element);
  }
  return groups;
}

function extractTableData(elements: Element[]): {
  headers: string[];
  rows: string[][];
} {
  if (elements.length === 0) {
    return { headers: [], rows: [] };
  }
  const headerSet = new Set<string>();
  for (const element of elements) {
    for (const child of Array.from(element.children)) {
      headerSet.add(child.tagName);
    }
  }
  const headers = Array.from(headerSet);
  const rows: string[][] = [];
  for (const element of elements) {
    const row: string[] = [];
    for (const header of headers) {
      const child = element.querySelector(header);
      row.push(child?.textContent?.trim() || '');
    }
    rows.push(row);
  }
  return { headers, rows };
}

function extractKeyValuePairs(element: Element): string[][] {
  const pairs: string[][] = [];
  for (const child of Array.from(element.children)) {
    const key = child.tagName;
    const value = child.textContent?.trim() || '';
    if (value) {
      pairs.push([formatTitle(key), value]);
    }
  }
  for (const attr of Array.from(element.attributes)) {
    pairs.push([formatTitle(attr.name), attr.value]);
  }
  return pairs;
}

function formatTitle(tagName: string): string {
  return tagName
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function parseXml(xmlString: string): Document {
  return new DOMParser().parseFromString(xmlString, 'text/xml');
}

describe('xml-to-pdf utilities', () => {
  describe('formatTitle', () => {
    it('should convert underscores to spaces and capitalize', () => {
      expect(formatTitle('first_name')).toBe('First Name');
    });

    it('should convert hyphens to spaces and capitalize', () => {
      expect(formatTitle('last-name')).toBe('Last Name');
    });

    it('should split camelCase', () => {
      expect(formatTitle('firstName')).toBe('First Name');
    });

    it('should handle single word', () => {
      expect(formatTitle('name')).toBe('Name');
    });

    it('should handle all caps', () => {
      expect(formatTitle('ID')).toBe('Id');
    });

    it('should handle mixed separators', () => {
      expect(formatTitle('user_firstName')).toBe('User First Name');
    });

    it('should handle empty string', () => {
      expect(formatTitle('')).toBe('');
    });

    it('should handle multiple underscores', () => {
      expect(formatTitle('a_b_c')).toBe('A B C');
    });

    it('should lowercase subsequent characters', () => {
      expect(formatTitle('XML')).toBe('Xml');
    });
  });

  describe('groupByTagName', () => {
    it('should group elements by tag name', () => {
      const doc = parseXml(
        '<root><item>1</item><item>2</item><other>3</other></root>'
      );
      const children = Array.from(doc.documentElement.children);
      const groups = groupByTagName(children);
      expect(Object.keys(groups)).toEqual(['item', 'other']);
      expect(groups['item'].length).toBe(2);
      expect(groups['other'].length).toBe(1);
    });

    it('should handle empty array', () => {
      expect(groupByTagName([])).toEqual({});
    });

    it('should handle single element', () => {
      const doc = parseXml('<root><item>1</item></root>');
      const children = Array.from(doc.documentElement.children);
      const groups = groupByTagName(children);
      expect(Object.keys(groups)).toEqual(['item']);
      expect(groups['item'].length).toBe(1);
    });

    it('should handle all same tag names', () => {
      const doc = parseXml('<root><row>1</row><row>2</row><row>3</row></root>');
      const children = Array.from(doc.documentElement.children);
      const groups = groupByTagName(children);
      expect(Object.keys(groups)).toEqual(['row']);
      expect(groups['row'].length).toBe(3);
    });

    it('should handle all different tag names', () => {
      const doc = parseXml('<root><a>1</a><b>2</b><c>3</c></root>');
      const children = Array.from(doc.documentElement.children);
      const groups = groupByTagName(children);
      expect(Object.keys(groups).length).toBe(3);
    });
  });

  describe('extractTableData', () => {
    it('should extract headers and rows from elements', () => {
      const doc = parseXml(`
        <root>
          <person><name>Alice</name><age>30</age></person>
          <person><name>Bob</name><age>25</age></person>
        </root>
      `);
      const elements = Array.from(doc.querySelectorAll('person'));
      const { headers, rows } = extractTableData(elements);
      expect(headers).toEqual(['name', 'age']);
      expect(rows).toEqual([
        ['Alice', '30'],
        ['Bob', '25'],
      ]);
    });

    it('should handle empty array', () => {
      expect(extractTableData([])).toEqual({ headers: [], rows: [] });
    });

    it('should handle missing children in some elements', () => {
      const doc = parseXml(`
        <root>
          <item><a>1</a><b>2</b></item>
          <item><a>3</a></item>
        </root>
      `);
      const elements = Array.from(doc.querySelectorAll('item'));
      const { headers, rows } = extractTableData(elements);
      expect(headers).toEqual(['a', 'b']);
      expect(rows[1]).toEqual(['3', '']);
    });

    it('should handle elements with no children', () => {
      const doc = parseXml('<root><item></item></root>');
      const elements = Array.from(doc.querySelectorAll('item'));
      const { headers, rows } = extractTableData(elements);
      expect(headers).toEqual([]);
      expect(rows).toEqual([[]]);
    });

    it('should collect headers from all elements', () => {
      const doc = parseXml(`
        <root>
          <item><a>1</a></item>
          <item><b>2</b></item>
        </root>
      `);
      const elements = Array.from(doc.querySelectorAll('item'));
      const { headers } = extractTableData(elements);
      expect(headers).toContain('a');
      expect(headers).toContain('b');
    });

    it('should trim whitespace from text content', () => {
      const doc = parseXml('<root><item><val>  hello  </val></item></root>');
      const elements = Array.from(doc.querySelectorAll('item'));
      const { rows } = extractTableData(elements);
      expect(rows[0][0]).toBe('hello');
    });
  });

  describe('extractKeyValuePairs', () => {
    it('should extract child elements as key-value pairs', () => {
      const doc = parseXml(
        '<config><name>Test</name><version>1.0</version></config>'
      );
      const pairs = extractKeyValuePairs(doc.documentElement);
      expect(pairs).toEqual([
        ['Name', 'Test'],
        ['Version', '1.0'],
      ]);
    });

    it('should extract attributes as key-value pairs', () => {
      const doc = parseXml('<config id="123" type="main"></config>');
      const pairs = extractKeyValuePairs(doc.documentElement);
      expect(pairs).toContainEqual(['Id', '123']);
      expect(pairs).toContainEqual(['Type', 'main']);
    });

    it('should include both children and attributes', () => {
      const doc = parseXml('<config id="1"><name>Test</name></config>');
      const pairs = extractKeyValuePairs(doc.documentElement);
      expect(pairs.length).toBe(2);
    });

    it('should skip empty child text content', () => {
      const doc = parseXml('<config><name>Test</name><empty></empty></config>');
      const pairs = extractKeyValuePairs(doc.documentElement);
      expect(pairs.length).toBe(1);
      expect(pairs[0][0]).toBe('Name');
    });

    it('should handle element with no children or attributes', () => {
      const doc = parseXml('<config></config>');
      const pairs = extractKeyValuePairs(doc.documentElement);
      expect(pairs).toEqual([]);
    });

    it('should format tag names using formatTitle', () => {
      const doc = parseXml('<config><user_name>Alice</user_name></config>');
      const pairs = extractKeyValuePairs(doc.documentElement);
      expect(pairs[0][0]).toBe('User Name');
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateComicInfoXml,
  generateMetadataOpf,
  generateComicBookInfoJson,
} from '@/js/utils/comic-info';
import type { ComicMetadata } from '@/types';

const fullMetadata: ComicMetadata = {
  title: 'Batman: Year One',
  series: 'Batman',
  number: '404',
  volume: '1',
  writer: 'Frank Miller',
  publisher: 'DC Comics',
  genre: 'Action, Superhero',
  year: '1987',
  communityRating: '4.5',
  pageCount: 48,
  manga: false,
  blackAndWhite: false,
};

const minimalMetadata: ComicMetadata = {
  pageCount: 1,
};

describe('generateComicInfoXml', () => {
  it('should generate valid XML with all fields', () => {
    const xml = generateComicInfoXml(fullMetadata);
    expect(xml).toContain('<?xml version="1.0" encoding="utf-8"?>');
    expect(xml).toContain('<ComicInfo');
    expect(xml).toContain('<Title>Batman: Year One</Title>');
    expect(xml).toContain('<Series>Batman</Series>');
    expect(xml).toContain('<Number>404</Number>');
    expect(xml).toContain('<Volume>1</Volume>');
    expect(xml).toContain('<Writer>Frank Miller</Writer>');
    expect(xml).toContain('<Publisher>DC Comics</Publisher>');
    expect(xml).toContain('<Genre>Action, Superhero</Genre>');
    expect(xml).toContain('<Year>1987</Year>');
    expect(xml).toContain('<CommunityRating>4.5</CommunityRating>');
    expect(xml).toContain('<PageCount>48</PageCount>');
    expect(xml).toContain('</ComicInfo>');
  });

  it('should only include PageCount for minimal metadata', () => {
    const xml = generateComicInfoXml(minimalMetadata);
    expect(xml).toContain('<PageCount>1</PageCount>');
    expect(xml).not.toContain('<Title>');
    expect(xml).not.toContain('<Series>');
    expect(xml).not.toContain('<Writer>');
    expect(xml).not.toContain('<Publisher>');
    expect(xml).not.toContain('<Genre>');
    expect(xml).not.toContain('<Year>');
    expect(xml).not.toContain('<CommunityRating>');
    expect(xml).not.toContain('<BlackAndWhite>');
    expect(xml).not.toContain('<Manga>');
  });

  it('should include BlackAndWhite when true', () => {
    const xml = generateComicInfoXml({
      ...minimalMetadata,
      blackAndWhite: true,
    });
    expect(xml).toContain('<BlackAndWhite>Yes</BlackAndWhite>');
  });

  it('should not include BlackAndWhite when false', () => {
    const xml = generateComicInfoXml({
      ...minimalMetadata,
      blackAndWhite: false,
    });
    expect(xml).not.toContain('<BlackAndWhite>');
  });

  it('should include Manga when true', () => {
    const xml = generateComicInfoXml({ ...minimalMetadata, manga: true });
    expect(xml).toContain('<Manga>YesAndRightToLeft</Manga>');
  });

  it('should not include Manga when false', () => {
    const xml = generateComicInfoXml({ ...minimalMetadata, manga: false });
    expect(xml).not.toContain('<Manga>');
  });

  it('should escape XML special characters in title', () => {
    const xml = generateComicInfoXml({
      ...minimalMetadata,
      title: 'Batman & Robin <Issue #1> "Special"',
    });
    expect(xml).toContain(
      '<Title>Batman &amp; Robin &lt;Issue #1&gt; &quot;Special&quot;</Title>'
    );
  });

  it('should escape XML special characters in all text fields', () => {
    const xml = generateComicInfoXml({
      ...minimalMetadata,
      series: 'X-Men & Friends',
      writer: "O'Brien",
      publisher: 'DC <Comics>',
      genre: 'Sci-Fi & Fantasy',
    });
    expect(xml).toContain('<Series>X-Men &amp; Friends</Series>');
    expect(xml).toContain('<Writer>O&apos;Brien</Writer>');
    expect(xml).toContain('<Publisher>DC &lt;Comics&gt;</Publisher>');
    expect(xml).toContain('<Genre>Sci-Fi &amp; Fantasy</Genre>');
  });

  it('should skip Year for non-numeric year strings', () => {
    const xml = generateComicInfoXml({ ...minimalMetadata, year: 'abc' });
    expect(xml).not.toContain('<Year>');
  });

  it('should parse year as integer', () => {
    const xml = generateComicInfoXml({ ...minimalMetadata, year: '2024' });
    expect(xml).toContain('<Year>2024</Year>');
  });

  it('should skip CommunityRating when out of range (negative)', () => {
    const xml = generateComicInfoXml({
      ...minimalMetadata,
      communityRating: '-1',
    });
    expect(xml).not.toContain('<CommunityRating>');
  });

  it('should skip CommunityRating when out of range (above 5)', () => {
    const xml = generateComicInfoXml({
      ...minimalMetadata,
      communityRating: '6',
    });
    expect(xml).not.toContain('<CommunityRating>');
  });

  it('should accept CommunityRating at boundaries (0 and 5)', () => {
    const xml0 = generateComicInfoXml({
      ...minimalMetadata,
      communityRating: '0',
    });
    expect(xml0).toContain('<CommunityRating>0</CommunityRating>');

    const xml5 = generateComicInfoXml({
      ...minimalMetadata,
      communityRating: '5',
    });
    expect(xml5).toContain('<CommunityRating>5</CommunityRating>');
  });

  it('should accept decimal CommunityRating', () => {
    const xml = generateComicInfoXml({
      ...minimalMetadata,
      communityRating: '3.5',
    });
    expect(xml).toContain('<CommunityRating>3.5</CommunityRating>');
  });

  it('should skip CommunityRating for non-numeric strings', () => {
    const xml = generateComicInfoXml({
      ...minimalMetadata,
      communityRating: 'great',
    });
    expect(xml).not.toContain('<CommunityRating>');
  });

  it('should handle empty string fields as absent', () => {
    const xml = generateComicInfoXml({
      ...minimalMetadata,
      title: '',
      series: '',
      writer: '',
    });
    expect(xml).not.toContain('<Title>');
    expect(xml).not.toContain('<Series>');
    expect(xml).not.toContain('<Writer>');
  });

  it('should handle undefined fields as absent', () => {
    const xml = generateComicInfoXml({
      ...minimalMetadata,
      title: undefined,
      series: undefined,
    });
    expect(xml).not.toContain('<Title>');
    expect(xml).not.toContain('<Series>');
  });

  it('should handle zero pageCount', () => {
    const xml = generateComicInfoXml({ pageCount: 0 });
    expect(xml).toContain('<PageCount>0</PageCount>');
  });
});

describe('generateMetadataOpf', () => {
  it('should generate valid OPF with all fields', () => {
    const opf = generateMetadataOpf(fullMetadata);
    expect(opf).toContain('<?xml version="1.0" encoding="utf-8"?>');
    expect(opf).toContain('<package xmlns="http://www.idpf.org/2007/opf"');
    expect(opf).toContain('<dc:title>Batman: Year One</dc:title>');
    expect(opf).toContain(
      '<dc:creator opf:role="aut">Frank Miller</dc:creator>'
    );
    expect(opf).toContain('<dc:publisher>DC Comics</dc:publisher>');
    expect(opf).toContain('<dc:date>1987-01-01</dc:date>');
    expect(opf).toContain('<dc:subject>Action, Superhero</dc:subject>');
    expect(opf).toContain('calibre:series" content="Batman"');
    expect(opf).toContain('calibre:series_index" content="404"');
    expect(opf).toContain('</metadata>');
    expect(opf).toContain('</package>');
  });

  it('should generate minimal OPF with no optional fields', () => {
    const opf = generateMetadataOpf(minimalMetadata);
    expect(opf).toContain('<package');
    expect(opf).toContain('</package>');
    expect(opf).not.toContain('<dc:title>');
    expect(opf).not.toContain('<dc:creator');
    expect(opf).not.toContain('<dc:publisher>');
    expect(opf).not.toContain('<dc:date>');
    expect(opf).not.toContain('calibre:series');
  });

  it('should include calibre:series but not series_index when number is absent', () => {
    const opf = generateMetadataOpf({ ...minimalMetadata, series: 'Naruto' });
    expect(opf).toContain('calibre:series" content="Naruto"');
    expect(opf).not.toContain('calibre:series_index');
  });

  it('should not include series_index without series', () => {
    const opf = generateMetadataOpf({ ...minimalMetadata, number: '5' });
    expect(opf).not.toContain('calibre:series_index');
  });

  it('should scale rating from 0-5 to 0-10 for Calibre', () => {
    const opf = generateMetadataOpf({
      ...minimalMetadata,
      communityRating: '4',
    });
    expect(opf).toContain('calibre:rating" content="8"');
  });

  it('should scale rating 2.5 to 5 for Calibre', () => {
    const opf = generateMetadataOpf({
      ...minimalMetadata,
      communityRating: '2.5',
    });
    expect(opf).toContain('calibre:rating" content="5"');
  });

  it('should skip rating when out of range', () => {
    const opf = generateMetadataOpf({
      ...minimalMetadata,
      communityRating: '10',
    });
    expect(opf).not.toContain('calibre:rating');
  });

  it('should skip year for non-numeric strings', () => {
    const opf = generateMetadataOpf({ ...minimalMetadata, year: 'unknown' });
    expect(opf).not.toContain('<dc:date>');
  });

  it('should escape XML in all OPF fields', () => {
    const opf = generateMetadataOpf({
      ...minimalMetadata,
      title: 'Batman & Robin',
      writer: "O'Brien",
      series: 'X <Men>',
    });
    expect(opf).toContain('<dc:title>Batman &amp; Robin</dc:title>');
    expect(opf).toContain('O&apos;Brien');
    expect(opf).toContain('content="X &lt;Men&gt;"');
  });
});

describe('generateComicBookInfoJson', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00.000Z'));
  });

  it('should generate valid JSON with all fields', () => {
    const json = generateComicBookInfoJson(fullMetadata);
    const parsed = JSON.parse(json);

    expect(parsed.appID).toBe('BentoPDF/1.0');
    expect(parsed.lastModified).toBe('2024-06-15T12:00:00.000Z');

    const info = parsed['ComicBookInfo/1.0'];
    expect(info.title).toBe('Batman: Year One');
    expect(info.series).toBe('Batman');
    expect(info.issue).toBe('404');
    expect(info.volume).toBe(1);
    expect(info.publisher).toBe('DC Comics');
    expect(info.publicationYear).toBe(1987);
    expect(info.tags).toEqual(['Action', 'Superhero']);
    expect(info.credits).toEqual([{ person: 'Frank Miller', role: 'Writer' }]);
    expect(info.rating).toBe(4.5);
  });

  it('should generate minimal JSON with no optional fields', () => {
    const json = generateComicBookInfoJson(minimalMetadata);
    const parsed = JSON.parse(json);

    expect(parsed.appID).toBe('BentoPDF/1.0');
    expect(parsed['ComicBookInfo/1.0']).toEqual({});
  });

  it('should parse volume as integer', () => {
    const json = generateComicBookInfoJson({ ...minimalMetadata, volume: '3' });
    const parsed = JSON.parse(json);
    expect(parsed['ComicBookInfo/1.0'].volume).toBe(3);
  });

  it('should omit volume when non-numeric', () => {
    const json = generateComicBookInfoJson({
      ...minimalMetadata,
      volume: 'abc',
    });
    const parsed = JSON.parse(json);
    expect(parsed['ComicBookInfo/1.0'].volume).toBeUndefined();
  });

  it('should split genre into tags array', () => {
    const json = generateComicBookInfoJson({
      ...minimalMetadata,
      genre: 'Action, Adventure, Sci-Fi',
    });
    const parsed = JSON.parse(json);
    expect(parsed['ComicBookInfo/1.0'].tags).toEqual([
      'Action',
      'Adventure',
      'Sci-Fi',
    ]);
  });

  it('should filter empty tags from genre string', () => {
    const json = generateComicBookInfoJson({
      ...minimalMetadata,
      genre: 'Action, , , Adventure',
    });
    const parsed = JSON.parse(json);
    expect(parsed['ComicBookInfo/1.0'].tags).toEqual(['Action', 'Adventure']);
  });

  it('should skip rating when out of range', () => {
    const json = generateComicBookInfoJson({
      ...minimalMetadata,
      communityRating: '6',
    });
    const parsed = JSON.parse(json);
    expect(parsed['ComicBookInfo/1.0'].rating).toBeUndefined();
  });

  it('should skip rating when negative', () => {
    const json = generateComicBookInfoJson({
      ...minimalMetadata,
      communityRating: '-1',
    });
    const parsed = JSON.parse(json);
    expect(parsed['ComicBookInfo/1.0'].rating).toBeUndefined();
  });

  it('should accept rating at boundaries', () => {
    const json0 = generateComicBookInfoJson({
      ...minimalMetadata,
      communityRating: '0',
    });
    expect(JSON.parse(json0)['ComicBookInfo/1.0'].rating).toBe(0);

    const json5 = generateComicBookInfoJson({
      ...minimalMetadata,
      communityRating: '5',
    });
    expect(JSON.parse(json5)['ComicBookInfo/1.0'].rating).toBe(5);
  });

  it('should skip year for non-numeric strings', () => {
    const json = generateComicBookInfoJson({ ...minimalMetadata, year: 'n/a' });
    const parsed = JSON.parse(json);
    expect(parsed['ComicBookInfo/1.0'].publicationYear).toBeUndefined();
  });

  it('should handle special characters in strings without escaping (JSON handles it)', () => {
    const json = generateComicBookInfoJson({
      ...minimalMetadata,
      title: 'Batman & Robin "Special" <Edition>',
      writer: "O'Brien",
    });
    const parsed = JSON.parse(json);
    expect(parsed['ComicBookInfo/1.0'].title).toBe(
      'Batman & Robin "Special" <Edition>'
    );
    expect(parsed['ComicBookInfo/1.0'].credits[0].person).toBe("O'Brien");
  });

  it('should always produce valid JSON', () => {
    const json = generateComicBookInfoJson(fullMetadata);
    expect(() => JSON.parse(json)).not.toThrow();
  });
});

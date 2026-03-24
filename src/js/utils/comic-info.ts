import type { ComicMetadata } from '@/types';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateComicInfoXml(params: ComicMetadata): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<ComicInfo xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">',
  ];

  if (params.title) {
    lines.push(`  <Title>${escapeXml(params.title)}</Title>`);
  }

  if (params.series) {
    lines.push(`  <Series>${escapeXml(params.series)}</Series>`);
  }

  if (params.number) {
    lines.push(`  <Number>${escapeXml(params.number)}</Number>`);
  }

  if (params.volume) {
    lines.push(`  <Volume>${escapeXml(params.volume)}</Volume>`);
  }

  if (params.writer) {
    lines.push(`  <Writer>${escapeXml(params.writer)}</Writer>`);
  }

  if (params.publisher) {
    lines.push(`  <Publisher>${escapeXml(params.publisher)}</Publisher>`);
  }

  if (params.genre) {
    lines.push(`  <Genre>${escapeXml(params.genre)}</Genre>`);
  }

  if (params.year) {
    const yearNum = parseInt(params.year, 10);
    if (!isNaN(yearNum)) {
      lines.push(`  <Year>${yearNum}</Year>`);
    }
  }

  if (params.communityRating) {
    const rating = parseFloat(params.communityRating);
    if (!isNaN(rating) && rating >= 0 && rating <= 5) {
      lines.push(`  <CommunityRating>${rating}</CommunityRating>`);
    }
  }

  lines.push(`  <PageCount>${params.pageCount}</PageCount>`);

  if (params.blackAndWhite) {
    lines.push('  <BlackAndWhite>Yes</BlackAndWhite>');
  }

  if (params.manga) {
    lines.push('  <Manga>YesAndRightToLeft</Manga>');
  }

  lines.push('</ComicInfo>');

  return lines.join('\n');
}

export function generateMetadataOpf(params: ComicMetadata): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<package xmlns="http://www.idpf.org/2007/opf" version="2.0">',
    '  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">',
  ];

  if (params.title) {
    lines.push(`    <dc:title>${escapeXml(params.title)}</dc:title>`);
  }

  if (params.writer) {
    lines.push(
      `    <dc:creator opf:role="aut">${escapeXml(params.writer)}</dc:creator>`
    );
  }

  if (params.publisher) {
    lines.push(
      `    <dc:publisher>${escapeXml(params.publisher)}</dc:publisher>`
    );
  }

  if (params.year) {
    const yearNum = parseInt(params.year, 10);
    if (!isNaN(yearNum)) {
      lines.push(`    <dc:date>${yearNum}-01-01</dc:date>`);
    }
  }

  if (params.genre) {
    lines.push(`    <dc:subject>${escapeXml(params.genre)}</dc:subject>`);
  }

  if (params.series) {
    lines.push(
      `    <meta name="calibre:series" content="${escapeXml(params.series)}" />`
    );
    if (params.number) {
      lines.push(
        `    <meta name="calibre:series_index" content="${escapeXml(params.number)}" />`
      );
    }
  }

  if (params.communityRating) {
    const rating = parseFloat(params.communityRating);
    if (!isNaN(rating) && rating >= 0 && rating <= 5) {
      lines.push(
        `    <meta name="calibre:rating" content="${(rating / 5) * 10}" />`
      );
    }
  }

  lines.push('  </metadata>');
  lines.push('</package>');

  return lines.join('\n');
}

export function generateComicBookInfoJson(params: ComicMetadata): string {
  const info: Record<string, unknown> = {};

  if (params.title) {
    info.title = params.title;
  }

  if (params.series) {
    info.series = params.series;
  }

  if (params.number) {
    info.issue = params.number;
  }

  if (params.volume) {
    info.volume = parseInt(params.volume, 10) || undefined;
  }

  if (params.publisher) {
    info.publisher = params.publisher;
  }

  if (params.year) {
    const yearNum = parseInt(params.year, 10);
    if (!isNaN(yearNum)) {
      info.publicationYear = yearNum;
    }
  }

  if (params.genre) {
    info.tags = params.genre
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }

  if (params.writer) {
    info.credits = [{ person: params.writer, role: 'Writer' }];
  }

  if (params.communityRating) {
    const rating = parseFloat(params.communityRating);
    if (!isNaN(rating) && rating >= 0 && rating <= 5) {
      info.rating = rating;
    }
  }

  const wrapper = {
    appID: 'BentoPDF/1.0',
    lastModified: new Date().toISOString(),
    'ComicBookInfo/1.0': info,
  };

  return JSON.stringify(wrapper);
}

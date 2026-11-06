export const OFFICIAL_SITE_URL = 'https://www.pixelpdf.com';

export function resolveSiteUrl() {
  return (process.env.SITE_URL || OFFICIAL_SITE_URL).replace(/\/+$/, '');
}

export function isOfficialSiteUrl(url = resolveSiteUrl()) {
  try {
    const { hostname } = new URL(url);
    return hostname === 'www.pixelpdf.com' || hostname === 'pixelpdf.com';
  } catch {
    return false;
  }
}

export function canonicalBasePath() {
  if (isOfficialSiteUrl()) return '';
  return (process.env.BASE_URL || '/').replace(/\/$/, '');
}

export function isIndexingBlocked() {
  return !isOfficialSiteUrl() && process.env.ALLOW_INDEXING !== 'true';
}

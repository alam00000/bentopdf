export interface TimestampTsaPreset {
  label: string;
  url: string;
}

// Some TSA providers only expose HTTP endpoints. RFC 3161 timestamp tokens are
// signed at the application layer, so integrity does not depend solely on TLS.
// The first preset is the default and must use HTTPS for unproxied HTTPS pages.
export const TIMESTAMP_TSA_PRESETS: TimestampTsaPreset[] = [
  { label: 'FreeTSA', url: 'https://freetsa.org/tsr' },
  { label: 'DigiCert', url: 'http://timestamp.digicert.com' },
  { label: 'Sectigo', url: 'http://timestamp.sectigo.com' },
  { label: 'SSL.com', url: 'http://ts.ssl.com' },
  { label: 'MeSign', url: 'http://tsa.mesign.com' },
];

const ALLOWED_TSA_HOSTS: ReadonlySet<string> = new Set(
  TIMESTAMP_TSA_PRESETS.map((preset) => new URL(preset.url).hostname)
);

export function isValidTsaRequestUrl(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isAllowedTsaUrl(value: unknown): value is string {
  if (!isValidTsaRequestUrl(value)) {
    return false;
  }
  return ALLOWED_TSA_HOSTS.has(new URL(value).hostname);
}

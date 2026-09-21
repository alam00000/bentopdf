export interface TimestampTsaPreset {
  label: string;
  url: string;
}

export const TSA_ENDPOINTS_ENV_KEY = 'VITE_TSA_ENDPOINTS' as const;

type TimestampTsaEnv = Partial<
  Pick<ImportMetaEnv, typeof TSA_ENDPOINTS_ENV_KEY>
>;

function getDefaultEnv(): TimestampTsaEnv {
  return import.meta.env;
}

// Some TSA providers only expose HTTP endpoints. RFC 3161 timestamp tokens are
// signed at the application layer, so integrity does not depend solely on TLS.
//
// None of these endpoints answers a CORS preflight, so a browser can only reach
// them through a relay (see VITE_CORS_PROXY_URL). Self-hosted deployments that
// would rather not run a relay can replace this list at build time with
// VITE_TSA_ENDPOINTS, pointing at a TSA that does send CORS headers.
export const DEFAULT_TIMESTAMP_TSA_PRESETS: readonly TimestampTsaPreset[] = [
  { label: 'DigiCert', url: 'http://timestamp.digicert.com' },
  { label: 'Sectigo', url: 'http://timestamp.sectigo.com' },
  { label: 'SSL.com', url: 'http://ts.ssl.com' },
  { label: 'FreeTSA', url: 'https://freetsa.org/tsr' },
  { label: 'MeSign', url: 'http://tsa.mesign.com' },
];

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

/**
 * Parses the build-time VITE_TSA_ENDPOINTS value.
 *
 * Entries are comma separated and each one is either a bare URL or a
 * "Label=URL" pair, e.g.
 *
 *   VITE_TSA_ENDPOINTS="My TSA=https://tsa.example.org/tsr,https://tsa2.example.org"
 *
 * A bare URL is labelled with its hostname. Malformed entries are skipped with
 * a warning so a typo degrades to the built-in presets instead of leaving the
 * tool with an empty dropdown.
 */
export function parseTsaEndpoints(
  value: string | undefined
): TimestampTsaPreset[] {
  if (!value || !value.trim()) {
    return [];
  }

  const presets: TimestampTsaPreset[] = [];
  const seenUrls = new Set<string>();

  for (const rawEntry of value.split(',')) {
    const entry = rawEntry.trim();
    if (!entry) {
      continue;
    }

    const separatorIndex = entry.indexOf('=');
    const label =
      separatorIndex > 0 ? entry.slice(0, separatorIndex).trim() : '';
    const url =
      separatorIndex > 0 ? entry.slice(separatorIndex + 1).trim() : entry;

    if (!isValidTsaRequestUrl(url)) {
      console.warn(
        `[Timestamp] Ignoring malformed ${TSA_ENDPOINTS_ENV_KEY} entry: ${entry}`
      );
      continue;
    }

    if (seenUrls.has(url)) {
      continue;
    }
    seenUrls.add(url);

    presets.push({ label: label || new URL(url).hostname, url });
  }

  return presets;
}

/**
 * The TSA list this build offers: the configured endpoints when
 * VITE_TSA_ENDPOINTS is set and usable, the built-in providers otherwise.
 */
export function resolveTimestampTsaPresets(
  env: TimestampTsaEnv = getDefaultEnv()
): TimestampTsaPreset[] {
  const configured = parseTsaEndpoints(env.VITE_TSA_ENDPOINTS);
  if (configured.length > 0) {
    return configured;
  }
  return DEFAULT_TIMESTAMP_TSA_PRESETS.map((preset) => ({ ...preset }));
}

export const TIMESTAMP_TSA_PRESETS: TimestampTsaPreset[] =
  resolveTimestampTsaPresets();

const ALLOWED_TSA_HOSTS: ReadonlySet<string> = new Set(
  TIMESTAMP_TSA_PRESETS.map((preset) => new URL(preset.url).hostname)
);

export function isAllowedTsaUrl(value: unknown): value is string {
  if (!isValidTsaRequestUrl(value)) {
    return false;
  }
  return ALLOWED_TSA_HOSTS.has(new URL(value).hostname);
}

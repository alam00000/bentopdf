export interface TimestampTsaPreset {
  label: string;
  url: string;
}

// Some TSA providers only expose HTTP endpoints. RFC 3161 timestamp tokens are
// signed at the application layer, so integrity does not depend solely on TLS.
export const TIMESTAMP_TSA_PRESETS: TimestampTsaPreset[] = [
  { label: 'DigiCert', url: 'http://timestamp.digicert.com' },
  { label: 'Sectigo', url: 'http://timestamp.sectigo.com' },
  { label: 'SSL.com', url: 'http://ts.ssl.com' },
  { label: 'FreeTSA', url: 'https://freetsa.org/tsr' },
  { label: 'MeSign', url: 'http://tsa.mesign.com' },
];

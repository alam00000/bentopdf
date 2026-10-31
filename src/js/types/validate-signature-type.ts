import forge from 'node-forge';

export interface SignatureValidationResult {
  signatureIndex: number;
  isValid: boolean;
  signerName: string;
  signerOrg?: string;
  signerEmail?: string;
  issuer: string;
  issuerOrg?: string;
  signatureDate?: Date;
  validFrom: Date;
  validTo: Date;
  isExpired: boolean;
  isSelfSigned: boolean;
  isTrusted: boolean;
  algorithms: {
    digest: string;
    signature: string;
    imprint?: string;
  };
  serialNumber: string;
  reason?: string;
  location?: string;
  contactInfo?: string;
  byteRange?: number[];
  coverageStatus: 'full' | 'partial' | 'unknown';
  errorMessage?: string;
  cryptoVerified?: boolean;
  cryptoVerificationStatus?: 'verified' | 'failed' | 'unsupported';
  unsupportedAlgorithmReason?: string;
  usesInsecureDigest?: boolean;
  isTimestamp?: boolean;
}

export interface ExtractedSignature {
  index: number;
  contents: Uint8Array;
  byteRange: number[];
  reason?: string;
  location?: string;
  contactInfo?: string;
  name?: string;
  signingTime?: string;
  isTimestamp?: boolean;
}

export interface ValidateSignatureState {
  pdfFile: File | null;
  pdfBytes: Uint8Array | null;
  results: SignatureValidationResult[];
  trustedCertFile: File | null;
  trustedCert: forge.pki.Certificate | null;
}

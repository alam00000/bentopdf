import { forge } from "zgapdfsigner";

export interface SignatureInfo {
    reason?: string;
    location?: string;
    contactInfo?: string;
    name?: string;
}

export interface CertificateData {
    p12Buffer: ArrayBuffer;
    password: string;
    certificate: forge.pki.Certificate;
}

export interface SignPdfOptions {
    signatureInfo?: SignatureInfo;
    visibleSignature?: VisibleSignatureOptions;
}

export interface VisibleSignatureOptions {
    enabled: boolean;
    imageData?: ArrayBuffer;
    imageType?: 'png' | 'jpeg' | 'webp';
    x: number;
    y: number;
    width: number;
    height: number;
    page: number | string;
    text?: string;
    textColor?: string;
    textSize?: number;
}

export interface DigitalSignState {
    pdfFile: File | null;
    pdfBytes: Uint8Array | null;
    certFile: File | null;
    certData: CertificateData | null;
    sigImageData: ArrayBuffer | null;
    sigImageType: 'png' | 'jpeg' | 'webp' | null;
}
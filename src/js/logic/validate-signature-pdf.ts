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
    };
    serialNumber: string;
    reason?: string;
    location?: string;
    contactInfo?: string;
    byteRange?: number[];
    coverageStatus: 'full' | 'partial' | 'unknown';
    errorMessage?: string;
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
}

/**
 * Extract all digital signatures from a PDF file
 */
export function extractSignatures(pdfBytes: Uint8Array): ExtractedSignature[] {
    const signatures: ExtractedSignature[] = [];
    const pdfString = new TextDecoder('latin1').decode(pdfBytes);

    // Find all signature objects by looking for /Type /Sig
    const sigRegex = /\/Type\s*\/Sig\b/g;
    let sigMatch;
    let sigIndex = 0;

    while ((sigMatch = sigRegex.exec(pdfString)) !== null) {
        try {
            // Find the containing object
            const searchStart = Math.max(0, sigMatch.index - 5000);
            const searchEnd = Math.min(pdfString.length, sigMatch.index + 10000);
            const context = pdfString.substring(searchStart, searchEnd);

            // Extract ByteRange
            const byteRangeMatch = context.match(/\/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/);
            if (!byteRangeMatch) continue;

            const byteRange = [
                parseInt(byteRangeMatch[1], 10),
                parseInt(byteRangeMatch[2], 10),
                parseInt(byteRangeMatch[3], 10),
                parseInt(byteRangeMatch[4], 10),
            ];

            // Extract Contents (the actual PKCS#7 signature)
            const contentsMatch = context.match(/\/Contents\s*<([0-9A-Fa-f]+)>/);
            if (!contentsMatch) continue;

            const hexContents = contentsMatch[1];
            const contentsBytes = hexToBytes(hexContents);

            // Extract optional fields
            const reasonMatch = context.match(/\/Reason\s*\(([^)]*)\)/);
            const locationMatch = context.match(/\/Location\s*\(([^)]*)\)/);
            const contactMatch = context.match(/\/ContactInfo\s*\(([^)]*)\)/);
            const nameMatch = context.match(/\/Name\s*\(([^)]*)\)/);
            const timeMatch = context.match(/\/M\s*\(D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);

            let signingTime: string | undefined;
            if (timeMatch) {
                signingTime = `${timeMatch[1]}-${timeMatch[2]}-${timeMatch[3]}T${timeMatch[4]}:${timeMatch[5]}:${timeMatch[6]}`;
            }

            signatures.push({
                index: sigIndex++,
                contents: contentsBytes,
                byteRange,
                reason: reasonMatch ? decodeURIComponent(escape(reasonMatch[1])) : undefined,
                location: locationMatch ? decodeURIComponent(escape(locationMatch[1])) : undefined,
                contactInfo: contactMatch ? decodeURIComponent(escape(contactMatch[1])) : undefined,
                name: nameMatch ? decodeURIComponent(escape(nameMatch[1])) : undefined,
                signingTime,
            });
        } catch (e) {
            console.warn('Error extracting signature at index', sigIndex, e);
        }
    }

    return signatures;
}

/**
 * Validate a single extracted signature
 */
export function validateSignature(
    signature: ExtractedSignature,
    pdfBytes: Uint8Array,
    trustedCert?: forge.pki.Certificate
): SignatureValidationResult {
    const result: SignatureValidationResult = {
        signatureIndex: signature.index,
        isValid: false,
        signerName: 'Unknown',
        issuer: 'Unknown',
        validFrom: new Date(0),
        validTo: new Date(0),
        isExpired: false,
        isSelfSigned: false,
        isTrusted: false,
        algorithms: { digest: 'Unknown', signature: 'Unknown' },
        serialNumber: '',
        byteRange: signature.byteRange,
        coverageStatus: 'unknown',
        reason: signature.reason,
        location: signature.location,
        contactInfo: signature.contactInfo,
    };

    try {
        // Parse the PKCS#7 signature - convert Uint8Array to binary string
        const binaryString = String.fromCharCode.apply(null, Array.from(signature.contents));
        const asn1 = forge.asn1.fromDer(binaryString);
        const p7 = forge.pkcs7.messageFromAsn1(asn1) as any;

        // Get signer info
        if (!p7.certificates || p7.certificates.length === 0) {
            result.errorMessage = 'No certificates found in signature';
            return result;
        }

        // Use the first certificate (signer's certificate)
        const signerCert = p7.certificates[0] as forge.pki.Certificate;

        // Extract signer information
        const subjectCN = signerCert.subject.getField('CN');
        const subjectO = signerCert.subject.getField('O');
        const subjectE = signerCert.subject.getField('E') || signerCert.subject.getField('emailAddress');
        const issuerCN = signerCert.issuer.getField('CN');
        const issuerO = signerCert.issuer.getField('O');

        result.signerName = (subjectCN?.value as string) ?? 'Unknown';
        result.signerOrg = subjectO?.value as string | undefined;
        result.signerEmail = subjectE?.value as string | undefined;
        result.issuer = (issuerCN?.value as string) ?? 'Unknown';
        result.issuerOrg = issuerO?.value as string | undefined;
        result.validFrom = signerCert.validity.notBefore;
        result.validTo = signerCert.validity.notAfter;
        result.serialNumber = signerCert.serialNumber;

        // Check if expired
        const now = new Date();
        result.isExpired = now > result.validTo || now < result.validFrom;

        // Check if self-signed
        result.isSelfSigned = signerCert.isIssuer(signerCert);

        // Check trust against provided certificate
        if (trustedCert) {
            try {
                // Check if the signer cert is issued by the trusted cert
                // or if the trusted cert matches one of the certs in the chain
                const isTrustedIssuer = trustedCert.isIssuer(signerCert);
                const isSameCert = signerCert.serialNumber === trustedCert.serialNumber;

                // Also check if any cert in the PKCS#7 chain matches or is issued by trusted cert
                let chainTrusted = false;
                for (const cert of p7.certificates) {
                    if (trustedCert.isIssuer(cert) ||
                        (cert as forge.pki.Certificate).serialNumber === trustedCert.serialNumber) {
                        chainTrusted = true;
                        break;
                    }
                }

                result.isTrusted = isTrustedIssuer || isSameCert || chainTrusted;
            } catch {
                result.isTrusted = false;
            }
        }

        // Extract algorithm info
        result.algorithms = {
            digest: getDigestAlgorithmName(signerCert.siginfo?.algorithmOid || ''),
            signature: getSignatureAlgorithmName(signerCert.signatureOid || ''),
        };

        // Parse signing time if available in signature
        if (signature.signingTime) {
            result.signatureDate = new Date(signature.signingTime);
        } else {
            // Try to extract from authenticated attributes
            try {
                const signedData = p7 as any;
                if (signedData.rawCapture?.authenticatedAttributes) {
                    // Look for signing time attribute
                    for (const attr of signedData.rawCapture.authenticatedAttributes) {
                        if (attr.type === forge.pki.oids.signingTime) {
                            result.signatureDate = attr.value;
                            break;
                        }
                    }
                }
            } catch { /* ignore */ }
        }

        // Check byte range coverage
        if (signature.byteRange && signature.byteRange.length === 4) {
            const [start1, len1, start2, len2] = signature.byteRange;
            const totalCovered = len1 + len2;
            const expectedEnd = start2 + len2;

            if (expectedEnd === pdfBytes.length) {
                result.coverageStatus = 'full';
            } else if (expectedEnd < pdfBytes.length) {
                result.coverageStatus = 'partial';
            }
        }

        // Mark as valid if we could parse it
        result.isValid = true;

    } catch (e) {
        result.errorMessage = e instanceof Error ? e.message : 'Failed to parse signature';
    }

    return result;
}

/**
 * Validate all signatures in a PDF
 */
export async function validatePdfSignatures(
    pdfBytes: Uint8Array,
    trustedCert?: forge.pki.Certificate
): Promise<SignatureValidationResult[]> {
    const signatures = extractSignatures(pdfBytes);
    return signatures.map(sig => validateSignature(sig, pdfBytes, trustedCert));
}

/**
 * Get the number of signatures in a PDF without full validation
 */
export function countSignatures(pdfBytes: Uint8Array): number {
    return extractSignatures(pdfBytes).length;
}

// Helper functions

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }

    // PDF signature /Contents are padded with trailing null bytes.
    // node-forge ASN.1 parser fails with "Unparsed DER bytes remain" if we include them.
    // Find the actual end of the DER data by stripping trailing zeros.
    let actualLength = bytes.length;
    while (actualLength > 0 && bytes[actualLength - 1] === 0) {
        actualLength--;
    }

    return bytes.slice(0, actualLength);
}

function getDigestAlgorithmName(oid: string): string {
    const digestAlgorithms: Record<string, string> = {
        '1.2.840.113549.2.5': 'MD5',
        '1.3.14.3.2.26': 'SHA-1',
        '2.16.840.1.101.3.4.2.1': 'SHA-256',
        '2.16.840.1.101.3.4.2.2': 'SHA-384',
        '2.16.840.1.101.3.4.2.3': 'SHA-512',
        '2.16.840.1.101.3.4.2.4': 'SHA-224',
    };
    return digestAlgorithms[oid] || oid || 'Unknown';
}

function getSignatureAlgorithmName(oid: string): string {
    const signatureAlgorithms: Record<string, string> = {
        '1.2.840.113549.1.1.1': 'RSA',
        '1.2.840.113549.1.1.5': 'RSA with SHA-1',
        '1.2.840.113549.1.1.11': 'RSA with SHA-256',
        '1.2.840.113549.1.1.12': 'RSA with SHA-384',
        '1.2.840.113549.1.1.13': 'RSA with SHA-512',
        '1.2.840.10045.2.1': 'ECDSA',
        '1.2.840.10045.4.1': 'ECDSA with SHA-1',
        '1.2.840.10045.4.3.2': 'ECDSA with SHA-256',
        '1.2.840.10045.4.3.3': 'ECDSA with SHA-384',
        '1.2.840.10045.4.3.4': 'ECDSA with SHA-512',
    };
    return signatureAlgorithms[oid] || oid || 'Unknown';
}

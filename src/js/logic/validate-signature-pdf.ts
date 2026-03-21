import forge from 'node-forge';
import { ExtractedSignature, SignatureValidationResult } from '@/types';


export function extractSignatures(pdfBytes: Uint8Array): ExtractedSignature[] {
    const signatures: ExtractedSignature[] = [];
    const pdfString = new TextDecoder('latin1').decode(pdfBytes);

    // Find all signature objects for /Type /Sig
    const sigRegex = /\/Type\s*\/Sig\b/g;
    let sigMatch;
    let sigIndex = 0;

    while ((sigMatch = sigRegex.exec(pdfString)) !== null) {
        try {
            const searchStart = Math.max(0, sigMatch.index - 5000);
            const searchEnd = Math.min(pdfString.length, sigMatch.index + 10000);
            const context = pdfString.substring(searchStart, searchEnd);
            const byteRangeMatch = context.match(/\/ByteRange\s*\[\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\]/);
            if (!byteRangeMatch) continue;

            const byteRange = [
                parseInt(byteRangeMatch[1], 10),
                parseInt(byteRangeMatch[2], 10),
                parseInt(byteRangeMatch[3], 10),
                parseInt(byteRangeMatch[4], 10),
            ];

            const contentsMatch = context.match(/\/Contents\s*<([0-9A-Fa-f]+)>/);
            if (!contentsMatch) continue;

            const hexContents = contentsMatch[1];
            const contentsBytes = hexToBytes(hexContents);

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
        const binaryString = String.fromCharCode.apply(null, Array.from(signature.contents));
        const asn1 = forge.asn1.fromDer(binaryString);
        const p7 = forge.pkcs7.messageFromAsn1(asn1) as any;

        if (!p7.certificates || p7.certificates.length === 0) {
            result.errorMessage = 'No certificates found in signature';
            return result;
        }

        const signerCert = p7.certificates[0] as forge.pki.Certificate;

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

        const now = new Date();
        result.isExpired = now > result.validTo || now < result.validFrom;

        result.isSelfSigned = signerCert.isIssuer(signerCert);

        // Check trust against provided certificate
        if (trustedCert) {
            try {
                const isTrustedIssuer = trustedCert.isIssuer(signerCert);
                const isSameCert = signerCert.serialNumber === trustedCert.serialNumber;

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

        result.isValid = true;

    } catch (e) {
        result.errorMessage = e instanceof Error ? e.message : 'Failed to parse signature';
    }

    return result;
}

export async function validatePdfSignatures(
    pdfBytes: Uint8Array,
    trustedCert?: forge.pki.Certificate
): Promise<SignatureValidationResult[]> {
    const signatures = extractSignatures(pdfBytes);
    return signatures.map(sig => validateSignature(sig, pdfBytes, trustedCert));
}

export function countSignatures(pdfBytes: Uint8Array): number {
    return extractSignatures(pdfBytes).length;
}

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }

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

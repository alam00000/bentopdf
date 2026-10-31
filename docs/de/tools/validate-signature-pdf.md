---
title: Signatur prüfen
description: Überprüfen Sie digitale Signaturen in PDF-Dateien. Prüfen Sie Zertifikatsgültigkeit, Identität des Unterzeichners, Dokumentintegrität und Status der Vertrauenskette.
---

# Signatur prüfen

Laden Sie eine signierte PDF hoch, und dieses Tool liest jede digitale Signatur aus, identifiziert den Unterzeichner, prüft die Gültigkeit des Zertifikats und meldet, ob das Dokument seit der Signatur verändert wurde. Sie können auch ein vertrauenswürdiges Zertifikat angeben, um die Signaturkette zu verifizieren.

## So funktioniert es

1. Laden Sie eine signierte PDF-Datei hoch. Die Prüfung startet automatisch.
2. Das Tool zeigt eine Zusammenfassung: Anzahl der gefundenen Signaturen und wie viele davon gültig sind.
3. Jede Signatur erhält eine Detailkarte mit Name des Unterzeichners, Aussteller, Daten und Status.
4. Laden Sie optional ein **vertrauenswürdiges Zertifikat** (.pem, .crt, .cer, .der) hoch, um die Signatur gegen einen bestimmten Vertrauensanker zu prüfen. Die erneute Prüfung läuft automatisch.

## Was geprüft wird

### Signatur-Parsing

Das Tool liest PKCS#7-Signaturobjekte aus der PDF, dekodiert die ASN.1-Struktur und extrahiert das X.509-Zertifikat des Unterzeichners sowie eine in der Signatur eingebettete Zertifikatskette.

### Zertifikatsgültigkeit

- **Ablauf**: Liegt das Zertifikat derzeit innerhalb seines Gültigkeitszeitraums?
- **Erkennung selbstsignierter Zertifikate**: Ist das Zertifikat sein eigener Aussteller?
- **Vertrauenskette**: Führt das Zertifikat des Unterzeichners bei Angabe eines vertrauenswürdigen Zertifikats auf dieses zurück?

### Kryptografische Verifizierung

- Das Tool rekonstruiert die vom `/ByteRange` der Signatur abgedeckten Bytes, bildet mit dem vom Unterzeichner angegebenen Algorithmus einen Hash und vergleicht das Ergebnis mit dem Attribut `messageDigest` in der Signatur.
- Anschließend serialisiert es die signierten Attribute erneut als DER SET und verifiziert die Signatur mit dem öffentlichen Schlüssel des Unterzeichnerzertifikats.
- **Eine Signatur wird nur dann als gültig gemeldet, wenn alle diese Prüfungen bestehen.** Wurden die PDF-Bytes nach der Signatur geändert oder passt die eingebettete Signatur nicht zum Schlüssel des Unterzeichners, zeigt der Status „Ungültig: Kryptografische Verifizierung fehlgeschlagen“ mit dem genauen Grund.

#### Unterstützte Signaturalgorithmen

| Algorithmus             | Verifizierungspfad                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| RSA (PKCS#1 v1.5)       | node-forge `publicKey.verify`, mit Web-Crypto-Fallback                                       |
| RSA-PSS (RSASSA-PSS)    | Web Crypto `verify({name: 'RSA-PSS', saltLength})`                                           |
| ECDSA P-256/P-384/P-521 | Web Crypto `verify({name: 'ECDSA', hash})` nach Umwandlung der Signatur von DER → IEEE P1363 |

Verwendet eine Signatur einen Algorithmus außerhalb dieser Liste (zum Beispiel Ed25519, SM2 oder RSA mit einer ungewöhnlichen Digest-OID), zeigt die Karte in Gelb **„Ungeprüft: Nicht unterstützter Signaturalgorithmus“** zusammen mit der konkreten OID oder dem Grund. Dies ist eine bewusste Unterscheidung in drei Zustände:

- **Gültig**: Die Signatur wurde kryptografisch gegen den öffentlichen Schlüssel des Unterzeichners verifiziert.
- **Ungültig**: Die Verifizierung lief und ergab ein negatives Ergebnis (Bytes geändert, Schlüssel passt nicht).
- **Ungeprüft**: Das Tool konnte die Verifizierung für diesen Algorithmus nicht durchführen. Die Zertifikatsmetadaten werden weiterhin angezeigt, die Signatur sollten Sie aber als „unbekannt“ behandeln und mit Adobe Acrobat oder `openssl cms -verify` prüfen.

### Unsichere Digest-Algorithmen

- Signaturen mit **MD5 oder SHA-1** werden als ungültig abgelehnt und mit dem Status „Unsicherer Digest“ markiert. Für beide Algorithmen gibt es veröffentlichte Kollisionsangriffe, sodass eine Signatur über einen SHA-1- oder MD5-Hash keine Integritätsgarantie bietet.
- SHA-224, SHA-256, SHA-384 und SHA-512 werden alle akzeptiert.

### Dokumentabdeckung

- **Vollständige Abdeckung**: Die Signatur deckt die gesamte PDF-Datei ab, das heißt, nach der Signatur wurden keine Bytes hinzugefügt oder geändert.
- **Teilweise Abdeckung**: Die Signatur deckt nur einen Teil der Datei ab. Das kann auf Änderungen nach der Signatur hindeuten (nicht zwingend böswillige, denn inkrementelle Speicherungen führen zu teilweiser Abdeckung).

## Signaturdetails

Jede Signaturkarte zeigt:

- **Signiert von**: Common Name, Organisation und E-Mail-Adresse aus dem Zertifikat des Unterzeichners
- **Aussteller**: Die Zertifizierungsstelle, die das Zertifikat des Unterzeichners ausgestellt hat
- **Signiert am**: Der in der Signatur eingebettete Zeitstempel
- **Gültig ab / Gültig bis**: Der Gültigkeitszeitraum des Zertifikats
- **Grund**: Warum das Dokument signiert wurde (falls angegeben)
- **Ort**: Wo es signiert wurde (falls angegeben)
- **Abdeckungsstatus**: Vollständig oder teilweise
- **Vertrauensabzeichen**: Vertrauenswürdig oder Nicht in der Vertrauenskette (nur bei einem eigenen Zertifikat)

### Technische Details

Öffnen Sie den Bereich mit den technischen Details für:

- Seriennummer des Zertifikats des Unterzeichners
- Digest-Algorithmus (SHA-256, SHA-512 usw.)
- Signaturalgorithmus (RSA mit SHA-256, ECDSA mit SHA-256 usw.)
- Fehlermeldungen für ungültige Signaturen

## Anwendungsfälle

- Einen digital signierten Vertrag prüfen, bevor Sie gegenzeichnen
- Signierte Dokumente prüfen, um sicherzustellen, dass sie nicht manipuliert wurden
- Kontrollieren, ob ein Zertifikat seit der Signierung des Dokuments abgelaufen ist
- Signaturen gegen das Stammzertifikat Ihrer Organisation validieren
- Die Signaturdetails von behördlichen oder rechtlichen Dokumenten untersuchen

## Tipps

- Ein selbstsigniertes Zertifikat bedeutet nicht, dass die Signatur ungültig ist. Es bedeutet, dass sich die Identität des Unterzeichners nicht über eine vertrauenswürdige dritte Stelle verifizieren lässt. Das ist bei internen Dokumenten üblich.
- Teilweise Abdeckung weist nicht immer auf Manipulation hin. Viele PDF-Workflows fügen inkrementelle Updates hinzu (etwa eine zweite Signatur), die eine teilweise Abdeckung erzeugen.
- Laden Sie das Stamm- oder Zwischenzertifikat Ihrer Organisation als vertrauenswürdiges Zertifikat hoch, um die Vertrauensketten-Verifizierung zu erhalten.

## Verwandte Tools

- [Digitale Signatur](./digital-sign-pdf): PDFs mit Ihrem eigenen Zertifikat signieren
- [PDF reduzieren](./flatten-pdf): eine PDF vor dem Signieren reduzieren, um Änderungen nach der Signatur zu verhindern
- [Metadaten entfernen](./remove-metadata): eine PDF vor dem Anbringen einer Signatur bereinigen

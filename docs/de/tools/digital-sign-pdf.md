---
title: Digitale Signatur
description: Fügen Sie PDFs kryptografische digitale Signaturen mit X.509-Zertifikaten hinzu. Unterstützt PKCS#12- und PEM-Formate mit sichtbaren Signaturoptionen.
---

# Digitale Signatur

Eine digitale Signatur ist ein kryptografischer Nachweis, dass eine bestimmte Person ein Dokument signiert hat und dass das Dokument seitdem nicht verändert wurde. Anders als eine gezeichnete Signatur (die nur ein Bild ist) nutzt eine digitale Signatur X.509-Zertifikate und PKCS#7-Standards, um überprüfbare Echtheit und Integrität zu gewährleisten.

BentoPDF wendet digitale Signaturen vollständig in Ihrem Browser an. Ihr privater Schlüssel verlässt nie Ihr Gerät.

## So funktioniert es

1. Laden Sie eine PDF-Datei hoch.
2. Laden Sie Ihre Zertifikatsdatei hoch (.pfx, .p12 oder .pem).
3. Geben Sie das Zertifikatspasswort ein, um es zu entsperren. Das Werkzeug zeigt Zertifikatsinhaber, Aussteller und Gültigkeitszeitraum an.
4. Konfigurieren Sie optional Signaturmetadaten (Grund, Ort, Kontaktinformationen).
5. Aktivieren Sie optional eine **sichtbare Signatur** mit Anpassung von Position, Größe, Bild und Text.
6. Klicken Sie auf **PDF signieren**.

## Unterstützte Zertifikatsformate

| Format      | Erweiterungen | Beschreibung                                                                                                                         |
| ----------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **PKCS#12** | .pfx, .p12    | Branchenstandard-Paket mit privatem Schlüssel und Zertifikatskette. Das gängigste Format.                                            |
| **PEM**     | .pem          | Textbasiertes Format. Muss Zertifikat und privaten Schlüssel in einer Datei enthalten. Unterstützt verschlüsselte private Schlüssel. |

## Optionen für die sichtbare Signatur

Wenn aktiviert, wird ein sichtbarer Signaturblock auf der PDF-Seite dargestellt:

- **Position**: X/Y-Koordinaten sowie Breite/Höhe in Punkt
- **Seite**: Erste Seite, letzte Seite, alle Seiten oder eine bestimmte Seitenzahl
- **Bild**: Laden Sie ein PNG-, JPG- oder WebP-Bild hoch (Ihre handschriftliche Unterschrift, ein Firmensiegel usw.)
- **Text**: Eigener Text mit einstellbarer Farbe und Schriftgröße. Wenn weder Bild noch Text angegeben sind, erzeugt das Werkzeug automatisch Text aus dem Common Name des Zertifikats und dem aktuellen Datum.

## Signaturmetadaten

- **Grund**: Warum das Dokument signiert wurde (z. B. "Genehmigt", "Geprüft")
- **Ort**: Wo die Signierung stattfand (z. B. "Berlin")
- **Kontaktinformationen**: Wie der Unterzeichner erreichbar ist (z. B. E-Mail-Adresse)

## Hinweis zur Internetverbindung

Das Signieren kann eine Internetverbindung erfordern. Die Signaturbibliothek ruft die Zertifikatskette von URLs ab, die in der Authority-Information-Access-Erweiterung (AIA) Ihres Zertifikats eingebettet sind. Sind diese Server nicht erreichbar, schlägt das Signieren bei Zertifikaten fehl, die eine Kettenprüfung erfordern.

## Anwendungsfälle

- Verträge, Angebote und Vereinbarungen mit rechtsverbindlichen digitalen Signaturen signieren
- Offizielle Dokumente in Abläufen beglaubigen, die PKI-basierte Authentifizierung erfordern
- PDF-Rechnungen für die Einhaltung von Vorschriften signieren (viele EU-Länder verlangen digital signierte E-Rechnungen)
- Technischen Zeichnungen oder Qualitätsdokumenten eine organisatorische Freigabe hinzufügen

## Tipps

- Selbstsignierte Zertifikate eignen sich zum Testen, zeigen aber in Adobe Reader Warnungen an. Verwenden Sie für Produktivdokumente ein Zertifikat einer vertrauenswürdigen Zertifizierungsstelle.
- Die sichtbare Signatur ist rein visuell. Die kryptografische Signatur wird unabhängig davon eingebettet, ob der sichtbare Block aktiviert ist.
- Prüfen Sie Ihre signierte PDF mit dem Werkzeug Signatur validieren, um sicherzustellen, dass die Signatur intakt ist.

## Verwandte Werkzeuge

- [Signatur validieren](./validate-signature-pdf): digitale Signaturen in signierten PDFs überprüfen
- [PDF verflachen](./flatten-pdf): Formulare vor dem Signieren verflachen, um Änderungen zu verhindern
- [PDF verschlüsseln](./protect-pdf): zusätzlich zur digitalen Signatur Passwortschutz hinzufügen
- [Metadaten entfernen](./remove-metadata): Metadaten vor dem Signieren entfernen

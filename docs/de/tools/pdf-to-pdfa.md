---
title: PDF zu PDF/A
description: Wandeln Sie Standard-PDFs für die Langzeitarchivierung in das PDF/A-Format um. Unterstützt die Konformitätsstufen PDF/A-1b, PDF/A-2b und PDF/A-3b.
---

# PDF zu PDF/A

PDF/A ist eine ISO-genormte Teilmenge von PDF, die für die digitale Langzeitarchivierung entwickelt wurde. Dieses Werkzeug wandelt Ihre Standard-PDFs mit Ghostscript, das direkt in Ihrem Browser läuft, in PDF/A-konforme Dokumente um.

## So funktioniert es

1. Laden Sie eine oder mehrere PDF-Dateien hoch.
2. Wählen Sie im Dropdown eine **PDF/A-Version**.
3. Aktivieren Sie optional **PDF vorab verflachen** für komplexe Dateien, bei denen die normale Umwandlung scheitert.
4. Klicken Sie auf **In PDF/A umwandeln**. Mehrere Dateien ergeben ein ZIP-Archiv.

## PDF/A-Versionen

| Version      | Einschränkungen                                 | Am besten für                                      |
| ------------ | ----------------------------------------------- | -------------------------------------------------- |
| **PDF/A-1b** | Am strengsten. Keine Transparenz, keine Ebenen. | Maximale Kompatibilität mit älteren Archivsystemen |
| **PDF/A-2b** | Erlaubt Transparenz und JPEG2000.               | Allgemeine Archivierung (empfohlen)                |
| **PDF/A-3b** | Erlaubt eingebettete Anhänge in jedem Format.   | Archivierung von Dokumenten mit Quelldatendateien  |

PDF/A-2b ist standardmäßig ausgewählt und genügt für die allermeisten Archivierungszwecke.

## Option Vorab verflachen

Manche PDFs enthalten Merkmale, die eine saubere PDF/A-Umwandlung verhindern: ungewöhnliche Schriftkodierungen, komplexe Transparenzstapel oder defekte interne Strukturen. Wenn Sie **Vorab verflachen** aktivieren, wird das PDF vor der Umwandlung mit 300 DPI gerastert. Das garantiert Konformität, macht den Text aber nicht mehr auswählbar. Nutzen Sie es als Ausweichlösung, wenn die normale Umwandlung Fehler erzeugt.

Das Vorab-Verflachen erfordert die PyMuPDF-WASM-Engine.

## Anwendungsfälle

- Archivierungsvorgaben von Behörden oder Gerichten erfüllen (viele Rechtsordnungen verlangen PDF/A für Gerichtsunterlagen)
- Dokumente bei institutionellen Repositorien oder digitalen Bibliotheken einreichen
- Geschäftsunterlagen bewahren, wenn die ursprüngliche Software in zehn Jahren möglicherweise nicht mehr existiert
- Rechnungen für E-Rechnungsstandards vorbereiten, die PDF/A-3b mit XML-Anhängen verlangen

## Tipps

- Versuchen Sie die Umwandlung zuerst ohne Vorab-Verflachen. Aktivieren Sie es nur, wenn ein Fehler auftritt.
- PDF/A bettet alle Schriften ein, daher sind die Ausgabedateien oft größer als die Originale.
- Prüfen Sie die Ausgabe in einem eigenen PDF/A-Validator, wenn für Ihren Workflow strikte Konformität erforderlich ist.

## Verwandte Werkzeuge

- [PDF komprimieren](./compress-pdf): die Dateigröße nach der Umwandlung verringern
- [PDF reduzieren](./flatten-pdf): Formulare vor der Umwandlung in PDF/A verflachen
- [Metadaten entfernen](./remove-metadata): Metadaten vor der Archivierung entfernen

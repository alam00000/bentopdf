---
title: Word zu PDF
description: Konvertieren Sie Word-Dokumente (DOC, DOCX), ODT- und RTF-Dateien in Ihrem Browser mit vollständig erhaltener Formatierung in PDF.
---

# Word zu PDF

Konvertieren Sie Microsoft-Word-Dokumente und kompatible Formate in PDF. Das Tool nutzt eine browserbasierte LibreOffice-Engine, die DOC-, DOCX-, ODT- und RTF-Dateien verarbeitet und dabei Formatierung, Tabellen, Bilder, Kopf- und Fußzeilen sowie Formatvorlagen in der Ausgabe beibehält.

## Unterstützte Formate

| Format            | Erweiterungen |
| :---------------- | :------------ |
| Word (modern)     | `.docx`       |
| Word (älter)      | `.doc`        |
| OpenDocument Text | `.odt`        |
| Rich Text Format  | `.rtf`        |

## So funktioniert es

1. Klicken Sie auf den Upload-Bereich oder ziehen Sie Ihre Word-Dokumente per Drag-and-drop hinein. Es können mehrere Dateien gleichzeitig ausgewählt werden.
2. Prüfen und verwalten Sie die Dateiliste.
3. Klicken Sie auf **In PDF konvertieren**. Die LibreOffice-Engine wird bei der ersten Verwendung geladen (eine Fortschrittsanzeige zeigt den Initialisierungsstatus), danach wird jede Datei konvertiert.
4. Eine einzelne Datei wird direkt als PDF heruntergeladen. Mehrere Dateien werden in `word-converted.zip` gepackt.

## Optionen

Dieses Tool hat keine zusätzlichen Einstellungen. Die LibreOffice-Engine erzeugt die Ausgabe mit ihrem Standard-PDF-Exportprofil.

## Ausgabe

| Anzahl der Eingaben | Ausgabe                                                             |
| :------------------ | :------------------------------------------------------------------ |
| 1 Datei             | Einzelner PDF-Download (ursprünglicher Dateiname mit Endung `.pdf`) |
| 2+ Dateien          | ZIP-Archiv (`word-converted.zip`) mit einer PDF pro Datei           |

## Anwendungsfälle

- Einen Lebenslauf oder ein Anschreiben vor der Bewerbung von DOCX in PDF umwandeln
- Eine Reihe von Verträgen oder Angeboten für die Übergabe an einen Kunden im Stapel in PDF konvertieren
- Alte `.doc`-Dateien für die Langzeitarchivierung in moderne PDFs umwandeln
- Gemeinsam bearbeitete Dokumente aus Google Docs (als DOCX exportiert) in PDF konvertieren
- Druckfertige PDFs aus Word-Vorlagen erzeugen, die für die automatisierte Dokumenterstellung genutzt werden

## Tipps

- Die LibreOffice-Engine wird einmal pro Sitzung heruntergeladen und zwischengespeichert. Rechnen Sie bei der ersten Konvertierung mit einigen Sekunden Ladezeit, weitere Konvertierungen sind deutlich schneller.
- Komplexe Formatierungen (Makros, ActiveX-Steuerelemente, fortgeschrittenes SmartArt) werden möglicherweise nicht perfekt konvertiert. Standardelemente wie Text, Tabellen, Bilder, Kopfzeilen und Fußnoten werden zuverlässig konvertiert.
- Da dieses Tool auch ODT und RTF akzeptiert, können Sie es als zentralen Konverter für alle Textverarbeitungsformate nutzen.

## Verwandte Tools

- [ODT zu PDF](./odt-to-pdf)
- [RTF zu PDF](./rtf-to-pdf)
- [Excel zu PDF](./excel-to-pdf)
- [PowerPoint zu PDF](./powerpoint-to-pdf)

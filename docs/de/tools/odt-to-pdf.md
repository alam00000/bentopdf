---
title: ODT zu PDF
description: Wandeln Sie OpenDocument-Text-Dateien (ODT) im Browser mit einer auf LibreOffice basierenden Engine in PDF um.
---

# ODT zu PDF

Wandeln Sie OpenDocument-Text-Dateien in PDF um. ODT ist das native Format von LibreOffice Writer, Apache OpenOffice und anderen Open-Source-Textverarbeitungen. Dieses Werkzeug nutzt eine browserbasierte LibreOffice-Engine für genaue Umwandlungen, die Formatierung, Tabellen, Bilder und Formatvorlagen erhalten.

## Unterstützte Formate

| Format            | Endungen |
| :---------------- | :------- |
| OpenDocument Text | `.odt`   |

## So funktioniert es

1. Klicken Sie auf den Upload-Bereich oder ziehen Sie eine oder mehrere ODT-Dateien per Drag-and-drop hinein.
2. Prüfen Sie die Dateiliste. Fügen Sie weitere Dateien hinzu oder entfernen Sie unerwünschte.
3. Klicken Sie auf **In PDF umwandeln**. Die LibreOffice-Engine wird initialisiert (eine Fortschrittsanzeige zeigt den Ladestatus), danach wird jede Datei umgewandelt.
4. Eine einzelne Datei wird direkt als PDF heruntergeladen. Mehrere Dateien werden in `odt-converted.zip` gepackt.

## Optionen

Dieses Werkzeug hat keine zusätzliche Konfiguration. Die Umwandlung erhält die Formatierung des Originaldokuments so genau wie möglich.

## Ausgabe

| Anzahl Eingaben | Ausgabe                                                  |
| :-------------- | :------------------------------------------------------- |
| 1 Datei         | Einzelner PDF-Download (z. B. `document.pdf`)            |
| 2+ Dateien      | ZIP-Archiv (`odt-converted.zip`) mit einem PDF pro Datei |

## Anwendungsfälle

- LibreOffice-Writer-Dokumente in PDF umwandeln, um sie mit Microsoft-Office-Nutzern zu teilen
- Druckfertige PDFs aus wissenschaftlichen Arbeiten im OpenDocument-Format erzeugen
- Einen Ordner mit ODT-Vorlagen als Stapel in PDFs für die Verteilung umwandeln
- PDFs aus ODT-Dateien erzeugen, die von automatisierten Dokumentensystemen erstellt wurden

## Tipps

- Die LibreOffice-Engine wird bei der ersten Nutzung geladen und für weitere Umwandlungen zwischengespeichert. Das erste Laden dauert einige Sekunden, danach geht es schnell.
- Komplexe Dokumente mit eingebetteten OLE-Objekten oder ungewöhnlichen Schriften werden möglicherweise etwas anders dargestellt als in LibreOffice auf dem Desktop. Testen Sie mit einer Probe, bevor Sie einen Stapel umwandeln.
- Für Word-Dokumente (`.doc`, `.docx`) nutzen Sie stattdessen das Werkzeug [Word zu PDF](./word-to-pdf), das ebenfalls die LibreOffice-Engine verwendet, aber Microsoft-Formate direkt akzeptiert.

## Verwandte Werkzeuge

- [Word zu PDF](./word-to-pdf)
- [RTF zu PDF](./rtf-to-pdf)
- [Text zu PDF](./txt-to-pdf)

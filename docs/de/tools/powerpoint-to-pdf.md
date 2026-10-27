---
title: PowerPoint zu PDF
description: Wandeln Sie PowerPoint-Präsentationen (PPT, PPTX) und ODP-Dateien in PDF um, mit erhaltener Folienformatierung.
---

# PowerPoint zu PDF

Wandeln Sie Präsentationsdateien in PDF um. Jede Folie wird zu einer Seite im Ausgabedokument, wobei Text, Bilder, Formen und Übergänge über eine browserbasierte LibreOffice-Engine dargestellt werden. Unterstützt werden moderne und ältere PowerPoint-Formate sowie das OpenDocument-Präsentationsformat.

## Unterstützte Formate

| Format                    | Endungen |
| :------------------------ | :------- |
| PowerPoint (modern)       | `.pptx`  |
| PowerPoint (älter)        | `.ppt`   |
| OpenDocument Presentation | `.odp`   |

## So funktioniert es

1. Klicken Sie auf den Upload-Bereich oder ziehen Sie Ihre Präsentationsdateien per Drag & Drop hinein.
2. Prüfen Sie die Dateiliste. Fügen Sie weitere Dateien hinzu oder entfernen Sie welche.
3. Klicken Sie auf **In PDF umwandeln**. Die LibreOffice-Engine wird bei der ersten Nutzung geladen und wandelt dann jede Datei um.
4. Eine einzelne Datei wird direkt als PDF heruntergeladen. Mehrere Dateien werden in `powerpoint-converted.zip` gepackt.

## Optionen

Dieses Werkzeug hat keine zusätzlichen Einstellungen. Folien werden in ihren Originalmaßen dargestellt.

## Ausgabe

| Anzahl der Eingaben | Ausgabe                                                                 |
| :------------------ | :---------------------------------------------------------------------- |
| 1 Datei             | Einzelner PDF-Download (ursprünglicher Dateiname mit der Endung `.pdf`) |
| 2+ Dateien          | ZIP-Archiv (`powerpoint-converted.zip`) mit einer PDF pro Datei         |

## Anwendungsfälle

- Eine Präsentation vor dem Teilen in PDF umwandeln, wenn das Publikum eventuell kein PowerPoint hat
- Eine druckbare Handout-Version einer Foliensammlung für eine Konferenz oder einen Workshop erstellen
- Präsentationen in einem Format archivieren, das auf jedem Gerät identisch aussieht
- Eine Sammlung von ODP-Präsentationen aus LibreOffice Impress stapelweise in PDF umwandeln
- Eine PDF-Version eines Pitch Decks als E-Mail-Anhang erstellen

## Tipps

- Folienanimationen und Übergänge werden in der PDF nicht abgebildet. Jede Folie wird als statische Seite erfasst.
- Eingebettete Videos erscheinen nicht in der Ausgabe. Ersetzen Sie sie bei Bedarf durch einen Screenshot oder ein Platzhalterbild.
- Sprechernotizen sind im Standard-PDF-Export nicht enthalten. Wenn Sie Notizen brauchen, exportieren Sie zuerst über die native Ansicht "Notizen drucken" in PowerPoint.
- Die LibreOffice-Engine wird nach dem ersten Laden zwischengespeichert, daher geht die Umwandlung einer zweiten Präsentation in derselben Sitzung deutlich schneller.

## Verwandte Werkzeuge

- [Word zu PDF](./word-to-pdf)
- [Excel zu PDF](./excel-to-pdf)
- [Bilder zu PDF](./image-to-pdf)

---
title: BMP zu PDF
description: Konvertieren Sie BMP-Bitmap-Bilder direkt im Browser in das PDF-Format, ohne Upload auf einen Server.
---

# BMP zu PDF

Konvertieren Sie Windows-Bitmap-Dateien (BMP) in PDF. BMP ist ein unkomprimiertes Bildformat, das noch in Altsystemen, der medizinischen Bildgebung und bei Industrie-Scannern zu finden ist. Dieses Werkzeug wandelt sie in PDF um, ohne dass Sie etwas installieren müssen.

## Unterstützte Formate

| Format | Erweiterungen |
| :----- | :------------ |
| BMP    | `.bmp`        |

## So funktioniert es

1. Klicken Sie auf den Upload-Bereich oder ziehen Sie Ihre BMP-Dateien hinein.
2. Prüfen Sie die Dateiliste. Fügen Sie weitere Dateien hinzu oder entfernen Sie unerwünschte.
3. Klicken Sie auf **In PDF konvertieren**. Die Ausgabe wird als `from_bmps.pdf` heruntergeladen.

Jede BMP wird auf ein Canvas gezeichnet, als PNG exportiert und dann mit pdf-lib in das PDF eingebettet. Die Seitengröße entspricht den ursprünglichen Bildabmessungen.

## Optionen

Dieses Werkzeug bietet keine zusätzlichen Qualitätseinstellungen. Bilder werden in ihrer ursprünglichen Auflösung als verlustfreies PNG im PDF eingebettet.

## Anwendungsfälle

- Ältere gescannte Dokumente, die als BMP gespeichert sind, in Archiv-PDFs umwandeln
- BMP-Screenshots älterer Windows-Anwendungen in teilbare Dokumente verwandeln
- Ausgaben von medizinischen oder industriellen Scannern verarbeiten, die standardmäßig BMP erzeugen
- Alte Bildarchive in ein portableres Format überführen

## Tipps

- BMP-Dateien sind unkomprimiert und daher oft groß. Das resultierende PDF ist deutlich kleiner, da die Bilder intern als PNG neu kodiert werden.
- Wenn Sie BMP-Dateien zusammen mit anderen Bildformaten haben, nutzen Sie das Werkzeug [Bilder zu PDF](./image-to-pdf), um alles in einem Stapel zu konvertieren.

## Verwandte Werkzeuge

- [Bilder zu PDF](./image-to-pdf)
- [PNG zu PDF](./png-to-pdf)
- [TIFF zu PDF](./tiff-to-pdf)

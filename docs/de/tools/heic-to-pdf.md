---
title: HEIC zu PDF
description: Wandeln Sie HEIC- und HEIF-Bilder von iPhones und iPads direkt im Browser in PDF um.
---

# HEIC zu PDF

Wandeln Sie HEIC/HEIF-Bilder in PDF um. HEIC ist seit iOS 11 das Standard-Fotoformat auf iPhones und iPads. Mit diesem Werkzeug machen Sie aus diesen Fotos PDFs, ohne Desktop-Software zu installieren oder Dateien auf einen Server hochzuladen.

## Unterstützte Formate

| Format | Erweiterungen |
| :----- | :------------ |
| HEIC   | `.heic`       |
| HEIF   | `.heif`       |

## So funktioniert es

1. Klicken Sie auf den Upload-Bereich oder ziehen Sie Ihre HEIC/HEIF-Dateien per Drag & Drop hinein.
2. Prüfen Sie die Dateiliste und entfernen Sie unerwünschte Dateien.
3. Klicken Sie auf **In PDF umwandeln**. Das Ergebnis wird als `from_heic.pdf` heruntergeladen.

Jede HEIC-Datei wird mit der Bibliothek heic2any dekodiert, die sie mit 92 % Qualität in PNG umwandelt. Das PNG wird dann mit pdf-lib in die PDF eingebettet, jedes Bild auf einer eigenen Seite in voller Auflösung.

## Optionen

Dieses Werkzeug bietet keine zusätzlichen Einstellungen. HEIC-Bilder werden vor dem Einbetten in hoher Qualität (0,92) in PNG umgewandelt.

## Anwendungsfälle

- Aus iPhone-Fotos eine PDF für eine Versicherungsmeldung oder einen Bericht erstellen
- HEIC-Fotos für ein Immobilienexposé in ein einziges druckbares Dokument umwandeln
- iPad-Screenshots (HEIF-Format) in eine teilbare PDF verwandeln
- Urlaubsfotos für ein Reisetagebuch im Stapel umwandeln

## Tipps

- Die HEIC-Dekodierung läuft vollständig im Browser mit WebAssembly. Die erste Umwandlung kann einen Moment dauern, während der Decoder geladen wird.
- Wenn Sie HEIC mit anderen Bildformaten (JPG, PNG usw.) mischen wollen, nutzen Sie das Werkzeug [Bilder zu PDF](./image-to-pdf), das HEIC zusammen mit allen anderen Formaten verarbeitet.
- HEIC-Dateien von iPhones enthalten oft EXIF-Daten einschließlich GPS-Koordinaten. Die PDF-Ausgabe übernimmt diese Metadaten nicht.

## Verwandte Werkzeuge

- [Bilder zu PDF](./image-to-pdf)
- [JPG zu PDF](./jpg-to-pdf)
- [PNG zu PDF](./png-to-pdf)

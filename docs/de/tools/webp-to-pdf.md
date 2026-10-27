---
title: WebP zu PDF
description: Konvertieren Sie WebP-Bilder direkt in Ihrem Browser in das PDF-Format, mit einstellbarer Kompressionsqualität.
---

# WebP zu PDF

Konvertieren Sie das WebP-Bildformat von Google in PDF. Das ist besonders nützlich, wenn Sie Bilder aus dem Web im WebP-Format heruntergeladen haben und sie zum Drucken oder Teilen in einem allgemein akzeptierten Format benötigen.

## Unterstützte Formate

| Format | Erweiterungen |
| :----- | :------------ |
| WebP   | `.webp`       |

## So funktioniert es

1. Klicken Sie auf den Upload-Bereich oder ziehen Sie Ihre WebP-Dateien per Drag-and-drop hinein.
2. Prüfen Sie die Dateiliste und entfernen Sie nicht benötigte Dateien.
3. Wählen Sie eine **PDF-Qualität**.
4. Klicken Sie auf **In PDF konvertieren**. Die Ausgabe wird als `from_webps.pdf` heruntergeladen.

Intern wird jedes WebP-Bild über die Canvas-API des Browsers dekodiert und dann mit pdf-lib in die PDF eingebettet. Die Konvertierung funktioniert daher in jedem Browser, der WebP-Dekodierung unterstützt (alle modernen Browser tun das).

## Optionen

Die **PDF-Qualität** steuert die Kompression beim Einbetten der Bilder:

- **Hohe Qualität**: bewahrt die meisten Details.
- **Mittlere Qualität** (Standard): ausgewogene Ausgabe.
- **Niedrige Qualität**: kleinste Dateigröße.

## Anwendungsfälle

- Aus dem Web heruntergeladene Bilder im WebP-Format in eine druckbare PDF umwandeln
- WebP-Screenshots aus Chrome oder Edge für eine Dokumentation bündeln
- Ein PDF-Portfolio aus Bildern erstellen, die Design-Tools standardmäßig als WebP exportieren
- WebP-Bilder in einem allgemeiner lesbaren Format archivieren

## Tipps

- WebP wird vor dem Einbetten in die PDF intern in PNG dekodiert, sodass verlustfreie WebP-Bilder bei der Einstellung „Hoch“ ihre Qualität behalten.
- Wenn Sie eine Mischung aus WebP und anderen Bildformaten haben, verwenden Sie stattdessen das Tool [Bilder zu PDF](./image-to-pdf), das alles in einem Durchgang akzeptiert.

## Verwandte Tools

- [Bilder zu PDF](./image-to-pdf)
- [PNG zu PDF](./png-to-pdf)
- [JPG zu PDF](./jpg-to-pdf)

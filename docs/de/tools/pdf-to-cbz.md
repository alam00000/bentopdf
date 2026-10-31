---
title: PDF zu CBZ
description: Wandeln Sie ein PDF in eine CBZ-Datei (Comic Book Archive) für Comic-Reader wie Komga, Kavita, CDisplayEx und Calibre um.
---

# PDF zu CBZ

Wandelt ein PDF in eine CBZ-Datei (Comic Book ZIP) um, das Standardformat für digitale Comics und Manga. Jede PDF-Seite wird zu einem Bild im Archiv. Das Werkzeug erzeugt Metadaten in drei Formaten für maximale Kompatibilität: ComicInfo.xml, metadata.opf und ComicBookInfo JSON.

## So funktioniert es

1. Laden Sie ein PDF hoch, indem Sie auf die Ablagefläche klicken oder eine Datei darauf ziehen.
2. Wählen Sie Bildformat, Qualität, Maßstab und optionale Metadaten.
3. Klicken Sie auf **Umwandeln**, um die CBZ-Datei zu erzeugen.
4. Die `.cbz`-Datei wird automatisch heruntergeladen.

## Optionen

| Option              | Werte           | Standard | Beschreibung                                                                               |
| ------------------- | --------------- | -------- | ------------------------------------------------------------------------------------------ |
| Bildformat          | JPEG, PNG, WebP | JPEG     | JPEG für Farbcomics, PNG für verlustfreie Schwarzweiß-Manga, WebP für beste Komprimierung. |
| Qualität            | 50–100%         | 85%      | Steuert die JPEG/WebP-Komprimierung. Bei PNG ausgeblendet (immer verlustfrei).             |
| Maßstab             | 1.0x–4.0x       | 2.0x     | Ein höherer Maßstab erzeugt schärfere Bilder für hochauflösende Bildschirme.               |
| Graustufen          | An/Aus          | Aus      | Wandelt Seiten in Graustufen um. Verringert die Dateigröße bei Schwarzweiß-Inhalten.       |
| Manga-Modus         | An/Aus          | Aus      | Setzt die Leserichtung von rechts nach links in den Metadaten.                             |
| Metadaten einbinden | An/Aus          | An       | Bettet ComicInfo.xml, metadata.opf und ComicBookInfo JSON ein.                             |

## Metadatenfelder

Wenn Metadaten aktiviert sind, können Sie ausfüllen:

- **Titel**: Wird automatisch aus dem PDF-Dateinamen erkannt.
- **Serie**: Der Name der Serie (z. B. "Naruto").
- **Nummer (#)**: Ausgabennummer innerhalb der Serie.
- **Band (Bd.)**: Bandnummer.
- **Autor(en)**: Name des Autors oder Urhebers.
- **Verlag**: Veröffentlichendes Unternehmen.
- **Tags / Genre**: Durch Kommas getrennte Tags (z. B. "Action, Abenteuer").
- **Erscheinungsjahr**: Jahr der Veröffentlichung (1900–2100).
- **Bewertung**: Community-Bewertung von 0 bis 5.

## Metadaten-Kompatibilität

Das Werkzeug schreibt Metadaten in drei Formaten, damit jeder Reader sie findet:

| Format             | Ort               | Unterstützt von                             |
| ------------------ | ----------------- | ------------------------------------------- |
| ComicInfo.xml      | Datei im ZIP      | Komga, Kavita, CDisplayEx, Mylar, ComicRack |
| metadata.opf       | Datei im ZIP      | Calibre                                     |
| ComicBookInfo JSON | ZIP-Kommentarfeld | Calibre (Ersatzlösung)                      |

## Ausgabeformat

- `filename.cbz`: Ein ZIP-Archiv mit nummerierten Seitenbildern und Metadatendateien.

Seitenbilder werden mit führenden Nullen nummeriert (`01.jpg`, `02.jpg` usw.), damit Reader sie in der richtigen Reihenfolge anzeigen.

## Anwendungsfälle

- Manga- oder Comic-PDFs für die Nutzung mit Comic-Readern umwandeln.
- Eine digitale Comic-Bibliothek in Komga, Kavita oder Calibre aufbauen.
- Gescannte Comics in ein Reader-freundliches Format umwandeln.
- Comics in einem Format teilen, das Leserichtung und Metadaten erhält.

## Tipps

- Nutzen Sie **JPEG** für Farbcomics und **PNG** für Schwarzweiß-Manga, denn PNG komprimiert Schwarzweiß-Inhalte sehr effizient.
- Aktivieren Sie **Graustufen** bei Manga, um die Dateigröße deutlich zu verringern.
- Füllen Sie die Felder **Serie** und **Nummer** aus, damit Bibliotheksverwaltungen (Komga, Calibre) Ihre Sammlung automatisch organisieren können.
- **WebP** bietet die beste Komprimierung, aber ältere Comic-Reader unterstützen es möglicherweise nicht.

## Verwandte Werkzeuge

- [PDF zu JPG](./pdf-to-jpg)
- [PDF zu PNG](./pdf-to-png)
- [PDF zu TIFF](./pdf-to-tiff)
- [Bilder extrahieren](./extract-images)

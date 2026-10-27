---
title: PDF zu Text
description: Extrahieren Sie reinen Textinhalt aus PDF-Dateien. Unterstützt die Stapelextraktion mehrerer PDFs mit Ausgabe als TXT-Dateien.
---

# PDF zu Text

Extrahiert den gesamten Textinhalt aus PDF-Dateien und speichert ihn als reine `.txt`-Dateien. Unterstützt die Stapelverarbeitung: Laden Sie mehrere PDFs hoch und lassen Sie den Text jedes einzelnen in einem Vorgang extrahieren. Basiert auf PyMuPDF.

## So funktioniert es

1. Laden Sie ein oder mehrere PDFs hoch, indem Sie auf die Ablagefläche klicken oder Dateien darauf ziehen. Verwalten Sie Ihre Dateiliste mit den Schaltflächen Weitere hinzufügen und Leeren.
2. Klicken Sie auf **Extrahieren**, um die Verarbeitung zu starten.
3. Eine einzelne Datei wird als `filename.txt` heruntergeladen. Mehrere Dateien ergeben ein Archiv `pdf-to-text.zip`.

## Optionen

Dieses Werkzeug hat keine einstellbaren Optionen. Der gesamte Textinhalt wird von jeder Seite in Lesereihenfolge extrahiert.

## Ausgabeformat

- **Einzelne Datei**: `filename.txt`
- **Mehrere Dateien**: `pdf-to-text.zip` mit einer `.txt` pro Eingabe-PDF.

## Anwendungsfälle

- Fließtext aus PDF-Berichten für die Volltextsuche-Indizierung extrahieren.
- PDF-E-Books oder Artikel zum Lesen auf E-Ink-Geräten in reinen Text umwandeln.
- Text aus Verträgen oder Rechtsdokumenten für die Stichwortanalyse gewinnen.
- Formatierung aus PDFs entfernen, um sauberen Text für Datenverarbeitungsskripte zu erhalten.
- Einen Textkorpus aus PDF-Archiven für die Verarbeitung natürlicher Sprache vorbereiten.

## Tipps

- Gescannte PDFs (nur Bild) erzeugen leere Textdateien, da keine Textebene zum Extrahieren vorhanden ist. Schicken Sie gescannte Dokumente zuerst durch OCR.
- Die Ausgabe erhält die Lesereihenfolge, wie PyMuPDF sie interpretiert, die im Allgemeinen von links nach rechts und von oben nach unten verläuft. Mehrspaltige Layouts können verschachtelten Text erzeugen.
- Für strukturierte Ausgabe mit Überschriften und Formatierung probieren Sie [PDF zu Markdown](./pdf-to-markdown). Für KI-taugliches strukturiertes JSON nutzen Sie [PDF für KI vorbereiten](./prepare-pdf-for-ai).

## Verwandte Werkzeuge

- [PDF zu Markdown](./pdf-to-markdown)
- [PDF für KI vorbereiten](./prepare-pdf-for-ai)
- [PDF zu Word](./pdf-to-word)

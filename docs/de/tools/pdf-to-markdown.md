---
title: PDF zu Markdown
description: Wandeln Sie PDF-Dokumente in das Markdown-Format um, optional mit Bildextraktion. Unterstützt die Stapelumwandlung mehrerer Dateien.
---

# PDF zu Markdown

Wandelt PDF-Dateien in das Markdown-Format (`.md`) um und erhält dabei Überschriften, Absätze, Listen und einfache Formatierung. Optional werden eingebettete Bilder extrahiert und eingebunden. Unterstützt die Umwandlung einzelner Dateien und im Stapel. Basiert auf PyMuPDF.

## So funktioniert es

1. Laden Sie ein oder mehrere PDFs hoch, indem Sie auf die Ablagefläche klicken oder Dateien darauf ziehen.
2. Aktivieren Sie optional **Bilder einbinden**, um extrahierte Bilder in die Markdown-Ausgabe einzubetten.
3. Klicken Sie auf **Umwandeln**, um die Verarbeitung zu starten.
4. Eine einzelne Datei wird als `filename.md` heruntergeladen. Mehrere Dateien ergeben eine `markdown-files.zip`.

## Optionen

- **Bilder einbinden**: Wenn aktiviert, werden eingebettete Bilder aus dem PDF extrahiert und in der Markdown-Ausgabe referenziert. Wenn deaktiviert, wird nur der Textinhalt umgewandelt.

## Ausgabeformat

- **Einzelne Datei**: `filename.md`
- **Mehrere Dateien**: `markdown-files.zip` mit einer `.md` pro Eingabe-PDF.

## Anwendungsfälle

- PDF-Dokumentation in Markdown für einen Static-Site-Generator wie VitePress, Hugo oder Jekyll umwandeln.
- PDF-Forschungsarbeiten in bearbeitbares Markdown für Notiz-Apps wie Obsidian überführen.
- Alte PDF-Wissensdatenbanken in ein Git-freundliches Textformat migrieren.
- Strukturierte Inhalte aus PDF-E-Books zur Neuformatierung extrahieren.

## Tipps

- Die Option Bilder einbinden ist nützlich, wenn das PDF Diagramme oder Abbildungen enthält, die für den Inhalt wichtig sind. Deaktivieren Sie sie bei textlastigen Dokumenten, damit die Ausgabe sauber bleibt.
- Komplexe Layouts mit Seitenleisten, Fußnoten oder mehrspaltigem Text können unvollkommenes Markdown erzeugen. Prüfen Sie die Ausgabe und passen Sie sie bei Bedarf an.
- Für reinen Text ohne Formatierung nutzen Sie stattdessen [PDF zu Text](./pdf-to-text).

## Verwandte Werkzeuge

- [PDF zu Text](./pdf-to-text)
- [PDF zu Word](./pdf-to-word)
- [PDF für KI vorbereiten](./prepare-pdf-for-ai)

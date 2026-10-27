---
title: PDF zu Word
description: Wandeln Sie PDF-Dateien in bearbeitbare Word-Dokumente (DOCX) um. Unterstützt die Stapelumwandlung mehrerer PDFs auf einmal.
---

# PDF zu Word

Wandelt PDF-Dateien in bearbeitbare Word-Dokumente (`.docx`) um. Das Werkzeug nutzt PyMuPDF, um den Dokumentinhalt zu rekonstruieren, und erhält Text, einfache Formatierung und Layout. Unterstützt die Umwandlung einzelner Dateien und im Stapel.

## So funktioniert es

1. Laden Sie ein oder mehrere PDFs hoch, indem Sie auf die Ablagefläche klicken oder Dateien darauf ziehen. Sie können weitere Dateien hinzufügen oder einzelne aus der Liste entfernen.
2. Klicken Sie auf **Umwandeln**, um die Verarbeitung zu starten.
3. Eine einzelne Datei wird als `filename.docx` heruntergeladen. Mehrere Dateien werden in `converted-documents.zip` gepackt.

## Optionen

Dieses Werkzeug hat keine einstellbaren Optionen. Jedes PDF wird mit der integrierten Umwandlungs-Engine von PyMuPDF in DOCX umgewandelt.

## Ausgabeformat

- **Einzelne Datei**: `filename.docx`
- **Mehrere Dateien**: `converted-documents.zip` mit einer `.docx` pro Eingabe-PDF.

## Anwendungsfälle

- Text in einem erhaltenen PDF bearbeiten, das Sie ändern müssen.
- Archivierte PDF-Berichte in ein Format umwandeln, das Kollegen in Microsoft Word oder Google Docs bearbeiten können.
- Inhalte aus PDF-Verträgen oder Angeboten zur Überarbeitung mit Änderungsverfolgung in Word übernehmen.
- Alte PDF-Dokumentation in ein bearbeitbares Format migrieren.

## Tipps

- Komplexe Layouts mit mehrspaltigem Text, eingebetteten Formularen oder vielen Grafiken werden möglicherweise nicht perfekt umgewandelt. Prüfen Sie die Ausgabe und passen Sie die Formatierung in Ihrer Textverarbeitung an.
- Gescannte PDFs (nur Bild) erzeugen leere oder minimale DOCX-Dateien. Schicken Sie sie zuerst durch OCR, um eine Textebene hinzuzufügen.
- Der Stapelmodus ist effizient, um ganze Ordner voller PDFs umzuwandeln: Laden Sie sie alle auf einmal hoch.

## Verwandte Werkzeuge

- [PDF zu Text](./pdf-to-text)
- [PDF zu Markdown](./pdf-to-markdown)
- [PDF-Workflow-Builder](./pdf-workflow)

---
title: PDF für KI vorbereiten
description: Extrahieren Sie PDF-Inhalte in strukturiertes JSON, optimiert für LLMs und KI-Pipelines wie LlamaIndex. Unterstützt Stapelverarbeitung.
---

# PDF für KI vorbereiten

Extrahiert Inhalte aus PDF-Dateien und strukturiert sie als JSON, optimiert für die Verarbeitung durch große Sprachmodelle (LLMs) und KI-Frameworks wie LlamaIndex. Der Inhalt jeder Seite wird extrahiert und in ein strukturiertes Format gebracht, das für RAG-Pipelines, Chatbots oder semantische Suchsysteme bereit ist.

## So funktioniert es

1. Laden Sie eine oder mehrere PDFs hoch, indem Sie auf die Ablagefläche klicken oder Dateien darauf ziehen.
2. Klicken Sie auf **Extrahieren**, um die Verarbeitung zu starten.
3. Eine einzelne Datei wird als `filename_llm.json` heruntergeladen. Bei mehreren Dateien entsteht ein Archiv `pdf-for-ai.zip`.

Das Werkzeug nutzt die LlamaIndex-Integration von PyMuPDF, um Inhalte seitenweise mit Metadaten zu extrahieren. Die Ausgabe lässt sich direkt in KI-Frameworks laden.

## Optionen

Dieses Werkzeug hat keine einstellbaren Optionen. Alle Seiten werden mit vollständigem Text und Metadaten extrahiert.

## Ausgabeformat

- **Einzelne Datei**: `filename_llm.json`
- **Mehrere Dateien**: `pdf-for-ai.zip` mit einer `_llm.json` pro Eingabe-PDF.

Die JSON-Ausgabe folgt dem LlamaIndex-Dokumentschema mit Textinhalt und Metadatenfeldern pro Seite.

## Anwendungsfälle

- PDF-Dokumente für Retrieval-Augmented-Generation-Pipelines (RAG) vorbereiten.
- Aus PDF-Archiven eine durchsuchbare Wissensdatenbank für einen KI-Chatbot aufbauen.
- PDF-Berichte in LLM-basierte Analyse-Workflows einspeisen.
- Forschungsarbeiten für semantische Suche und Frage-Antwort-Systeme vorverarbeiten.
- Aus PDF-Dokumentsammlungen strukturierte Trainingsdaten erzeugen.

## Tipps

- Für reine Textextraktion ohne KI-spezifische Formatierung nutzen Sie [PDF zu Text](./pdf-to-text).
- Für Markdown-Ausgabe, die Überschriften und Struktur erhält, nutzen Sie [PDF zu Markdown](./pdf-to-markdown).
- Gescannte PDFs liefern leere oder minimale Ausgaben. Führe sie vor der Extraktion durch OCR, um eine Textebene hinzuzufügen.

## Verwandte Werkzeuge

- [PDF zu Text](./pdf-to-text)
- [PDF zu Markdown](./pdf-to-markdown)
- [PDF zu JSON](./pdf-to-json)

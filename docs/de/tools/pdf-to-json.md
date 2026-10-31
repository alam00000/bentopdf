---
title: PDF zu JSON
description: Wandeln Sie PDF-Dateien mit CPDF in strukturiertes JSON um. Exportiert die interne PDF-Struktur als maschinenlesbare JSON-Daten.
---

# PDF zu JSON

Wandelt eine oder mehrere PDF-Dateien in das JSON-Format um. Das Werkzeug nutzt CPDF (Coherent PDF), um die interne Struktur jedes PDFs in eine maschinenlesbare JSON-Darstellung zu serialisieren. Die Ausgabe wird immer als ZIP-Archiv geliefert.

## So funktioniert es

1. Wählen Sie eine oder mehrere PDF-Dateien mit der Dateiauswahl.
2. Klicken Sie auf **Umwandeln**, um die Verarbeitung zu starten. Die Umwandlung läuft in einem Web Worker im Hintergrund.
3. Ein ZIP-Archiv mit einer JSON-Datei für jedes Eingabe-PDF wird heruntergeladen.

Die Statusleiste zeigt den Fortschritt der Umwandlung und der ZIP-Erstellung.

## Optionen

Dieses Werkzeug hat keine einstellbaren Optionen. Jedes PDF wird in seine vollständige JSON-Darstellung umgewandelt.

## Ausgabeformat

- Eine Datei `pdfs-to-json.zip` mit `filename.json` für jedes Eingabe-PDF.

Die JSON-Ausgabe stellt die interne Objektstruktur des PDFs dar, einschließlich Seitenbäumen, Schriftverweisen, Metadaten und Inhaltsströmen.

## Anwendungsfälle

- Die interne Struktur eines PDFs zur Fehlersuche oder Validierung untersuchen.
- Strukturierte Metadaten und Seiteneigenschaften programmatisch extrahieren.
- PDF-Strukturdaten in eigene Verarbeitungspipelines einspeisen.
- PDF-Dokumente auf Konformität prüfen, indem man ihre Objektbäume analysiert.

## Tipps

- Dieses Werkzeug gibt die rohe PDF-Objektstruktur aus, nicht den extrahierten Textinhalt. Wenn Sie Seitentext im JSON-Format brauchen, nutzen Sie stattdessen [PDF für KI vorbereiten](./prepare-pdf-for-ai).
- Für reine Textextraktion ist [PDF zu Text](./pdf-to-text) einfacher.
- Große PDFs mit komplexen Strukturen erzeugen sehr große JSON-Dateien.

## Verwandte Werkzeuge

- [PDF zu Text](./pdf-to-text)
- [PDF für KI vorbereiten](./prepare-pdf-for-ai)
- [PDF-Tabellen extrahieren](./extract-tables)

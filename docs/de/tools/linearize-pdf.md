---
title: PDF linearisieren
description: Optimieren Sie PDF-Dateien für schnelles Anzeigen im Web mit progressivem Laden. Auch bekannt als "Fast Web View".
---

# PDF linearisieren

Die Linearisierung ordnet eine PDF so um, dass die erste Seite angezeigt werden kann, bevor die gesamte Datei heruntergeladen ist. Adobe nennt das "Fast Web View". Wenn Sie PDFs auf einer Website hosten oder über ein Dokumentenportal bereitstellen, wirken sie durch die Linearisierung deutlich schneller beim Öffnen.

## So funktioniert es

1. Laden Sie eine oder mehrere PDF-Dateien hoch.
2. Klicken Sie auf **PDF(s) linearisieren**.
3. Laden Sie die Ergebnisse als ZIP-Archiv mit allen linearisierten Dateien herunter.

Es gibt keine Einstellungen. Das Werkzeug nutzt das Flag `--linearize` von QPDF, das die interne Struktur der PDF umordnet, ohne den sichtbaren Inhalt zu verändern.

## Was die Linearisierung bewirkt

- Ordnet PDF-Objekte so um, dass die Daten der ersten Seite am Anfang der Datei stehen
- Fügt ein Linearisierungswörterbuch und Hinweistabellen hinzu, damit Viewer wissen, wo sich jede Seite befindet
- Ermöglicht Byte-Range-Anfragen: Ein Browser kann nur die erste Seite abrufen, ohne die ganze Datei herunterzuladen
- Bereinigt die Querverweistabelle für effizienten wahlfreien Zugriff

## Funktionen

- Stapelverarbeitung mehrerer PDFs in einem Vorgang
- Die Ausgabe erhält alle Inhalte, Schriften, Bilder und interaktiven Elemente
- Nutzt QPDF (WebAssembly) für zuverlässige, standardkonforme Linearisierung
- Die Ergebnisse werden für einen einfachen Download in ein ZIP gepackt

## Anwendungsfälle

- PDF-Berichte auf einer Website hosten, wo Nutzende eine sofortige Seitenanzeige erwarten
- PDFs in Webanwendungen mit Viewern im Browser einbetten
- PDF-Kataloge oder Handbücher veröffentlichen, die über langsame Mobilfunkverbindungen abgerufen werden
- Dokumente für Content Delivery Networks (CDNs) vorbereiten, die Byte-Range-Auslieferung unterstützen

## Tipps

- Linearisieren Sie erst, wenn alle anderen Änderungen abgeschlossen sind. Jede spätere Änderung (Zusammenführen, Seiten hinzufügen) hebt die Linearisierung auf.
- Kombinieren Sie das Werkzeug mit PDF komprimieren für die kleinsten und am schnellsten ladenden PDFs.
- Die Linearisierung erhöht die Dateigröße geringfügig (typischerweise unter 1 %).

## Verwandte Werkzeuge

- [PDF komprimieren](./compress-pdf): Dateigröße vor dem Linearisieren verringern
- [PDF reparieren](./repair-pdf): Strukturprobleme beheben, die die Linearisierung verhindern
- [Metadaten entfernen](./remove-metadata): Metadaten vor der Veröffentlichung im Web entfernen

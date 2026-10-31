---
title: Lesezeichen bearbeiten
description: Fügen Sie PDF-Lesezeichen hinzu, bearbeiten Sie, importiere, exportieren Sie und löschen Sie sie mit einem visuellen Editor und CSV/JSON-Unterstützung.
---

# Lesezeichen bearbeiten

Der Lesezeichen-Editor gibt Ihnen volle Kontrolle über die Navigationslesezeichen einer PDF (auch Gliederung genannt). Sie können neue Lesezeichen hinzufügen, vorhandene bearbeiten, die Hierarchie umordnen und Lesezeichendaten im CSV- und JSON-Format importieren oder exportieren.

## So funktioniert es

1. Laden Sie Ihre PDF hoch, indem Sie auf die Ablagefläche klicken oder eine Datei hineinziehen.
2. Aktivieren Sie optional **Vorhandene Lesezeichen automatisch extrahieren**, um die aktuelle Lesezeichenstruktur des Dokuments zu übernehmen.
3. Der Editor öffnet sich in geteilter Ansicht: PDF-Viewer links, Lesezeichen-Bereich rechts.
4. Geben Sie einen Lesezeichentitel ein und klicken Sie auf **Zur Seite hinzufügen**, um ein neues Lesezeichen für die aktuelle Seite zu erstellen.
5. Mit den Schaltflächen der Symbolleiste können Sie Lesezeichen verschieben, formatieren oder löschen.
6. Klicken Sie auf **PDF mit Lesezeichen speichern**, um die aktualisierte Datei herunterzuladen.

## Funktionen

- Visueller PDF-Viewer mit Seitennavigation, Zoom und Eingabefeld zum Springen zu einer Seite
- Lesezeichen mit einem Klick zu jeder Seite hinzufügen
- Direkt in die PDF klicken, um ein exaktes Lesezeichenziel zu setzen (Auswahlmodus)
- Verschachtelte Lesezeichenhierarchie mit Neuordnung per Drag-and-drop
- Stapelvorgänge: mehrere Lesezeichen auswählen und Farbe oder Stil ändern oder alle auf einmal löschen
- Lesezeichensuche, um Einträge in großen Strukturen schnell zu finden
- Rückgängig und Wiederherstellen für alle Änderungen
- Lesezeichen aus CSV-Dateien (Titel, Seite, Ebene) oder JSON-Dateien importieren
- Lesezeichen für die externe Bearbeitung als CSV oder JSON exportieren
- Lesezeichenformatierung: Farbe (rot, blau, grün, gelb, violett) und Schriftstil (fett, kursiv, fett kursiv)
- Schnelle Navigation: mit den Tasten Bild auf/Bild ab durch die Seiten blättern

## Optionen

- **Vorhandene Lesezeichen automatisch extrahieren**: Wenn aktiviert, liest das Werkzeug die aktuellen Lesezeichen der PDF beim Laden aus und zeigt sie an.
- **Stapelmodus**: Schalten Sie ihn ein, um mehrere Lesezeichen auszuwählen und Farbe, Stil oder Löschen gesammelt anzuwenden.
- **Alle ein-/ausklappen**: Verschachtelte untergeordnete Lesezeichen schnell ein- oder ausblenden.

## Anwendungsfälle

- Ein Inhaltsverzeichnis zu einem Lehrbuch oder Handbuch ohne Lesezeichen hinzufügen
- Lesezeichen in einem gescannten Dokument nach der OCR-Verarbeitung neu strukturieren
- Lesezeichen als CSV exportieren, in einer Tabellenkalkulation bearbeiten und wieder importieren
- Automatisch erzeugte Lesezeichen mit falschen Seitenverweisen bereinigen
- Farbige Lesezeichen hinzufügen, um wichtige Abschnitte in einem Schriftsatz zu markieren

## Tipps

- Nutzen Sie den CSV-Import für das Erstellen vieler Lesezeichen. Das Format ist einfach: `title,page,level`, wobei Ebene 1 die oberste Ebene ist.
- Im Auswahlmodus können Sie eine exakte Stelle auf der PDF-Seite anklicken, um das Lesezeichenziel zu setzen. Das ist genauer als nur eine Seitenzahl anzugeben.
- Exportieren Sie Ihre Lesezeichen vor größeren Änderungen, damit Sie eine Sicherung haben.

## Verwandte Werkzeuge

- [Inhaltsverzeichnis](./table-of-contents)
- [PDF-Editor](./edit-pdf)
- [Seitenbeschriftungen hinzufügen](./add-page-labels)

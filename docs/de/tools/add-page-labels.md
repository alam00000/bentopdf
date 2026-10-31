---
title: Seitenbeschriftungen hinzufügen
description: Fügen Sie PDF-Seitenbezeichnungen mit römischen Ziffern, Buchstabenpräfixen, eigener Nummerierung und mehreren Regeln pro Dokument hinzu.
---

# Seitenbeschriftungen hinzufügen

Seitenbezeichnungen legen fest, wie Seitenzahlen in PDF-Viewern angezeigt werden (die Zahl in der Symbolleiste, nicht auf der Seite aufgedruckt). Mit diesem Werkzeug können Sie verschiedenen Seitenbereichen unterschiedliche Bezeichnungsschemata zuweisen: römische Ziffern für den Vorspann, Dezimalzahlen für den Hauptteil, Anhänge mit Buchstaben und mehr.

## So funktioniert es

1. Laden Sie Ihre PDF-Datei hoch.
2. Das Optionsfeld erscheint mit einer Bezeichnungsregel als Standard.
3. Konfigurieren Sie jede Regel mit Seitenbereich, Stil, optionalem Präfix und Startwert.
4. Klicken Sie auf **Regel hinzufügen**, um weitere Regeln für andere Abschnitte zu erstellen.
5. Klicken Sie auf **Seitenbezeichnungen hinzufügen**, um alle Regeln anzuwenden und das Ergebnis herunterzuladen.

## Optionen

Jede Bezeichnungsregel hat diese Einstellungen:

- **Seitenbereich** -- Auf welche Seiten die Regel angewendet wird. Leer lassen für alle Seiten. Unterstützt Bereiche wie `1-4`, `7`, `odd` oder `1-9,30-40`.
- **Bezeichnungsstil** -- Dezimale arabische Ziffern, römische Kleinbuchstaben (i, ii, iii), römische Großbuchstaben (I, II, III), Kleinbuchstaben (a, b, c), Großbuchstaben (A, B, C) oder keine Bezeichnung (nur Präfix).
- **Bezeichnungspräfix** -- Optionaler Text, der jeder Bezeichnung vorangestellt wird, etwa "A-", um Bezeichnungen wie A-1, A-2, A-3 zu erzeugen.
- **Startwert** -- Die Zahl, ab der gezählt wird. Standard ist 1. Auf 0 setzen für eine bei null beginnende Nummerierung.
- **Nummerierung über getrennte Bereiche fortsetzen** -- Aktivieren Sie dies, wenn eine Regel nicht zusammenhängende Seiten betrifft (wie `1-9,30-40` oder `odd`) und die Nummerierung fortlaufend weitergehen soll.
- **Vorhandene Seitenbezeichnungen entfernen** -- Standardmäßig aktiviert. Löscht alle früheren Bezeichnungen, bevor Ihre neuen Regeln angewendet werden.

## Funktionen

- Mehrere Bezeichnungsregeln pro Dokument für komplexe Nummerierungsschemata
- Sechs Bezeichnungsstile für alle gängigen Nummerierungssysteme
- Eigene Präfixe für abschnittsbasierte Bezeichnungen
- Unterstützung getrennter Bereiche mit fortlaufender Nummerierung
- Vorhandene Bezeichnungen wahlweise beibehalten oder entfernen

## Anwendungsfälle

- Römische Ziffern (i, ii, iii) für das Vorwort eines Buchs und Dezimalzahlen für den Haupttext festlegen
- Anhangseiten mit Buchstabenpräfixen wie "A-1", "A-2", "B-1", "B-2" bezeichnen
- Seitenbezeichnungen in einem gescannten Dokument korrigieren, in dem die gedruckten Seitenzahlen nicht zur PDF-Seitenreihenfolge passen
- Bei null beginnende Nummerierung für technische Dokumente hinzufügen

## Tipps

- Seitenbezeichnungen sind Metadaten, die PDF-Viewer in ihrer Navigationsleiste anzeigen. Sie werden nicht auf die Seite gedruckt. Für sichtbare Zahlen nutzen Sie [Seitenzahlen](./page-numbers).
- Dieses Werkzeug erfordert, dass CoherentPDF (CPDF) in Ihren WASM-Einstellungen konfiguriert ist. Falls nicht, werden Sie aufgefordert, es einzurichten.

## Verwandte Werkzeuge

- [Seitenzahlen](./page-numbers)
- [Bates-Nummerierung](./bates-numbering)
- [Lesezeichen bearbeiten](./bookmark)

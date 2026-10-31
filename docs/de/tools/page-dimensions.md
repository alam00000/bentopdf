---
title: Seitenmaße
description: Analysieren Sie PDF-Seitengrößen, Ausrichtungen, Seitenverhältnisse und Drehung. Erkennen Sie Dokumente mit gemischten Größen und exportieren Sie die Daten als CSV.
---

# Seitenmaße

Ein Diagnosewerkzeug, das jede Seite Ihres PDFs liest und die genauen Maße, Ausrichtung, Standardformat, Seitenverhältnis, Fläche und Drehung angibt. Nützlich, um gemischte Seitengrößen vor dem Drucken zu entdecken oder die Eigenschaften eines erhaltenen PDFs zu dokumentieren.

## So funktioniert es

1. Laden Sie eine PDF-Datei hoch. Die Analyse startet automatisch, Sie müssen keine Schaltfläche drücken.
2. Ein Übersichtsbereich zeigt die Gesamtzahl der Seiten, die Anzahl verschiedener Seitengrößen und ob das Dokument gemischte Größen enthält.
3. Durchsuchen Sie die vollständige Ergebnistabelle mit Details pro Seite.
4. Wechseln Sie die Anzeigeeinheit zwischen Punkt, Zoll, Millimeter oder Pixel.
5. Klicken Sie auf **Als CSV exportieren**, um die Daten zu speichern.

## Angegebene Felder

| Spalte           | Beschreibung                                              |
| ---------------- | --------------------------------------------------------- |
| Seite Nr.        | Fortlaufende Seitenzahl                                   |
| Maße             | Breite x Höhe in der gewählten Einheit                    |
| Standardformat   | Erkannter Name (A4, Letter usw.) oder "Benutzerdefiniert" |
| Ausrichtung      | Hochformat oder Querformat                                |
| Seitenverhältnis | Verhältnis von Breite zu Höhe als Dezimalzahl             |
| Fläche           | Seitenfläche in der gewählten Einheit zum Quadrat         |
| Drehung          | Seitendrehung in Grad                                     |

## Funktionen

- Automatische Erkennung von Standardpapierformaten (A3, A4, A5, Letter, Legal, Tabloid und mehr)
- Warnung bei Dokumenten mit gemischten Größen, mit einer Aufschlüsselung, welche Größen vorkommen und wie viele Seiten sie nutzen
- Einheitenumrechnung zwischen Punkt, Zoll, Millimeter und Pixel (bei 96 PPI)
- CSV-Export für Tabellenkalkulationen oder Dokumentationssysteme

## Anwendungsfälle

- Prüfen, ob alle Seiten A4 sind, bevor ein Dokument an eine Druckerei geht
- Herausfinden, warum ein zusammengeführtes PDF auf bestimmten Seiten mit unerwarteten Rändern gedruckt wird
- Das Seitenlayout eines großen PDF-Archivs für Metadaten dokumentieren
- Gedrehte Seiten erkennen, die korrigiert werden müssen

## Tipps

- Wenn die Übersicht "Gemischte Größen" anzeigt, nutzen Sie das Werkzeug Seitengröße reparieren, um sie vor dem Drucken zu vereinheitlichen.
- Das Drehungsfeld hilft, Seiten zu finden, die korrekt angezeigt werden, aber ein Drehungsattribut ungleich null haben, was in manchen Abläufen Probleme verursachen kann.

## Verwandte Werkzeuge

- [Seitengröße reparieren](./fix-page-size): Seiten vereinheitlichen, nachdem gemischte Größen erkannt wurden
- [PDF komprimieren](./compress-pdf): das PDF optimieren, nachdem Seitenprobleme behoben wurden
- [PDF drehen](./rotate-pdf): gedrehte Seiten korrigieren

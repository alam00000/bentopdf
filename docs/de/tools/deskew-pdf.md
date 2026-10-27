---
title: PDF entzerren
description: Richten Sie schiefe Seiten in gescannten PDFs automatisch mit OpenCV-Schräglagenerkennung gerade. Einstellbarer Schwellenwert und DPI.
---

# PDF entzerren

Gescannte Dokumente sind selten perfekt gerade. Schon eine leichte Neigung macht OCR ungenauer und Ausdrucke unsauber. Dieses Werkzeug nutzt die Bildverarbeitungsalgorithmen von OpenCV, um den Schiefwinkel jeder Seite zu erkennen und sie wieder geradezudrehen.

## So funktioniert es

1. Laden Sie eine oder mehrere gescannte PDFs hoch.
2. Legen Sie den **Schräglagen-Schwellenwert** fest: Seiten mit einer erkannten Schräglage unterhalb dieses Wertes bleiben unverändert.
3. Wählen Sie eine **Verarbeitungsqualität (DPI)**: Höhere DPI verbessert die Erkennungsgenauigkeit, dauert aber länger.
4. Klicken Sie auf **PDF entzerren**.
5. Nach der Verarbeitung zeigt ein Ergebnisbereich für jede Seite den erkannten Winkel und ob sie korrigiert wurde.

## Optionen

| Einstellung                   | Werte                   | Standard |
| ----------------------------- | ----------------------- | -------- |
| **Schräglagen-Schwellenwert** | 0,1, 0,5, 1,0, 2,0 Grad | 0,5      |
| **Verarbeitungs-DPI**         | 100, 150, 200, 300      | 150      |

## Wie die Schräglagenerkennung funktioniert

Das Werkzeug rendert jede Seite mit der gewählten DPI als Bild und erkennt dann mit OpenCV die dominanten Linienwinkel im Inhalt. Überschreitet die erkannte Schräglage den Schwellenwert, wird die Seite um den umgekehrten Winkel gedreht, um sie geradezurichten. Seiten unterhalb des Schwellenwerts werden unverändert durchgereicht.

## Anwendungsfälle

- Stapelweise gescannte Verträge oder Rechtsdokumente aufbereiten
- Gescannte Belege oder Rechnungen für die OCR-Verarbeitung vorbereiten
- Seiten von einem Flachbettscanner geradeziehen, bei dem das Papier uneinheitlich eingelegt wurde
- Die visuelle Qualität digitalisierter Archivmaterialien verbessern

## Tipps

- Senken Sie den Schwellenwert auf 0,1 Grad, wenn Sie für OCR eine pixelgenaue Ausrichtung brauchen.
- 150 DPI ist für die meisten Dokumente schnell und genau. Nutzen Sie 300 DPI für sehr kleinen Text oder Seiten mit feinen Details.
- Das Entzerren funktioniert am besten bei Dokumenten mit klaren horizontalen Textzeilen. Bei Seiten, die überwiegend aus Bildern oder diagonalen Designelementen bestehen, kann es Schwierigkeiten geben.

## Verwandte Werkzeuge

- [PDF rastern](./rasterize-pdf): die entzerrte Ausgabe in eine flache, bildbasierte PDF umwandeln
- [PDF komprimieren](./compress-pdf): die Dateigröße nach dem Entzerren verringern
- [PDF reparieren](./repair-pdf): strukturelle Probleme in gescannten PDFs beheben

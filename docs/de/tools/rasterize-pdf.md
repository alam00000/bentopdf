---
title: PDF rastern
description: Wandeln Sie PDF-Seiten in eine bildbasierte PDF um. Reduzieren Sie alle Ebenen, entfernen Sie auswählbaren Text und steuern Sie DPI und Bildformat.
---

# PDF rastern

Beim Rastern wird jede Seite einer PDF in ein Bild umgewandelt, und diese Bilder werden wieder zu einer PDF zusammengesetzt. Das Ergebnis sieht identisch zum Original aus, enthält aber keinen auswählbaren Text, keine interaktiven Elemente und keine bearbeitbaren Ebenen. Es ist praktisch eine hochwertige Fotokopie.

## So funktioniert es

1. Laden Sie eine oder mehrere PDF-Dateien hoch.
2. Legen Sie die **DPI** (Auflösung) für die gerasterte Ausgabe fest.
3. Wählen Sie ein **Bildformat**: PNG für verlustfreie Qualität oder JPEG für kleinere Dateien.
4. Aktivieren Sie optional **In Graustufen umwandeln**.
5. Klicken Sie auf **PDF rastern**. Mehrere Dateien werden als ZIP heruntergeladen.

## Optionen

| Einstellung    | Werte                             | Standard |
| -------------- | --------------------------------- | -------- |
| **DPI**        | 72, 150, 200, 300, 600            | 150      |
| **Bildformat** | PNG (verlustfrei), JPEG (kleiner) | PNG      |
| **Graustufen** | An/Aus                            | Aus      |

## DPI-Richtwerte

- **72**: nur für die Bildschirmansicht, kleinste Dateigröße
- **150**: gute Balance für den allgemeinen Gebrauch
- **200**: schärferer Text, mittlere Dateigröße
- **300**: Ausgabe in Druckqualität
- **600**: hochwertige Archivierung oder professioneller Druck

## Anwendungsfälle

- Textextraktion aus vertraulichen Dokumenten vor dem Teilen verhindern
- Probleme mit fehlenden Schriftarten beseitigen, indem Text in Pixel umgewandelt wird
- Eine "flache" Version einer PDF mit komplexen Ebenen oder Transparenzen erstellen, die in verschiedenen Viewern unterschiedlich dargestellt wird
- Eine PDF für ein System vorbereiten, das nur bildbasierte Eingaben akzeptiert
- Versteckte Inhalte (wie nachverfolgte Änderungen oder Formulardaten) entfernen, indem die PDF auf reine Bilder reduziert wird

## Tipps

- 150 DPI mit PNG ist ein solider Standard. Gehen Sie nur höher, wenn Sie Druckausgabe brauchen oder feine Details vergrößern wollen.
- JPEG erzeugt deutlich kleinere Dateien, führt aber zu Kompressionsartefakten an scharfen Textkanten.
- Rastern ist nicht umkehrbar. Behalten Sie Ihre Original-PDF, falls Sie später bearbeitbaren Text brauchen.

## Verwandte Werkzeuge

- [PDF komprimieren](./compress-pdf): die Dateigröße der gerasterten PDF verringern
- [PDF entzerren](./deskew-pdf): Seiten gescannter Dokumente vor dem Rastern geraderichten
- [Schriftart zu Umriss](./font-to-outline): Schriften in Vektorpfade umwandeln, wenn Sie die Skalierbarkeit behalten wollen
- [PDF reduzieren](./flatten-pdf): Formulare reduzieren, ohne sie in Bilder umzuwandeln

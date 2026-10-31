---
title: Metadaten entfernen
description: Entfernen Sie alle versteckten Metadaten aus PDF-Dateien, darunter Autor, Titel, Erstellungsdatum, Producer, XMP-Daten und Dokument-IDs.
---

# Metadaten entfernen

Jede PDF enthält Metadaten, die verraten können, wer sie erstellt hat, welche Software verwendet wurde, wann sie zuletzt geändert wurde und mehr. Dieses Werkzeug entfernt alles davon: das Info-Dictionary, XMP-Metadatenströme, Dokument-IDs und anwendungsspezifische Daten. Zurück bleibt ein sauberes Dokument ohne Spur seiner Herkunft.

## So funktioniert es

1. Laden Sie eine PDF-Datei hoch.
2. Klicken Sie auf **Metadaten entfernen**.
3. Laden Sie die bereinigte Datei herunter.

Es gibt nichts zu konfigurieren. Das Werkzeug arbeitet bewusst gründlich: Es löscht alles.

## Was entfernt wird

- **Felder des Info-Dictionary**: Titel, Autor, Thema, Stichwörter, Ersteller, Producer, Erstellungsdatum, Änderungsdatum
- **XMP-Metadatenstrom**: Der XML-basierte Metadatenblock im Dokumentkatalog
- **Dokument-IDs**: Eindeutige Kennungen im PDF-Trailer, mit denen ein Dokument systemübergreifend verfolgt werden kann
- **PieceInfo**: Anwendungsspezifische Metadaten, die von Programmen wie Illustrator oder InDesign hinzugefügt werden

## Was erhalten bleibt

- Alle sichtbaren Seiteninhalte (Text, Bilder, Grafiken)
- Formularfelder und Annotationen
- Lesezeichen und Links
- Die Dokumentstruktur selbst

## Anwendungsfälle

- Ihren Namen und Ihre Organisation aus einem Dokument entfernen, bevor Sie es anonym veröffentlichen
- Erstellungszeitstempel entfernen, die verraten, wann ein Dokument vorbereitet wurde
- Producer-Angaben bereinigen, die Ihren PDF-Software-Stack verraten
- Dokumente für behördliche Einreichungen vorbereiten, die metadatenfreie PDFs verlangen
- Spuren des Bearbeitungsverlaufs entfernen, bevor Sie ein Dokument extern teilen

## Tipps

- Nutzen Sie zuerst das Werkzeug Metadaten anzeigen, um genau zu sehen, welche Metadaten Ihre PDF enthält, bevor Sie sie entfernen.
- Wenn Sie Metadaten _und_ JavaScript, Annotationen und eingebettete Dateien entfernen wollen, nutzen Sie PDF bereinigen für eine gründlichere Reinigung.
- Das Entfernen von Metadaten ist endgültig. Behalten Sie Ihr Original, falls Sie diese Daten später noch brauchen.

## Verwandte Werkzeuge

- [PDF bereinigen](./sanitize-pdf): Metadaten sowie Skripte, Anhänge und mehr entfernen
- [PDF verschlüsseln](./protect-pdf): die bereinigte PDF mit einem Passwort schützen
- [PDF komprimieren](./compress-pdf): Das Entfernen von Metadaten kann die Dateigröße leicht verringern, durch Komprimieren sparen Sie mehr

---
title: PDF bereinigen
description: Entfernen Sie versteckte und potenziell gefährliche Inhalte aus PDFs, darunter Metadaten, JavaScript, eingebettete Dateien, Annotationen und Ebenen.
---

# PDF bereinigen

PDFs können weit mehr enthalten, als Sie auf dem Bildschirm sehen. Versteckte Metadaten, eingebettetes JavaScript, Dateianhänge, Formulardaten und Ebeneninformationen können sensible Daten preisgeben oder Sicherheitsrisiken darstellen. Beim Bereinigen wird all das entfernt, und Sie erhalten ein sauberes Dokument, das Sie bedenkenlos öffentlich teilen können.

## So funktioniert es

1. Laden Sie eine PDF-Datei hoch.
2. Wählen Sie in der Checkliste aus, welche Elemente entfernt werden sollen.
3. Klicken Sie auf **PDF bereinigen**.
4. Laden Sie die bereinigte Datei herunter.

## Bereinigungsoptionen

Alle Optionen sind standardmäßig aktiviert. Deaktivieren Sie diejenigen, die Sie behalten wollen.

| Option                             | Was entfernt wird                                                             |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| **Formulare reduzieren**           | Wandelt interaktive Formularfelder in statische Inhalte um                    |
| **Metadaten entfernen**            | Entfernt Autor, Titel, Erstellungsdatum, Softwareinfos und XMP-Daten          |
| **Annotationen entfernen**         | Löscht Kommentare, Markierungen, Haftnotizen und Auszeichnungen               |
| **JavaScript entfernen**           | Entfernt eingebettete Skripte, die beim Öffnen ausgeführt werden könnten      |
| **Eingebettete Dateien entfernen** | Entfernt in die PDF eingebettete Dateianhänge                                 |
| **Ebenen entfernen (OCG)**         | Reduziert optionale Inhaltsgruppen auf eine einzige Ebene                     |
| **Links entfernen**                | Entfernt Hyperlinks und URL-Verweise                                          |
| **Strukturbaum entfernen**         | Entfernt die Dokumentstruktur, die für Tags zur Barrierefreiheit genutzt wird |
| **MarkInfo entfernen**             | Entfernt Informationen zu markierten Inhalten                                 |
| **Schriftarten entfernen**         | Entfernt eingebettete Schriftdaten (mit Vorsicht verwenden)                   |

## Anwendungsfälle

- Eine PDF für die Veröffentlichung vorbereiten, indem interne Metadaten (Autorennamen, Softwareversionen, Bearbeitungsverlauf) entfernt werden
- JavaScript aus einer PDF aus unbekannter Quelle entfernen, bevor Sie sie öffnen
- Eine PDF bereinigen, bevor Sie sie an einen Kunden senden, der eingebettete Kommentare oder Formularfeldnamen nicht sehen soll
- Versteckte Ebenen aus einer Architekturzeichnung entfernen, bevor Sie die endgültige Version teilen
- Anforderungen der Datenminimierung nach Datenschutzvorschriften erfüllen

## Tipps

- Lassen Sie "Schriftarten entfernen" deaktiviert, sofern Sie nicht sicher sind, dass die PDF danach noch korrekt dargestellt wird. Das Entfernen von Schriften kann Text in manchen Viewern unsichtbar machen.
- Wenn Sie nur Metadaten entfernen wollen, ist das spezielle Werkzeug Metadaten entfernen schneller und gezielter.
- Das Bereinigen ist nicht umkehrbar. Behalten Sie Ihre Originaldatei.

## Verwandte Werkzeuge

- [Metadaten entfernen](./remove-metadata): nur Metadaten entfernen, ohne andere Inhalte anzutasten
- [PDF reduzieren](./flatten-pdf): gezielt Formulare und Annotationen reduzieren
- [PDF verschlüsseln](./protect-pdf): nach dem Bereinigen einen Passwortschutz hinzufügen
- [PDF rastern](./rasterize-pdf): die radikale Lösung, die PDF in Bilder umwandeln, um alle versteckten Inhalte zu beseitigen

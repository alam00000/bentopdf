---
title: Metadaten anzeigen
description: Untersuchen Sie alle Metadateneigenschaften einer PDF, einschließlich Dokumentinformationen, XMP-Daten und struktureller Details.
---

# Metadaten anzeigen

Untersuchen Sie die versteckten Eigenschaften, die in einer PDF-Datei eingebettet sind. Das Tool zeigt Dokumentinformationen (Titel, Autor, Datumsangaben), XMP-Metadaten, Seitenabmessungen und weitere strukturelle Daten in lesbarer Form an.

## So funktioniert es

1. Laden Sie eine PDF-Datei hoch.
2. Das Tool analysiert die Datei sofort und zeigt alle verfügbaren Metadaten in übersichtlichen Abschnitten an.
3. Sehen Sie sich das Dokumentinformations-Dictionary, den XMP-Metadatenbaum und die strukturellen Eigenschaften an.
4. Ein Verarbeitungsschritt ist nicht nötig: Die Metadaten erscheinen, sobald die Datei geladen ist.

## Funktionen

- Zeigt die Standardfelder der Dokumentinformationen: Titel, Autor, Betreff, Schlüsselwörter, Ersteller, Producer
- Zeigt Erstellungs- und Änderungsdatum in lesbarem Format
- Liest den vollständigen XMP-Metadatenbaum mit verschachtelten Namespaces und stellt ihn dar
- Wandelt das PDF-Datumsformat (`D:20240101120000Z`) in lesbare Datumsangaben um
- In einklappbare Abschnitte gegliedert für eine einfache Navigation

## Metadatenabschnitte

| Abschnitt                 | Inhalt                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| **Dokumentinformationen** | Titel, Autor, Betreff, Schlüsselwörter, Ersteller, Producer, Erstellungsdatum, Änderungsdatum |
| **XMP-Metadaten**         | Vollständiger XML-basierter Metadatenbaum mit Dublin Core, XAP, PDF und eigenen Namespaces    |
| **Dokumenteigenschaften** | Seitenanzahl, PDF-Version, Dateigröße, Verschlüsselungsstatus                                 |

## Anwendungsfälle

- Prüfen, wer eine PDF verfasst hat und wann sie zuletzt geändert wurde
- Kontrollieren, dass die Metadaten vor der Veröffentlichung eines Dokuments korrekt gesetzt wurden
- PDFs aus Datenschutzgründen prüfen, indem man nachsieht, welche persönlichen Informationen eingebettet sind
- Die Software untersuchen, mit der eine PDF erstellt oder geändert wurde (über das Feld Producer)
- XMP-Metadaten im Hinblick auf die Compliance im Digital Asset Management prüfen

## Tipps

- PDF-Datumsangaben, die mit `D:` beginnen, werden automatisch in das Format Ihrer lokalen Zeitzone umgewandelt.
- Wenn Metadatenfelder leer erscheinen, hat der Ersteller der PDF sie schlicht nicht gesetzt. Nicht alle PDFs enthalten umfangreiche Metadaten.
- Um Metadaten nach der Prüfung zu ändern, verwenden Sie [Metadaten bearbeiten](./edit-metadata). Um sie ganz zu entfernen, nutzen Sie „Metadaten entfernen“.

## Verwandte Tools

- [Metadaten bearbeiten](./edit-metadata)
- [PDF-OCG-Ebenen](./pdf-layers)
- [PDFs vergleichen](./compare-pdfs)

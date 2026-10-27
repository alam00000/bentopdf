---
title: Bates-Nummerierung
description: Wenden Sie Bates-Nummern auf ein oder mehrere PDFs an, mit anpassbaren Vorlagen, Auffüllung, Schriftarten und Positionierung.
---

# Bates-Nummerierung

Die Bates-Nummerierung stempelt fortlaufende Kennungen auf jede Seite Ihrer PDFs. Sie ist die Standardmethode zur Kennzeichnung von Dokumenten in Gerichtsverfahren, Prüfungen und Compliance-Workflows. Dieses Werkzeug unterstützt mehrere Dateien und anpassbare Vorlagen und erzeugt einzeln nummerierte PDFs oder ein einzelnes ZIP-Archiv.

## So funktioniert es

1. Laden Sie eine oder mehrere PDF-Dateien hoch. Sie können mehrere Dateien gleichzeitig hineinziehen.
2. Wählen Sie eine Stilvorlage oder erstellen Sie eine eigene Vorlage.
3. Konfigurieren Sie Position, Schriftart, Größe, Farbe und Startnummern.
4. Klicken Sie auf **Bates-Nummern anwenden**, um zu verarbeiten.
5. Eine einzelne Datei wird direkt heruntergeladen. Mehrere Dateien werden als ZIP-Archiv heruntergeladen.

## Optionen

- **Stilvorlage** -- Wählen Sie aus eingebauten Formaten:
  - Exhibit + Case + Bates + Page (z. B. "Exhibit 1 Case XYZ 000001 Page 1")
  - Exhibit + Case + Bates (ohne Seitenzahl)
  - Case + Bates
  - Nur Bates-Nummer (z. B. "000001")
  - Benutzerdefiniert (eigene Vorlage schreiben)
- **Stil anpassen** -- Eine Vorlagenzeichenfolge mit Platzhaltern: `[BATES]`, `[PAGE]`, `[FILE]`, `[FILENAME]`.
- **Bates-Auffüllung** -- Anzahl der Stellen (3 bis 6) für mit Nullen aufgefüllte Bates-Nummern. Nur im benutzerdefinierten Modus sichtbar.
- **Position** -- Kopf- oder Fußzeile, links, mittig oder rechts.
- **Bates beginnt bei** -- Die erste Bates-Nummer. Standard ist 1. Die Nummerierung wird über Dateien hinweg fortgesetzt.
- **Dateizähler beginnt bei** -- Die Startnummer für den Platzhalter `[FILE]`.
- **Schriftart** -- Helvetica, Times New Roman oder Courier.
- **Schriftgröße** -- Größe des gestempelten Texts.
- **Farbe** -- Farbauswahl für den Text der Bates-Nummer.

## Funktionen

- Live-Vorschau, die zeigt, wie die Bates-Nummern über alle hochgeladenen Dateien aussehen werden
- Unterstützung mehrerer Dateien mit durchgehender Nummerierung über Dokumente hinweg
- Dateien per Drag-and-drop in der Liste umsortieren, um die Nummerierungsreihenfolge zu steuern
- Sechs Positionsoptionen (Kopf-/Fußzeile, links/mittig/rechts)
- Adaptive Randberechnung, die unterschiedliche Seitengrößen berücksichtigt
- ZIP-Ausgabe für Stapel mit mehreren Dateien
- Vorlagenplatzhalter für maximale Flexibilität

## Anwendungsfälle

- Offenlegungsdokumente für Rechtsstreitigkeiten mit fortlaufenden Exhibit-Nummern stempeln
- Prüfungsnachweispakete nummerieren, die sich über Dutzende Dateien erstrecken
- Regulatorische Referenznummern auf Compliance-Dokumentation anwenden
- Exhibits von Patentanmeldungen mit fallbezogenen Kennungen versehen

## Tipps

- Ziehen Sie die Dateien in der Dateiliste, um sie vor der Verarbeitung umzusortieren. Die Bates-Nummerierung folgt dieser Reihenfolge.
- Verwenden Sie den Platzhalter `[FILENAME]`, um den ursprünglichen Dateinamen in den Stempel aufzunehmen. So lassen sich Seiten zu den Quelldokumenten zurückverfolgen.
- Das Vorschaufeld aktualisiert sich in Echtzeit, wenn Sie Einstellungen ändern, sodass Sie das Format vor der Verarbeitung prüfen können.

## Verwandte Werkzeuge

- [Seitenzahlen](./page-numbers)
- [Seitenbezeichnungen hinzufügen](./add-page-labels)
- [Kopf- & Fußzeile](./header-footer)

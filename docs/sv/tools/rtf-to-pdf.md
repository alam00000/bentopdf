---
title: RTF till PDF
description: Konvertera Rich Text Format-filer (RTF) till PDF i webbläsaren med en LibreOffice-driven motor.
---

# RTF till PDF

Konvertera Rich Text Format-dokument till PDF. RTF är ett plattformsoberoende dokumentformat som stöds av i princip alla ordbehandlare. Det här verktyget använder en LibreOffice-motor i webbläsaren för att rendera RTF-filer med bevarad formatering: fet stil, kursiv stil, tabeller och inbäddade bilder följer alla med till PDF-filen.

## Format som stöds

| Format | Filändelser | MIME-typer                    |
| :----- | :---------- | :---------------------------- |
| RTF    | `.rtf`      | `text/rtf`, `application/rtf` |

## Så fungerar det

1. Klicka på uppladdningsytan eller dra och släpp en eller flera RTF-filer.
2. Granska fillistan. Lägg till fler eller ta bort filer vid behov.
3. Klicka på **Konvertera till PDF**. LibreOffice-motorn initieras första gången och bearbetar sedan varje fil.
4. En enskild fil laddas ned direkt som PDF. Flera filer levereras som `rtf-converted.zip`.

## Alternativ

Det här verktyget har inga extra inställningar. Konverteringen bevarar den ursprungliga RTF-formateringen.

## Resultat

| Antal filer | Resultat                                           |
| :---------- | :------------------------------------------------- |
| 1 fil       | Enskild PDF att ladda ned (t.ex. `letter.pdf`)     |
| 2+ filer    | ZIP-arkiv (`rtf-converted.zip`) med en PDF per fil |

## Användningsområden

- Konvertera äldre RTF-dokument från äldre ordbehandlare till moderna PDF-filer
- Göra om RTF-mallar för e-post till PDF-förhandsvisningar
- Bearbeta RTF-utdata från juridiska eller medicinska programsystem
- Batchkonvertera RTF-filer från ett dokumenthanteringssystem till PDF för arkivering

## Tips

- LibreOffice-motorn laddas en gång och cachas. Den första konverteringen i en session tar några sekunder extra, de följande går snabbare.
- RTF-filer med inbäddade OLE-objekt kanske inte renderar alla objekt perfekt. Vanlig text, bilder och standardformatering konverteras tillförlitligt.
- Om dina RTF-filer skapades i Microsoft Word kan du också konvertera dem direkt med verktyget [Word till PDF](./word-to-pdf), som accepterar RTF vid sidan av DOC och DOCX.

## Relaterade verktyg

- [Word till PDF](./word-to-pdf)
- [ODT till PDF](./odt-to-pdf)
- [Text till PDF](./txt-to-pdf)

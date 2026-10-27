---
title: Word till PDF
description: Konvertera Word-dokument (DOC, DOCX), ODT- och RTF-filer till PDF i webbläsaren med full bevarad formatering.
---

# Word till PDF

Konvertera Microsoft Word-dokument och kompatibla format till PDF. Verktyget använder en webbläsarbaserad LibreOffice-motor som hanterar DOC-, DOCX-, ODT- och RTF-filer och bevarar formatering, tabeller, bilder, sidhuvuden, sidfötter och format i utdata.

## Format som stöds

| Format            | Filändelser |
| :---------------- | :---------- |
| Word (modernt)    | `.docx`     |
| Word (äldre)      | `.doc`      |
| OpenDocument Text | `.odt`      |
| Rich Text Format  | `.rtf`      |

## Så fungerar det

1. Klicka på uppladdningsytan eller dra och släpp dina Word-dokument. Flera filer kan väljas samtidigt.
2. Gå igenom och hantera fillistan.
3. Klicka på **Konvertera till PDF**. LibreOffice-motorn läses in vid första användningen (en förloppsindikator visar initieringsstatus) och sedan konverteras varje fil.
4. En enskild fil laddas ner direkt som PDF. Flera filer paketeras i `word-converted.zip`.

## Alternativ

Det här verktyget har inga ytterligare inställningar. LibreOffice-motorn skapar utdata med sin standardprofil för PDF-export.

## Utdata

| Antal indatafiler | Utdata                                                          |
| :---------------- | :-------------------------------------------------------------- |
| 1 fil             | Nedladdning av en enskild PDF (ursprungligt filnamn med `.pdf`) |
| 2+ filer          | ZIP-arkiv (`word-converted.zip`) med en PDF per fil             |

## Användningsområden

- Konvertera ett CV eller personligt brev från DOCX till PDF innan du skickar in en jobbansökan
- Batchkonvertera en uppsättning avtal eller offerter till PDF för leverans till en kund
- Göra om äldre `.doc`-filer till moderna PDF:er för långsiktig arkivering
- Konvertera samarbetsdokument från Google Docs (exporterade som DOCX) till PDF
- Skapa utskriftsklara PDF:er från Word-mallar som används vid automatisk dokumentgenerering

## Tips

- LibreOffice-motorn laddas ner en gång per session och cachas. Räkna med några sekunders laddning vid första konverteringen, och betydligt snabbare konverteringar efteråt.
- Komplex formatering (makron, ActiveX-kontroller, avancerad SmartArt) konverteras kanske inte perfekt. Vanliga dokumentelement (text, tabeller, bilder, sidhuvuden, fotnoter) konverteras pålitligt.
- Eftersom verktyget även accepterar ODT och RTF kan du använda det som en samlad konverterare för alla ordbehandlingsformat.

## Relaterade verktyg

- [ODT till PDF](./odt-to-pdf)
- [RTF till PDF](./rtf-to-pdf)
- [Excel till PDF](./excel-to-pdf)
- [PowerPoint till PDF](./powerpoint-to-pdf)

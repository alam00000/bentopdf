---
title: ODT till PDF
description: Konvertera OpenDocument Text-filer (ODT) till PDF i webbläsaren med en LibreOffice-driven motor.
---

# ODT till PDF

Konvertera OpenDocument Text-filer till PDF. ODT är det inbyggda formatet i LibreOffice Writer, Apache OpenOffice och andra ordbehandlare med öppen källkod. Verktyget använder en webbläsarbaserad LibreOffice-motor för exakta konverteringar som bevarar formatering, tabeller, bilder och stilar.

## Format som stöds

| Format            | Filändelser |
| :---------------- | :---------- |
| OpenDocument Text | `.odt`      |

## Så fungerar det

1. Klicka på uppladdningsytan eller dra och släpp en eller flera ODT-filer.
2. Granska fillistan. Lägg till fler filer eller ta bort oönskade.
3. Klicka på **Konvertera till PDF**. LibreOffice-motorn initieras (en förloppsindikator visar laddningsstatus) och därefter konverteras varje fil.
4. En enskild fil laddas ner direkt som en PDF. Flera filer paketeras i `odt-converted.zip`.

## Alternativ

Verktyget har ingen extra konfiguration. Konverteringen bevarar originaldokumentets formatering så noga som möjligt.

## Utdata

| Antal indatafiler | Utdata                                               |
| :---------------- | :--------------------------------------------------- |
| 1 fil             | Nedladdning av en enskild PDF (t.ex. `document.pdf`) |
| 2+ filer          | ZIP-arkiv (`odt-converted.zip`) med en PDF per fil   |

## Användningsområden

- Konvertera LibreOffice Writer-dokument till PDF för att dela med användare av Microsoft Office
- Skapa utskriftsklara PDF-filer från akademiska uppsatser skrivna i OpenDocument-format
- Massomvandla en mapp med ODT-mallar till PDF-filer för distribution
- Skapa PDF-filer från ODT-filer som genererats av automatiserade dokumentsystem

## Tips

- LibreOffice-motorn laddas vid första användningen och cachas för följande konverteringar. Den första laddningen tar några sekunder, därefter går konverteringarna snabbt.
- Komplexa dokument med inbäddade OLE-objekt eller ovanliga teckensnitt kan återges något annorlunda än i LibreOffice på skrivbordet. Testa med ett prov innan du massomvandlar.
- För Word-dokument (`.doc`, `.docx`), använd verktyget [Word till PDF](./word-to-pdf) i stället. Det använder också LibreOffice-motorn men tar emot Microsofts format direkt.

## Relaterade verktyg

- [Word till PDF](./word-to-pdf)
- [RTF till PDF](./rtf-to-pdf)
- [Text till PDF](./txt-to-pdf)

---
title: PDF till gråskala
description: Konvertera en PDF i färg till en gråskaleversion (svartvit). Skapar en ny PDF där all färg är borttagen från varje sida.
---

# PDF till gråskala

Konverterar en PDF i färg till en gråskaleversion. Varje sida renderas, avmättas och bäddas in på nytt som en JPEG-bild i en ny PDF. Utdata bevarar de ursprungliga sidmåtten.

## Så fungerar det

1. Ladda upp en PDF genom att klicka på släppytan eller dra en fil dit.
2. Klicka på **Konvertera** för att bearbeta filen.
3. En ny `greyscale.pdf` laddas ner med alla sidor konverterade till svartvitt.

Bakom kulisserna renderas varje sida i 2x-skala, pixeldata körs genom ett gråskalefilter och kodas sedan om som JPEG med 90 % kvalitet och placeras i ett nytt PDF-dokument.

## Alternativ

Verktyget har inga inställbara alternativ. Gråskalekonverteringen använder en standardformel för luminans och JPEG-kvaliteten är fast på 90 %.

## Utdataformat

- En enda `greyscale.pdf`-fil med alla sidor som JPEG-bilder i gråskala.

## Användningsområden

- Förbereda dokument för svartvit utskrift för att spara på färgbläck.
- Uppfylla inlämningskrav för juridiska eller offentliga handlingar som kräver gråskala.
- Minska filstorleken på färgtunga PDF-filer (JPEG-bilder i gråskala är mindre än färgbilder).
- Skapa en enhetlig visuell stil i dokument med blandade färg- och svartvita sidor.

## Tips

- Eftersom varje sida rastreras och bäddas in som JPEG är utdata bildbaserad. Text i den ursprungliga PDF-filen går inte längre att markera eller söka i. Om du behöver sökbar text efteråt kan du köra utdata genom OCR-verktyget.
- För mer kontroll över färgjusteringar (ljusstyrka, kontrast, mättnad), titta på verktyget Justera färger eller noden Gråskala i [PDF-arbetsflödesbyggare](./pdf-workflow).

## Relaterade verktyg

- [PDF till JPG](./pdf-to-jpg)
- [PDF till PNG](./pdf-to-png)
- [PDF-arbetsflödesbyggare](./pdf-workflow)

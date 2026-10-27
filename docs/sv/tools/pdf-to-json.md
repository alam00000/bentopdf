---
title: PDF till JSON
description: Konvertera PDF-filer till strukturerat JSON-format med CPDF. Exporterar PDF-filens interna struktur som maskinläsbara JSON-data.
---

# PDF till JSON

Konverterar en eller flera PDF-filer till JSON-format. Verktyget använder CPDF (Coherent PDF) för att serialisera varje PDF-fils interna struktur till en maskinläsbar JSON-representation. Utdata levereras alltid som ett ZIP-arkiv.

## Så fungerar det

1. Välj en eller flera PDF-filer med filväljaren.
2. Klicka på **Konvertera** för att starta bearbetningen. Konverteringen körs i en webbworker i bakgrunden.
3. Ett ZIP-arkiv laddas ner med en JSON-fil för varje PDF.

Statusraden visar förloppet genom konverteringen och skapandet av ZIP-filen.

## Alternativ

Verktyget har inga inställbara alternativ. Varje PDF konverteras till sin fullständiga JSON-representation.

## Utdataformat

- En `pdfs-to-json.zip`-fil med `filename.json` för varje PDF.

JSON-utdata representerar PDF-filens interna objektstruktur, inklusive sidträd, typsnittsreferenser, metadata och innehållsströmmar.

## Användningsområden

- Undersöka en PDF-fils interna struktur för felsökning eller validering.
- Extrahera strukturerad metadata och sidegenskaper programmatiskt.
- Mata in PDF-strukturdata i egna bearbetningskedjor.
- Granska PDF-dokument för efterlevnad genom att analysera deras objektträd.

## Tips

- Verktyget ger den råa PDF-objektstrukturen, inte extraherat textinnehåll. Om du behöver sidtext i JSON-format, använd [Förbered PDF för AI](./prepare-pdf-for-ai) i stället.
- För ren textextrahering är [PDF till text](./pdf-to-text) enklare.
- Stora PDF-filer med komplex struktur ger mycket stora JSON-filer.

## Relaterade verktyg

- [PDF till text](./pdf-to-text)
- [Förbered PDF för AI](./prepare-pdf-for-ai)
- [Extrahera PDF-tabeller](./extract-tables)

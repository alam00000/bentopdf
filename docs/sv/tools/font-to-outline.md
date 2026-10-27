---
title: Typsnitt till kontur
description: Konvertera alla typsnitt i en PDF till vektorkonturer för enhetlig rendering på alla enheter. Eliminerar problem med typsnittsberoende.
---

# Typsnitt till kontur

När typsnitt konverteras till konturer omvandlas varje textteckens glyf till en vektorbana. PDF-filen är då inte längre beroende av några installerade typsnitt: den renderas identiskt på varje enhet, i varje operativsystem och på varje skrivare. Det är ett standardsteg i tryckförberedelser.

## Så fungerar det

1. Ladda upp en eller flera PDF-filer.
2. Klicka på **Konvertera till konturer**.
3. Ghostscript konverterar all text till vektorbanor.
4. Ladda ned resultatet. Flera filer ger ett ZIP-arkiv.

Det finns inga inställningar att konfigurera. Verktyget använder Ghostscript (WebAssembly) för att konvertera alla typsnittsreferenser till konturbanor i ett enda pass.

## Vad som ändras

- Teckentext blir vektorkurvor (bézierbanor)
- Typsnittsinbäddning behövs inte längre, PDF-filen är självständig på glyfnivå
- Filstorleken kan öka eftersom vektorbanor oftast är större än typsnittsreferenser
- Det visuella utseendet bevaras exakt

## Vad du förlorar

- Textmarkering och kopiera-klistra
- Textsökbarhet (Ctrl+F slutar fungera)
- Möjligheten att redigera textinnehållet
- Tillgänglighet för skärmläsare

## Användningsområden

- Skicka PDF-filer till ett tryckeri som kräver konturerade typsnitt
- Dela dokument som använder egna eller licensierade typsnitt med personer som inte har dessa typsnitt
- Förhindra typsnittsersättning som ändrar dokumentets utseende på andra system
- Förbereda PDF-filer för lasergravyr eller CNC-skärning som kräver vektorindata
- Säkerställa att en logotyptung PDF visas korrekt på alla plattformar

## Tips

- Behåll din ursprungliga PDF. Konturering går inte att ångra, du kan inte konvertera banor tillbaka till redigerbar text.
- Om texten ska förbli sökbar kan du i stället överväga verktyget Rasterisera PDF med OCR som efterföljande steg.
- Konturerade PDF-filer tenderar att bli större. Kör Komprimera PDF efteråt om filstorleken är viktig.

## Relaterade verktyg

- [Platta till PDF](./flatten-pdf): platta till formulär och anteckningar utan att röra typsnitt
- [Rasterisera PDF](./rasterize-pdf): konvertera till bildbaserad PDF i stället för vektorkonturer
- [Komprimera PDF](./compress-pdf): minska filstorleken efter konturering
- [PDF till PDF/A](./pdf-to-pdfa): konvertera för arkivering efter att typsnittsoberoende säkerställts

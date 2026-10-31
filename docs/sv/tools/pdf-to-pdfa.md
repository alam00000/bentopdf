---
title: PDF till PDF/A
description: Konvertera vanliga PDF-filer till PDF/A-format för långtidsarkivering. Stöder konformitetsnivåerna PDF/A-1b, PDF/A-2b och PDF/A-3b.
---

# PDF till PDF/A

PDF/A är en ISO-standardiserad delmängd av PDF som utformats för långsiktig digital bevarande. Verktyget konverterar dina vanliga PDF-filer till PDF/A-kompatibla dokument med Ghostscript som körs direkt i webbläsaren.

## Så fungerar det

1. Ladda upp en eller flera PDF-filer.
2. Välj en **PDF/A-version** i rullgardinsmenyn.
3. Aktivera vid behov **Platta till PDF i förväg** för komplexa filer som inte klarar en vanlig konvertering.
4. Klicka på **Konvertera till PDF/A**. Flera filer ger ett ZIP-arkiv.

## PDF/A-versioner

| Version      | Begränsningar                             | Bäst för                                           |
| ------------ | ----------------------------------------- | -------------------------------------------------- |
| **PDF/A-1b** | Strängast. Ingen transparens, inga lager. | Maximal kompatibilitet med äldre arkivsystem       |
| **PDF/A-2b** | Tillåter transparens och JPEG2000.        | Allmän arkivering (rekommenderas)                  |
| **PDF/A-3b** | Tillåter inbäddade bilagor i alla format. | Arkivering av dokument med underliggande datafiler |

PDF/A-2b är förvalt och fungerar för de allra flesta arkiveringsbehov.

## Alternativet att platta till i förväg

Vissa PDF-filer innehåller funktioner som hindrar en ren PDF/A-konvertering, till exempel ovanliga typsnittskodningar, komplexa transparenslager eller trasiga interna strukturer. Om du aktiverar **Platta till i förväg** rastreras PDF-filen i 300 DPI före konverteringen, vilket garanterar efterlevnad men gör att texten inte längre går att markera. Använd det som reserv när den vanliga konverteringen ger fel.

Att platta till i förväg kräver PyMuPDF WASM-motorn.

## Användningsområden

- Uppfylla offentliga eller juridiska arkivkrav (många jurisdiktioner kräver PDF/A för domstolshandlingar)
- Lämna in dokument till institutionella arkiv eller digitala bibliotek
- Bevara affärshandlingar där originalprogramvaran kanske inte finns om tio år
- Förbereda fakturor för e-fakturastandarder som kräver PDF/A-3b med XML-bilagor

## Tips

- Prova konverteringen utan att platta till i förväg först. Aktivera det bara om du får ett fel.
- PDF/A bäddar in alla typsnitt, så utdatafilerna blir ofta större än originalen.
- Validera utdata i en särskild PDF/A-validerare om ditt arbetsflöde kräver strikt efterlevnad.

## Relaterade verktyg

- [Komprimera PDF](./compress-pdf): minska filstorleken efter konverteringen
- [Platta till PDF](./flatten-pdf): platta till formulär före konvertering till PDF/A
- [Ta bort metadata](./remove-metadata): ta bort metadata före arkivering

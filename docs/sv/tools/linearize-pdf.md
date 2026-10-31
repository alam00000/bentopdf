---
title: Linjärisera PDF
description: Optimera PDF-filer för snabb webbvisning med progressiv laddning. Också känt som "Fast Web View"-optimering.
---

# Linjärisera PDF

Linearisering strukturerar om en PDF så att den första sidan kan visas innan hela filen har laddats ned. Adobe kallar detta "Fast Web View". Om du hostar PDF-filer på en webbplats eller levererar dem via en dokumentportal gör linearisering att de känns märkbart snabbare att öppna.

## Så fungerar det

1. Ladda upp en eller flera PDF-filer.
2. Klicka på **Linjärisera PDF**.
3. Ladda ned resultaten som ett ZIP-arkiv med alla lineariserade filer.

Det finns inga inställningar att konfigurera. Verktyget använder QPDF:s flagga `--linearize`, som ordnar om PDF-filens interna struktur utan att ändra dess visuella innehåll.

## Vad linearisering gör

- Ordnar om PDF-objekt så att första sidans data hamnar i början av filen
- Lägger till en lineariseringsordlista och tips-tabeller så att visare vet var varje sida finns
- Möjliggör byte-range-förfrågningar: en webbläsare kan hämta bara första sidan utan att ladda ned hela filen
- Städar upp korsreferenstabellen för effektiv slumpmässig åtkomst

## Funktioner

- Batchbearbetning av flera PDF-filer i en enda åtgärd
- Resultatet bevarar allt innehåll, alla typsnitt, bilder och interaktiva element
- Använder QPDF (WebAssembly) för tillförlitlig, standardenlig linearisering
- Resultaten paketeras i ett ZIP-arkiv för enkel nedladdning

## Användningsområden

- Hosta PDF-rapporter på en webbplats där användare förväntar sig omedelbar sidvisning
- Bädda in PDF-filer i webbapplikationer med visare i webbläsaren
- Publicera PDF-kataloger eller manualer som nås över långsamma mobila anslutningar
- Förbereda dokument för innehållsleveransnätverk (CDN) som stöder byte-range-leverans

## Tips

- Linearisera efter att alla andra redigeringar är klara. Varje efterföljande ändring (sammanfogning, tillägg av sidor) bryter lineariseringen.
- Kombinera med Komprimera PDF för de minsta och snabbast laddade PDF-filerna.
- Linearisering lägger till en liten extra mängd i filstorleken (vanligtvis under 1 %).

## Relaterade verktyg

- [Komprimera PDF](./compress-pdf): minska filstorleken före linearisering
- [Reparera PDF](./repair-pdf): åtgärda strukturproblem som hindrar linearisering
- [Ta bort metadata](./remove-metadata): ta bort metadata före publicering online

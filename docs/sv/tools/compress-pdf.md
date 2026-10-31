---
title: Komprimera PDF
description: Minska PDF-filens storlek med upp till 90 % med motorn Hyper Compress. Stöder målstorlekar, batchbearbetning och anpassade kvalitetsinställningar.
---

# Komprimera PDF

Krymp dina PDF-filer utan att förstöra dem. Komprimera PDF drivs av [Hyper Compress](https://www.bentopdf.com/hyper-compress), BentoPDF:s egen komprimeringsmotor. Den komprimerar om bilder, skapar delmängder av och slår ihop typsnitt och tar bort onödig vikt som inbäddade miniatyrer och privata programdata. PDF-filen förblir fullt fungerande: texten kan fortfarande markeras, och länkar och formulärfält fortsätter att fungera.

Hyper Compress är kompilerad till WebAssembly och levereras med BentoPDF, så komprimeringen fungerar offline och i isolerade miljöer utan extra konfiguration.

## Så fungerar det

1. Ladda upp en eller flera PDF-filer genom att klicka på släppytan eller dra in filer.
2. Välj en **Komprimeringsnivå**: Låg, Medel, Hög eller Förlustfri.
3. Ange eventuellt en **Målfilstorlek**, eller expandera **Anpassade inställningar** för finjustering, inklusive **Konvertera till gråskala**.
4. Klicka på **Komprimera PDF**. För flera filer får du en enda ZIP-nedladdning.

## Särskilda dokument

- **Digitalt signerade PDF-filer** returneras oförändrade, eftersom varje ändring skulle ogiltigförklara signaturen. Slå på **Åsidosätt innehållsskydd** under Anpassade inställningar för att ta bort signaturerna och komprimera dem. Den synliga signaturen finns kvar på sidan, men filen är inte längre signerad.
- **PDF/A-filer** förlorar sin PDF/A-märkning efter komprimering, så att filen aldrig påstår en överensstämmelse som den inte längre uppfyller. Slå på **Bevara PDF/A** under Anpassade inställningar för att i stället behålla överensstämmelsen.
- **Lösenordsskyddade PDF-filer** får ett lösenordsfält på sitt filkort. Ange lösenordet där så öppnar Hyper Compress filen själv, utan ett separat upplåsningssteg. Med två eller fler låsta filer låser ett gemensamt fält upp alla filer som använder samma lösenord. Den komprimerade kopian har inget lösenord. Använd [Skydda PDF](./protect-pdf) för att lägga till ett igen.
- **Skanningar utan textlager** kan krympa ännu mer med **Rasterisera sidor** under Anpassade inställningar, vilket ersätter varje sida med en optimerad bild. Det hoppas över för alla dokument som har markerbar text, inklusive OCR-behandlade skanningar, om inte **Åsidosätt innehållsskydd** är på. Då blir även textsidor bilder, så texten går inte längre att markera och länkar slutar fungera.

## Komprimeringsnivåer

| Nivå           | Bildkvalitet  | Max. upplösning | Bäst för                         |
| -------------- | ------------- | --------------- | -------------------------------- |
| **Låg**        | 80            | 200 DPI         | Bevara den visuella kvaliteten   |
| **Medel**      | 50            | 150 DPI         | Vardagsdokument                  |
| **Hög**        | 20            | 72 DPI          | E-postbilagor, webbuppladdningar |
| **Förlustfri** | Bilder orörda | Oförändrad      | Arkivkopior                      |

Hög tar också bort inbäddningen av de 14 standardtypsnitten i PDF, samt liknande typsnitt som Arial när det är säkert.

## Målfilstorlek

Ange en storlek i KB eller MB så söker Hyper Compress efter den bästa bildkvalitet som ändå ryms, med utgångspunkt i den nivå du valde. Om dokumentet inte kan bli så litet får du den minsta version det kan skapa och ett meddelande om det. De särskilda sidorna, som [Komprimera PDF till 1 MB](https://www.bentopdf.com/compress-pdf-to-1mb), öppnas med målet redan ifyllt.

## Anpassade inställningar

Expandera panelen Anpassade inställningar för att justera Hyper Compress direkt. När du väljer en komprimeringsnivå återställs dessa till nivåns värden, och om du ändrar någon av dem växlar nivån till Anpassad.

- **Åsidosätt innehållsskydd**: som standard lämnar Hyper Compress signerade PDF-filer orörda och rasteriserar inte sidor som har text. När detta slås på kringgås båda. Det förblir på när du ändrar nivå.

- **Bilder**: bildkvalitet, maximal upplösning, tvingad omsampling, färgreducering, beskärning av osynliga bildområden, borttagning av alternativa bilder, förenkling av färgprofiler, JPEG 2000 och förlustfritt läge
- **Typsnitt**: skapande av delmängder, sammanslagning av dubbletter och borttagning av inbäddning av standardtypsnitt och deras liknande typsnitt
- **Innehåll**: platta till kommentarer, formulärfält eller länkar
- **Rensning**: ta bort miniatyrer, programdata, artikeltrådar, webbinsamlingsinformation, strukturträdet eller utdataavsikter
- **Rasterisera**: ersätta sidor med bilder, för skanningar som bara består av bilder. Hoppas över när dokumentet har markerbar text
- **Utdata**: Bevara PDF/A och Brotli-komprimering för PDF 2.0-läsare som stöder det

## Användningsfall

- Få en rapport på 50 MB under gränsen för e-postbilagor
- Få en skanning under en portals strikta uppladdningsgräns med en målfilstorlek
- Optimera marknadsförings-PDF:er för snabbare nedladdning från webbplatser
- Arkivera stora dokumentsamlingar där lagringskostnaden spelar roll
- Minska mobildataanvändningen när du delar PDF-filer via meddelandeappar

## Tips

- Börja med Medel. Om resultatet fortfarande är för stort, ange en målfilstorlek eller gå upp till Hög.
- För en skanning utan textlager, slå på Rasterisera sidor under Anpassade inställningar.
- Konvertera till gråskala, under Anpassade inställningar, kan minska filstorleken för färgtunga dokument.

## Relaterade verktyg

- [Linjärisera PDF](./linearize-pdf): optimera den komprimerade PDF-filen för snabb visning på webben
- [Rasterisera PDF](./rasterize-pdf): konvertera sidor till bilder med en viss DPI, även sidor med text
- [Reparera PDF](./repair-pdf): fixa en PDF som gick sönder vid komprimering någon annanstans
- [Ta bort metadata](./remove-metadata): ta bort dold data för integritetens skull

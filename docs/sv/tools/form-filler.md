---
title: PDF-formulärifyllare
description: Fyll i PDF-formulär, inklusive XFA-formulär, direkt i webbläsaren med en inbäddad visare.
---

# PDF-formulärifyllare

Öppna en PDF med formulärfält och fyll i den direkt i en inbäddad visare. Verktyget stöder både vanliga AcroForm-fält och äldre XFA-formulär (XML Forms Architecture). När du har fyllt i formuläret laddar du ned den ifyllda versionen med ett enda klick.

## Så fungerar det

1. Ladda upp en PDF som innehåller formulärfält.
2. Dokumentet öppnas i en integrerad PDF-visare som återger formulärfält som interaktiva inmatningsfält.
3. Klicka på textfält, kryssrutor, listrutor och alternativknappar för att fylla i dem.
4. Klicka på **Spara och ladda ned ifyllt formulär** för att få den färdiga PDF-filen.

## Funktioner

- Inbäddad PDF.js-visare med full interaktion med formulärfält
- Stöd för vanliga AcroForm-fält (textfält, kryssrutor, listrutor, alternativknappar)
- XFA-formulärstöd för äldre XML-baserade formulär
- Automatisk anpassning av visarens storlek efter sidmåtten
- Filvisning med namn och storlek

## Alternativ

Det finns inga ytterligare konfigurationsalternativ. Ladda upp formuläret, fyll i det och ladda ned.

## Användningsområden

- Fylla i skatteformulär, försäkringsansökningar eller myndighetsblanketter
- Fylla i jobbansökningsformulär som mottagits som PDF-bilagor
- Fylla i leverantörsregistreringar eller leverantörsenkäter
- Intyga efterlevnadschecklistor med kryssrutefält
- Fylla i medicinska anamnesformulär före ett besök

## Tips

- XFA-formulär är ett äldre format som bara stöds av vissa PDF-visare. Om du öppnar en XFA-PDF i Chrome eller de flesta andra verktyg och ser tomma sidor beror det på att dessa visare saknar XFA-stöd. BentoPDF:s Formulärifyllare och Firefox hanterar båda XFA korrekt.
- För PDF-filer utan befintliga formulärfält, använd verktyget [Skapa PDF-formulär](./form-creator) för att lägga till fält först och fyll sedan i dem här.
- Visaren anpassar automatiskt sin storlek efter PDF-filens sidmått.

## Relaterade verktyg

- [Skapa PDF-formulär](./form-creator)
- [Signera PDF](./sign-pdf)
- [PDF-redigerare](./edit-pdf)

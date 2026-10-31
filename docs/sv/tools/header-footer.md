---
title: Sidhuvud & sidfot
description: Lägg till anpassningsbar sidhuvuds- och sidfotstext på PDF-sidor med dynamiska variabler för sidnummer.
---

# Sidhuvud & sidfot

Lägg till text på sex positioner på dina PDF-sidor: sidhuvud vänster, sidhuvud center, sidhuvud höger, sidfot vänster, sidfot center och sidfot höger. Verktyget stöder dynamiska variabler för sidnummer och totalt antal sidor, så att du kan skapa mallar som "Sida 3 av 10" som uppdateras automatiskt för varje sida.

## Så fungerar det

1. Ladda upp din PDF-fil.
2. Alternativpanelen visas med formateringskontroller och sex textfält.
3. Ange önskad text i valfri sidhuvuds- eller sidfotsposition.
4. Använd platshållarna `{page}` och `{total}` för dynamisk sidnumrering.
5. Justera teckenstorlek och teckenfärg, och begränsa eventuellt till ett specifikt sidintervall.
6. Klicka på **Lägg till sidhuvud och sidfot** för att bearbeta och ladda ned.

## Alternativ

- **Sidintervall**: Begränsa eventuellt vilka sidor som får sidhuvud och sidfot. Lämna tomt för att tillämpa på alla sidor. Format: "1-3, 5" (kommaseparerade intervall).
- **Teckenstorlek**: Mellan 6 och 24 punkter. Standard är 10.
- **Teckenfärg**: Välj valfri färg med färgväljaren.
- **Sidhuvud vänster / center / höger**: Textfält för toppen av varje sida.
- **Sidfot vänster / center / höger**: Textfält för botten av varje sida.

## Funktioner

- Sex oberoende textpositioner per sida
- Dynamisk variabel `{page}` som infogar aktuellt sidnummer
- Dynamisk variabel `{total}` som infogar totalt antal sidor
- Sidintervallfiltrering för att rikta in sig på specifika sidor
- Anpassningsbar teckenstorlek och färg
- Typsnittet Helvetica för ett rent, professionellt resultat

## Användningsområden

- Lägga till "Sida {page} av {total}" i sidfot center i en rapport
- Placera ett företagsnamn i sidhuvud vänster och ett dokumentdatum i sidhuvud höger
- Lägga till sekretessmeddelanden i sidfoten i juridiska dokument
- Stämpla dokumentrevisionsnummer på specifika sidintervall

## Tips

- Kombinera `{page}` och `{total}` i ett enda fält för format som "Sida {page} av {total}" eller "{page}/{total}".
- Du kan lämna de flesta fält tomma och bara fylla i de positioner du behöver. Tomma fält hoppas helt enkelt över.
- För mer komplexa sidhuvuden med bilder eller logotyper, överväg att använda verktyget [Lägg till vattenstämpel](./add-watermark) placerat överst på sidan.

## Relaterade verktyg

- [Sidnummer](./page-numbers)
- [Lägg till vattenstämpel](./add-watermark)
- [Bates-numrering](./bates-numbering)

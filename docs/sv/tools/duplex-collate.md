---
title: Sortera dubbelsidig skanning
description: Ordna om PDF-filer från dubbelsidig skanning där framsidor och baksidor ligger i separata block till rätt ordning för fram- och baksidor.
---

# Sortera dubbelsidig skanning

Sortera dubbelsidig skanning är avsett för ADF-skanningsflöden där en PDF innehåller två block med sidor:

- alla framsidor först
- alla baksidor sedan

I stället för att manuellt dela upp och sätta ihop igen flätar det här verktyget ihop de två blocken till naturlig läsordning: framsida1, baksida1, framsida2, baksida2 och så vidare.

## Så fungerar det

1. Ladda upp en enda PDF som skapats genom skanning av en dubbelsidig bunt.
2. Ange delningspunkten där framsideblocket slutar.
3. Välj hur baksideblocket hanteras:
   - **Vänd baksideblocket** (vanligt när bunten vänds innan baksidorna skannas)
   - **Behåll baksideblocket som det är**
4. Klicka på **Sortera PDF** för att ladda ner det omordnade resultatet.

## Alternativ

- **Identifiera delning automatiskt (hälften)**: sätter delningspunkten till `ceil(totalPages / 2)`.
- **Varning för udda sidantal**: varnar när det totala antalet sidor är udda (ofta ett skanningsfel).
- **Bekräftelse vid ojämna block**: ber om bekräftelse när fram- och baksideblockens storlekar skiljer sig åt.
- **Grupperad export**: dela upp den sorterade utdatan i separata PDF-filer baserat på det ursprungliga dokumentets sidantal och ladda ner som ZIP.

## Utdatabeteende

- **Standard**: en utdata-PDF (en indata-PDF ger en utdata-PDF).
- **Grupperat läge**: utdatan delas upp efter ditt värde för sidor per dokument. Om flera delar skapas laddas de ner som en ZIP, annars laddas en enda PDF ner.

Om blockstorlekarna är ojämna sorteras de parade sidorna först, och återstående oparade sidor läggs till i slutet.

## Vanliga användningsfall

- Återställa ordningen efter att en hög dubbelsidiga formulär skannats i två omgångar.
- Bygga upp fram-/baksidepaket från kontorsskannrar som matar ut alla framsidor och sedan alla baksidor.
- Efterbearbeta arkivskanningar innan de delas upp i filer per dokument.

## Tips

- De flesta dubbelsidiga batcher bör ha ett jämnt totalt sidantal.
- Om baksidorna ser omvända ut, växla mellan **Vänd baksideblocket** och **Behåll baksideblocket som det är**.
- För original med 2 sidor (fram- och baksida), använd grupperad export med `2` sidor per dokument.

## Relaterade verktyg

- [Alternera & blanda sidor](./alternate-merge)
- [Dela PDF](./split-pdf)
- [Sammanfoga PDF](./merge-pdf)
- [Duplicera & organisera](./organize-pdf)

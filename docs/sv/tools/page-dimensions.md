---
title: Sidmått
description: Analysera PDF-sidors storlek, orientering, bildformat och rotation. Upptäck dokument med blandade storlekar och exportera data till CSV.
---

# Sidmått

Ett diagnostikverktyg som läser varje sida i din PDF och rapporterar exakta mått, orientering, standardstorlekens namn, bildformat, area och rotation. Användbart för att upptäcka sidor med blandade storlekar före utskrift eller för att dokumentera egenskaperna hos en PDF du fått.

## Så fungerar det

1. Ladda upp en PDF-fil. Analysen startar automatiskt, ingen knapp behöver tryckas.
2. En sammanfattningspanel visar totalt antal sidor, antal unika sidstorlekar och om dokumentet har blandade storlekar.
3. Bläddra i hela resultattabellen med uppgifter per sida.
4. Växla visningsenhet mellan punkter, tum, millimeter eller pixlar.
5. Klicka på **Exportera till CSV** för att spara data.

## Rapporterade fält

| Kolumn          | Beskrivning                                       |
| --------------- | ------------------------------------------------- |
| Sida #          | Löpande sidnummer                                 |
| Mått            | Bredd x höjd i vald enhet                         |
| Standardstorlek | Matchat namn (A4, Letter osv.) eller "Anpassad"   |
| Orientering     | Stående eller liggande                            |
| Bildformat      | Förhållandet mellan bredd och höjd som decimaltal |
| Area            | Sidans area i vald enhet i kvadrat                |
| Rotation        | Sidans rotation i grader                          |

## Funktioner

- Automatisk identifiering av standardpappersstorlekar (A3, A4, A5, Letter, Legal, Tabloid med fler)
- Varning för dokument med blandade storlekar, med en uppdelning av vilka storlekar som förekommer och hur många sidor som använder var och en
- Enhetsomvandling mellan punkter, tum, millimeter och pixlar (vid 96 PPI)
- CSV-export för användning i kalkylblad eller dokumentationssystem

## Användningsområden

- Kontrollera att alla sidor är A4 innan ett dokument skickas till ett tryckeri
- Ta reda på varför en sammanfogad PDF skrivs ut med oväntade marginaler på vissa sidor
- Dokumentera sidlayouten i ett stort PDF-arkiv för metadataregister
- Hitta roterade sidor som behöver korrigeras

## Tips

- Om sammanfattningen visar "Blandade storlekar", använd verktyget Fixa sidstorlek för att standardisera före utskrift.
- Rotationsfältet hjälper dig att hitta sidor som visas korrekt men har ett rotationsattribut som inte är noll, vilket kan orsaka problem i vissa arbetsflöden.

## Relaterade verktyg

- [Fixa sidstorlek](./fix-page-size): standardisera sidor efter att du hittat blandade storlekar
- [Komprimera PDF](./compress-pdf): optimera PDF-filen efter att sidproblem åtgärdats
- [Rotera PDF](./rotate-pdf): korrigera roterade sidor

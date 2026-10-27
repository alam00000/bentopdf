---
title: Rozmery strany
description: Analyzujte veľkosti, orientáciu, pomer strán a otočenie strán PDF. Odhaľte dokumenty so zmiešanými veľkosťami a exportujte údaje do CSV.
---

# Rozmery strany

Diagnostický nástroj, ktorý prečíta každú stranu vo vašom PDF a vypíše jej presné rozmery, orientáciu, názov štandardnej veľkosti, pomer strán, plochu a otočenie. Hodí sa na odhalenie strán rôznych veľkostí pred tlačou alebo na zdokumentovanie vlastností prijatého PDF.

## Ako to funguje

1. Nahrajte súbor PDF. Analýza sa spustí automaticky, nie je potrebné stláčať žiadne tlačidlo.
2. Súhrnný panel zobrazí celkový počet strán, počet rôznych veľkostí strán a či má dokument zmiešané veľkosti.
3. Prezrite si úplnú tabuľku výsledkov s podrobnosťami o každej strane.
4. Prepínajte jednotky zobrazenia medzi bodmi, palcami, milimetrami a pixelmi.
5. Kliknutím na **Exportovať do CSV** údaje uložíte.

## Vykazované polia

| Stĺpec             | Popis                                          |
| ------------------ | ---------------------------------------------- |
| Strana č.          | Poradové číslo strany                          |
| Rozmery            | Šírka x výška vo zvolenej jednotke             |
| Štandardná veľkosť | Zhodný názov (A4, Letter atď.) alebo „Vlastná“ |
| Orientácia         | Na výšku alebo na šírku                        |
| Pomer strán        | Pomer šírky k výške ako desatinné číslo        |
| Plocha             | Plocha strany vo zvolenej jednotke na druhú    |
| Otočenie           | Otočenie strany v stupňoch                     |

## Funkcie

- Automatické rozpoznanie štandardných veľkostí papiera (A3, A4, A5, Letter, Legal, Tabloid a ďalšie)
- Upozornenie na zmiešané veľkosti s prehľadom, ktoré veľkosti sa vyskytujú a koľko strán ich používa
- Prevod jednotiek medzi bodmi, palcami, milimetrami a pixelmi (pri 96 PPI)
- Export do CSV na použitie v tabuľkách alebo dokumentačných systémoch

## Prípady použitia

- Overenie, že všetky strany sú A4, pred odoslaním dokumentu do tlačiarne
- Zistenie, prečo sa spojené PDF tlačí na niektorých stranách s neočakávanými okrajmi
- Zdokumentovanie rozloženia strán veľkého archívu PDF pre záznamy metadát
- Nájdenie otočených strán, ktoré treba opraviť

## Tipy

- Ak súhrn ukazuje „Zmiešané veľkosti“, pred tlačou ich zjednoťte nástrojom Zjednotiť veľkosť strán.
- Pole otočenia pomáha nájsť strany, ktoré sa zobrazujú správne, no majú nenulový atribút otočenia, čo môže v niektorých postupoch spôsobovať problémy.

## Súvisiace nástroje

- [Zjednotiť veľkosť strán](./fix-page-size): zjednotí strany po zistení zmiešaných veľkostí
- [Komprimovať PDF](./compress-pdf): optimalizuje PDF po oprave problémov so stranami
- [Otočiť PDF](./rotate-pdf): opraví otočené strany

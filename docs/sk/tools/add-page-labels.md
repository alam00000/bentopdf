---
title: Pridať označenia strán
description: Pridajte do PDF označenia strán s rímskymi číslicami, písmenovými predponami, vlastným číslovaním a viacerými pravidlami na dokument.
---

# Pridať označenia strán

Označenia strán určujú, ako sa čísla strán zobrazujú v prehliadačoch PDF (číslo na paneli nástrojov, nie vytlačené na strane). Tento nástroj vám umožní priradiť rôznym rozsahom strán rôzne schémy označovania: rímske číslice pre úvodnú časť, arabské čísla pre hlavný text, písmenami označené prílohy a ďalšie.

## Ako to funguje

1. Nahrajte PDF súbor.
2. Zobrazí sa panel možností s jedným predvoleným pravidlom označenia.
3. Pre každé pravidlo nastavte rozsah strán, štýl, voliteľnú predponu a počiatočnú hodnotu.
4. Kliknutím na **Pridať pravidlo** vytvoríte ďalšie pravidlá pre rôzne časti.
5. Kliknutím na **Pridať označenia strán** použijete všetky pravidlá a stiahnete výsledok.

## Možnosti

Každé pravidlo označenia má tieto nastavenia:

- **Rozsah strán**: Na ktoré strany sa pravidlo vzťahuje. Ak necháte prázdne, platí pre všetky strany. Podporuje rozsahy ako `1-4`, `7`, `odd` alebo `1-9,30-40`.
- **Štýl označenia**: Arabské čísla, malé rímske číslice (i, ii, iii), veľké rímske číslice (I, II, III), malé písmená (a, b, c), veľké písmená (A, B, C) alebo bez označenia (len predpona).
- **Predpona označenia**: Voliteľný text pred každým označením, napríklad „A-“ pre označenia ako A-1, A-2, A-3.
- **Počiatočná hodnota**: Číslo, od ktorého sa začína počítať. Predvolene 1. Nastavte 0 pre číslovanie od nuly.
- **Pokračovať v číslovaní cez nesúvislé rozsahy**: Zapnite, ak pravidlo cieli na nesúvislé strany (napríklad `1-9,30-40` alebo `odd`) a chcete, aby číslovanie pokračovalo postupne.
- **Odstrániť existujúce označenia strán**: Predvolene zaškrtnuté. Pred použitím nových pravidiel vymaže všetky predchádzajúce označenia.

## Funkcie

- Viac pravidiel označenia v jednom dokumente pre zložité schémy číslovania
- Šesť štýlov označenia pokrývajúcich všetky štandardné číselné sústavy
- Podpora vlastnej predpony pre označovanie podľa častí
- Podpora nesúvislých rozsahov s postupným číslovaním
- Možnosť zachovať alebo odstrániť existujúce označenia

## Prípady použitia

- Nastavenie rímskych číslic (i, ii, iii) pre predhovor knihy a arabských čísel pre hlavný text
- Označenie strán príloh písmenovými predponami ako „A-1“, „A-2“, „B-1“, „B-2“
- Oprava označení strán v naskenovanom dokumente, kde fyzické čísla strán nezodpovedajú poradiu strán v PDF
- Pridanie číslovania od nuly pre technické dokumenty

## Tipy

- Označenia strán sú metadáta, ktoré prehliadače PDF zobrazujú na navigačnom paneli. Na samotnej strane sa netlačia. Pre viditeľné čísla použite [Čísla strán](./page-numbers).
- Tento nástroj vyžaduje, aby bol v nastaveniach WASM nakonfigurovaný CoherentPDF (CPDF). Ak nie je nastavený, zobrazí sa výzva na jeho konfiguráciu.

## Súvisiace nástroje

- [Čísla strán](./page-numbers)
- [Batesovo číslovanie](./bates-numbering)
- [Upraviť záložky](./bookmark)

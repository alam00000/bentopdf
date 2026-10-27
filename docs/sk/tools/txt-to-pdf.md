---
title: Text do PDF
description: Preveďte textové súbory alebo napísaný text do PDF s vlastnými písmami, farbami a veľkosťami strán.
---

# Text do PDF

Preveďte čistý text na naformátované PDF. Môžete nahrať súbory `.txt` alebo písať priamo do vstavaného textového editora. Nástroj podporuje viacero písiem, vlastné farby textu a širokú škálu veľkostí strán, od A0 po A10, ako aj US Letter, Legal a Tabloid.

## Podporované formáty

| Vstup                | Prípony                              |
| :------------------- | :----------------------------------- |
| Čisté textové súbory | `.txt`                               |
| Priame zadanie textu | Napíšte alebo vložte text do editora |

## Ako to funguje

1. Prepínačom v hornej časti vyberte režim vstupu: **Nahrať súbory** alebo **Napísať text**.
2. Pri nahrávaní pretiahnite alebo kliknutím vyberte jeden či viac súborov `.txt`. Pri písaní zadajte text priamo do textového poľa.
3. Nastavte možnosti formátovania: rodinu písma, veľkosť písma, farbu textu a veľkosť strany.
4. Kliknite na **Vytvoriť PDF**. Výstup sa stiahne ako `text_to_pdf.pdf`.

Pri nahrávaní viacerých súborov sa ich obsah spojí s prázdnymi riadkami medzi nimi.

## Možnosti

| Možnosť            | Hodnoty                                                                             | Predvolené       |
| :----------------- | :---------------------------------------------------------------------------------- | :--------------- |
| **Rodina písma**   | Helvetica (bezpätkové), Tiro (pätkové), Courier (neproporcionálne), Times (pätkové) | Helvetica        |
| **Veľkosť písma**  | 6 až 72 pt                                                                          | 12               |
| **Farba textu**    | Ľubovoľná farba cez výber farby                                                     | Čierna (#000000) |
| **Veľkosť strany** | ISO A0 až A10, B0 až B10, C0 až C10, US Letter, Legal, Tabloid, Ledger, 11x17       | A4               |

Jazyky s písmom sprava doľava (arabčina, hebrejčina, perzština, urdčina) sa rozpoznajú automaticky. Keď sa nájde text RTL, smer a zarovnanie textu sa zodpovedajúco prepnú.

## Prípady použitia

- Prevod útržkov kódu alebo log súborov na tlačiteľné PDF s písmom Courier
- Rýchle vytvorenie PDF z poznámok zo stretnutia napísaných na mieste
- Naformátovanie textového rukopisu konkrétnym písmom a veľkosťou strany na odovzdanie
- Vytvorenie PDF verzie súboru README alebo changelogu na offline distribúciu

## Tipy

- Režim **Napísať text** použite, keď chcete rýchlo previesť obsah schránky bez toho, aby ste ho najprv uložili ako súbor.
- Courier (neproporcionálne) je najlepšou voľbou písma pre kód, logy alebo akýkoľvek obsah, pri ktorom záleží na zarovnaní stĺpcov.
- Okraje strany sú pevne nastavené na 72 bodov (1 palec) na všetkých stranách.

## Súvisiace nástroje

- [Markdown do PDF](./markdown-to-pdf)
- [CSV do PDF](./csv-to-pdf)
- [Word do PDF](./word-to-pdf)

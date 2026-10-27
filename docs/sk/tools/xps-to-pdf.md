---
title: XPS do PDF
description: Prevádzajte dokumenty XPS a OXPS do formátu PDF priamo v prehliadači. Bez nahrávania, bez registrácie, úplne súkromne.
---

# XPS do PDF

Prevádzajte dokumenty Microsoft XPS a OXPS do štandardných PDF súborov. XPS (XML Paper Specification) bola odpoveď Microsoftu na PDF, no jej podpora na rôznych platformách upadla. Tento nástroj tieto dokumenty opäť sprístupní všade.

## Podporované formáty

| Formát | Prípona | Poznámky                             |
| :----- | :------ | :----------------------------------- |
| XPS    | `.xps`  | Pôvodný formát Microsoft XPS         |
| OXPS   | `.oxps` | Open XPS, variant štandardu ECMA-388 |

## Ako to funguje

1. Kliknite na oblasť nahrávania alebo pretiahnite súbory XPS/OXPS. Naraz môžete vybrať viac súborov.
2. Skontrolujte zoznam súborov. Jednotlivé súbory odstráňte ikonou koša alebo kliknite na **Pridať ďalšie súbory** a pripojte ďalšie dokumenty.
3. Kliknite na **Previesť do PDF**. Engine PyMuPDF spracuje každý dokument lokálne vo vašom prehliadači.
4. Jeden súbor sa stiahne priamo ako PDF. Viac súborov sa zabalí do ZIP archívu s názvom `xps-converted.zip`.

## Možnosti

Tento nástroj vykoná priamy prevod formátu bez ďalšieho nastavenia. Výstup zachová pôvodné rozmery strán, vektorovú grafiku, písma a obrázky zo zdrojového XPS.

## Prípady použitia

- Otváranie súborov XPS zo starších systémov Windows, ktoré predvolene používali tlačový ovládač XPS
- Prevod dokumentov OXPS z Windows 10/11 na zdieľanie s používateľmi macOS alebo Linuxu
- Archivácia starších súborov XPS v rozšírenejšom formáte
- Sprístupnenie úradných alebo firemných dokumentov XPS externým príjemcom

## Tipy

- Prípony `.xps` aj `.oxps` sa spracujú automaticky -- môžete ich kombinovať v tej istej dávke.
- Ak bol pôvodný súbor XPS vytvorený tlačovým ovládačom s vysokým rozlíšením, výsledné PDF si túto kvalitu zachová. Nedochádza k prevzorkovaniu.

## Súvisiace nástroje

- [Word do PDF](./word-to-pdf)
- [XML do PDF](./xml-to-pdf)

---
title: E-mail do PDF
description: Prevádzajte e-mailové súbory EML a MSG do PDF v prehliadači. Zachováva hlavičky, telo a zoznam príloh.
---

# E-mail do PDF

Prevádzajte uložené e-mailové súbory na čisté PDF pripravené na tlač. Nástroj analyzuje súbory EML a MSG, extrahuje celú správu (hlavičky, obsah tela a metadáta príloh) a všetko vykreslí do štruktúrovaného PDF. Hodí sa na právne zisťovanie, vedenie záznamov alebo jednoducho na vytlačenie dôležitého e-mailu.

## Podporované formáty

| Formát | Prípona | Poznámky                                                     |
| :----- | :------ | :----------------------------------------------------------- |
| EML    | `.eml`  | Štandardný e-mailový formát MIME (export z väčšiny klientov) |
| MSG    | `.msg`  | Proprietárny formát Microsoft Outlook                        |

## Ako to funguje

1. Kliknite na oblasť nahrávania alebo pretiahnite súbory EML či MSG. V jednej dávke môžete kombinovať oba formáty.
2. Skontrolujte zoznam súborov. Nechcené položky odstráňte ikonou koša alebo kliknite na **Pridať ďalšie súbory** a pridajte ďalšie e-maily.
3. Nastavte možnosti prevodu (pozri nižšie).
4. Kliknite na **Previesť do PDF**. Nástroj analyzuje každý e-mail, vykreslí obsah ako štylizované HTML a prevedie ho do PDF cez engine PyMuPDF.
5. Jeden e-mail sa stiahne priamo ako PDF. Viac e-mailov sa zabalí do `emails-converted.zip`.

## Možnosti

| Možnosť                          | Predvolené | Popis                                                                                                   |
| :------------------------------- | :--------- | :------------------------------------------------------------------------------------------------------ |
| **Veľkosť strany**               | A4         | Vyberte rozmery strany A4, Letter alebo Legal.                                                          |
| **Zahrnúť kópiu a skrytú kópiu** | Zapnuté    | Ak je zapnuté, zoznamy príjemcov kópie (CC) a skrytej kópie (BCC) sa zobrazia v hlavičke e-mailu v PDF. |
| **Zahrnúť zoznam príloh**        | Zapnuté    | Ak je zapnuté, v PDF sa zobrazí zoznam príloh e-mailu (s názvami súborov a veľkosťami).                 |

## Prípady použitia

- Archivácia dôležitej obchodnej korešpondencie ako PDF kvôli súladu s predpismi alebo auditu
- Tlač e-mailových konverzácií pre súdne konania alebo žiadosti o poskytnutie dôkazov
- Vytvorenie trvalého záznamu potvrdení objednávok, účteniek alebo zmlúv prijatých e-mailom
- Zálohovanie súborov Outlook MSG vo formáte, ktorý na čítanie nevyžaduje Outlook
- Dokumentácia komunikácie so zákazníckou podporou z exportovaných súborov EML

## Tipy

- Podporované sú súbory EML (používané v Thunderbirde, Apple Mail a väčšine e-mailových klientov) aj súbory Outlook MSG. Exportujte e-maily zo svojho klienta a pretiahnite ich priamo do nástroja.
- E-maily vo formáte HTML si v PDF zachovajú štýl. Čisto textové e-maily sa vykreslia s čistým, čitateľným formátovaním.
- Zoznam príloh zobrazuje názvy súborov a veľkosti, ale samotné prílohy do PDF nevkladá.

## Súvisiace nástroje

- [XML do PDF](./xml-to-pdf)
- [XPS do PDF](./xps-to-pdf)

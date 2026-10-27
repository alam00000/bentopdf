---
title: XML do PDF
description: Prevádzajte XML súbory do štruktúrovaných PDF dokumentov priamo v prehliadači. Zadarmo, súkromne, bez spracovania na serveri.
---

# XML do PDF

Prevádzajte dátové súbory XML do čitateľných, štruktúrovaných PDF dokumentov. Surové XML je výkonné, ale pre ľudí ťažko čitateľné. Tento nástroj analyzuje strom XML, rozpozná opakujúce sa dátové štruktúry a vykreslí ich ako formátované tabuľky a sekcie v PDF formátu A4 na šírku.

## Podporované formáty

| Formát | Prípona | Poznámky                                 |
| :----- | :------ | :--------------------------------------- |
| XML    | `.xml`  | Akýkoľvek správne formovaný XML dokument |

## Ako to funguje

1. Kliknite na oblasť nahrávania alebo pretiahnite súbory XML. V jednej dávke môžete spracovať viac súborov.
2. Skontrolujte zoznam súborov. Nechcené súbory odstráňte ikonou koša alebo kliknite na **Pridať ďalšie súbory** a pridajte ďalšie.
3. Kliknite na **Previesť do PDF**. Nástroj analyzuje štruktúru XML vstavaným DOMParserom prehliadača, vyhodnotí hierarchiu dát a vykreslí ju do PDF pomocou jsPDF s formátovaním auto-table.
4. Jeden súbor sa stiahne ako PDF. Viac prevodov sa zabalí do `xml-to-pdf.zip`.

## Možnosti

Nie je potrebné žiadne ručné nastavenie. Prevodník automaticky rozpozná štruktúru XML a zvolí vhodné rozloženie tabuliek. Výstup používa orientáciu A4 na šírku, aby sa zmestili aj široké dátové sady.

## Prípady použitia

- Premena dátových exportov XML z databáz alebo API na tlačiteľné správy
- Tvorba čitateľných prehľadov z konfiguračných súborov XML
- Prevod faktúr alebo transakčných záznamov na báze XML do PDF na evidenciu
- Sprístupnenie XML sitemap alebo RSS kanálov v podobe dokumentu

## Tipy

- XML musí byť správne formované. Ak parser narazí na syntaktické chyby, prevod zlyhá s popisným chybovým hlásením, ktoré ukáže na problém.
- Hlboko vnorené štruktúry XML sa sploštia do tabuliek. Najlepšie výsledky dosiahnete, ak dáta obsahujú opakujúce sa súrodenecké prvky s konzistentnými podriadenými prvkami.
- Počas prevodu sa zobrazuje priebeh jednotlivých fáz: čítanie, analýza, vyhodnotenie a vykreslenie.

## Súvisiace nástroje

- [FB2 do PDF](./fb2-to-pdf)
- [XPS do PDF](./xps-to-pdf)
- [E-mail do PDF](./email-to-pdf)

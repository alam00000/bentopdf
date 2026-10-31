---
title: Opraviť PDF
description: Obnovte údaje z poškodených súborov PDF pomocou opravného enginu QPDF. Podporuje dávkové spracovanie.
---

# Opraviť PDF

Keď sa PDF nechce otvoriť, zobrazuje porušený obsah alebo vo vašom prehliadači spôsobuje chyby, tento nástroj sa pokúsi znovu zostaviť jeho vnútornú štruktúru. Používa opravný engine QPDF, ktorý dokáže obnoviť údaje pri mnohých typoch poškodenia: poškodené tabuľky krížových odkazov, skrátené prúdy, neplatné odkazy na objekty a ďalšie.

## Ako to funguje

1. Nahrajte jeden alebo viac poškodených súborov PDF.
2. Kliknite na **Opraviť PDF**.
3. Jeden opravený súbor sa stiahne priamo. Z viacerých súborov vznikne archív ZIP.

Nástroj spracuje každý súbor cez QPDF s prepínačom `--decrypt`, ktorý QPDF prinúti prečítať a prepísať celú štruktúru PDF a pritom opraviť obnoviteľné problémy.

## Funkcie

- Dávková oprava viacerých PDF v jednej operácii
- Automatické rozlíšenie obnoviteľných a neobnoviteľných súborov
- Hlásenie úspechu/zlyhania pre každý súbor pri spracovaní viacerých súborov
- Používa QPDF (WebAssembly), overenú knižnicu na transformáciu PDF

## Čo dokáže opraviť

- Poškodené alebo chýbajúce tabuľky krížových odkazov
- Skrátené konce súborov z neúplných stiahnutí
- Neplatné číslovanie objektov a dĺžky prúdov
- Menšie štrukturálne nezrovnalosti z chybných generátorov PDF
- Artefakty šifrovania z neúspešných pokusov o dešifrovanie

## Čo nedokáže opraviť

- Výrazne skrátené súbory, v ktorých chýba väčšina obsahových dát
- PDF zašifrované heslom, ktoré nemáte
- Súbory, ktoré v skutočnosti nie sú PDF (nesprávna prípona súboru)
- Poškodenie obrázkov v PDF (štruktúra sa opraví, ale obrazové dáta sa znovu nevytvoria)

## Prípady použitia

- Obnovenie PDF z neúspešného stiahnutia z e-mailu
- Otváranie súborov vytvorených staršími alebo neštandardnými generátormi PDF
- Oprava PDF, ktoré fungujú v jednom prehliadači, ale v inom nie
- Príprava poškodených archívnych dokumentov na dlhodobé uloženie

## Tipy

- Ak oprava zlyhá, skúste súbor najprv otvoriť vo webovom prehliadači: prehliadače majú vlastnú logiku obnovy a môžu vykresliť dosť obsahu na opätovné uloženie.
- Pri zašifrovaných PDF, ktorých oprava zlyhá, skúste najprv Dešifrovať PDF a potom opravte dešifrovaný výstup.

## Súvisiace nástroje

- [Komprimovať PDF](./compress-pdf): ďalšie vyčistenie štruktúry opraveného PDF
- [Linearizovať PDF](./linearize-pdf): optimalizácia opraveného súboru na doručovanie cez web
- [Zlúčiť vrstvy PDF](./flatten-pdf): zlúčenie formulárov, ktoré mohli byť poškodené

---
title: Zobraziť metadáta
description: Preskúmajte všetky vlastnosti metadát PDF vrátane informácií o dokumente, údajov XMP a štruktúrnych detailov.
---

# Zobraziť metadáta

Preskúmajte skryté vlastnosti vložené v PDF súbore. Nástroj zobrazí informácie o dokumente (názov, autor, dátumy), metadáta XMP, rozmery strán a ďalšie štruktúrne údaje v čitateľnej podobe.

## Ako to funguje

1. Nahrajte PDF súbor.
2. Nástroj súbor okamžite analyzuje a zobrazí všetky dostupné metadáta v prehľadných sekciách.
3. Prezrite si slovník informácií o dokumente, strom metadát XMP a štruktúrne vlastnosti.
4. Nie je potrebný žiadny krok spracovania -- metadáta sa zobrazia hneď po načítaní súboru.

## Funkcie

- Zobrazuje štandardné polia informácií o dokumente: Názov, Autor, Predmet, Kľúčové slová, Tvorca, Producent
- Zobrazuje dátumy vytvorenia a úpravy v čitateľnom formáte
- Analyzuje a vykresľuje celý strom metadát XMP s vnorenými mennými priestormi
- Prevádza formát dátumu PDF (`D:20240101120000Z`) na čitateľné dátumy
- Usporiadané do zbaliteľných sekcií pre jednoduchú navigáciu

## Sekcie metadát

| Sekcia                     | Obsah                                                                                   |
| -------------------------- | --------------------------------------------------------------------------------------- |
| **Informácie o dokumente** | Názov, Autor, Predmet, Kľúčové slová, Tvorca, Producent, Dátum vytvorenia, Dátum úpravy |
| **Metadáta XMP**           | Celý strom metadát na báze XML s mennými priestormi Dublin Core, XAP, PDF a vlastnými   |
| **Vlastnosti dokumentu**   | Počet strán, verzia PDF, veľkosť súboru, stav šifrovania                                |

## Prípady použitia

- Zistenie, kto je autorom PDF a kedy bolo naposledy upravené
- Overenie, že metadáta boli pred zverejnením dokumentu správne nastavené
- Audit súkromia PDF kontrolou, aké osobné údaje obsahuje
- Zistenie softvéru použitého na vytvorenie alebo úpravu PDF (cez pole Producent)
- Kontrola metadát XMP kvôli súladu so správou digitálnych aktív

## Tipy

- Reťazce dátumov PDF začínajúce na `D:` sa automaticky prevedú do formátu vášho miestneho časového pásma.
- Ak sú polia metadát prázdne, tvorca PDF ich jednoducho nenastavil. Nie všetky PDF obsahujú bohaté metadáta.
- Ak chcete metadáta po kontrole upraviť, použite [Upraviť metadáta](./edit-metadata). Na ich úplné odstránenie použite Odstrániť metadáta.

## Súvisiace nástroje

- [Upraviť metadáta](./edit-metadata)
- [PDF OCG (vrstvy)](./pdf-layers)
- [Porovnať PDF](./compare-pdfs)

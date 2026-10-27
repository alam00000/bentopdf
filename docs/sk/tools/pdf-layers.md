---
title: PDF OCG (vrstvy)
description: Zobrazujte, prepínajte, pridávajte a odstraňujte vrstvy Optional Content Group (OCG) v dokumente PDF.
---

# PDF OCG (vrstvy)

Spravujte skupiny voliteľného obsahu (Optional Content Groups, OCG), bežne nazývané „vrstvy“, v PDF. Môžete prepínať viditeľnosť vrstiev, pridávať nové vrstvy (vrátane vnorených podradených vrstiev), odstraňovať vrstvy a uložiť upravené PDF.

## Ako to funguje

1. Nahrajte súbor PDF.
2. Kliknutím na tlačidlo spracovania načítate dokument pomocou enginu PyMuPDF.
3. Nástroj zobrazí všetky existujúce vrstvy s ich viditeľnosťou, stavom uzamknutia a hierarchiou vnorenia.
4. Začiarkavacími políčkami vrstvy zobrazíte alebo skryjete. Uzamknuté vrstvy sa prepínať nedajú.
5. Nové vrstvy najvyššej úrovne pridáte zadaním názvu a kliknutím na tlačidlo pridania, prípadne pridajte podradené vrstvy pod existujúcu nadradenú.
6. Odstráňte vrstvy, ktoré už nepotrebujete.
7. Kliknutím na **Uložiť** stiahnete upravené PDF s použitými zmenami vrstiev.

## Funkcie

- Zobrazuje hierarchiu vrstiev so správnym odsadením vnorených vrstiev
- Zapínanie a vypínanie viditeľnosti vrstiev
- Indikátor uzamknutej vrstvy zabraňuje náhodným zmenám
- Pridávanie vrstiev najvyššej úrovne alebo podradených vrstiev s vlastnými názvami
- Odstraňovanie jednotlivých vrstiev
- Ukladá všetky zmeny do nového súboru PDF

## Prípady použitia

- Prepínanie viditeľnosti vrstiev s poznámkami v architektonických alebo technických výkresoch
- Pridávanie nových vrstiev anotácií do viacvrstvového dizajnového dokumentu
- Odstraňovanie zastaraných vrstiev zo šablóny pred jej distribúciou
- Kontrola, ktoré vrstvy existujú v zložitom PDF prijatom od tretej strany

## Tipy

- Ak PDF nemá žiadne vrstvy, nástroj zobrazí prázdny stav s výzvou na pridanie vrstvy. Nie všetky PDF používajú vrstvy OCG, najčastejšie sa vyskytujú v exportoch z CAD a v dizajnových súboroch.
- Podradené vrstvy sú vizuálne odsadené pod nadradenou vrstvou. Vrstvy môžete vnárať do ľubovoľnej hĺbky.
- Uzamknuté vrstvy sa zobrazujú s ikonou zámku a ich začiarkavacie políčka sú neaktívne. Tieto zámky nastavil autor PDF.

## Súvisiace nástroje

- [Zobraziť metadáta](./view-metadata)
- [Upraviť metadáta](./edit-metadata)
- [Duplikovať a organizovať](./organize-pdf)

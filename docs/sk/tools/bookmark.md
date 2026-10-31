---
title: Upraviť záložky
description: Pridávajte, upravujte, importujte, exportujte a odstraňujte záložky PDF pomocou vizuálneho editora s podporou CSV/JSON.
---

# Upraviť záložky

Editor záložiek vám dáva plnú kontrolu nad navigačnými záložkami PDF (nazývanými aj osnova). Môžete pridávať nové záložky, upravovať existujúce, meniť hierarchiu a importovať alebo exportovať údaje záložiek vo formátoch CSV a JSON.

## Ako to funguje

1. Nahrajte PDF kliknutím alebo pretiahnutím súboru do oblasti na nahrávanie.
2. Voliteľne zaškrtnite **Automaticky extrahovať existujúce záložky** a načítajte aktuálny strom záložiek dokumentu.
3. Editor sa otvorí v rozdelenom zobrazení: prehliadač PDF vľavo, panel záložiek vpravo.
4. Zadajte názov záložky a kliknite na **Pridať na stranu**, čím vytvoríte novú záložku odkazujúcu na aktuálnu stranu.
5. Tlačidlami na paneli nástrojov záložky presúvajte, štylizujte alebo odstraňujte.
6. Kliknite na **Uložiť PDF so záložkami** a stiahnite upravený súbor.

## Funkcie

- Vizuálny prehliadač PDF s navigáciou po stranách, ovládaním priblíženia a poľom na prechod na stranu
- Pridanie záložky na ľubovoľnú stranu jedným kliknutím
- Kliknutím priamo do PDF nastavíte presný cieľ záložky (režim výberu)
- Vnorená hierarchia záložiek s preusporiadaním pretiahnutím
- Hromadné operácie: vyberte viac záložiek a naraz zmeňte farbu, štýl alebo ich odstráňte
- Vyhľadávanie záložiek na rýchle nájdenie položiek vo veľkých stromoch
- Podpora vrátenia a opakovania pre všetky zmeny
- Import záložiek zo súborov CSV (názov, strana, úroveň) alebo JSON
- Export záložiek do CSV alebo JSON na externú úpravu
- Štýl záložiek: farba (červená, modrá, zelená, žltá, fialová) a štýl písma (tučné, kurzíva, tučná kurzíva)
- Rýchla navigácia: prechádzanie stranami klávesmi Page Up/Down

## Možnosti

- **Automaticky extrahovať existujúce záložky**: ak je zaškrtnuté, nástroj pri načítaní prečíta a zobrazí aktuálne záložky PDF.
- **Hromadný režim**: prepínač na výber viacerých záložiek a hromadnú zmenu farby, štýlu alebo odstránenie.
- **Rozbaliť/Zbaliť všetko**: rýchlo zobrazí alebo skryje vnorené podzáložky.

## Prípady použitia

- Pridanie obsahu do učebnice alebo príručky, ktorá nemá záložky
- Reorganizácia záložiek v naskenovanom dokumente po spracovaní OCR
- Export záložiek do CSV, ich úprava v tabuľkovom procesore a opätovný import
- Vyčistenie automaticky vygenerovaných záložiek s nesprávnymi odkazmi na strany
- Pridanie farebných záložiek na označenie dôležitých častí právneho podania

## Tipy

- Na hromadné vytváranie záložiek použite import CSV. Formát je jednoduchý: `title,page,level`, kde úroveň 1 je najvyššia.
- Režim výberu vám umožní kliknúť na presné miesto na strane PDF a nastaviť ho ako cieľ záložky, čo je presnejšie než len cieliť na číslo strany.
- Pred väčšími zmenami si záložky exportujte, aby ste mali zálohu.

## Súvisiace nástroje

- [Obsah](./table-of-contents)
- [Editor PDF](./edit-pdf)
- [Pridať označenia strán](./add-page-labels)

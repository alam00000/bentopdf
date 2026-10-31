---
title: Bates-nummerering
description: Anvend Bates-numre på en eller flere PDF'er med tilpasselige skabeloner, polstring, skrifttyper og placering.
---

# Bates-nummerering

Bates-nummerering stempler fortløbende identifikatorer på hver side i dine PDF'er. Det er standardmetoden til mærkning af dokumenter i retssager, revisioner og compliance-forløb. Dette værktøj understøtter flere filer og tilpasselige skabeloner og giver enten individuelt nummererede PDF'er eller ét samlet ZIP-arkiv.

## Sådan fungerer det

1. Upload en eller flere PDF-filer. Du kan trække flere filer ind på én gang.
2. Vælg et stilforvalg, eller opret en brugerdefineret skabelon.
3. Konfigurér position, skrifttype, størrelse, farve og startnumre.
4. Klik på **Anvend Bates-numre** for at behandle.
5. Én fil downloades direkte. Flere filer downloades som et ZIP-arkiv.

## Indstillinger

- **Stilforvalg** -- Vælg mellem indbyggede formater:
  - Bilag + Sag + Bates + Side (f.eks. "Exhibit 1 Case XYZ 000001 Page 1")
  - Bilag + Sag + Bates (uden sidetal)
  - Sag + Bates
  - Kun Bates-nummer (f.eks. "000001")
  - Brugerdefineret (skriv din egen skabelon)
- **Tilpas stil** -- En skabelonstreng med pladsholdere: `[BATES]`, `[PAGE]`, `[FILE]`, `[FILENAME]`.
- **Bates-polstring** -- Antal cifre (3 til 6) for Bates-numre polstret med nuller. Vises kun i brugerdefineret tilstand.
- **Position** -- Sidehoved eller sidefod, venstre, midten eller højre.
- **Bates starter fra** -- Det første Bates-nummer. Standard er 1. Nummereringen fortsætter på tværs af filer.
- **Filtæller starter fra** -- Startnummeret for pladsholderen `[FILE]`.
- **Skrifttype** -- Helvetica, Times New Roman eller Courier.
- **Skriftstørrelse** -- Størrelsen på den stemplede tekst.
- **Farve** -- Farvevælger til Bates-nummerets tekst.

## Funktioner

- Live eksempelvisning, der viser, hvordan Bates-numre vises på tværs af alle uploadede filer
- Understøttelse af flere filer med fortløbende nummerering på tværs af dokumenter
- Omarrangering af filer med træk og slip for at styre nummereringsrækkefølgen
- Seks positionsmuligheder (sidehoved/sidefod, venstre/midten/højre)
- Adaptiv beregning af margener, der tager hensyn til forskellige sidestørrelser
- ZIP-output til batches med flere filer
- Skabelonpladsholdere for maksimal fleksibilitet

## Anvendelsesområder

- Stemple dokumenter til brug i bevisindsamling i retssager med fortløbende bilagsnumre
- Nummerere revisionsbeviser, der spænder over dusinvis af filer
- Anvende regulatoriske referencenumre på compliance-dokumentation
- Mærke bilag til patentansøgninger med sagsspecifikke identifikatorer

## Tips

- Træk filerne på fillisten for at omarrangere dem, før du behandler. Bates-nummereringen følger denne rækkefølge.
- Brug pladsholderen `[FILENAME]` til at medtage det oprindelige filnavn i stemplet, hvilket gør det lettere at spore sider tilbage til kildedokumenterne.
- Eksempelboksen opdateres i realtid, når du ændrer indstillinger, så du kan kontrollere formatet, før du behandler.

## Relaterede værktøjer

- [Sidetal](./page-numbers)
- [Tilføj sideetiketter](./add-page-labels)
- [Sidehoved og sidefod](./header-footer)

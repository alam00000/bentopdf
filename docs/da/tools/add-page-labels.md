---
title: Tilføj sideetiketter
description: Tilføj PDF-sideetiketter med romertal, bogstavpræfikser, brugerdefineret nummerering og flere regler pr. dokument.
---

# Tilføj sideetiketter

Sideetiketter styrer, hvordan sidetal vises i PDF-læsere (tallet i værktøjslinjen, ikke det der er trykt på siden). Med dette værktøj kan du give forskellige sideintervaller forskellige nummereringsmåder: romertal til forsiden, decimaltal til hoveddelen, bogstaver til bilag og meget mere.

## Sådan fungerer det

1. Upload din PDF-fil.
2. Indstillingspanelet vises med én etiketregel som standard.
3. Konfigurér hver regel med et sideinterval, en stil, et valgfrit præfiks og en startværdi.
4. Klik på **Tilføj regel** for at oprette flere regler til forskellige afsnit.
5. Klik på **Tilføj sideetiketter** for at anvende alle regler og downloade resultatet.

## Indstillinger

Hver etiketregel har disse indstillinger:

- **Sideinterval** -- Hvilke sider reglen gælder for. Lad feltet stå tomt for alle sider. Understøtter intervaller som `1-4`, `7`, `odd` eller `1-9,30-40`.
- **Etiketstil** -- Arabiske decimaltal, små romertal (i, ii, iii), store romertal (I, II, III), små bogstaver (a, b, c), store bogstaver (A, B, C) eller ingen etiket (kun præfiks).
- **Etiketpræfiks** -- Valgfri tekst foran hver etiket, f.eks. "A-" for at lave etiketter som A-1, A-2, A-3.
- **Startværdi** -- Det tal, der tælles fra. Standard er 1. Sæt til 0 for nulbaseret nummerering.
- **Fortsæt nummerering på tværs af adskilte intervaller** -- Slå dette til, når en regel rammer ikke-sammenhængende sider (som `1-9,30-40` eller `odd`), og du vil have nummereringen til at fortsætte i rækkefølge.
- **Fjern eksisterende sideetiketter** -- Markeret som standard. Rydder tidligere etiketter, før dine nye regler anvendes.

## Funktioner

- Flere etiketregler pr. dokument til komplekse nummereringsskemaer
- Seks etiketstile, der dækker alle gængse nummereringssystemer
- Understøttelse af brugerdefinerede præfikser til afsnitsbaseret etikettering
- Understøttelse af adskilte intervaller med fortløbende nummerering
- Mulighed for at beholde eller fjerne eksisterende etiketter

## Anvendelsesområder

- Sætte romertalsetiketter (i, ii, iii) på en bogs forord og decimaletiketter på hovedteksten
- Etikettere bilagssider med bogstavpræfikser som "A-1", "A-2", "B-1", "B-2"
- Rette sideetiketter i et scannet dokument, hvor de fysiske sidetal ikke passer med PDF'ens siderækkefølge
- Tilføje nulbaseret nummerering til tekniske dokumenter

## Tips

- Sideetiketter er metadata, som PDF-læsere viser i deres navigationslinje. De udskrives ikke på selve siden. Til synlige tal kan du bruge [Sidetal](./page-numbers).
- Dette værktøj kræver, at CoherentPDF (CPDF) er konfigureret i dine WASM-indstillinger. Hvis det ikke er sat op, bliver du bedt om at konfigurere det.

## Relaterede værktøjer

- [Sidetal](./page-numbers)
- [Bates-nummerering](./bates-numbering)
- [Redigér bogmærker](./bookmark)

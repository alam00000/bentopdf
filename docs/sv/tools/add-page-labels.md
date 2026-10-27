---
title: Lägg till sidetiketter
description: Lägg till PDF-sidetiketter med romerska siffror, bokstavsprefix, anpassad numrering och flera regler per dokument.
---

# Lägg till sidetiketter

Sidetiketter styr hur sidnummer visas i PDF-läsare (numret som visas i verktygsfältet, inte det som är tryckt på sidan). Med det här verktyget kan du ge olika sidintervall olika etikettscheman: romerska siffror för inledande sidor, vanliga tal för huvuddelen, bokstavsmärkta bilagor och mer.

## Så fungerar det

1. Ladda upp din PDF-fil.
2. Alternativpanelen visas med en etikettregel som standard.
3. Konfigurera varje regel med sidintervall, stil, valfritt prefix och startvärde.
4. Klicka på **Lägg till regel** för att skapa fler regler för olika avsnitt.
5. Klicka på **Lägg till sidetiketter** för att tillämpa alla regler och ladda ner resultatet.

## Alternativ

Varje etikettregel har följande inställningar:

- **Sidintervall**: Vilka sidor regeln gäller för. Lämna tomt för alla sidor. Stöder intervall som `1-4`, `7`, `odd` eller `1-9,30-40`.
- **Etikettstil**: Decimala arabiska siffror, små romerska siffror (i, ii, iii), stora romerska siffror (I, II, III), små bokstäver (a, b, c), stora bokstäver (A, B, C) eller ingen etikett (endast prefix).
- **Etikettprefix**: Valfri text som läggs framför varje etikett, till exempel "A-" för att skapa etiketter som A-1, A-2, A-3.
- **Startvärde**: Talet som räkningen börjar på. Standard är 1. Ange 0 för nollbaserad numrering.
- **Fortsätt numreringen över åtskilda intervall**: Aktivera detta när en regel gäller sidor som inte följer på varandra (som `1-9,30-40` eller `odd`) och du vill att numreringen ska fortsätta i följd.
- **Ta bort befintliga sidetiketter**: Markerat som standard. Rensar tidigare etiketter innan dina nya regler tillämpas.

## Funktioner

- Flera etikettregler per dokument för komplexa numreringsscheman
- Sex etikettstilar som täcker alla vanliga numreringssystem
- Stöd för egna prefix för avsnittsbaserad märkning
- Stöd för åtskilda intervall med löpande numrering
- Möjlighet att behålla eller ta bort befintliga etiketter

## Användningsområden

- Ange etiketter med romerska siffror (i, ii, iii) för en boks förord och decimala etiketter för huvudtexten
- Märka bilagesidor med bokstavsprefix som "A-1", "A-2", "B-1", "B-2"
- Rätta sidetiketter i ett skannat dokument där de fysiska sidnumren inte stämmer med PDF-ordningen
- Lägga till nollbaserad numrering för tekniska dokument

## Tips

- Sidetiketter är metadata som PDF-läsare visar i sitt navigeringsfält. De skrivs inte ut på själva sidan. För synliga nummer använder du [Sidnummer](./page-numbers).
- Det här verktyget kräver att CoherentPDF (CPDF) är konfigurerat i dina WASM-inställningar. Om det inte är konfigurerat uppmanas du att göra det.

## Relaterade verktyg

- [Sidnummer](./page-numbers)
- [Bates-numrering](./bates-numbering)
- [Redigera bokmärken](./bookmark)

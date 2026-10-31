---
title: Skydda PDF
description: Lösenordsskydda PDF-filer med 256-bitars AES-kryptering. Ange användar- och ägarlösenord med konfigurerbara användningsbegränsningar.
---

# Skydda PDF

Lås din PDF med ett lösenord så att bara behöriga kan öppna den. BentoPDF använder 256-bitars AES-kryptering (samma standard som banker och myndigheter använder), helt i din webbläsare via QPDF.

## Så fungerar det

1. Ladda upp en PDF-fil.
2. Ange ett **användarlösenord** (obligatoriskt). Det är lösenordet som krävs för att öppna filen.
3. Ange eventuellt ett **ägarlösenord**. När det är angivet får PDF-filen användningsbegränsningar som förhindrar utskrift, redigering, kopiering och anteckningar.
4. Klicka på **Kryptera PDF**.
5. Ladda ned den krypterade filen.

## Lösenordstyper

### Användarlösenord (obligatoriskt)

Användarlösenordet är det mottagarna skriver in för att öppna PDF-filen. Utan det är dokumentet helt oåtkomligt. Varje krypterad PDF måste ha ett.

### Ägarlösenord (valfritt)

Ägarlösenordet styr vad en behörig användare kan göra efter att ha öppnat filen. När du anger ett separat ägarlösenord tillämpar BentoPDF automatiskt den strängaste uppsättningen begränsningar:

- Ändring inaktiverad
- Extrahering/kopiering inaktiverad
- Utskrift inaktiverad
- Anteckningar inaktiverade
- Ifyllning av formulär inaktiverad
- Dokumentsammanställning inaktiverad

Om du lämnar ägarlösenordet tomt krypteras PDF-filen (användarlösenordet krävs fortfarande för att öppna den) men har inga användningsbegränsningar när den väl är öppnad.

## Krypteringsdetaljer

- **Algoritm**: AES-256 (256-bitars Advanced Encryption Standard)
- **Nyckellängd**: 256 bitar
- **Standard**: PDF 2.0-kryptering (QPDF-implementation)

AES-256 är beräkningsmässigt ogenomförbart att knäcka med brute force med dagens teknik. Säkerheten hos din krypterade PDF beror helt på lösenordets styrka.

## Användningsområden

- Skydda konfidentiella ekonomiska rapporter innan de skickas med e-post
- Säkra juridiska dokument som delas med motpartens ombud
- Lägga lösenord på journaler eller personuppgifter
- Distribuera betalt innehåll (e-böcker, rapporter) med åtkomstkontroll
- Följa dataskyddspolicyer som kräver kryptering av lagrade data

## Tips

- Använd ett starkt, unikt lösenord. En lösenfras på 12 tecken eller fler med versaler, gemener, siffror och symboler är idealisk.
- Dela lösenordet via en separat kanal (telefon, sms) och aldrig i samma e-post som PDF-filen.
- Om du bara vill begränsa åtgärder (ingen utskrift, ingen kopiering) utan att kräva lösenord för att öppna filen, använd verktyget Ändra behörigheter i stället.

## Relaterade verktyg

- [Lås upp PDF](./unlock-pdf): ta bort kryptering när du känner till lösenordet
- [Ändra behörigheter](./change-permissions): ändra specifika användningsbegränsningar
- [Ta bort begränsningar](./remove-restrictions): ta bort all säkerhet från en PDF
- [Sanera PDF](./sanitize-pdf): ta bort dolt innehåll innan du krypterar

---
title: E-post till PDF
description: Konvertera e-postfiler i formaten EML och MSG till PDF i webbläsaren. Bevarar sidhuvuden, brödtext och bilagelista.
---

# E-post till PDF

Konvertera sparade e-postfiler till rena, utskrivbara PDF-filer. Verktyget tolkar EML- och MSG-filer, extraherar hela meddelandet (sidhuvuden, brödtext och bilagemetadata) och återger allt i en strukturerad PDF. Användbart för juridisk bevisinsamling, arkivering eller bara för att skriva ut ett viktigt e-postmeddelande.

## Format som stöds

| Format | Filändelse | Anmärkningar                                                             |
| :----- | :--------- | :----------------------------------------------------------------------- |
| EML    | `.eml`     | Standardformat för MIME-e-post (exporteras från de flesta e-postprogram) |
| MSG    | `.msg`     | Microsoft Outlooks egna format                                           |

## Så fungerar det

1. Klicka på uppladdningsytan eller dra och släpp dina EML- eller MSG-filer. Du kan blanda båda formaten i samma batch.
2. Granska fillistan. Ta bort oönskade poster med papperskorgsikonen, eller klicka på **Lägg till fler filer** för att ta med fler e-postmeddelanden.
3. Konfigurera konverteringsalternativen (se nedan).
4. Klicka på **Konvertera till PDF**. Verktyget tolkar varje e-postmeddelande, återger innehållet som formaterad HTML och konverterar det till PDF via PyMuPDF-motorn.
5. Ett enskilt e-postmeddelande laddas ner direkt som en PDF. Flera e-postmeddelanden paketeras i `emails-converted.zip`.

## Alternativ

| Alternativ                | Standard | Beskrivning                                                                                            |
| :------------------------ | :------- | :----------------------------------------------------------------------------------------------------- |
| **Sidstorlek**            | A4       | Välj mellan sidmåtten A4, Letter eller Legal.                                                          |
| **Inkludera Cc och Bcc**  | På       | När det är aktiverat visas mottagarlistorna för Cc och Bcc i e-postens sidhuvudsavsnitt i PDF-filen.   |
| **Inkludera bilagelista** | På       | När det är aktiverat visas en lista över e-postens filbilagor (med filnamn och storlekar) i PDF-filen. |

## Användningsfall

- Arkivera viktig affärskorrespondens som PDF för efterlevnad eller revision
- Skriva ut e-posttrådar för rättsliga förfaranden eller begäranden om bevisinsamling
- Skapa en permanent post över orderbekräftelser, kvitton eller avtal som mottagits via e-post
- Säkerhetskopiera Outlook MSG-filer i ett format som inte kräver Outlook för att läsas
- Dokumentera kundsupportärenden från exporterade EML-filer

## Tips

- Både EML (används av Thunderbird, Apple Mail och de flesta e-postprogram) och Outlook MSG-filer stöds. Exportera e-postmeddelanden från ditt e-postprogram och släpp dem direkt i verktyget.
- HTML-formaterade e-postmeddelanden behåller sin formatering i PDF-filen. E-postmeddelanden i ren text återges med en ren och läsbar formatering.
- Bilagelistan visar filnamn och storlekar men bäddar inte in själva bilagefilerna i PDF-filen.

## Relaterade verktyg

- [XML till PDF](./xml-to-pdf)
- [XPS till PDF](./xps-to-pdf)

---
title: Markdown till PDF
description: Skriv eller klistra in Markdown och exportera det som en professionellt formaterad PDF med liveförhandsgranskning och syntaxmarkering.
---

# Markdown till PDF

En fullfjädrad Markdown-redigerare med liveförhandsgranskning och PDF-export med ett klick. Skriv från grunden, ladda upp en befintlig `.md`-fil eller klistra in innehåll från urklipp. Redigeraren renderar din Markdown i realtid och exporterar en formaterad PDF med webbläsarens inbyggda utskriftsmotor.

## Format som stöds

| Indata           | Beskrivning                          |
| :--------------- | :----------------------------------- |
| `.md`-filer      | Ladda upp med knappen Ladda upp      |
| Direkt inmatning | Skriv eller klistra in i redigeraren |

## Så fungerar det

1. Öppna verktyget Markdown till PDF. Redigeraren laddas med delad vy: Markdown-källa till vänster, renderad förhandsgranskning till höger.
2. Skriv din Markdown, klistra in den eller klicka på **Ladda upp** för att läsa in en `.md`-fil.
3. Växla mellan ljust och mörkt tema med temareglaget i verktygsfältet.
4. Klicka på **Exportera PDF** (eller tryck på `Ctrl/Cmd + S`) för att skapa en PDF via webbläsarens utskriftsdialog.

## Funktioner

Redigeraren stöder en omfattande uppsättning Markdown-funktioner utöver grunderna:

- **Standard-Markdown**: rubriker, fet stil, kursiv stil, länkar, bilder, listor, blockcitat, horisontella linjer
- **Kodblock** med syntaxmarkering för över 15 språk (JavaScript, TypeScript, Python, Go, Rust, SQL, Java, C#, C++, YAML, Bash med flera)
- **Mermaid-diagram**: flödesscheman, sekvensdiagram, ER-diagram och andra Mermaid-diagramtyper renderas direkt i förhandsgranskningen
- **Tabeller** med standardsyntax för Markdown-tabeller
- **Uppgiftslistor** med kryssrutor
- **Fotnoter**, **nedsänkt text**, **upphöjd text**
- **Definitionslistor**, **förkortningar**
- Stöd för **emoji** (`:smile:` renderas som emojin)
- **Markeringar** (`==marked text==`) och **infogningar** (`++inserted text++`)
- **Automatiskt länkade webbadresser**: vanliga webbadresser omvandlas till klickbara länkar
- Generering av **innehållsförteckning**
- **Ankarlänkar** på rubriker

## Användningsområden

- Skriva projektdokumentation och exportera en polerad PDF till intressenter
- Skapa tekniska rapporter med kodexempel och Mermaid-arkitekturdiagram
- Konvertera en GitHub-README till PDF för offlineanvändning eller utskrift
- Skriva ett förslag eller en specifikation med uppgiftslistor och tabeller
- Generera ett formaterat utdelningsblad från föreläsningsanteckningar skrivna i Markdown

## Tips

- PDF-resultatet använder webbläsarens funktion för att skriva ut till PDF. I Chrome kan du anpassa marginaler och skala i utskriftsdialogen innan du sparar.
- Mermaid-diagram renderas i förhandsgranskningen men kan behöva en stund för att initieras vid första användningen.
- Använd `Ctrl/Cmd + S` som kortkommando för att exportera utan att leta efter knappen.

## Relaterade verktyg

- [Text till PDF](./txt-to-pdf)
- [Word till PDF](./word-to-pdf)
- [JSON till PDF](./json-to-pdf)

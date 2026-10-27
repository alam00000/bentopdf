---
title: Paginalabels toevoegen
description: Voeg PDF-paginalabels toe met Romeinse cijfers, letter-voorvoegsels, aangepaste nummering en meerdere regels per document.
---

# Paginalabels toevoegen

Paginalabels bepalen hoe paginanummers in PDF-viewers worden weergegeven (het nummer in de werkbalk, niet op de pagina zelf gedrukt). Met deze tool wijs je verschillende labelschema's toe aan verschillende paginabereiken: Romeinse cijfers voor de inleiding, gewone cijfers voor de hoofdtekst, bijlagen met letters en meer.

## Hoe het werkt

1. Upload je PDF-bestand.
2. Het optiespaneel verschijnt met standaard één labelregel.
3. Stel elke regel in met een paginabereik, stijl, optioneel voorvoegsel en startwaarde.
4. Klik op **Regel toevoegen** om extra regels voor andere secties te maken.
5. Klik op **Paginalabels toevoegen** om alle regels toe te passen en het resultaat te downloaden.

## Opties

Elke labelregel heeft deze instellingen:

- **Paginabereik** -- Op welke pagina's de regel van toepassing is. Laat leeg voor alle pagina's. Ondersteunt bereiken zoals `1-4`, `7`, `odd` of `1-9,30-40`.
- **Labelstijl** -- Decimaal Arabisch, Romeinse kleine letters (i, ii, iii), Romeinse hoofdletters (I, II, III), kleine letters (a, b, c), hoofdletters (A, B, C) of Geen label (alleen voorvoegsel).
- **Labelvoorvoegsel** -- Optionele tekst vóór elk label, zoals "A-" voor labels als A-1, A-2, A-3.
- **Startwaarde** -- Het getal waarmee het tellen begint. Standaard 1. Stel in op 0 voor nummering vanaf nul.
- **Nummering voortzetten over losse bereiken** -- Schakel dit in als een regel niet-aaneengesloten pagina's omvat (zoals `1-9,30-40` of `odd`) en je wilt dat de nummering doorloopt.
- **Bestaande paginalabels verwijderen** -- Standaard aangevinkt. Wist eventuele eerdere labels voordat je nieuwe regels worden toegepast.

## Functies

- Meerdere labelregels per document voor complexe nummeringsschema's
- Zes labelstijlen die alle gangbare nummeringssystemen dekken
- Ondersteuning voor eigen voorvoegsels voor labels per sectie
- Ondersteuning voor losse bereiken met doorlopende nummering
- Optie om bestaande labels te behouden of te verwijderen

## Toepassingen

- Romeinse cijfers (i, ii, iii) instellen voor het voorwoord van een boek en gewone cijfers voor de hoofdtekst
- Bijlagepagina's labelen met letter-voorvoegsels zoals "A-1", "A-2", "B-1", "B-2"
- Paginalabels corrigeren in een gescand document waarvan de fysieke paginanummers niet overeenkomen met de PDF-paginavolgorde
- Nummering vanaf nul toevoegen voor technische documenten

## Tips

- Paginalabels zijn metadata die PDF-viewers in hun navigatiewerkbalk tonen. Ze worden niet op de pagina zelf afgedrukt. Gebruik voor zichtbare nummers [Paginanummers](./page-numbers).
- Voor deze tool moet CoherentPDF (CPDF) zijn ingesteld in je WASM-instellingen. Is dat niet het geval, dan word je gevraagd het in te stellen.

## Gerelateerde tools

- [Paginanummers](./page-numbers)
- [Bates-nummering](./bates-numbering)
- [Bladwijzers bewerken](./bookmark)

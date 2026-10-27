---
title: Koptekst en voettekst
description: Voeg aanpasbare koptekst en voettekst toe aan PDF-pagina's met dynamische variabelen voor paginanummers.
---

# Koptekst en voettekst

Voeg tekst toe op zes posities op je PDF-pagina's: koptekst links, midden en rechts, en voettekst links, midden en rechts. De tool ondersteunt dynamische variabelen voor paginanummers en het totale aantal pagina's, zodat je sjablonen als "Pagina 3 van 10" kunt maken die per pagina automatisch worden bijgewerkt.

## Zo werkt het

1. Upload je PDF-bestand.
2. Het optiepaneel verschijnt met opmaakinstellingen en zes tekstvelden.
3. Voer je gewenste tekst in op een van de posities voor koptekst of voettekst.
4. Gebruik de plaatshouders `{page}` en `{total}` voor dynamische paginanummering.
5. Pas lettergrootte en letterkleur aan en beperk het eventueel tot een bepaald paginabereik.
6. Klik op **Koptekst en voettekst toevoegen** om te verwerken en te downloaden.

## Opties

- **Paginabereik**: Beperk optioneel welke pagina's een koptekst en voettekst krijgen. Laat leeg om op alle pagina's toe te passen. Notatie: "1-3, 5" (bereiken gescheiden door komma's).
- **Lettergrootte**: Tussen 6 en 24 punten. Standaard 10.
- **Letterkleur**: Kies een willekeurige kleur met de kleurkiezer.
- **Koptekst links / midden / rechts**: Tekstvelden voor de bovenkant van elke pagina.
- **Voettekst links / midden / rechts**: Tekstvelden voor de onderkant van elke pagina.

## Functies

- Zes onafhankelijke tekstposities per pagina
- Dynamische variabele `{page}` die het huidige paginanummer invoegt
- Dynamische variabele `{total}` die het totale aantal pagina's invoegt
- Filteren op paginabereik om specifieke pagina's te kiezen
- Aanpasbare lettergrootte en kleur
- Helvetica-lettertype voor een verzorgd, professioneel resultaat

## Toepassingen

- "Pagina {page} van {total}" toevoegen in het midden van de voettekst van een rapport
- Een bedrijfsnaam links in de koptekst en een documentdatum rechts in de koptekst plaatsen
- Vertrouwelijkheidsverklaringen toevoegen aan de voettekst van juridische documenten
- Revisienummers van documenten stempelen op specifieke paginabereiken

## Tips

- Combineer `{page}` en `{total}` in één veld voor notaties als "Pagina {page} van {total}" of "{page}/{total}".
- Je kunt de meeste velden leeg laten en alleen de posities invullen die je nodig hebt. Lege velden worden gewoon overgeslagen.
- Voor complexere kopteksten met afbeeldingen of logo's kun je de tool [Watermerk toevoegen](./add-watermark) gebruiken, bovenaan de pagina geplaatst.

## Gerelateerde tools

- [Paginanummers](./page-numbers)
- [Watermerk toevoegen](./add-watermark)
- [Bates-nummering](./bates-numbering)

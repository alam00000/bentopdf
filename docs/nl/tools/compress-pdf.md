---
title: PDF comprimeren
description: Verklein de bestandsgrootte van een PDF tot wel 90% met de Hyper Compress-engine. Ondersteunt doelbestandsgroottes, bewerking in reeksen en eigen kwaliteitsinstellingen.
---

# PDF comprimeren

Maak je PDF-bestanden kleiner zonder ze te beschadigen. PDF comprimeren draait op [Hyper Compress](https://www.bentopdf.com/hyper-compress), de eigen compressie-engine van BentoPDF. Die comprimeert afbeeldingen opnieuw, maakt subsets van lettertypen en voegt ze samen, en verwijdert overbodige onderdelen zoals ingesloten miniaturen en privé-toepassingsgegevens. De PDF blijft volledig functioneel: tekst blijft selecteerbaar en koppelingen en formuliervelden blijven werken.

Hyper Compress is gecompileerd naar WebAssembly en wordt met BentoPDF meegeleverd, dus compressie werkt offline en in air-gapped omgevingen zonder extra installatie.

## Zo werkt het

1. Upload een of meer PDF's door op het uploadvak te klikken of bestanden erheen te slepen.
2. Kies een **Compressieniveau**: Laag, Gemiddeld, Hoog of Verliesvrij.
3. Voer eventueel een **Doelbestandsgrootte** in, of vouw **Aangepaste instellingen** uit voor fijnere controle, inclusief **Converteren naar grijstinten**.
4. Klik op **PDF comprimeren**. Bij meerdere bestanden krijg je één ZIP-download.

## Speciale documenten

- **Digitaal ondertekende PDF's** worden ongewijzigd teruggegeven, omdat elke wijziging de handtekening ongeldig zou maken. Schakel onder Aangepaste instellingen **Inhoudsbescherming negeren** in om de handtekeningen te verwijderen en toch te comprimeren. De zichtbare handtekening blijft op de pagina staan, maar het bestand is niet langer ondertekend.
- **PDF/A-bestanden** verliezen na compressie hun PDF/A-label, zodat het bestand nooit een conformiteit claimt waaraan het niet meer voldoet. Schakel onder Aangepaste instellingen **PDF/A behouden** in om het bestand juist conform te houden.
- **Met een wachtwoord beveiligde PDF's** krijgen een wachtwoordveld op hun bestandskaart. Voer daar het wachtwoord in en Hyper Compress opent het bestand zelf, zonder aparte ontgrendelstap. Bij twee of meer vergrendelde bestanden ontgrendelt één gedeeld veld alle bestanden met hetzelfde wachtwoord. De gecomprimeerde kopie heeft geen wachtwoord; gebruik [PDF versleutelen](./protect-pdf) om er opnieuw een toe te voegen.
- **Scans zonder tekstlaag** kunnen nog verder krimpen met **Pagina's rasteriseren** onder Aangepaste instellingen, waarmee elke pagina wordt vervangen door één geoptimaliseerde afbeelding. Dit wordt overgeslagen voor elk document met selecteerbare tekst, inclusief scans met OCR, tenzij **Inhoudsbescherming negeren** aanstaat. Dan worden ook tekstpagina's afbeeldingen, zodat tekst niet meer selecteerbaar is en koppelingen niet meer werken.

## Compressieniveaus

| Niveau          | Afbeeldingskwaliteit     | Max. resolutie | Het best voor                        |
| --------------- | ------------------------ | -------------- | ------------------------------------ |
| **Laag**        | 80                       | 200 DPI        | Visuele kwaliteit behouden           |
| **Gemiddeld**   | 50                       | 150 DPI        | Alledaagse documenten                |
| **Hoog**        | 20                       | 72 DPI         | E-mailbijlagen, uploads naar het web |
| **Verliesvrij** | Afbeeldingen onaangetast | Ongewijzigd    | Archiefkopieën                       |

Hoog haalt ook de 14 standaard-PDF-lettertypen uit het bestand, plus lookalikes zoals Arial wanneer dat veilig kan.

## Doelbestandsgrootte

Voer een grootte in KB of MB in en Hyper Compress zoekt de beste afbeeldingskwaliteit die nog binnen die grootte past, uitgaand van het gekozen niveau. Als het document niet zo klein kan worden, krijg je de kleinste versie die mogelijk is, met een melding daarover. De speciale pagina's, zoals [PDF comprimeren tot 1 MB](https://www.bentopdf.com/compress-pdf-to-1mb), openen met het doel al ingevuld.

## Aangepaste instellingen

Vouw het paneel Aangepaste instellingen uit om Hyper Compress rechtstreeks af te stemmen. Als je een compressieniveau kiest, worden deze instellingen teruggezet naar de waarden van dat niveau, en zodra je er een wijzigt, schakelt het niveau over naar Aangepast.

- **Inhoudsbescherming negeren**: standaard laat Hyper Compress ondertekende PDF's ongemoeid en rasteriseert het geen pagina's met tekst. Als je dit inschakelt, worden beide omzeild. De instelling blijft aan als je het niveau wijzigt.

- **Afbeeldingen**: afbeeldingskwaliteit, maximale resolutie, geforceerd opnieuw samplen, kleurreductie, onzichtbare afbeeldingsgebieden wegsnijden, alternatieve afbeeldingen verwijderen, kleurprofielen vereenvoudigen, JPEG 2000 en verliesvrije modus
- **Lettertypen**: subsets maken, duplicaten samenvoegen en standaardlettertypen en hun lookalikes niet insluiten
- **Inhoud**: annotaties, formuliervelden of koppelingen platmaken
- **Opschonen**: miniaturen, toepassingsgegevens, artikelreeksen, webopnamegegevens, de structuurboom of uitvoerintenties verwijderen
- **Rasteriseren**: pagina's vervangen door afbeeldingen, voor scans met alleen afbeeldingen; wordt overgeslagen als het document selecteerbare tekst heeft
- **Uitvoer**: PDF/A behouden en Brotli-compressie voor PDF 2.0-lezers die dit ondersteunen

## Toepassingen

- Een rapport van 50 MB onder de limiet voor e-mailbijlagen brengen
- Een scan onder de strikte uploadlimiet van een portaal krijgen met een doelbestandsgrootte
- PDF's voor marketing optimaliseren voor snellere downloads van een website
- Grote documentenverzamelingen archiveren waarbij opslagkosten ertoe doen
- Het mobiele datagebruik verminderen bij het delen van PDF's via berichtenapps

## Tips

- Begin met Gemiddeld. Is het resultaat nog te groot, stel dan een doelbestandsgrootte in of ga naar Hoog.
- Zet voor een scan zonder tekstlaag **Pagina's rasteriseren** aan onder Aangepaste instellingen.
- Converteren naar grijstinten, onder Aangepaste instellingen, kan de bestandsgrootte van kleurrijke documenten flink verkleinen.

## Gerelateerde tools

- [PDF lineariseren](./linearize-pdf): optimaliseer de gecomprimeerde PDF voor snel bekijken op het web
- [PDF rasteriseren](./rasterize-pdf): zet pagina's om naar afbeeldingen met een bepaalde DPI, ook pagina's met tekst
- [PDF repareren](./repair-pdf): herstel een PDF die elders tijdens het comprimeren is beschadigd
- [Metadata verwijderen](./remove-metadata): verwijder verborgen gegevens voor je privacy

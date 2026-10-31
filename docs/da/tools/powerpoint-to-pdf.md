---
title: PowerPoint til PDF
description: Konvertér PowerPoint-præsentationer (PPT, PPTX) og ODP-filer til PDF med bevaret slideformatering.
---

# PowerPoint til PDF

Konvertér præsentationsfiler til PDF. Hvert slide bliver til en side i det resulterende dokument, hvor tekst, billeder, figurer og overgange gengives via en LibreOffice-motor i browseren. Understøtter både moderne og ældre PowerPoint-formater samt OpenDocument Presentation-formatet.

## Understøttede formater

| Format                    | Filendelser |
| :------------------------ | :---------- |
| PowerPoint (moderne)      | `.pptx`     |
| PowerPoint (ældre)        | `.ppt`      |
| OpenDocument Presentation | `.odp`      |

## Sådan fungerer det

1. Klik på uploadområdet, eller træk og slip dine præsentationsfiler.
2. Gennemgå fillisten. Tilføj flere eller fjern filer efter behov.
3. Klik på **Konvertér til PDF**. LibreOffice-motoren indlæses ved første brug og konverterer derefter hver fil.
4. En enkelt fil downloades direkte som PDF. Flere filer pakkes i `powerpoint-converted.zip`.

## Indstillinger

Dette værktøj har ingen yderligere indstillinger. Slides gengives i deres oprindelige dimensioner.

## Resultat

| Antal filer | Resultat                                                         |
| :---------- | :--------------------------------------------------------------- |
| 1 fil       | Enkelt PDF-download (oprindeligt filnavn med filendelsen `.pdf`) |
| 2+ filer    | ZIP-arkiv (`powerpoint-converted.zip`) med én PDF pr. fil        |

## Anvendelsesmuligheder

- Konvertere en præsentation til PDF, før den deles med et publikum, der måske ikke har PowerPoint
- Lave en udskrivbar håndoutversion af et slideshow til en konference eller workshop
- Arkivere præsentationer i et format, der ser ens ud på alle enheder
- Batchkonvertere et bibliotek af ODP-præsentationer fra LibreOffice Impress til PDF
- Lave en PDF-version af en pitch deck til e-mailvedhæftning

## Tips

- Slideanimationer og overgange kan ikke repræsenteres i PDF. Hvert slide gemmes som en statisk side.
- Indlejrede videoer vises ikke i resultatet. Erstat dem om nødvendigt med et skærmbillede eller en pladsholder.
- Talernoter er ikke med i standard-PDF-eksporten. Har du brug for noter, så eksportér først fra PowerPoints egen visning "Udskriv noter".
- LibreOffice-motoren caches efter første indlæsning, så en anden præsentation i samme session konverteres meget hurtigere.

## Relaterede værktøjer

- [Word til PDF](./word-to-pdf)
- [Excel til PDF](./excel-to-pdf)
- [Billeder til PDF](./image-to-pdf)

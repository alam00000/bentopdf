---
title: PDF til Markdown
description: Konvertér PDF-dokumenter til Markdown-format med valgfri billedudtrækning. Understøtter batchkonvertering af flere filer.
---

# PDF til Markdown

Konverterer PDF-filer til Markdown-format (`.md`) og bevarer overskrifter, afsnit, lister og grundlæggende formatering. Udtrækker og medtager eventuelt indlejrede billeder. Understøtter konvertering af enkeltfiler og batchkonvertering. Drevet af PyMuPDF.

## Sådan fungerer det

1. Upload en eller flere PDF-filer ved at klikke på slipområdet eller trække filer hen på det.
2. Slå eventuelt **Medtag billeder** til for at indlejre udtrukne billeder i Markdown-outputtet.
3. Klik på **Konvertér** for at starte behandlingen.
4. En enkelt fil downloades som `filename.md`. Flere filer giver en `markdown-files.zip`.

## Indstillinger

- **Medtag billeder**: når det er markeret, udtrækkes indlejrede billeder fra PDF'en og refereres i Markdown-outputtet. Når det ikke er markeret, konverteres kun tekstindholdet.

## Outputformat

- **Enkelt fil**: `filename.md`
- **Flere filer**: `markdown-files.zip` med én `.md` pr. input-PDF.

## Anvendelser

- Konvertere PDF-dokumentation til Markdown til en statisk site-generator som VitePress, Hugo eller Jekyll.
- Gøre PDF-forskningsartikler til redigerbar Markdown til notatapps som Obsidian.
- Migrere ældre PDF-vidensbaser til et Git-venligt tekstformat.
- Udtrække struktureret indhold fra PDF-e-bøger til omformatering.

## Tips

- Indstillingen Medtag billeder er nyttig, når PDF'en indeholder diagrammer eller figurer, der er afgørende for indholdet. Slå den fra for teksttunge dokumenter for at holde outputtet rent.
- Komplekse layouts med sidebjælker, fodnoter eller tekst i flere kolonner kan give ufuldkommen Markdown. Gennemgå og justér outputtet efter behov.
- Til rå tekst uden formatering kan du i stedet bruge [PDF til tekst](./pdf-to-text).

## Relaterede værktøjer

- [PDF til tekst](./pdf-to-text)
- [PDF til Word](./pdf-to-word)
- [Forbered PDF til AI](./prepare-pdf-for-ai)

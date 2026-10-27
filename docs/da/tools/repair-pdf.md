---
title: Reparér PDF
description: Gendan data fra korrupte eller beskadigede PDF-filer med QPDF's reparationsmotor. Understøtter batchbehandling.
---

# Reparér PDF

Når en PDF ikke vil åbne, viser forvansket indhold eller udløser fejl i din læser, forsøger dette værktøj at genopbygge dens interne struktur. Det bruger QPDF's reparationsmotor, der kan genskabe data fra mange typer korruption: ødelagte krydsreferencetabeller, afkortede strømme, ugyldige objektreferencer og mere.

## Sådan fungerer det

1. Upload en eller flere beskadigede PDF-filer.
2. Klik på **Reparér PDF**.
3. En enkelt repareret fil downloades direkte. Flere filer giver et ZIP-arkiv.

Værktøjet sender hver fil gennem QPDF med flaget `--decrypt`, som tvinger QPDF til at læse og omskrive hele PDF-strukturen og rette de problemer, der kan rettes, undervejs.

## Funktioner

- Batchreparation af flere PDF'er i én handling
- Automatisk registrering af filer, der kan genskabes, og filer, der ikke kan
- Rapportering af succes/fejl pr. fil ved behandling af flere filer
- Bruger QPDF (WebAssembly), et gennemtestet bibliotek til PDF-transformation

## Hvad den kan rette

- Ødelagte eller manglende krydsreferencetabeller
- Afkortede filender fra ufuldstændige downloads
- Ugyldig objektnummerering og strømlængder
- Mindre strukturelle uoverensstemmelser fra fejlbehæftede PDF-generatorer
- Krypteringsartefakter fra mislykkede dekrypteringsforsøg

## Hvad den ikke kan rette

- Kraftigt afkortede filer, hvor det meste af indholdet mangler
- PDF'er krypteret med en adgangskode, du ikke har
- Filer, der ikke i virkeligheden er PDF'er (forkert filendelse)
- Billedkorruption i PDF'en (strukturen rettes, men pixeldata genskabes ikke)

## Anvendelsesmuligheder

- Gendanne en PDF fra en mislykket e-maildownload
- Åbne filer fra ældre eller ikke-standardiserede PDF-generatorer
- Rette PDF'er, der virker i én læser, men ikke i en anden
- Forberede beskadigede arkivdokumenter til langtidsopbevaring

## Tips

- Hvis reparationen mislykkes, så prøv først at åbne filen i en browser. Browsere har deres egen gendannelseslogik og kan vise nok indhold til at gemme den igen.
- Til krypterede PDF'er, hvor reparationen mislykkes, så prøv først Dekryptér PDF og reparér derefter den dekrypterede fil.

## Relaterede værktøjer

- [Komprimer PDF](./compress-pdf): ryd yderligere op i den reparerede PDF's struktur
- [Lineariser PDF](./linearize-pdf): optimer den reparerede fil til webdistribution
- [Fladgør PDF](./flatten-pdf): flad formularer ud, som kan være blevet beskadiget

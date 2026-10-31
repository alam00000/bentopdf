---
title: Repara PDF
description: Recupera dades de fitxers PDF corruptes o danyats amb el motor de reparació de QPDF. Admet processament per lots.
---

# Repara PDF

Quan un PDF no s'obre, mostra contingut il·legible o provoca errors al visor, aquesta eina intenta reconstruir-ne l'estructura interna. Utilitza el motor de reparació de QPDF, que pot recuperar dades de molts tipus de corrupció: taules de referències creuades trencades, fluxos truncats, referències d'objecte no vàlides i més.

## Com funciona

1. Puja un o més fitxers PDF danyats.
2. Fes clic a **Repara PDF**.
3. Un sol fitxer reparat es descarrega directament. Diversos fitxers produeixen un arxiu ZIP.

L'eina passa cada fitxer per QPDF amb l'indicador `--decrypt`, que força QPDF a llegir i reescriure tota l'estructura del PDF, corregint pel camí els problemes recuperables.

## Funcions

- Reparació per lots de diversos PDF en una sola operació
- Detecció automàtica de fitxers recuperables i no recuperables
- Informe d'èxit o error per fitxer quan se'n processen diversos
- Utilitza QPDF (WebAssembly), una biblioteca de transformació de PDF molt contrastada

## Què pot corregir

- Taules de referències creuades trencades o inexistents
- Finals de fitxer truncats per descàrregues incompletes
- Numeració d'objectes i longituds de flux no vàlides
- Incoherències estructurals menors de generadors de PDF amb errors
- Artefactes de xifratge d'intents de desxifratge fallits

## Què no pot corregir

- Fitxers molt truncats on falta la major part de les dades de contingut
- PDF xifrats amb una contrasenya que no tens
- Fitxers que en realitat no són PDF (extensió de fitxer incorrecta)
- Corrupció d'imatges dins del PDF (l'estructura es corregeix, però les dades de píxels no es regeneren)

## Casos d'ús

- Recuperar un PDF d'una descàrrega de correu fallida
- Obrir fitxers produïts per generadors de PDF antics o no estàndard
- Corregir PDF que funcionen en un visor però no en un altre
- Preparar documents d'arxiu danyats per a l'emmagatzematge a llarg termini

## Consells

- Si la reparació falla, prova d'obrir primer el fitxer en un navegador: els navegadors tenen la seva pròpia lògica de recuperació i potser renderitzen prou contingut per tornar-lo a desar.
- Per als PDF xifrats que fallen en la reparació, prova primer Desxifra PDF i després repara el resultat desxifrat.

## Eines relacionades

- [Comprimeix PDF](./compress-pdf): neteja encara més l'estructura del PDF reparat
- [Linealitza PDF](./linearize-pdf): optimitza el fitxer reparat per a la distribució web
- [Aplana PDF](./flatten-pdf): aplana formularis que poden haver quedat danyats

---
title: PDF a Markdown
description: Converteix documents PDF a format Markdown amb extracció opcional d'imatges. Admet la conversió en lot de diversos fitxers.
---

# PDF a Markdown

Converteix fitxers PDF a format Markdown (`.md`) conservant els encapçalaments, els paràgrafs, les llistes i el format bàsic. Opcionalment extreu i inclou les imatges incrustades. Admet la conversió individual i en lot. Funciona amb PyMuPDF.

## Com funciona

1. Carrega un o més PDF fent clic a la zona de càrrega o arrossegant-hi fitxers.
2. Opcionalment, activa **Inclou les imatges** per incrustar les imatges extretes a la sortida Markdown.
3. Fes clic a **Converteix** per iniciar el processament.
4. Un sol fitxer es baixa com a `filename.md`. Diversos fitxers generen un `markdown-files.zip`.

## Opcions

- **Inclou les imatges**: quan està marcada, les imatges incrustades del PDF s'extreuen i es referencien a la sortida Markdown. Quan no ho està, només es converteix el contingut de text.

## Format de sortida

- **Un fitxer**: `filename.md`
- **Diversos fitxers**: `markdown-files.zip` amb un `.md` per a cada PDF d'entrada.

## Casos d'ús

- Convertir documentació en PDF a Markdown per a un generador de llocs estàtics com VitePress, Hugo o Jekyll.
- Convertir treballs de recerca en PDF a Markdown editable per a aplicacions de notes com Obsidian.
- Migrar bases de coneixement antigues en PDF a un format de text compatible amb Git.
- Extreure contingut estructurat de llibres electrònics en PDF per reformatar-lo.

## Consells

- L'opció Inclou les imatges és útil quan el PDF conté diagrames o figures essencials per al contingut. Desactiva-la en documents amb molt de text per mantenir la sortida neta.
- Els dissenys complexos amb barres laterals, notes al peu o text en diverses columnes poden produir un Markdown imperfecte. Revisa i ajusta la sortida si cal.
- Per a text en brut sense cap format, utilitza [PDF a text](./pdf-to-text).

## Eines relacionades

- [PDF a text](./pdf-to-text)
- [PDF a Word](./pdf-to-word)
- [Prepara el PDF per a IA](./prepare-pdf-for-ai)

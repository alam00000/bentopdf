---
title: PDF a text
description: Extreu el contingut de text net de fitxers PDF. Admet l'extracció en lot de diversos PDF amb sortida en fitxers TXT.
---

# PDF a text

Extreu tot el contingut de text de fitxers PDF i el desa com a fitxers `.txt` de text net. Admet el processament en lot: carrega diversos PDF i obtén el text de cadascun en una sola operació. Funciona amb PyMuPDF.

## Com funciona

1. Carrega un o més PDF fent clic a la zona de càrrega o arrossegant-hi fitxers. Gestiona la llista de fitxers amb els botons Afegeix més i Esborra.
2. Fes clic a **Extreu** per iniciar el processament.
3. Un sol fitxer es baixa com a `filename.txt`. Diversos fitxers generen un arxiu `pdf-to-text.zip`.

## Opcions

Aquesta eina no té opcions configurables. Tot el contingut de text s'extreu de cada pàgina en ordre de lectura.

## Format de sortida

- **Un fitxer**: `filename.txt`
- **Diversos fitxers**: `pdf-to-text.zip` amb un `.txt` per a cada PDF d'entrada.

## Casos d'ús

- Extreure el cos de text d'informes en PDF per a la indexació de cerca de text complet.
- Convertir llibres electrònics o articles en PDF a text net per llegir-los en dispositius de tinta electrònica.
- Obtenir text de contractes o documents legals per a l'anàlisi de paraules clau.
- Eliminar el format dels PDF per obtenir text net per a scripts de processament de dades.
- Preparar un corpus de text a partir d'arxius de PDF per al processament del llenguatge natural.

## Consells

- Els PDF escanejats (només imatge) produiran fitxers de text buits perquè no hi ha capa de text per extreure. Passa abans els documents escanejats per OCR.
- La sortida conserva l'ordre de lectura tal com l'interpreta PyMuPDF, que en general segueix d'esquerra a dreta i de dalt a baix. Els dissenys de diverses columnes poden produir text entrellaçat.
- Per a una sortida estructurada amb encapçalaments i format, prova [PDF a Markdown](./pdf-to-markdown). Per a un JSON estructurat preparat per a IA, utilitza [Prepara el PDF per a IA](./prepare-pdf-for-ai).

## Eines relacionades

- [PDF a Markdown](./pdf-to-markdown)
- [Prepara el PDF per a IA](./prepare-pdf-for-ai)
- [PDF a Word](./pdf-to-word)

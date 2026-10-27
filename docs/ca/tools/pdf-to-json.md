---
title: PDF a JSON
description: Converteix fitxers PDF a format JSON estructurat amb CPDF. Exporta l'estructura interna del PDF com a dades JSON llegibles per màquina.
---

# PDF a JSON

Converteix un o més fitxers PDF a format JSON. L'eina utilitza CPDF (Coherent PDF) per serialitzar l'estructura interna de cada PDF en una representació JSON llegible per màquina. La sortida sempre es lliura com a arxiu ZIP.

## Com funciona

1. Selecciona un o més fitxers PDF amb el selector de fitxers.
2. Fes clic a **Converteix** per iniciar el processament. La conversió s'executa en un web worker en segon pla.
3. Es baixa un arxiu ZIP amb un fitxer JSON per a cada PDF d'entrada.

La barra d'estat mostra el progrés de les etapes de conversió i de creació del ZIP.

## Opcions

Aquesta eina no té opcions configurables. Cada PDF es converteix a la seva representació JSON completa.

## Format de sortida

- Un fitxer `pdfs-to-json.zip` amb `filename.json` per a cada PDF d'entrada.

La sortida JSON representa l'estructura interna d'objectes del PDF, incloent-hi els arbres de pàgines, les referències de tipus de lletra, les metadades i els fluxos de contingut.

## Casos d'ús

- Inspeccionar l'estructura interna d'un PDF per depurar-lo o validar-lo.
- Extreure de manera programàtica metadades estructurades i propietats de pàgina.
- Alimentar fluxos de processament personalitzats amb dades d'estructura de PDF.
- Auditar documents PDF per complir normatives analitzant-ne els arbres d'objectes.

## Consells

- Aquesta eina produeix l'estructura bruta d'objectes del PDF, no el contingut de text extret. Si necessites el text de les pàgines en format JSON, utilitza [Prepara el PDF per a IA](./prepare-pdf-for-ai).
- Per a l'extracció de text net, [PDF a text](./pdf-to-text) és més directe.
- Els PDF grans amb estructures complexes produeixen fitxers JSON molt grans.

## Eines relacionades

- [PDF a text](./pdf-to-text)
- [Prepara el PDF per a IA](./prepare-pdf-for-ai)
- [Extreu taules](./extract-tables)

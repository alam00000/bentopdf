---
title: Alterna i barreja pàgines
description: Fusiona PDF intercalant les pàgines de cada fitxer en ordre alternat, conservant els marcadors.
---

# Alterna i barreja pàgines

Intercala les pàgines de diversos fitxers PDF perquè les pàgines s'alternin entre documents. És l'eina que necessites quan una fusió estàndard només enganxaria els fitxers un darrere l'altre, però tu vols la pàgina 1 del fitxer A, després la pàgina 1 del fitxer B, després la pàgina 2 del fitxer A, i així successivament.

## Com funciona

1. Puja almenys dos fitxers PDF amb la zona de càrrega.
2. L'eina mostra cada fitxer amb el seu nombre de pàgines i la seva mida.
3. Arrossega els tiradors per reordenar quin fitxer aporta les pàgines primer en la seqüència d'intercalat.
4. Fes clic a **Barreja pàgines** per generar el resultat intercalat.
5. El resultat es baixa com a `alternated-mixed.pdf`.

## Característiques

- Intercala pàgines de qualsevol nombre de PDF (mínim dos)
- Reordenació dels fitxers arrossegant-los per controlar la prioritat de l'intercalat
- Conserva els marcadors dels documents d'origen
- Mostra el nombre de pàgines i la mida de cada fitxer pujat
- Es processa en un web worker dedicat perquè la interfície respongui bé

## Casos d'ús

- Tornar a muntar escanejos a doble cara en què les pàgines senars i parelles es van escanejar per separat
- Combinar fulls de preguntes amb les claus de respostes perquè cada pregunta vagi seguida de la seva resposta
- Fusionar documents en dos idiomes pàgina per pàgina (per exemple, l'anglès en una cara i la traducció a la següent)
- Intercalar escanejos de l'anvers i el revers fets amb un escàner d'una sola cara

## Consells

- Si els PDF d'origen tenen un nombre de pàgines diferent, les pàgines del document més curt s'acabaran primer i les pàgines restants del document més llarg apareixeran al final.
- L'ordre dels fitxers importa: el primer fitxer de la llista aporta la primera pàgina del resultat. Arrossega'ls per reordenar-los si cal.

## Eines relacionades

- [Fusiona PDF](./merge-pdf)
- [Organitza i duplica](./organize-pdf)
- [Divideix PDF](./split-pdf)

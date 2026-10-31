---
title: Capçalera i peu de pàgina
description: Afegeix text personalitzable de capçalera i peu de pàgina a les pàgines d'un PDF amb variables dinàmiques de número de pàgina.
---

# Capçalera i peu de pàgina

Afegeix text a sis posicions de les pàgines del PDF: capçalera esquerra, capçalera centre, capçalera dreta, peu esquerre, peu centre i peu dret. L'eina admet variables dinàmiques per al número de pàgina i el total de pàgines, de manera que pots crear plantilles com «Pàgina 3 de 10» que s'actualitzen automàticament a cada pàgina.

## Com funciona

1. Puja el fitxer PDF.
2. Apareix el tauler d'opcions amb els controls de format i sis camps de text.
3. Escriu el text que vulguis en qualsevol de les posicions de capçalera o peu.
4. Fes servir els marcadors `{page}` i `{total}` per a la numeració dinàmica de pàgines.
5. Ajusta la mida i el color de la lletra i, si vols, limita-ho a un interval de pàgines concret.
6. Fes clic a **Afegeix capçalera i peu de pàgina** per processar i baixar el resultat.

## Opcions

- **Interval de pàgines**: limita, si vols, quines pàgines porten capçalera i peu. Deixa-ho buit per aplicar-ho a totes. Format: «1-3, 5» (intervals separats per comes).
- **Mida de la lletra**: entre 6 i 24 punts. Per defecte, 10.
- **Color de la lletra**: tria qualsevol color amb el selector de color.
- **Capçalera esquerra / centre / dreta**: camps de text per a la part superior de cada pàgina.
- **Peu esquerre / centre / dret**: camps de text per a la part inferior de cada pàgina.

## Funcionalitats

- Sis posicions de text independents per pàgina
- Variable dinàmica `{page}` que insereix el número de la pàgina actual
- Variable dinàmica `{total}` que insereix el nombre total de pàgines
- Filtratge per interval de pàgines per afectar només pàgines concretes
- Mida i color de la lletra personalitzables
- Tipus de lletra Helvetica per a un resultat net i professional

## Casos d'ús

- Afegir «Pàgina {page} de {total}» al peu centre d'un informe
- Posar el nom de l'empresa a la capçalera esquerra i la data del document a la capçalera dreta
- Afegir avisos de confidencialitat al peu dels documents legals
- Estampar els números de revisió del document en intervals de pàgines concrets

## Consells

- Combina `{page}` i `{total}` en un sol camp per a formats com «Pàgina {page} de {total}» o «{page}/{total}».
- Pots deixar la majoria dels camps buits i omplir només les posicions que necessitis. Els camps buits simplement s'ometen.
- Per a capçaleres més complexes amb imatges o logotips, considera l'eina [Afegeix una marca d'aigua](./add-watermark) col·locada a la part superior de la pàgina.

## Eines relacionades

- [Números de pàgina](./page-numbers)
- [Afegeix una marca d'aigua](./add-watermark)
- [Numeració Bates](./bates-numbering)

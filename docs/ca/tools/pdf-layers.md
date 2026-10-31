---
title: Capes OCG de PDF
description: Visualitza, mostra o amaga, afegeix i suprimeix capes de grups de contingut opcional (OCG) en un document PDF.
---

# Capes OCG de PDF

Gestiona els grups de contingut opcional (OCG), coneguts habitualment com a "capes", d'un PDF. Pots mostrar o amagar capes, afegir-ne de noves (incloses capes filles niades), suprimir-ne i desar el PDF modificat.

## Com funciona

1. Carrega un fitxer PDF.
2. Fes clic al botó de processar per carregar el document amb el motor PyMuPDF.
3. L'eina mostra totes les capes existents amb l'estat de visibilitat, l'estat de bloqueig i la jerarquia d'imbricació.
4. Marca o desmarca les caselles per mostrar o amagar capes. Les capes bloquejades no es poden canviar.
5. Afegeix capes de nivell superior escrivint un nom i fent clic al botó d'afegir, o afegeix capes filles sota una capa mare existent.
6. Suprimeix les capes que ja no necessitis.
7. Fes clic a **Desa** per baixar el PDF modificat amb els canvis de capes aplicats.

## Característiques

- Mostra la jerarquia de capes amb la sagnia adequada per a les capes niades
- Mostra o amaga la visibilitat de cada capa
- L'indicador de capa bloquejada evita canvis accidentals
- Afegeix capes de nivell superior o filles amb noms personalitzats
- Suprimeix capes individuals
- Desa tots els canvis en un fitxer PDF nou

## Casos d'ús

- Mostrar o amagar capes de marcatge en plànols d'arquitectura o enginyeria
- Afegir noves capes d'anotació a un document de disseny amb diverses capes
- Eliminar capes obsoletes d'una plantilla abans de distribuir-la
- Inspeccionar quines capes té un PDF complex rebut d'un tercer

## Consells

- Si el PDF no té capes, l'eina mostra un estat buit amb una invitació a afegir-ne una. No tots els PDF utilitzen capes OCG: són més habituals en exportacions de CAD i fitxers de disseny.
- Les capes filles apareixen amb sagnia sota la capa mare. Pots niar capes a qualsevol profunditat.
- Les capes bloquejades es mostren amb una icona de cadenat i les caselles estan desactivades. Aquests bloquejos els defineix el creador del PDF.

## Eines relacionades

- [Visualitza les metadades](./view-metadata)
- [Edita les metadades](./edit-metadata)
- [Duplica i organitza](./organize-pdf)

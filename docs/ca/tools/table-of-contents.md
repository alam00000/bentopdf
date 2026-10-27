---
title: Taula de continguts
description: Genera una pàgina de taula de continguts amb format a partir dels marcadors existents del PDF.
---

# Taula de continguts

Aquesta eina llegeix els marcadors (esquemes) del PDF i genera una pàgina de taula de continguts amb format que s'afegeix al principi del document. Si el PDF ja té marcadors però no té una pàgina de sumari visible, aquesta eina en crea una automàticament.

## Com funciona

1. Puja un PDF que contingui marcadors.
2. Personalitza el títol, la mida de lletra i la família tipogràfica del sumari.
3. Opcionalment, marca **Afegeix un marcador per a la pàgina del sumari** per incloure el sumari mateix a l'arbre de marcadors.
4. Fes clic a **Genera la taula de continguts** per processar el fitxer.
5. El PDF actualitzat es baixa automàticament amb la pàgina del sumari inserida al principi.

## Opcions

- **Títol del sumari**: l'encapçalament que es mostra a la part superior de la pàgina generada. Per defecte és "Taula de continguts".
- **Mida de lletra**: tria entre 10 pt i 72 pt. El valor per defecte és 12 pt.
- **Família tipogràfica**: tria entre variants de Times Roman, Helvetica o Courier (normal, negreta, cursiva, negreta cursiva). Per defecte és Helvetica.
- **Afegeix un marcador per a la pàgina del sumari**: si està marcat, s'afegeix a l'esquema del PDF un marcador per a la pàgina del sumari mateixa.

## Funcions

- Llegeix tota la jerarquia de marcadors del PDF
- Genera una pàgina de sumari amb un format net i referències de número de pàgina
- Admet nivells de marcadors imbricats amb sagnat
- Tria entre 12 fonts PDF integrades
- Marcador opcional que apunta a la pàgina del sumari mateixa

## Casos d'ús

- Afegir una taula de continguts imprimible a llibres electrònics o informes que només tenen marcadors digitals
- Crear un sumari per a un document fusionat després de combinar diversos PDF
- Generar una pàgina de referència per a manuals tècnics llargs
- Preparar documents per imprimir quan s'espera un sumari visible

## Consells

- Si el PDF no té marcadors, utilitza primer l'eina [Edita els marcadors](./bookmark) per crear-los i després torna aquí per generar el sumari.
- En documents grans, una mida de lletra més gran com 14 pt o 16 pt millora la llegibilitat.

## Eines relacionades

- [Edita els marcadors](./bookmark)
- [Números de pàgina](./page-numbers)
- [Capçalera i peu de pàgina](./header-footer)

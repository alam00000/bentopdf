---
title: Converteix tipus de lletra en contorns
description: Converteix tots els tipus de lletra d'un PDF en contorns vectorials per obtenir una renderització coherent a tots els dispositius. Elimina els problemes de dependència de tipus de lletra.
---

# Converteix tipus de lletra en contorns

Convertir els tipus de lletra en contorns transforma cada caràcter de text, que deixa de ser un glif basat en un tipus de lletra i passa a ser un traçat vectorial. El PDF ja no depèn de cap tipus de lletra instal·lat: es veu igual a tots els dispositius, a tots els sistemes operatius i a totes les impressores. És un pas estàndard en els fluxos de treball de preimpressió.

## Com funciona

1. Puja un o més fitxers PDF.
2. Fes clic a **Converteix en contorns**.
3. Ghostscript converteix tot el text en traçats vectorials.
4. Baixa el resultat. Si en són diversos fitxers, es genera un arxiu ZIP.

No hi ha cap paràmetre per configurar. L'eina fa servir Ghostscript (WebAssembly) per convertir totes les referències a tipus de lletra en traçats de contorn en una sola passada.

## Què canvia

- Els caràcters de text passen a ser corbes vectorials (traçats de Bézier)
- Ja no cal incrustar els tipus de lletra: el PDF és autònom a nivell de glif
- La mida del fitxer pot augmentar perquè els traçats vectorials solen pesar més que les referències a tipus de lletra
- L'aspecte visual es conserva exactament

## Què es perd

- La selecció de text i copiar i enganxar
- La possibilitat de cercar text (Ctrl+F deixa de funcionar)
- La capacitat d'editar el contingut del text
- L'accessibilitat per a lectors de pantalla

## Casos d'ús

- Enviar PDF a una impremta que exigeix tipus de lletra en contorns
- Compartir documents que fan servir tipus de lletra personalitzats o amb llicència amb persones que no els tenen
- Evitar la substitució de tipus de lletra que canvia l'aspecte del document en altres sistemes
- Preparar PDF per a fluxos de gravat làser o tall CNC que requereixen entrada vectorial
- Assegurar que un PDF ple de logotips es mostri correctament a totes les plataformes

## Consells

- Conserva el PDF original. Convertir en contorns és irreversible: no es poden tornar a convertir els traçats en text editable.
- Si necessites que el text es pugui seguir cercant, considera l'eina Rasteritza PDF amb OCR com a pas posterior.
- Els PDF amb contorns solen ser més grans. Executa després Comprimeix PDF si la mida del fitxer és important.

## Eines relacionades

- [Aplana PDF](./flatten-pdf): aplana formularis i anotacions sense tocar els tipus de lletra
- [Rasteritza PDF](./rasterize-pdf): converteix a un PDF basat en imatges en lloc de contorns vectorials
- [Comprimeix PDF](./compress-pdf): redueix la mida del fitxer després de convertir en contorns
- [PDF a PDF/A](./pdf-to-pdfa): converteix per arxivar després d'assegurar la independència dels tipus de lletra

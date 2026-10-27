---
title: Redreça PDF
description: Redreça automàticament les pàgines inclinades dels PDF escanejats amb la detecció d'inclinació d'OpenCV. Llindar i DPI ajustables.
---

# Redreça PDF

Els documents escanejats poques vegades queden perfectament rectes. Fins i tot una lleugera inclinació fa que l'OCR sigui menys precís i que la impressió quedi descuidada. Aquesta eina fa servir els algorismes de processament d'imatge d'OpenCV per detectar l'angle d'inclinació de cada pàgina i tornar-la a posar recta.

## Com funciona

1. Puja un o més PDF escanejats.
2. Defineix el **Llindar d'inclinació**: les pàgines amb una inclinació detectada inferior a aquest valor no es toquen.
3. Tria una **Qualitat de processament (DPI)**: un DPI més alt millora la precisió de la detecció però triga més.
4. Fes clic a **Redreça PDF**.
5. Un cop processat, un tauler de resultats mostra l'angle detectat a cada pàgina i si s'ha corregit.

## Opcions

| Paràmetre                          | Valors                   | Per defecte |
| ---------------------------------- | ------------------------ | ----------- |
| **Llindar d'inclinació**           | 0,1, 0,5, 1,0, 2,0 graus | 0,5         |
| **Qualitat de processament (DPI)** | 100, 150, 200, 300       | 150         |

## Com funciona la detecció d'inclinació

L'eina renderitza cada pàgina com a imatge amb el DPI seleccionat i després fa servir OpenCV per detectar els angles de les línies dominants del contingut. Si la inclinació detectada supera el llindar, la pàgina es gira l'angle invers per redreçar-la. Les pàgines per sota del llindar passen sense canvis.

## Casos d'ús

- Netejar contractes o documents legals escanejats per lots
- Preparar rebuts o factures escanejats per al processament amb OCR
- Redreçar pàgines d'un escàner pla amb una col·locació del paper irregular
- Millorar la qualitat visual de materials d'arxiu digitalitzats

## Consells

- Redueix el llindar a 0,1 graus si necessites un alineament perfecte per a l'OCR.
- 150 DPI és ràpid i precís per a la majoria de documents. Fes servir 300 DPI per a text molt petit o pàgines amb molt de detall.
- Redreça PDF funciona millor amb documents que tenen línies de text horitzontals clares. Pot tenir dificultats amb pàgines que són sobretot imatges o elements de disseny en diagonal.

## Eines relacionades

- [Rasteritza PDF](./rasterize-pdf): converteix el resultat redreçat en un PDF pla basat en imatges
- [Comprimeix PDF](./compress-pdf): redueix la mida del fitxer després de redreçar-lo
- [Repara PDF](./repair-pdf): arregla problemes estructurals en PDF escanejats

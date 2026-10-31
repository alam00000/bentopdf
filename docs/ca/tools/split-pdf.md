---
title: Divideix PDF
description: Divideix un PDF en fitxers més petits per intervals de pàgines, selecció visual, marcadors, pàgines parells/senars o intervals fixos.
---

# Divideix PDF

Divideix un PDF en documents més petits amb un dels sis modes de divisió. Des d'intervals de pàgines senzills fins a la divisió per marcadors, aquesta eina cobreix tots els casos per dividir un document.

## Com funciona

1. Puja un sol fitxer PDF.
2. Tria un mode de divisió al menú desplegable.
3. Configura les opcions específiques del mode (intervals de pàgines, seleccions, etc.).
4. Fes clic al botó de processament.
5. El resultat es baixa com a un sol PDF o com a arxiu ZIP segons el mode i la configuració.

## Modes de divisió

| Mode                  | Descripció                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Interval**          | Introdueix intervals de pàgines com `1-3, 5, 8-10`. Diversos intervals generen PDF separats en un ZIP. Un sol interval genera un PDF. |
| **Selecció visual**   | Navega per les miniatures i fes clic per seleccionar les pàgines que vulguis. Les pàgines seleccionades s'extreuen en un PDF nou.     |
| **Parells / Senars**  | Extreu només les pàgines parells o les senars.                                                                                        |
| **Totes les pàgines** | Divideix cada pàgina en un fitxer PDF individual, baixat com a ZIP.                                                                   |
| **Marcadors**         | Divideix als límits dels marcadors. Tria el nivell de marcador per controlar on es fan les divisions.                                 |
| **Cada N pàgines**    | Divideix en blocs de N pàgines (p. ex., cada 5 pàgines). L'últim bloc pot tenir menys pàgines.                                        |

## Funcions

- Sis modes de divisió diferents que cobreixen pràcticament tots els casos d'ús
- Selector visual de pàgines amb miniatures de càrrega diferida
- Divisió per marcadors amb filtre de nivell
- Opció de sortida ZIP per als modes d'interval i visual
- Admet intervals de pàgines amb sintaxi mixta (`1-3, 5, 8-10`)
- Avís quan la divisió per N pàgines genera blocs desiguals

## Casos d'ús

- Extreure un capítol o secció concrets d'un document gran
- Separar pàgines senars i parells per a fluxos d'impressió a doble cara
- Dividir un llibre en PDF en fitxers per capítol segons els marcadors
- Aïllar pàgines concretes (com la pàgina de signatures) d'un contracte
- Dividir un informe recopilat en fitxers per secció per distribuir-los

## Consells

- Diversos intervals de pàgines separats per comes (p. ex., `1-5, 10-15, 20-25`) generen PDF separats, un per interval, agrupats en un ZIP.
- El mode de divisió per marcadors requereix que el PDF contingui marcadors. Si no se'n troba cap, rebràs un missatge d'error.
- La casella "Baixa com a ZIP" dels modes Interval i Visual et permet obtenir PDF individuals per pàgina en lloc d'un fitxer combinat.

## Eines relacionades

- [Fusiona PDF](./merge-pdf)
- [Extreu pàgines](./extract-pages)
- [Suprimeix pàgines](./delete-pages)
- [Eina PDF multifunció](./pdf-multi-tool)

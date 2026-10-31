---
title: Numeració Bates
description: Aplica números Bates a un o diversos PDF amb plantilles personalitzables, farciment, tipus de lletra i posicionament.
---

# Numeració Bates

La numeració Bates estampa identificadors seqüencials a cada pàgina dels PDF. És el mètode estàndard per etiquetar documents en procediments judicials, auditories i fluxos de compliment normatiu. Aquesta eina admet diversos fitxers i plantilles personalitzables, i genera PDF numerats individualment o un únic arxiu ZIP.

## Com funciona

1. Puja un o més fitxers PDF. Pots arrossegar-ne diversos alhora.
2. Tria un estil predefinit o crea una plantilla personalitzada.
3. Configura la posició, el tipus de lletra, la mida, el color i els números inicials.
4. Fes clic a **Aplica els números Bates** per processar.
5. Un sol fitxer es baixa directament. Diversos fitxers es baixen en un arxiu ZIP.

## Opcions

- **Estil predefinit**: tria entre els formats integrats:
  - Exhibit + Case + Bates + Page (per exemple, "Exhibit 1 Case XYZ 000001 Page 1")
  - Exhibit + Case + Bates (sense número de pàgina)
  - Case + Bates
  - Només número Bates (per exemple, "000001")
  - Personalitzat (escriu la teva pròpia plantilla)
- **Personalitza l'estil**: una cadena de plantilla amb marcadors de posició: `[BATES]`, `[PAGE]`, `[FILE]`, `[FILENAME]`.
- **Farciment Bates**: nombre de dígits (de 3 a 6) dels números Bates amb zeros a l'esquerra. Només es veu en mode personalitzat.
- **Posició**: capçalera o peu de pàgina, esquerra, centre o dreta.
- **El Bates comença a**: el primer número Bates. Per defecte és 1. La numeració continua entre fitxers.
- **El comptador de fitxers comença a**: el número inicial del marcador de posició `[FILE]`.
- **Tipus de lletra**: Helvetica, Times New Roman o Courier.
- **Mida de la lletra**: mida del text estampat.
- **Color**: selector de color per al text del número Bates.

## Característiques

- Vista prèvia en directe que mostra com apareixeran els números Bates a tots els fitxers pujats
- Compatibilitat amb diversos fitxers amb numeració contínua entre documents
- Reordenació dels fitxers arrossegant-los per controlar la seqüència de numeració
- Sis opcions de posició (capçalera/peu, esquerra/centre/dreta)
- Càlcul adaptatiu dels marges que respecta les diferents mides de pàgina
- Sortida en ZIP per a lots de diversos fitxers
- Marcadors de posició a les plantilles per a la màxima flexibilitat

## Casos d'ús

- Estampar documents de descobriment per a litigis amb números d'exhibit seqüencials
- Numerar paquets de proves d'auditoria que abasten desenes de fitxers
- Aplicar números de referència reglamentaris a la documentació de compliment normatiu
- Etiquetar els annexos d'una sol·licitud de patent amb identificadors propis del cas

## Consells

- Arrossega els fitxers de la llista per reordenar-los abans de processar. La seqüència de numeració Bates segueix aquest ordre.
- Utilitza el marcador de posició `[FILENAME]` per incloure el nom original del fitxer a l'estampat, cosa que ajuda a localitzar les pàgines als documents d'origen.
- El quadre de vista prèvia s'actualitza en temps real quan canvies la configuració, de manera que pots comprovar el format abans de processar.

## Eines relacionades

- [Números de pàgina](./page-numbers)
- [Afegeix etiquetes de pàgina](./add-page-labels)
- [Capçalera i peu de pàgina](./header-footer)

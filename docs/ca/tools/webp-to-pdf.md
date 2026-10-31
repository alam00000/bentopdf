---
title: WebP a PDF
description: Converteix imatges WebP a PDF directament al navegador amb una qualitat de compressió ajustable.
---

# WebP a PDF

Converteix el format d'imatge WebP de Google a PDF. És especialment útil quan has baixat imatges del web en format WebP i les necessites en un format més acceptat universalment per imprimir-les o compartir-les.

## Formats admesos

| Format | Extensions |
| :----- | :--------- |
| WebP   | `.webp`    |

## Com funciona

1. Fes clic a l'àrea de càrrega o arrossega i deixa anar els fitxers WebP.
2. Revisa la llista de fitxers i elimina els que no necessitis.
3. Selecciona un nivell de **Qualitat del PDF**.
4. Fes clic a **Converteix a PDF**. El resultat es descarrega com a `from_webps.pdf`.

Internament, cada imatge WebP es descodifica mitjançant l'API canvas del navegador i després s'incrusta al PDF amb pdf-lib. Això vol dir que la conversió funciona en qualsevol navegador que admeti la descodificació de WebP (tots els navegadors moderns ho fan).

## Opcions

**Qualitat del PDF** controla la compressió en incrustar les imatges:

- **Qualitat alta**: conserva el màxim detall.
- **Qualitat mitjana** (per defecte): resultat equilibrat.
- **Qualitat baixa**: mida de fitxer més petita.

## Casos d'ús

- Convertir en un PDF imprimible les imatges baixades del web i desades com a WebP
- Reunir captures de pantalla WebP de Chrome o Edge en documentació
- Crear un porfolit en PDF a partir d'imatges exportades per eines de disseny que fan servir WebP per defecte
- Arxivar imatges WebP en un format llegible de manera més universal

## Consells

- WebP es descodifica internament a PNG abans d'incrustar-lo al PDF, de manera que les imatges WebP sense pèrdua conserven la qualitat amb l'opció Alta.
- Si tens una barreja d'imatges WebP i d'altres formats, utilitza l'eina [Imatges a PDF](./image-to-pdf): accepta tot d'una vegada.

## Eines relacionades

- [Imatges a PDF](./image-to-pdf)
- [PNG a PDF](./png-to-pdf)
- [JPG a PDF](./jpg-to-pdf)

---
title: Comprimeix PDF
description: Redueix la mida d'un PDF fins a un 90 % amb el motor Hyper Compress. Admet mides de fitxer objectiu, processament per lots i ajustos de qualitat personalitzats.
---

# Comprimeix PDF

Redueix els teus fitxers PDF sense fer-los malbé. Comprimeix PDF funciona amb [Hyper Compress](https://www.bentopdf.com/hyper-compress), el motor de compressió propi de BentoPDF. Torna a comprimir les imatges, crea subconjunts de tipus de lletra i els fusiona, i elimina el pes mort, com ara les miniatures incrustades i les dades privades d'aplicacions. El PDF continua sent plenament funcional: el text es pot seleccionar i els enllaços i els camps de formulari continuen funcionant.

Hyper Compress està compilat a WebAssembly i s'inclou amb BentoPDF, de manera que la compressió funciona sense connexió i en desplegaments aïllats de la xarxa, sense cap configuració addicional.

## Com funciona

1. Puja un o més PDF fent clic a la zona de càrrega o arrossegant-hi fitxers.
2. Tria un **Nivell de compressió**: Baix, Mitjà, Alt o Sense pèrdua.
3. Si vols, introdueix una **Mida objectiu del fitxer**, o desplega **Configuració personalitzada** per a un control més precís, inclosa l'opció **Converteix a escala de grisos**.
4. Fes clic a **Comprimeix PDF**. Si hi ha diversos fitxers, obtens una única baixada en ZIP.

## Documents especials

- **Els PDF signats digitalment** es retornen sense canvis, perquè qualsevol modificació invalidaria la signatura. Activa **Substitueix la protecció del contingut** a Configuració personalitzada per eliminar-ne les signatures i comprimir-los; la signatura visible es manté a la pàgina, però el fitxer ja no està signat.
- **Els fitxers PDF/A** perden l'etiqueta PDF/A després de la compressió, de manera que el fitxer no declara mai una conformitat que ja no compleix. Activa **Conserva el PDF/A** a Configuració personalitzada per mantenir el fitxer conforme.
- **Els PDF protegits amb contrasenya** mostren un camp de contrasenya a la targeta del fitxer. Introdueix-hi la contrasenya i Hyper Compress obre el fitxer ell mateix, sense un pas de desbloqueig a part. Amb dos o més fitxers bloquejats, un únic camp compartit desbloqueja tots els fitxers que fan servir la mateixa contrasenya. La còpia comprimida no té contrasenya; fes servir [Protegeix PDF](./protect-pdf) per tornar-n'hi a afegir una.
- **Els escanejos sense capa de text** poden reduir-se encara més amb **Rasteritza les pàgines a imatges** a Configuració personalitzada, que substitueix cada pàgina per una imatge optimitzada. S'omet en qualsevol document que tingui text seleccionable, inclosos els escanejos amb OCR, tret que **Substitueix la protecció del contingut** estigui activat. Aleshores les pàgines de text també es converteixen en imatges, de manera que el text deixa de poder-se seleccionar i els enllaços deixen de funcionar.

## Nivells de compressió

| Nivell           | Qualitat d'imatge | Resolució màxima | Ideal per a                                 |
| ---------------- | ----------------- | ---------------- | ------------------------------------------- |
| **Baix**         | 80                | 200 DPI          | Conservar la qualitat visual                |
| **Mitjà**        | 50                | 150 DPI          | Documents quotidians                        |
| **Alt**          | 20                | 72 DPI           | Fitxers adjunts de correu, càrregues al web |
| **Sense pèrdua** | Imatges intactes  | Sense canvis     | Còpies d'arxiu                              |

Alt també desincrusta les 14 fonts PDF estàndard, a més de tipus de lletra semblants com Arial quan és segur fer-ho.

## Mida de fitxer objectiu

Introdueix una mida en KB o MB i Hyper Compress cerca la millor qualitat d'imatge que hi càpiga, partint del nivell que has triat. Si el document no pot arribar a ser tan petit, obtens la versió més petita possible i un missatge que ho indica. Les pàgines dedicades, com [Comprimeix PDF a 1 MB](https://www.bentopdf.com/compress-pdf-to-1mb), s'obren amb l'objectiu ja emplenat.

## Configuració personalitzada

Desplega el tauler Configuració personalitzada per ajustar Hyper Compress directament. En triar un nivell de compressió, aquests valors es restableixen als del nivell, i si en edites qualsevol, el nivell passa a Personalitzat.

- **Substitueix la protecció del contingut**: per defecte, Hyper Compress no toca els PDF signats i no rasteritza les pàgines amb text. Si l'actives, se salta totes dues limitacions. Continua activat quan canvies de nivell.

- **Imatges**: qualitat de la imatge, resolució màxima, remostreig forçat, reducció de color, retallada de les àrees invisibles de les imatges, eliminació d'imatges alternatives, simplificació dels perfils de color, JPEG 2000 i mode sense pèrdua
- **Tipus de lletra**: creació de subconjunts, fusió de duplicats i desincrustació de fonts estàndard i de les que s'hi assemblen
- **Contingut**: aplanament d'anotacions, camps de formulari o enllaços
- **Neteja**: eliminació de miniatures, dades d'aplicacions, fils d'articles, informació de captura web, l'arbre d'estructura o les intencions de sortida
- **Rasteritza**: substitució de pàgines per imatges, per a escanejos que només tenen imatges; s'omet quan el document té text seleccionable
- **Sortida**: Conserva el PDF/A i compressió Brotli per a lectors de PDF 2.0 que la admetin

## Casos d'ús

- Fer que un informe de 50 MB càpiga en el límit d'un fitxer adjunt de correu
- Aconseguir que un escaneig càpiga en el límit estricte de càrrega d'un portal amb una mida de fitxer objectiu
- Optimitzar PDF de màrqueting perquè es baixin més de pressa des d'un lloc web
- Arxivar grans conjunts de documents quan els costos d'emmagatzematge importen
- Reduir l'ús de dades mòbils en compartir PDF per aplicacions de missatgeria

## Consells

- Comença amb Mitjà. Si el resultat continua sent massa gran, defineix una mida de fitxer objectiu o puja a Alt.
- Per a un escaneig sense capa de text, activa Rasteritza les pàgines a imatges a Configuració personalitzada.
- Converteix a escala de grisos, a Configuració personalitzada, pot reduir la mida dels documents amb molt de color.

## Eines relacionades

- [Linealitza PDF](./linearize-pdf): optimitza el PDF comprimit per veure'l ràpidament al web
- [Rasteritza PDF](./rasterize-pdf): converteix les pàgines en imatges a un DPI concret, incloses les pàgines amb text
- [Repara PDF](./repair-pdf): arregla un PDF que s'ha fet malbé durant una compressió en un altre lloc
- [Elimina les metadades](./remove-metadata): elimina les dades ocultes per a més privadesa

---
title: Neteja PDF
description: Elimina contingut ocult i potencialment perillós dels PDF, com ara metadades, JavaScript, fitxers incrustats, anotacions i capes.
---

# Neteja PDF

Els PDF poden contenir molt més del que veus a la pantalla. Les metadades ocultes, el JavaScript incrustat, els fitxers adjunts, les dades de formularis i la informació de capes poden filtrar dades sensibles o suposar riscos de seguretat. La neteja ho elimina tot i et deixa un document net i segur per compartir públicament.

## Com funciona

1. Puja un fitxer PDF.
2. Selecciona a la llista quins elements vols eliminar.
3. Fes clic a **Neteja PDF**.
4. Baixa el fitxer net.

## Opcions de neteja

Totes les opcions estan activades per defecte. Desmarca les que vulguis conservar.

| Opció                              | Què elimina                                                                       |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| **Aplana els formularis**          | Converteix els camps de formulari interactius en contingut estàtic                |
| **Elimina les metadades**          | Suprimeix l'autor, el títol, la data de creació, el programari i les dades XMP    |
| **Elimina les anotacions**         | Suprimeix comentaris, ressaltats, notes adhesives i marques                       |
| **Elimina el JavaScript**          | Elimina els scripts incrustats que es podrien executar en obrir el fitxer         |
| **Elimina els fitxers incrustats** | Suprimeix els fitxers adjunts incrustats al PDF                                   |
| **Elimina les capes (OCG)**        | Aplana els grups de contingut opcional en una sola capa                           |
| **Elimina els enllaços**           | Suprimeix els hipervincles i les referències a URL                                |
| **Elimina l'arbre d'estructura**   | Elimina l'estructura del document utilitzada per a l'etiquetatge d'accessibilitat |
| **Elimina MarkInfo**               | Suprimeix la informació de contingut marcat                                       |
| **Elimina les fonts**              | Elimina les dades de fonts incrustades (amb precaució)                            |

## Casos d'ús

- Preparar un PDF per a la publicació eliminant les metadades internes (noms d'autors, versions de programari, historial d'edicions)
- Eliminar el JavaScript d'un PDF rebut d'una font no fiable abans d'obrir-lo
- Netejar un PDF abans d'enviar-lo a un client que no hauria de veure comentaris incrustats ni noms de camps de formulari
- Eliminar capes ocultes d'un plànol arquitectònic abans de compartir-ne la versió final
- Complir els requisits de minimització de dades de les normatives de privadesa

## Consells

- Deixa "Elimina les fonts" sense marcar tret que estiguis segur que el PDF es continuarà mostrant correctament. Eliminar les fonts pot fer el text invisible en alguns visors.
- Si només cal eliminar les metadades, l'eina dedicada Elimina les metadades és més ràpida i específica.
- La neteja és irreversible. Conserva el fitxer original.

## Eines relacionades

- [Elimina les metadades](./remove-metadata): elimina només les metadades sense tocar la resta del contingut
- [Aplana PDF](./flatten-pdf): aplana específicament formularis i anotacions
- [Xifra PDF](./protect-pdf): afegeix protecció amb contrasenya després de netejar
- [Rasteritza PDF](./rasterize-pdf): l'opció radical, converteix a imatges per eliminar tot el contingut ocult

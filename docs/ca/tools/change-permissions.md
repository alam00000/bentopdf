---
title: Canvia els permisos
description: Defineix o modifica els permisos d'ús d'un PDF per a la impressió, la còpia, l'edició i les anotacions. Fa servir xifratge AES de 256 bits.
---

# Canvia els permisos

Ajusta amb precisió què poden fer els destinataris amb el teu PDF. A diferència del xifratge bàsic, que només bloqueja el fitxer amb una contrasenya, aquesta eina et permet permetre o denegar selectivament la impressió, la còpia, l'edició, les anotacions, l'emplenament de formularis, el muntatge del document i l'extracció de pàgines, tot garantit amb xifratge AES de 256 bits.

## Com funciona

1. Puja un fitxer PDF.
2. Si el PDF ja està xifrat, introdueix la **Contrasenya actual**.
3. Defineix una **Nova contrasenya d'usuari** (necessària per obrir-lo) i/o una **Nova contrasenya de propietari** (controla els permisos).
4. Activa o desactiva cada permís amb les caselles de verificació.
5. Fes clic a **Canvia els permisos**.
6. Baixa el PDF actualitzat.

Si deixes buits els dos camps de contrasenya nova, l'eina desxifra el PDF completament i n'elimina tot el xifratge i les restriccions.

## Control de permisos

| Permís                         | Què controla                                            |
| ------------------------------ | ------------------------------------------------------- |
| **Permet imprimir**            | Si el document es pot imprimir                          |
| **Permet copiar text**         | Si es pot seleccionar i copiar el text i les imatges    |
| **Permet modificar**           | Si es pot editar el contingut del document              |
| **Permet anotar**              | Si es poden afegir comentaris, ressaltats i segells     |
| **Permet emplenar formularis** | Si es poden emplenar els camps de formulari interactius |
| **Permet muntar el document**  | Si es poden inserir, eliminar o girar pàgines           |
| **Permet extreure pàgines**    | Si es poden extreure pàgines individuals                |

Tots els permisos necessiten una contrasenya de propietari per aplicar-se. Sense contrasenya de propietari, la majoria de lectors de PDF ignoren els indicadors de permisos.

## Com funcionen els permisos en un PDF

Els permisos d'un PDF formen part de l'especificació de xifratge. Es desen com a indicadors de bits al diccionari de xifratge i els apliquen els lectors de PDF compatibles. La diferència clau:

- **Contrasenya d'usuari**: necessària per obrir el fitxer.
- **Contrasenya de propietari**: necessària per canviar els permisos o eliminar les restriccions. Sense ella, els indicadors de permisos controlen quines operacions pot fer l'usuari.

Si només defineixes una contrasenya de propietari (sense contrasenya d'usuari), tothom pot obrir el fitxer però queda limitat a les operacions permeses. Si defineixes les dues, el fitxer requereix una contrasenya per obrir-se i queda restringit després de l'autenticació.

## Casos d'ús

- Distribuir un informe que es pot veure i imprimir però no editar ni copiar
- Compartir una plantilla de contracte que els destinataris poden emplenar però no modificar
- Publicar un catàleg en PDF amb la còpia d'imatges desactivada
- Permetre anotacions en un esborrany de revisió i evitar canvis estructurals

## Consells

- Perquè sigui efectiu, defineix sempre una contrasenya de propietari. Els permisos sense contrasenya de propietari no es poden fer complir.
- Algunes eines de PDF de tercers ignoren els indicadors de permisos. Per a una protecció més sòlida, considera rasteritzar el PDF o fer servir DRM.
- Fes servir aquesta eina per actualitzar PDF antics xifrats amb RC4 a AES-256.

## Eines relacionades

- [Xifra PDF](./protect-pdf): protecció senzilla amb contrasenya, sense permisos granulars
- [Desxifra PDF](./unlock-pdf): elimina el xifratge completament
- [Elimina les restriccions](./remove-restrictions): elimina totes les restriccions quan tens la contrasenya de propietari

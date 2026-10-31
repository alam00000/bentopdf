---
title: Protegeix PDF
description: Protegeix fitxers PDF amb contrasenya mitjançant xifratge AES de 256 bits. Defineix contrasenyes d'usuari i de propietari amb restriccions d'ús configurables.
---

# Protegeix PDF

Bloqueja el PDF amb una contrasenya perquè només les persones autoritzades puguin obrir-lo. BentoPDF utilitza xifratge AES de 256 bits (el mateix estàndard que fan servir bancs i agències governamentals), aplicat íntegrament al navegador mitjançant QPDF.

## Com funciona

1. Puja un fitxer PDF.
2. Introdueix una **contrasenya d'usuari** (obligatòria). És la contrasenya que caldrà per obrir el fitxer.
3. Opcionalment, introdueix una **contrasenya de propietari**. Si l'estableixes, el PDF adquireix restriccions d'ús que impedeixen imprimir, editar, copiar i anotar.
4. Fes clic a **Xifra PDF**.
5. Descarrega el fitxer xifrat.

## Tipus de contrasenya

### Contrasenya d'usuari (obligatòria)

La contrasenya d'usuari és la que els destinataris escriuen per obrir el PDF. Sense ella, el document és totalment inaccessible. Tot PDF xifrat n'ha de tenir una.

### Contrasenya de propietari (opcional)

La contrasenya de propietari controla què pot fer un usuari autoritzat després d'obrir el fitxer. Quan estableixes una contrasenya de propietari diferent, BentoPDF aplica automàticament el conjunt de restriccions més estricte:

- Modificació desactivada
- Extracció o còpia desactivada
- Impressió desactivada
- Anotació desactivada
- Emplenament de formularis desactivat
- Muntatge del document desactivat

Si deixes en blanc la contrasenya de propietari, el PDF queda xifrat (cal la contrasenya d'usuari per obrir-lo) però no té cap restricció d'ús un cop obert.

## Detalls del xifratge

- **Algorisme**: AES-256 (Advanced Encryption Standard de 256 bits)
- **Longitud de la clau**: 256 bits
- **Estàndard**: xifratge PDF 2.0 (implementació de QPDF)

Amb la tecnologia actual, és computacionalment inviable trencar AES-256 per força bruta. La seguretat del PDF xifrat depèn totalment de la fortalesa de la contrasenya.

## Casos d'ús

- Protegir informes financers confidencials abans d'enviar-los per correu
- Protegir documents legals compartits amb la part contrària
- Afegir una contrasenya a historials mèdics o a informació d'identificació personal
- Distribuir contingut de pagament (llibres electrònics, informes) amb control d'accés
- Complir polítiques de protecció de dades que exigeixen xifratge en repòs

## Consells

- Utilitza una contrasenya forta i única. Una frase de pas de 12 o més caràcters amb majúscules, minúscules, números i símbols és ideal.
- Comparteix la contrasenya per un canal diferent (telèfon, missatge de text), mai al mateix correu que el PDF.
- Si només vols restringir accions (sense imprimir ni copiar) sense exigir contrasenya per obrir-lo, utilitza l'eina Canvia els permisos.

## Eines relacionades

- [Desxifra PDF](./unlock-pdf): elimina el xifratge quan coneguis la contrasenya
- [Canvia els permisos](./change-permissions): modifica restriccions d'ús concretes
- [Elimina les restriccions](./remove-restrictions): elimina tota la seguretat d'un PDF
- [Neteja PDF](./sanitize-pdf): elimina el contingut ocult abans de xifrar

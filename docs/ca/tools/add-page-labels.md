---
title: Afegeix etiquetes de pàgina
description: Afegeix etiquetes de pàgina al PDF amb xifres romanes, prefixos de lletres, numeració personalitzada i diverses regles per document.
---

# Afegeix etiquetes de pàgina

Les etiquetes de pàgina controlen com es mostren els números de pàgina als visualitzadors de PDF (el número que apareix a la barra d'eines, no el imprès a la pàgina). Aquesta eina et permet assignar diferents esquemes d'etiquetatge a diferents intervals de pàgines: xifres romanes per als preliminars, números decimals per al cos, apèndixs amb lletres i més.

## Com funciona

1. Puja el fitxer PDF.
2. Apareix el tauler d'opcions amb una regla d'etiqueta per defecte.
3. Configura cada regla amb un interval de pàgines, un estil, un prefix opcional i un valor inicial.
4. Fes clic a **Afegeix una regla** per crear regles addicionals per a altres seccions.
5. Fes clic a **Afegeix etiquetes de pàgina** per aplicar totes les regles i baixar el resultat.

## Opcions

Cada regla d'etiqueta té aquests paràmetres:

- **Interval de pàgines**: les pàgines a les quals s'aplica la regla. Deixa-ho buit per a totes les pàgines. Admet intervals com `1-4`, `7`, `odd` o `1-9,30-40`.
- **Estil d'etiqueta**: àrab decimal, romà en minúscula (i, ii, iii), romà en majúscula (I, II, III), lletres en minúscula (a, b, c), lletres en majúscula (A, B, C) o sense etiqueta (només prefix).
- **Prefix de l'etiqueta**: text opcional que s'afegeix davant de cada etiqueta, com ara "A-" per crear etiquetes com A-1, A-2, A-3.
- **Valor inicial**: el número des del qual comença el recompte. Per defecte és 1. Posa 0 per a una numeració que comenci per zero.
- **Continua la numeració entre intervals no contigus**: activa-ho quan una regla afecta pàgines no contigües (com `1-9,30-40` o `odd`) i vols que la numeració continuï de manera seqüencial.
- **Elimina les etiquetes de pàgina existents**: marcat per defecte. Esborra les etiquetes anteriors abans d'aplicar les regles noves.

## Característiques

- Diverses regles d'etiqueta per document per a esquemes de numeració complexos
- Sis estils d'etiqueta que cobreixen tots els sistemes de numeració estàndard
- Prefixos personalitzats per etiquetar per seccions
- Compatibilitat amb intervals no contigus amb numeració progressiva
- Opció de conservar o eliminar les etiquetes existents

## Casos d'ús

- Posar etiquetes amb xifres romanes (i, ii, iii) al prefaci d'un llibre i etiquetes decimals al text principal
- Etiquetar les pàgines d'un apèndix amb prefixos de lletres com "A-1", "A-2", "B-1", "B-2"
- Corregir les etiquetes de pàgina d'un document escanejat en què els números de pàgina físics no coincideixen amb l'ordre de pàgines del PDF
- Afegir una numeració que comenci per zero a documents tècnics

## Consells

- Les etiquetes de pàgina són metadades que els visualitzadors de PDF mostren a la barra de navegació. No s'imprimeixen a la pàgina. Per a números visibles, utilitza [Números de pàgina](./page-numbers).
- Aquesta eina requereix que CoherentPDF (CPDF) estigui configurat a la configuració de WASM. Si no ho està, se't demanarà que el configuris.

## Eines relacionades

- [Números de pàgina](./page-numbers)
- [Numeració Bates](./bates-numbering)
- [Edita els marcadors](./bookmark)

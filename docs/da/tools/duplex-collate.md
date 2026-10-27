---
title: Sortér dupleks-scanning
description: Omsortér dupleks-scannede PDF'er, hvor forsider og bagsider ligger i separate blokke, til korrekt for-/bagside-rækkefølge.
---

# Sortér dupleks-scanning

Sortér dupleks-scanning er designet til ADF-scanningsarbejdsgange, hvor én PDF indeholder to blokke af sider:

- først alle forsider
- derefter alle bagsider

I stedet for manuelt at dele og samle igen fletter dette værktøj de to blokke til naturlig læserækkefølge: forside1, bagside1, forside2, bagside2 og så videre.

## Sådan fungerer det

1. Upload en enkelt PDF, der er oprettet ved scanning af en dupleksstak.
2. Angiv delingspunktet, hvor forsideblokken slutter.
3. Vælg håndtering af bagsideblokken:
   - **Vend bagsideblokken** (almindeligt, når stakken vendes, før bagsiderne scannes)
   - **Behold bagsideblokken som den er**
4. Klik på **Sortér PDF** for at downloade det omsorterede resultat.

## Indstillinger

- **Registrér deling automatisk (halvdelen)**: sætter delingspunktet til `ceil(totalPages / 2)`.
- **Advarsel om ulige sidetal**: advarer, når det samlede antal sider er ulige (ofte en scanningsfejl).
- **Bekræftelse ved ujævne blokke**: beder om bekræftelse, når forside- og bagsideblokkene har forskellig størrelse.
- **Grupperet eksport**: del det sorterede output i separate PDF'er ud fra det oprindelige dokuments sideantal og download som ZIP.

## Outputadfærd

- **Standard**: én output-PDF (én input-PDF giver én output-PDF).
- **Grupperet tilstand**: outputtet opdeles efter din værdi for sider pr. dokument. Hvis der dannes flere bidder, downloades de som én ZIP, ellers downloades en enkelt PDF.

Hvis blokkene er ujævne, sorteres de parrede sider først, og de resterende uparrede sider sættes til sidst.

## Almindelige anvendelser

- Gendan rækkefølgen efter scanning af en bunke dobbeltsidede formularer i to omgange.
- Genopbyg for-/bagside-pakker fra kontorscannere, der udskriver alle forsider og derefter alle bagsider.
- Efterbehandl arkivscanninger, før de deles op i filer pr. dokument.

## Tips

- De fleste dupleksbatches bør have et lige samlet sidetal.
- Hvis bagsiderne ser omvendt ud i resultatet, så skift mellem **Vend bagsideblokken** og **Behold bagsideblokken som den er**.
- Til originaler på 2 sider (forside+bagside) bruges grupperet eksport med `2` sider pr. dokument.

## Relaterede værktøjer

- [Alternér og miks sider](./alternate-merge)
- [Opdel PDF](./split-pdf)
- [Flet PDF](./merge-pdf)
- [Duplikér og organisér](./organize-pdf)

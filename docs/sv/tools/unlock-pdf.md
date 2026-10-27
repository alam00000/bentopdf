---
title: Lås upp PDF
description: Ta bort lösenordsskydd från krypterade PDF:er. Stöder batchdekryptering med ett enda lösenord för flera filer.
---

# Lås upp PDF

Om du har lösenordet till en krypterad PDF tar det här verktyget bort krypteringen helt och skapar en olåst kopia som alla kan öppna utan inloggningsuppgifter. Det stöder batchdekryptering när flera PDF:er har samma lösenord.

## Så fungerar det

1. Ladda upp en eller flera krypterade PDF-filer.
2. Ange det **lösenord** som skyddar filerna.
3. Klicka på **Dekryptera PDF**.
4. En enskild fil laddas ner direkt. Flera filer ger ett ZIP-arkiv med alla olåsta PDF:er.

## Funktioner

- Dekryptering av enskilda filer och i batch
- Hanterar både användarlösenord och ägarlösenord
- Ger helt okrypterad utdata utan kvarvarande begränsningar
- Tydliga felmeddelanden för felaktiga lösenord eller skadade filer
- Spårning av lyckade och misslyckade filer i batchläge

## Skillnaden mot Ta bort begränsningar

**Dekryptera PDF** kräver lösenordet och tar bort all kryptering. **Ta bort begränsningar** riktar sig mot användningsbegränsningar (utskrift, kopiering, redigering) och kräver kanske inget lösenord om bara ett ägarlösenord har angetts. Använd Dekryptera när PDF:en inte alls går att öppna utan lösenord.

## Användningsområden

- Permanent låsa upp PDF:er som du krypterat tidigare när lösenordet inte längre behövs
- Ta bort kryptering från en omgång arkiverade dokument för enklare långsiktig åtkomst
- Förbereda lösenordsskyddade PDF:er för ett dokumenthanteringssystem som inte stöder krypterade filer
- Låsa upp PDF:er innan du slår ihop dem med andra dokument (många sammanslagningsverktyg kan inte hantera krypterad indata)

## Tips

- Lösenordsfältet gäller alla uppladdade filer. Om dina PDF:er har olika lösenord, behandla dem i separata omgångar.
- Om du får felet "Fel lösenord", kontrollera om det finns avslutande mellanslag eller om Caps Lock är påslaget.
- Efter dekryptering har utdata ingen säkerhet alls. Kryptera om med Kryptera PDF om du vill använda ett nytt lösenord.

## Relaterade verktyg

- [Skydda PDF](./protect-pdf), använd kryptering igen med ett nytt lösenord
- [Ta bort begränsningar](./remove-restrictions), ta bort användningsbegränsningar utan full dekryptering
- [Ändra behörigheter](./change-permissions), ändra specifika behörigheter i en krypterad PDF

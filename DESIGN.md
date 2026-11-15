# Stavuno — dizajnový dokument

**Status:** Approved baseline

**Schválené:** 15. november 2026

**Vykonateľný plán:** [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

## 1. Dizajnové princípy

1. **Rýchly záznam v teréne.** Najčastejšie operácie musia byť dostupné bez dlhého formulára.
2. **Projekt je vždy viditeľný.** Používateľ musí vedieť, do ktorého objektu zapisuje dáta.
3. **Offline stav nie je chyba.** Aplikácia uloží rozpracovanú prácu a zrozumiteľne ukáže, čo ešte nebolo synchronizované.
4. **Roly majú jednoduché rozhranie.** Pracovník neuvidí funkcie stavbyvedúceho, ktoré nemôže použiť.
5. **Automatika je opraviteľná.** OCR iba navrhuje hodnoty; konečné potvrdenie robí človek.

## 2. Informačná architektúra

### Stavbyvedúci

```text
Prihlásenie
└─ Projekty
   └─ Vybraný projekt
      ├─ Dnes
      │  ├─ Denný záznam
      │  └─ Fotografia
      ├─ Účtenky
      │  ├─ Galéria
      │  ├─ Nová účtenka
      │  └─ PDF export
      ├─ Pracovníci
      │  ├─ QR pozvánka
      │  └─ Čakajúce potvrdenia
      ├─ Materiál
      └─ Synchronizácia
```

### Pracovník

```text
QR pozvánka
└─ Meno, priezvisko a pozícia
   └─ Potvrdenie stavbyvedúcim
      └─ Moje požiadavky na materiál
```

## 3. Architektúra aplikácie

```text
React Native / Expo UI
        │
        ├─ obrazovky a komponenty
        ├─ aplikačný stav
        └─ doménové pravidlá
                 │
                 ├─ lokálne úložisko a rad synchronizácie
                 └─ repozitáre dát
                          │
                          ├─ Supabase Auth
                          ├─ PostgreSQL + RLS
                          ├─ Supabase Storage
                          └─ Edge Functions
```

UI nekomunikuje priamo s tabuľkami. Obrazovky volajú aplikačné služby a repozitáre, aby sa pravidlá rolí, offline správanie a spracovanie chýb dali testovať oddelene.

## 4. Rozdelenie zdrojového kódu

| Priečinok | Zodpovednosť |
| --- | --- |
| `src/screens` | Obrazovky a používateľské scenáre |
| `src/components` | Znovupoužiteľné vizuálne komponenty |
| `src/domain` | Typy, validácia a čisté doménové pravidlá |
| `src/services` | Supabase, lokálne úložisko, synchronizácia a export |
| `src/state` | Stav relácie, projektu a aplikácie |
| `src/i18n` | Preklady a jazykové kľúče |
| `src/theme` | Farby, typografia a rozostupy |
| `supabase` | Migrácie, RLS a serverové funkcie |
| `tests` | Jednotkové a integračné testy |

## 5. Navigácia a hlavné obrazovky

### Prihlásenie

Obsahuje e-mail, heslo, vytvorenie účtu a odkaz na obnovu hesla. Chybová správa rozlišuje nesprávne údaje, nepotvrdený e-mail, prekročený limit a problém siete.

### Projekty

Zobrazuje iba projekty dostupné prihlásenému používateľovi. Primárna akcia vytvorí nový projekt. Deštruktívna operácia vyžaduje potvrdenie.

### Dnes

Je vstupným bodom vybraného projektu. Zobrazuje dátum, manuálne zadané počasie, stav denného záznamu a najdôležitejšie akcie.

### Účtenky

Používateľ vidí galériu, kategóriu, dátum, predajcu a sumu. Editor najprv zobrazí návrh OCR a potom vyžaduje potvrdenie alebo ručnú opravu.

### Pracovníci a materiál

Stavbyvedúci generuje pozvánku a spracúva čakajúce žiadosti. Pracovník má samostatné zjednodušené rozhranie iba pre svoje požiadavky.

### Centrum synchronizácie

Zobrazuje stav pripojenia, počet lokálnych operácií, posledný úspech a opis poslednej chyby. Manuálne opakovanie nesmie zmazať lokálne dáta.

## 6. Offline a synchronizačný model

1. Nový záznam dostane stabilné lokálne ID.
2. Zmena sa uloží lokálne a pridá do radu operácií.
3. Pri dostupnom internete sa klient pokúsi operáciu odoslať.
4. Server operáciu spracuje idempotentne podľa jej ID.
5. Po úspechu sa lokálna operácia označí ako synchronizovaná.
6. Pri chybe zostane v rade s bezpečným opisom problému a počtom pokusov.

Konflikt sa v MVP rieši pravidlom poslednej potvrdenej zmeny pri bežných textových poliach. Finančné záznamy a prílohy sa automaticky neprepisujú bez jednoznačnej identity záznamu.

## 7. Bezpečnostný návrh

- mobilný klient používa iba verejný anon kľúč Supabase;
- service-role kľúč zostáva iba na serveri;
- každá projektová tabuľka obsahuje vzťah na projekt;
- RLS overuje členstvo a rolu pri každom čítaní a zápise;
- úložisko fotografií používa privátne cesty viazané na projekt;
- QR token je náhodný, dočasný, jednorazový a na serveri sa porovnáva bezpečným spôsobom;
- PDF export sa vytvára iba z dát, ku ktorým má aktuálny používateľ prístup.

## 8. Vizuálny jazyk

- tmavá modrozelená ako hlavná farba značky;
- svetlé neutrálne pozadie pre čitateľnosť na dennom svetle;
- oranžová iba pre upozornenia a rozpracovanú synchronizáciu;
- červená iba pre chyby a deštruktívne operácie;
- minimálna dotyková plocha 44 × 44 bodov;
- textový popis pri ikonách, ak ich význam nie je jednoznačný.

## 9. Testovacia stratégia

- jednotkové testy doménových pravidiel;
- testy validácie formulárov a transformácie dát;
- testy SQL migrácií a prítomnosti RLS politík;
- integračné testy synchronizačného radu;
- manuálny test kamery na fyzickom Android zariadení;
- manuálny dvojúčtový test oddelenia projektov a rolí;
- kontrola Android exportu alebo APK pred odovzdaním.

## 10. Otvorené rozhodnutia po MVP

- poskytovateľ OCR a jeho cena;
- pravidlá archivácie a retenčná lehota dokumentov;
- platené funkcie a limity bezplatnej verzie;
- publikovanie v Google Play;
- rozšírené schvaľovanie denných záznamov a exportov.

## 11. Implementačný postup

Implementácia sa vykonáva po samostatných krokoch definovaných v `IMPLEMENTATION_PLAN.md`. Každý krok obsahuje scope, súbory, úlohy, akceptačné kritériá a validačné príkazy. Po integrovanej validácii nasleduje nezávislá kontrola verifier agentom s čerstvým kontextom.

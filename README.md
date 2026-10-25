# Stavuno Course

Stavuno je mobilný stavebný denník vytvorený ako semestrálny projekt pre predmet zameraný na vývoj mobilných aplikácií v priemyselnom sektore.

Projekt rieši praktický problém stavebných tímov: denné záznamy, fotografie, účtenky a požiadavky na materiál bývajú rozdelené medzi papier, chaty a tabuľky. Stavuno ich viaže na konkrétny stavebný objekt a rozlišuje oprávnenia stavbyvedúceho a pracovníka.

## Dokumentácia zadania

- [project.md](./project.md) — problém, používatelia, MVP, non-goals a technológie;
- [SPEC.md](./SPEC.md) — funkčná špecifikácia a akceptačné kritériá;
- [DESIGN.md](./DESIGN.md) — UX, architektúra, bezpečnosť a testovacia stratégia.

## Hlavné funkcie

- autentifikácia a obnova hesla;
- stavebné projekty a roly;
- denné záznamy s fotografiami a ručne zadaným počasím;
- evidencia účteniek, kategórií a výdavkov;
- QR pripojenie pracovníka ku konkrétnemu objektu;
- požiadavky na materiál;
- offline rad operácií a synchronizácia;
- PDF reporty;
- slovenské, ukrajinské a ruské rozhranie.

## Technológie

- React Native, Expo a TypeScript;
- Supabase Auth, PostgreSQL, Storage, Edge Functions a RLS;
- Vitest a PGlite;
- jednoduchý webový portál pre pozvánky a verejné odkazy.

## Lokálne spustenie

Požadované sú Node.js a npm.

```bash
npm ci
copy .env.example .env
npm start
```

V `.env` je potrebné nastaviť verejnú URL a anon kľúč vlastného Supabase projektu. Súbor `.env` sa nesmie commitovať.

## Kontrola kvality

```bash
npm run validate
npm run build:worker-portal
```

Prvý príkaz vykoná TypeScript kontrolu, kontrolu prekladov a textov a automatizované testy. Druhý vytvorí statický webový portál v ignorovanom priečinku `worker-portal/dist`.

## Databáza

Migrácie sú v `supabase/migrations`. Pred aplikovaním na vzdialenú databázu ich treba najprv skontrolovať lokálne alebo príkazom dry-run. Serverové tajomstvá patria do prostredia Supabase, nie do mobilnej aplikácie ani GitHub repozitára.

## Pôvod projektu

Tento študijný repozitár vychádza z vlastného skôr vytvoreného prototypu Stavuno. Kód je do neho zaradený v samostatných logických krokoch, aby bolo možné skontrolovať zadanie, návrh, implementáciu backendu a testovanie. Nejde o cudzie riešenie ani o predstieranie, že celý produkt vznikol až po zadaní predmetu.

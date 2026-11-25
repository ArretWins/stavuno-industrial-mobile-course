# Stavuno Course

Stavuno je mobilný stavebný denník vytvorený ako semestrálny projekt pre predmet zameraný na vývoj mobilných aplikácií v priemyselnom sektore.

Projekt rieši praktický problém stavebných tímov: denné záznamy, fotografie, účtenky a požiadavky na materiál bývajú rozdelené medzi papier, chaty a tabuľky. Stavuno ich viaže na konkrétny stavebný objekt a rozlišuje oprávnenia stavbyvedúceho a pracovníka.

## Dokumentácia zadania

- [project.md](./project.md) — problém, používatelia, MVP, non-goals a technológie;
- [SPEC.md](./SPEC.md) — funkčná špecifikácia a akceptačné kritériá;
- [DESIGN.md](./DESIGN.md) — UX, architektúra, bezpečnosť a testovacia stratégia;
- [BACKLOG.md](./BACKLOG.md) — initiative, epics, user stories a tasks;
- [ACCEPTANCE.md](./ACCEPTANCE.md) — Given/When/Then, testy a manuálny demo protokol;
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — schválené kroky pre implementer → verifier workflow.

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

Overená zostava: Node.js 24.13.1, npm 11.8.0, Expo SDK 53 (expo 53.0.27), React Native 0.79.6, React 19.0.0, Supabase JS 2.118.0, TypeScript 5.8.3, Vitest 3.2.7 a PGlite 0.5.11. Presné balíky určuje `package-lock.json`; používať `npm ci`.

```powershell
npm ci
Copy-Item .env.example .env
```

V `.env` je potrebné nastaviť verejnú URL a anon kľúč vlastného Supabase projektu. Súbor `.env` sa nesmie commitovať.

Na fyzickom Androide použiť vlastný natívny build (`npm run android`, s Android SDK, JDK a zariadením/emulátorom), nie Expo Go. Na živé demo treba vlastné neprodukčné Supabase s migráciami, nakonfigurovaný worker portal a príslušné URL dostupné z telefónu; `localhost` na telefóne nie je vývojový počítač. Bez týchto služieb sa dajú spustiť kontroly nižšie, nie plný demo scenár.

## Kontrola kvality

| Príkaz z koreňa repozitára | Čo overuje / výstup |
| --- | --- |
| `npm run validate` | TypeScript, preklady, texty a všetky lokálne testy. |
| `npm run test:db` | Vybraný SQL/RLS/RPC kontrakt a migračné testy cez PGlite; bez Dockeru, DB účtu a vzdialeného Supabase. |
| `npm run build:worker-portal` | Zostaví statický portál do `worker-portal/dist`; bez konfigurácie použije prázdne placeholdery. |
| `npx expo export --platform android --output-dir dist-android-course` | Vytvorí Android bundle, nie inštalovateľný APK. |
| `git diff --check` | Kontrola whitespace v pracovnom diffe. |

Prvý `npm ci` potrebuje prístup k balíkom. Potom kontroly nepotrebujú produkčné služby. Na hodnotenie začať v [ACCEPTANCE.md](./ACCEPTANCE.md).

## Implementer → verifier workflow

Repozitár obsahuje explicitne spúšťaný skill `$implement`. Codex načíta projektové pravidlá z `AGENTS.md`, implementačného agenta z `.codex/agents/implementer.toml` a nezávislého kontrolóra z `.codex/agents/verifier.toml`.

Verifier je read-only na úrovni inštrukcií; vlastný oddelený sandbox nemá. Koordinátor preto porovná Git stav a diff pred jeho spustením a po dokončení. Neočakávaná zmena znamená `BLOCKED`.

Príklad zadania:

Syntax-only príklad pre budúcu schválenú zmenu:

```text
$implement <schválený Step, requirement alebo defect ID>
```

Workflow najprv vykoná schválený krok, potom odovzdá skutočný diff verifier agentovi s čerstvým kontextom. Skill sám nepovoľuje commit, push, deploy ani aplikovanie vzdialených migrácií.

## Databáza

Migrácie sú v `supabase/migrations`. Pred aplikovaním na vzdialenú databázu ich treba najprv skontrolovať lokálne alebo príkazom dry-run. Serverové tajomstvá patria do prostredia Supabase, nie do mobilnej aplikácie ani GitHub repozitára.

## Pôvod projektu

Tento študijný repozitár vychádza z vlastného skôr vytvoreného prototypu Stavuno. Kód je do neho zaradený v samostatných logických krokoch, aby bolo možné skontrolovať zadanie, návrh, implementáciu backendu a testovanie. Nejde o cudzie riešenie ani o predstieranie, že celý produkt vznikol až po zadaní predmetu.

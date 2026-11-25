# Stavuno — schválený implementačný plán

**Status:** Approved baseline

**Schválené vlastníkom projektu:** 15. november 2026

**Vstupy:** `project.md`, `SPEC.md`, `DESIGN.md`, `BACKLOG.md`

**Použitie:** vykonateľný plán pre človeka alebo LLM agenta. Neudeľuje povolenie na produkčný deploy, zmenu živej databázy ani prácu s produkčnými tajomstvami.

Kroky 1–8 nižšie sú míľniky už preneseného prototypu, nie pokyn prerobiť celý systém v jednom behu ani tvrdenie, že vznikol od nuly. Pri ďalšej zmene sa schvaľuje iba jeden samostatný beh s konkrétnym AC.

### Odovzdanie: malé kroky pre jednotlivé behy

Vstupný bod je existujúci kurzový baseline `dcca442`. Každý riadok je samostatný beh; ďalší sa začne po kontrole výstupu predchádzajúceho.

| Beh | Vstup | Rozsah zmeny | Kritérium ukončenia / príkaz |
| --- | --- | --- | --- |
| S1 | Baseline a SPEC | `ACCEPTANCE.md`, SPEC, DESIGN: zosúladiť názvy a pokryť FR-01 až FR-13. | Každá FR má AC a dôkaz; `git diff --check`. |
| S2 | AC-14, AC-15 | Pridať lokálnu DB regresiu a migráciu iba pre jednorazovosť pozvánky. | Prvé použitie prejde, druhé a expirované nie; `npm test -- tests/course-rls.test.ts`. |
| S3 | Hotový lokálny DB fixture z S2 | V rovnakom teste doplniť AC-04, AC-13, AC-16, AC-17 pre prístupy a schválenie. | Vlastník vidí dve požiadavky, každý pracovník jednu, cudzí účet nevidí projekt; `npm run test:db`. |
| S4 | S1–S3 | Spustiť kontroly z README, potvrdiť dôkazy a zaznamenať neoverené scenáre. | `npm run validate`, build portálu a Android export; M01–M06 evidovať samostatne. |

## Pravidlá vykonávania

1. Pred zmenou prečítať schválené dokumenty a skontrolovať pracovný strom.
2. Implementovať iba jeden krok naraz a nevytvárať funkcie mimo `SPEC.md`.
3. Zachovať nesúvisiace používateľské zmeny.
4. Nevkladať do repozitára `.env`, service-role kľúč, signing key ani produkčné URL.
5. Databázové zmeny overovať lokálne alebo cez dry-run; bez výslovného súhlasu nepoužiť `supabase db push`.
6. Po implementácii odovzdať diff nezávislému verifier agentovi s čerstvým kontextom.
7. Verifier iba hlási zistenia. Opravy vykonáva implementer po rozhodnutí koordinátora.

## Step 0: Baseline a rozsah

**Scope:** vybraný identifikátor `UC`, `FR`, `US` alebo konkrétny bug.

**Úlohy**

- prečítať `project.md`, `SPEC.md`, `DESIGN.md`, `BACKLOG.md` a `AGENTS.md`;
- skontrolovať `git status --short`;
- pomenovať cieľ, dotknuté súbory, testy a databázové objekty;
- zastaviť sa, ak treba rozhodnutie meniace rozsah alebo produkčné prostredie.

**Acceptance criteria**

- zmena má jasnú väzbu na schválenú požiadavku;
- nesúvisiace lokálne zmeny zostanú nedotknuté;
- nevznikol žiadny externý side effect.

## Step 1: Základ aplikácie

**Scope:** Expo, TypeScript, navigácia, téma a samostatná course identita.

**Súbory:** `App.tsx`, `index.js`, `app.json`, `package.json`, `src/theme`, `src/components/ui.tsx`.

**Acceptance criteria**

- `npm run typecheck` prejde;
- Android export sa vytvorí;
- package je `sk.stavuno.course`;
- konfigurácia neobsahuje produkčné tajomstvá.

**Kontrola**

```bash
npm ci
npm run typecheck
npx expo export --platform android --output-dir dist-android-course
```

## Step 2: Autentifikácia a projekty

**Scope:** US-01, US-02, FR-01, FR-02.

**Súbory:** `src/state/auth.tsx`, `AuthScreen.tsx`, `ProjectsScreen.tsx`, `supabase.ts`, repositories a počiatočné migrácie.

**Úlohy**

- implementovať Supabase session bez lokálneho fake loginu;
- pridať registráciu, prihlásenie a recovery redirect z prostredia;
- vytvoriť projektové entity, členstvo a RLS;
- implementovať vytvorenie, výber a potvrdené odstránenie projektu.

**Acceptance criteria**

- neznámy účet sa neprihlási ľubovoľným heslom;
- používateľ vidí iba projekty, ktorých je členom;
- recovery neodkazuje na produkčné prostredie;
- projektové tabuľky majú zapnuté RLS.

**Kontrola**

```bash
npx vitest run tests/auth-production-config.test.ts tests/auth-error-messages.test.ts tests/project-lifecycle.test.ts tests/schema.test.ts
```

## Step 3: Denný záznam, počasie a fotografia

**Scope:** US-03, US-04, UC-02, FR-03 až FR-05.

**Súbory:** `DiaryScreen.tsx`, `TodayScreen.tsx`, `dailyDiaryDraft.ts`, `weather.ts`, `cameraLauncher.ts`, `attachments.ts` a camera plugin.

**Acceptance criteria**

- počasie sa dá zadať ručne bez geolokácie;
- fotoaparát sa otvorí po udelení oprávnenia;
- obrázok sa pred uploadom skomprimuje;
- chyba uploadu nevymaže rozpracovaný záznam;
- príloha zostáva izolovaná podľa projektu.

**Kontrola**

```bash
npx vitest run tests/daily-diary-draft.test.ts tests/manual-weather.test.ts tests/weather.test.ts tests/camera-launch.test.ts tests/gallery.test.ts
```

## Step 4: Offline rad a synchronizácia

**Scope:** US-09, FR-12.

**Súbory:** `sync.ts`, `syncCenter.ts`, `localStore.ts`, `sqliteStore.ts`, `useAutomaticSync.ts`, `SyncCenterScreen.tsx`.

**Acceptance criteria**

- každá operácia má stabilné ID;
- reštart zachová pending operácie;
- automatické a manuálne retry nevytvorí duplikát;
- úspešná operácia sa odstráni až po potvrdení servera;
- centrum synchronizácie ukáže posledný úspech a bezpečnú chybu.

**Kontrola**

```bash
npx vitest run tests/sync.test.ts tests/sync-center.test.ts tests/serialized-state-store.test.ts tests/sqlite-store.test.ts
```

## Step 5: Účtenky, OCR a PDF

**Scope:** US-05, US-06, UC-03, UC-06, FR-06 až FR-08.

**Súbory:** obrazovky účteniek, `receiptRepository.ts`, `receiptReports.ts`, OCR a report Edge Functions.

**Acceptance criteria**

- OCR navrhne dátum, predajcu a sumu;
- zlyhanie OCR vždy umožní ručný vstup;
- používateľ rozpoznané údaje potvrdí alebo opraví;
- PDF obsahuje iba vybraný projekt a obdobie;
- pracovnícka rola nemôže vytvárať účtenky ani export.

**Kontrola**

```bash
npx vitest run tests/receipts.test.ts tests/receipt-ocr-function.test.ts tests/receipt-report-function.test.ts tests/pdf-template.test.ts
```

## Step 6: QR onboarding a materiálové požiadavky

**Scope:** US-07, US-08, UC-04, UC-05, FR-09 až FR-11.

**Súbory:** `WorkforceScreen.tsx`, `workforceRepository.ts`, `worker-portal`, `worker-checkin` a migrácie pracovníkov a materiálu.

**Acceptance criteria**

- token je náhodný, dočasný a jednorazový;
- pracovník zadá iba meno, priezvisko a pozíciu;
- členstvo čaká na potvrdenie stavbyvedúcim;
- pracovník vidí iba vlastné požiadavky;
- manažér vidí pending join bez reštartu aplikácie.

**Kontrola**

```bash
npx vitest run tests/qr.test.ts tests/checkin-function.test.ts tests/worker-portal.test.ts tests/pilot-migration-execution.test.ts
npm run build:worker-portal
```

## Step 7: Lokalizácia a zjednodušenie navigácie

**Scope:** FR-13 a priečne UX požiadavky.

**Súbory:** `src/i18n`, hlavné komponenty a obrazovky, `worker-portal/src`.

**Acceptance criteria**

- slovenský slovník je úplný a ukrajinčina s ruštinou majú rovnaké kľúče;
- vyradené workflow nemajú obrazovky ani navigačné odkazy;
- hlavné scenáre sú dostupné bez nadbytočných dashboardov;
- viditeľné texty neobsahujú dočasný vývojársky copy.

**Kontrola**

```bash
npm run lint:translations
npm run lint:copy
npx vitest run tests/i18n.test.ts tests/simplified-navigation.test.ts
```

## Step 8: Bezpečnosť databázy a migrácie

**Scope:** všetky projektové entity a bezpečnostné NFR.

**Súbory:** `supabase/migrations`, `supabase/functions`, migračné testy.

**Acceptance criteria**

- každá projektová tabuľka má RLS;
- owner/worker oprávnenia a auditná história sú overené;
- klient nemôže čítať ani zapisovať dáta cudzieho projektu;
- Edge Functions neobsahujú service-role kľúč;
- produkčná databáza nebola zmenená.

**Kontrola**

```bash
npm test
npx supabase db push --linked --dry-run
```

Dry-run použiť iba pri vedomom pripojení k správnemu neprodukčnému projektu.

## Step 9: Integrovaná validácia

**Acceptance criteria**

- TypeScript, copy, preklady a celý test suite prejdú;
- worker portal a Android bundle sa vytvoria;
- `git diff --check` je čistý;
- výsledok presne pomenuje, čo nebolo overené na živom backende alebo fyzickom zariadení.

**Kontrola**

```bash
npm run validate
npm run build:worker-portal
npx expo export --platform android --output-dir dist-android-course
git diff --check
```

## Step 10: Nezávislé overenie

**Implementer odovzdá verifierovi**

- cieľ a identifikátory požiadaviek;
- `SPEC.md`, `DESIGN.md` a tento plán;
- commit alebo diff;
- výsledky validačných príkazov;
- známe neoverené oblasti.

**Verifier vykoná**

- kontrolu zhody s požiadavkami;
- kontrolu regresií, rolí, RLS, offline správania a chýbajúcich testov;
- vlastné read-only príkazy a testy podľa rizika;
- správu zoradenú podľa závažnosti s presnými súbormi a dôkazmi.

**Verifier nesmie** meniť súbory, opravovať nález, rozširovať scope, deployovať ani aplikovať migrácie.

**Výsledok:** `PASS`, `REVISE` alebo `BLOCKED`. Po `REVISE` koordinátor vráti konkrétne nálezy implementerovi. Maximálne dve opravné kolá bez nového rozhodnutia o rozsahu.

## Manuálne release brány

Automatizované kontroly nenahrádzajú:

- test fotoaparátu na fyzickom Android zariadení;
- test dvoch reálnych účtov a izolácie projektov;
- QR onboarding na druhom zariadení alebo v mobilnom prehliadači;
- doručenie recovery e-mailu;
- OCR so skutočnou účtenkou;
- vizuálnu kontrolu výsledného PDF;
- overenie živej Supabase konfigurácie a RLS.

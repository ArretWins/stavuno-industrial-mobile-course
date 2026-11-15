# Stavuno — produktový backlog

Tento dokument prepája obchodný cieľ produktu s implementačnými úlohami. Stav položiek opisuje aktuálny študijný baseline v repozitári.

## Initiative I-01: Digitalizovať riadenie malého stavebného objektu

**Cieľ:** Stavbyvedúci a pracovníci majú jedno dôveryhodné miesto pre denný priebeh stavby, fotografie, výdavky a materiálové požiadavky aj pri nestabilnom internete.

**Merateľný výsledok MVP:** stavbyvedúci vytvorí projekt, zaznamená pracovný deň a výdavok, pripojí pracovníka cez jednorazový QR kód a prijme jeho požiadavku na materiál bez úniku údajov medzi projektmi.

**Stav:** implementované a automatizovane overované; reálne dvojzariadeniové a produkčné overenie zostáva manuálnou release bránou.

## Epic E-01: Identita, projekty a prístupové roly

### User story US-01: Registrácia a prihlásenie

Ako stavbyvedúci sa chcem bezpečne registrovať, prihlásiť a obnoviť heslo, aby som mal trvalý prístup k svojim projektom.

**Akceptačné kritériá**

- neplatné údaje nevytvoria lokálnu náhradnú reláciu;
- obnova hesla odošle e-mail na nakonfigurovanú recovery stránku;
- chýbajúca Supabase konfigurácia skončí bezpečnou chybou;
- relácia sa uloží do bezpečného klientského úložiska podporovaného Supabase SDK.

**Tasks**

- T-01.1: nakonfigurovať Supabase Auth;
- T-01.2: vytvoriť obrazovku registrácie a prihlásenia;
- T-01.3: implementovať obnovu hesla;
- T-01.4: pridať testy chybových stavov autentifikácie.

**Stav:** Done.

### User story US-02: Správa projektu

Ako stavbyvedúci chcem vytvoriť a vybrať stavebný projekt, aby boli všetky záznamy priradené ku konkrétnemu objektu.

**Akceptačné kritériá**

- nový projekt sa po vytvorení zobrazí vlastníkovi;
- používateľ bez členstva projekt nevidí;
- odstránenie alebo archivácia vyžaduje vedomé potvrdenie;
- projektové dáta sú chránené RLS politikami.

**Tasks**

- T-02.1: navrhnúť tabuľky `projects` a `project_members`;
- T-02.2: vytvoriť projektový repository layer;
- T-02.3: implementovať zoznam a editor projektov;
- T-02.4: overiť izoláciu projektov databázovými testami.

**Stav:** Done.

## Epic E-02: Stavebný denník v teréne

### User story US-03: Denný záznam

Ako stavbyvedúci chcem zapísať vykonané práce, pracovníkov, poznámku a počasie, aby som mal dohľadateľnú históriu dňa.

**Akceptačné kritériá**

- počasie sa dá zadať ručne;
- rozpracovaný záznam sa nestratí pri výpadku siete;
- uloženie po obnovení siete nevytvorí duplikát;
- právne významné uzavretie dňa zachová históriu opráv.

**Tasks**

- T-03.1: vytvoriť doménový model denného záznamu;
- T-03.2: implementovať editor a validáciu;
- T-03.3: pridať lokálny rad synchronizačných operácií;
- T-03.4: otestovať idempotenciu a uzavretie dňa.

**Stav:** Done.

### User story US-04: Fotodokumentácia

Ako stavbyvedúci chcem pridať fotografiu z kamery alebo galérie, aby bol priebeh práce vizuálne zdokumentovaný.

**Akceptačné kritériá**

- kamera funguje aj na zariadeniach, ktoré vyžadujú voliteľný camera hardware feature;
- fotografia sa pred uploadom skomprimuje;
- príloha zostane naviazaná na projekt a záznam;
- používateľ vidí chybu bez straty rozpracovaných údajov.

**Tasks**

- T-04.1: implementovať camera/gallery launcher;
- T-04.2: pridať kompresiu obrázkov;
- T-04.3: vytvoriť privátne storage cesty;
- T-04.4: pridať testy spustenia kamery a spracovania príloh.

**Stav:** Done.

## Epic E-03: Výdavky a účtenky

### User story US-05: Evidencia účtenky

Ako stavbyvedúci chcem odfotiť účtenku a skontrolovať rozpoznané údaje, aby som nemusel všetko prepisovať ručne.

**Akceptačné kritériá**

- OCR navrhne dátum, predajcu a celkovú sumu;
- zlyhanie OCR vždy umožní ručný vstup;
- používateľ pred uložením údaje potvrdí alebo opraví;
- účtenka obsahuje projekt a kategóriu.

**Tasks**

- T-05.1: vytvoriť model účtenky a súborov;
- T-05.2: implementovať OCR Edge Function;
- T-05.3: vytvoriť editor s manuálnou opravou;
- T-05.4: otestovať validáciu a chybové stavy OCR.

**Stav:** Done.

### User story US-06: Export pre účtovníka

Ako stavbyvedúci chcem vytvoriť jeden PDF dokument s tabuľkou výdavkov a obrázkami účteniek, aby som ho mohol odovzdať účtovníkovi.

**Akceptačné kritériá**

- export obsahuje iba vybraný projekt a obdobie;
- suma v tabuľke zodpovedá zahrnutým účtenkám;
- PDF môže vytvoriť iba oprávnená rola;
- dokument sa dá uložiť alebo zdieľať systémovým dialógom.

**Tasks**

- T-06.1: pripraviť šablónu PDF;
- T-06.2: zoradiť a sumarizovať výdavky;
- T-06.3: vložiť fotografie účteniek;
- T-06.4: otestovať binárny výstup a oprávnenia.

**Stav:** Done.

## Epic E-04: Pracovníci a materiál

### User story US-07: Jednorazové QR pripojenie

Ako stavbyvedúci chcem pracovníkovi ukázať dočasný QR kód, aby sa pripojil priamo ku konkrétnemu objektu bez zložitej registrácie.

**Akceptačné kritériá**

- token je náhodný, dočasný a jednorazový;
- pracovník zadá iba meno, priezvisko a pozíciu;
- nové členstvo čaká na potvrdenie stavbyvedúcim;
- použitý alebo expirovaný token sa nedá použiť znova.

**Tasks**

- T-07.1: vytvoriť serverový model pozvánky;
- T-07.2: implementovať generovanie a zobrazenie QR;
- T-07.3: vytvoriť mobilný webový onboarding;
- T-07.4: otestovať rotáciu, expiráciu a opakované použitie.

**Stav:** Done.

### User story US-08: Požiadavka na materiál

Ako pracovník chcem odoslať požiadavku na materiál, aby stavbyvedúci vedel, čo na objekte chýba.

**Akceptačné kritériá**

- pracovník vidí iba vlastné požiadavky;
- stavbyvedúci vidí požiadavky celého projektu;
- stav požiadavky sa mení iba povoleným prechodom;
- pracovník nemôže pridávať účtenky ani exportovať PDF.

**Tasks**

- T-08.1: vytvoriť tabuľku a stavový model požiadaviek;
- T-08.2: implementovať pracovnícky formulár;
- T-08.3: implementovať manažérsky prehľad;
- T-08.4: otestovať osobnú a projektovú izoláciu.

**Stav:** Done.

## Epic E-05: Spoľahlivosť, bezpečnosť a odovzdanie

### User story US-09: Offline synchronizácia

Ako používateľ chcem pokračovať v práci pri nestabilnom internete, aby som nestratil údaje na stavbe.

**Akceptačné kritériá**

- každá lokálna operácia má stabilnú identitu;
- automatická aj manuálna synchronizácia zachová nerozoslané dáta pri chybe;
- centrum synchronizácie ukáže posledný úspech a bezpečný opis chyby;
- opakovanie operácie nevytvorí duplikát.

**Tasks**

- T-09.1: vytvoriť perzistentný lokálny rad;
- T-09.2: implementovať retry a diagnostiku;
- T-09.3: pridať manuálne spustenie synchronizácie;
- T-09.4: otestovať obnovu po výpadku.

**Stav:** Done.

### User story US-10: Overiteľné odovzdanie

Ako hodnotiteľ chcem vidieť špecifikáciu, návrh, implementáciu a dôkazy testovania v samostatných krokoch, aby som vedel posúdiť proces vývoja.

**Akceptačné kritériá**

- prvý commit obsahuje iba `project.md`;
- `SPEC.md`, `DESIGN.md` a implementačný plán sú čitateľné bez znalosti histórie chatu;
- validačný príkaz prejde bez chyby;
- implementáciu môže nezávisle skontrolovať verifier agent.

**Tasks**

- T-10.1: udržiavať dokumentáciu zadania;
- T-10.2: udržiavať logickú Git históriu;
- T-10.3: definovať implementer/verifier workflow;
- T-10.4: zaznamenať výsledky overenia.

**Stav:** Configured — dokumentácia, custom agents a explicitný skill sú prítomné, syntakticky validované a nezávisle skontrolované. Prvé end-to-end vyvolanie `$implement` sa overí na najbližšej schválenej zmene, aby sa už dokončený krok neopakoval iba kvôli demonštrácii.

## Traceability

| Epic | SPEC scenáre | Hlavné časti kódu |
| --- | --- | --- |
| E-01 | UC-01, FR-01, FR-02 | `src/state`, `src/screens/AuthScreen.tsx`, `src/services/repositories.ts` |
| E-02 | UC-02, FR-03 až FR-05, FR-12 | `src/screens/DiaryScreen.tsx`, `src/services/attachments.ts`, `src/domain/sync.ts` |
| E-03 | UC-03, UC-06, FR-06 až FR-08 | `src/screens/ReceiptEditorScreen.tsx`, `src/services/receiptReports.ts` |
| E-04 | UC-04, UC-05, FR-09 až FR-11 | `src/screens/WorkforceScreen.tsx`, `worker-portal`, `supabase/functions/worker-checkin` |
| E-05 | NFR, Definition of Done | `tests`, `scripts/check-*.ts`, `AGENTS.md`, `.agents`, `.codex` |

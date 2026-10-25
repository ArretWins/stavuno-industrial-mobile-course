# Stavuno — špecifikácia MVP

## 1. Cieľ produktu

Stavuno je mobilný stavebný denník pre malé a stredné stavebné tímy. Spája denné záznamy, fotografie, účtenky a požiadavky pracovníkov do jedného projektu, aby mal stavbyvedúci aktuálny a dohľadateľný prehľad o objekte.

## 2. Používatelia a roly

### Stavbyvedúci

- vytvára a spravuje stavebné projekty;
- zapisuje priebeh dňa a dopĺňa fotografie;
- eviduje účtenky a pripravuje prehľad výdavkov;
- vytvára jednorazovú QR pozvánku pre pracovníka;
- prijíma a spracúva požiadavky na materiál;
- rieši stav synchronizácie.

### Pracovník

- pripojí sa ku konkrétnemu projektu pomocou jednorazového QR kódu;
- uvedie meno, priezvisko a pracovnú pozíciu;
- odosiela vlastné požiadavky na materiál;
- nevidí finančné údaje a nemôže pridávať účtenky ani exportovať PDF.

## 3. Hlavné používateľské scenáre

### UC-01: Vytvorenie projektu

1. Prihlásený stavbyvedúci zadá názov a základné údaje objektu.
2. Aplikácia vytvorí projekt a priradí používateľovi rolu vlastníka.
3. Nový projekt sa zobrazí v zozname projektov.

**Akceptačné kritérium:** projekt zostane dostupný po opätovnom spustení aplikácie a iný používateľ ho bez členstva neuvidí.

### UC-02: Denný záznam

1. Stavbyvedúci vyberie projekt a dátum.
2. Zapíše vykonané práce, počet pracovníkov, poznámku a počasie.
3. Voliteľne pridá fotografie z kamery alebo galérie.
4. Záznam uloží.

**Akceptačné kritérium:** záznam sa dá vytvoriť bez stabilného internetu a po obnovení spojenia sa odošle na server bez vytvorenia duplikátu.

### UC-03: Evidencia účtenky

1. Stavbyvedúci odfotí alebo vyberie fotografiu účtenky.
2. OCR sa pokúsi rozpoznať dátum nákupu, predajcu a celkovú sumu.
3. Používateľ rozpoznané údaje potvrdí alebo opraví ručne.
4. Účtenku priradí ku projektu a kategórii.

**Akceptačné kritérium:** chyba OCR nikdy nezablokuje uloženie; povinné údaje sa dajú doplniť ručne.

### UC-04: Pripojenie pracovníka

1. Stavbyvedúci vygeneruje dočasný jednorazový QR kód pre vybraný projekt.
2. Pracovník kód naskenuje v mobilnom prehliadači alebo aplikácii.
3. Vyplní meno, priezvisko a pracovnú pozíciu.
4. Stavbyvedúci prijatie potvrdí.

**Akceptačné kritérium:** po prvom úspešnom použití alebo po vypršaní platnosti sa QR pozvánka nedá použiť znova.

### UC-05: Požiadavka na materiál

1. Pracovník vyberie svoj projekt.
2. Zadá názov materiálu, množstvo a poznámku.
3. Stavbyvedúci uvidí novú požiadavku a zmení jej stav.

**Akceptačné kritérium:** pracovník vidí iba vlastné požiadavky; stavbyvedúci vidí požiadavky celého projektu.

### UC-06: Export výdavkov

1. Stavbyvedúci vyberie projekt a obdobie.
2. Aplikácia vytvorí jeden PDF dokument s tabuľkou výdavkov a fotografiami účteniek.
3. Používateľ dokument uloží alebo zdieľa cez systémové menu.

**Akceptačné kritérium:** export obsahuje iba účtenky vybraného projektu a obdobia a je dostupný iba oprávnenej role.

## 4. Funkčné požiadavky

| ID | Požiadavka | Priorita |
| --- | --- | --- |
| FR-01 | Registrácia, prihlásenie a obnova hesla e-mailom | Must |
| FR-02 | Vytvorenie, zobrazenie a archivácia projektu | Must |
| FR-03 | Denné záznamy s ručne zadaným počasím | Must |
| FR-04 | Fotografie z kamery a galérie | Must |
| FR-05 | Galéria fotografií priradených k projektu | Should |
| FR-06 | Evidencia účteniek, kategórií a súm | Must |
| FR-07 | OCR s možnosťou ručnej opravy | Should |
| FR-08 | PDF export výdavkov a účteniek | Should |
| FR-09 | Jednorazové a dočasné QR pozvánky | Must |
| FR-10 | Potvrdenie nového pracovníka stavbyvedúcim | Must |
| FR-11 | Požiadavky pracovníkov na materiál | Must |
| FR-12 | Lokálne uloženie a manuálna synchronizácia | Must |
| FR-13 | Slovenčina, ukrajinčina a ruština | Should |

## 5. Nefunkčné požiadavky

- aplikácia musí byť použiteľná na telefóne s Androidom;
- základný záznam musí byť možné pripraviť offline;
- citlivé operácie musia byť chránené autentifikáciou a databázovými RLS pravidlami;
- tajné serverové kľúče nesmú byť súčasťou mobilnej aplikácie ani Git repozitára;
- chyba siete musí používateľovi vysvetliť stav a zachovať nerozoslané dáta;
- automatizované testy musia pokrývať kritické doménové pravidlá a databázové migrácie.

## 6. Dátové entity

- `profiles` — profil prihláseného používateľa;
- `projects` — stavebný objekt;
- `project_members` — členstvo a rola v projekte;
- `diary_entries` — denné záznamy;
- `attachments` — fotografie a dokumenty;
- `receipts` — účtenky a rozpoznané údaje;
- `worker_invites` — jednorazové QR pozvánky;
- `material_requests` — požiadavky pracovníkov;
- `sync_operations` — lokálny rad neodoslaných zmien.

## 7. Mimo rozsahu prvej verzie

Kompletné účtovníctvo, mzdy, BIM, verejné ponuky práce, automatické objednávanie materiálu a prediktívne plánovanie stavby nie sú súčasťou MVP.

## 8. Definícia dokončenia

MVP je dokončené, keď kritické scenáre UC-01 až UC-05 fungujú s rolami a RLS, automatizované testy prejdú, Android build sa vytvorí bez chyby a manuálny test na dvoch používateľských účtoch nepotvrdí únik dát medzi projektmi.

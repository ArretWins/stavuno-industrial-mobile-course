# Akceptačné kritériá Stavuno

Každé kritérium má merateľný výsledok a odkaz na overenie. Automatický stĺpec znamená súvisiaci lokálny dôkaz, nie nutne celý používateľský scenár. Testy čítajúce kód overujú kontrakt, nie správanie na telefóne. M01–M06 sú samostatné manuálne scenáre.

| ID | SPEC | Given — predpoklad | When — akcia | Then — očakávaný výsledok | Automatický dôkaz (`tests/`) | Manuálne |
| --- | --- | --- | --- | --- | --- | --- |
| AC-01 | FR-01 | neznámy účet | používateľ zadá neplatné údaje | nevznikne relácia | auth-production-config.test.ts | M01 |
| AC-02 | FR-01 | registrovaný účet a nastavený redirect | používateľ požiada o obnovu | odkaz umožní nastaviť nové heslo | password-recovery.test.ts | M01 |
| AC-03 | FR-02 | prihlásený stavbyvedúci | uloží názov a lokalitu a znovu otvorí aplikáciu | projekt je v jeho zozname | project-lifecycle.test.ts | M02 |
| AC-04 | FR-02 | projekt vlastní iný účet a členstvo chýba | klient číta projekty | cudzí projekt sa nevráti | course-rls.test.ts | — |
| AC-05 | FR-02 | aktívny vlastný projekt | vlastník nastaví stav archivovaný | po obnovení je stav archivovaný | — | M02 |
| AC-06 | FR-03 | vybraný projekt a dátum | stavbyvedúci ručne zadá počasie | uložený zápis zachová zadanú hodnotu | manual-weather.test.ts | M03 |
| AC-07 | FR-04 | oprávnenie kamery alebo fotka v galérii | stavbyvedúci pridá fotku z každého zdroja | obe fotky sa uložia k záznamu | camera-launch.test.ts | M03 |
| AC-08 | FR-05 | fotografie v projektoch A a B | vlastník otvorí galériu projektu A | galéria nezobrazí fotky projektu B | gallery.test.ts | M03 |
| AC-09 | FR-06 | vybraný projekt a kategória | stavbyvedúci uloží účtenku s dátumom, predajcom a sumou 12,34 EUR | účtenka zachová kategóriu a 1 234 centov | receipts.test.ts | M04 |
| AC-10 | FR-07 | čitateľná účtenka a dostupný OCR | stavbyvedúci spustí rozpoznanie | dostane návrh dátumu, predajcu a sumy a môže ho opraviť | receipt-ocr-function.test.ts | M04 |
| AC-11 | FR-07 | OCR zlyhal | stavbyvedúci údaje doplní ručne | účtenku môže uložiť bez úspešného OCR | receipt-ocr-function.test.ts | M04 |
| AC-12 | FR-08 | dve účtenky v období a ďalšia mimo obdobia alebo projektu | vlastník exportuje obdobie | jedno PDF obsahuje tabuľku, fotografie a súčet iba zahrnutých účteniek | receipt-report-function.test.ts | M04 |
| AC-13 | FR-06, FR-08 | pracovník je schválený | číta účtenky alebo žiada export | nevidí cudzie účtenky a nemá prístup k exportu vlastníka | course-rls.test.ts | M05 |
| AC-14 | FR-09 | platná nepoužitá pozvánka | pracovník odošle meno, priezvisko a pozíciu | vznikne čakajúce členstvo a druhé použitie tokenu zlyhá | course-rls.test.ts | M05 |
| AC-15 | FR-09 | pozvánka expirovala | pracovník odošle formulár | členstvo nevznikne | course-rls.test.ts | M05 |
| AC-16 | FR-10 | pracovník čaká na schválenie | najprv skúsi odoslať požiadavku, potom ho vlastník schváli | pred schválením je odmietnutá a po schválení prejde | course-rls.test.ts | M05 |
| AC-17 | FR-11 | dvaja schválení pracovníci s požiadavkou v jednom projekte | každý otvorí svoje požiadavky a vlastník otvorí prehľad | pracovníci vidia iba vlastnú, vlastník vidí obe | course-rls.test.ts | M05 |
| AC-18 | FR-12 | existuje neodoslaný záznam | aplikácia sa reštartuje offline a po návrate siete sa spustí synchronizácia | záznam sa nestratí a nevznikne duplikát | sync.test.ts | M06 |
| AC-19 | FR-13 | slovenský referenčný slovník | spustí sa kontrola prekladov | ruština a ukrajinčina majú rovnaké kľúče | i18n.test.ts | — |

## Manuálny protokol

Použiť samostatné testovacie prostredie, dva účty stavbyvedúcich, dva anonymné profily pracovníkov v oddelených prehliadačoch a syntetické údaje. Zaznamenať commit, zariadenie, výsledok a dôkaz bez osobných údajov alebo tokenov. Nižšie uvedené scenáre nie sú označené ako vykonané.

- **M01:** Skúsiť neplatné heslo; následne vyžiadať recovery pre testovací účet, zmeniť heslo a overiť, že funguje iba nové.
- **M02:** Vytvoriť projekt A a overiť ho po reštarte. Archivovať ho a obnoviť zoznam. Účet druhého stavbyvedúceho projekt nesmie vidieť.
- **M03:** Zapísať počasie bez GPS. Pridať jednu fotku kamerou a jednu z galérie na fyzickom Androide. Otvoriť galériu iného projektu a overiť, že fotky chýbajú.
- **M04:** Vytvoriť dve účtenky v období (12,34 + 7,66 EUR) a jednu mimo obdobia. Na jednej opraviť OCR; druhú uložiť aj pri vypnutom OCR. Otvoriť PDF a overiť dve fotografie, dva riadky a sumu 20,00 EUR.
- **M05:** Skontrolovať expirovaný aj už použitý QR kód. Pred schválením pracovník nemá odoslať požiadavku; po schválení odošlú dvaja pracovníci po jednej. Každý vidí jednu, vlastník dve. Pracovník nemá prístup k účtenkám ani PDF.
- **M06:** V režime lietadlo uložiť zápis a reštartovať aplikáciu. Obnoviť sieť a dvakrát vyvolať synchronizáciu; na serveri overiť jeden záznam a vyprázdnenie radu.

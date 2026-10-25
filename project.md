# Stavuno

## Aký problém riešim

Stavebné tímy strácajú dôležité informácie o priebehu stavby, fotografiách, výdavkoch a požiadavkách na materiál, pretože ich evidujú na viacerých miestach alebo iba ústne.

## Kto sú moji používatelia

- stavbyvedúci, ktorý riadi stavebný objekt a kontroluje jeho dokumentáciu;
- majiteľ alebo správca stavebného projektu;
- pracovník, ktorý potrebuje jednoducho odoslať požiadavku na materiál a byť priradený ku konkrétnemu objektu.

## Ako chcem problém vyriešiť — MVP

Mobilná aplikácia umožní stavbyvedúcemu vytvoriť projekt, viesť denné záznamy, pridávať fotografie a účtenky, evidovať výdavky, prijímať požiadavky na materiál a pozvať pracovníka na objekt jednorazovým QR kódom. Záznamy sa budú dať pripraviť aj bez stabilného internetu a po obnovení spojenia synchronizovať.

## Čo v MVP nebude a prečo

- mzdy, fakturácia a kompletné účtovníctvo — vyžadujú samostatnú legislatívnu a bezpečnostnú analýzu;
- BIM a editácia technických výkresov — nie sú potrebné na overenie základnej hodnoty produktu;
- automatické plánovanie celej stavby — presahuje rozsah prvého použiteľného produktu;
- verejná burza práce alebo dodávateľov — MVP je určené pre existujúci stavebný tím;
- pokročilá finančná analytika a platené balíky — budú sa riešiť až po overení produktu používateľmi.

## Aké technológie potrebujem

- React Native a Expo pre mobilnú aplikáciu;
- TypeScript pre bezpečnejší a udržiavateľný kód;
- Supabase Auth pre prihlasovanie a obnovu hesla;
- PostgreSQL a Row Level Security pre oddelenie dát jednotlivých projektov a rolí;
- Supabase Storage pre fotografie a dokumenty;
- lokálne úložisko a synchronizačnú vrstvu pre prácu bez stabilného internetu;
- Vitest pre automatizované testy;
- Git a GitHub pre verzovanie a odovzdanie projektu.

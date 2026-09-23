# Tanulás webapp

Build lépés nélküli PWA (HTML + CSS + vanilla JS). GitHub Pages szolgálja ki a `main` ág gyökeréből:
https://m00nsc0rched.github.io/Tanulas/ — repó: https://github.com/M00nsc0rched/Tanulas

## Célkészülékek
- **iPhone 15 Pro Max** — 430×932 pt, @3x, Dynamic Island, legfrissebb iOS.
- **iPad 5. gen** — 768×1024 pt, @2x, legfeljebb **iPadOS 16 → Safari 16**. Ne használj ennél újabb
  webes funkciót (pl. CSS nesting, `popover`, `@starting-style`, View Transitions, unprefixelt `backdrop-filter` egyedül).
- Elrendezés: 700 px szélesség és 600 px magasság felett oldalsó menü (iPad), alatta alsó tab bar (iPhone, álló és fekvő).
- A felület magyar nyelvű.

## Claude Artifact dokumentumok szinkronizálása
A claude.ai nem engedi beágyazni az Artifact-okat (`frame-ancestors 'self'`), ezért az app **nyilvános másolatot**
tárol róluk a `docs/<artifact id>/` mappában, és azt nyitja meg teljes képernyős olvasóban (`#/olvaso/<id>`).
A felhasználó 2026-09-23-án kifejezetten a nyilvános másolatot választotta (a titkosított és a csak eszközön
tárolt változat helyett).

Ha a felhasználó azt kéri, hogy „frissítsd / szinkronizáld a Tanulás app dokumentumlistáját”:
1. `Artifact` tool, `action: "list"`, `scope: "mine"`, `limit: 50`. Új vagy frissült (`updated`) elemekkel dolgozz.
2. Minden ilyen artifactnál `action: "list"`, `scope: "files"`, `url: <artifact url>`, majd:
   - **egyoldalas** („single page”): `action: "read"`, `path: "index.html"` → `docs/<id>/index.html`;
   - **többfájlos**: `action: "read"`, `paths: [a lista összes útvonala]` → a teljes fa `docs/<id>/` alá
     (előtte töröld a régi `docs/<id>/` mappát, hogy ne maradjanak elavult fájlok);
   - **„Docs” típusú** (a listában `artifact-type/...` fájlok vannak): az `artifact-type/` alkalmazást NE másold.
     A docs connectorral (`read` project → tab id, majd `export` `format: "html"`) exportáld; a nagy eredmény
     fájlba mentődik, a `data.bytes_b64` mezőt dekódold, majd `powershell -File tools\wrap-doc.ps1 -Fragment <fájl> -Id <id>`.
   - A letöltött fájlok a scratchpad `artifact-files/<belső uuid>/` mappájába kerülnek; a read eredménye mondja meg, melyik az.
3. Ellenőrizd a lapokat: `window.claude` (csak claude.ai-on működik) és más artifactokra mutató claude.ai linkek.
   A linkeket írd át a helyi másolatra (`../<id>/`; pl. a Lay Land tervkönyv a Lay Land játékra mutat).
4. `data/artifacts.json` `items` (legújabb elöl): `id` (az URL utolsó része), `title`, `url`, `local`
   (`docs/<id>/`), `updated` (`YYYY-MM-DD`). A gyökér `updated` mezője az aktuális idő (ISO 8601, +02:00 / +01:00).
   Törölt artifactnál a `docs/<id>/` mappát is töröld.
5. Kizárt artifactok (ezeket ne vedd fel): *(jelenleg nincs)*.
6. Commit + push a `main` ágra; a Pages ~1 perc alatt frissül, az appban a frissítés gomb vagy az automatikus
   (10 percenkénti, előtérbe kerüléskor futó) szinkron hozza le.

## Olvasó és offline működés
- Az olvasó iframe-ben, ugyanarról az originről tölti a másolatot (a dokumentumok `localStorage`-a így megmarad).
- Biztonsági sávok: az iOS az iframe-nek is átadja az `env(safe-area-inset-*)` értékeket (dupla hely lenne), ezért
  betöltéskor a dokumentum stíluslapjaiban az `env()` → `0px` csere történik (`patchSafeArea`), a helyet az olvasó
  hagyja ki a keret körül, és a dokumentum szélének színével tölti ki (`layoutReader`). Nincs kék status bar csík.
- `sw.js`: az app shell verziózott cache-ben van; a `docs/` fájlok (`tanulas-docs`) és a Google Fonts / CDN
  (`tanulas-cdn`) külön cache-ben, verzióváltáskor is megmaradnak. Egy dokumentum az első online megnyitás után offline is olvasható.

## Bővítmények (saját kiegészítések a dokumentumokhoz)
- Az `ext/` mappában vannak, és a `js/app.js` `EXTENSIONS` táblája rendeli őket dokumentumhoz. Az olvasó a
  dokumentum kezdőlapjának betöltésekor `<script>`-ként illeszti be őket az iframe-be (ugyanaz az origin).
- Így a `docs/` másolat szinkronizálása nem írja felül őket, és a claude.ai-os eredetihez sem nyúlunk.
  Csak az appban látszanak.
- `ext/fe-c/fe-c.js`: Gépész záróvizsga tételtár → A/01: „Interaktív · vas–szén állapotábra” alfejezet a
  Témaösszefoglaló után (a tételtár `#ccode` = `A/01` és `#doc` DOM-jára épít; ha a tételtár szerkezete változik,
  ezt ellenőrizni kell). Értékei a dokumentum saját Fe–C ábráit követik (S 0,8%/723 °C, E 2,06%/1147 °C,
  C 4,3%, G 911 °C, P 0,025%, A 1536 °C), az eljárások hőmérsékletei az A/01 kidolgozásaiból valók.
  Színei a tételtár CSS-változói (`--surface`, `--ink`, `--acc` …), így követi a tételtár világos/sötét témáját.

## Kiadás
- Verzió: `APP_VERSION` a `js/app.js`-ben és `CACHE` a `sw.js`-ben — együtt emeld.
- Ikonok/indítóképek: PowerShell + System.Drawing szkripttel készültek; a könyv-ikon SVG változata `icons/favicon.svg`.

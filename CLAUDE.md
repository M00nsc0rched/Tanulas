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
Ha a felhasználó azt kéri, hogy „frissítsd / szinkronizáld a Tanulás app dokumentumlistáját”:
1. `Artifact` tool, `action: "list"`, `scope: "mine"`, `limit: 50`.
2. Írd felül a `data/artifacts.json` `items` tömbjét (legújabb elöl): `id` (az URL utolsó része), `title`, `url`,
   `updated` (`YYYY-MM-DD`). Az `updated` mezőt a gyökérben állítsd az aktuális időre (ISO 8601, +02:00 / +01:00).
3. Kizárt artifactok (ezeket ne vedd fel): *(jelenleg nincs)*.
4. Commit + push a `main` ágra; a Pages ~1 perc alatt frissül, az appban a frissítés gomb vagy az automatikus
   (10 percenkénti, előtérbe kerüléskor futó) szinkron hozza le.

Az app csak linkeket tárol; a dokumentumok tartalma a claude.ai-on marad (privát, bejelentkezés kell hozzá).

## Kiadás
- Verzió: `APP_VERSION` a `js/app.js`-ben és `CACHE` a `sw.js`-ben — együtt emeld.
- Ikonok/indítóképek: PowerShell + System.Drawing szkripttel készültek; a könyv-ikon SVG változata `icons/favicon.svg`.

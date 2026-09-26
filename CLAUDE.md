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
- A `js/app.js` `EXTENSIONS` táblája (jelenleg üres) az `ext/` mappából `<script>`-ként illeszthet be kódot egy
  dokumentum iframe-jébe, ha valamit csak az appban akarunk mutatni. A korábbi `ext/fe-c/fe-c.js` a tételtárba költözött
  (`ix/fec.js`), az `ext/` mappa megszűnt.

## Tételtár olvasófelülete (`docs/QtEMzHsA3gHsg8AHwR6rGC/index.html`, a felhasználó kérésére, 2026-09-26)
- Oldalsáv: a ☰ gomb széles kijelzőn (≥ 861 px) be-/kicsukja (`body.noside`, `st.noside` az `av.v1` localStorage-ban),
  keskenyen rácsúsztatja; a bal széltől (x < 30 px) jobbra húzás előhozza, az oldalsávon balra húzás elrejti.
- Folyószöveg sorkizárt, `hyphens:auto` (`<html lang="hu">`); a `.doc` legfeljebb 1240 px széles, kis margóval (22 / 12 px).
- `jegyzet.js` (`window.TTN`): a ✎ gombbal egy szövegrészhez (p, li, h3/h4, ábra, táblázat, kérdés…) rajz vagy kézírás
  fűzhető (Apple Pencil nyomásérzékenyen, tenyérkiszűréssel; toll, színek, kiemelő, radír, visszavonás). Tárolás csak az
  eszközön: IndexedDB `tt-jegyzet` / `notes` (tartalék: localStorage `tt-jegyzet.<tétel>`). Horgony: zóna (`s` = összefoglaló,
  `b0…` = a `.bodyhtml` részek) + sorszám + szövegujjlenyomat; ha a szöveg megváltozik, a jegyzet a tétel végére kerül.
  A `show()` az `AVIX.show` után `TTN.render(r, doc)`-ot hív. **Szinkronkor ezek a módosítások is a claude.ai-os oldalon vannak.**

## Tételtár interaktív ábrái (`docs/QtEMzHsA3gHsg8AHwR6rGC/ix/`)
- A tételtár része (a claude.ai-os eredetiben is benne van), az `index.html` tölti be a `data-b.js` után:
  `ix/core.js`, `fec.js`, `a-anyag.js`, `a-hegesztes.js`, `a-alakitas.js`, `a-forgacsolas.js`, `a-nc.js`,
  `b-tervezes.js` (B/03–B/05), `b-rendszer.js` (B/01, B/02, B/06–B/08), `b-szerszam.js` (B/09–B/11),
  `b-keszulek.js` (B/12–B/13), `b-szereles.js` (B/14, B/16–B/18), `b-illesztes.js` (B/15, B/19–B/20; benne az ISO 286
  tűréstáblázat 1–250 mm: `ISO.shaft`, `ISO.hole`, K/M/N/P a Δ-szabállyal); a `show()` végén `AVIX.show(r, doc)` hívódik.
  **Szinkronkor ezek a módosítások a claude.ai-os oldalon is megvannak** — ha mégis eltérne, az `index.html` két
  kiegészítését (script tagek + `AVIX.show`) vissza kell tenni.
- `core.js`: `REG` (tétel id → `[[widget, opts], …]`), `AVIX.def(név, {title, sub, mount(el, opt, U, r)})`, segédek `U`-ban
  (`slider`, `seg`, `chips`, `plot`, `scale`, `axes`, `kv`, `quiz`, `store` → localStorage `avix.*`). ES5 stílus (Safari 16).
  Színek a tételtár CSS-változóiból (`--ix-1..8`, `--surface`, `--ink`, `--acc`), így követik a világos/sötét témát.
- `fec.js`: vas–szén állapotábra (nézetek `steel`, `steelw`, `full`, `forge`; `PROC` eljárássávok, `SETS.a1/a3/a4/a5/a10/a13`).
  Értékei a dokumentum saját Fe–C ábráit követik (S 0,8%/723 °C, E 2,06%/1147 °C, C 4,3%, G 911 °C, P 0,025%, A 1536 °C).
- Az ábrák saját rajzok (a jegyzetek ábráit nem másoljuk). A statikus SVG-k a `data-a.js` / `data-b.js` törzsében
  `figure.ixfig` elemek (SVG-azonosítók legyenek egyediek, pl. `b3opt-clip`, `b5-ar`).
- Telefon (≈ 375 px): az összetett, fix elrendezésű ábrák vagy keskeny változatot rajzolnak (`gyrhier`, `cimy`), vagy
  vízszintesen görgethetők (`scrollWrap` + `min-width`); az `.ix-sec>*{min-width:0}` szabály tartja a kártyát a lap szélességén.
  Görgetést blokkoló húzást (`U.plot().drag`) csak ott használj, ahol a húzás a lényeg; kijelöléshez `click` kell.
- Feliratok: a `.ix-sl span` és az `.ix-out h4 small` nagybetűs — képletet, mértékegységet, tűrésjelet (k6 ≠ K6!) csak
  `<small class="nc">`-be tegyél (az kisbetűs marad); a csúszkafelirat görög jelét a `core.js` `span.gk`-ba teszi. Alsó index: HTML-ben `<sub>`, SVG-ben `<tspan dy="3">`.
  Az SVG-szöveg ne lógjon ki a rajzból (az `.ix-plot` levágja): hosszú címkét `text-anchor="end"`-del vagy `U.clamp`-pel tarts bent.
- Készülékméret-teszt (2026-09-25, mind a 112 kártya): 430×932, 932×430, 768×1024, 1024×768 — az olvasó iframe-jében minden
  kártyát lenyitva, a választógombokat végigkattintva, a csúszkákat min/max értékre állítva; ellenőrizve: `.ix-err`, JS-hiba,
  NaN, vízszintes görgetés, az SVG-ből kilógó `text`.
- Tesztelés: a tételtár betöltés után visszaállítja a görgetést, ezért képernyőképhez érdemes a widgetet külön oldalon
  mountolni (`AVIX` + `data-a.js` betöltése, majd `AVIX.show` egy `#doc` elemre).

## Tételtár tartalmi javításai
- A Gépész záróvizsga tételtár (`docs/QtEMzHsA3gHsg8AHwR6rGC/`) adatai a `data-a.js` / `data-b.js` fájlokban vannak
  (`window.AV_B=[{id,g,n,t,sub,q,one,sum,body,…}]`; csak a `"` van escape-elve, nyers UTF-8).
- Tartalmi javítást a claude.ai-os eredetin **és** a repóbeli másolaton is el kell végezni (Artifact publish `url` +
  `files: {"data-b.js": …}`), különben a következő szinkron felülírja. Eszközök: `tools\tetel-dump.ps1 -Id B3 -Field body`
  (kiírja a mező HTML-jét), `tools\tetel-patch.ps1 -Patch <fájl> -Target <data-x.js> [-DryRun]` (egyedi találatú
  keresés–csere, JSON-ellenőrzéssel). A patch-szkriptet a PowerShell tool-lal futtasd (Bash-ből az execution policy
  megakasztja). A patchfájl sorait trimeli és elválasztó nélkül fűzi össze, ezért minden bekezdés / SVG-elem egy sorba kerüljön.
  A/B publikálásnál a módosított `ix/*.js` fájlokat is add át a `files`-ban.
- 2026-09-23: B/01–B/08 átnézve Dudás Illés *Gyártási folyamatok és rendszerek* jegyzete alapján (claude.ai Version 6).
- 2026-09-24: A/01–A/30 átnézve az *EA – Anyagismeret*, *Gyártás 1*, *Gyártás 2* és *Megmunkálási eljárások* jegyzetek
  alapján, javítva, bővítve, interaktív ábrákkal (claude.ai Version 7). Az A/26–A/30 (NC) témának nincs forrása ebben a
  négy jegyzetben, ott csak belső következetességet ellenőriztünk.
- 2026-09-25: B/01–B/08 interaktív ábrák (23 kártya, 21 widget) a Gyártórendszerek jegyzet alapján; B/03 új „5/b Algoritmus és
  optimálás” szakasza (1.3, 9–10. fejezet), B/05 5D-gépkonstrukció-ábra, B/04 kódlista-pontosítás (claude.ai Version 8).
  A jegyzet 7.4. ábrájának példakódja a „hőkezelés nincs” jegyet 0-val írja, a lista 1-gyel — a tételben jelezve.
- 2026-09-25: B/09–B/13 átnézve, javítva, bővítve, 13 interaktív ábrával (claude.ai Version 9). Források: ravai „all-in-one”
  jegyzetgyűjtemény (szerszámgeometria, alakos kések/marók, üregelő, készülékek), Dudás *Megmunkálási eljárások* (alakos kések),
  Kun–Líska–Nagy *Készüléktervezés* (központosítás), Stampfer *Gépipari technológiák II – Készülékek* (szorítás).
  Javított hibák: B/09 a κr hatása fordítva (90°-nál nincs radiális erő); B/10 elsődleges/másodlagos profiltorzulás felcserélve,
  rossz kritikus pont, rossz körkés-képlet (h = R·sin α); B/11 duplikált blokk; B/13 szétesett 13.1 (F_sz = k·F_v/(2μ)).
  Közben az A sor és a B/01–B/08 néhány ábrájának kilógó feliratát is javítottuk (készülékméret-teszt).
- 2026-09-25: B/14–B/20 (szereléstervezés) átnézve, javítva, bővítve, 22 interaktív ábrával (claude.ai Version 10). Fő forrás a
  *Szereléstechnológia* előadássorozat (Adatbázis: „--- Összes egyben ---.pdf”, részben szkennelt diák; a gépen nincs
  pdftoppm, a képes oldalakat egy pdf.js-es segédoldallal — cdnjs `pdf.min.js`, `getDocument` + canvas — lehet megnézni), mellette Dudás *Gyártórendszerek* (szerelési folyamatok,
  184–192. o.) és Szigeti *Gyártás 2* (gyártmány és elemei). Javított hibák: B/15 a 15.9. ábra valójában a 15.4. duplikátuma volt,
  hiányzott a H/h alaplyuk/alapcsap; B/17 elveszett „Válogatott elem” pont; B/19 és B/20 második fele nyers duplikátum volt
  (törölve), B/19 „legfelső” → **legalsó** görgő alatti hézagmérés; B/20 „Fm erő hatására” → Fe, forrasztási szilárdság
  mértékegység-hibája (5–7 és 50 kp/mm², nem N/mm²). Pótolva a forrásból: szerelvényfajták, rang/rend, bázisalkatrész-választás,
  VDI 3239 jelképek, szervezésiforma-táblázat, kúpgörgős hézagbeállítás, tengely–agy kötések, csavarbiztosítás hatáselv szerint.
  Kiegészítésként jelölve (nem a jegyzetből): valószínűségi tűrés √ΣTi², kötésdiagram Φ-vel, VDI 2230 meghúzónyomaték,
  DIN 7190 sajtolt kötés, Boothroyd–Dewhurst DFA.
- A repó iCloud Drive-ban van: gyors egymás utáni átírásnál az iCloud „fájl 2.ext” névre tehet át fájlt (404-es script).
  Commit előtt: `find . -name "* 2.*" -not -path "./.git/*"`.
- A gyökérben lévő `zarovizsga-teteltar.html` a felhasználó saját fájlja, nem része az appnak — ne commitold.

## Kiadás
- Verzió: `APP_VERSION` a `js/app.js`-ben és `CACHE` a `sw.js`-ben — együtt emeld.
- Ikonok/indítóképek: PowerShell + System.Drawing szkripttel készültek; a könyv-ikon SVG változata `icons/favicon.svg`.

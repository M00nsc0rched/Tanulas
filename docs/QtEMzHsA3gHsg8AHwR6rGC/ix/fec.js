/*
 * Gépész záróvizsga tételtár — interaktív vas–szén (Fe–Fe₃C) állapotábra (AVIX ábra: 'fec')
 *
 * Több tétel használja, más-más eljáráskészlettel (opt.set): a1 = felületkeményítés, a5 = lágyító
 * és egyéb térfogati hőkezelések, a10 = kovácsolás, a13 = öntöttvasak. Az értékek a tételtár saját
 * állapotábráit és a tanszéki Anyagismeret jegyzetet követik (S 0,8% / 723 °C, E 2,06% / 1147 °C,
 * C 4,3%, G 911 °C, P 0,025%, A 1536 °C).
 * Színek és betűk: a tételtár CSS-változói (--surface, --ink, --acc …), így világos és sötét témában is illeszkedik.
 */
(function () {
  'use strict';
  if (!window.AVIX) return;

  /* ------------------------------------------------------------------ */
  /* Az állapotábra (a dokumentum egyszerűsített, metastabil Fe–Fe₃C ábrája) */
  /* ------------------------------------------------------------------ */

  var CM = 6.67; // cementit C-tartalma
  var EUD = 0.015; // „pontosan” eutektoidos / eutektikus sáv a besoroláshoz
  var EUT = 0.03;

  function lerp(x0, y0, x1, y1, x) { return y0 + (y1 - y0) * (x - x0) / (x1 - x0); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function liq(c) { return c <= 4.3 ? lerp(0, 1536, 4.3, 1147, c) : lerp(4.3, 1147, CM, 1650, c); } // AC, CD
  function sol(c) { return lerp(0, 1536, 2.06, 1147, c); } // AE
  function a3(c) { return lerp(0, 911, 0.8, 723, c); } // GS
  function acm(c) { return lerp(0.8, 723, 2.06, 1147, c); } // SE
  // Összetétel adott hőmérsékleten (a kötővonalak végpontjai)
  function cGS(t) { return lerp(911, 0, 723, 0.8, t); }
  function cGP(t) { return lerp(911, 0, 723, 0.025, t); }
  function cSE(t) { return lerp(723, 0.8, 1147, 2.06, t); }
  function cAE(t) { return lerp(1536, 0, 1147, 2.06, t); }
  function cAC(t) { return lerp(1536, 0, 1147, 4.3, t); }
  function cCD(t) { return lerp(1147, 4.3, 1650, CM, t); }
  function cPQ(t) { return lerp(723, 0.025, 20, 0.006, t); }

  var COL = { L: '#E4572E', g: '#E0A030', a: '#3B82C4', c: '#8E6BBF', p: '#3D8B5A', le: '#B0567A' };

  // Szövetelemek / fázisok (a tételtár A/02–A/03 megfogalmazásai alapján)
  var K = {
    L: { n: 'olvadék', s: 'L', col: COL.L, d: 'Folyékony fázis — hőkezeléskor sosem érjük el.' },
    g: { n: 'ausztenit', s: 'γ', col: COL.g, d: 'A karbon intersztíciós szilárd oldata a γ-vasban; jól alakítható. Legfeljebb 2,06% C-t old (1147 °C-on) — ezért ausztenitben lehet cementálni, és ausztenitből lehet edzeni.' },
    a: { n: 'ferrit', s: 'α', col: COL.a, d: 'A karbon intersztíciós szilárd oldata az α-vasban; a leglágyabb, legjobban alakítható szövetelem. Alig old szenet (legfeljebb 0,025%).' },
    c1: { n: 'primer cementit', s: 'Fe₃C I', col: COL.c, d: 'Kemény, rideg vaskarbid; az olvadékból válik ki (CD vonal, > 4,3% C).' },
    c2: { n: 'szekunder cementit', s: 'Fe₃C II', col: COL.c, d: 'Kemény, rideg vaskarbid; az ausztenitből válik ki a szemcsehatárokon (ES vonal, > 0,8% C).' },
    c3: { n: 'tercier cementit', s: 'Fe₃C III', col: COL.c, d: 'Vaskarbid, amely a ferritből válik ki (PQ vonal), igen kis mennyiségben.' },
    p: { n: 'perlit', s: 'P', col: COL.p, d: 'A ferrit és a cementit lemezes eutektoidja; 723 °C-on, 0,8% C-nál keletkezik ausztenitből. Kemény és kopásálló.' },
    le: { n: 'ledeburit', s: 'Le', col: COL.le, d: 'Az ausztenit és a cementit eutektikuma; 1147 °C-on, 4,3% C-nál keletkezik (723 °C alatt az ausztenitje perlitté alakul).' },
  };

  // Mezők: cím, alkotók, rövid felirat
  var R = {
    L: { t: 'Olvadék', k: ['L'], s: 'olvadék' },
    Lg: { t: 'Ausztenit + olvadék', k: ['g', 'L'], s: 'γ + olv.' },
    Lc: { t: 'Primer cementit + olvadék', k: ['c1', 'L'], s: 'Fe₃C I + olv.' },
    g: { t: 'Ausztenit (γ)', k: ['g'], s: 'ausztenit (γ)' },
    a: { t: 'Ferrit (α)', k: ['a'], s: 'ferrit' },
    ga: { t: 'Ausztenit + ferrit', k: ['g', 'a'], s: 'γ + α' },
    gc: { t: 'Ausztenit + szekunder cementit', k: ['g', 'c2'], s: 'γ + Fe₃C II' },
    glc: { t: 'Ausztenit + ledeburit + szekunder cementit', k: ['g', 'le', 'c2'], s: 'γ + Le + Fe₃C II' },
    le: { t: 'Ledeburit', k: ['le'], s: 'ledeburit' },
    cle: { t: 'Primer cementit + ledeburit', k: ['c1', 'le'], s: 'Fe₃C I + Le' },
    a3c: { t: 'Ferrit + tercier cementit', k: ['a', 'c3'], s: 'α + Fe₃C III' },
    ap: { t: 'Ferrit + perlit', k: ['a', 'p'], s: 'ferrit + perlit' },
    p: { t: 'Perlit', k: ['p'], s: 'perlit' },
    pc: { t: 'Perlit + szekunder cementit', k: ['p', 'c2'], s: 'perlit + Fe₃C II' },
    plc: { t: 'Perlit + ledeburit + szekunder cementit', k: ['p', 'le', 'c2'], s: 'P + Le + Fe₃C II' },
    le2: { t: 'Ledeburit (átalakult)', k: ['le'], s: 'ledeburit' },
    cle2: { t: 'Primer cementit + ledeburit', k: ['c1', 'le'], s: 'Fe₃C I + Le' },
  };

  function classify(c, t) {
    if (t >= liq(c)) return 'L';
    if (t >= 1147 && (c > 2.06 || t >= sol(c))) return c < 4.3 ? 'Lg' : 'Lc';
    if (t >= 723) {
      if (c <= 0.8) return c <= cGP(t) ? 'a' : (t >= a3(c) ? 'g' : 'ga');
      if (c <= 2.06) return t >= acm(c) ? 'g' : 'gc';
      if (c < 4.3 - EUT) return 'glc';
      if (c <= 4.3 + EUT) return 'le';
      return 'cle';
    }
    if (c <= cPQ(t)) return 'a';
    if (c <= 0.025) return 'a3c';
    if (c < 0.8 - EUD) return 'ap';
    if (c <= 0.8 + EUD) return 'p';
    if (c <= 2.06) return 'pc';
    if (c < 4.3 - EUT) return 'plc';
    if (c <= 4.3 + EUT) return 'le2';
    return 'cle2';
  }

  // Arányok: kétfázisú mezőben emelőszabály (kötővonal), máshol szövetelem-arány
  function parts(id, c, t) {
    function lever(kl, cl, kr, cr) {
      var f = clamp((c - cl) / (cr - cl), 0, 1);
      return { tie: [cl, cr], list: [{ k: kl, comp: cl, f: 1 - f }, { k: kr, comp: cr, f: f }] };
    }
    var x = (2.06 - 0.8) / (CM - 0.8); // a 2,06%-os ausztenitből kiváló szekunder cementit hányada
    var le, c1, c2, c3, pp;
    switch (id) {
      case 'Lg': return lever('g', cAE(t), 'L', cAC(t));
      case 'Lc': return lever('L', cCD(t), 'c1', CM);
      case 'ga': return lever('a', Math.max(0, cGP(t)), 'g', cGS(t));
      case 'gc': return lever('g', cSE(t), 'c2', CM);
      case 'glc': {
        le = (c - 2.06) / (4.3 - 2.06);
        var xs = (2.06 - cSE(t)) / (CM - cSE(t));
        return { list: [{ k: 'g', f: (1 - le) * (1 - xs) }, { k: 'le', f: le }, { k: 'c2', f: (1 - le) * xs }] };
      }
      case 'cle': case 'cle2':
        c1 = (c - 4.3) / (CM - 4.3);
        return { list: [{ k: 'c1', f: c1 }, { k: 'le', f: 1 - c1 }] };
      case 'a3c':
        c3 = (c - cPQ(t)) / (CM - cPQ(t));
        return { list: [{ k: 'a', f: 1 - c3 }, { k: 'c3', f: c3 }] };
      case 'ap':
        pp = (c - 0.025) / (0.8 - 0.025);
        return { list: [{ k: 'a', f: 1 - pp }, { k: 'p', f: pp }] };
      case 'pc':
        c2 = (c - 0.8) / (CM - 0.8);
        return { list: [{ k: 'p', f: 1 - c2 }, { k: 'c2', f: c2 }] };
      case 'plc':
        le = (c - 2.06) / (4.3 - 2.06);
        return { list: [{ k: 'p', f: (1 - le) * (1 - x) }, { k: 'le', f: le }, { k: 'c2', f: (1 - le) * x }] };
      default:
        return { list: [{ k: R[id].k[0], f: 1 }] };
    }
  }

  function edzLow(c) { return (c <= 0.8 ? a3(c) : 723) + 30; }
  function edzHigh(c) { return (c <= 0.8 ? a3(c) : 723) + 50; }

  // Megjegyzés az A/01 szemszögéből (edzhetőség, eljárások)
  function hintEdzes(id, c, t) {
    if (id === 'L' || id === 'Lg' || id === 'Lc') return 'Olvadék is van jelen: hőkezeléskor ezt a tartományt sosem érjük el (a cementálás is legfeljebb 960 °C).';
    if (c > 2.06) return 'Öntöttvas-tartomány (> 2,06% C): a felületkeményítő eljárások acélokra vonatkoznak.';
    if (id === 'a' && t >= 723) return 'Szinte szénmentes vas, ferrites állapotban: szén nélkül nem edzhető.';
    if (id === 'g') {
      var s = c < 0.2
        ? 'Teljesen ausztenites, de C < 0,2%: gyors hűtéssel sem lesz érdemben kemény — ezért kell előbb cementálni (betétedzés).'
        : 'Teljesen ausztenites: innen a kritikusnál gyorsabb (v > v_krit) hűtéssel martenzit keletkezik → edzhető.';
      if (t > edzHigh(c) + 25) s += ' Edzéshez viszont ez már túl magas: szemcsedurvulás fenyeget — a GSK vonal fölé 30–50 °C elég.';
      return s;
    }
    if (id === 'ga') return 'Nem teljesen ausztenites: edzéskor a ferrit megmarad (lágy foltok). Edzéshez a GS vonal (Ac3) fölé kell hevíteni 30–50 °C-kal.';
    if (id === 'gc') return 'Hipereutektoidos acél: elég az SK vonal (Ac1) fölé 30–50 °C-kal hevíteni — edzés után a martenzit mellett a szekunder cementit is megmarad (kopásálló), a szilárdsági jellemzők kedvezőbbek.';
    if (t >= 500 && t <= 580) return 'Az A1 (723 °C) alatt nincs ausztenit, ezért innen nem lehet edzeni. Pont itt dolgozik a nitridálás (500–550 °C): nincs fázisátalakulás, ezért utána nem kell edzeni, és alig vetemedik.';
    return 'Az A1 (723 °C) alatt nincs ausztenit: innen nem lehet edzeni, előbb ausztenitesíteni kell (Ac3 / Ac1 fölé hevíteni).';
  }

  // A/03: tulajdonságok a szövetszerkezet szerint
  function hintProp(id, c, t) {
    var liquid = id === 'L' || id === 'Lg' || id === 'Lc';
    if (liquid) return 'Olvadék van jelen — ez már az öntés tartománya.';
    var s;
    if (t >= 723) {
      s = id === 'g' ? 'Ausztenit (lapközepes köbös γ-vas): lágy, jól alakítható — ezért kovácsolnak ausztenites állapotban. Innen a hűtési sebesség dönti el a szövetet: lassan → ferrit + perlit, közepesen → bainit, a kritikusnál gyorsabban → martenzit (edzés).'
        : c > 2.06 ? 'Öntöttvas-tartomány: a ledeburit kemény, rideg. Gyors hűtéssel a szén cementitként marad (fehér öntöttvas), lassúval grafit válik ki (szürkeöntvény).'
          : 'Kétfázisú mező: az ausztenit mellett ferrit vagy szekunder cementit van egyensúlyban.';
      if (t >= 768 && c <= 0.5 && (id === 'ga' || id === 'a')) s += ' A ferrit 768 °C felett már nem mágneses (Curie-pont, A2).';
      return s;
    }
    if (c <= 0.025) return 'Ferrit (térközepes köbös α-vas): a leglágyabb, legjobban alakítható szövet — de a BCC rács miatt alacsony hőmérsékleten elridegedhet (TTKV!).';
    if (c < 0.8) return 'Ferrit + perlit: minél több a C, annál több a perlit → nő a szilárdság és a keménység, csökken a szakadási nyúlás és az ütőmunka. Szerkezeti acélok tartománya.';
    if (c <= 0.815) return 'Tiszta perlit (0,8% C): ferrit és cementit lemezes eutektoidja — kemény, kopásálló; szferoidizálva (gömbös cementit) jól forgácsolható.';
    if (c <= 2.06) return 'Perlit + szekunder cementit a szemcsehatárokon: kemény, kopásálló, de ridegebb — szerszámacélok tartománya.';
    return 'Öntöttvas: ledeburit (átalakult) és cementit — fehér öntöttvasként kemény és rideg, nem forgácsolható.';
  }

  var HINTS = { a1: ['Edzés szempontjából', hintEdzes], a3: ['Tulajdonság szempontjából', hintProp] };

  /* ------------------------------------------------------------------ */
  /* Eljárások (A/01 kidolgozásainak értékei)                            */
  /* ------------------------------------------------------------------ */

  var PROC = {
    none: { label: 'Csak az ábra' },
    edzes: {
      label: 'Edzés',
      title: 'Közönséges (térfogati) edzés',
      text: 'Hevítés a GSK vonal fölé 30–50 °C-kal (hipoeutektoidos acélnál Ac3 + 30–50 °C), hőntartás, majd hűtés a kritikusnál gyorsabban (v > v_krit) az Mk (martenzitképződés kezdete) alá. Feltétel: C > 0,3%. 0,8% C felett elég az SK fölé hevíteni: a martenzit mellett II. cementit is marad, de a szilárdsági jellemzők kedvezőbbek. Ötvözött acélt jóval Ac1 fölé kell hevíteni, hogy a karbidok feloldódjanak. Hűtőközeg: víz, olaj, erősen ötvözött acélnál levegő. Az ábra csak a hevítés célhőmérsékletét adja meg — a martenzit nem egyensúlyi szövet, ezért nincs rajta.',
      go: function (s) { var c = s.c >= 0.3 && s.c <= 2.06 ? s.c : 0.45; return [c, (edzLow(c) + edzHigh(c)) / 2]; },
    },
    feluleti: {
      label: 'Felületi edzés',
      title: 'Felületi edzés (láng, indukciós, lézer, fürdős)',
      text: 'Csak a kéreg hevül Ac3 fölé, és a hűtéskor csak az edződik martenzitté; a mag szívós marad, a kémiai összetétel nem változik. A hevítési hőmérséklet nagyobb, mint a közönséges edzésé, de a rövid hőntartás miatt nem durvul el a szemcse (fürdős edzésnél a fürdő legalább 100 °C-kal Ac3 fölött van). Feltétel: C > 0,3% (a jegyzet szerint), előkészítő hőkezelés: nemesítés. Jellemző anyagok: Cf35, C45, 41CrMo4. Utána megeresztés 150–200 °C-on.',
      go: function () { return [0.45, a3(0.45) + 70]; },
    },
    cement: {
      label: 'Cementálás',
      title: 'Cementálás (C-dúsítás)',
      text: 'A kis C-tartalmú (C < 0,2%) acélt szenet leadó közegben 830–960 °C-on, 8–24 órán át izzítják — ausztenites állapotban, mert a γ-vas sok szenet old, a ferrit alig; a szén intersztíciósan épül be. A kéreg C-tartalma 0,6–1,1%-ra (optimum 0,8%) nő, a kéregvastagság 0,1–2 mm (a jegyzet szerint; más forrás 0,6–1,2% és 0,1–3 mm). Szilárd közegben a réteg ~0,1–0,15 mm/óra ütemben vastagodik. Az ábrán a kéreg pontja a mag C-tartalmáról jobbra tolódik: a felület eutektoidos–hipereutektoidos, a mag hipoeutektoidos lesz. Önmagában nem ad kemény kérget — utána edzés és megeresztés kell (→ betétedzés).',
      go: function () { return [0.15, 900]; },
      anim: [0.8, 900],
    },
    betet: {
      label: 'Betétedzés',
      title: 'Betétedzés = cementálás + edzés + megeresztés',
      text: 'A kéreg (~0,8% C) és a mag (~0,15% C) más-más edzési hőmérsékletet kíván — a jegyzet négy változata: A. közvetlen edzés a cementálás hőmérsékletéről (olcsó, de kéreg és mag is durvaszemcsés); B. kéregedzés: lassú hűtés után a kéreg C-tartalmának megfelelően, ~755–775 °C (SK + 30–50 °C) → finom kéreg, durva mag; C. magedzés (magfinomítás): a GS vonal fölé 30–50 °C-kal a mag szerint, ~905–925 °C → finom mag, de a kéreg durvaszemcsés; D. kettős edzés: magfinomítás + lágyítás 650–700 °C-on + kéregedzés → finom mag és kéreg. Végül megeresztés 150–200 °C-on, 0,5–1 óra. A kis C-tartalmú mag keményre nem edzhető.',
      go: function () { return [0.8, 765]; },
    },
    nitrid: {
      label: 'Nitridálás',
      title: 'Nitridálás (nitrálás)',
      text: 'Nemesítés és készre munkálás után gáznitrálás ammóniában 500–550 °C-on (2NH₃ → 3H₂ + 2N), 48–96 órán át (48 óra → ~0,5 mm). Az A1 (723 °C) alatt, ferrites állapotban zajlik — nincs fázisátalakulás, ezért utána nem kell edzeni, és alig vetemedik (a darab ~0,02 mm-t dagad). Keménynitrálás: az ötvözők (Al, Cr, Mo, V, Ti, W) nitridjei adják a keménységet (~1150 HV, kb. 30%-kal több a betétedzett kéregnél, és 500 °C-ig megmarad); anyaga nemesíthető acél, C = 0,25–0,4%. Lágynitrálás: vasnitridek, ciánsófürdőben 520–570 °C-on 2–5 óra — ötvözetlen acélhoz, a szívósság és a kifáradási határ növelésére.',
      go: function () { return [0.35, 530]; },
    },
    nitrocem: {
      label: 'Nitrocementálás',
      title: 'Nitrocementálás és karbonitrálás',
      text: 'Szén és nitrogén együttes bevitele. Nitrocementálás (a cementálás dominál): gázcementálás 20–24% NH₃-t is tartalmazó gázkeverékben, 800–830 °C-on; a kisebb hőmérséklet miatt a kéreg nem durvul el, közvetlenül edzhető, a nitridek a kopás- és korrózióállóságot is növelik. Karbonitrálás (a nitrálás dominál): még kisebb hőmérsékleten, rövidebb idővel, kisebb alakváltozással — a cementálás kiváltására (más forrás 540–580 °C-ot ad meg).',
      go: function () { return [0.2, 815]; },
    },
  };
  // A/04 — hegesztett kötések hőkezelése és az előmelegítés
  PROC.hnorm = {
    label: 'Normalizálás',
    title: 'Teljes átkristályosítás: normalizálás, átkristályosító lágyítás',
    text: 'A kötést az Ac3 fölé (hipereutektoidos acélnál az Ac1 fölé) hevítik 30–50 °C-kal, majd levegőn hűtik. A heganyag öntési szövete az alapanyagéhoz közeli szövetté alakul, így a szilárdsági tulajdonságok is azonossá válnak — ahol lehet, ezt kell választani. Hátránya a magas hőmérséklet, a nagyobb energia és a torzulás.',
    go: function () { return [0.18, a3(0.18) + 40]; },
    layer: function (x) { return x.band([[0, 941], [0.8, 753], [1.2, 753], [1.2, 773], [0.8, 773], [0, 961]]) + x.lab(0.62, 845, 'Ac3 + 30–50 °C'); },
  };
  PROC.hmeg = {
    label: 'Nagy hőm. megeresztés',
    title: 'Nagy hőmérsékletű megeresztés (Ac1 alatt)',
    text: 'A kötést az Ac1 (723 °C) alatt 30–100 °C-kal hevítik (a gyakorlatban biztonsági ráhagyással, Ac1 − 30…50 °C). A hőhatásövezet martenzitje szferoidittá alakul, a keménység csökken, a saját feszültségek is csökkennek. A heganyag öntési szövete megmarad, de ~200 °C-kal alacsonyabb hőmérséklet, helyi hevítéssel is elvégezhető. Ha átlépnénk az Ac1-et, a HAZ újra ausztenitesedne, és lehűléskor ismét martenzit képződne!',
    go: function () { return [0.2, 660]; },
    layer: function (x) { return x.band([[0, 623], [1.2, 623], [1.2, 693], [0, 693]]) + x.lab(0.05, 707, 'Ac1 − 30…100 °C'); },
  };
  PROC.hfesz = {
    label: 'Feszültségcsökkentés',
    title: 'Feszültségcsökkentő hőkezelés',
    text: 'A jegyzet szerint 530–580 °C-on, 30 perc hőntartással, majd lassú lehűtéssel (5–7 °C/perc); vastag, ötvözetlen szerkezeti acélnál (s > 40 mm) kb. 650 °C, közepesen ötvözött acélnál 600–700 °C. A cél a hegesztés okozta saját feszültségek csökkentése — ezek külső terhelés nélkül is repedést indíthatnak, és időben alkalmazva a hidegrepedést is megelőzik.',
    go: function () { return [0.2, 555]; },
    layer: function (x) { return x.band([[0, 530], [1.2, 530], [1.2, 580], [0, 580]]) + x.band([[0, 600], [1.2, 600], [1.2, 700], [0, 700]], 'band2') + x.lab(0.05, 515, '530–580 °C (jegyzet)') + x.lab(0.62, 650, '600–700 °C: közepesen ötvözött'); },
  };
  PROC.helo = {
    label: 'Előmelegítés',
    title: 'Előmelegítés a karbonegyenérték szerint',
    text: 'A jegyzet táblázata: CE ≤ 0,45% → legfeljebb 100 °C (csak hidegben, vastag lemeznél, fűzéskor); CE = 0,45–0,6% → 100–250 °C; CE > 0,6% → 250–350 °C; Ce ≈ 1% → 400–450 °C. Az előmelegítés a martenzitképződés hőközében lassítja a hűlést, így a HAZ kevésbé keményedik fel, és a hidrogén is könnyebben távozik.',
    go: function () { return [0.35, 200]; },
    layer: function (x) { return x.band([[0, 20], [1.2, 20], [1.2, 100], [0, 100]], 'band2') + x.band([[0, 100], [1.2, 100], [1.2, 250], [0, 250]]) + x.band([[0, 250], [1.2, 250], [1.2, 350], [0, 350]], 'band2') + x.lab(0.62, 60, 'CE ≤ 0,45: ≤ 100 °C') + x.lab(0.62, 175, 'CE 0,45–0,6: 100–250 °C') + x.lab(0.62, 300, 'CE > 0,6: 250–350 °C'); },
  };
  PROC.hhidr = {
    label: 'Hidrogénmentesítés',
    title: 'Hidrogénmentesítő hőkezelés',
    text: 'Közvetlenül a hegesztés után, kb. 200–350 °C-on, néhány órás hőntartással: a varratban oldott diffundálható hidrogén kidiffundál, mielőtt a késleltetett (órák–napok múlva jelentkező) hidrogénrepedés kialakulna. A jegyzet szerint a H₂ 250–300 °C-on való huzamos hőntartással képes kidiffundálni.',
    go: function () { return [0.2, 280]; },
    layer: function (x) { return x.band([[0, 200], [1.2, 200], [1.2, 350], [0, 350]]) + x.lab(0.62, 275, '200–350 °C'); },
  };
  function hintWeld(id, c, t) {
    if (t >= 1147 || id === 'L' || id === 'Lg') return 'Olvadék: ez már a varratfürdő és az összeolvadási zóna hőmérséklete.';
    if (id === 'g') return t > 1100 ? 'A hőhatásövezet túlhevített (durvaszemcsés) zónájának hőmérséklete: az ausztenitszemcse erősen megnő, gyors hűléskor itt a legnagyobb a felkeményedés és a hidegrepedés veszélye.' : 'Ausztenites állapot: a HAZ-nak ez a része a hűléskor újra átalakul — gyors hűlésnél (nagy C, nagy CE, vastag lemez) martenzit képződhet. Ezt fékezi az előmelegítés.';
    if (id === 'ga' || id === 'gc') return 'Részleges átkristályosodás tartománya (Ac1–Ac3 között): a HAZ-nak ez a sávja csak részben ausztenitesedik.';
    if (t >= 600) return 'Ac1 alatt: nincs fázisátalakulás — itt végzik a nagy hőmérsékletű megeresztést és a feszültségcsökkentést (a martenzit megeresztődik, a feszültség csökken).';
    if (t >= 200) return 'Az előmelegítés és a hidrogénmentesítés tartománya: a hűlés lassítása és a diffundálható hidrogén kihajtása.';
    return 'Szobahőmérséklet közelében: a hidegrepedés 200 °C alatt, a hegesztés után 10–20 perccel kezdődhet — órák, napok múlva is.';
  }
  HINTS.a4 = ['Hegesztett kötés szempontjából', hintWeld];

  // A/05 — megmunkálhatóságot segítő hőkezelések
  function bandH(x, t0, t1, cls) { return x.band([[0, t0], [2.2, t0], [2.2, t1], [0, t1]], cls); }
  PROC.kfesz = { label: 'Feszültségcsökkentő', title: 'Feszültségcsökkentő izzítás', text: 'Ac1 alatt, 550–650 °C (legfeljebb 650 °C), 1–2 óra, lassú hűtés kemencében. Nincs átalakulás: a szövet és a szilárdság nem változik, csak a maradó feszültségek relaxálnak.', go: function (s) { return [s.c <= 2 ? s.c : 0.45, 600]; }, layer: function (x) { return bandH(x, 550, 650) + x.lab(1.1, 665, '550–650 °C'); } };
  PROC.kujra = { label: 'Újrakristályosítás', title: 'Újrakristályosító izzítás', text: 'Hidegalakítás után, 500 °C fölött (a jegyzet ábráján kb. 500 °C és A1 között), 2–5 óra, levegőn hűtés; a hőfokot és az időt az alakítás mértéke szerint. Új, torzulásmentes szemcsék nőnek; szövet: ferrit–szemcsés perlit.', go: function (s) { return [s.c <= 0.8 ? s.c : 0.2, 600]; }, layer: function (x) { return bandH(x, 500, 715) + x.lab(1.1, 520, '≥ 500 °C … A1 alatt'); } };
  PROC.klagy = { label: 'Teljes kilágyítás', title: 'Teljes kilágyítás (gömbösítő)', text: '680 °C és az Ac1 között, 2–4 óra, lassú (kemencés) hűtés: a perlit cementitlemezei gömbösödnek → szemcsés perlit (szferoidit), a legjobb forgácsolhatóság nagy C-tartalmú acélnál. Ingázó változat: 680–770 °C között az Ac1 körül fel-le.', go: function () { return [1.0, 705]; }, layer: function (x) { return bandH(x, 680, 723) + bandH(x, 723, 770, 'band2') + x.lab(1.1, 655, '680–723 °C (ingázó: 680–770)'); } };
  PROC.knorml = { label: 'Normalizáló lágyítás', title: 'Normalizáló lágyítás', text: 'Ötvözött, hipoeutektoidos acél: Ac3 + 30–50 °C (3–3,5 h), levegőn hűtés 680–700 °C-ig, ott 5–6 óra, majd kemence vagy levegő → szemcsés perlit.', go: function () { return [0.4, a3(0.4) + 40]; }, layer: function (x) { return x.band([[0, 941], [0.8, 753], [0.8, 773], [0, 961]]) + bandH(x, 680, 700, 'band2') + x.lab(0.05, 985, 'Ac3 + 30–50 °C') + x.lab(1.1, 655, '→ 680–700 °C, 5–6 h'); } };
  PROC.kizo = { label: 'Izotermális lágyítás', title: 'Izotermális lágyítás', text: 'Ac3 fölé 30–50 °C-kal (3–3,5 h), majd gyors hűtés Ac1 alá, 600–700 °C-ra, és ott 3–8 óra hőntartás → szemcsés perlit. Kis sebességű forgácsolás (fogazás, bordamarás, üregelés) előtt.', go: function () { return [0.4, 650]; }, layer: function (x) { return x.band([[0, 941], [0.8, 753], [0.8, 773], [0, 961]]) + bandH(x, 600, 700, 'band2') + x.lab(0.05, 985, 'Ac3 + 30–50 °C') + x.lab(1.1, 580, '→ 600–700 °C, 3–8 h'); } };
  PROC.kaus = { label: 'Ausztenitre lágyítás', title: 'Ausztenitre lágyítás', text: 'Erősen ötvözött (korrózióálló, hőálló, nagy Mn-tartalmú) acél: 1000–1050 °C-ra hevítés a γ-mezőbe, a karbidok feloldása, gyors hűtés (víz, olaj). A Fe–C ábra az ötvözött acélt csak közelítőleg írja le.', go: function () { return [0.1, 1030]; }, layer: function (x) { return bandH(x, 1000, 1050) + x.lab(0.05, 1070, '1000–1050 °C, majd gyors hűtés'); } };
  PROC.kdurv = { label: 'Szemcsedurvítás', title: 'Szemcsedurvító hőkezelés', text: 'Ac3 fölött, 950–1100 °C, 1–2 óra, olaj, majd levegő; utána normalizálni kell. Kis C-tartalmú és betétben edzhető (Cr, Cr-Mn, Cr-Mo) acélok kis sebességű forgácsolása előtt.', go: function () { return [0.18, 1020]; }, layer: function (x) { return bandH(x, 950, 1100) + x.lab(0.05, 1120, '950–1100 °C (Ac3 fölött)'); } };
  PROC.kpat = { label: 'Patentírozás', title: 'Patentírozás (huzal)', text: 'Közepes C-tartalmú (0,5–1%) huzal: ausztenitesítés 850–980 °C (a Gyártás I. jegyzet: 850–1100 °C), gyors hűtés 400–520 °C-os ólomfürdőbe, hőntartás a teljes átalakulásig → ferritmentes szorbit.', go: function () { return [0.7, 920]; }, anim: [0.7, 480], layer: function (x) { return bandH(x, 850, 980) + bandH(x, 400, 520, 'band2') + x.band([[0.5, 330], [1.0, 330], [1.0, 1180], [0.5, 1180]], 'band2') + x.lab(1.05, 1000, 'ausztenitesítés') + x.lab(1.05, 460, 'ólomfürdő 400–520 °C') + x.lab(0.75, 345, 'C 0,5–1%', 'middle'); } };
  function hintSoft(id, c, t) {
    if (id === 'L' || id === 'Lg' || id === 'Lc') return 'Olvadék — ez az öntés tartománya, hőkezeléskor sosem érjük el (a diffúziós hőkezelés is a szolidusz alatt kb. 100 °C-kal marad).';
    if (c > 2.06) return 'Öntöttvas-tartomány: a lágyító hőkezelések itt a fehér öntöttvas temperálását jelentenék (lásd A/13).';
    if (id === 'g') return t >= 950 ? 'Magas ausztenites hőmérséklet: gyors szemcsedurvulás — szándékosan csak a szemcsedurvító hőkezelésnél és az ausztenitre lágyításnál; utána normalizálni kell.' : 'Ausztenites mező: innen indul a normalizálás, a normalizáló és az izotermális lágyítás, a patentírozás (a hevítés Ac3 fölé 30–50 °C-kal). A túlhevítés szemcsedurvulást okoz.';
    if (id === 'ga' || id === 'gc') return 'Kétfázisú mező az A1 és A3 (Acm) között: az ingázó lágyítás itt, az Ac1 körül (680–770 °C) ingadoztat — a cementitlemezek feldarabolódnak és gömbösödnek.';
    if (t >= 680) return 'Közvetlenül az A1 alatt: a teljes kilágyítás tartománya (680 °C–A1) — a lemezes cementit gömbösödik, szemcsés perlit keletkezik.';
    if (t >= 500) return 'Az A1 alatt nincs átalakulás: itt dolgozik az újrakristályosítás (500 °C fölött) és a feszültségcsökkentő izzítás (550–650 °C).';
    if (t >= 400) return 'A patentírozás ólomfürdőjének tartománya (400–520 °C): az ausztenit itt izotermikusan finomlemezes szorbittá alakul.';
    return 'Alacsony hőmérséklet: itt már nem történik lényeges szerkezeti változás.';
  }
  HINTS.a5 = ['Megmunkálhatóság szempontjából', hintSoft];

  // A/10 — kovácsolás hőmérséklet-tartománya, a hidegen alakított acél hőkezelései (Gyártás I. jegyzet)
  function forgeTop(lo) { var p = [], c; for (c = 0; c <= 1.6001; c += 0.1) p.push([c, sol(c) - 200]); for (c = 1.6; c >= -0.0001; c -= 0.1) p.push([Math.max(0, c), sol(Math.max(0, c)) - lo]); return p; }
  PROC.kovt = { label: 'Kovácsolás', title: 'A kovácsolás hőmérséklet-tartománya', text: 'A jegyzet szerint a kovácsolás a γ-mezőben végzett melegalakítás. Kezdés a lehető legmagasabb hőmérsékleten (kisebb alakítási ellenállás és munka, kisebb szerszámterhelés), de kb. 200 °C-kal a szolidusz alatt (szemcsedurvulás, szénkiégés, felületi olvadás). A befejezés a GOS vonal fölött (az ábrán kb. 800–900 °C): nagy alakítással itt finom szemcse érhető el. C ≤ 0,8%-ig korlátlanul, 0,8–2,1% között korlátozottan kovácsolható (a szekunder cementit ridegít).', go: function (s) { return [s.c <= 1.6 ? s.c : 0.45, 1100]; }, layer: function (x) { var mid = forgeTop(250).slice(17).concat([[0, 900], [1.6, 900]]); return x.band(mid, 'band2') + x.band(forgeTop(250)) + x.band([[0, 800], [2.06, 800], [2.06, 900], [0, 900]]) + x.lab(0.05, 1318, 'felső hőköz ≈ szolidusz − 200 °C') + x.lab(1.28, 838, 'alsó hőköz ≈ 800–900 °C'); } };
  PROC.hlagy = { label: 'Lágyítás', title: 'Lágyítás hidegalakítás után', text: 'A jegyzet szerint 600–700 °C, 4–5 óra hőntartás; csökkenti az alakítási ellenállást. Minél nagyobb volt az előzetes hidegalakítás, annál kisebb a lágyulási hőmérséklet; a hőfok függ a C-tartalomtól, az alakítás mértékétől és a hőntartás idejétől.', go: function (s) { return [s.c <= 0.8 ? s.c : 0.2, 650]; }, layer: function (x) { return bandH(x, 600, 700) + x.lab(1.1, 715, '600–700 °C, 4–5 h'); } };
  function hintForge(id, c, t) {
    if (id === 'L' || id === 'Lg' || id === 'Lc') return 'Olvadék vagy kétfázisú (olvadék + szilárd) állapot: itt alakítani nem lehet. A kovácsolás felső határa a jegyzet szerint kb. 200 °C-kal a szolidusz alatt van.';
    if (c > 2.06) return 'Öntöttvas-tartomány: a ledeburit rideg, a vasöntvény nem kovácsolható — alakját öntéssel kapja.';
    if (id === 'g' && t > sol(c) - 200) return 'Túl magas hőmérséklet: szemcsedurvulás, szénkiégés, felületi olvadás („elégés”) veszélye — a kovácsolást kb. 200 °C-kal a szolidusz alatt kell kezdeni.';
    if (id === 'g') return t >= 900 ? 'A kovácsolás tartománya (γ-mező): kicsi az alakítási ellenállás, a keményedést az újrakristályosodás folyamatosan követi — nincs felkeményedés (melegalakítás).' : 'A kovácsolás alsó, befejező hőköze: nagy alakítás esetén itt finom szemcse, finom szövet érhető el (magasabb hőmérsékleten befejezve a szemcse durvul).';
    if (id === 'ga' || id === 'gc') return 'Kétfázisú mező (A1 és A3/Acm között): a jegyzet szerint a kovácsolást a GOS vonal fölött kell befejezni; hidegebben alakítva veszélyes alakítási feszültségek maradnak vissza. Hipereutektoidos acélnál a szekunder cementit ridegít — ezért csak korlátozottan kovácsolható.';
    if (t >= 550) return 'Az A1 alatt nincs átalakulás: itt dolgoznak a hidegen alakított acél hőkezelései — feszültségcsökkentés (550–650 °C, 1–2 h), lágyítás (600–700 °C, 4–5 h), újrakristályosító izzítás.';
    if (t >= 400) return 'A patentírozás ólomfürdőjének tartománya (400–520 °C): a hidegen húzott huzal húzási fokozatai között tovább húzhatóvá teszik.';
    return 'Alacsony hőmérséklet: az itt végzett alakítás hidegalakítás — a keményedés, a textúra és az alakítási feszültség megmarad.';
  }
  HINTS.a10 = ['Alakítás szempontjából', hintForge];

  // Eljáráskészletek tételenként
  var SETS = {
    a10: {
      procs: ['none', 'kovt', 'kfesz', 'hlagy', 'kujra', 'kpat'],
      view: 'forge', sv: 'forge', c0: 0.45, t0: 1100,
      lead: 'Hol kovácsolunk, és hol kezeljük a hidegen alakított acélt? <b>Válassz eljárást</b>: a kovácsolás a γ-mezőben, a szolidusz alatt kb. 200 °C-tól a GOS vonalig tart (Gyártás I. jegyzet ábrája), a hidegalakítás utáni hőkezelések az A1 alatt dolgoznak. A kártya az alakítás szempontjából értelmezi a pontot.',
    },
    a5: {
      procs: ['none', 'kfesz', 'kujra', 'klagy', 'knorml', 'kizo', 'kaus', 'kdurv', 'kpat', 'hnorm'],
      c0: 0.45, t0: 700,
      lead: 'A megmunkálhatóságot segítő hőkezelések a Fe–C ábrán. <b>Válassz eljárást</b>: a sáv a hevítési (és ha van, a hőntartási) hőmérsékletet mutatja az A1 és A3 vonalhoz képest — itt látszik a lényeg: <b>Ac1 alatt vagy fölött</b> dolgozik-e.',
    },
    a4: {
      procs: ['none', 'helo', 'hhidr', 'hfesz', 'hmeg', 'hnorm'],
      view: 'steelw', sv: 'steelw', c0: 0.2, t0: 650,
      lead: 'Hol vannak a hegesztés előtti és utáni hőkezelések az állapotábrán? <b>Válassz eljárást</b>: a sáv megmutatja a hőmérséklet-tartományt az A1 (723 °C) és az A3 vonalhoz képest. A kártya a hegesztett kötés szempontjából értelmezi a pontot.',
    },
    a3: {
      procs: ['none'],
      view: 'full',
      lead: 'Az acél tulajdonsága azért változik a hőmérséklettel, mert változik a szövetszerkezete. <b>Koppints az ábrára vagy húzd a jelölőt</b>: a kártya megmutatja a fázisokat, arányukat és a mechanikai tulajdonságot. Játszd le a lassú hűlést is.',
    },
    a1: {
      procs: ['none', 'edzes', 'feluleti', 'cement', 'betet', 'nitrid', 'nitrocem'],
      lead: 'Az állapotábra a felületkeményítés „térképe”: megmutatja, milyen hőmérsékletre kell hevíteni (edzés, cementálás), és mi van egyensúlyban a kéregben és a magban. <b>Koppints az ábrára vagy húzd a jelölőt</b>, válassz eljárást, vagy játszd le a lassú hűlést.',
    },
  };

  /* ------------------------------------------------------------------ */
  /* Nézetek és rajzolás                                                 */
  /* ------------------------------------------------------------------ */

  var VIEWS = {
    steel: { c0: 0, c1: 2.2, t0: 300, t1: 1200, xt: [0, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2], yt: [300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200], snap: 0.035 },
    steelw: { c0: 0, c1: 1.2, t0: 0, t1: 1200, xt: [0, 0.2, 0.4, 0.6, 0.8, 1, 1.2], yt: [0, 200, 400, 600, 800, 1000, 1200], snap: 0.03 },
    full: { c0: 0, c1: CM, t0: 0, t1: 1700, xt: [0, 1, 2, 3, 4, 5, 6], yt: [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600], snap: 0.1 },
    forge: { c0: 0, c1: 2.2, t0: 500, t1: 1600, xt: [0, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4, 1.6, 1.8, 2], yt: [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600], snap: 0.035 },
  };

  var TOP = 1800, BOT = -60;
  var POLYS = [
    ['L', [[0, TOP], [0, 1536], [4.3, 1147], [CM, 1650], [CM, TOP]]],
    ['Lg', [[0, 1536], [4.3, 1147], [2.06, 1147]]],
    ['Lc', [[4.3, 1147], [CM, 1650], [CM, 1147]]],
    ['g', [[0, 1536], [2.06, 1147], [0.8, 723], [0, 911]]],
    ['a', [[0, 911], [0.025, 723], [0, 723]]],
    ['ga', [[0, 911], [0.8, 723], [0.025, 723]]],
    ['gc', [[0.8, 723], [2.06, 1147], [2.06, 723]]],
    ['glc', [[2.06, 1147], [4.3, 1147], [4.3, 723], [2.06, 723]]],
    ['cle', [[4.3, 1147], [CM, 1147], [CM, 723], [4.3, 723]]],
    ['a', [[0, 723], [0.025, 723], [0.006, 20], [0.006, BOT], [0, BOT]]],
    ['a3c', [[0.025, 723], [0.025, BOT], [0.006, BOT], [0.006, 20]]],
    ['ap', [[0.025, 723], [0.8, 723], [0.8, BOT], [0.025, BOT]]],
    ['pc', [[0.8, 723], [2.06, 723], [2.06, BOT], [0.8, BOT]]],
    ['plc', [[2.06, 723], [4.3, 723], [4.3, BOT], [2.06, BOT]]],
    ['cle2', [[4.3, 723], [CM, 723], [CM, BOT], [4.3, BOT]]],
  ];
  var FILL = {
    L: ['L'], Lg: ['g', 'L'], Lc: ['c', 'L'], g: ['g'], a: ['a'], ga: ['g', 'a'], gc: ['g', 'c'],
    glc: ['g', 'le', 'c'], cle: ['c', 'le'], a3c: ['a', 'c'], ap: ['a', 'p'], pc: ['p', 'c'],
    plc: ['p', 'le', 'c'], cle2: ['c', 'le'],
  };
  // Mezőfeliratok helye nézetenként [C, T]
  var LABELS = {
    steel: { g: [0.55, 1060], ga: [0.3, 770], gc: [1.62, 820], ap: [0.4, 520], pc: [1.45, 520] },
    steelw: { g: [0.45, 1080], ga: [0.26, 780], gc: [1.04, 790], ap: [0.4, 420], pc: [1.02, 420] },
    forge: { L: [1.2, 1540], Lg: [1.75, 1330], g: [0.5, 1010], ga: [0.3, 760], gc: [1.62, 950], ap: [0.4, 580], pc: [1.45, 580] },
    full: { L: [3.4, 1520], Lg: [1.85, 1265], Lc: [5.85, 1290], g: [0.62, 1010], gc: [1.72, 840], glc: [3.18, 935], cle: [5.5, 935], ap: [0.42, 380], pc: [1.43, 380], plc: [3.18, 380], cle2: [5.5, 380] },
  };
  // Keskeny teljes ábrán a dokumentum saját ábrájának rövidítései (f+p, p+IIc, Ic+Le …)
  var SHORT = { L: 'olvadék', Lg: 'γ+olv.', Lc: 'Ic+olv.', g: 'γ (auszt.)', gc: 'γ+IIc', glc: 'γ+Le+IIc', cle: 'Ic+Le', ap: 'f+p', pc: 'p+IIc', plc: 'p+Le+IIc', cle2: 'Ic+Le' };
  var PTS = [['A', 0, 1536], ['G', 0, 911], ['P', 0.025, 723], ['S', 0.8, 723], ['E', 2.06, 1147], ['C', 4.3, 1147], ['F', CM, 1147], ['K', CM, 723], ['D', CM, 1650], ['Q', 0.006, 20], ['O', (911 - 768) / 235, 768]];

  function fmt(v, d) { return v.toFixed(d).replace('.', ','); }
  // Egész százalékok, amelyek összege pontosan 100 (legnagyobb maradék módszer)
  function percents(list) {
    var raw = list.map(function (it) { return it.f * 100; });
    var out = raw.map(Math.floor);
    var rest = 100 - out.reduce(function (a, b) { return a + b; }, 0);
    raw.map(function (v, i) { return [v - Math.floor(v), i]; })
      .sort(function (a, b) { return b[0] - a[0]; })
      .slice(0, Math.max(0, rest))
      .forEach(function (x) { out[x[1]]++; });
    return out;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }

  /* ------------------------------------------------------------------ */
  /* Stílus                                                              */
  /* ------------------------------------------------------------------ */

  var CSS = [
    '.fec{color:var(--ink);font-family:var(--disp);--fec-fo:.2;--fec-fo-on:.46}',
    '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .fec{--fec-fo:.26;--fec-fo-on:.55}}',
    ':root[data-theme="dark"] .fec{--fec-fo:.26;--fec-fo-on:.55}',
    '.fec-lead{margin:0 0 14px;font-family:var(--serif);font-size:16px;line-height:1.55;color:var(--ink-2)}',
    '.fec-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 10px}',
    '.fec-seg{display:inline-flex;padding:2px;border-radius:9px;background:var(--surface-2);border:1px solid var(--rule)}',
    '.fec-seg button{min-height:36px;padding:0 12px;border:0;border-radius:7px;background:transparent;color:var(--ink-2);font:600 14px var(--disp);cursor:pointer}',
    '.fec-seg button[aria-pressed="true"]{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(0,0,0,.12)}',
    '.fec-btn{min-height:38px;padding:0 14px;border:1px solid var(--acc-line);border-radius:9px;background:var(--acc-soft);color:var(--acc);font:600 14px var(--disp);cursor:pointer}',
    '.fec-btn:disabled{opacity:.5}',
    '.fec-chips{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}',
    '.fec-chip{min-height:34px;padding:0 12px;border:1px solid var(--rule-2);border-radius:999px;background:transparent;color:var(--ink-2);font:500 14px var(--disp);cursor:pointer}',
    '.fec-chip[aria-pressed="true"]{border-color:var(--acc-line);background:var(--acc-soft);color:var(--acc);font-weight:600}',
    '.fec-plot{position:relative;margin:0 -4px;border-radius:10px;background:var(--surface-2);border:1px solid var(--rule);overflow:hidden}',
    '.fec-svg{display:block;width:100%;touch-action:none;-webkit-user-select:none;user-select:none;cursor:crosshair}',
    '.fec-svg text{font-family:var(--mono);font-size:10.5px;fill:var(--muted)}',
    '.fec-svg .rl{font-family:var(--disp);font-size:12px;font-weight:600;fill:var(--ink-2);paint-order:stroke;stroke:var(--surface-2);stroke-width:3px;stroke-linejoin:round}',
    '.fec-svg .pt{font-family:var(--disp);font-size:12px;font-weight:700;fill:var(--ink);paint-order:stroke;stroke:var(--surface-2);stroke-width:3px}',
    '.fec-svg .ln{fill:none;stroke:var(--ink);stroke-width:1.6;stroke-linejoin:round}',
    '.fec-svg .ln.hk{stroke:var(--acc);stroke-width:2.2}',
    '.fec-svg .ln.thin{stroke-width:1}',
    '.fec-svg .ln.dash{stroke-dasharray:4 4;stroke-width:1.1}',
    '.fec-svg .ln.dot{stroke-dasharray:1.5 3.5;stroke-width:1.2;stroke-linecap:round}',
    '.fec-svg .ax{stroke:var(--rule-2);stroke-width:1}',
    '.fec-svg .grid{stroke:var(--rule);stroke-width:1;stroke-dasharray:2 4}',
    '.fec-svg .lt{font-size:10px;fill:var(--acc);font-weight:600}',
    '.fec-svg .rg{fill-opacity:var(--fec-fo);transition:fill-opacity .15s}',
    '.fec-svg .rg.on{fill-opacity:var(--fec-fo-on)}',
    '.fec-svg .band{fill:url(#fec-hatch);stroke:var(--acc);stroke-width:1.2}',
    '.fec-svg .band2{fill:var(--acc);fill-opacity:.16;stroke:var(--acc);stroke-width:1;stroke-dasharray:3 3}',
    '.fec-svg .bl{font-family:var(--disp);font-size:11.5px;font-weight:700;fill:var(--acc);paint-order:stroke;stroke:var(--surface-2);stroke-width:3.5px;stroke-linejoin:round}',
    '.fec-svg .mk{fill:var(--surface);stroke:var(--acc);stroke-width:3}',
    '.fec-svg .ch{stroke:var(--acc);stroke-width:1;stroke-dasharray:3 3}',
    '.fec-svg .tie{stroke:var(--ink);stroke-width:2.4}',
    '.fec-svg .tied{fill:var(--ink)}',
    '.fec-svg .tl{font-family:var(--disp);font-size:11px;font-weight:600;fill:var(--ink);paint-order:stroke;stroke:var(--surface-2);stroke-width:3px}',
    '.fec-svg .badge rect{fill:var(--acc)}',
    '.fec-svg .badge text{fill:var(--surface);font-weight:600}',
    '.fec-svg .q{font-family:var(--disp);font-size:13px;font-weight:800;fill:var(--acc)}',
    '.fec-sl{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:6px 10px;margin:14px 0 4px}',
    '.fec-sl span{font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}',
    '.fec-sl input{width:100%;min-width:0;height:30px;margin:0;accent-color:var(--acc)}',
    '.fec-sl output{min-width:68px;text-align:right;font:600 15px var(--mono);color:var(--ink)}',
    '.fec-card{margin:12px 0 0;padding:14px;border-radius:10px;background:var(--surface-2);border:1px solid var(--rule)}',
    '.fec-coord{display:block;font:600 11px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--acc)}',
    '.fec-title{margin:4px 0 10px;font:700 19px/1.25 var(--disp);color:var(--ink)}',
    '.fec-bar{display:grid;grid-template-columns:minmax(0,1fr) 44px;gap:2px 10px;align-items:center;margin:0 0 8px}',
    '.fec-bar-lab{font-size:14px;color:var(--ink)}',
    '.fec-bar-lab i{display:inline-block;width:10px;height:10px;margin-right:6px;border-radius:3px;vertical-align:0}',
    '.fec-bar-lab em{font-style:normal;color:var(--muted);font-family:var(--mono);font-size:12px;margin-left:4px}',
    '.fec-bar b{grid-row:span 2;text-align:right;font:600 15px var(--mono)}',
    '.fec-track{height:6px;border-radius:3px;background:var(--rule);overflow:hidden}',
    '.fec-track span{display:block;height:100%;border-radius:3px}',
    '.fec-note{margin:2px 0 0;font-size:12.5px;line-height:1.45;color:var(--muted)}',
    '.fec-hint{margin:12px 0 0;padding:10px 12px;border-left:3px solid var(--acc-line);background:var(--surface);font-family:var(--serif);font-size:15px;line-height:1.5;color:var(--ink-2);border-radius:0 8px 8px 0}',
    '.fec-hint b{font-family:var(--disp);color:var(--ink)}',
    '.fec-defs{margin:10px 0 0;padding:0;list-style:none}',
    '.fec-defs li{margin:6px 0 0;font-family:var(--serif);font-size:14.5px;line-height:1.5;color:var(--ink-2)}',
    '.fec-defs b{font-family:var(--disp);color:var(--ink)}',
    '.fec-proc h4{margin:0 0 6px;font:700 16px var(--disp);color:var(--acc)}',
    '.fec-proc p{margin:0 0 10px;font-family:var(--serif);font-size:15px;line-height:1.55;color:var(--ink-2)}',
    '.fec-cool{margin:10px 0 0;padding:0 0 0 22px;font-family:var(--serif);font-size:14.5px;line-height:1.5;color:var(--ink-2)}',
    '.fec-cool li{margin:5px 0;transition:color .2s,opacity .2s;opacity:.55}',
    '.fec-cool li.done{opacity:1}',
    '.fec-cool li.now{opacity:1;color:var(--ink);font-weight:600}',
    '.fec-cool b{font-family:var(--mono);font-size:12.5px;color:var(--acc);margin-right:4px}',
    '.fec-quiz{margin:14px 0 0;border-top:1px solid var(--rule);padding-top:10px}',
    '.fec-quiz summary{cursor:pointer;min-height:40px;display:flex;align-items:center;font:600 15px var(--disp);color:var(--ink);list-style:none}',
    '.fec-quiz summary::-webkit-details-marker{display:none}',
    '.fec-quiz summary:before{content:"";width:7px;height:7px;margin:0 10px 0 2px;border-right:2px solid var(--acc);border-bottom:2px solid var(--acc);transform:rotate(-45deg);transition:transform .2s}',
    '.fec-quiz[open] summary:before{transform:rotate(45deg)}',
    '.fec-opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;margin:10px 0}',
    '.fec-opt{min-height:44px;padding:8px 12px;border:1px solid var(--rule-2);border-radius:9px;background:var(--surface);color:var(--ink);font:500 14.5px var(--disp);text-align:left;cursor:pointer}',
    '.fec-opt.ok{border-color:var(--ok);background:var(--ok);color:var(--surface);font-weight:600}',
    '.fec-opt.no{border-color:#c0392b;color:#c0392b}',
    '.fec-qmsg{margin:0 0 8px;font-family:var(--serif);font-size:15px;color:var(--ink-2)}',
    '.fec-score{font:600 12px var(--mono);color:var(--muted);letter-spacing:.06em}',
    '@media (prefers-reduced-motion:reduce){.fec *{transition:none!important}}',
  ].join('\n');

  /* ------------------------------------------------------------------ */
  /* Felület                                                             */
  /* ------------------------------------------------------------------ */

  function sectionHTML(set) {
    var chips = set.procs.map(function (k) {
      return '<button type="button" class="fec-chip" data-proc="' + k + '">' + esc(PROC[k].label) + '</button>';
    }).join('');
    return (
      '<p class="fec-lead">' + set.lead + '</p>' +
      '<div class="fec-row">' +
        '<div class="fec-seg" role="group" aria-label="Nézet">' +
          '<button type="button" data-view="' + (set.sv || 'steel') + '">Acél-rész</button><button type="button" data-view="full">Teljes ábra</button>' +
        '</div>' +
        '<button type="button" class="fec-btn" data-fec="cool">▶ Lassú hűlés</button>' +
      '</div>' +
      (set.procs.length > 1 ? '<div class="fec-chips" role="group" aria-label="Eljárás az ábrán">' + chips + '</div>' : '') +
      '<div class="fec-plot"><svg class="fec-svg" role="img" aria-label="Vas–szén állapotábra. Koppints vagy húzd a jelölőt."></svg></div>' +
      '<div class="fec-sl">' +
        '<span>C-tartalom</span><input type="range" data-fec="c" aria-label="Karbontartalom (%)"><output data-fec="co"></output>' +
        '<span>Hőmérséklet</span><input type="range" data-fec="t" aria-label="Hőmérséklet (°C)"><output data-fec="to"></output>' +
      '</div>' +
      '<div class="fec-card fec-proc" data-fec="proc" hidden></div>' +
      '<div class="fec-card" data-fec="read" aria-live="polite"></div>' +
      '<div class="fec-card" data-fec="coolbox" hidden><h4 class="fec-title" style="font-size:16px;margin:0">Lassú (egyensúlyi) hűlés</h4><ol class="fec-cool" data-fec="coollist"></ol></div>' +
      '<details class="fec-quiz" data-fec="quiz"><summary>Gyakorlás: melyik mezőben van a pont?</summary><div data-fec="quizbody"></div></details>'
    );
  }

  function mountInto(root, setName) {
    var set = SETS[setName] || SETS.a1;
    var hintDef = HINTS[setName] || HINTS.a1;
    var storeKey = 'tanulas.fec' + (setName && setName !== 'a1' ? '.' + setName : '');
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(storeKey)) || {}; } catch (e) { /* nem kritikus */ }
    var S = {
      view: VIEWS[saved.view] ? saved.view : (set.view || 'steel'),
      proc: set.procs.indexOf(saved.proc) >= 0 ? saved.proc : 'none',
      c: set.c0 != null ? set.c0 : 0.45, t: set.t0 != null ? set.t0 : 800,
      quiz: null, score: [0, 0], anim: 0,
    };
    var q = function (sel) { return root.querySelector('[data-fec="' + sel + '"]'); };
    var svg = root.querySelector('.fec-svg');
    var plot = root.querySelector('.fec-plot');
    var inC = q('c'), inT = q('t');
    var G = null; // geometria (méret, skálák)

    function save() {
      try { localStorage.setItem(storeKey, JSON.stringify({ view: S.view, proc: S.proc })); } catch (e) { /* nem kritikus */ }
    }

    /* ---- skálák ---- */
    function geom() {
      var V = VIEWS[S.view];
      var w = Math.max(280, plot.clientWidth);
      var h = Math.round(clamp(w * (w < 520 ? 1 : 0.72), 300, 540)); // telefonon közel négyzetes
      var m = { l: 44, r: 40, t: 22, b: 34 };
      var pw = w - m.l - m.r, ph = h - m.t - m.b;
      return {
        V: V, w: w, h: h, m: m, pw: pw, ph: ph,
        x: function (c) { return m.l + (c - V.c0) / (V.c1 - V.c0) * pw; },
        y: function (t) { return m.t + (V.t1 - t) / (V.t1 - V.t0) * ph; },
        cx: function (px) { return V.c0 + (px - m.l) / pw * (V.c1 - V.c0); },
        ty: function (py) { return V.t1 - (py - m.t) / ph * (V.t1 - V.t0); },
      };
    }
    function P(c, t) { return G.x(c).toFixed(1) + ',' + G.y(t).toFixed(1); }
    function path(pts) { return 'M' + pts.map(function (p) { return P(p[0], p[1]); }).join('L'); }

    /* ---- statikus réteg: mezők, vonalak, tengelyek, eljárás ---- */
    function patterns() {
      var out = '<pattern id="fec-hatch" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">' +
        '<rect width="7" height="7" style="fill:var(--acc);fill-opacity:.1"/><rect width="2.2" height="7" style="fill:var(--acc);fill-opacity:.55"/></pattern>';
      Object.keys(FILL).forEach(function (id) {
        var cols = FILL[id];
        if (cols.length === 1) return;
        var sw = 6, W = sw * cols.length;
        out += '<pattern id="fec-p-' + id + '" patternUnits="userSpaceOnUse" width="' + W + '" height="' + W + '" patternTransform="rotate(45)">' +
          cols.map(function (k, i) { return '<rect x="' + (i * sw) + '" width="' + sw + '" height="' + W + '" fill="' + COL[k] + '"/>'; }).join('') + '</pattern>';
      });
      return out;
    }

    function procLayer() {
      var o = '';
      var p = S.proc;
      function band(pts, cls) { return '<path class="' + (cls || 'band') + '" d="' + path(pts) + 'Z"/>'; }
      function lab(c, t, s, anchor) { return '<text class="bl" x="' + G.x(c).toFixed(1) + '" y="' + G.y(t).toFixed(1) + '" text-anchor="' + (anchor || 'start') + '">' + esc(s) + '</text>'; }
      function vdash(c, t0, t1) { return '<path class="ln dash" style="stroke:var(--acc)" d="M' + P(c, t0) + 'L' + P(c, t1) + '"/>'; }
      if (p === 'edzes') {
        o += band([[0, edzLow(0)], [0.8, edzLow(0.8)], [2.06, edzLow(2.06)], [2.06, edzHigh(2.06)], [0.8, edzHigh(0.8)], [0, edzHigh(0)]]);
        o += vdash(0.3, 300, 1200) + lab(0.32, 360, 'C > 0,3%');
        o += lab(1.2, 800, 'GSK + 30–50 °C');
      } else if (p === 'feluleti') {
        o += band([[0.2, a3(0.2) + 30], [0.8, 753], [0.8, 823], [0.2, a3(0.2) + 100]]);
        o += band([[0.35, a3(0.35) + 30], [0.45, a3(0.45) + 30], [0.45, a3(0.45) + 100], [0.35, a3(0.35) + 100]], 'band2');
        o += lab(0.82, 800, 'Ac3 + 30…100 °C (gyors hevítés)');
        o += lab(0.4, 330, 'Cf35 · C45 · 41CrMo4', 'middle');
      } else if (p === 'cement' || p === 'betet') {
        var pts = [], c;
        for (c = 0; c <= 1.505; c += 0.02) pts.push([c, Math.max(830, c <= 0.8 ? a3(c) : acm(c))]);
        var top = [[1.504, 960], [0, 960]];
        if (p === 'cement') {
          o += band(pts.concat(top));
          o += band([[0.6, 830], [1.2, 830], [1.2, 960], [0.6, 960]], 'band2');
          o += '<path class="ln hk" marker-end="url(#fec-arr)" d="M' + P(0.15, 900) + 'L' + P(0.78, 900) + '"/>';
          o += lab(0.2, 975, '830–960 °C · C-dúsítás 0,6–1,2%');
          o += vdash(0.15, 300, 830) + lab(0.17, 360, 'mag ~0,15%') + vdash(0.8, 300, 723) + lab(0.82, 420, 'kéreg ~0,8%');
        } else {
          o += '<path class="band2" d="' + path(pts.concat(top)) + 'Z" style="fill-opacity:.07"/>';
          o += vdash(0.15, 300, 1200) + vdash(0.8, 300, 1200);
          o += '<path class="ln hk" style="stroke-width:7;stroke-linecap:round" d="M' + P(0.15, a3(0.15) + 30) + 'L' + P(0.15, a3(0.15) + 50) + '"/>';
          o += '<path class="ln hk" style="stroke-width:7;stroke-linecap:round" d="M' + P(0.8, 753) + 'L' + P(0.8, 773) + '"/>';
          o += lab(0.19, a3(0.15) + 55, 'magedzés ~905–925 °C');
          o += lab(0.84, 790, 'kéregedzés ~755–775 °C');
          o += lab(0.17, 360, 'mag') + lab(0.82, 360, 'kéreg');
        }
      } else if (p === 'nitrid') {
        o += band([[0, 500], [2.06, 500], [2.06, 550], [0, 550]]);
        o += band([[0.25, 500], [0.4, 500], [0.4, 550], [0.25, 550]], 'band2');
        o += band([[0, 520], [2.06, 520], [2.06, 570], [0, 570]], 'band2');
        o += lab(0.9, 590, 'nitridálás 500–550 °C · A1 alatt');
        o += lab(0.325, 470, 'C 0,25–0,4%', 'middle');
      } else if (p === 'nitrocem') {
        o += band([[0, 800], [1.2, 800], [1.2, 830], [0, 830]]);
        o += band([[0, 540], [1.2, 540], [1.2, 580], [0, 580]], 'band2');
        o += lab(1.25, 808, 'nitrocementálás 800–830 °C');
        o += lab(1.25, 555, 'karbonitrálás (kisebb T)');
      }
      if (PROC[p] && PROC[p].layer) o += PROC[p].layer({ P: P, path: path, band: band, lab: lab, vdash: vdash, G: G, S: S });
      return o;
    }

    function drawStatic() {
      G = geom();
      var V = G.V, o = '';
      svg.setAttribute('viewBox', '0 0 ' + G.w + ' ' + G.h);
      svg.setAttribute('height', G.h);
      o += '<defs>' + patterns() +
        '<marker id="fec-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10Z" style="fill:var(--acc)"/></marker>' +
        '<clipPath id="fec-clip"><rect x="' + G.m.l + '" y="' + G.m.t + '" width="' + G.pw + '" height="' + G.ph + '"/></clipPath></defs>';

      // rács + tengelyfeliratok
      var minDx = 30, lastX = -99;
      V.yt.forEach(function (t) {
        o += '<line class="grid" x1="' + G.m.l + '" x2="' + (G.m.l + G.pw) + '" y1="' + G.y(t) + '" y2="' + G.y(t) + '"/>';
        o += '<text x="' + (G.m.l - 6) + '" y="' + (G.y(t) + 3.5) + '" text-anchor="end">' + t + '</text>';
      });
      V.xt.forEach(function (c) {
        var x = G.x(c);
        if (x - lastX < minDx) return;
        lastX = x;
        o += '<text x="' + x + '" y="' + (G.m.t + G.ph + 15) + '" text-anchor="middle">' + fmt(c, c % 1 ? 1 : 0) + '</text>';
      });
      o += '<text x="' + (G.m.l + G.pw) + '" y="' + (G.h - 4) + '" text-anchor="end">C, %</text>';
      o += '<text x="' + (G.m.l - 6) + '" y="12" text-anchor="end">°C</text>';
      // nevezetes hőmérsékletek jobb oldalt
      [723, 911, 1147, 1536].forEach(function (t) {
        if (t < V.t0 || t > V.t1) return;
        o += '<text class="lt" x="' + (G.m.l + G.pw + 4) + '" y="' + (G.y(t) + 3.5) + '">' + t + '</text>';
      });

      o += '<g clip-path="url(#fec-clip)">';
      POLYS.forEach(function (rp) {
        var id = rp[0], cols = FILL[id];
        var fill = cols.length === 1 ? COL[cols[0]] : 'url(#fec-p-' + id + ')';
        o += '<path class="rg" data-rg="' + id + '" fill="' + fill + '" d="' + path(rp[1]) + 'Z"/>';
      });
      o += procLayer();
      // vonalak
      o += '<path class="ln" d="' + path([[0, 1536], [4.3, 1147], [CM, 1650]]) + '"/>'; // likvidusz ACD
      o += '<path class="ln" d="' + path([[0, 1536], [2.06, 1147], [CM, 1147]]) + '"/>'; // szolidusz AE + ECF
      o += '<path class="ln hk" d="' + path([[0, 911], [0.8, 723], [2.06, 1147]]) + '"/>'; // GS + SE
      o += '<path class="ln hk" d="' + path([[0.025, 723], [CM, 723]]) + '"/>'; // PSK
      o += '<path class="ln thin" d="' + path([[0, 911], [0.025, 723], [0.006, 20]]) + '"/>'; // GP + PQ
      o += '<path class="ln dot" d="' + path([[0, 768], [(911 - 768) / 235, 768]]) + '"/>'; // Curie (A2)
      o += '<path class="ln dash" d="' + path([[0.8, 723], [0.8, BOT]]) + '"/>';
      o += '<path class="ln dash" d="' + path([[2.06, 1147], [2.06, BOT]]) + '"/>';
      o += '<path class="ln dash" d="' + path([[4.3, 1147], [4.3, BOT]]) + '"/>';
      // perlit és ledeburit mint vonal-mező
      o += '<path class="ln" style="stroke:' + COL.p + ';stroke-width:3.5" d="' + path([[0.8, 723], [0.8, BOT]]) + '"/>';
      o += '<path class="ln" style="stroke:' + COL.le + ';stroke-width:3.5" d="' + path([[4.3, 1147], [4.3, BOT]]) + '"/>';
      // mezőfeliratok
      var L = LABELS[S.view], narrow = S.view === 'full' && G.pw < 520;
      Object.keys(L).forEach(function (id) {
        o += '<text class="rl" x="' + G.x(L[id][0]).toFixed(1) + '" y="' + G.y(L[id][1]).toFixed(1) + '" text-anchor="middle">' + esc(narrow ? SHORT[id] : R[id].s) + '</text>';
      });
      // vonalnevek
      if (S.view === 'steel' || S.view === 'steelw' || S.view === 'forge') {
        o += '<text class="lt" x="' + G.x(0.44) + '" y="' + (G.y(a3(0.44)) - 6) + '">A3 (GS)</text>';
        var cm = S.view === 'steelw' ? 1.12 : 1.36; o += '<text class="lt" x="' + G.x(cm) + '" y="' + (G.y(acm(cm)) - 6) + '" text-anchor="end">Acm (SE)</text>';
        o += '<text class="lt" x="' + G.x(S.view === 'steelw' ? 1.17 : 1.95) + '" y="' + (G.y(723) - 6) + '" text-anchor="end">A1 (PSK) 723 °C</text>';
      }
      o += '</g>';
      // nevezetes pontok (a vágáson kívül, hogy a szélen lévő felirat is látsszon; az O csak széles ábrán)
      PTS.forEach(function (p) {
        if (p[0] === 'O' && G.pw <= 420) return;
        var x = G.x(p[1]), y = G.y(p[2]);
        if (x < G.m.l - 1 || x > G.m.l + G.pw + 1 || y < G.m.t - 1 || y > G.m.t + G.ph + 1) return;
        o += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3" style="fill:var(--ink)"/>';
        var dx = p[1] > CM - 0.1 ? -8 : 6, anchor = p[1] > CM - 0.1 ? 'end' : 'start';
        o += '<text class="pt" x="' + (x + dx).toFixed(1) + '" y="' + Math.max(12, y - 6).toFixed(1) + '" text-anchor="' + anchor + '">' + p[0] + '</text>';
      });
      o += '<rect class="ax" x="' + G.m.l + '" y="' + G.m.t + '" width="' + G.pw + '" height="' + G.ph + '" fill="none"/>';
      o += '<g data-fec="dyn"></g>';
      svg.innerHTML = o;
    }

    // Kvízkérdés közben a mező nem látszik (a válasz után már igen)
    function asking() { return !!(S.quiz && !S.quiz.answered); }

    /* ---- dinamikus réteg: jelölő, kötővonal ---- */
    function drawDynamic() {
      var dyn = svg.querySelector('[data-fec="dyn"]');
      if (!dyn) return;
      var id = classify(S.c, S.t);
      svg.querySelectorAll('.rg').forEach(function (r) { r.classList.toggle('on', !asking() && r.getAttribute('data-rg') === id); });
      var x = G.x(S.c), y = G.y(S.t), o = '';
      if (!asking()) {
        o += '<line class="ch" x1="' + G.m.l + '" x2="' + x + '" y1="' + y + '" y2="' + y + '"/>';
        o += '<line class="ch" x1="' + x + '" x2="' + x + '" y1="' + y + '" y2="' + (G.m.t + G.ph) + '"/>';
        var pr = parts(id, S.c, S.t);
        if (pr.tie) {
          var x0 = G.x(pr.tie[0]), x1 = G.x(pr.tie[1]);
          o += '<line class="tie" x1="' + x0 + '" x2="' + x1 + '" y1="' + y + '" y2="' + y + '"/>';
          o += '<circle class="tied" cx="' + x0 + '" cy="' + y + '" r="4"/><circle class="tied" cx="' + x1 + '" cy="' + y + '" r="4"/>';
          // Feliratok csak elég hosszú kötővonalnál (rövidnél a lenti kártya mutatja az összetételeket)
          if (Math.abs(x1 - x0) > 70) {
            var l0 = K[pr.list[0].k].s + ' ' + fmt(pr.tie[0], 2) + '%', l1 = K[pr.list[1].k].s + ' ' + fmt(pr.tie[1], 2) + '%';
            o += '<text class="tl" x="' + x0 + '" y="' + (y - 9) + '" text-anchor="' + (x0 < G.m.l + 30 ? 'start' : 'middle') + '">' + esc(l0) + '</text>';
            o += '<text class="tl" x="' + Math.min(x1, G.m.l + G.pw - 4) + '" y="' + (y + 18) + '" text-anchor="' + (x1 > G.m.l + G.pw - 40 ? 'end' : 'middle') + '">' + esc(l1) + '</text>';
          }
        }
        // értékjelzők a tengelyeken
        var tb = Math.round(S.t) + ' °C', cb = fmt(S.c, 2) + '%';
        o += '<g class="badge"><rect x="0" y="' + (y - 9) + '" width="' + (G.m.l - 2) + '" height="18" rx="4"/><text x="' + (G.m.l / 2 - 1) + '" y="' + (y + 3.5) + '" text-anchor="middle">' + tb + '</text></g>';
        o += '<g class="badge"><rect x="' + (x - 26) + '" y="' + (G.m.t + G.ph + 3) + '" width="52" height="18" rx="4"/><text x="' + x + '" y="' + (G.m.t + G.ph + 15.5) + '" text-anchor="middle">' + cb + '</text></g>';
        o += '<circle class="mk" cx="' + x + '" cy="' + y + '" r="7"/>';
      } else {
        o += '<circle class="mk" cx="' + x + '" cy="' + y + '" r="11"/><text class="q" x="' + x + '" y="' + (y + 4.5) + '" text-anchor="middle">?</text>';
      }
      dyn.innerHTML = o;
    }

    /* ---- olvasat ---- */
    function drawReadout() {
      var box = q('read');
      if (asking()) { box.hidden = true; return; }
      box.hidden = false;
      var id = classify(S.c, S.t), pr = parts(id, S.c, S.t), rg = R[id];
      var h = '<span class="fec-coord">' + fmt(S.c, 2) + '% C · ' + Math.round(S.t) + ' °C</span>' +
        '<h4 class="fec-title">' + esc(rg.t) + '</h4>';
      if (pr.list.length > 1) {
        var pc = percents(pr.list);
        pr.list.forEach(function (it, i) {
          var k = K[it.k];
          h += '<div class="fec-bar"><span class="fec-bar-lab"><i style="background:' + k.col + '"></i>' + esc(k.n) +
            (it.comp != null ? '<em>' + fmt(it.comp, 2) + '% C</em>' : '') + '</span><b>' + pc[i] + '%</b>' +
            '<span class="fec-track"><span style="width:' + (it.f * 100).toFixed(1) + '%;background:' + k.col + '"></span></span></div>';
        });
        h += '<p class="fec-note">' + (pr.tie
          ? 'Fázisarány az emelőszabállyal: a vízszintes kötővonal két végén lévő összetételekből (az ábrán fekete vonal).'
          : 'Szövetelem-arány az emelőszabállyal (egyensúlyi, lassú hűlésnél).') + '</p>';
      }
      h += '<p class="fec-hint"><b>' + esc(hintDef[0]) + ': </b>' + esc(hintDef[1](id, S.c, S.t)) + '</p>';
      h += '<ul class="fec-defs">' + rg.k.map(function (k) { return '<li><b>' + esc(K[k].n) + ':</b> ' + esc(K[k].d) + '</li>'; }).join('') + '</ul>';
      box.innerHTML = h;
    }

    function drawProc() {
      var box = q('proc'), p = PROC[S.proc];
      root.querySelectorAll('.fec-chip').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-proc') === S.proc)); });
      if (S.proc === 'none') { box.hidden = true; return; }
      box.hidden = false;
      box.innerHTML = '<h4>' + esc(p.title) + '</h4><p>' + esc(p.text) + '</p>' +
        '<button type="button" class="fec-btn" data-fec="go">Mutasd az ábrán</button>';
    }

    function syncInputs() {
      var V = VIEWS[S.view];
      inC.min = V.c0; inC.max = V.c1; inC.step = 0.01; inC.value = S.c;
      inT.min = Math.max(20, V.t0); inT.max = V.t1; inT.step = 1; inT.value = Math.round(S.t);
      q('co').textContent = fmt(S.c, 2) + ' %';
      q('to').textContent = Math.round(S.t) + ' °C';
      root.querySelectorAll('.fec-seg button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-view') === S.view)); });
    }

    function update() { drawDynamic(); drawReadout(); syncInputs(); }
    function redraw() { drawStatic(); drawProc(); update(); }

    function setPoint(c, t, snap) {
      var V = VIEWS[S.view];
      c = clamp(c, V.c0, V.c1);
      t = clamp(t, Math.max(20, V.t0), V.t1);
      if (snap) [0.8, 2.06, 4.3].forEach(function (s) { if (Math.abs(c - s) < V.snap) c = s; });
      S.c = Math.round(c * 100) / 100;
      S.t = t;
      update();
    }

    /* ---- animációk ---- */
    function stopAnim() { if (S.anim) cancelAnimationFrame(S.anim); S.anim = 0; }
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    function animateTo(c, t, ms, done) {
      stopAnim();
      if (reduce) { setPoint(c, t); if (done) done(); return; }
      var c0 = S.c, t0 = S.t, st = performance.now();
      function step(now) {
        var k = Math.min(1, (now - st) / ms), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        setPoint(c0 + (c - c0) * e, t0 + (t - t0) * e);
        if (k < 1) S.anim = requestAnimationFrame(step); else { S.anim = 0; if (done) done(); }
      }
      S.anim = requestAnimationFrame(step);
    }

    /* ---- lassú hűlés ---- */
    function coolEvents(c) {
      var ev = [];
      if (c < 4.3 - EUT) ev.push([liq(c), 'Megindul a kristályosodás: az olvadékból primer ausztenit válik ki (likvidusz, AC vonal).']);
      else if (c > 4.3 + EUT) ev.push([liq(c), 'Az olvadékból primer cementit kezd kiválni (CD vonal).']);
      if (c <= 2.06) ev.push([sol(c), 'Teljesen megdermed: csak ausztenit marad (szolidusz, AE vonal).']);
      else ev.push([1147, 'Eutektikus átalakulás (ECF, 1147 °C): a maradék 4,3% C-os olvadék ledeburitté (ausztenit + cementit) dermed.']);
      if (c > 0.025 && c < 0.8 - EUD) ev.push([a3(c), 'Ferrit kezd kiválni az ausztenitből (GS vonal, A3); a maradék ausztenit C-tartalma nő a GS mentén.']);
      if (c <= 0.025) {
        ev.push([a3(c), 'Ferrit kezd kiválni az ausztenitből (GS vonal).']);
        ev.push([lerp(0, 911, 0.025, 723, c), 'Teljesen ferrites lesz (GP vonal).']);
        if (c > 0.006) ev.push([lerp(0.025, 723, 0.006, 20, c), 'Tercier cementit válik ki a ferritből (PQ vonal).']);
      }
      if (c > 0.8 + EUD && c <= 2.06) ev.push([acm(c), 'Szekunder cementit válik ki a szemcsehatárokon (SE vonal, Acm); az ausztenit C-tartalma csökken az SE mentén.']);
      if (c > 2.06 && c < CM) ev.push([1146, 'Az ausztenitből (a ledeburitéból is) szekunder cementit válik ki, C-tartalma 0,8% felé csökken.', '1147–723 °C']);
      if (c > 0.025) ev.push([723, 'Eutektoidos átalakulás (PSK, 723 °C): a 0,8% C-os ausztenit perlitté (ferrit + cementit lemezek) alakul.']);
      var id = classify(c, 20), pr = parts(id, c, 20), pc = percents(pr.list);
      ev.push([20, 'Szobahőmérsékleten: ' + R[id].t.toLowerCase() + (pr.list.length > 1 ? ' (' + pr.list.map(function (it, i) { return K[it.k].n + ' ' + pc[i] + '%'; }).join(', ') + ')' : '') + '.']);
      return ev.sort(function (a, b) { return b[0] - a[0]; });
    }

    function playCooling() {
      stopAnim();
      if (S.quiz) { S.quiz = null; drawQuiz(); }
      var V = VIEWS[S.view], c = S.c, ev = coolEvents(c);
      var box = q('coolbox'), list = q('coollist');
      box.hidden = false;
      list.innerHTML = ev.map(function (e) { return '<li><b>' + (e[2] || Math.round(e[0]) + ' °C') + '</b>' + esc(e[1]) + '</li>'; }).join('');
      var items = list.querySelectorAll('li');
      var tStart = V.t1, tEnd = Math.max(20, V.t0), ms = reduce ? 0 : 6500, st = performance.now();
      function mark(t) {
        ev.forEach(function (e, i) {
          var passed = t <= e[0] + 0.5;
          items[i].classList.toggle('done', passed);
          items[i].classList.toggle('now', passed && (i === ev.length - 1 || t > ev[i + 1][0] + 0.5));
        });
      }
      function step(now) {
        var k = ms ? Math.min(1, (now - st) / ms) : 1;
        var t = tStart + (tEnd - tStart) * k;
        setPoint(c, t);
        mark(k === 1 ? 20 : t);
        if (k < 1) S.anim = requestAnimationFrame(step); else S.anim = 0;
      }
      S.anim = requestAnimationFrame(step);
    }

    /* ---- kvíz ---- */
    var QUIZ_POOL = { forge: ['g', 'ga', 'gc', 'ap', 'pc', 'Lg'], steel: ['g', 'ga', 'gc', 'ap', 'pc', 'Lg'], steelw: ['g', 'ga', 'gc', 'ap', 'pc'], full: ['L', 'Lg', 'Lc', 'g', 'ga', 'gc', 'glc', 'cle', 'ap', 'pc', 'plc', 'cle2'] };
    function newQuestion() {
      var V = VIEWS[S.view], pool = QUIZ_POOL[S.view], c, t, id, tries = 0;
      do {
        c = V.c0 + Math.random() * (V.c1 - V.c0);
        t = V.t0 + 20 + Math.random() * (V.t1 - V.t0 - 40);
        id = classify(c, t);
        var dc = (V.c1 - V.c0) * 0.035, dt = (V.t1 - V.t0) * 0.035;
        var stable = [[dc, 0], [-dc, 0], [0, dt], [0, -dt]].every(function (d) { return classify(c + d[0], t + d[1]) === id; });
        tries++;
      } while ((!stable || pool.indexOf(id) < 0) && tries < 200);
      var opts = [id];
      var others = pool.filter(function (x) { return x !== id && R[x].t !== R[id].t; });
      while (opts.length < 4 && others.length) opts.push(others.splice(Math.floor(Math.random() * others.length), 1)[0]);
      opts.sort(function () { return Math.random() - 0.5; });
      S.quiz = { id: id, opts: opts, answered: false };
      stopAnim();
      q('coolbox').hidden = true;
      setPoint(c, t);
      drawQuiz();
    }
    function drawQuiz(msg) {
      var body = q('quizbody');
      if (!S.quiz) {
        body.innerHTML = '<p class="fec-qmsg">A jelölő helyén kérdőjel lesz — válaszd ki a mezőt. Az „Acél-rész” és a „Teljes ábra” nézetben is működik.</p>' +
          '<button type="button" class="fec-btn" data-fec="qnew">Kezdjük</button>';
        return;
      }
      body.innerHTML = '<p class="fec-qmsg">' + (msg || 'Melyik mezőben van a „?” jelű pont?') + '</p>' +
        '<div class="fec-opts">' + S.quiz.opts.map(function (id) {
          var cls = S.quiz.answered ? (id === S.quiz.id ? ' ok' : (id === S.quiz.pick ? ' no' : '')) : '';
          return '<button type="button" class="fec-opt' + cls + '" data-opt="' + id + '"' + (S.quiz.answered ? ' disabled' : '') + '>' + esc(R[id].t) + '</button>';
        }).join('') + '</div>' +
        '<span class="fec-score">Eredmény: ' + S.score[0] + ' / ' + S.score[1] + '</span> ' +
        (S.quiz.answered ? '<button type="button" class="fec-btn" data-fec="qnew" style="margin-left:8px">Következő</button>' : '');
    }
    function answer(id) {
      if (!S.quiz || S.quiz.answered) return;
      S.quiz.answered = true;
      S.quiz.pick = id;
      S.score[1]++;
      var ok = id === S.quiz.id;
      if (ok) S.score[0]++;
      var msg = ok ? 'Helyes! ' : 'Nem egészen — ez a(z) „' + R[S.quiz.id].t + '” mező. ';
      msg += fmt(S.c, 2) + '% C, ' + Math.round(S.t) + ' °C.';
      update(); // a helyes mező kiemelése és az olvasat
      drawQuiz(msg);
    }
    function endQuiz() { if (S.quiz) { S.quiz = null; update(); drawQuiz(); } }

    /* ---- események ---- */
    function fromEvent(e) {
      var r = svg.getBoundingClientRect();
      var sx = G.w / r.width, sy = G.h / r.height;
      return [G.cx((e.clientX - r.left) * sx), G.ty((e.clientY - r.top) * sy)];
    }
    var dragging = false;
    svg.addEventListener('pointerdown', function (e) {
      if (asking()) return;
      endQuiz(); stopAnim();
      dragging = true;
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* régi böngésző */ }
      var p = fromEvent(e); setPoint(p[0], p[1], true);
      e.preventDefault();
    });
    svg.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var p = fromEvent(e); setPoint(p[0], p[1], true);
    });
    ['pointerup', 'pointercancel'].forEach(function (ev) { svg.addEventListener(ev, function () { dragging = false; }); });

    inC.addEventListener('input', function () { endQuiz(); stopAnim(); setPoint(parseFloat(inC.value), S.t); });
    inT.addEventListener('input', function () { endQuiz(); stopAnim(); setPoint(S.c, parseFloat(inT.value)); });

    root.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b || !root.contains(b)) return;
      if (b.hasAttribute('data-view')) {
        stopAnim(); S.view = b.getAttribute('data-view'); save();
        if (S.quiz) { S.quiz = null; }
        redraw(); setPoint(S.c, S.t); drawQuiz();
      } else if (b.hasAttribute('data-proc')) {
        S.proc = b.getAttribute('data-proc'); save();
        endQuiz(); redraw();
      } else if (b.hasAttribute('data-opt')) {
        answer(b.getAttribute('data-opt'));
      } else {
        var a = b.getAttribute('data-fec');
        if (a === 'cool') playCooling();
        else if (a === 'qnew') newQuestion();
        else if (a === 'go') {
          var p = PROC[S.proc], g = p.go(S);
          endQuiz();
          if (S.view === 'full' && g[0] < 2.2) { S.view = set.sv || 'steel'; save(); redraw(); }
          animateTo(g[0], g[1], 700, p.anim ? function () { setTimeout(function () { animateTo(p.anim[0], p.anim[1], 1600); }, 350); } : null);
        }
      }
    });
    q('quiz').addEventListener('toggle', function () { if (!q('quiz').open) { endQuiz(); drawQuiz(); } });

    var lastW = 0;
    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        var w = plot.clientWidth;
        if (w && Math.abs(w - lastW) > 2) { lastW = w; drawStatic(); drawDynamic(); }
      }).observe(plot);
    }

    redraw();
    drawQuiz();
  }

  /* ------------------------------------------------------------------ */
  /* Bejelentkezés az AVIX kerethez                                     */
  /* ------------------------------------------------------------------ */

  function injectCSS() {
    if (document.getElementById('fec-css')) return;
    var st = document.createElement('style');
    st.id = 'fec-css';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  window.AVIX.def('fec', {
    title: 'Vas–szén állapotábra',
    sub: 'Koppints az ábrára, válassz eljárást, játszd le a lassú hűlést',
    mount: function (el, opt) {
      injectCSS();
      var set = SETS[opt.set] ? opt.set : 'a1';
      el.classList.add('fec');
      el.innerHTML = sectionHTML(SETS[set]);
      mountInto(el, set);
    },
  });
})();

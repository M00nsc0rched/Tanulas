/*
 * Gépész záróvizsga tételtár — interaktív ábrák a B/01, B/02 és B/06–B/08 tételekhez
 * (gyártórendszerek, kapacitás és szűk keresztmetszet, FMS, termelésirányítás, CIM és lean).
 * Forrás: Dudás Illés, Gyártási folyamatok és rendszerek (Gyártórendszerek) jegyzet: 2., 4., 5. és 6. fejezet.
 * Az ábrák saját rajzok; a számpéldák szemléltető adatokkal, a jegyzet összefüggéseivel számolnak.
 */
(function () {
  'use strict';
  if (!window.AVIX) return;
  var U = AVIX.U, fmt = U.fmt, esc = U.esc;

  // statikus elrendezésű SVG; minw: ennél keskenyebb helyen vízszintesen görgethető (a felirat ne legyen olvashatatlanul apró)
  function svgBox(vw, vh, inner, label, maxw, minw) {
    var sty = (maxw ? 'max-width:' + maxw + 'px;margin:0 auto;' : '') + (minw ? 'min-width:' + minw + 'px;' : '');
    return '<svg class="ix-svg" viewBox="0 0 ' + vw + ' ' + vh + '"' + (sty ? ' style="' + sty + '"' : '') + ' role="img" aria-label="' + esc(label) + '">' + inner + '</svg>';
  }
  function scrollWrap(el) { var w = U.h('div', 'ix-plot'); w.style.overflowX = 'auto'; w.style.webkitOverflowScrolling = 'touch'; el.appendChild(w); return w; }
  function arrowDefs(id, col) { return '<marker id="' + id + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" style="fill:' + col + '"/></marker>'; }
  function legend(items) { return '<div class="ix-legend">' + items.map(function (it) { return '<span><i style="background:' + it[1] + '"></i>' + it[0] + '</span>'; }).join('') + '</div>'; }

  /* ================================================================== */
  /* B/01, B/06 — gyártási rendszerek fajtái (2.2. ábra)                  */
  /* ================================================================== */
  var GF_PARTS = { T: { n: 'Tengely', c: 'var(--ix-2)', r: ['E', 'M', 'K'] }, D: { n: 'Tárcsa', c: 'var(--ix-1)', r: ['E', 'F', 'K'] }, H: { n: 'Ház', c: 'var(--ix-3)', r: ['M', 'F'] } };
  var GF_MN = { E: 'eszterga', M: 'marógép', F: 'fúrógép', K: 'köszörű' };
  var GF = {
    muhely: {
      n: 'Műhelyrendszerű', R: [6, 30],
      halls: [['Esztergaműhely', 12, 38, 26, 18], ['Maróműhely', 42, 38, 26, 18], ['Fúróműhely', 72, 38, 26, 18], ['Köszörűműhely', 72, 6, 26, 18]],
      m: { E1: [18, 47], E2: [32, 47], M1: [48, 47], M2: [62, 47], F1: [78, 47], F2: [92, 47], K1: [78, 15], K2: [92, 15] },
      path: { T: ['E1', 'M1', 'K1'], D: ['E2', 'F1', 'K2'], H: ['M2', 'F2'] },
      txt: 'A gépek fajtánként műhelyekbe sorolódnak. Bármilyen alkatrész megmunkálható, egy gép kiesésekor a munka áttehető a műhely másik gépére, és egyszerű a műhelyirányítás — de a darab műhelyről műhelyre vándorol: hosszú anyagút, hosszú átfutás. Egyedi és kissorozatgyártás.',
      tbl: ['nagy', 'hosszú', 'nagy (bármilyen alkatrész)', 'egyedi, kissorozat'],
    },
    csoport: {
      n: 'Csoportrendszerű', R: [6, 30],
      halls: [['Forgástestsor (tengely, tárcsa)', 14, 38, 64, 18], ['Házsor', 30, 6, 34, 18]],
      m: { E: [22, 47], M: [36, 47], F: [50, 47], K: [64, 47], M2: [38, 15], F2: [54, 15] },
      path: { T: ['E', 'M', 'K'], D: ['E', 'F', 'K'], H: ['M2', 'F2'] },
      txt: 'Hasonló technológiájú alkatrészcsoportonként egy-egy sor (cella): a darab a csoporton belül vándorol, rövid az anyagút és az átfutás. A csoport alkatrészei között könnyű az átállás, speciális szerszám és készülék is gazdaságos (nő a relatív tömegszerűség). A jegyzet szerint ma a legprogresszívebb forma — ilyenek az FMS-ek is.',
      tbl: ['kicsi', 'rövid', 'közepes (a csoporton belül)', 'közép- és kissorozat'],
    },
    folyam: {
      n: 'Folyamrendszerű', R: [6, 30],
      halls: [['Tengelygyártó sor', 14, 22, 70, 18]],
      m: { E: [24, 31], M: [44, 31], K: [64, 31] },
      path: { T: ['E', 'M', 'K'] },
      txt: 'Egy konkrét gyártmány technológiai sorrendje szerint telepített gépek (célgépek, speciális készülékek). Legrövidebb az anyagút, de merev: más alkatrészre — még a csoporton belül is — nehezen állítható át. Tartós tömeggyártásra gazdaságos; ma rugalmasabbá, a csoportszerűhöz közelítővé teszik.',
      tbl: ['legkisebb', 'legrövidebb', 'merev (egy gyártmány)', 'nagysorozat, tömeggyártás'],
    },
  };
  function gfLen(L, k) {
    var r = GF[L], p = r.path[k]; if (!p) return null;
    var pts = [r.R].concat(p.map(function (m) { return r.m[m]; })).concat([r.R]), d = 0;
    for (var i = 1; i < pts.length; i++) d += Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]);
    return d;
  }
  AVIX.def('gyrfajta', {
    title: 'Gyártási rendszerek fajtái — az anyag útja',
    sub: 'Műhely-, csoport- és folyamrendszerű géptelepítés ugyanazzal a három alkatrésszel',
    mount: function (el) {
      var st = U.store('gyrfajta', { L: 'muhely' }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Három alkatrész (tengely, tárcsa, ház) útja a raktárból a gépeken át vissza. A gépek elrendezése dönti el az <b>anyagutat</b>, az <b>átfutási időt</b> és a <b>rugalmasságot</b> (a jegyzet 2.1. fejezete). Váltogasd az elrendezést.</p>';
      var row = U.h('div', 'ix-row'); el.appendChild(row);
      U.seg(row, [['muhely', 'Műhely'], ['csoport', 'Csoport'], ['folyam', 'Folyam']], S.L, function (v) { S.L = v; st.set(S); draw(); }, 'Elrendezés');
      var wrap = scrollWrap(el);
      var leg = U.h('div', 'ix-legend'); el.appendChild(leg);
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      leg.innerHTML = Object.keys(GF_PARTS).map(function (k) { return '<span><i style="background:' + GF_PARTS[k].c + '"></i>' + GF_PARTS[k].n + ' (' + GF_PARTS[k].r.join(' → ') + ')</span>'; }).join('') + '<span>E eszterga · M marógép · F fúrógép · K köszörű</span>';
      function draw() {
        var r = GF[S.L], sc = 6, o = '<defs>' + Object.keys(GF_PARTS).map(function (k) { return arrowDefs('gf' + k, GF_PARTS[k].c); }).join('') + '</defs>';
        function X(v) { return (v * sc + 10).toFixed(1); }
        function Y(v) { return (360 - v * sc - 10).toFixed(1); }
        o += '<rect x="10" y="10" width="600" height="340" rx="10" style="fill:var(--surface);stroke:var(--rule-2)"/>';
        r.halls.forEach(function (hh) { o += '<rect x="' + X(hh[1]) + '" y="' + Y(hh[2] + hh[4]) + '" width="' + (hh[3] * sc) + '" height="' + (hh[4] * sc) + '" rx="8" style="fill:var(--surface-2);stroke:var(--rule-2);stroke-dasharray:5 4"/><text class="sm" x="' + (+X(hh[1]) + 8) + '" y="' + (+Y(hh[2] + hh[4]) + 15) + '">' + esc(hh[0]) + '</text>'; });
        var keys = Object.keys(GF_PARTS);
        keys.forEach(function (k, ki) {
          var p = r.path[k]; if (!p) return;
          var off = (ki - 1) * 6, pts = [r.R].concat(p.map(function (m) { return r.m[m]; })).concat([r.R]), q = [];
          for (var i = 0; i < pts.length; i++) {
            var x = +X(pts[i][0]) + off, y = +Y(pts[i][1]) + off;
            if (i) { var px = +X(pts[i - 1][0]) + off, py = +Y(pts[i - 1][1]) + off; q.push([(px + x) / 2, (py + y) / 2]); }
            q.push([x, y]);
          }
          o += '<path d="' + U.path(q) + '" style="fill:none;stroke:' + GF_PARTS[k].c + ';stroke-width:2.4;stroke-linejoin:round;opacity:.85" marker-mid="url(#gf' + k + ')"/>';
        });
        o += '<rect x="' + (+X(r.R[0]) - 24) + '" y="' + (+Y(r.R[1]) - 20) + '" width="48" height="40" rx="6" style="fill:var(--surface-2);stroke:var(--ink-2)"/><text class="lb" x="' + X(r.R[0]) + '" y="' + (+Y(r.R[1]) + 4) + '" text-anchor="middle">Raktár</text>';
        Object.keys(r.m).forEach(function (id) {
          var m = r.m[id], t = id.replace(/\d/g, '');
          o += '<rect x="' + (+X(m[0]) - 17) + '" y="' + (+Y(m[1]) - 17) + '" width="34" height="34" rx="6" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.5"/><text class="lb" x="' + X(m[0]) + '" y="' + (+Y(m[1]) + 5) + '" text-anchor="middle">' + t + '</text>';
        });
        if (S.L === 'folyam') o += '<text class="sm" x="' + X(50) + '" y="' + Y(4) + '" text-anchor="middle" style="fill:var(--ix-5);font-weight:700">A tárcsa és a ház ezen a soron nem gyártható — külön sor kellene</text>';
        wrap.innerHTML = svgBox(620, 360, o, 'Gépelrendezés és anyagút: ' + r.n, 640, 500);
        var tot = 0, rows = keys.map(function (k) { var L = gfLen(S.L, k); if (L != null) tot += L; return [GF_PARTS[k].n, L == null ? '—' : fmt(L, 0) + ' m', L == null ? 'nem gyártható' : '']; });
        out.innerHTML = '<h4><small>' + r.n + ' gyártás · derékszögű folyosókon mérve</small>Anyagút összesen: ' + fmt(tot, 0) + ' m</h4><p>' + r.txt + '</p>' + U.kv(rows) +
          '<table class="ix-tbl"><thead><tr><th></th><th>Anyagút</th><th>Átfutás</th><th>Rugalmasság</th><th>Tömegszerűség</th></tr></thead><tbody>' +
          Object.keys(GF).map(function (L) { return '<tr' + (L === S.L ? ' class="on"' : '') + '><td><b>' + GF[L].n + '</b></td><td>' + GF[L].tbl.join('</td><td>') + '</td></tr>'; }).join('') + '</tbody></table>';
      }
      draw();
    },
  });

  /* ================================================================== */
  /* B/01 — irányítási hierarchia és funkcionális építőelemek (2.3, 2.4)  */
  /* ================================================================== */
  var GH_LEV = [
    ['Gyártórendszer-irányítás, -vezérlés, felügyelet', 'A teljes rendszer összehangolása: ütemezés, programok és készletek kezelése, állapotfigyelés. Felette további számítógépes szintek működhetnek (üzem, műhely, vállalat).', 'rendszervezérlő számítógép'],
    ['Gyártóberendezés-csoport, cella vezérlése', 'Több gép, robot, paletta- és mérőhely együttműködése; a cella munkadarab- és szerszámáramlása.', 'cellavezérlő'],
    ['Gyártóberendezés vezérlése', 'Egy gép mozgásai és segédfunkciói.', 'NC, CNC, merev programozás (pl. vezértárcsa)'],
    ['Folyamatvezérlés', 'A gyártási folyamat közvetlen irányítása, szabályozása — pl. a forgácsolás adaptív szabályozása (erő, nyomaték, rezgés, hő, kopás alapján).', 'Adaptive Control (AC)'],
  ];
  var GH_LAB = ['Gyártó-|berendezések', 'Cellák', 'Munkadarab-|kezelés', 'Gyártóeszköz-|kezelés', 'Minőség-|ellenőrzés', 'Segédanyag-|ellátás', 'Hulladék-|kezelés', 'Mosás,|tisztítás', 'További fő-|vagy segéd-|folyamatok'];
  var GH_BLK = [
    ['Gyártóberendezések', 'A főfolyamat egységei: szerszámgépek, alakító gépek, hőkezelő munkahelyek; kézi, merev programozású vagy NC/CNC vezérlésűek, saját irányítási rendszerrel.'],
    ['Cellák', 'A gyártóberendezések adott technológiai célú csoportjai.'],
    ['Munkadarab-kezelés', 'Munkadarab előkészítése (pl. előrajzolás), szerelése palettára, tárolása, szállítása és cseréje a gépen.'],
    ['Gyártóeszköz-kezelés', 'Szerszám és készülék előkészítése, összeszerelése, bemérése, tárolása, szállítása és cseréje.'],
    ['Minőségellenőrzés', 'Elő-, műveletközi és végellenőrzés, minőségbiztosítás előre megtervezett stratégia (pl. SPC) szerint.'],
    ['Segédanyag-ellátás', 'Hűtő-kenő, bevonatoló, felületvédő anyagok kezelése, szállítása, tárolása.'],
    ['Hulladékkezelés', 'A forgács összegyűjtése, eltávolítása, a munkatér tisztán tartása.'],
    ['Mosás, tisztítás', 'Az elkészült alkatrészek mosása, tisztítása.'],
    ['További fő- vagy segédfolyamatok', 'Hőkezelés, felületkikészítés a rendszeren belül, konzerválás, csomagolás.'],
  ];
  var GH_Q = [
    { q: 'A forgácsolóerő alapján automatikusan csökkenti az előtolást. Melyik hierarchiaszint?', opts: ['Folyamatvezérlés (AC)', 'Gyártóberendezés vezérlése', 'Cellavezérlés', 'Gyártórendszer-irányítás'], a: 0, why: 'Az adaptív szabályozás a folyamatot közvetlenül irányítja — ez a legalsó szint.' },
    { q: 'Egy robot, két megmunkálóközpont és egy palettatár munkáját hangolja össze.', opts: ['Cellavezérlő', 'CNC', 'Adaptív szabályozás', 'PPS'], a: 0, why: 'A gyártóberendezések csoportjának (cella) vezérlése.' },
    { q: 'Vezértárcsa vezérli a revolverautomatát.', opts: ['Gyártóberendezés vezérlése (merev programozás)', 'Folyamatvezérlés', 'Cellavezérlés', 'Rendszervezérlés'], a: 0, why: 'A merev programozású automata is a berendezésszintű vezérlés egyik formája.' },
    { q: 'A szerszám bemérése és tárolóhelyre helyezése melyik funkcionális építőelem?', opts: ['Gyártóeszköz-kezelés', 'Munkadarab-kezelés', 'Minőségellenőrzés', 'Cellák'], a: 0, why: 'A szerszám összeszerelése, bemérése, minősítése, tárolása a gyártóeszköz-ellátás része.' },
    { q: 'A nyersdarab felszerelése és rögzítése a palettán:', opts: ['Munkadarab-kezelés', 'Gyártóeszköz-kezelés', 'Gyártóberendezés', 'Segédanyag-ellátás'], a: 0, why: 'A munkadarab előkészítése, szerelése, tárolása, szállítása és cseréje.' },
    { q: 'A forgács eltávolítása a munkatérből:', opts: ['Hulladékkezelés', 'Mosás, tisztítás', 'Segédanyag-ellátás', 'Minőségellenőrzés'], a: 0, why: 'A gyártási hulladék összegyűjtése és eltávolítása külön segédfolyamati elem.' },
    { q: 'A gyártórendszer fő egységei (2.1. ábra):', opts: ['Főfolyamat gyártóberendezései + segédfolyamat berendezései + irányítás, felügyelet', 'Csak a CNC gépek', 'Gépek + raktár', 'CAD + CAM + PPS'], a: 0, why: 'A gyártórendszer nem gépek halmaza: fő- és segédfolyamat, valamint irányítás/felügyelet együtt.' },
  ];
  AVIX.def('gyrhier', {
    title: 'Belső hierarchia és funkcionális építőelemek',
    sub: 'Folyamat → berendezés → cella → gyártórendszer; a fő- és segédfolyamat elemei (2.3–2.4. ábra)',
    mount: function (el) {
      var sel = { t: 'l', i: 0 };
      el.innerHTML = '<p class="ix-lead">A gyártórendszer funkcionális építőelemei a hierarchikus irányítás és felügyelet alatt működnek. <b>Koppints egy szintre vagy építőelemre</b>; a felügyelet eredménye alapján a beavatkozás is többszintű lehet (gép, cella, rendszer).</p>';
      var wrap = U.h('div', 'ix-plot'); el.appendChild(wrap);
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      U.quiz(el, GH_Q, { title: 'Gyakorlás: melyik szint, melyik építőelem?' });
      var lastNarrow = null;
      function draw() {
        // keskeny kijelzőn (telefon) a piramis és az építőelemek egymás alá kerülnek
        var narrow = (wrap.clientWidth || 640) < 540, W = narrow ? 336 : 640, bx = narrow ? 14 : 350, by = narrow ? 214 : 16, H = narrow ? 430 : 222, o = '';
        lastNarrow = narrow;
        GH_LEV.forEach(function (l, i) {
          var x = 20 + (3 - i) * 12, w = 300 - (3 - i) * 24, y = 16 + i * 46, on = sel.t === 'l' && sel.i === i;
          o += '<g data-t="l" data-i="' + i + '" style="cursor:pointer"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="38" rx="7" style="fill:' + (on ? 'var(--acc-soft)' : 'var(--surface)') + ';stroke:' + (on ? 'var(--acc)' : 'var(--rule-2)') + ';stroke-width:' + (on ? 2 : 1.2) + '"/><text x="' + (x + w / 2) + '" y="' + (y + 16) + '" text-anchor="middle" style="font-size:12px;font-weight:700;fill:var(--ink)">' + esc(l[0].split(',')[0]) + '</text><text class="tk" x="' + (x + w / 2) + '" y="' + (y + 30) + '" text-anchor="middle">' + esc(l[2]) + '</text></g>';
        });
        o += '<path d="M8,200 V24" style="stroke:var(--muted);stroke-width:1.4" marker-end="url(#ghA)"/><text class="tk" x="12" y="' + (narrow ? 204 : 214) + '">felfelé: tágabb hatókör</text>';
        GH_BLK.forEach(function (b, i) {
          var bw = narrow ? 100 : 92, col = i % 3, rw = Math.floor(i / 3), x = bx + col * (bw + 6), y = by + rw * 62, on = sel.t === 'b' && sel.i === i;
          o += '<g data-t="b" data-i="' + i + '" style="cursor:pointer"><rect x="' + x + '" y="' + y + '" width="' + bw + '" height="54" rx="7" style="fill:' + (on ? 'var(--acc-soft)' : (i === 0 ? 'var(--surface)' : 'var(--surface-2)')) + ';stroke:' + (on ? 'var(--acc)' : (i === 0 ? 'var(--ink)' : 'var(--rule-2)')) + ';stroke-width:' + (on || i === 0 ? 1.8 : 1.1) + '"/>';
          var lines = GH_LAB[i].split('|');
          lines.forEach(function (ln, k) { o += '<text x="' + (x + bw / 2) + '" y="' + (y + 29 + (k - (lines.length - 1) / 2) * 13) + '" text-anchor="middle" style="font-size:11px;' + (i === 0 ? 'font-weight:700;fill:var(--ink)' : '') + '">' + esc(ln) + '</text>'; });
          o += '</g>';
        });
        o += '<text class="tk" x="' + bx + '" y="' + (by + 192) + '">funkcionális építőelemek</text>';
        wrap.innerHTML = svgBox(W, H, '<defs>' + arrowDefs('ghA', 'var(--muted)') + '</defs>' + o, 'Irányítási hierarchia és funkcionális építőelemek');
        var it = sel.t === 'l' ? GH_LEV[sel.i] : GH_BLK[sel.i];
        out.innerHTML = '<h4><small>' + (sel.t === 'l' ? 'Hierarchiaszint ' + (4 - sel.i) + '/4' : 'Funkcionális építőelem') + '</small>' + esc(it[0]) + '</h4><p>' + esc(it[1]) + '</p>' + (sel.t === 'l' ? '<p class="ix-note">Eszköz: ' + esc(it[2]) + '. A felügyelet alapjelenségeit (kopás, méreteltérés, erő, nyomaték, hő, hangemisszió) döntően a gépeken figyelik.</p>' : '');
      }
      wrap.addEventListener('click', function (e) {
        var g = e.target.closest('g[data-t]'); if (!g) return;
        sel = { t: g.getAttribute('data-t'), i: +g.getAttribute('data-i') }; draw();
      });
      if (window.ResizeObserver) new ResizeObserver(function () { if (((wrap.clientWidth || 640) < 540) !== lastNarrow) draw(); }).observe(wrap);
      draw();
    },
  });

  /* ================================================================== */
  /* B/01, B/06 — FMU → FMC → FMS (2.5. ábra)                             */
  /* ================================================================== */
  var FM_EL = {
    cnc1: { n: 'CNC megmunkálóközpont 1', x: 120, y: 50, w: 90, h: 50, lv: 'u', d: 'Szerszámtárral, automatikus szerszámcserélővel — a rendszer alapeleme.' },
    pc1: { n: 'Palettacserélő', x: 120, y: 108, w: 90, h: 22, lv: 'u', d: 'Automatikus munkadarab- (paletta-) csere: a felfogás a gépidővel párhuzamosan, a gépen kívül történik.' },
    tar1: { n: 'Mdb-tároló (többpalettás)', x: 30, y: 50, w: 80, h: 50, lv: 'u', d: 'A gép saját munkadarab-tárolója; így az egység részben emberi felügyelet nélkül dolgozhat.' },
    mer1: { n: 'Mérőegység', x: 120, y: 18, w: 90, h: 24, lv: 'u', d: 'Automatizált mérés és felügyeleti funkciók a gépen.' },
    cnc2: { n: 'CNC megmunkálóközpont 2', x: 250, y: 50, w: 90, h: 50, lv: 'c', d: 'Második gép: két vagy több gép már rugalmas gyártócellát (FMC) alkot.' },
    rob: { n: 'Robotos cserélő', x: 250, y: 108, w: 90, h: 22, lv: 'c', d: 'Közös munkadarab-/palettaellátás a cella gépeihez.' },
    cv: { n: 'Cellavezérlő', x: 250, y: 146, w: 90, h: 22, lv: 'c', d: 'A cella működését irányító számítógép; minimalizálja az emberi felügyeletet.' },
    cnc3: { n: 'CNC megmunkálóközpont 3', x: 400, y: 50, w: 90, h: 50, lv: 's', d: 'Újabb cella vagy gyártóegység — az FMS két vagy több cellából/egységből áll.' },
    meg: { n: '3D CNC mérőgép', x: 520, y: 50, w: 90, h: 50, lv: 's', d: 'Műveletközi mérés, elő- és végellenőrzés — az FMS szerves része.' },
    rak: { n: 'Automatizált raktár', x: 550, y: 146, w: 74, h: 50, lv: 's', d: 'Paletták, munkadarabok, szerszámok tárolása; be- és kiadás.' },
    psz: { n: 'Palettaszerelő hely', x: 470, y: 146, w: 72, h: 50, lv: 's', d: 'Itt szerelik a munkadarabot palettára a rendszerbe lépés előtt, és itt szerelik le a megmunkálás után.' },
    agv: { n: 'Automatikus szállítórendszer', x: 0, y: 0, w: 0, h: 0, lv: 's', d: 'AGV, vezető nélküli targonca vagy számítógéppel irányított konvejor: palettát, munkadarabot és szerszámot szállít a gépek, munkahelyek és raktárak között.' },
    rv: { n: 'Rendszervezérlő', x: 370, y: 146, w: 90, h: 22, lv: 's', d: 'A teljes rendszer számítógépes irányítása; fölötte üzemi, műhely- és vállalati szintek működhetnek.' },
  };
  var FM_LV = { u: ['FMU — rugalmas gyártóegység', 'Egy NC/CNC gép (megmunkáló- vagy esztergaközpont) szerszámtárral és -cserélővel, (többpalettás) munkadarab-tárolóval, automatikus palettacserélővel, automatizált mérőegységgel és felügyeleti funkciókkal — részben emberi felügyelet nélkül dolgozik.'], c: ['FMC — rugalmas gyártócella', 'Két vagy több NC/CNC gép saját vagy közös munkadarab-tárolóval, automatikus munkadarab-/palettacserélővel, szerszámtárolással és -cserével, automatizált méréssel és folyamatfelügyelettel; a cellát cellavezérlő számítógép irányítja.'], s: ['FMS — rugalmas gyártórendszer', 'Két vagy több cella (vagy cella és gyártóegység), amelyeket automatikus szállítórendszer köt össze; része a CNC mérőgép, a palettaszerelő hely és a raktár; a rendszervezérlő számítógép irányítja. Minimális kézi beavatkozással, rövid átállással képes egy alkatrészcsalád bármely tagját megmunkálni.'] };
  AVIX.def('fmsrend', {
    title: 'Rugalmas gyártórendszer felépítése: FMU → FMC → FMS',
    sub: 'Hierarchikus építőelemek — mi tartozik a gyártóegységhez, a cellához és a rendszerhez? (2.5. ábra)',
    mount: function (el) {
      var st = U.store('fmsrend', { lv: 's' }), S = st.get(), sel = null, t0 = 0, raf = 0;
      el.innerHTML = '<p class="ix-lead">Az FMS hierarchikus építőelemekből áll. <b>Válaszd ki a szintet</b>, és koppints az elemekre. FMS-szinten a szállítórendszer (AGV) mozgatja a palettákat a gépek, a mérőgép, a palettaszerelő hely és a raktár között.</p>';
      var row = U.h('div', 'ix-row'); el.appendChild(row);
      U.seg(row, [['u', 'FMU'], ['c', 'FMC'], ['s', 'FMS']], S.lv, function (v) { S.lv = v; st.set(S); sel = null; draw(); }, 'Szint');
      var wrap = scrollWrap(el);
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var ORD = { u: 1, c: 2, s: 3 };
      var track = [[14, 138], [630, 138], [630, 208], [14, 208]], lastDraw = 0;
      function trackAt(u) {
        var L = [], tot = 0, i;
        for (i = 0; i < track.length; i++) { var a = track[i], b = track[(i + 1) % track.length], d = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]); L.push(d); tot += d; }
        var s = (u % 1) * tot;
        for (i = 0; i < L.length; i++) { if (s <= L[i]) { var A = track[i], B = track[(i + 1) % track.length], f = s / L[i]; return [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f]; } s -= L[i]; }
        return track[0];
      }
      function draw(ts) {
        var o = '', on = function (k) { return ORD[FM_EL[k].lv] <= ORD[S.lv]; };
        if (S.lv === 's') o += '<path d="' + U.path(track) + 'Z" style="fill:none;stroke:var(--ix-6);stroke-width:8;stroke-linejoin:round;opacity:.35"/><text class="tk" x="200" y="226" text-anchor="middle">automatikus szállítórendszer (AGV-pálya)</text>';
        Object.keys(FM_EL).forEach(function (k) {
          var e = FM_EL[k]; if (!e.w) return;
          var a = on(k), isSel = sel === k;
          o += '<g data-k="' + k + '" style="cursor:pointer;opacity:' + (a ? 1 : 0.28) + '"><rect x="' + e.x + '" y="' + e.y + '" width="' + e.w + '" height="' + e.h + '" rx="7" style="fill:' + (isSel ? 'var(--acc-soft)' : (e.lv === 'u' ? 'rgba(59,130,196,.13)' : e.lv === 'c' ? 'rgba(217,130,43,.13)' : 'rgba(61,139,90,.13)')) + ';stroke:' + (isSel ? 'var(--acc)' : 'var(--ink-2)') + ';stroke-width:' + (isSel ? 2 : 1.1) + '"/>';
          var words = e.n.split(' '), lines = [], cur = '';
          words.forEach(function (wd) { if ((cur + ' ' + wd).trim().length > (e.h < 30 ? 22 : 14)) { lines.push(cur.trim()); cur = wd; } else cur += ' ' + wd; });
          lines.push(cur.trim());
          lines.forEach(function (ln, i) { o += '<text x="' + (e.x + e.w / 2) + '" y="' + (e.y + e.h / 2 + 4 + (i - (lines.length - 1) / 2) * 12) + '" text-anchor="middle" style="font-size:10.5px;fill:var(--ink)">' + esc(ln) + '</text>'; });
          o += '</g>';
        });
        [['u', 20, 12, 200, 124], ['c', 16, 8, 334, 166]].forEach(function (b) { if (ORD[b[0]] <= ORD[S.lv]) o += '<rect x="' + b[1] + '" y="' + b[2] + '" width="' + b[3] + '" height="' + b[4] + '" rx="10" style="fill:none;stroke:' + (b[0] === 'u' ? 'var(--ix-2)' : 'var(--ix-1)') + ';stroke-width:1.4;stroke-dasharray:6 4"/><text class="tk" x="' + (b[1] + 6) + '" y="' + (b[2] + b[4] - 5) + '" style="fill:' + (b[0] === 'u' ? 'var(--ix-2)' : 'var(--ix-1)') + '">' + (b[0] === 'u' ? 'FMU' : 'FMC') + '</text>'; });
        if (S.lv === 's') {
          var ph = ((ts || 0) - t0) / 9000;
          [0, 0.5].forEach(function (d) { var p = trackAt(ph + d); o += '<g data-k="agv" style="cursor:pointer"><rect x="' + (p[0] - 11).toFixed(1) + '" y="' + (p[1] - 7).toFixed(1) + '" width="22" height="14" rx="3" style="fill:var(--ix-6);stroke:var(--surface);stroke-width:1.5"/></g>'; });
        }
        wrap.innerHTML = svgBox(640, 236, o, 'Rugalmas gyártórendszer vázlata', 0, 560);
        if (!sel) out.innerHTML = '<h4><small>Szint</small>' + FM_LV[S.lv][0] + '</h4><p>' + FM_LV[S.lv][1] + '</p>';
        else out.innerHTML = '<h4><small>' + FM_LV[FM_EL[sel].lv][0].split(' — ')[0] + '-szintű elem</small>' + esc(FM_EL[sel].n) + '</h4><p>' + esc(FM_EL[sel].d) + '</p>';
      }
      function loop(ts) {
        if (!t0) t0 = ts;
        if (!document.body.contains(wrap)) return;
        if (S.lv === 's' && ts - lastDraw > 60 && wrap.offsetParent) { lastDraw = ts; draw(ts); }
        raf = requestAnimationFrame(loop);
      }
      wrap.addEventListener('click', function (e) { var g = e.target.closest('g[data-k]'); if (!g) return; var k = g.getAttribute('data-k'); if (ORD[FM_EL[k].lv] > ORD[S.lv]) return; sel = k; draw(); });
      draw();
      if (!U.reduce) raf = requestAnimationFrame(loop);
    },
  });

  /* ================================================================== */
  /* B/06 — palettacserélős és robotos munkadarab-ellátás (2.7. ábra)     */
  /* ================================================================== */
  AVIX.def('paletta', {
    title: 'Munkadarab-csere: kézi, palettacserélős, robotos',
    sub: 'Gépkihasználás a felfogási és a gépi idő arányában — mikor melyik megoldás? (2.7. ábra)',
    mount: function (el) {
      var st = U.store('paletta', { m: 'pal', tg: 12, tf: 6, alak: 'sz', kg: 25 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Kézi befogásnál a gép a felfogás alatt áll. <b>Palettacserélővel</b> a következő darabot a gépidő alatt, a gépen kívül fogják fel palettára, a gép csak a cserére áll meg; <b>robotos</b> ellátásnál a robot köti össze a tárolót és a gépet. A jegyzet szerint a választás a munkadarab alakjától és tömegétől függ.</p>';
      var row = U.h('div', 'ix-row'); el.appendChild(row);
      U.seg(row, [['kezi', 'Kézi befogás'], ['pal', 'Palettacserélő'], ['rob', 'Robot']], S.m, function (v) { S.m = v; st.set(S); P.render(); }, 'Megoldás');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.42 : 0.24; }, minH: 130, maxH: 190, label: 'A gép idődiagramja' });
      var legEl = U.h('div'); el.appendChild(legEl);
      var g = U.sliders(el);
      U.slider(g, { label: 'Gépi idő t_g', min: 2, max: 40, step: 1, value: S.tg, unit: 'perc', dec: 0, onInput: function (v) { S.tg = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Felfogás t_f', min: 1, max: 30, step: 1, value: S.tf, unit: 'perc', dec: 0, onInput: function (v) { S.tf = v; st.set(S); P.render(); } });
      var r2 = U.h('div', 'ix-row'); el.appendChild(r2);
      U.seg(r2, [['sz', 'Szekrényes darab'], ['f', 'Forgástest']], S.alak, function (v) { S.alak = v; st.set(S); P.render(); }, 'Munkadarab alakja');
      var g2 = U.sliders(el);
      U.slider(g2, { label: 'Tömeg', min: 1, max: 400, step: 1, value: S.kg, unit: 'kg', dec: 0, onInput: function (v) { S.kg = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var tcs = S.m === 'pal' ? 0.5 : S.m === 'rob' ? 0.8 : 0, seq = [], t = 0, n = 5, cyc;
        // egy ciklus: gép állapotai
        if (S.m === 'kezi') { cyc = S.tf + S.tg; for (var i = 0; i < n; i++) { seq.push(['f', t, S.tf]); t += S.tf; seq.push(['g', t, S.tg]); t += S.tg; } }
        else if (S.m === 'pal') { cyc = Math.max(S.tg, S.tf) + tcs; seq.push(['f', 0, S.tf]); t = S.tf; for (var j = 0; j < n; j++) { seq.push(['c', t, tcs]); t += tcs; seq.push(['g', t, S.tg]); if (S.tf > S.tg) seq.push(['v', t + S.tg, S.tf - S.tg]); t += Math.max(S.tg, S.tf); } }
        else { cyc = S.tg + tcs; for (var k = 0; k < n; k++) { seq.push(['c', t, tcs]); t += tcs; seq.push(['g', t, S.tg]); t += S.tg; } }
        var T = t, sx = U.scale(0, T, 70, w - 12), y0 = 26, bh = 34, o = '';
        var COL = { g: 'var(--ix-3)', f: 'var(--ix-5)', c: 'var(--ix-1)', v: 'var(--ix-8)' }, NAM = { g: 'megmunkálás', f: 'felfogás a gépen', c: 'csere', v: 'várakozás a felfogásra' };
        o += '<text class="sm" x="8" y="' + (y0 + 22) + '">Gép</text>';
        seq.forEach(function (s) { o += '<rect x="' + sx(s[1]).toFixed(1) + '" y="' + y0 + '" width="' + Math.max(1, sx(s[1] + s[2]) - sx(s[1])).toFixed(1) + '" height="' + bh + '" style="fill:' + COL[s[0]] + ';fill-opacity:' + (s[0] === 'g' ? 0.75 : 0.6) + ';stroke:var(--surface-2);stroke-width:1"/>'; });
        if (S.m === 'pal') {
          o += '<text class="sm" x="8" y="' + (y0 + bh + 34) + '">Külső</text><text class="sm" x="8" y="' + (y0 + bh + 46) + '">palettahely</text>';
          for (var q = 0; q < n; q++) { var st0 = S.tf + tcs + q * (Math.max(S.tg, S.tf)); o += '<rect x="' + sx(st0).toFixed(1) + '" y="' + (y0 + bh + 22) + '" width="' + (sx(st0 + S.tf) - sx(st0)).toFixed(1) + '" height="24" style="fill:var(--ix-5);fill-opacity:.45;stroke:var(--surface-2)"/>'; }
        }
        for (var tk = 0; tk <= T; tk += T > 120 ? 20 : 10) o += '<text class="tk" x="' + sx(tk).toFixed(1) + '" y="' + (h - 8) + '" text-anchor="middle">' + tk + '′</text>';
        P.svg.innerHTML = o;
        legEl.innerHTML = legend(['g', 'f', 'c', 'v'].map(function (k) { return [NAM[k], COL[k]]; }));
        var ut = S.tg / cyc * 100, rec = S.alak === 'sz' || S.kg > 60 ? 'pal' : 'rob';
        out.innerHTML = '<h4><small>Ciklusidő ' + fmt(cyc, 1) + ' perc</small>Gépkihasználás: ' + fmt(ut, 0) + ' %</h4>' +
          U.kv([['Kézi befogás', fmt(S.tg / (S.tg + S.tf) * 100, 0) + ' %', 'a gép a teljes felfogás alatt áll'], ['Palettacserélő', fmt(S.tg / (Math.max(S.tg, S.tf) + 0.5) * 100, 0) + ' %', S.tf > S.tg ? 'a felfogás tovább tart, mint a gépidő — a felfogóhely lett a szűk keresztmetszet' : 'csak a csereidő (≈ 0,5 perc) veszteség'], ['Robot', fmt(S.tg / (S.tg + 0.8) * 100, 0) + ' %', 'be- és kirakás ≈ 0,8 perc']]) +
          '<p class="ix-hint"><b>Javaslat: ' + (rec === 'pal' ? 'palettacserélő' : 'robotos kiszolgálás') + '.</b> ' + (S.alak === 'sz' ? 'Szekrényes darabnál a helyzetbe hozás, pozicionálás, beállítás munka- és időigényes, ezért a darabot a gépen kívül, palettára fogják fel.' : (S.kg > 60 ? 'Forgástest, de nagy tömegű: a robot teherbírása korlátoz, palettás megoldás kell.' : 'Forgástestnél általában a robotos kiszolgálás javasolható.')) + '</p><p class="ix-note">A csereidők és a 60 kg-os robothatár szemléltető értékek; a jegyzet csak a döntési elvet adja meg (alak és tömeg).</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/02 — kapacitás, terhelés, szűk keresztmetszet (4.5–4.8. ábra)      */
  /* ================================================================== */
  var KP_BASE = [
    { n: 'Eszterga', g: 3, Ni: 24, sh: 2 }, { n: 'Maró', g: 2, Ni: 30, sh: 2 }, { n: 'Fúró', g: 1, Ni: 9, sh: 2 },
    { n: 'Köszörű', g: 1, Ni: 14, sh: 2 }, { n: 'Fogazó', g: 1, Ni: 20, sh: 2 },
  ];
  AVIX.def('kapacitas', {
    title: 'Kapacitás, terhelés, szűk keresztmetszet',
    sub: 'Homogén gépcsoportok kapacitás- és terhelési diagramja; C_szűk = [C_i]min — és a feloldás módjai',
    mount: function (el) {
      var st = U.store('kapacitas', { Q: 1000, mode: 'a', G: null }), S = st.get(), sel = -1;
      if (!S.G) S.G = JSON.parse(JSON.stringify(KP_BASE));
      el.innerHTML = '<p class="ix-lead">Egy gyártmány öt homogén gépcsoporton halad át. Az oszlopok szélessége a gépek száma, magassága a <b>terhelés</b> gépenként és naponként; a vonal a gépcsoport rendelkezésre álló idejét (a <b>kapacitást</b>) jelzi. <b>Koppints egy oszlopra</b>, és próbáld ki a feloldási módokat.</p>';
      var row = U.h('div', 'ix-row'); el.appendChild(row);
      U.seg(row, [['a', 'Átbocsátóképesség'], ['k', 'Kapacitás (elméleti)']], S.mode, function (v) { S.mode = v; st.set(S); P.render(); }, 'Számítási mód');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.78 : 0.46; }, minH: 240, maxH: 380, label: 'Kapacitás- és terhelési diagram' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Igény Q', min: 300, max: 3000, step: 50, value: S.Q, unit: 'db/hó', dec: 0, onInput: function (v) { S.Q = v; st.set(S); P.render(); } });
      var acts = U.h('div', 'ix-row'); el.appendChild(acts);
      var B = [['sh', '+1 műszak'], ['tech', '−20 % normaidő'], ['koop', '30 % kooperáció'], ['gep', '+1 gép'], ['reset', 'Visszaállítás']].map(function (b) { var x = U.h('button', 'ix-btn', b[1]); x.type = 'button'; x.setAttribute('data-a', b[0]); acts.appendChild(x); return x; });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function calc() {
        var ap = S.mode === 'a';
        return S.G.map(function (c, i) {
          var N = ap ? 21 : 30, msz = ap ? c.sh : 3, mo = ap ? 7.5 : 8, perf = ap ? 100 : 110;
          var Tn = N * msz * mo * c.g, Th = Tn * 0.93, Kn = c.Ni * (c.k || 1) * 100 / perf / 60;
          var C = Th / Kn, load = S.Q * (1 - (c.koop || 0)) * Kn, day = load / (N * c.g), cap = msz * mo * 0.93;
          return { i: i, c: c, Th: Th, Kn: Kn, C: C, load: load, day: day, cap: cap, u: load / Th };
        });
      }
      function applyAct(a) {
        if (a === 'reset') { S.G = JSON.parse(JSON.stringify(KP_BASE)); sel = -1; }
        else {
          var R = calc(), i = sel >= 0 ? sel : R.reduce(function (b, r) { return r.u > b.u ? r : b; }, R[0]).i, c = S.G[i];
          if (a === 'sh') c.sh = Math.min(3, c.sh + 1);
          if (a === 'tech') c.k = (c.k || 1) * 0.8;
          if (a === 'koop') c.koop = Math.min(0.6, (c.koop || 0) + 0.3);
          if (a === 'gep') c.g += 1;
          c.last = a;
        }
        st.set(S); P.render();
      }
      B.forEach(function (b) { b.addEventListener('click', function () { applyAct(b.getAttribute('data-a')); }); });
      var geo = [];
      P.svg.style.cursor = 'pointer';
      P.svg.addEventListener('click', function (e) { var x = P.at(e)[0]; geo.forEach(function (gg) { if (x >= gg[0] && x <= gg[1]) sel = sel === gg[2] ? -1 : gg[2]; }); P.render(); });
      P.draw = function (w, h) {
        var R = calc(), x0 = 46, x1 = w - 10, y0 = 16, y1 = h - 44, tot = 0;
        R.forEach(function (r) { tot += r.c.g; });
        var ymax = Math.max(26, Math.max.apply(null, R.map(function (r) { return Math.max(r.day, r.cap); })) * 1.12);
        var sy = U.scale(0, ymax, y1, y0), o = '', gap = 6, unit = (x1 - x0 - gap * (R.length - 1)) / tot, x = x0;
        [0, 5, 10, 15, 20, 25, 30, 35, 40].forEach(function (t) { if (t <= ymax) o += '<line class="grid" x1="' + x0 + '" x2="' + x1 + '" y1="' + sy(t).toFixed(1) + '" y2="' + sy(t).toFixed(1) + '"/><text class="tk" x="' + (x0 - 5) + '" y="' + (sy(t) + 3.5).toFixed(1) + '" text-anchor="end">' + t + '</text>'; });
        o += '<text class="tk" x="' + (x0 + 4) + '" y="' + (y0 + 4) + '">óra/nap/gép</text>';
        var szuk = R.reduce(function (b, r) { return r.u > b.u ? r : b; }, R[0]);
        geo = [];
        R.forEach(function (r) {
          var wd = unit * r.c.g, over = r.day > r.cap, isSel = sel === r.i;
          o += '<rect x="' + x.toFixed(1) + '" y="' + sy(r.day).toFixed(1) + '" width="' + wd.toFixed(1) + '" height="' + (y1 - sy(r.day)).toFixed(1) + '" rx="3" style="fill:' + (over ? 'var(--ix-5)' : 'var(--ix-2)') + ';fill-opacity:' + (over ? 0.55 : 0.4) + ';stroke:' + (isSel ? 'var(--ink)' : 'none') + ';stroke-width:2"/>';
          o += '<line x1="' + x.toFixed(1) + '" x2="' + (x + wd).toFixed(1) + '" y1="' + sy(r.cap).toFixed(1) + '" y2="' + sy(r.cap).toFixed(1) + '" style="stroke:var(--ink);stroke-width:2.4"/>';
          var tight = wd < 70;
          o += '<text class="sm" x="' + (x + wd / 2).toFixed(1) + '" y="' + (y1 + 14) + '" text-anchor="middle" style="font-weight:600">' + (tight && r.c.n.length > 5 ? r.c.n.slice(0, 4) + '.' : r.c.n) + '</text><text class="tk" x="' + (x + wd / 2).toFixed(1) + '" y="' + (y1 + 27) + '" text-anchor="middle">' + (tight ? '' : r.c.g + ' gép · ') + fmt(r.u * 100, 0) + '%</text>';
          if (r === szuk && r.u > 0.8) o += '<text class="la" x="' + (x + wd / 2).toFixed(1) + '" y="' + (Math.min(sy(r.day), sy(r.cap)) - 8).toFixed(1) + '" text-anchor="middle">' + (over ? 'szűk' : 'legszűkebb') + '</text>';
          geo.push([x, x + wd, r.i]); x += wd + gap;
        });
        P.svg.innerHTML = o;
        var need = S.Q, Cmin = Math.min.apply(null, R.map(function (r) { return r.C / (1 - (r.c.koop || 0)); })), cur = sel >= 0 ? R[sel] : szuk;
        var bal = Cmin - need;
        out.innerHTML = '<h4><small>' + (S.mode === 'a' ? 'Átbocsátóképesség: T′ₕ = 21 munkanap × műszak × 7,5 h × gépek × 0,93; K′ₙ = Nᵢ (T_átl = 100 %)' : 'Kapacitás: Tₕ = 30 naptári nap × 3 műszak × 8 h × gépek × 0,93 (TMK 7 %); Kₙ = Nᵢ·100/110 %') + '</small>C<sub>szűk</sub> = ' + fmt(Cmin, 0) + ' db/hó — ' + (bal >= 0 ? 'fedezet: +' + fmt(bal, 0) + ' db' : 'hiány: ' + fmt(-bal, 0) + ' db') + '</h4>' +
          U.kv(R.map(function (r) { return [r.c.n + (r.c.sh !== 2 && S.mode === 'a' ? ' (' + r.c.sh + ' műszak)' : ''), 'C = ' + fmt(r.C / (1 - (r.c.koop || 0)), 0) + ' db/hó', 'Kₙ = ' + fmt(r.Kn * 60, 1) + ' perc/db' + (r.c.koop ? ', ' + fmt(r.c.koop * 100, 0) + ' % kooperációban' : '') + (r.c.k ? ', technológiai változat' : '')]; })) +
          '<p class="ix-note">Kijelölve: <b>' + cur.c.n + '</b> (a gombok erre hatnak; ha nincs kijelölés, a legszűkebb gépcsoportra). Feloldás a jegyzet szerint: <b>üzemszervezés</b> (műszakszám), <b>gyártásfejlesztés</b> (technológiai változat), <b>külső kooperáció</b> néhány gépcsoportnál, <b>gyárfejlesztés</b> (új gép, 2–3-szoros bővítésnél). Figyeld meg, hogy a feloldás után a szűk keresztmetszet <b>átvándorol</b> egy másik gépcsoportra.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/02 — műveletkapcsolás: soros, átlapolt, párhuzamos (4.22. ábra)    */
  /* ================================================================== */
  function mkSched(mode, t, s) {
    var m = t.length, bl = [], i, j, st;
    if (mode === 'f') { st = 0; for (i = 0; i < m; i++) { for (j = 0; j < s; j++) bl.push([i, j, st + j * t[i], t[i]]); st += s * t[i]; } }
    else if (mode === 'p') { var end = []; for (j = 0; j < s; j++) { var prev = 0; for (i = 0; i < m; i++) { var mf = j ? end[(j - 1) * m + i] : 0, b = Math.max(prev, mf); bl.push([i, j, b, t[i]]); end[j * m + i] = b + t[i]; prev = b + t[i]; } } }
    else { st = 0; for (i = 0; i < m; i++) { for (j = 0; j < s; j++) bl.push([i, j, st + j * t[i], t[i]]); if (i < m - 1) st += t[i] + (s - 1) * Math.max(0, t[i] - t[i + 1]); } }
    var T = 0; bl.forEach(function (b) { T = Math.max(T, b[2] + b[3]); });
    return { bl: bl, T: T };
  }
  AVIX.def('muvkapcs', {
    title: 'Műveletkapcsolás: soros, átlapolt, párhuzamos',
    sub: 'A technológiai ciklus T_c a továbbítás módjától függ (4.22. ábra) — Gantt-diagram képletekkel',
    mount: function (el) {
      var st = U.store('muvkapcs', { m: 'a', s: 5, t: [4, 2, 6, 3] }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Egy s darabos sorozat négy műveleten halad át. <b>Soros</b> továbbításnál a teljes sorozat megvárja egymást; <b>átlapoltnál</b> a gépek megszakítás nélkül dolgoznak, a következő művelet már közben indul; <b>párhuzamosnál</b> darabonként továbbítunk (automata gyártás).</p>';
      var row = U.h('div', 'ix-row'); el.appendChild(row);
      U.seg(row, [['f', 'Soros'], ['a', 'Átlapolt'], ['p', 'Párhuzamos']], S.m, function (v) { S.m = v; st.set(S); P.render(); }, 'Továbbítás');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.62 : 0.36; }, minH: 200, maxH: 300, label: 'Gantt-diagram' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Sorozat s', min: 2, max: 10, step: 1, value: S.s, unit: 'db', dec: 0, onInput: function (v) { S.s = v; st.set(S); P.render(); } });
      S.t.forEach(function (tv, i) { U.slider(g, { label: 't' + (i + 1), min: 1, max: 9, step: 1, value: tv, unit: 'perc', dec: 0, onInput: function (v) { S.t[i] = v; st.set(S); P.render(); } }); });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var R = { f: mkSched('f', S.t, S.s), a: mkSched('a', S.t, S.s), p: mkSched('p', S.t, S.s) }, cur = R[S.m], Tm = R.f.T;
        var x0 = 36, x1 = w - 10, sx = U.scale(0, Tm, x0, x1), rh = (h - 40) / S.t.length, o = '';
        S.t.forEach(function (tv, i) { o += '<text class="sm" x="6" y="' + (14 + i * rh + rh / 2 + 4).toFixed(1) + '">' + (i + 1) + '.</text><line class="grid" x1="' + x0 + '" x2="' + x1 + '" y1="' + (14 + (i + 1) * rh).toFixed(1) + '" y2="' + (14 + (i + 1) * rh).toFixed(1) + '"/>'; });
        cur.bl.forEach(function (b) {
          var y = 14 + b[0] * rh + 4, bw = sx(b[2] + b[3]) - sx(b[2]);
          o += '<rect x="' + sx(b[2]).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + Math.max(1, bw - 1).toFixed(1) + '" height="' + (rh - 8).toFixed(1) + '" rx="2" style="fill:var(--ix-' + ((b[1] % 6) + 1) + ');fill-opacity:.7"/>';
          if (bw > 14) o += '<text class="tk" x="' + (sx(b[2]) + bw / 2).toFixed(1) + '" y="' + (y + (rh - 8) / 2 + 3.5).toFixed(1) + '" text-anchor="middle" style="fill:var(--ink)">' + (b[1] + 1) + '</text>';
        });
        ['f', 'a', 'p'].forEach(function (k) { var x = sx(R[k].T); o += '<line x1="' + x.toFixed(1) + '" x2="' + x.toFixed(1) + '" y1="10" y2="' + (h - 26) + '" style="stroke:' + (k === S.m ? 'var(--acc)' : 'var(--muted)') + ';stroke-width:' + (k === S.m ? 2 : 1) + ';stroke-dasharray:' + (k === S.m ? '0' : '4 3') + '"/><text class="' + (k === S.m ? 'la' : 'tk') + '" x="' + (x - 3).toFixed(1) + '" y="' + (h - 12) + '" text-anchor="end">T_c' + { f: 'f', a: 'á', p: 'p' }[k] + ' = ' + R[k].T + '′</text>'; });
        P.svg.innerHTML = o;
        var sum = S.t.reduce(function (a, b) { return a + b; }, 0), tmax = Math.max.apply(null, S.t), ext = [0].concat(S.t, [0]), tn = 0, tk = 0;
        for (var i = 1; i < ext.length - 1; i++) { if (ext[i - 1] < ext[i] && ext[i] > ext[i + 1]) tn += ext[i]; if (ext[i - 1] > ext[i] && ext[i] < ext[i + 1]) tk += ext[i]; }
        var F = { f: 'T<sub>cf</sub> = s·Σt<sub>i</sub> = ' + S.s + '·' + sum + ' = ' + R.f.T + ' perc', a: 'T<sub>cá</sub> = Σt<sub>i</sub> + (s − 1)·(Σt<sub>n</sub> − Σt<sub>k</sub>) = ' + sum + ' + ' + (S.s - 1) + '·(' + tn + ' − ' + tk + ') = ' + R.a.T + ' perc', p: 'T<sub>cp</sub> = Σt<sub>i</sub> + (s − 1)·t<sub>max</sub> = ' + sum + ' + ' + (S.s - 1) + '·' + tmax + ' = ' + R.p.T + ' perc' };
        out.innerHTML = '<h4><small>' + { f: 'Soros (folytatólagos) továbbítás — műhelyrendszer', a: 'Átlapolt továbbítás — csoportos, zárt ciklusú elrendezés', p: 'Párhuzamos továbbítás — egyes darabok, automata gyártás' }[S.m] + '</small>T<sub>c</sub> = ' + cur.T + ' perc</h4><p>' + F[S.m] + '</p>' +
          (S.m === 'a' ? '<p class="ix-note">Nagyobb (t<sub>n</sub>) az a művelet, amely mindkét szomszédjánál hosszabb, kisebb (t<sub>k</sub>) az, amely mindkettőnél rövidebb; a kezdő és záró érték 0. Ha t<sub>i</sub> ≤ t<sub>i+1</sub>, egy darab után továbbítunk; különben úgy indítjuk a következő műveletet, hogy az utolsó darabra se kelljen várnia.</p>' : '') +
          (S.m === 'p' ? '<p class="ix-note">A darabok csak akkor nem várakoznak, ha minden művelet ideje azonos — egyébként a leghosszabb művelet előtt sor áll, utána a gépek üresjáratban várnak.</p>' : '') +
          U.kv([['Soros', R.f.T + ' perc', 'leghosszabb átfutás'], ['Átlapolt', R.a.T + ' perc', 'a gépek megszakítás nélkül dolgoznak'], ['Párhuzamos', R.p.T + ' perc', 'legrövidebb átfutás']]);
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/02 — vezértípus és választékarány (4.12–4.20)                      */
  /* ================================================================== */
  AVIX.def('valasztek', {
    title: 'Kapacitás vezértípusban és választékarány szerint',
    sub: 'Egyenértékszám e_x = (K_n)_v/(K_n)_x; v = C_v/(1 + x/e_a + y/e_b) — mennyi készül az egyes termékekből?',
    mount: function (el) {
      var st = U.store('valasztek', { Th: 2000, Kv: 2, Ka: 3, Kb: 1.5, x: 0.5, y: 2 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Három hasonló technológiájú, de eltérő munkaigényű termék (pl. különböző méretű motorok) közös gépcsoporton. A <b>v vezértípushoz</b> viszonyítunk; az előírt választékarány <b>v : a : b = 1 : x : y</b>. Állítsd a normákat és az arányokat.</p>';
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.3 : 0.16; }, minH: 90, maxH: 120, label: 'Az időalap megoszlása' });
      var g = U.sliders(el);
      [['Th', 'Időalap Tₕ', 500, 5000, 50, 'h'], ['Kv', 'Kₙ vezértípus', 0.5, 6, 0.1, 'h/db'], ['Ka', 'Kₙ „a” termék', 0.5, 6, 0.1, 'h/db'], ['Kb', 'Kₙ „b” termék', 0.5, 6, 0.1, 'h/db'], ['x', 'Arány x (a/v)', 0, 4, 0.1, ''], ['y', 'Arány y (b/v)', 0, 4, 0.1, '']].forEach(function (d) {
        U.slider(g, { label: d[1], min: d[2], max: d[3], step: d[4], value: S[d[0]], unit: d[5], dec: d[4] < 1 ? 1 : 0, onInput: function (v) { S[d[0]] = v; st.set(S); P.render(); } });
      });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var Cv = S.Th / S.Kv, ea = S.Kv / S.Ka, eb = S.Kv / S.Kb, v = Cv / (1 + S.x / ea + S.y / eb), a = v * S.x, b = v * S.y;
        var tv = v * S.Kv, ta = a * S.Ka, tb = b * S.Kb, sx = U.scale(0, S.Th, 10, w - 10), o = '', x = 0;
        [['v', tv, 'var(--ix-2)'], ['a', ta, 'var(--ix-1)'], ['b', tb, 'var(--ix-3)']].forEach(function (p) {
          var x0 = sx(x), x1 = sx(x + p[1]); o += '<rect x="' + x0.toFixed(1) + '" y="18" width="' + Math.max(0, x1 - x0).toFixed(1) + '" height="34" style="fill:' + p[2] + ';fill-opacity:.6;stroke:var(--surface-2)"/>';
          if (x1 - x0 > 60) o += '<text class="lb" x="' + ((x0 + x1) / 2).toFixed(1) + '" y="40" text-anchor="middle">' + p[0] + ': ' + fmt(p[1], 0) + ' h</text>';
          x += p[1];
        });
        o += '<text class="tk" x="10" y="72">0</text><text class="tk" x="' + (w - 10) + '" y="72" text-anchor="end">Tₕ = ' + fmt(S.Th, 0) + ' h</text>';
        P.svg.innerHTML = o;
        out.innerHTML = '<h4><small>C_v = Tₕ/(Kₙ)ᵥ = ' + fmt(Cv, 0) + ' db · e_a = ' + fmt(ea, 3) + ' · e_b = ' + fmt(eb, 3) + '</small>v = ' + fmt(v, 0) + ' db, a = ' + fmt(a, 0) + ' db, b = ' + fmt(b, 0) + ' db</h4>' +
          '<p>v + a/e<sub>a</sub> + b/e<sub>b</sub> = C<sub>v</sub>, a = v·x, b = v·y → <b>v = C<sub>v</sub>/(1 + x/e<sub>a</sub> + y/e<sub>b</sub>)</b> = ' + fmt(Cv, 0) + '/(1 + ' + fmt(S.x / ea, 3) + ' + ' + fmt(S.y / eb, 3) + ').</p>' +
          U.kv([['Egyenértékszám', 'e_x = (Kₙ)ᵥ/(Kₙ)ₓ', 'a munkaigényesebb termék egyenértékszáma 1-nél kisebb'], ['Kapacitás x termékből', 'Cₓ = Cᵥ·eₓ', 'ha csak azt gyártanánk: C_a = ' + fmt(Cv * ea, 0) + ' db, C_b = ' + fmt(Cv * eb, 0) + ' db'], ['Ellenőrzés', fmt(v * S.Kv + a * S.Ka + b * S.Kb, 0) + ' h = Tₕ', 'az időalapot a három termék együtt köti le']]);
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/07 — idealizált készletalakulás (5.10. ábra)                       */
  /* ================================================================== */
  function rng(seed) { var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
  AVIX.def('keszlet', {
    title: 'Készletalakulás: rendelési pont, biztonsági készlet',
    sub: 'B_p = S_b + a·t_wb — mikor kell rendelni, hogy a beérkezésig ne fogyjon ki? (5.10. ábra)',
    mount: function (el) {
      var st = U.store('keszlet', { a: 10, twb: 5, Sb: 20, Q: 150, zav: 'n' }), S = st.get(), seed = 7;
      el.innerHTML = '<p class="ix-lead">Egy szerkezeti elem készlete a felhasználással csökken. Ha eléri a <b>rendelési pontot</b> (B<sub>p</sub>), rendelünk; az áru a <b>teljes újrabeszerzési idő</b> (t<sub>wb</sub>: szükséglet megállapítása, rendelés, szállítónál töltött idő, árubeérkezés, beraktározás) után érkezik. A <b>biztonsági készlet</b> (S<sub>b</sub>) a felhasználás ingadozását és a késést fogja fel.</p>';
      var row = U.h('div', 'ix-row'); el.appendChild(row);
      U.seg(row, [['n', 'Egyenletes felhasználás'], ['i', 'Ingadozó felhasználás + késés']], S.zav, function (v) { S.zav = v; st.set(S); P.render(); }, 'Felhasználás');
      var nb = U.h('button', 'ix-btn', 'Új véletlen minta'); nb.type = 'button'; row.appendChild(nb);
      nb.addEventListener('click', function () { seed = Math.floor(Math.random() * 1e6) + 1; P.render(); });
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.66 : 0.4; }, minH: 220, maxH: 320, label: 'Készletalakulás' });
      var g = U.sliders(el);
      [['a', 'Felhasználás a', 2, 30, 1, 'db/nap'], ['twb', 'Újrabeszerzés t_wb', 1, 15, 1, 'nap'], ['Sb', 'Biztonsági készlet', 0, 150, 5, 'db'], ['Q', 'Rendelési mennyiség', 30, 400, 10, 'db']].forEach(function (d) {
        U.slider(g, { label: d[1], min: d[2], max: d[3], step: d[4], value: S[d[0]], unit: d[5], dec: 0, onInput: function (v) { S[d[0]] = v; st.set(S); P.render(); } });
      });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var R = rng(seed), days = 90, Bp = S.Sb + S.a * S.twb, stock = Bp + S.Q * 0.8, pend = [], hist = [[0, stock]], orders = [], arr = [], short = 0, sum = 0, lost = 0;
        for (var d = 0; d < days; d++) {
          pend = pend.filter(function (p) { if (p.t <= d) { stock += S.Q; arr.push([d, stock]); hist.push([d, stock]); return false; } return true; });
          var use = S.a * (S.zav === 'i' ? 0.5 + R() * 1.1 : 1);
          if (stock - use < 0) { lost += use - stock; short++; stock = 0; } else stock -= use;
          hist.push([d + 1, stock]); sum += stock;
          if (stock <= Bp && !pend.length) { var lt = S.twb + (S.zav === 'i' && R() < 0.3 ? Math.ceil(S.twb * 0.5) : 0); pend.push({ t: d + 1 + lt }); orders.push([d + 1, stock, lt]); }
        }
        var ymax = Math.max(Bp + S.Q, 60) * 1.1, x0 = 44, x1 = w - 12, y0 = 14, y1 = h - 30, sx = U.scale(0, days, x0, x1), sy = U.scale(0, ymax, y1, y0), o = '';
        o += U.axes({ x0: x0, x1: x1, y0: y0, y1: y1, sx: sx, sy: sy, xt: [0, 15, 30, 45, 60, 75, 90], yt: [0, Math.round(ymax / 3), Math.round(2 * ymax / 3)], xl: 'nap', yl: 'db' });
        o += '<rect x="' + x0 + '" y="' + sy(S.Sb).toFixed(1) + '" width="' + (x1 - x0) + '" height="' + (y1 - sy(S.Sb)).toFixed(1) + '" style="fill:var(--ix-3);fill-opacity:.12"/>';
        o += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + sy(Bp).toFixed(1) + '" y2="' + sy(Bp).toFixed(1) + '" style="stroke:var(--ix-1);stroke-width:1.6;stroke-dasharray:6 4"/><text class="sm" x="' + (x1 - 4) + '" y="' + (sy(Bp) - 5).toFixed(1) + '" text-anchor="end" style="fill:var(--ix-1);font-weight:700">B_p = ' + fmt(Bp, 0) + '</text>';
        o += '<text class="sm" x="' + (x1 - 4) + '" y="' + (sy(S.Sb / 2) + 4).toFixed(1) + '" text-anchor="end" style="fill:var(--ix-3);font-weight:700">S_b = ' + S.Sb + '</text>';
        o += '<path d="' + U.path(hist, sx, sy) + '" style="fill:none;stroke:var(--acc);stroke-width:2;stroke-linejoin:round"/>';
        orders.forEach(function (q) { o += '<line x1="' + sx(q[0]).toFixed(1) + '" x2="' + sx(q[0] + q[2]).toFixed(1) + '" y1="' + (sy(q[1]) + 0).toFixed(1) + '" y2="' + (sy(q[1])).toFixed(1) + '" style="stroke:var(--ink-2);stroke-width:1" marker-end="url(#ksA)"/><circle cx="' + sx(q[0]).toFixed(1) + '" cy="' + sy(q[1]).toFixed(1) + '" r="3.5" style="fill:var(--ix-1)"/>'; });
        P.svg.innerHTML = '<defs>' + arrowDefs('ksA', 'var(--ink-2)') + '</defs>' + o;
        out.innerHTML = '<h4><small>B_p = S_b + a·t_wb = ' + S.Sb + ' + ' + S.a + '·' + S.twb + '</small>Rendelési pont: ' + fmt(Bp, 0) + ' db</h4>' +
          U.kv([['Rendelések 90 nap alatt', orders.length + ' db', 'narancs pont: rendelés (t₁), nyíl: beérkezésig tartó idő'], ['Átlagkészlet', fmt(sum / days, 0) + ' db', 'tőkelekötés — a nagyobb S_b és Q növeli'], ['Hiány', short ? short + ' nap, ' + fmt(lost, 0) + ' db kielégítetlen' : 'nem volt', short ? 'növeld a biztonsági készletet' : '']]) +
          '<p class="ix-note">Egyenletes felhasználásnál a biztonsági készlet elvileg érintetlen marad; ingadozásnál és késésnél ez véd a hiány ellen — cserébe nagyobb a raktári tőkelekötés.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/07 — átfutási idő alkotórészei; előre és visszafelé ütemezés      */
  /* ================================================================== */
  var UT_OPS = [['Esztergálás', 0.15, 0.4], ['Marás', 0.15, 0.35], ['Hőkezelés', 0.1, 0.5], ['Köszörülés', 0.15, 0.3]]; // [név, felszerelés, megmunkálás] nap
  var UT_COL = { w: 'var(--ix-8)', f: 'var(--ix-1)', m: 'var(--ix-3)', e: 'var(--ix-4)', s: 'var(--ix-2)' };
  AVIX.def('utemez', {
    title: 'Átfutási idő és rendelési ütemezés',
    sub: 'A várakozás az átfutási idő kb. 85%-a — előre és visszafelé ütemezés, pufferek (5.11–5.12. ábra)',
    mount: function (el) {
      var st = U.store('utemez', { dir: 'e', due: 26, wred: 0, over: 'n' }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Egy gyártási rendelés négy műveletből áll. Minden műveletnél: <b>várakozás</b>, felszerelés, megmunkálás, ellenőrzés, szállítás. Az átfutás ütemezése kapacitáskorlátok nélküli határidőtervezés: <b>előre</b> (a mai naptól) vagy <b>visszafelé</b> (a célhatáridőtől).</p>';
      var row = U.h('div', 'ix-row'); el.appendChild(row);
      U.seg(row, [['e', 'Előre ütemezés'], ['v', 'Visszafelé ütemezés']], S.dir, function (v) { S.dir = v; st.set(S); P.render(); }, 'Ütemezés');
      U.seg(row, [['n', 'Műveletek egymás után'], ['i', 'Átfedéssel']], S.over, function (v) { S.over = v; st.set(S); P.render(); }, 'Átfedés');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.56 : 0.32; }, minH: 190, maxH: 280, label: 'Rendelés ütemezése' });
      var legEl = U.h('div', '', legend([['várakozás', UT_COL.w], ['felszerelés', UT_COL.f], ['megmunkálás', UT_COL.m], ['ellenőrzés', UT_COL.e], ['szállítás', UT_COL.s], ['puffer', 'var(--ix-6)']])); el.appendChild(legEl);
      var g = U.sliders(el);
      U.slider(g, { label: 'Célhatáridő', min: 8, max: 30, step: 1, value: S.due, unit: '. nap', dec: 0, onInput: function (v) { S.due = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Várakozás csökkentése', min: 0, max: 80, step: 5, value: S.wred, unit: '%', dec: 0, onInput: function (v) { S.wred = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var comps = UT_OPS.map(function (op) { return { n: op[0], w: 4 * (1 - S.wred / 100), f: op[1], m: op[2], e: 0.05, s: 0.1 }; });
        var len = comps.map(function (c) { return c.w + c.f + c.m + c.e + c.s; });
        var starts = [], t = 0;
        comps.forEach(function (c, i) { starts.push(t); t += len[i] * (S.over === 'i' && i < comps.length - 1 ? 0.7 : 1); });
        var total = starts[starts.length - 1] + len[len.length - 1];
        var off = S.dir === 'e' ? 0 : S.due - total, x0 = 90, x1 = w - 12, sx = U.scale(0, 30, x0, x1), rh = (h - 44) / comps.length, o = '';
        for (var d = 0; d <= 30; d += 5) o += '<line class="grid" x1="' + sx(d).toFixed(1) + '" x2="' + sx(d).toFixed(1) + '" y1="10" y2="' + (h - 22) + '"/><text class="tk" x="' + sx(d).toFixed(1) + '" y="' + (h - 6) + '" text-anchor="middle">' + d + '</text>';
        var COL = UT_COL;
        comps.forEach(function (c, i) {
          var y = 12 + i * rh, x = starts[i] + off;
          o += '<text class="sm" x="6" y="' + (y + rh / 2 + 3).toFixed(1) + '">' + c.n + '</text>';
          ['w', 'f', 'm', 'e', 's'].forEach(function (k) { var a = sx(x), b = sx(x + c[k]); o += '<rect x="' + a.toFixed(1) + '" y="' + (y + 4).toFixed(1) + '" width="' + Math.max(0.5, b - a).toFixed(1) + '" height="' + (rh - 8).toFixed(1) + '" style="fill:' + COL[k] + ';fill-opacity:' + (k === 'w' ? 0.35 : 0.8) + '"/>'; x += c[k]; });
        });
        var s0 = off, e0 = off + total, late = e0 > S.due + 1e-9 || s0 < -1e-9;
        o += '<line x1="' + sx(0) + '" x2="' + sx(0) + '" y1="8" y2="' + (h - 22) + '" style="stroke:var(--ink);stroke-width:1.6"/><text class="tk" x="' + (sx(0) + 3) + '" y="' + (h - 26) + '">ma</text>';
        o += '<line x1="' + sx(S.due).toFixed(1) + '" x2="' + sx(S.due).toFixed(1) + '" y1="8" y2="' + (h - 22) + '" style="stroke:var(--ix-5);stroke-width:2"/><text class="sm" x="' + (sx(S.due) - 3).toFixed(1) + '" y="' + (h - 26) + '" text-anchor="end" style="fill:var(--ix-5);font-weight:700">határidő</text>';
        var buf = S.dir === 'e' ? [e0, S.due] : [0, s0];
        if (buf[1] > buf[0] + 0.05) o += '<rect x="' + sx(buf[0]).toFixed(1) + '" y="' + (h - 20) + '" width="' + (sx(buf[1]) - sx(buf[0])).toFixed(1) + '" height="6" rx="3" style="fill:var(--ix-6);fill-opacity:.7"/>';
        P.svg.innerHTML = o;
        var wt = comps.reduce(function (a, c) { return a + c.w; }, 0), all = len.reduce(function (a, b) { return a + b; }, 0);
        out.innerHTML = '<h4><small>' + (S.dir === 'e' ? 'Előre ütemezés: legkorábbi kezdés és befejezés' : 'Visszafelé ütemezés: legkésőbbi kezdés és befejezés') + '</small>Átfutási idő: ' + fmt(total, 1) + ' nap — ' + (late ? '<span style="color:var(--ix-5)">nem tartható!</span>' : 'tartható') + '</h4>' +
          U.kv([['Várakozás aránya', fmt(wt / all * 100, 0) + ' %', 'a jegyzet szerint kb. 85 % — itt a legnagyobb a racionalizálási lehetőség'], [S.dir === 'e' ? 'Rendelési puffer (a végén)' : 'Puffer (a kezdésig)', fmt(Math.max(0, buf[1] - buf[0]), 1) + ' nap', S.dir === 'e' ? 'a korán elkészült darab raktáron áll: tőkelekötés' : 'nincs raktározási idő, de zavar esetén nagy a késés veszélye']]) +
          '<p class="ix-note">Késés esetén a jegyzet szerinti intézkedések: a várakozási idő csökkentése, a műveletek átfedése, a rendelés felbontása több gépre — próbáld ki a csúszkát és az átfedést.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/07 — sorrendtervezés prioritási szabályokkal (5.6.3)               */
  /* ================================================================== */
  var SR_J = [['R1', 4, 10, 2], ['R2', 7, 14, 5], ['R3', 2, 6, 1], ['R4', 5, 20, 8], ['R5', 3, 9, 3], ['R6', 6, 16, 4]]; // [név, megmunkálási idő, határidő, érték]
  var SR_RULES = {
    fifo: ['Érkezési sorrend (FIFO)', 'Ahogy a rendelések beérkeztek.', function (a, b) { return a.i - b.i; }],
    spt: ['Legrövidebb megmunkálási idő', 'Egyedi gépre vonatkozó helyi szabály; az átfutási időt csökkenti.', function (a, b) { return a.p - b.p || a.i - b.i; }],
    edd: ['Legkorábbi határidő', 'A határidő betartását segíti — az egész gyártás alatt irányító szabály.', function (a, b) { return a.d - b.d || a.i - b.i; }],
    slack: ['Legkisebb puffer (határidő − idő)', 'A határidő betartását segíti: a legkisebb pufferelési idejű rendelés először.', function (a, b) { return (a.d - a.p) - (b.d - b.p) || a.i - b.i; }],
    val: ['Legnagyobb tőkelekötés', 'A műveletek közötti tárolás (lekötött tőke) csökkentésére.', function (a, b) { return b.v - a.v || a.i - b.i; }],
  };
  AVIX.def('sorrend', {
    title: 'Sorrendtervezés prioritási szabályokkal',
    sub: 'Hat rendelés egy gépen: átfutás, késés, tőkelekötés — melyik szabály mire jó?',
    mount: function (el) {
      var st = U.store('sorrend', { r: 'spt' }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A kapacitásütemezés után a sorrendtervezés rögzíti a munkaműveletek ledolgozási sorrendjét. <b>Válts a prioritási szabályok között</b>, és hasonlítsd össze az eredményt: nincs mindenben legjobb szabály — a célhoz kell választani.</p>';
      var row = U.h('div'); el.appendChild(row);
      U.chips(row, Object.keys(SR_RULES).map(function (k) { return [k, SR_RULES[k][0]]; }), S.r, function (v) { S.r = v; st.set(S); P.render(); }, 'Prioritási szabály');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.42 : 0.22; }, minH: 140, maxH: 190, label: 'Gantt-diagram' });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function run(r) {
        var J = SR_J.map(function (j, i) { return { i: i, n: j[0], p: j[1], d: j[2], v: j[3] }; }).sort(SR_RULES[r][2]), t = 0, fl = 0, late = 0, mx = 0, cap = 0;
        J.forEach(function (j) { j.s = t; t += j.p; j.c = t; fl += j.c; var L = Math.max(0, j.c - j.d); if (L > 0) late++; mx = Math.max(mx, L); cap += j.v * j.c; });
        return { J: J, fl: fl / J.length, late: late, mx: mx, cap: cap };
      }
      P.draw = function (w, h) {
        var R = run(S.r), T = 28, x0 = 10, x1 = w - 10, sx = U.scale(0, T, x0, x1), o = '', y = 24, bh = 38;
        for (var d = 0; d <= T; d += 4) o += '<line class="grid" x1="' + sx(d).toFixed(1) + '" x2="' + sx(d).toFixed(1) + '" y1="16" y2="' + (h - 34) + '"/><text class="tk" x="' + sx(d).toFixed(1) + '" y="' + (h - 20) + '" text-anchor="middle">' + d + '</text>';
        R.J.forEach(function (j) {
          var a = sx(j.s), b = sx(j.c), lateJ = j.c > j.d;
          o += '<rect x="' + a.toFixed(1) + '" y="' + y + '" width="' + (b - a - 1).toFixed(1) + '" height="' + bh + '" rx="4" style="fill:var(--ix-' + (j.i + 1) + ');fill-opacity:.65;stroke:' + (lateJ ? 'var(--ix-5)' : 'none') + ';stroke-width:2.5"/><text class="lb" x="' + ((a + b) / 2).toFixed(1) + '" y="' + (y + 16) + '" text-anchor="middle">' + j.n + '</text><text class="tk" x="' + ((a + b) / 2).toFixed(1) + '" y="' + (y + 30) + '" text-anchor="middle" style="fill:var(--ink)">h:' + j.d + '</text>';
          o += '<line x1="' + sx(j.d).toFixed(1) + '" x2="' + sx(j.d).toFixed(1) + '" y1="' + (y + bh + 3) + '" y2="' + (y + bh + 12) + '" style="stroke:var(--ix-' + (j.i + 1) + ');stroke-width:2.5"/>';
        });
        o += '<text class="tk" x="' + x0 + '" y="12">' + (w < 520 ? 'jelek: határidők · piros keret: késik' : 'gép · a rendelések alatti jelek: határidők (piros keret: késik)') + '</text>';
        P.svg.innerHTML = o;
        var all = Object.keys(SR_RULES).map(function (k) { var q = run(k); return '<tr' + (k === S.r ? ' class="on"' : '') + '><td>' + SR_RULES[k][0] + '</td><td>' + fmt(q.fl, 1) + '</td><td>' + q.late + '</td><td>' + q.mx + '</td><td>' + q.cap + '</td></tr>'; }).join('');
        out.innerHTML = '<h4><small>' + SR_RULES[S.r][0] + '</small>Sorrend: ' + R.J.map(function (j) { return j.n; }).join(' → ') + '</h4><p>' + SR_RULES[S.r][1] + '</p>' +
          '<table class="ix-tbl"><thead><tr><th>Szabály</th><th>Átl. átfutás</th><th>Késők</th><th>Max. késés</th><th>Tőkelekötés Σ(érték·befejezés)</th></tr></thead><tbody>' + all + '</tbody></table>' +
          '<p class="ix-note">Egy gépen a legrövidebb megmunkálási idő szabálya adja a legkisebb átlagos átfutást, a határidő-alapú szabályok a legkisebb késést. A jegyzet szerint a betervezés sorrendjét részben prioritási szabályok, általában tapasztalt szakember végzi; utána gyakran újabb kapacitáskiegyenlítés kell.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/08 — CIM: Scheer-féle Y-modell, metszetek, integrációs lépcsők     */
  /* ================================================================== */
  var CY = {
    rend: { n: 'Vevői rendelés', x: 60, y: 30, s: 'irany', a: 'L', d: 'A rendelés átfutásának első modulja: a vevői rendelések nyilvántartása (PPS).' },
    prog: { n: 'Termelési program', x: 60, y: 76, s: 'irany', a: 'L', d: 'Elsődleges szükséglet: a végtermékből adott időpontra szükséges mennyiség.' },
    mrp: { n: 'Anyagszükséglet (MRP)', x: 60, y: 122, s: 'irany', a: 'L', d: 'Szükséglet- vagy felhasználásvezérelt diszpozíció: gyártási és beszerzési rendelések.' },
    kap: { n: 'Határidő- és kapacitásterv', x: 60, y: 168, s: 'irany', a: 'L', d: 'Átfutás- és kapacitásütemezés, sorrendtervezés.' },
    ind: { n: 'Rendelésindítás', x: 60, y: 214, s: 'irany', a: 'L', d: 'Rendelkezésre állás vizsgálata után a rendelés kiadása finomütemezésre.' },
    cad: { n: 'CAD konstrukció', x: 400, y: 30, s: 'gyartmany', a: 'R', d: 'Számítógéppel segített konstrukciós tervezés: termékmodell, rajz, darabjegyzék.' },
    cae: { n: 'CAE mérnöki elemzés', x: 400, y: 76, s: 'gyartmany', a: 'R', d: 'Méretezés, szimuláció, ellenőrzés — visszacsatolás a konstrukcióhoz.' },
    capp: { n: 'CAP/CAPP technológia', x: 400, y: 122, s: 'gyartas', a: 'R', d: 'Gyártás-előkészítés: műveleti sorrend, művelettervek, normaidők, NC-programozás.' },
    nc: { n: 'NC-programozás', x: 400, y: 168, s: 'gyartas', a: 'R', d: 'Alkatrészprogramok, szerszámpályák — a CAPP része.' },
    tool: { n: 'Gyártóeszköz-tervezés', x: 400, y: 214, s: 'gyartas', a: 'R', d: 'Szerszám- és készüléktervezés, anyagkezelés tervezése.' },
    fir: { n: 'Gyártásirányítás', x: 230, y: 268, s: 'irany', a: 'S', d: 'Munkakiosztás, finomütemezés, gyártásvezérlés — itt egyesül a két ág.' },
    cam: { n: 'CAM: NC/DNC, szállítás, raktár', x: 230, y: 314, s: 'auto', a: 'S', d: 'Termelőeszközök irányítása: NC, DNC, CNC, robot, szállítás, szerelés, raktár — a gyárautomatizálás (FMS) szegmense.' },
    caq: { n: 'CAQ minőségbiztosítás', x: 230, y: 360, s: 'auto', a: 'S', d: 'Számítógéppel támogatott minőségirányítás: mérés, SPC, visszacsatolás.' },
    bde: { n: 'Üzemi adatgyűjtés (BDE)', x: 230, y: 406, s: 'irany', a: 'S', d: 'Anyag-, gép-, minőségi adatok gyűjtése; visszajelzés a PPS-nek (szabályozókör).' },
  };
  var CY_N2 = { mrp: 'Anyagszükséglet|(MRP)', kap: 'Határidő- és|kapacitásterv', cad: 'CAD|konstrukció', cae: 'CAE|mérnöki elemzés', capp: 'CAP/CAPP|technológia', tool: 'Gyártóeszköz-|tervezés', cam: 'CAM: NC/DNC,|szállítás, raktár', caq: 'CAQ|minőségbiztosítás', bde: 'Üzemi adatgyűjtés|(BDE)' };
  var CY_SEG = { gyartmany: ['Gyártmánytervezés', 'var(--ix-2)'], gyartas: ['Gyártástervezés', 'var(--ix-4)'], irany: ['Gyártásirányítás', 'var(--ix-1)'], auto: ['Gyárautomatizálás', 'var(--ix-3)'] };
  var CY_STEP = [
    ['1. Részmegoldások', 'CAD/CAM rendszerek és rugalmas gyártórendszerek külön-külön („szigetek”).', ['cad', 'cae', 'capp', 'nc', 'cam']],
    ['2. CAD/CAM + FMS integráció', 'Zárt funkcióláncok, az átfutási idő jelentős csökkenése.', ['cad', 'cae', 'capp', 'nc', 'tool', 'cam', 'caq']],
    ['3. + PPS és üzemi adatok', 'Optimális átfutás, jobb kihasználás, költségátláthatóság.', ['cad', 'cae', 'capp', 'nc', 'tool', 'cam', 'caq', 'rend', 'prog', 'mrp', 'kap', 'ind', 'fir', 'bde']],
    ['4. + vezetői információs és döntési rendszerek', 'Tudásalapú szakértői rendszerek; költségoptimális, magas rugalmasságú gyártás.', 'all'],
    ['5. Vállalati hálózat, szállítók és vevők', 'Területi hálózat (WAN), kapcsolat a szállítókkal és vevőkkel.', 'all'],
  ];
  AVIX.def('cimy', {
    title: 'CIM: az Y-modell, a metszetek és az integráció lépcsői',
    sub: 'Scheer-féle Y-modell (ISO TC 184) — rendelésorientált és termékorientált ág, közös adatbázis',
    mount: function (el) {
      var st = U.store('cimy', { v: 'seg', step: 3 }), S = st.get(), sel = null;
      el.innerHTML = '<p class="ix-lead">Az Y bal ága a <b>mennyiség- és rendelésorientált</b> PPS (mennyit, mikorra), a jobb a <b>termékorientált</b> műszaki lánc (mit, hogyan); a gyártásnál egyesülnek. Középen a <b>közös adatbázis</b>: minden adat egyszer, a keletkezés helyén jön létre. <b>Koppints a modulokra.</b></p>';
      var row = U.h('div', 'ix-row'); el.appendChild(row);
      U.seg(row, [['seg', 'Metszetek'], ['step', 'Integrációs lépcsők'], ['net', 'Hálózat (TOP/MAP)']], S.v, function (v) { S.v = v; st.set(S); draw(); }, 'Nézet');
      var wrap = U.h('div', 'ix-plot'); el.appendChild(wrap);
      var sw = U.h('div'); el.appendChild(sw);
      var sl = U.slider(U.sliders(sw), { label: 'Lépcső', min: 1, max: 5, step: 1, value: S.step, dec: 0, onInput: function (v) { S.step = v; st.set(S); draw(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function isOn(k) {
        if (S.v !== 'step') return true;
        var s = CY_STEP[S.step - 1][2]; return s === 'all' || s.indexOf(k) >= 0;
      }
      var lastNarrow = null;
      function draw() {
        sw.style.display = S.v === 'step' ? '' : 'none';
        // keskeny kijelzőn tömörebb, kétsoros feliratú elrendezés
        var nw = (wrap.clientWidth || 600) < 540, W = nw ? 440 : 600, bw = nw ? 124 : 140, bh = nw ? 36 : 32, cxL = nw ? 8 : 60, cxR = nw ? 308 : 400, cxS = nw ? 158 : 230, mid = W / 2, rC = nw ? 40 : 46;
        lastNarrow = nw;
        function pos(c) { return { x: c.a === 'L' ? cxL : c.a === 'R' ? cxR : cxS, y: c.y }; }
        var o = '<path d="M' + (cxL + bw / 2) + ',60 L' + (mid - 40) + ',250 M' + (cxR + bw / 2) + ',60 L' + (mid + 40) + ',250 M' + mid + ',250 V430" style="fill:none;stroke:var(--rule-2);stroke-width:' + (nw ? 20 : 26) + ';stroke-linecap:round;stroke-linejoin:round;opacity:.45"/>';
        o += '<circle cx="' + mid + '" cy="150" r="' + rC + '" style="fill:var(--surface);stroke:var(--acc);stroke-width:2"/><text class="lb" x="' + mid + '" y="146" text-anchor="middle">Közös</text><text class="lb" x="' + mid + '" y="161" text-anchor="middle">adatbázis</text>';
        Object.keys(CY).forEach(function (k) { var p = pos(CY[k]); if (isOn(k)) o += '<line x1="' + (p.x + bw / 2) + '" y1="' + (p.y + bh / 2) + '" x2="' + mid + '" y2="150" style="stroke:var(--acc);stroke-width:1;opacity:' + (S.v === 'step' ? 0.35 : 0.15) + '"/>'; });
        Object.keys(CY).forEach(function (k) {
          var c = CY[k], p = pos(c), on = isOn(k), col = S.v === 'net' ? (c.s === 'auto' || k === 'fir' || k === 'bde' ? 'var(--ix-3)' : 'var(--ix-2)') : CY_SEG[c.s][1], isSel = sel === k;
          var lines = nw ? (CY_N2[k] || c.n).split('|') : [c.n];
          o += '<g data-k="' + k + '" style="cursor:pointer;opacity:' + (on ? 1 : 0.25) + '"><rect x="' + p.x + '" y="' + p.y + '" width="' + bw + '" height="' + bh + '" rx="7" style="fill:' + col + ';fill-opacity:.2;stroke:' + (isSel ? 'var(--ink)' : col) + ';stroke-width:' + (isSel ? 2.2 : 1.3) + '"/>';
          lines.forEach(function (ln, i) { o += '<text x="' + (p.x + bw / 2) + '" y="' + (p.y + bh / 2 + 4 + (i - (lines.length - 1) / 2) * 13) + '" text-anchor="middle" style="font-size:11px;font-weight:600;fill:var(--ink)">' + esc(ln) + '</text>'; });
          o += '</g>';
        });
        o += '<text class="tk" x="' + (cxL + bw / 2) + '" y="18" text-anchor="middle">' + (nw ? 'rendelés (PPS)' : 'mennyiség- / rendelésorientált (PPS)') + '</text><text class="tk" x="' + (cxR + bw / 2) + '" y="18" text-anchor="middle">' + (nw ? 'termék (CAx)' : 'termékorientált (CAx)') + '</text><text class="tk" x="' + (nw ? 6 : 18) + '" y="300">tervezés ↑</text><text class="tk" x="' + (nw ? 6 : 18) + '" y="316">megvalósítás ↓</text>';
        var nx = cxR + bw / 2;
        if (S.v === 'net') o += '<text class="lb" x="' + nx + '" y="262" text-anchor="middle" style="fill:var(--ix-2)">LAN-1: TOP</text><text class="tk" x="' + nx + '" y="276" text-anchor="middle">' + (nw ? 'CAD, CAPP, ügyvitel' : 'tervezés, gyártás-előkészítés, ügyvitel') + '</text><text class="lb" x="' + nx + '" y="330" text-anchor="middle" style="fill:var(--ix-3)">LAN-2: MAP</text><text class="tk" x="' + nx + '" y="344" text-anchor="middle">' + (nw ? 'FMS, CNC, PLC, AGV' : 'FMS, cella, CNC, PLC, robot, AGV') + '</text><path d="M' + nx + ',284 V316" style="stroke:var(--ink-2);stroke-dasharray:3 3"/><text class="tk" x="' + (nx + 6) + '" y="304">gateway / WAN</text>';
        wrap.innerHTML = svgBox(W, 448, o, 'A CIM Y-modellje', 620);
        var leg = S.v === 'seg' ? '<div class="ix-legend">' + Object.keys(CY_SEG).map(function (k) { return '<span><i style="background:' + CY_SEG[k][1] + '"></i>' + CY_SEG[k][0] + '</span>'; }).join('') + '</div>' : '';
        if (sel) out.innerHTML = '<h4><small>' + CY_SEG[CY[sel].s][0] + ' · ' + (CY[sel].a === 'L' ? 'rendelésorientált ág' : CY[sel].a === 'R' ? 'termékorientált ág' : 'közös szár') + '</small>' + esc(CY[sel].n) + '</h4><p>' + esc(CY[sel].d) + '</p>' + leg;
        else if (S.v === 'step') out.innerHTML = '<h4><small>A CIM megvalósítása lépcsőzetes (6.1. táblázat)</small>' + CY_STEP[S.step - 1][0] + '</h4><p>' + CY_STEP[S.step - 1][1] + '</p><p class="ix-note">A 3–5. lépcső önállóan (autonóm módon) is megvalósítható.</p>';
        else if (S.v === 'net') out.innerHTML = '<h4><small>A CIM két helyi hálózata (6.4. ábra)</small>TOP irodai és MAP üzemi hálózat</h4><p>A LAN-1 (TOP) a tervező (CAD) és gyártás-előkészítő (CAPP, CAM) munkahelyeket és az ügyviteli nagyszámítógépet köti össze; a LAN-2 (MAP) az FMS-t irányító cella- és raktári számítógépeket az intelligens vezérlőkkel (CNC, PLC, robot, mérőgép, AGV). A kettő WAN-on vagy gateway-en át kapcsolódik. Az eszközrendszert felülről lefelé (top-down) érdemes felépíteni.</p>';
        else out.innerHTML = '<h4><small>A CIM metszetei (6.2. ábra)</small>Három adatfeldolgozó metszet + gyárautomatizálás</h4><p>A gyártmánytervezés, a gyártástervezés és a gyártásirányítás az <b>integrált adatfeldolgozást</b>, a gyárautomatizálás (FMS, robot, szállítás, mérés) az <b>integrált anyagfeldolgozást</b> valósítja meg — közös adatbázisra fűzve.</p>' + leg;
      }
      wrap.addEventListener('click', function (e) { var g = e.target.closest('g[data-k]'); sel = g ? g.getAttribute('data-k') : null; draw(); });
      if (window.ResizeObserver) new ResizeObserver(function () { if (((wrap.clientWidth || 600) < 540) !== lastNarrow) draw(); }).observe(wrap);
      draw();
    },
  });

  /* ================================================================== */
  /* B/08 — tolás (push) és húzás (KANBAN, pull) egy háromállomásos soron */
  /* ================================================================== */
  AVIX.def('pushpull', {
    title: 'Tolás és húzás: KANBAN egy gyártósoron',
    sub: 'Terv szerinti anyagkiadás („hozd ide”) vs. kártyás utánrendelés („megyek érte”) — készlet és átfutás',
    mount: function (el) {
      var st = U.store('pushpull', { m: 'push', k: 3 }), S = st.get(), sim, raf = 0, running = false, last = 0, acc = 0;
      el.innerHTML = '<p class="ix-lead">Három állomás; a középső a leglassabb. <b>Tolásnál</b> a terv (előrejelzés) szerint adjuk ki az anyagot — ha a terv túl optimista, a pufferekben <b>készlethegyek</b> nőnek, és elrejtik a problémákat. <b>Húzásnál</b> csak akkor gyártunk, ha a következő lépcső KANBAN-kártyával kér; a készletet a kártyák száma korlátozza.</p>';
      var row = U.h('div', 'ix-row'); el.appendChild(row);
      U.seg(row, [['push', 'Tolás (push)'], ['pull', 'Húzás (KANBAN)']], S.m, function (v) { S.m = v; st.set(S); reset(); }, 'Irányítás');
      var bRun = U.h('button', 'ix-btn', '▶ Indítás'); bRun.type = 'button'; row.appendChild(bRun);
      var bStop = U.h('button', 'ix-btn', 'Zavar a 2. állomáson'); bStop.type = 'button'; row.appendChild(bStop);
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.8 : 0.46; }, minH: 250, maxH: 360, label: 'Gyártósor és készletgörbe' });
      var g = U.sliders(el);
      U.slider(g, { label: 'KANBAN-kártyák', min: 1, max: 6, step: 1, value: S.k, unit: 'db/puffer', dec: 0, onInput: function (v) { S.k = v; st.set(S); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function reset() { sim = { t: 0, R: rng(11), st: [{ b: 0, left: 0 }, { b: 0, left: 0 }, { b: 0, left: 0 }], buf: [0, 0], fg: 3, rel: 0, done: 0, dem: 0, served: 0, back: 0, wip: [], down: 0 }; P.render(); }
      var MEAN = [2, 3.1, 2], REL = 1 / 2.4, DEM = 1 / 3.4;
      function step() {
        var s = sim, R = s.R;
        s.t++;
        if (s.down > 0) s.down--;
        // anyagkiadás
        if (S.m === 'push') { s.rel += REL; while (s.rel >= 1) { s.rel -= 1; s.st[0].b++; } }
        // állomások (hátulról előre)
        for (var i = 2; i >= 0; i--) {
          var q = s.st[i];
          if (q.left > 0 && !(i === 1 && s.down > 0)) { q.left--; if (q.left === 0) { q.busy = false; if (i < 2) s.buf[i]++; else { s.fg++; s.done++; } } }
          if (!q.busy) {
            var avail = i === 0 ? (S.m === 'push' ? q.b > 0 : true) : s.buf[i - 1] > 0;
            var room = S.m === 'push' ? true : (i < 2 ? s.buf[i] < S.k : s.fg < S.k);
            if (avail && room && !(i === 1 && s.down > 0)) {
              if (i === 0) { if (S.m === 'push') q.b--; } else s.buf[i - 1]--;
              q.busy = true; q.left = Math.max(1, Math.round(MEAN[i] * (0.6 + R() * 0.8)));
            }
          }
        }
        // vevői igény
        if (R() < DEM) { s.dem++; if (s.fg > 0) { s.fg--; s.served++; } else s.back++; }
        var wip = s.st[0].b + s.buf[0] + s.buf[1] + s.st.filter(function (x) { return x.busy; }).length;
        s.wip.push([s.t, wip, s.fg]); if (s.wip.length > 400) s.wip.shift();
      }
      function loop(ts) {
        if (!running || !document.body.contains(el)) return;
        var dt = last ? ts - last : 0; last = ts; acc += dt;
        while (acc > 90) { step(); acc -= 90; }
        P.render(); raf = requestAnimationFrame(loop);
      }
      bRun.addEventListener('click', function () { running = !running; bRun.textContent = running ? '❚❚ Szünet' : '▶ Indítás'; if (running) { last = 0; raf = requestAnimationFrame(loop); } });
      bStop.addEventListener('click', function () { sim.down = 40; });
      P.draw = function (w, h) {
        var s = sim, o = '', top = 16, sh = 70, sx0 = 20, gapW = (w - 40) / 7;
        function stack(x, n, col, cap) { var r = ''; for (var k = 0; k < Math.min(n, 24); k++) { var cx = x + (k % 4) * 11, cy = top + sh - 10 - Math.floor(k / 4) * 11; r += '<rect x="' + cx.toFixed(1) + '" y="' + cy.toFixed(1) + '" width="9" height="9" rx="1.5" style="fill:' + col + '"/>'; } if (n > 24) r += '<text class="tk" x="' + x + '" y="' + (top - 2) + '">+' + (n - 24) + '</text>'; if (cap) for (var c = 0; c < cap; c++) r += '<rect x="' + (x + c * 9) + '" y="' + (top + sh + 4) + '" width="7" height="10" rx="1" style="fill:' + (c < n ? 'var(--muted)' : 'var(--ix-1)') + ';opacity:.8"/>'; return r; }
        var labels = ['Anyag', '1. áll.', 'Puffer', '2. áll.', 'Puffer', '3. áll.', 'Késztermék'];
        for (var i = 0; i < 7; i++) {
          var x = sx0 + i * gapW;
          if (i % 2 === 1) { var q = s.st[(i - 1) / 2], dn = i === 3 && s.down > 0; o += '<rect x="' + (x + 2) + '" y="' + (top + 8) + '" width="' + (gapW - 8) + '" height="' + (sh - 16) + '" rx="8" style="fill:' + (dn ? 'var(--ix-5)' : q.busy ? 'var(--ix-3)' : 'var(--surface)') + ';fill-opacity:' + (q.busy || dn ? 0.35 : 1) + ';stroke:var(--ink-2)"/><text class="tk" x="' + (x + gapW / 2 - 2) + '" y="' + (top + sh / 2 + 4) + '" text-anchor="middle" style="fill:var(--ink)">' + (dn ? 'ÁLL' : q.busy ? 'dolgozik' : 'vár') + '</text>'; }
          else if (i === 0) o += S.m === 'push' ? stack(x + 4, s.st[0].b, 'var(--ix-8)') : '<text class="tk" x="' + (x + 4) + '" y="' + (top + sh / 2) + '">korlátlan</text>';
          else if (i === 6) o += stack(x + 4, s.fg, 'var(--ix-2)', S.m === 'pull' ? S.k : 0);
          else o += stack(x + 4, s.buf[(i - 2) / 2], 'var(--ix-1)', S.m === 'pull' ? S.k : 0);
          o += '<text class="sm" x="' + (x + gapW / 2 - 2) + '" y="' + (top + sh + 28) + '" text-anchor="middle">' + labels[i] + '</text>';
        }
        // készletgörbe
        var cy0 = top + sh + 44, cy1 = h - 18, cx0 = 40, cx1 = w - 10, H = s.wip, mx = 20;
        H.forEach(function (p) { mx = Math.max(mx, p[1]); });
        var t0 = H.length ? H[0][0] : 0, t1 = Math.max(t0 + 100, H.length ? H[H.length - 1][0] : 100), sx = U.scale(t0, t1, cx0, cx1), sy = U.scale(0, mx * 1.1, cy1, cy0);
        o += '<rect class="ax" x="' + cx0 + '" y="' + cy0 + '" width="' + (cx1 - cx0) + '" height="' + (cy1 - cy0) + '" fill="none"/><text class="tk" x="' + (cx0 - 4) + '" y="' + (cy0 + 9) + '" text-anchor="end">' + Math.round(mx * 1.1) + '</text><text class="tk" x="' + (cx0 - 4) + '" y="' + cy1 + '" text-anchor="end">0</text><text class="tk" x="' + (cx0 + 4) + '" y="' + (cy0 + 12) + '">befejezetlen termelés (WIP)</text>';
        if (H.length > 1) o += '<path d="' + U.path(H.map(function (p) { return [sx(p[0]), sy(p[1])]; })) + '" style="fill:none;stroke:var(--acc);stroke-width:2"/><path d="' + U.path(H.map(function (p) { return [sx(p[0]), sy(p[2])]; })) + '" style="fill:none;stroke:var(--ix-2);stroke-width:1.3;stroke-dasharray:4 3"/>';
        P.svg.innerHTML = o;
        var wipAvg = H.length ? H.reduce(function (a, p) { return a + p[1]; }, 0) / H.length : 0, thr = s.t ? s.done / s.t : 0;
        out.innerHTML = '<h4><small>' + (S.m === 'push' ? 'Tolás: a terv ' + fmt(REL * 100, 0) + ' db/100 időegység, a szűk állomás ≈ ' + fmt(100 / MEAN[1], 0) + ' db/100 időegység' : 'Húzás: ' + S.k + ' kártya pufferenként') + '</small>WIP most: ' + (H.length ? H[H.length - 1][1] : 0) + ' db · átlag ' + fmt(wipAvg, 1) + ' db</h4>' +
          U.kv([['Átfutási idő (Little: WIP / kibocsátás)', thr ? fmt(wipAvg / thr, 0) + ' időegység' : '–', 'minél nagyobb a készlet, annál hosszabb az átfutás'], ['Vevői kiszolgálás', s.dem ? fmt(s.served / s.dem * 100, 0) + ' %' : '–', s.back ? s.back + ' igény várt késztermékre' : ''], ['Idő', s.t + ' időegység', '']]) +
          '<p class="ix-note">KANBAN szabályai (jegyzet): a felhasználó nem kérhet idő előtt és a szükségesnél többet; a gyártó nem gyárthat többet, mint amennyit kértek, és nem adhat tovább hibás darabot; a kártyák száma legyen lehetőleg csekély. A „zavar” gomb 40 időegységre leállítja a 2. állomást.</p>';
      };
      reset();
    },
  });

  /* ================================================================== */
  /* B/08 — a lean production teljesítőképessége (5.2. táblázat)          */
  /* ================================================================== */
  var LJ = [
    ['Szerelés, munkaóra / személykocsi', 17, 25, 36],
    ['Minőség, hiányosság / 100 személykocsi', 60, 82, 97],
    ['Konstrukciós előbbretartás, hónap', 46, 60, 58],
    ['Mérnöki órák új autónként', 1.7, 3.1, 3.0],
    ['Szerelési raktárkészlet, nap', 0.2, 2.9, 2.0],
    ['Beszállítói raktárkészlet, nap', 1.5, 8.1, 16.3],
    ['Kiszállítási (késztermék-) készlet, nap', 21, 67, 67],
    ['Beszállítók száma cégenként', 340, 1500, 1500],
    ['Kereskedők száma cégenként', 300, 2000, 7500],
  ];
  AVIX.def('leanjp', {
    title: 'A lean production teljesítőképessége',
    sub: 'A jegyzet 5.2. táblázata (MIT-tanulmány): japán, amerikai és európai autógyártás',
    mount: function (el) {
      var st = U.store('leanjp', { i: 'all' }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A tanulmány a termékfejlesztéstől a gyártásig és az értékesítésig mérte a teljesítményt: majdnem mindenütt <b>2:1 vagy nagyobb</b> különbség adódott a japán (lean) gyártók javára. <b>Válassz mutatót</b>, vagy nézd az összesítést (Japán = 1).</p>';
      var row = U.h('div'); el.appendChild(row);
      U.chips(row, [['all', 'Összesítés']].concat(LJ.map(function (r, i) { return [String(i), r[0].split(',')[0]]; })), S.i, function (v) { S.i = v; st.set(S); P.render(); }, 'Mutató');
      var P = U.plot(el, { ratio: function (w) { return S.i === 'all' ? (w < 520 ? 1.05 : 0.6) : (w < 520 ? 0.45 : 0.25); }, minH: 140, maxH: 460, label: 'Összehasonlító oszlopdiagram' });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var REG = [['Japán', 'var(--ix-3)'], ['USA', 'var(--ix-2)'], ['Európa', 'var(--ix-1)']];
      P.draw = function (w, h) {
        var o = '';
        if (S.i === 'all') {
          var x0 = Math.min(230, w * 0.44), x1 = w - 36, rh = (h - 30) / LJ.length, mxr = 0, maxc = Math.floor((x0 - 10) / 5.6);
          LJ.forEach(function (r) { mxr = Math.max(mxr, r[2] / r[1], r[3] / r[1]); });
          var sx = U.scale(1, Math.max(3, mxr * 1.15), x0, x1, true);
          [2, 5, 10, 20].forEach(function (t) { if (t < mxr * 1.15) o += '<line class="grid" x1="' + sx(t).toFixed(1) + '" x2="' + sx(t).toFixed(1) + '" y1="4" y2="' + (h - 22) + '"/><text class="tk" x="' + sx(t).toFixed(1) + '" y="' + (h - 8) + '" text-anchor="middle">×' + t + '</text>'; });
          LJ.forEach(function (r, i) {
            var y = 8 + i * rh;
            o += '<text class="sm" x="' + (x0 - 6) + '" y="' + (y + rh / 2 + 3).toFixed(1) + '" text-anchor="end">' + esc(r[0].length > maxc ? r[0].slice(0, maxc - 1) + '…' : r[0]) + '</text>';
            [2, 3].forEach(function (k) { var v = r[k] / r[1]; o += '<rect x="' + x0 + '" y="' + (y + 3 + (k - 2) * (rh - 6) / 2).toFixed(1) + '" width="' + Math.max(1, sx(v) - x0).toFixed(1) + '" height="' + ((rh - 6) / 2 - 1).toFixed(1) + '" style="fill:' + REG[k - 1][1] + ';fill-opacity:.7"/>'; });
            o += '<text class="tk" x="' + (sx(Math.max(r[2], r[3]) / r[1]) + 4).toFixed(1) + '" y="' + (y + rh / 2 + 3).toFixed(1) + '">×' + fmt(Math.max(r[2], r[3]) / r[1], 1) + '</text>';
          });
          o += '<line x1="' + x0 + '" x2="' + x0 + '" y1="4" y2="' + (h - 22) + '" style="stroke:var(--ix-3);stroke-width:2.5"/><text class="tk" x="' + x0 + '" y="' + (h - 8) + '" text-anchor="middle" style="fill:var(--ix-3)">Japán = 1</text>';
        } else {
          var r = LJ[+S.i], mx = Math.max(r[1], r[2], r[3]), bx0 = 80, bx1 = w - 60, s2 = U.scale(0, mx * 1.05, bx0, bx1), bh = (h - 20) / 3;
          REG.forEach(function (g, k) { var y = 8 + k * bh; o += '<text class="sm" x="' + (bx0 - 8) + '" y="' + (y + bh / 2 + 4).toFixed(1) + '" text-anchor="end" style="font-weight:600">' + g[0] + '</text><rect x="' + bx0 + '" y="' + (y + 5).toFixed(1) + '" width="' + (s2(r[k + 1]) - bx0).toFixed(1) + '" height="' + (bh - 10).toFixed(1) + '" rx="3" style="fill:' + g[1] + ';fill-opacity:.7"/><text class="lb" x="' + (s2(r[k + 1]) + 6).toFixed(1) + '" y="' + (y + bh / 2 + 4).toFixed(1) + '">' + fmt(r[k + 1], r[k + 1] < 10 && r[k + 1] % 1 ? 1 : 0) + '</text>'; });
        }
        P.svg.innerHTML = o;
        if (S.i === 'all') out.innerHTML = '<h4><small>Minden mutatónál kisebb a jobb</small>A lean gyártók előnye</h4><p>Az oszlopok az amerikai és az európai értéket a japánhoz viszonyítva mutatják (logaritmikus skálán; a zöld vonal a japán érték). A lean nem a high-tech-en múlik: a titkos kulcs a dolgozók — teamekbe szervezve, teljes felelősséggel (karbantartás, minőségellenőrzés, javítás), magasabb képzéssel; kevesebb, szorosabban együttműködő beszállító.</p><div class="ix-legend">' + REG.map(function (g) { return '<span><i style="background:' + g[1] + '"></i>' + g[0] + '</span>'; }).join('') + '</div>';
        else { var q = LJ[+S.i]; out.innerHTML = '<h4><small>' + esc(q[0]) + '</small>USA ×' + fmt(q[2] / q[1], 1) + ' · Európa ×' + fmt(q[3] / q[1], 1) + ' a japánhoz képest</h4><p>A rövid, Just-in-Time átfutás feleslegessé teszi a raktárkészleteket, és ami fontosabb: a problémákat tudatosan feltárja — a tömeggyártás készlethegyei ezzel szemben elrejtik őket.</p>'; }
      };
      P.render();
    },
  });
})();

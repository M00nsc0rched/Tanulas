/*
 * Gépész záróvizsga tételtár — interaktív ábrák a B/14, B/16, B/17 és B/18 tételekhez
 * (a szerelés helye a gyártásban, szerelési rendszerek, szervezési formák és családfa, szerelhetőség).
 * Források: a Szereléstechnológia tárgy előadásai, Dudás: Gyártási folyamatok és rendszerek (szerelési folyamatok),
 * Szigeti: Gyártástechnológia (gyártmány és elemei). Az ábrák saját rajzok, a példatermékek és időadatok szemléltetők.
 */
(function () {
  'use strict';
  if (!window.AVIX) return;
  var U = AVIX.U, fmt = U.fmt, esc = U.esc;

  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function alive(el) { return document.body.contains(el) && el.offsetParent !== null; }
  function btnRow(parent, items) {
    var r = U.h('div', 'ix-row'); parent.appendChild(r);
    r.innerHTML = items.map(function (it) { return '<button type="button" class="ix-btn" data-a="' + it[0] + '">' + it[1] + '</button>'; }).join('');
    return r;
  }

  /* ================================================================== */
  /* B/14 — termék-hierarchia                                            */
  /* ================================================================== */
  var LV = {
    GYM: ['Gyártmány', 'A gyártási folyamat végeredménye; csomagolással együtt forgalmazható termék.', [1, 1, 1]],
    SZE: ['Szerelési (szerkezeti) egység', 'A gyártmány konstrukciós és szerelési szempontból önálló része, önálló funkcióval; a többi résztől függetlenül szerelhető és kipróbálható.', [1, 1, 1]],
    FCS: ['Részegység, főcsoport', 'A szerelési egység kisebb, funkcionálisan még működő része; külön összeszerelhető és ellenőrizhető.', [1, 1, 1]],
    ACS: ['Alcsoport, szerelési alegység', 'Előreszerelhető alkatrészcsoport, de a funkciója csak a főcsoportba beépítve értelmezhető.', [1, 0, 1]],
    AR: ['Alkatrész', 'Tovább nem bontható elem; sem oldható, sem oldhatatlan kötést nem tartalmaz.', [0, 0, 0]],
  };
  var TREE = [
    ['GYM', 'Személygépkocsi', 0], ['SZE', 'Motor', 1], ['FCS', 'Indítómotor', 2], ['ACS', 'Forgórész (tengely + tekercs)', 3], ['AR', 'Forgórész-tengely', 4], ['ACS', 'Állórész', 3],
    ['FCS', 'Porlasztó', 2], ['SZE', 'Sebességváltó', 1], ['FCS', 'Kapcsolószerkezet', 2], ['FCS', 'Tengelycsoport', 2], ['ACS', 'Tengely fogaskerekekkel', 3], ['AR', 'Fogaskerék', 4], ['AR', 'Tengely', 4],
  ];
  var LVCOL = { GYM: 'var(--ix-5)', SZE: 'var(--ix-1)', FCS: 'var(--ix-2)', ACS: 'var(--ix-3)', AR: 'var(--ix-4)' };
  AVIX.def('termekfa', {
    title: 'A gépipari termék hierarchiája',
    sub: 'GYM → SZE → FCS → ACS → AR — koppints egy elemre, és nézd meg, mi alapján melyik szint',
    mount: function (el) {
      var st = U.store('termekfa', { sel: 2 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A gyártmány felülről lefelé egyre kisebb egységekre bontható. A szinteket három kérdés választja szét: <b>önállóan szerelhető-e</b>, <b>van-e önálló funkciója</b> (kipróbálható-e), és <b>tartalmaz-e kötést</b>. Koppints a fa egy elemére.</p>';
      var P = U.plot(el, { ratio: function () { return 0.1; }, minH: 26 * TREE.length + 24, maxH: 26 * TREE.length + 24, label: 'Termékfa' });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var top = 14, rh = 26;
      P.svg.addEventListener('click', function (e) { var y = P.at(e)[1], i = Math.floor((y - top + 4) / rh); if (i >= 0 && i < TREE.length) { S.sel = i; st.set(S); P.render(); } });
      P.svg.style.cursor = 'pointer';
      P.draw = function (w, h) {
        var ind = w < 520 ? 20 : 34, o = '';
        TREE.forEach(function (t, i) {
          var y = top + i * rh, x = 10 + t[2] * ind;
          if (t[2] > 0) {
            for (var j = i - 1; j >= 0; j--) if (TREE[j][2] === t[2] - 1) break;
            var px = 10 + (t[2] - 1) * ind + 14, py = top + j * rh + 18;
            o += '<path d="M' + px + ',' + py + 'V' + (y + 9) + 'H' + x + '" style="fill:none;stroke:var(--rule-2)"/>';
          }
          var on = i === S.sel, col = LVCOL[t[0]];
          if (on) o += '<rect x="2" y="' + (y - 3) + '" width="' + (w - 4) + '" height="' + (rh - 2) + '" rx="5" style="fill:var(--acc);fill-opacity:.1"/>';
          o += '<rect x="' + x + '" y="' + y + '" width="38" height="18" rx="4" style="fill:' + col + ';fill-opacity:' + (on ? 0.85 : 0.35) + '"/><text class="sm" x="' + (x + 19) + '" y="' + (y + 13) + '" text-anchor="middle" style="font-weight:700;fill:' + (on ? 'var(--surface)' : 'var(--ink)') + '">' + t[0] + '</text>';
          o += '<text x="' + (x + 46) + '" y="' + (y + 13) + '"' + (on ? ' style="font-weight:700;fill:var(--ink)"' : '') + '>' + esc(t[1]) + '</text>';
        });
        P.svg.innerHTML = o;
        var t = TREE[S.sel], L = LV[t[0]], q = ['Önállóan szerelhető', 'Önálló funkció, kipróbálható', 'Kötést tartalmaz'];
        out.innerHTML = '<h4><small>' + t[0] + ' · ' + L[0] + '</small>' + esc(t[1]) + '</h4><p>' + L[1] + '</p>' +
          U.kv(q.map(function (s, i) { return [s, L[2][i] ? '✓ igen' : '✗ nem', i === 1 && t[0] === 'ACS' ? 'a funkciója csak a főcsoporton belül értelmezhető' : i === 2 && t[0] === 'AR' ? 'ha kötés van benne, az már alegység' : '']; }));
      };
      P.render();
      U.quiz(el, [
        { q: 'Melyik szint a <b>sebességváltó</b> egy autóban?', opts: ['szerelési (szerkezeti) egység', 'alcsoport', 'alkatrész', 'gyártmány'], a: 0, why: 'Önálló funkciója van, a motor és a karosszéria nélkül is szerelhető és kipróbálható.' },
        { q: 'Két lemez csavarral összefogva — mi ez?', opts: ['szerelvény (alegység)', 'alkatrész', 'gyártmány', 'nem értelmezhető'], a: 0, why: 'Az alkatrész nem tartalmaz kötést; ha kötés van benne, az már szerelvény.' },
        { q: '<b>Tengely fogaskerekekkel</b> — mi ez a szint?', opts: ['alcsoport (szerelési alegység)', 'főcsoport', 'szerelési egység', 'alkatrész'], a: 0, why: 'Előreszerelhető, de funkciója csak a főcsoportba beépítve értelmezhető.' },
        { q: 'Melyik a TF három részfolyamata?', opts: ['előgyártás, alkatrész-megmunkálás, szerelés', 'tervezés, gyártás, értékesítés', 'öntés, forgácsolás, hegesztés', 'művelet, műveletelem, fogás'], a: 0, why: 'EGYTF → előgyártmány, ARMTF → alkatrész, SZTF → FCS, SZE, GYM.' },
        { q: 'Mi a különbség a GYF és a TF között?', opts: ['a TF a GYF-nek a minőséget meghatározó állapotváltozásokhoz kötődő része', 'a TF a teljes gyártási folyamat', 'a GYF csak a szerelést jelenti', 'nincs különbség'], a: 0, why: 'A gyártási folyamat minden tevékenység; a technológiai folyamat a közvetlen állapotváltozásokat írja le.' },
      ], { title: 'Gyakorlás: melyik szint?' });
    },
  });

  /* ================================================================== */
  /* B/14 — alkatrészgyártás és szerelés összehasonlítása                */
  /* ================================================================== */
  var GY = [['nyers darab (előgyártmány)', 4.2], ['nagyoló esztergálás', 3.4], ['fúrás', 3.1], ['horonymarás', 3.0], ['köszörülés', 2.95]];
  var SZ = [['bázis: ház', 1.8, 0], ['+ tengely csapágyakkal (előszerelve)', 2.9, 0.05], ['+ fogaskerék', 3.4, 0.09], ['+ fedél', 3.9, 0.14], ['+ csavarok, ellenőrzés', 4.0, 0.16]];
  AVIX.def('gyarszer', {
    title: 'Alkatrészgyártás és szerelés: miben más?',
    sub: 'Lépésről lépésre: a munkadarab tömege, a pontosság, a párhuzamosíthatóság és a visszafordíthatóság',
    mount: function (el) {
      var st = U.store('gyarszer', { k: 2, rev: false }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Bal oldalon egy tengely megmunkálása, jobb oldalon egy hajtómű-egység szerelése, ugyanannyi lépésben. Figyeld a <b>tömeget</b>, a <b>tűréseket</b>, a <b>párhuzamos ágat</b>, és próbáld meg <b>visszafelé</b> is végigjátszani.</p>';
      var P = U.plot(el, { ratio: function (w) { return w < 700 ? 1.05 : 0.42; }, minH: 260, maxH: 480, label: 'Alkatrészgyártás és szerelés' });
      var g = U.sliders(el);
      var sl = U.slider(g, { label: 'Lépés', min: 0, max: 4, step: 1, value: S.k, dec: 0, onInput: function (v) { S.k = v; st.set(S); P.render(); } });
      var br = btnRow(el, [['rev', '↺ Visszafelé (szétszerelés)']]);
      br.addEventListener('click', function () { S.rev = !S.rev; st.set(S); P.render(); });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var narrow = w < 700, pw = narrow ? w : w / 2, ph = narrow ? h / 2 : h, o = '', k = S.k;
        // bal/felső: alkatrész
        var x0 = 20, cy = ph * 0.46, L = pw - 60, R0 = Math.min(ph * 0.22, 40);
        o += '<text class="lb sm" x="' + x0 + '" y="16">Alkatrészgyártás — ' + esc(GY[k][0]) + '</text>';
        var cut = k >= 1;
        var rA = cut ? 0.72 : 1, rB = cut ? 0.55 : 1;
        o += '<path d="M' + x0 + ',' + (cy - R0) + 'H' + (x0 + L) + 'V' + (cy + R0) + 'H' + x0 + 'Z" style="fill:' + (cut ? 'var(--ix-5)' : 'var(--ix-8)') + ';fill-opacity:' + (cut ? 0.12 : 0.35) + ';stroke:var(--rule-2);stroke-dasharray:' + (cut ? '3 3' : '0') + '"/>';
        if (cut) o += '<path d="M' + x0 + ',' + (cy - R0 * rA) + 'H' + (x0 + L * 0.55) + 'V' + (cy - R0 * rB) + 'H' + (x0 + L) + 'V' + (cy + R0 * rB) + 'H' + (x0 + L * 0.55) + 'V' + (cy + R0 * rA) + 'H' + x0 + 'Z" style="fill:var(--ix-8);fill-opacity:.4;stroke:var(--ink);stroke-width:1.4"/>';
        if (k >= 2) o += '<rect x="' + x0 + '" y="' + (cy - R0 * 0.18) + '" width="' + (L * 0.3) + '" height="' + (R0 * 0.36) + '" style="fill:var(--surface);stroke:var(--ink)"/>';
        if (k >= 3) o += '<rect x="' + (x0 + L * 0.7) + '" y="' + (cy - R0 * rB) + '" width="' + (L * 0.18) + '" height="' + (R0 * 0.2) + '" style="fill:var(--surface);stroke:var(--ink)"/>';
        if (k >= 4) o += '<path d="M' + (x0 + L * 0.55) + ',' + (cy - R0 * rB - 3) + 'H' + (x0 + L) + '" style="stroke:var(--acc);stroke-width:3"/>';
        // forgácskupac
        var chips = Math.round((GY[0][1] - GY[k][1]) * 14);
        for (var i = 0; i < chips; i++) { var cx = x0 + 12 + (i * 23) % (L - 20), cyy = cy + R0 + 20 + ((i * 7) % 3) * 5; o += '<path d="M' + cx + ',' + cyy + 'q4,-6 8,0 q4,6 8,0" style="fill:none;stroke:var(--ix-5);stroke-width:1.4"/>'; }
        if (chips) o += '<text class="tk" x="' + x0 + '" y="' + (cy + R0 + 44) + '">forgács: ' + fmt(GY[0][1] - GY[k][1], 2) + ' kg — ' + (S.rev ? '<tspan style="fill:var(--ix-5)">nem kerül vissza</tspan>' : 'irreverzibilis') + '</text>';
        o += '<text class="la sm" x="' + (x0 + L) + '" y="' + (cy - R0 - 8) + '" text-anchor="end">' + fmt(GY[k][1], 2) + ' kg ↓</text>';
        // jobb/alsó: szerelés
        var ox = narrow ? 0 : pw, oy = narrow ? ph : 0, bx = ox + 20, by = oy + ph * 0.3, bw = (pw - 60);
        o += '<text class="lb sm" x="' + bx + '" y="' + (oy + 16) + '">Szerelés — ' + esc(S.rev ? 'szétszerelés' : SZ[k][0]) + '</text>';
        var blocks = [['ház', 0.45], ['tengely + csapágyak', 0.2], ['fogaskerék', 0.12], ['fedél', 0.12], ['csavarok', 0.06]];
        var bxx = bx, bh = ph * 0.26;
        blocks.forEach(function (b, i) {
          var on = i <= k, bwid = bw * b[1];
          // visszafelé: a már beszerelt elemek (a ház kivételével) szétszerelve, épen, újra felhasználhatóan
          var apart = S.rev && on && i > 0, yy = apart ? by + bh + 18 : on ? by : by + bh + 18;
          o += '<rect x="' + (bxx + (apart ? 4 : 0)).toFixed(1) + '" y="' + yy.toFixed(1) + '" width="' + (bwid - (apart ? 8 : 2)).toFixed(1) + '" height="' + (on ? bh : bh * 0.6).toFixed(1) + '" rx="3" style="fill:var(--ix-' + (i + 1) + ');fill-opacity:' + (on ? 0.5 : 0.15) + ';stroke:var(--ink);stroke-width:' + (on ? 1.2 : 0.6) + ';stroke-dasharray:' + (on ? '0' : '3 3') + '"/>';
          if (bwid > 38) o += '<text class="tk" x="' + (bxx + bwid / 2).toFixed(1) + '" y="' + (yy + (on ? bh / 2 : bh * 0.3) + 4).toFixed(1) + '" text-anchor="middle">' + b[0] + '</text>';
          bxx += bwid;
        });
        if (S.rev && k > 0) o += '<text class="tk" x="' + bx + '" y="' + (oy + ph - 24) + '" style="fill:var(--ix-3)">szétszerelve — az alkatrészek épek, újra szerelhetők</text>';
        if (k >= 1 && !S.rev) { var ex = bx + bw * 0.55; o += '<rect x="' + (ex - 15).toFixed(1) + '" y="' + (by - 30) + '" width="30" height="14" rx="3" style="fill:var(--ix-2);fill-opacity:.5;stroke:var(--ink);stroke-width:.8"/><text class="tk" x="' + ex.toFixed(1) + '" y="' + (by - 19) + '" text-anchor="middle">E1</text><path d="M' + ex.toFixed(1) + ',' + (by - 16) + 'v12" style="stroke:var(--ix-2);stroke-width:1.6"/><text class="tk" x="' + (ex + 20).toFixed(1) + '" y="' + (by - 20) + '">párhuzamos előszerelés</text>'; }
        o += '<text class="la sm" x="' + bx + '" y="' + (by - 8) + '">' + fmt(SZ[k][1], 2) + ' kg ↑</text>';
        o += '<text class="tk" x="' + bx + '" y="' + (oy + ph - 10) + '">záró tag tűrése: ±' + fmt(SZ[k][2] / 2, 3) + ' mm (Σ összegződik)</text>';
        if (narrow) o += '<line x1="10" x2="' + (w - 10) + '" y1="' + ph + '" y2="' + ph + '" style="stroke:var(--rule)"/>';
        P.svg.innerHTML = o;
        out.innerHTML = U.kv([
          ['Tömeg', 'gyártás: ' + fmt(GY[k][1], 2) + ' kg ↓ · szerelés: ' + fmt(SZ[k][1], 2) + ' kg ↑', 'a szerelésnél a munka tárgyának tömege, mérete műveletről műveletre nő'],
          ['Folyamat', 'gyártás: soros · szerelés: párhuzamosítható', 'az előszerelés térben és időben elkülönítve végezhető'],
          ['Pontosság', 'gyártás: egy-egy méret tűrése · szerelés: a tűrések összegződnek', 'ezért kell méretlánc és záró tag (B/15)'],
          ['Visszafordíthatóság', S.rev ? '<b>gyártás: nem · szerelés: igen</b>' : 'gyártás: irreverzibilis · szerelés: reverzibilis', 'a forgács nem kerül vissza; az oldható kötések szétszerelhetők'],
          ['Eszközök', 'gyártás: univerzális gépek is · szerelés: eljárásfüggő', 'a szerelés gépei, szerszámai a szerelési eljáráshoz igazodnak']]);
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/14 — gazdaságos pontosság                                         */
  /* ================================================================== */
  AVIX.def('koltseg', {
    title: 'Gazdaságos pontosság: alkatrész- és szerelési költség',
    sub: 'Szigorúbb tűrés → drágább alkatrész, olcsóbb szerelés — hol van az összköltség minimuma?',
    mount: function (el) {
      var st = U.store('koltseg', { a: 1, b: 1, t: 40 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Szigorú alkatrésztűrésnél a megmunkálás drága, de a szerelés egyszerű (teljes cserélhetőség). Tág tűrésnél fordítva: olcsó alkatrész, de válogatás, illesztés, beállítás kell. <b>Az összköltség minimuma</b> adja a gazdaságos pontosságot. (Szemléltető költségmodell.)</p>';
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.78 : 0.44; }, minH: 250, maxH: 340, label: 'Költség a tűrés függvényében' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Megmunkálás drágasága', min: 0.4, max: 2.5, step: 0.1, value: S.a, dec: 1, fmt: function (v) { return fmt(v, 1) + '×'; }, onInput: function (v) { S.a = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Szerelési, illesztési munka díja', min: 0.4, max: 2.5, step: 0.1, value: S.b, dec: 1, fmt: function (v) { return fmt(v, 1) + '×'; }, onInput: function (v) { S.b = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Választott tűrés T', min: 5, max: 200, step: 1, value: S.t, unit: 'µm', dec: 0, onInput: function (v) { S.t = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function Ka(T) { return S.a * 60 * Math.pow(50 / T, 0.9); }
      function Kb(T) { return S.b * (8 + 40 * Math.pow(T / 50, 1.1)); }
      P.draw = function (w, h) {
        var gx0 = 48, gx1 = w - 14, gy0 = h - 36, gy1 = 20, sx = U.scale(5, 200, gx0, gx1, true), best = 5, bv = 1e9, o = '';
        for (var T = 5; T <= 200; T += 0.5) { var v = Ka(T) + Kb(T); if (v < bv) { bv = v; best = T; } }
        var ymax = Math.min(600, Math.max(Ka(5) + Kb(5), Ka(200) + Kb(200)) * 0.7), sy = U.scale(0, ymax, gy0, gy1);
        o += U.axes({ x0: gx0, x1: gx1, y0: gy1, y1: gy0, sx: sx, sy: sy, xt: [5, 10, 20, 50, 100, 200], yt: [0, Math.round(ymax / 2)], xl: 'alkatrésztűrés T, µm (log)', yl: 'költség' });
        (w < 520 ? [[15, 'teljes'], [60, 'válogatás'], [200, 'illesztés']] : [[15, 'teljes cser.'], [60, 'válogatás / részleges'], [200, 'illesztés, beszabályozás']]).forEach(function (z, i, a) { var xa = sx(i ? a[i - 1][0] : 5), xb = sx(z[0]); o += '<rect x="' + xa.toFixed(1) + '" y="' + gy1 + '" width="' + (xb - xa).toFixed(1) + '" height="' + (gy0 - gy1) + '" style="fill:var(--ix-' + (i + 2) + ');fill-opacity:.07"/><text class="tk" x="' + ((xa + xb) / 2).toFixed(1) + '" y="' + (gy1 + 12) + '" text-anchor="middle">' + z[1] + '</text>'; });
        function curve(f, col, dash) { var p = []; for (var T = 5; T <= 200; T *= 1.03) p.push([sx(T), sy(Math.min(ymax, f(T)))]); return '<path d="M' + p.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join('L') + '" style="fill:none;stroke:' + col + ';stroke-width:2.2' + (dash ? ';stroke-dasharray:6 4' : '') + '"/>'; }
        o += curve(Ka, 'var(--ix-1)', 1) + curve(Kb, 'var(--ix-2)', 1) + curve(function (T) { return Ka(T) + Kb(T); }, 'var(--acc)');
        o += '<line x1="' + sx(best).toFixed(1) + '" x2="' + sx(best).toFixed(1) + '" y1="' + gy1 + '" y2="' + gy0 + '" style="stroke:var(--acc);stroke-dasharray:3 3"/><circle cx="' + sx(best).toFixed(1) + '" cy="' + sy(bv).toFixed(1) + '" r="5" class="mk"/>';
        o += '<circle cx="' + sx(S.t).toFixed(1) + '" cy="' + sy(Math.min(ymax, Ka(S.t) + Kb(S.t))).toFixed(1) + '" r="5" style="fill:var(--ink)"/>';
        var lx = w < 520 ? gx0 + 8 : gx1 - 190;
        o += '<text class="tk" x="' + lx + '" y="' + (gy1 + 30) + '" style="fill:var(--ix-1)">— alkatrészgyártás</text><text class="tk" x="' + lx + '" y="' + (gy1 + 44) + '" style="fill:var(--ix-2)">— szerelés</text><text class="tk" x="' + lx + '" y="' + (gy1 + 58) + '" style="fill:var(--acc)">— összesen</text>';
        P.svg.innerHTML = o;
        var cur = Ka(S.t) + Kb(S.t);
        out.innerHTML = '<h4><small>optimum</small>T* ≈ ' + fmt(best, 0) + ' µm, összköltség ' + fmt(bv, 0) + ' egység</h4>' +
          U.kv([['Választott tűrés', fmt(S.t, 0) + ' µm → ' + fmt(cur, 0) + ' egység', cur > bv * 1.1 ? 'kb. ' + fmt((cur / bv - 1) * 100, 0) + ' %-kal drágább az optimumnál' : 'az optimum közelében'],
            ['Hatás', 'drágább megmunkálás → az optimum tágabb tűrés felé tolódik', 'drágább szerelés → szigorúbb alkatrésztűrés felé']]);
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/16 — a szerelés tárgyának mozgása (animáció)                      */
  /* ================================================================== */
  var MOZ = {
    allo: ['Álló szerelés', 'A gyártmány egy helyen áll, a szerelők és az eszközök mozognak hozzá.', 'nagy, nehéz, kis darabszámú termék: szerszámgép, turbina, generátor'],
    eset: ['Esetenként mozgó', 'A gyártmány a szerelés során csak néhányszor változtat helyet.', 'szerszámgépek, hajók'],
    szak: ['Szakaszosan mozgó', 'A fődarab állomásról állomásra halad, de a művelet idejére megáll.', 'sorozatgyártás, ütemezett sor'],
    foly: ['Folyamatosan mozgó', 'A gyártmány egyenletes sebességgel halad; a műveleteket mozgás közben végzik.', 'nagy sorozat, pl. autószerelés'],
  };
  AVIX.def('mozgas', {
    title: 'A szerelés tárgyának mozgása',
    sub: 'Álló, esetenként mozgó, szakaszosan és folyamatosan mozgó szerelés — animációval',
    mount: function (el) {
      var st = U.store('mozgas', { m: 'szak' }), S = st.get(), t = 0, last = 0, run = !U.reduce, raf = 0;
      el.innerHTML = '<p class="ix-lead">A négy forma abban különbözik, hogy <b>a gyártmány vagy a szerelő mozog</b>, és a gyártmány mozog-e a művelet alatt. A négyzet a gyártmány, a kör a szerelő, a szürke sáv a munkahely.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, Object.keys(MOZ).map(function (k) { return [k, MOZ[k][0]]; }), S.m, function (v) { S.m = v; t = 0; st.set(S); P.render(); }, 'Forma');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.62 : 0.3; }, minH: 190, maxH: 250, label: 'Mozgásforma animáció' });
      var br = btnRow(el, [['run', run ? '❚❚ Szünet' : '▶ Indítás']]);
      br.addEventListener('click', function () { run = !run; br.querySelector('button').textContent = run ? '❚❚ Szünet' : '▶ Indítás'; if (run) { last = 0; raf = requestAnimationFrame(loop); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var n = 4, x0 = 30, x1 = w - 30, sw = (x1 - x0) / n, yb = h * 0.62, o = '', m = S.m, ph = t % 8;
        for (var i = 0; i < n; i++) o += '<rect x="' + (x0 + i * sw + 4).toFixed(1) + '" y="' + (yb - 50) + '" width="' + (sw - 8).toFixed(1) + '" height="70" rx="6" style="fill:var(--surface-2);stroke:var(--rule)"/><text class="tk" x="' + (x0 + (i + 0.5) * sw).toFixed(1) + '" y="' + (yb + 34) + '" text-anchor="middle">' + (m === 'allo' ? ['anyag', 'szerelés', 'szerszám', 'ellenőrzés'][i] : (i + 1) + '. munkahely') + '</text>';
        if (m !== 'allo' && m !== 'eset') o += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + (yb + 16) + '" y2="' + (yb + 16) + '" style="stroke:var(--ink);stroke-width:2"/>';
        function prod(x, lab, big) { var s = big ? 40 : 26; return '<rect x="' + (x - s / 2).toFixed(1) + '" y="' + (yb - s + 12) + '" width="' + s + '" height="' + s + '" rx="3" style="fill:var(--acc);fill-opacity:.55;stroke:var(--ink)"/>' + (lab ? '<text class="tk" x="' + x.toFixed(1) + '" y="' + (yb - s + 4) + '" text-anchor="middle">' + lab + '</text>' : ''); }
        function man(x, y) { return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="7" style="fill:var(--ix-2);stroke:var(--surface);stroke-width:1.5"/>'; }
        var cxs = function (i) { return x0 + (i + 0.5) * sw; };
        if (m === 'allo') {
          o += prod(cxs(1), 'gyártmány', true);
          [0, 2, 3].forEach(function (j, k) { var f = (Math.sin((t * 0.9 + k * 2.1)) + 1) / 2, x = cxs(j) + (cxs(1) - cxs(j)) * f; o += man(x, yb - 62 - k * 3); });
        } else if (m === 'eset') {
          // 12 s-os ciklus: 3 helyen áll hosszan, közben kétszer átmozgatják
          var c12 = t % 12, xs3 = [cxs(0), (cxs(1) + cxs(2)) / 2, cxs(3)], xp;
          if (c12 < 3.5) xp = xs3[0]; else if (c12 < 4.5) xp = xs3[0] + (xs3[1] - xs3[0]) * (c12 - 3.5); else if (c12 < 8) xp = xs3[1]; else if (c12 < 9) xp = xs3[1] + (xs3[2] - xs3[1]) * (c12 - 8); else xp = xs3[2];
          var moving = (c12 >= 3.5 && c12 < 4.5) || (c12 >= 8 && c12 < 9);
          o += prod(xp, '', true);
          if (!moving) o += man(xp - 34 + Math.sin(t * 2) * 6, yb - 62) + man(xp + 34 - Math.sin(t * 2) * 6, yb - 62);
          o += '<text class="tk" x="' + (w / 2) + '" y="16" text-anchor="middle">' + (moving ? 'helyváltoztatás (daru, targonca)' : 'szerelés egy helyben') + '</text>';
        } else if (m === 'szak') {
          var cyc = 2.5, k = t / cyc, fk = k - Math.floor(k), move = fk > 0.7 ? (fk - 0.7) / 0.3 : 0;
          for (var p = -1; p < n; p++) { var x = cxs(p) + move * sw; if (x > x0 - 10 && x < x1 + 10) o += prod(x, ''); }
          for (var s = 0; s < n; s++) { o += man(cxs(s), yb - 62); if (!move) o += '<rect x="' + (cxs(s) - 18).toFixed(1) + '" y="' + (yb - 44) + '" width="' + (36 * fk / 0.7).toFixed(1) + '" height="4" style="fill:var(--ix-3)"/>'; }
          o += '<text class="tk" x="' + (w / 2) + '" y="16" text-anchor="middle">' + (move ? 'továbbítás (a művelet szünetel)' : 'művelet — a gyártmány áll') + '</text>';
        } else {
          var v = sw / 3, off = (t * v) % sw;
          for (var q = -1; q < n + 1; q++) { var xq = x0 + q * sw + off; if (xq > x0 - 20 && xq < x1 + 20) o += prod(xq, ''); }
          for (var r = 0; r < n; r++) { var fr2 = (t / 3) % 1, xm = cxs(r) - sw * 0.35 + fr2 * sw * 0.7; o += man(xm, yb - 62); }
          o += '<text class="tk" x="' + (w / 2) + '" y="16" text-anchor="middle">a szerelő a gyártmánnyal együtt halad, majd visszalép</text>';
        }
        P.svg.innerHTML = o;
        var M = MOZ[m];
        out.innerHTML = '<h4><small>' + M[0] + '</small>' + M[1] + '</h4>' + U.kv([['Tipikus alkalmazás', M[2], ''], ['Mi mozog?', m === 'allo' ? 'a szerelő és az eszközök' : m === 'foly' ? 'a gyártmány folyamatosan, a szerelő vele' : 'a gyártmány (' + (m === 'eset' ? 'ritkán' : 'szakaszosan') + ')', m === 'szak' ? 'a leghosszabb művelet szabja meg az ütemidőt' : '']]);
      };
      function loop(ts) {
        if (!run || !alive(el)) { raf = 0; return; }
        var dt = last ? Math.min(0.1, (ts - last) / 1000) : 0; last = ts; t += dt; P.render(); raf = requestAnimationFrame(loop);
      }
      P.render();
      if (run) raf = requestAnimationFrame(loop);
    },
  });

  /* ================================================================== */
  /* B/16 — sorkiegyenlítés                                              */
  /* ================================================================== */
  var TASK = [['A', 'Ház befogása', 15, []], ['B', 'Retesz a tengelyre', 10, []], ['C', 'Fogaskerék felsajtolása', 35, ['B']], ['D', 'Csapágyak felsajtolása', 40, ['C']], ['E', 'Tengely beépítése', 25, ['A', 'D']],
    ['F', 'Biztosítógyűrű', 10, ['E']], ['G', 'Tömítés, fedél', 30, ['F']], ['H', 'Csavarozás (4 db)', 40, ['G']], ['I', 'Olajtöltés', 20, ['H']], ['J', 'Próbajáratás', 45, ['I']]];
  function balance(tu) {
    var by = {}, succ = {}, w = {};
    TASK.forEach(function (t) { by[t[0]] = t; succ[t[0]] = []; });
    TASK.forEach(function (t) { t[3].forEach(function (p) { succ[p].push(t[0]); }); });
    function W(k) { if (w[k] != null) return w[k]; var seen = {}, s = 0; (function walk(x) { succ[x].forEach(function (y) { if (!seen[y]) { seen[y] = 1; s += by[y][2]; walk(y); } }); })(k); return (w[k] = by[k][2] + s); }
    var order = TASK.map(function (t) { return t[0]; }).sort(function (a, b) { return W(b) - W(a); });
    var done = {}, st = [], cur = null;
    while (Object.keys(done).length < TASK.length) {
      if (!cur) { cur = { t: 0, tasks: [] }; st.push(cur); }
      var pick = null;
      for (var i = 0; i < order.length; i++) {
        var k = order[i]; if (done[k]) continue;
        if (!by[k][3].every(function (p) { return done[p]; })) continue;
        if (cur.t + by[k][2] <= tu + 1e-9 || cur.tasks.length === 0) { pick = k; break; }
      }
      if (!pick) { cur = null; continue; }
      cur.tasks.push(pick); cur.t += by[pick][2]; done[pick] = 1;
      if (cur.t >= tu) cur = null;
    }
    return st;
  }
  AVIX.def('utemsor', {
    title: 'Sorkiegyenlítés: ütemidő, munkahelyszám, hatékonyság',
    sub: 'Hajtómű-egység szerelése 10 műveletelemből — hány munkahely kell az előírt darabszámhoz?',
    mount: function (el) {
      var st = U.store('utemsor', { N: 400 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Az <b>ütemidő</b> t<sub>ü</sub> = rendelkezésre álló idő / darabszám (itt egy 7,5 órás műszak = 27 000 s). A műveleteket a sorrendi kötöttségek betartásával munkahelyekre osztjuk (legnagyobb pozíciósúly szabálya); egyik munkahely ideje sem lépheti túl az ütemidőt.</p>';
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.82 : 0.42; }, minH: 250, maxH: 330, label: 'Munkahelyek terhelése' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Előírt darabszám / műszak', min: 200, max: 1500, step: 50, value: S.N, unit: 'db', dec: 0, onInput: function (v) { S.N = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var COL = {}; TASK.forEach(function (t, i) { COL[t[0]] = 'var(--ix-' + (i % 8 + 1) + ')'; });
      P.draw = function (w, h) {
        var tu = 27000 / S.N, sum = TASK.reduce(function (a, t) { return a + t[2]; }, 0), nmin = Math.ceil(sum / tu - 1e-9), stn = balance(tu), n = stn.length, eta = sum / (n * tu);
        var maxT = Math.max(tu, Math.max.apply(0, stn.map(function (s) { return s.t; }))) * 1.12, o = '';
        var gx0 = 44, gx1 = w - 12, gy0 = h - 34, gy1 = 18, sy = U.scale(0, maxT, gy0, gy1), bw = Math.min(64, (gx1 - gx0) / n);
        o += U.axes({ x0: gx0, x1: gx1, y0: gy1, y1: gy0, sx: function (v) { return v; }, sy: sy, xt: [], yt: [0, Math.round(maxT / 2), Math.round(maxT)], yl: 's' });
        stn.forEach(function (s, i) {
          var x = gx0 + i * bw + bw * 0.12, y = gy0;
          s.tasks.forEach(function (k) {
            var tk = TASK.filter(function (t) { return t[0] === k; })[0], hh = sy(0) - sy(tk[2]);
            y -= hh;
            o += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (bw * 0.76).toFixed(1) + '" height="' + hh.toFixed(1) + '" style="fill:' + COL[k] + ';fill-opacity:.55;stroke:var(--surface);stroke-width:1"/>';
            if (hh > 12) o += '<text class="sm" x="' + (x + bw * 0.38).toFixed(1) + '" y="' + (y + hh / 2 + 4).toFixed(1) + '" text-anchor="middle" style="font-weight:700">' + k + '</text>';
          });
          o += '<text class="tk" x="' + (x + bw * 0.38).toFixed(1) + '" y="' + (gy0 + 14) + '" text-anchor="middle">' + (i + 1) + '.</text>';
          if (s.t > tu + 1e-9) o += '<text class="la sm" x="' + (x + bw * 0.38).toFixed(1) + '" y="' + (sy(s.t) - 4).toFixed(1) + '" text-anchor="middle" style="fill:var(--ix-5)">!</text>';
        });
        o += '<line x1="' + gx0 + '" x2="' + gx1 + '" y1="' + sy(tu).toFixed(1) + '" y2="' + sy(tu).toFixed(1) + '" style="stroke:var(--ix-5);stroke-width:2;stroke-dasharray:6 4"/><text class="la sm" x="' + (gx1 - 2) + '" y="' + (sy(tu) - 5).toFixed(1) + '" text-anchor="end" style="fill:var(--ix-5)">t<tspan dy="3" style="font-size:.75em">ü</tspan><tspan dy="-3"> = ' + fmt(tu, 1) + ' s</tspan></text>';
        P.svg.innerHTML = o;
        var over = TASK.filter(function (t) { return t[2] > tu; });
        out.innerHTML = '<h4><small class="nc">t<sub>ü</sub> = 27 000 / ' + S.N + ' = ' + fmt(tu, 1) + ' s</small>' + n + ' munkahely, hatékonyság ' + fmt(eta * 100, 0) + ' %</h4>' +
          U.kv([['Elméleti minimum', 'n<sub>min</sub> = ⌈' + sum + ' / ' + fmt(tu, 1) + '⌉ = ' + nmin, n > nmin ? 'a sorrendi kötöttségek és az oszthatatlan műveletek miatt ' + (n - nmin) + ' munkahellyel több kell' : 'elérve'],
            ['Holtidő', fmt(n * tu - sum, 0) + ' s / ütem', 'η = Σt<sub>i</sub> / (n · t<sub>ü</sub>)'],
            ['Szűk keresztmetszet', over.length ? '<b style="color:var(--ix-5)">' + over.map(function (t) { return t[0] + ' (' + t[2] + ' s)'; }).join(', ') + ' hosszabb az ütemidőnél</b>' : 'a leghosszabb művelet (J, 45 s) belefér', over.length ? 'párhuzamos munkahely vagy a művelet megbontása kell' : '']]) +
          '<p class="ix-note">Sorrend: B → C → D; A és D → E → F → G → H → I → J. Szemléltető műveleti idők.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/16 — puffer: merev és rugalmas folyamatos szerelés                */
  /* ================================================================== */
  // Soros sor véges pufferekkel, blokkolás a művelet után: D[j][k] a k. darab távozása a j. állomásról.
  // A k. darab akkor hagyhatja el a j. állomást, ha a (k−B−1). darab már elhagyta a (j+1). állomást.
  function lineSim(B, cv, seed) {
    var m = 4, K = 1500, mu = 60, R = rng(seed), a = Math.sqrt(3) * cv * mu, D = [];
    for (var i = 0; i < m; i++) D.push(new Array(K));
    for (var k = 0; k < K; k++) for (var j = 0; j < m; j++) {
      var p = mu + (2 * R() - 1) * a, arr = j ? D[j - 1][k] : 0, free = k ? D[j][k - 1] : 0, c = Math.max(arr, free) + p;
      D[j][k] = (j < m - 1 && k - B - 1 >= 0) ? Math.max(c, D[j + 1][k - B - 1]) : c;
    }
    var warm = 200;
    return 3600 * (K - warm) / (D[m - 1][K - 1] - D[m - 1][warm - 1]);
  }
  AVIX.def('puffer', {
    title: 'Merev vagy rugalmas? A puffer hatása a szerelősorra',
    sub: '4 állomás, átlag 60 s műveleti idő ingadozással — mennyit ér egy-két tárolóhely az állomások között?',
    mount: function (el) {
      var st = U.store('puffer', { cv: 25, B: 1, seed: 7 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Ha a műveleti idők ingadoznak, puffer nélkül (<b>merev</b> folyamatos szerelés) az állomások hol várnak az előzőre (éhezés), hol nem tudják továbbadni a darabot (blokkolás). A köztes tárolóhelyek (<b>rugalmas</b> folyamatos szerelés) csillapítják ezt — ára a köztes készlet és a hely.</p>';
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.78 : 0.42; }, minH: 240, maxH: 320, label: 'Teljesítmény a pufferméret függvényében' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Műveleti idő ingadozása (CV)', min: 0, max: 50, step: 5, value: S.cv, unit: '%', dec: 0, onInput: function (v) { S.cv = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Puffer az állomások között', min: 0, max: 5, step: 1, value: S.B, unit: 'db', dec: 0, onInput: function (v) { S.B = v; st.set(S); P.render(); } });
      var br = btnRow(el, [['seed', 'Új véletlen sorozat']]);
      br.addEventListener('click', function () { S.seed = Math.floor(Math.random() * 1e6); st.set(S); P.render(); });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var res = [], o = '';
        for (var B = 0; B <= 5; B++) res.push(lineSim(B, S.cv / 100, S.seed));
        var gx0 = 48, gx1 = w - 14, gy0 = h - 34, gy1 = 18, sy = U.scale(30, 62, gy0, gy1), bw = (gx1 - gx0) / 6;
        o += U.axes({ x0: gx0, x1: gx1, y0: gy1, y1: gy0, sx: function (v) { return v; }, sy: sy, xt: [], yt: [30, 40, 50, 60], yl: 'db/óra' });
        o += '<line x1="' + gx0 + '" x2="' + gx1 + '" y1="' + sy(60) + '" y2="' + sy(60) + '" style="stroke:var(--ix-3);stroke-dasharray:5 4"/><text class="tk" x="' + (gx1 - 2) + '" y="' + (sy(60) - 4) + '" text-anchor="end">ideális: 60 db/óra</text>';
        res.forEach(function (r, i) {
          var x = gx0 + i * bw + bw * 0.18, on = i === S.B;
          o += '<rect x="' + x.toFixed(1) + '" y="' + sy(r).toFixed(1) + '" width="' + (bw * 0.64).toFixed(1) + '" height="' + (gy0 - sy(r)).toFixed(1) + '" rx="3" style="fill:' + (i ? 'var(--ix-2)' : 'var(--ix-5)') + ';fill-opacity:' + (on ? 0.85 : 0.35) + '"/>';
          o += '<text class="tk" x="' + (x + bw * 0.32).toFixed(1) + '" y="' + (gy0 + 14) + '" text-anchor="middle">B=' + i + '</text>';
          if (on) o += '<text class="lb sm" x="' + (x + bw * 0.32).toFixed(1) + '" y="' + (sy(r) - 5).toFixed(1) + '" text-anchor="middle">' + fmt(r, 1) + '</text>';
        });
        P.svg.innerHTML = o;
        var r = res[S.B], r0 = res[0];
        out.innerHTML = '<h4><small>' + (S.B ? 'rugalmas folyamatos szerelés' : 'merev folyamatos szerelés (puffer nélkül)') + '</small>' + fmt(r, 1) + ' db/óra (' + fmt(r / 60 * 100, 0) + ' % az ideálisnak)</h4>' +
          U.kv([['Nyereség a merevhez képest', S.B ? '+' + fmt((r / r0 - 1) * 100, 1) + ' %' : '—', 'az első 1–2 tárolóhely hozza a legtöbbet, utána csökkenő a haszon'],
            ['Köztes készlet', 'legfeljebb ' + (S.B * 3) + ' db', '3 puffer × ' + S.B + ' hely — ez a rugalmasság ára (hely, lekötött érték)'],
            ['Ingadozás nélkül', S.cv ? '' : 'minden B mellett 60 db/óra', S.cv ? 'CV = 0-nál a puffer semmit sem ér — a kötött ütem kiegyenlített időknél működik jól' : '']]) +
          '<p class="ix-note">Szimuláció: 1500 darab, egyenletes eloszlású műveleti idők, blokkolás a művelet után. Az eredmény a véletlen sorozattól kissé függ.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/17 — a szerelés szervezési formái                                  */
  /* ================================================================== */
  var SZF = [
    ['Álló munkahelyes', 'intézkedési elvű', 'álló munkahely; előírt munkamegosztás nincs; a szerelő munkás helyhez kötött', '–', 'nagy méret és súly: nagy motorok, tartályok, nagy szerszámgépek'],
    ['Csoportszerű', 'intézkedési elvű', 'álló munkahely; előírt munkamegosztás; a szerelő a munkahelyek között vándorol', '–', 'nehezen mozgatható gépek: szerszámgépek, építőgépek'],
    ['Sorszerű', 'folyamat elvű', 'ülő munkahely; előírt munkamegosztás', 'ütemidő-kényszer nincs; kézi anyagtovábbítás', 'mozgatható, közepes és nagy súlyú gépek: gépkocsi, háztartási, villamos készülékek'],
    ['Szalagszerű', 'folyamat elvű', 'ülő munkahely; előírt munkamegosztás', 'csökkentett ütemidő-kényszer; gépi anyagtovábbítás', 'kis és közepes, bonyolult szerkezetű gépek: motorok, hajtóművek, TV'],
    ['Abszolút időkényszerű', 'folyamat elvű', 'ülő munkahely; részletesen előírt munkamegosztás', 'merev ütemidő-kényszer; gépi anyagtovábbítás', 'kis méretű, egyszerű szerkezetek: villamos alkatrészek, zsírzógombok'],
  ];
  var SZF_P = [['nagy szerszámgép', 0], ['tartály', 0], ['építőgép', 1], ['gépkocsi', 2], ['háztartási gép', 2], ['villanymotor', 3], ['hajtómű', 3], ['TV', 3], ['zsírzógomb', 4], ['villamos alkatrész', 4]];
  AVIX.def('szervforma', {
    title: 'A szerelés szervezési formái',
    sub: 'Az álló munkahelyestől az abszolút időkényszerűig: nő a munkamegosztás és a gépesítettség, csökken a rugalmasság',
    mount: function (el) {
      var st = U.store('szervforma', { i: 2, p: 'gépkocsi' }), S = st.get(), segC;
      el.innerHTML = '<p class="ix-lead">A jegyzet táblázata öt formát különít el. Válassz <b>formát</b>, vagy egy <b>terméket</b>, és nézd meg, hol áll a skálán.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      segC = U.seg(r1, SZF.map(function (f, i) { return [String(i), f[0]]; }), String(S.i), function (v) { S.i = +v; S.p = null; st.set(S); chipC.set(null); P.render(); }, 'Szervezési forma');
      var r2 = U.h('div', 'ix-row'); el.appendChild(r2);
      var chipC = U.chips(r2, SZF_P.map(function (p) { return [p[0], p[0]]; }), S.p, function (v) { S.p = v; S.i = SZF_P.filter(function (p) { return p[0] === v; })[0][1]; st.set(S); segC.set(String(S.i)); P.render(); }, 'Termék');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.5 : 0.22; }, minH: 160, maxH: 190, label: 'Szervezési formák skálája' });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      P.draw = function (w, h) {
        var x0 = 24, x1 = w - 24, sx = function (i) { return x0 + (x1 - x0) * (i + 0.5) / 5; }, o = '';
        o += '<path d="M' + x0 + ',16H' + ((sx(1) + sx(2)) / 2 - 4) + '" style="stroke:var(--ix-4);stroke-width:2"/><text class="tk" x="' + x0 + '" y="12">áll: intézkedési elvű</text>';
        o += '<path d="M' + ((sx(1) + sx(2)) / 2 + 4) + ',16H' + x1 + '" style="stroke:var(--ix-2);stroke-width:2"/><text class="tk" x="' + x1 + '" y="12" text-anchor="end">mozog: folyamat elvű</text>';
        [['munkamegosztás nő →', 1, 'var(--ix-3)'], ['gépesítettség nő →', 1, 'var(--ix-1)'], ['szereléstechnikai rugalmasság csökken →', 1, 'var(--ix-5)']].forEach(function (a, j) {
          var y = 44 + j * 30, xa = a[1] > 0 ? x0 : x1, xb = a[1] > 0 ? x1 : x0;
          o += '<line x1="' + xa + '" x2="' + xb + '" y1="' + y + '" y2="' + y + '" style="stroke:' + a[2] + ';stroke-width:6;stroke-opacity:.3"/><path d="M' + xb + ',' + y + 'l' + (-a[1] * 10) + ',-7l0,14Z" style="fill:' + a[2] + '"/><text class="tk" x="' + ((x0 + x1) / 2) + '" y="' + (y - 7) + '" text-anchor="middle">' + a[0] + '</text>';
        });
        for (var i = 0; i < 5; i++) {
          var on = i === S.i;
          o += '<circle cx="' + sx(i).toFixed(1) + '" cy="' + (h - 34) + '" r="' + (on ? 11 : 7) + '" style="fill:' + (on ? 'var(--acc)' : 'var(--surface)') + ';stroke:var(--acc);stroke-width:2"/>';
          if (on || w >= 520) o += '<text class="' + (on ? 'la' : 'tk') + ' sm" x="' + sx(i).toFixed(1) + '" y="' + (h - 10) + '" text-anchor="middle">' + (w < 520 ? SZF[i][0] : SZF[i][0].replace('Abszolút ', 'Absz. ')) + '</text>';
        }
        P.svg.innerHTML = o;
        var f = SZF[S.i];
        out.innerHTML = '<h4><small>' + f[1] + ' szerelés</small>' + f[0] + ' szerelés</h4>' + U.kv([['Munkahely, munkamegosztás', f[2], ''], ['Ütemidő, anyagtovábbítás', f[3], ''], ['Szerelendő munkadarab', f[4], '']]);
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/17 — szerelési családfa (saját példa: szíjtárcsás tengelyegység)  */
  /* ================================================================== */
  var CS_P = [[2, 'Tengely', 1], [4, 'Távtartó', 1], [3, 'Golyóscsapágy', 2], [5, 'Biztosítógyűrű', 1], [1, 'Csapágyház', 1], [6, 'Fedél', 1], [7, 'Csavar M6', 4], [8, 'Retesz', 1], [9, 'Szíjtárcsa', 1], [10, 'Tengelyanya', 1]];
  // lépések: [bejövő alkatrész sora vagy -1 (ellenőrzés), műveleti jel, leírás, ág: 'E' előszerelés / 'F' fővonal]
  var CS_S = [
    [1, 'H', 'Előszerelés: a távtartót a tengelyre helyezzük (bázis: tengely).', 'E'],
    [2, 'M', 'A két golyóscsapágyat melegítve felhúzzuk a tengelyre.', 'E'],
    [3, 'R', 'Biztosítógyűrű (rugalmas alakváltozással) — kész az E1 alegység: tengely csapágyakkal.', 'E'],
    [4, 'S', 'Fővonal: a csapágyházba (bázisalkatrész) besajtoljuk az E1 alegységet.', 'F'],
    [5, 'H', 'A fedél felhelyezése.', 'F'],
    [6, 'C', 'A fedél csavarozása (4 db csavar).', 'F'],
    [7, 'S', 'A retesz beillesztése a tengelycsap hornyába.', 'F'],
    [8, 'S', 'A szíjtárcsa felsajtolása.', 'F'],
    [9, 'C', 'Tengelyanya meghúzása és biztosítása.', 'F'],
    [-1, 'E', 'Ellenőrzés: kézi forgatás, axiális játék mérése — kész a végszerelvény.', 'F'],
  ];
  var CS_SYM = { H: 'helyezés', M: 'melegítés + felhúzás', R: 'rugalmas alakváltoztatás', S: 'sajtolás, illesztés', C: 'csavarozás', E: 'ellenőrzés, mérés' };
  AVIX.def('csaladfa', {
    title: 'Szerelési családfa lépésről lépésre',
    sub: 'Saját példa: szíjtárcsás, csapágyazott tengelyegység — egyszerűsített és részletes családfa, rend',
    mount: function (el) {
      var st = U.store('csaladfa', { v: 'resz', k: 3 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A családfa a <b>bázisalkatrésszel</b> kezdődik és a <b>kész szerelvénnyel</b> végződik. Az előszerelt alegység (E1) <b>párhuzamosan</b> készülhet a fővonallal. A részletes forma a műveleteket is jelöli; a csomópont jelölése: darabszám | megnevezés | tételszám.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, [['egy', 'Egyszerűsített'], ['resz', 'Részletes']], S.v, function (v) { S.v = v; st.set(S); P.render(); }, 'Forma');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? (S.v === 'resz' ? 1.02 : 0.62) : (S.v === 'resz' ? 0.56 : 0.34); }, minH: 230, maxH: 400, label: 'Szerelési családfa' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Lépés', min: 0, max: CS_S.length, step: 1, value: S.k, dec: 0, onInput: function (v) { S.k = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function sym(x, y, c, on) { return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="9" style="fill:' + (on ? 'var(--surface)' : 'var(--surface-2)') + ';stroke:' + (on ? 'var(--acc)' : 'var(--rule-2)') + ';stroke-width:' + (on ? 2 : 1) + '"/><text class="sm" x="' + x.toFixed(1) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="middle" style="font-weight:700;fill:' + (on ? 'var(--acc)' : 'var(--muted)') + '">' + c + '</text>'; }
      P.draw = function (w, h) { if (S.v === 'resz') drawRes(w, h); else drawEgy(w, h); info(); };
      function drawRes(w, h) {
        var narrow = w < 520, rh = Math.min(30, (h - 30) / CS_P.length), bx = 8, bw = narrow ? 118 : 150, qw = 18, tw = 22, o = '';
        var nodes = [], xs = bx + bw + 16, dx = (w - xs - (narrow ? 56 : 90)) / (CS_S.length);
        CS_P.forEach(function (p, i) {
          var y = 12 + i * rh, used = i === 0 ? S.k >= 1 : CS_S.some(function (s, j) { return s[0] === i && j < S.k; }), ac = used ? 'var(--ink)' : 'var(--muted)';
          o += '<rect x="' + bx + '" y="' + y + '" width="' + bw + '" height="' + (rh - 6) + '" style="fill:var(--surface);stroke:' + ac + '"/><line x1="' + (bx + qw) + '" x2="' + (bx + qw) + '" y1="' + y + '" y2="' + (y + rh - 6) + '" style="stroke:' + ac + '"/><line x1="' + (bx + bw - tw) + '" x2="' + (bx + bw - tw) + '" y1="' + y + '" y2="' + (y + rh - 6) + '" style="stroke:' + ac + '"/>';
          o += '<text class="sm" x="' + (bx + qw / 2) + '" y="' + (y + rh / 2 + 1) + '" text-anchor="middle" style="fill:' + ac + '">' + p[2] + '</text><text class="sm" x="' + (bx + qw + 4) + '" y="' + (y + rh / 2 + 1) + '" style="fill:' + ac + '">' + esc(p[1]) + '</text><text class="sm" x="' + (bx + bw - tw / 2) + '" y="' + (y + rh / 2 + 1) + '" text-anchor="middle" style="fill:' + ac + '">' + p[0] + '.</text>';
        });
        var ycen = function (i) { return 12 + i * rh + (rh - 6) / 2; };
        // csomópontok helye
        CS_S.forEach(function (s, j) { var row = s[0] >= 0 ? s[0] : 9; nodes.push([xs + (j + 0.7) * dx, ycen(row) + (s[0] < 0 ? rh * 0.9 : 0)]); });
        // bejövő alkatrészvonalak
        CS_S.forEach(function (s, j) { if (s[0] < 0) return; var on = j < S.k; o += '<line x1="' + (bx + bw) + '" x2="' + (nodes[j][0] - 9).toFixed(1) + '" y1="' + ycen(s[0]).toFixed(1) + '" y2="' + ycen(s[0]).toFixed(1) + '" style="stroke:' + (on ? 'var(--ink)' : 'var(--rule-2)') + ';stroke-width:' + (on ? 1.4 : 1) + '"/>'; });
        // E1 ág: tengelytől (0. sor) a csomópontokon át
        function seg(a, b, on, col) { return '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" style="stroke:' + (on ? (col || 'var(--acc)') : 'var(--rule-2)') + ';stroke-width:' + (on ? 2.2 : 1.2) + '"/>'; }
        o += seg([bx + bw, ycen(0)], nodes[0], S.k >= 1, 'var(--ix-2)');
        o += seg(nodes[0], nodes[1], S.k >= 2, 'var(--ix-2)') + seg(nodes[1], nodes[2], S.k >= 3, 'var(--ix-2)');
        o += seg(nodes[2], nodes[3], S.k >= 4, 'var(--ix-2)');
        for (var j = 3; j < CS_S.length - 1; j++) o += seg(nodes[j], nodes[j + 1], S.k >= j + 2);
        var endx = w - 8, endy = nodes[CS_S.length - 1][1];
        o += seg(nodes[CS_S.length - 1], [endx - (narrow ? 44 : 70), endy], S.k >= CS_S.length);
        o += '<rect x="' + (endx - (narrow ? 44 : 70)) + '" y="' + (endy - 11) + '" width="' + (narrow ? 44 : 70) + '" height="22" rx="4" style="fill:' + (S.k >= CS_S.length ? 'var(--acc)' : 'var(--surface)') + ';fill-opacity:' + (S.k >= CS_S.length ? 0.25 : 1) + ';stroke:var(--acc)"/><text class="sm" x="' + (endx - (narrow ? 22 : 35)) + '" y="' + (endy + 4) + '" text-anchor="middle" style="font-weight:700">Kész</text>';
        CS_S.forEach(function (s, j) { o += sym(nodes[j][0], nodes[j][1], s[1], j < S.k); if (j === S.k - 1) o += '<circle cx="' + nodes[j][0].toFixed(1) + '" cy="' + nodes[j][1].toFixed(1) + '" r="14" style="fill:none;stroke:var(--acc);stroke-width:1.5;stroke-dasharray:3 3"/>'; });
        o += '<text class="tk" x="' + (nodes[2][0] + 12).toFixed(1) + '" y="' + (nodes[2][1] - 12).toFixed(1) + '" style="fill:var(--ix-2)">E1</text>';
        P.svg.innerHTML = o;
      }
      // Egyszerűsített családfa: fővonal a bázistól (1) a kész szerelvényig; az E1 előszerelés alul, oldalágként.
      function drawEgy(w, h) {
        var o = '', narrow = w < 520, bs = narrow ? 20 : 24, x0 = 16 + bs / 2, kw = narrow ? 46 : 64;
        var y = h * 0.34, yb = h * 0.78, dxb = narrow ? 30 : 44, xJ = x0 + 4 * dxb, dx = (w - 10 - kw - xJ) / 5.6;
        function box(x, yy, lab, on) { return '<rect x="' + (x - bs / 2).toFixed(1) + '" y="' + (yy - bs / 2).toFixed(1) + '" width="' + bs + '" height="' + bs + '" style="fill:var(--surface);stroke:' + (on ? 'var(--ink)' : 'var(--rule-2)') + ';stroke-width:' + (on ? 1.6 : 1) + '"/><text class="sm" x="' + x.toFixed(1) + '" y="' + (yy + 4).toFixed(1) + '" text-anchor="middle" style="font-weight:700;fill:' + (on ? 'var(--ink)' : 'var(--muted)') + '">' + lab + '</text>'; }
        function ln(xa, ya, xb, yb2, on, col) { return '<line x1="' + xa.toFixed(1) + '" y1="' + ya.toFixed(1) + '" x2="' + xb.toFixed(1) + '" y2="' + yb2.toFixed(1) + '" style="stroke:' + (on ? (col || 'var(--acc)') : 'var(--rule-2)') + ';stroke-width:' + (on ? 2 : 1.2) + '"/>'; }
        var xEnd = w - 10 - kw;
        // fővonal
        o += ln(x0 + bs / 2, y, xEnd, y, S.k >= 4);
        o += box(x0, y, '1', S.k >= 4) + '<text class="tk" x="' + (x0 - bs / 2) + '" y="' + (y - bs / 2 - 6) + '">bázis</text>';
        // E1 ág
        o += ln(x0 + bs / 2, yb, xJ, yb, S.k >= 1, 'var(--ix-2)') + ln(xJ, yb, xJ, y, S.k >= 4, 'var(--ix-2)') + '<circle cx="' + xJ.toFixed(1) + '" cy="' + y + '" r="3.5" class="fi"/>';
        o += box(x0, yb, '2', S.k >= 1);
        [4, 3, 5].forEach(function (q, i) { var x = x0 + (i + 1) * dxb, on = S.k >= i + 1; o += box(x, yb - bs - 8, String(q), on) + ln(x, yb - 8 - bs / 2, x, yb, on, 'var(--ix-2)') + '<circle cx="' + x.toFixed(1) + '" cy="' + yb.toFixed(1) + '" r="3" class="fi"/>'; });
        o += '<text class="tk" x="' + (xJ + 6).toFixed(1) + '" y="' + (yb + 4).toFixed(1) + '" style="fill:var(--ix-2)">E1</text>';
        // további tételek a fővonalon
        [6, 7, 8, 9, 10].forEach(function (q, i) { var x = xJ + (i + 1) * dx, on = S.k >= i + 5; o += box(x, y - bs - 8, String(q), on) + ln(x, y - 8 - bs / 2, x, y, on, 'var(--ink)') + '<circle cx="' + x.toFixed(1) + '" cy="' + y + '" r="3" class="fi"/>'; });
        var done = S.k >= CS_S.length;
        o += '<rect x="' + xEnd.toFixed(1) + '" y="' + (y - 13) + '" width="' + kw + '" height="26" rx="4" style="fill:' + (done ? 'var(--acc)' : 'var(--surface)') + ';fill-opacity:' + (done ? 0.25 : 1) + ';stroke:var(--acc)"/><text class="sm" x="' + (xEnd + kw / 2).toFixed(1) + '" y="' + (y + 4) + '" text-anchor="middle" style="font-weight:700">Kész</text>';
        o += '<text class="tk" x="' + (w - 10) + '" y="' + (h - 8) + '" text-anchor="end">a számok a tételszámok</text>';
        P.svg.innerHTML = o;
      }
      function info() {
        var k = S.k, s = k ? CS_S[k - 1] : null, rend = k >= 4 ? CS_S.length - k : null;
        out.innerHTML = '<h4><small>' + (k ? k + '. lépés · ' + CS_SYM[s[1]] + (s[3] === 'E' ? ' · előszerelés (E1)' : ' · fővonal') : 'kiinduló állapot') + '</small>' + (k ? esc(s[2]) : 'Húzd a Lépés csúszkát — a bázisalkatrész az első, a kész szerelvény az utolsó.') + '</h4>' +
          U.kv([['Rend', rend === null ? (k ? 'az E1 alegység ' + (CS_S.length - 3) + '. rendű' : '—') : rend + (rend === 0 ? ' (végszerelvény)' : ''), 'hány alszerelvény-állapotnyira van a végszerelvénytől'],
            ['Rang', 'végszerelvény: 2 · E1: 1', 'a részegység-szintek száma (a végszerelvény tartalmazza az E1-et)'],
            ['Műveleti jelek', 'H · M · R · S · C · E', 'helyezés, melegítés + felhúzás, rugalmas alakváltoztatás (biztosítógyűrű), sajtolás, csavarozás, ellenőrzés — egyszerűsített saját jelölés a VDI 3239 csoportjai szerint']]);
      }
      P.render();
    },
  });

  /* ================================================================== */
  /* B/18 — bevezető felület és fokozatos kapcsolódás                    */
  /* ================================================================== */
  AVIX.def('bevezet', {
    title: 'Szereléshelyes kialakítás: bevezető felület, fokozatos kapcsolódás',
    sub: 'Letörés és süllyesztés rávezeti a csapot; két illesztés ne egyszerre kezdődjön',
    mount: function (el) {
      var st = U.store('bevezet', { m: 'let', cf: 1, cc: 1, e: 1.5, dl: 3, z: 6 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A <b>furat süllyesztése</b> és a <b>csap leélezése</b> „csapdát” képez: az oldalirányú helyzethibát a ferde felület kiegyenlíti. Ha egy alkatrész két helyen illeszkedik, a két illesztés <b>ne egyszerre</b> kezdődjön (egyidejű találkozás hiba), hanem fokozatosan.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, [['let', 'Bevezető felület'], ['fok', 'Fokozatos kapcsolódás']], S.m, function (v) { S.m = v; st.set(S); build(); }, 'Szabály');
      var box = U.h('div'); el.appendChild(box);
      var P, out;
      function build() {
        box.innerHTML = '';
        P = U.plot(box, { ratio: function (w) { return w < 520 ? 0.78 : 0.42; }, minH: 240, maxH: 320, label: 'Csap és furat metszete' });
        var g = U.sliders(box);
        if (S.m === 'let') {
          U.slider(g, { label: 'Furat süllyesztése cf', min: 0, max: 3, step: 0.1, value: S.cf, unit: 'mm', dec: 1, onInput: function (v) { S.cf = v; st.set(S); P.render(); } });
          U.slider(g, { label: 'Csap leélezése c', min: 0, max: 3, step: 0.1, value: S.cc, unit: 'mm', dec: 1, onInput: function (v) { S.cc = v; st.set(S); P.render(); } });
          U.slider(g, { label: 'Oldalirányú helyzethiba e', min: 0, max: 5, step: 0.1, value: S.e, unit: 'mm', dec: 1, onInput: function (v) { S.e = v; st.set(S); P.render(); } });
        } else {
          U.slider(g, { label: 'A két illesztés kezdete közti eltolás Δ', min: 0, max: 8, step: 0.5, value: S.dl, unit: 'mm', dec: 1, onInput: function (v) { S.dl = v; st.set(S); P.render(); } });
          U.slider(g, { label: 'Betolás', min: 0, max: 20, step: 0.5, value: S.z, unit: 'mm', dec: 1, onInput: function (v) { S.z = v; st.set(S); P.render(); } });
        }
        out = U.h('div', 'ix-out'); box.appendChild(out);
        P.draw = S.m === 'let' ? drawLet : drawFok;
        P.render();
      }
      function drawLet(w, h) {
        var sc = Math.min(w / 60, h / 34), cx = w / 2, yT = h * 0.55, D = 20, s = 0.1, o = '', cap = S.cf + S.cc + s / 2, ok = S.e <= cap + 1e-9;
        var hx = function (v) { return cx + v * sc; };
        // lemez a furattal
        var r = D / 2, cf = S.cf;
        o += '<path d="M' + hx(-28) + ',' + yT + 'H' + hx(-r - cf) + 'L' + hx(-r) + ',' + (yT + cf * sc) + 'V' + (h - 10) + 'H' + hx(-28) + 'Z" style="fill:var(--ix-8);fill-opacity:.35;stroke:var(--ink);stroke-width:1.4"/>';
        o += '<path d="M' + hx(28) + ',' + yT + 'H' + hx(r + cf) + 'L' + hx(r) + ',' + (yT + cf * sc) + 'V' + (h - 10) + 'H' + hx(28) + 'Z" style="fill:var(--ix-8);fill-opacity:.35;stroke:var(--ink);stroke-width:1.4"/>';
        // csap eltolva e-vel; ha rávezethető, a ferde felületen ül, különben a síkon
        var pr = r - s / 2, cc = S.cc, pc = cx + S.e * sc, top = 12;
        var tipY = ok ? yT + Math.max(0.5, cf - Math.max(0, S.e - cc)) * sc : yT;
        o += '<path d="M' + (pc - pr * sc).toFixed(1) + ',' + top + 'V' + (tipY - cc * sc).toFixed(1) + 'L' + (pc - (pr - cc) * sc).toFixed(1) + ',' + tipY.toFixed(1) + 'H' + (pc + (pr - cc) * sc).toFixed(1) + 'L' + (pc + pr * sc).toFixed(1) + ',' + (tipY - cc * sc).toFixed(1) + 'V' + top + '" style="fill:' + (ok ? 'var(--ix-3)' : 'var(--ix-5)') + ';fill-opacity:.3;stroke:var(--ink);stroke-width:1.4"/>';
        o += '<line x1="' + cx + '" x2="' + cx + '" y1="4" y2="' + (h - 4) + '" style="stroke:var(--muted);stroke-dasharray:10 3 2 3"/><line x1="' + pc.toFixed(1) + '" x2="' + pc.toFixed(1) + '" y1="4" y2="' + (tipY + 6).toFixed(1) + '" style="stroke:var(--acc);stroke-dasharray:6 3"/>';
        if (S.e > 0.05) o += '<path d="M' + cx + ',' + (top + 14) + 'H' + pc.toFixed(1) + '" style="stroke:var(--acc);stroke-width:1.6"/><text class="la sm" x="' + ((cx + pc) / 2).toFixed(1) + '" y="' + (top + 10) + '" text-anchor="middle">e</text>';
        if (ok && S.e > 0.05) o += '<path d="M' + (pc - 16).toFixed(1) + ',' + (tipY + 16).toFixed(1) + 'l-14,10" style="stroke:var(--ix-3);stroke-width:2.4"/><text class="tk" x="' + (pc - 36).toFixed(1) + '" y="' + (tipY + 40).toFixed(1) + '" text-anchor="end">rávezet</text>';
        if (!ok) o += '<text class="la" x="' + (pc - pr * sc - 6).toFixed(1) + '" y="' + (yT - 6) + '" text-anchor="end" style="fill:var(--ix-5)">felütközik</text>';
        P.svg.innerHTML = o;
        out.innerHTML = '<h4><small class="nc">befogási tartomány ≈ c<sub>f</sub> + c + s/2 = ' + fmt(cap, 2) + ' mm</small>' + (ok ? 'A csap bevezethető — a ferde felület a helyére vezeti' : '<span style="color:var(--ix-5)">A csap a furat peremén felütközik</span>') + '</h4>' +
          '<p>Az oldalirányú hibát (e) a két ferde felület együtt veszi fel. Automatizált szerelésnél ez dönti el, hogy a robot pozicionálási pontossága elég-e, vagy drága érzékelés és korrekció kell.</p>';
      }
      function drawFok(w, h) {
        var sc = Math.min(w / 70, h / 40), cx = w / 2, o = '', yP = h * 0.3;
        var X = function (v) { return cx + v * sc; }, Y = function (v) { return yP + v * sc; };
        // ház: felső furat Ø20 (hossz 8), alsó furat Ø12 (hossz 8), a kettő között 6 mm
        o += '<path d="M' + X(-26) + ',' + Y(0) + 'H' + X(-10) + 'V' + Y(8) + 'H' + X(-6) + 'V' + Y(22) + 'H' + X(-26) + 'Z M' + X(26) + ',' + Y(0) + 'H' + X(10) + 'V' + Y(8) + 'H' + X(6) + 'V' + Y(22) + 'H' + X(26) + 'Z" style="fill:var(--ix-8);fill-opacity:.35;stroke:var(--ink);stroke-width:1.4"/>';
        // lépcsős csap: alsó Ø12 rész hossza = 8 + Δ ... úgy, hogy az alsó illesztés Δ-val korábban kezdődjön
        var lowLen = 8 + S.dl, tipY = S.z - 4;
        var yStep = tipY - lowLen;
        o += '<path d="M' + X(-5.95) + ',' + Y(tipY) + 'H' + X(5.95) + 'V' + Y(yStep) + 'H' + X(9.95) + 'V' + Y(yStep - 18) + 'H' + X(-9.95) + 'V' + Y(yStep) + 'H' + X(-5.95) + 'Z" style="fill:var(--ix-1);fill-opacity:.3;stroke:var(--ink);stroke-width:1.4"/>';
        var e1 = tipY >= 8, e2 = yStep >= 0;
        o += '<text class="tk" x="' + X(12) + '" y="' + Y(4) + '">Ø20</text><text class="tk" x="' + X(8) + '" y="' + Y(16) + '">Ø12</text>';
        o += '<text class="' + (e1 ? 'la' : 'tk') + ' sm" x="10" y="' + (h - 26) + '">' + (e1 ? '● alsó (Ø12) illesztés kapcsol' : '○ alsó (Ø12) még nem kapcsol') + '</text><text class="' + (e2 ? 'la' : 'tk') + ' sm" x="10" y="' + (h - 10) + '">' + (e2 ? '● felső (Ø20) illesztés kapcsol' : '○ felső (Ø20) még nem kapcsol') + '</text>';
        P.svg.innerHTML = o;
        var simult = S.dl < 1;
        out.innerHTML = '<h4><small class="nc">Δ = ' + fmt(S.dl, 1) + ' mm</small>' + (simult ? '<span style="color:var(--ix-5)">Egyidejű találkozás — két helyen kell egyszerre betalálni</span>' : 'Fokozatos kapcsolódás — előbb az alsó illesztés vezet') + '</h4>' +
          '<p>' + (simult ? 'A csap egyszerre két furatba próbál belépni: ha bármelyik kicsit elmozdult, felütközik, beszorul. Megoldás: az egyik illeszkedő szakasz legyen néhány mm-rel hosszabb (Δ), így az első illesztés már központosítja az alkatrészt, mire a második kezdődik.' : 'Az alsó, hosszabb szakasz már vezeti és központosítja a csapot, mire a felső illesztés kezdődik — a szerelés egy kézzel, szerszám nélkül is biztos.') + '</p>';
      }
      build();
    },
  });

  /* ================================================================== */
  /* B/18 — DFA: alkatrészszám és szerelési hatékonyság                   */
  /* ================================================================== */
  // [megnevezés, db, idő/db (s), mozgás, más anyag, szétszerelés miatt külön — ha mind 0: összevonható/elhagyható]
  var DFA = [['Alaplemez (bázis)', 1, 3.5, 1, 0, 0], ['Csapágybak', 2, 4, 0, 0, 0], ['Csavar a bakhoz', 4, 7.5, 0, 0, 0], ['Tengely', 1, 5, 1, 0, 0], ['Csapágy', 2, 6, 1, 1, 0], ['Távtartó hüvely', 1, 4, 0, 0, 0], ['Görgő (poliuretán)', 1, 6, 0, 1, 0], ['Biztosítógyűrű', 2, 8, 0, 0, 1], ['Fedőlemez', 1, 5, 0, 0, 0], ['Csavar a fedőhöz', 2, 7.5, 0, 0, 0]];
  AVIX.def('dfa', {
    title: 'Kevés alkatrész: DFA-mutató (kiegészítés)',
    sub: 'Görgőegység 17 alkatrésszel — melyik vonható össze? Hogyan nő a szerelési hatékonyság?',
    mount: function (el) {
      var st = U.store('dfa', { off: [] }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Boothroyd–Dewhurst-szemlélet (nem a jegyzet anyaga): minden alkatrésznél három kérdés — <b>mozog-e</b> a többihez képest, <b>más anyagú-e</b>, <b>külön kell-e szétszerelni</b>? Ha mindháromra nem, az alkatrész elvben összevonható a szomszédjával. <b>Kapcsold ki</b> az összevonható elemeket (áttervezés). Szemléltető időadatok.</p>';
      var chips = U.h('div', 'ix-chips'); el.appendChild(chips);
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.5 : 0.22; }, minH: 150, maxH: 190, label: 'Szerelési idő megoszlása' });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function isOff(i) { return S.off.indexOf(i) >= 0; }
      function drawChips() {
        chips.innerHTML = DFA.map(function (d, i) { var cand = !d[3] && !d[4] && !d[5]; return '<button type="button" data-i="' + i + '" aria-pressed="' + !isOff(i) + '"' + (cand ? '' : ' disabled title="szükséges alkatrész"') + '>' + esc(d[0]) + (d[1] > 1 ? ' ×' + d[1] : '') + (cand ? '' : ' ✓') + '</button>'; }).join('');
      }
      chips.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b || b.disabled) return; var i = +b.getAttribute('data-i'), p = S.off.indexOf(i); if (p >= 0) S.off.splice(p, 1); else S.off.push(i); st.set(S); drawChips(); P.render(); });
      drawChips();
      P.draw = function (w, h) {
        var N = 0, Nmin = 0, T = 0, o = '', x = 10, tot = DFA.reduce(function (a, d) { return a + d[1] * d[2]; }, 0), sx = (w - 20) / tot;
        DFA.forEach(function (d, i) {
          var need = d[3] || d[4] || d[5];
          if (need) Nmin += d[1];
          if (isOff(i)) return;
          N += d[1]; T += d[1] * d[2];
          var ww = d[1] * d[2] * sx;
          o += '<rect x="' + x.toFixed(1) + '" y="40" width="' + (ww - 1).toFixed(1) + '" height="36" style="fill:' + (need ? 'var(--ix-3)' : 'var(--ix-5)') + ';fill-opacity:.55"/>';
          if (ww > 26) o += '<text class="tk" x="' + (x + ww / 2).toFixed(1) + '" y="62" text-anchor="middle">' + fmt(d[1] * d[2], 0) + '</text>';
          x += ww;
        });
        o += '<text class="tk" x="10" y="30">idő, s — zöld: szükséges, piros: összevonható</text><text class="lb sm" x="' + (w - 10) + '" y="94" text-anchor="end">összesen ' + fmt(T, 0) + ' s</text>';
        var E = 3 * Nmin / T;
        o += '<rect x="10" y="' + (h - 40) + '" width="' + ((w - 20) * Math.min(1, E / 0.5)).toFixed(1) + '" height="14" rx="3" style="fill:var(--acc);fill-opacity:.6"/><text class="tk" x="10" y="' + (h - 46) + '">E<tspan dy="3" style="font-size:.75em">DFA</tspan><tspan dy="-3"> = 3 · N</tspan><tspan dy="3" style="font-size:.75em">min</tspan><tspan dy="-3"> / t = ' + fmt(E * 100, 1) + ' % (a sáv 50 %-ig)</tspan></text>';
        P.svg.innerHTML = o;
        out.innerHTML = '<h4><small class="nc">N = ' + N + ' alkatrész, N<sub>min</sub> = ' + Nmin + '</small>Szerelési hatékonyság: ' + fmt(E * 100, 1) + ' %</h4>' +
          U.kv([['Szerelési idő', fmt(T, 0) + ' s', 'a kötőelemek (csavarok) viszik el a legtöbb időt — a jegyzet szerint a szerelő munka kb. 20%-a rögzítés'],
            ['Tipp', S.off.length ? 'bakok az alaplemezbe öntve, távtartó a görgőagyba, pattintós fedél' : 'kezdd a csavarokkal és a csapágybakokkal', 'a kevés alkatrész a jegyzet első irányelve']]);
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/18 — rezgőtartályos adagoló: tájolás, kiejtés                      */
  /* ================================================================== */
  var ADT = { alatet: ['Alátét (szimmetrikus)', 1], csap: ['Fejes csap', 2], aszim: ['Aszimmetrikus idom', 4] };
  AVIX.def('adagolo', {
    title: 'Rezgőtartályos adagoló: tájolás és kiejtés',
    sub: 'A pálya menti terelők és kiejtő nyílások csak a helyes helyzetű darabot engedik tovább',
    mount: function (el) {
      var st = U.store('adagolo', { p: 'csap', act: 'kiejt', tu: 3 }), S = st.get(), parts = [], cnt = { in: 0, back: 0, out: 0, turn: 0 }, t = 0, last = 0, spawn = 0, run = !U.reduce, R = rng(11);
      el.innerHTML = '<p class="ix-lead">Az ömlesztett alkatrészeket a rezgés a spirális pályán felfelé viszi (itt kiegyenesítve). A <b>terelő</b> a fekvő, a <b>kiejtő nyílás</b> a fordított darabokat ejti vissza. <b>Aktív</b> tájolásnál a rossz helyzetű darabot átfordítjuk. A szimmetrikusabb alkatrész könnyebben adagolható — ezért fontos a <b>tájolhatóság</b>.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.seg(r1, Object.keys(ADT).map(function (k) { return [k, ADT[k][0]]; }), S.p, function (v) { S.p = v; st.set(S); reset(); }, 'Alkatrész');
      var r2 = U.h('div', 'ix-row'); el.appendChild(r2);
      U.seg(r2, [['kiejt', 'Passzív: kiejtés'], ['fordit', 'Aktív: átfordítás']], S.act, function (v) { S.act = v; st.set(S); reset(); }, 'Tájolás');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.5 : 0.24; }, minH: 170, maxH: 210, label: 'Adagolópálya' });
      var g = U.sliders(el);
      U.slider(g, { label: 'A robot ütemideje', min: 1, max: 6, step: 0.5, value: S.tu, unit: 's', dec: 1, onInput: function (v) { S.tu = v; st.set(S); info(); } });
      var br = btnRow(el, [['run', run ? '❚❚ Szünet' : '▶ Indítás']]);
      br.addEventListener('click', function () { run = !run; br.querySelector('button').textContent = run ? '❚❚ Szünet' : '▶ Indítás'; if (run) { last = 0; requestAnimationFrame(loop); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function reset() { parts = []; cnt = { in: 0, back: 0, out: 0, turn: 0 }; P.render(); info(); }
      function orient() { var n = ADT[S.p][1]; return Math.floor(R() * n); }
      function step(dt, w) {
        spawn -= dt; if (spawn <= 0) { spawn = 0.55; parts.push({ x: 0, o: orient(), d: 0 }); cnt.in++; }
        var gA = w * 0.4, gB = w * 0.66;
        parts.forEach(function (p) {
          if (p.d) { p.d += dt * 90; return; }
          var nx = p.x + dt * w / 7;
          if (p.x < gA && nx >= gA && (p.o === 2 || p.o === 3)) { if (S.act === 'fordit') { p.o = 0; cnt.turn++; } else { p.d = 1; cnt.back++; } }
          if (p.x < gB && nx >= gB && p.o === 1) { if (S.act === 'fordit') { p.o = 0; cnt.turn++; } else { p.d = 1; cnt.back++; } }
          p.x = nx; if (p.x > w - 20 && !p.done) { p.done = 1; cnt.out++; }
        });
        parts = parts.filter(function (p) { return p.x < w + 20 && p.d < 60; });
      }
      function shape(x, y, o) {
        var rot = [0, 180, 90, 270][o], s = '';
        if (S.p === 'alatet') s = '<rect x="-9" y="-3" width="18" height="6" rx="1" style="fill:var(--ix-2);stroke:var(--ink)"/>';
        else if (S.p === 'csap') s = '<rect x="-3" y="-9" width="6" height="16" style="fill:var(--ix-1);stroke:var(--ink)"/><rect x="-7" y="-11" width="14" height="4" style="fill:var(--ix-1);stroke:var(--ink)"/>';
        else s = '<path d="M-8,-8H8V8H0V0H-8Z" style="fill:var(--ix-4);stroke:var(--ink)"/>';
        return '<g transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') rotate(' + rot + ')">' + s + '</g>';
      }
      P.draw = function (w, h) {
        var y = h * 0.52, o = '', gA = w * 0.4, gB = w * 0.66;
        o += '<rect x="0" y="' + (y + 12) + '" width="' + w + '" height="8" style="fill:var(--ix-8);fill-opacity:.4"/><text class="tk" x="6" y="' + (y + 36) + '">tartály →</text><text class="tk" x="' + (w - 6) + '" y="' + (y + 36) + '" text-anchor="end">→ robot</text>';
        if (S.p === 'aszim') o += '<path d="M' + gA + ',' + (y - 30) + 'v26" style="stroke:var(--ix-5);stroke-width:3"/><text class="tk" x="' + gA + '" y="' + (y - 34) + '" text-anchor="middle">terelő</text>';
        if (S.p !== 'alatet') o += '<rect x="' + (gB - 12) + '" y="' + (y + 12) + '" width="24" height="8" style="fill:var(--surface)"/><text class="tk" x="' + gB + '" y="' + (y + 50) + '" text-anchor="middle">kiejtő nyílás</text>';
        parts.forEach(function (p) { o += shape(p.x, y + (p.d ? p.d : 0), p.o); });
        o += '<text class="tk" x="6" y="16">be: ' + cnt.in + ' · visszaejtve: ' + cnt.back + ' · átfordítva: ' + cnt.turn + ' · ki: ' + cnt.out + '</text>';
        P.svg.innerHTML = o;
      };
      function info() {
        var n = ADT[S.p][1], pOk = S.act === 'fordit' ? 1 : 1 / n, need = 60 / S.tu / pOk;
        out.innerHTML = '<h4><small>' + ADT[S.p][0] + ' · ' + n + ' lehetséges helyzet</small>Helyes helyzetben érkezik: ' + fmt(pOk * 100, 0) + ' %</h4>' +
          U.kv([['Szükséges betáplálás', fmt(need, 0) + ' db/perc', 'a robot ' + fmt(60 / S.tu, 0) + ' db/perc igényéhez (ütemidő ' + fmt(S.tu, 1) + ' s)'], ['Tanulság', n > 1 && S.act === 'kiejt' ? 'a darabok ' + fmt((1 - pOk) * 100, 0) + ' %-a körbejár' : '', 'szimmetrikus vagy egyértelműen tájolható alkatrész → egyszerűbb, gyorsabb adagoló']]);
      }
      function loop(ts) {
        if (!run || !alive(el)) return;
        var dt = last ? Math.min(0.1, (ts - last) / 1000) : 0; last = ts; step(dt, P.w); P.draw(P.w, P.h); requestAnimationFrame(loop);
      }
      P.render(); info();
      if (run) requestAnimationFrame(loop);
    },
  });
})();

/*
 * Gépész záróvizsga tételtár — interaktív ábrák a B/03–B/05 tételekhez
 * (technológiai tervezés és optimálás, típus- és csoporttechnológia, NC-CNC vezérlés, többtengelyű marás).
 * Forrás: Dudás Illés, Gyártási folyamatok és rendszerek (Gyártórendszerek) jegyzet: 1.3, 7.1, 9–10. és 12. fejezet.
 * Az ábrák saját rajzok; a számpéldák a jegyzet összefüggéseit használják, szemléltető adatokkal.
 */
(function () {
  'use strict';
  if (!window.AVIX) return;
  var U = AVIX.U, fmt = U.fmt, esc = U.esc;
  var LN10 = Math.LN10;

  /* ================================================================== */
  /* B/03 — forgácsolási adatok optimálása (optimumesélyes pontok)       */
  /* ================================================================== */
  // Hosszesztergálás: Ø60 × 200 mm, C45, keményfém, a = 2 mm (rögzítve).
  var OP = { D: 60, L: 200, a: 2, r: 0.8, kc: 1700, z: 0.25, Cv: 330, m: 0.25, yv: 0.2, xv: 0.1, CM: 100, Ksz: 300, tcs: 2 };
  OP.k = 1000 / (Math.PI * OP.D); // n = k·v
  function opCons(S) {
    var ln = Math.log, fRa = Math.sqrt(8 * OP.r * S.rz / 1000);
    // α·X + β·Y ≤ γ, X = ln n, Y = ln f
    return [
      { al: -1, be: 0, ga: -ln(OP.k * 80), n: 'v ≥ 80 m/min (technológiai)', s: 'v_min' },
      { al: 1, be: 0, ga: ln(1600), n: 'n ≤ 1600 1/min (gép)', s: 'n_max' },
      { al: 0, be: -1, ga: -ln(OP.a / 20), n: 'f ≥ a/20 = 0,1 mm (λ = a/f ≤ 20)', s: 'λ_max' },
      { al: 0, be: 1, ga: ln(OP.a / 4), n: 'f ≤ a/4 = 0,5 mm (λ ≥ 4)', s: 'λ_min' },
      { al: 0, be: 1, ga: ln(fRa), n: 'f ≤ √(8·r·Rz) = ' + fmt(fRa, 2) + ' mm (érdesség)', s: 'Rz' },
      { al: 1, be: 1 - OP.z, ga: ln(S.p * 60000 * OP.k / (OP.kc * OP.a)), n: 'P = F_c·v ≤ ' + fmt(S.p, 1) + ' kW (teljesítmény)', s: 'P' },
    ];
  }
  function opEval(X, Y, obj) {
    var n = Math.exp(X), f = Math.exp(Y), v = n / OP.k;
    var T = Math.pow(OP.Cv / (v * Math.pow(f, OP.yv) * Math.pow(OP.a, OP.xv)), 1 / OP.m);
    var tl = OP.L / (n * f);
    var CT = obj === 't' ? OP.tcs : OP.Ksz / OP.CM + OP.tcs;
    var val = obj === 't' ? tl * (1 + OP.tcs / T) : OP.CM * tl * (1 + CT / T);
    return { n: n, f: f, v: v, T: T, tl: tl, val: val };
  }
  // félsíkokkal vágott konvex sokszög (Sutherland–Hodgman)
  function clipPoly(poly, c) {
    var out = [], i, A, B, fa, fb;
    for (i = 0; i < poly.length; i++) {
      A = poly[i]; B = poly[(i + 1) % poly.length];
      fa = c.al * A[0] + c.be * A[1] - c.ga; fb = c.al * B[0] + c.be * B[1] - c.ga;
      if (fa <= 1e-12) out.push(A);
      if ((fa < -1e-12 && fb > 1e-12) || (fa > 1e-12 && fb < -1e-12)) {
        var t = fa / (fa - fb); out.push([A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]);
      }
    }
    return out;
  }
  AVIX.def('optim', {
    title: 'Optimumesélyes pontok (Somló–Girnt)',
    sub: 'Forgácsolási adatok optimálása a log f – log n síkon: korlátok, −45°-os egyenesek, optimum a határon',
    mount: function (el) {
      var st = U.store('optim', { rz: 25, p: 7.5, obj: 'K' }), S = st.get(), probe = null;
      el.innerHTML = '<p class="ix-lead">Hosszesztergálás: Ø60 × 200 mm, C45, keményfém lapka, <b>a = 2 mm rögzítve</b> (a<sub>opt</sub> ≈ a<sub>max</sub>, így a feladat kétdimenziós). A korlátok a log f – log n síkon egyenesek, a megengedett tartomány konvex sokszög. <b>Húzd a pontot</b> a tartományban: a szaggatott −45°-os egyeneseken a főidő állandó, felfelé haladva nő az éltartam, csökken a költség — ezért az optimum a kiemelt <b>optimumesélyes határvonalon</b> van.</p>';
      var row = U.h('div', 'ix-row'); el.appendChild(row);
      U.seg(row, [['K', 'Legkisebb költség'], ['t', 'Legkisebb idő']], S.obj, function (v) { S.obj = v; st.set(S); P.render(); }, 'Célfüggvény');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.95 : 0.6; }, minH: 300, maxH: 500, label: 'Korlátrendszer a log f – log n síkon' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Érdesség Rz', min: 4, max: 60, step: 1, value: S.rz, unit: 'µm', dec: 0, onInput: function (v) { S.rz = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Gépteljesítmény', min: 2, max: 15, step: 0.5, value: S.p, unit: 'kW', dec: 1, onInput: function (v) { S.p = v; st.set(S); P.render(); } });
      var leg = U.h('div', 'ix-note'); el.appendChild(leg);
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var X0 = Math.log(200), X1 = Math.log(3000), Y0 = Math.log(0.05), Y1 = Math.log(1), box = null;
      function PX(X) { return box.x0 + (X - X0) / (X1 - X0) * (box.x1 - box.x0); }
      function PY(Y) { return box.y1 - (Y - Y0) / (Y1 - Y0) * (box.y1 - box.y0); }
      function IX(px) { return X0 + (px - box.x0) / (box.x1 - box.x0) * (X1 - X0); }
      function IY(py) { return Y0 + (box.y1 - py) / (box.y1 - box.y0) * (Y1 - Y0); }
      function lineSeg(al, be, ga) {
        var pts = [], ends = [[X0, null], [X1, null], [null, Y0], [null, Y1]];
        ends.forEach(function (e) {
          var X, Y;
          if (e[0] != null) { if (Math.abs(be) < 1e-12) return; X = e[0]; Y = (ga - al * X) / be; }
          else { if (Math.abs(al) < 1e-12) return; Y = e[1]; X = (ga - be * Y) / al; }
          if (X >= X0 - 1e-9 && X <= X1 + 1e-9 && Y >= Y0 - 1e-9 && Y <= Y1 + 1e-9) pts.push([X, Y]);
        });
        return pts.length >= 2 ? [pts[0], pts[pts.length - 1]] : null;
      }
      P.drag(function (x, y) {
        if (!box) return;
        probe = [U.clamp(IX(x), X0, X1), U.clamp(IY(y), Y0, Y1)]; P.render();
      });
      P.draw = function (w, h) {
        box = { x0: 52, x1: w - 14, y0: 24, y1: h - 40 };
        var cons = opCons(S), o = '', i;
        var poly = [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]];
        cons.forEach(function (c) { if (poly.length) poly = clipPoly(poly, c); });
        o += U.axes({ x0: box.x0, x1: box.x1, y0: box.y0, y1: box.y1, sx: function (n) { return PX(Math.log(n)); }, sy: function (f) { return PY(Math.log(f)); }, xt: [200, 300, 500, 1000, 2000, 3000], yt: [0.05, 0.1, 0.2, 0.3, 0.5, 1], xgrid: true, yf: function (t) { return fmt(t, 2); }, xl: 'n, 1/min', yl: 'f, mm' });
        // −45°-os egyenesek: n·f = L/t_l (állandó főidő)
        [0.25, 0.4, 0.6, 1, 1.6].forEach(function (tl) {
          var sg = lineSeg(1, 1, Math.log(OP.L / tl)); if (!sg) return;
          o += '<line class="ln th dash" style="stroke:var(--muted)" x1="' + PX(sg[0][0]).toFixed(1) + '" y1="' + PY(sg[0][1]).toFixed(1) + '" x2="' + PX(sg[1][0]).toFixed(1) + '" y2="' + PY(sg[1][1]).toFixed(1) + '"/>';
          var lp = sg[0][1] > sg[1][1] ? sg[0] : sg[1];
          o += '<text class="tk" x="' + (PX(lp[0]) + 4).toFixed(1) + '" y="' + (PY(lp[1]) + 11).toFixed(1) + '">t_l=' + fmt(tl, 2) + '</text>';
        });
        // éltartam-egyenesek: T = állandó
        [5, 15, 60].forEach(function (T) {
          var ga = Math.log(OP.k * OP.Cv / (Math.pow(T, OP.m) * Math.pow(OP.a, OP.xv)));
          var sg = lineSeg(1, OP.yv, ga); if (!sg) return;
          o += '<line class="ln th dot" style="stroke:var(--ix-4)" x1="' + PX(sg[0][0]).toFixed(1) + '" y1="' + PY(sg[0][1]).toFixed(1) + '" x2="' + PX(sg[1][0]).toFixed(1) + '" y2="' + PY(sg[1][1]).toFixed(1) + '"/>';
          var tp = sg[0][1] < sg[1][1] ? sg[0] : sg[1];
          o += '<text class="sm" style="fill:var(--ix-4)" x="' + (PX(tp[0]) + 3).toFixed(1) + '" y="' + (PY(tp[1]) - 6).toFixed(1) + '">T=' + T + '′</text>';
        });
        if (poly.length >= 3) o += '<path class="fa" d="' + U.path(poly.map(function (p) { return [PX(p[0]), PY(p[1])]; })) + 'Z"/>';
        // korlátegyenesek sorszámmal
        cons.forEach(function (c, k) {
          var sg = lineSeg(c.al, c.be, c.ga); if (!sg) return;
          o += '<line class="ln th" style="stroke:var(--ink-2)" x1="' + PX(sg[0][0]).toFixed(1) + '" y1="' + PY(sg[0][1]).toFixed(1) + '" x2="' + PX(sg[1][0]).toFixed(1) + '" y2="' + PY(sg[1][1]).toFixed(1) + '"/>';
          var mx = PX(sg[0][0] + (sg[1][0] - sg[0][0]) * (0.18 + 0.1 * (k % 3))), my = PY(sg[0][1] + (sg[1][1] - sg[0][1]) * (0.18 + 0.1 * (k % 3)));
          o += '<circle cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="8" style="fill:var(--surface);stroke:var(--ink-2)"/><text class="sm" x="' + mx.toFixed(1) + '" y="' + (my + 3.5).toFixed(1) + '" text-anchor="middle">' + (k + 1) + '</text>';
        });
        leg.innerHTML = cons.map(function (c, k) { return '<b>' + (k + 1) + '</b> ' + esc(c.n); }).join(' · ') + ' · <span style="color:var(--ix-4)">pontozott: T = állandó éltartam</span> · szaggatott: t<sub>l</sub> = állandó főidő (−45°)';
        if (poly.length < 3) {
          P.svg.innerHTML = o;
          out.innerHTML = '<h4><small>Üres keresési tartomány</small>Nincs megoldás</h4><p>A korlátoknak nincs közös része — vissza kell lépni a felsőbb tervezési szintre (más szerszám, gép vagy érdességi előírás): ez a <b>visszacsatolás</b>.</p>';
          return;
        }
        // optimumesélyes határvonal: azok az élek, amelyeken a (−1, +1) irányú sugár kilép
        var edges = [];
        for (i = 0; i < poly.length; i++) {
          var A = poly[i], B = poly[(i + 1) % poly.length], cid = -1;
          cons.forEach(function (c, k) {
            if (Math.abs(c.al * A[0] + c.be * A[1] - c.ga) < 1e-7 && Math.abs(c.al * B[0] + c.be * B[1] - c.ga) < 1e-7) cid = k;
          });
          var al = cid >= 0 ? cons[cid].al : 0, be = cid >= 0 ? cons[cid].be : 0;
          edges.push({ A: A, B: B, c: cid, esely: cid >= 0 && (-al + be) > 1e-9 });
        }
        edges.forEach(function (e) {
          if (e.esely) o += '<line class="ln bd acc" x1="' + PX(e.A[0]).toFixed(1) + '" y1="' + PY(e.A[1]).toFixed(1) + '" x2="' + PX(e.B[0]).toFixed(1) + '" y2="' + PY(e.B[1]).toFixed(1) + '"/>';
        });
        // optimum: a határ mintavételezése
        var best = null;
        edges.forEach(function (e) {
          for (var s = 0; s <= 400; s++) {
            var u = s / 400, X = e.A[0] + u * (e.B[0] - e.A[0]), Y = e.A[1] + u * (e.B[1] - e.A[1]), r = opEval(X, Y, S.obj);
            if (!best || r.val < best.r.val) best = { X: X, Y: Y, r: r, e: e, u: u };
          }
        });
        var bx = PX(best.X), by = PY(best.Y);
        o += '<circle class="mk" cx="' + bx.toFixed(1) + '" cy="' + by.toFixed(1) + '" r="7"/><text class="la" x="' + (bx + 11).toFixed(1) + '" y="' + (by - 9).toFixed(1) + '">optimum</text>';
        if (!probe) { var cx = 0, cy = 0; poly.forEach(function (p) { cx += p[0]; cy += p[1]; }); probe = [cx / poly.length, cy / poly.length]; }
        var pr = opEval(probe[0], probe[1], S.obj), inside = cons.every(function (c) { return c.al * probe[0] + c.be * probe[1] <= c.ga + 1e-9; });
        var ppx = PX(probe[0]), ppy = PY(probe[1]);
        o += '<circle cx="' + ppx.toFixed(1) + '" cy="' + ppy.toFixed(1) + '" r="6.5" style="fill:' + (inside ? 'var(--ink)' : 'var(--ix-5)') + ';stroke:var(--surface-2);stroke-width:2"/>';
        P.svg.innerHTML = o;
        var vertex = best.u < 0.004 || best.u > 0.996, CT = S.obj === 't' ? OP.tcs : OP.Ksz / OP.CM + OP.tcs;
        var where = vertex ? 'a határvonal egyik <b>csúcspontjában</b> (két korlát metszéspontja)' : 'a(z) ' + (best.e.c + 1) + '. korlát <b>szakaszának belsejében</b> — itt van a szakasz lokális szélsőértéke';
        var unit = S.obj === 't' ? ' perc' : ' Ft';
        out.innerHTML = '<h4><small>' + (S.obj === 't' ? 'Legkisebb idő' : 'Legkisebb költség') + '</small>Optimum: n = ' + fmt(best.r.n, 0) + ' 1/min, f = ' + fmt(best.r.f, 3) + ' mm</h4>' +
          '<p>' + (S.obj === 't' ? 'Célfüggvény: <b>t = t<sub>l</sub>·(1 + t<sub>cs</sub>/T) → min</b> (C<sub>T</sub> = t<sub>cs</sub> = 2 perc).' : 'Célfüggvény: <b>K = C<sub>M</sub>·t<sub>l</sub>·(1 + C<sub>T</sub>/T) → min</b>, C<sub>M</sub> = 100 Ft/perc, C<sub>T</sub> = K<sub>sz</sub>/C<sub>M</sub> + t<sub>cs</sub> = 3 + 2 = 5 perc.') + ' Az optimum ' + where + '. Vízszintes (f = állandó) szakaszon a szélsőérték-éltartam T<sub>sz</sub> = (1 − m)/m · C<sub>T</sub> = ' + fmt((1 - OP.m) / OP.m * CT, 0) + ' perc (m = 0,25).</p>' +
          U.kv([
            ['v az optimumban', fmt(best.r.v, 0) + ' m/min', 'T = ' + fmt(best.r.T, 1) + ' perc éltartam'],
            ['t_l = L/(n·f)', fmt(best.r.tl, 3) + ' perc', 'főidő'],
            [S.obj === 't' ? 't (optimum)' : 'K (optimum)', fmt(best.r.val, S.obj === 't' ? 3 : 1) + unit, ''],
            ['A húzott pont', fmt(pr.n, 0) + ' 1/min · ' + fmt(pr.f, 3) + ' mm', inside ? ((S.obj === 't' ? 't = ' + fmt(pr.val, 3) : 'K = ' + fmt(pr.val, 1)) + unit + ' → +' + fmt((pr.val / best.r.val - 1) * 100, 1) + ' % az optimumhoz képest') : 'a tartományon kívül esik: nem megengedett'],
          ]) + '<p class="ix-note">Idő-optimumnál a C<sub>T</sub> kisebb, ezért az optimum a nagyobb fordulatszám felé tolódik — kapcsolj át, és nézd meg. A teljesítménykorlát (6) itt nem optimumesélyes: állandó főidő (n·f = áll.) mellett nagyobb előtolással kisebb a teljesítményigény (P ~ n·f<sup>0,75</sup>), ezért a −45°-os egyenesen felfelé haladva eltávolodunk tőle.</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/03 — heurisztikus algoritmus: „dörzsölés” típusú műveletelem-ciklus */
  /* ================================================================== */
  var FA = {
    nodes: {
      d1: { t: 'd', x: 120, y: 40, l: ['Tömör anyag?'] },
      d2: { t: 'd', x: 120, y: 125, l: ['Felület sima,', 'előmunkált?'] },
      d3: { t: 'd', x: 318, y: 125, l: ['Fokozott helyzet-', 'pontosság?'] },
      kf: { t: 'b', x: 120, y: 205, l: ['Központfúrás'] },
      fu: { t: 'b', x: 120, y: 280, l: ['Fúrás, felfúrás', 'a süllyesztési átmérőig'] },
      su: { t: 'b', x: 120, y: 355, l: ['Süllyesztés'] },
      d4: { t: 'd', x: 120, y: 435, l: ['Élletörés van?'] },
      ek: { t: 'b', x: 318, y: 435, l: ['Élletörés', 'kúpsüllyesztéssel'] },
      do: { t: 'b', x: 120, y: 515, l: ['Dörzsölés'] },
    },
    edges: [
      { f: 'd1', to: 'd2', p: [[120, 62], [120, 101]], lb: ['igen', 128, 86] },
      { f: 'd1', to: 'su', p: [[182, 40], [420, 40], [420, 355], [196, 355]], lb: ['nem', 190, 34] },
      { f: 'd2', to: 'kf', p: [[120, 149], [120, 187]], lb: ['nem', 128, 172] },
      { f: 'd2', to: 'd3', p: [[182, 125], [254, 125]], lb: ['igen', 190, 119] },
      { f: 'd3', to: 'kf', p: [[318, 149], [318, 205], [196, 205]], lb: ['igen', 326, 172] },
      { f: 'd3', to: 'fu', p: [[380, 125], [400, 125], [400, 280], [196, 280]], lb: ['nem', 372, 110] },
      { f: 'kf', to: 'fu', p: [[120, 223], [120, 260]] },
      { f: 'fu', to: 'su', p: [[120, 300], [120, 337]] },
      { f: 'su', to: 'd4', p: [[120, 373], [120, 411]] },
      { f: 'd4', to: 'do', p: [[120, 459], [120, 497]], lb: ['nincs', 128, 482] },
      { f: 'd4', to: 'ek', p: [[182, 435], [242, 435]], lb: ['igen', 190, 429] },
      { f: 'ek', to: 'do', p: [[318, 455], [318, 515], [196, 515]] },
    ],
  };
  var FA_TXT = {
    kf: 'Központfúrás — kijelöli a furat helyét, hogy a fúró ne vándoroljon el (nem sima felület vagy fokozott helyzetpontosság miatt).',
    fu: 'Fúrás, szükség esetén felfúrás — a tömör anyagból a süllyesztési átmérőig.',
    su: 'Süllyesztés — a furat alakját és helyzetét javítja, egyenletes ráhagyást hagy a dörzsölésre.',
    ek: 'Élletörés kúpsüllyesztéssel — a befejező dörzsölés elé kerül, hogy a dörzsölt felület ne sérüljön.',
    do: 'Dörzsölés — befejező megmunkálás: méret- és alakpontosság, felületi érdesség.',
  };
  AVIX.def('furatalg', {
    title: 'Furatmegmunkálás műveletelemei — heurisztikus algoritmus',
    sub: 'A jegyzet 1.9. ábrája: „dörzsölés” típusú műveletelem-ciklus — válaszolj a kérdésekre, és kövesd az utat',
    mount: function (el) {
      var st = U.store('furatalg', { tomor: 'i', sima: 'n', pont: 'n', el: 'i' }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Heurisztikus algoritmus: a döntések gyakorlati tapasztalatra épülnek. <b>Állítsd be a furat adatait</b> — az algoritmus eldönti, kell-e központfúrás, fúrás, süllyesztés és élletörés a befejező dörzsölés előtt.</p>';
      var qs = U.h('div'); el.appendChild(qs);
      var Q = [['tomor', 'Tömör anyagba készül a furat?'], ['sima', 'A felület sima, előmunkált?'], ['pont', 'Fokozott helyzetpontosság kell?'], ['el', 'Van élletörés a furat szélén?']];
      var segs = {};
      Q.forEach(function (q) {
        var r = U.h('div', 'ix-row'); r.innerHTML = '<span style="min-width:230px;font-size:14px;color:var(--ink-2)">' + q[1] + '</span>'; qs.appendChild(r);
        segs[q[0]] = { row: r, seg: U.seg(r, [['i', 'igen'], ['n', 'nem']], S[q[0]], function (v) { S[q[0]] = v; st.set(S); draw(); }, q[1]) };
      });
      var wrap = U.h('div', 'ix-plot'); el.appendChild(wrap);
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function path() {
        var p = ['d1'];
        if (S.tomor === 'i') {
          p.push('d2');
          if (S.sima === 'n') p.push('kf');
          else { p.push('d3'); if (S.pont === 'i') p.push('kf'); }
          p.push('fu');
        }
        p.push('su', 'd4');
        if (S.el === 'i') p.push('ek');
        p.push('do');
        return p;
      }
      function draw() {
        segs.sima.row.style.opacity = S.tomor === 'i' ? '1' : '.4';
        segs.pont.row.style.opacity = S.tomor === 'i' && S.sima === 'i' ? '1' : '.4';
        var p = path(), on = {}, o = '<svg class="ix-svg" viewBox="0 0 432 540" style="max-width:560px;margin:0 auto" role="img" aria-label="Az algoritmus folyamatábrája">';
        o += '<defs><marker id="fa-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" style="fill:var(--muted)"/></marker><marker id="fa-ara" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" style="fill:var(--acc)"/></marker></defs>';
        p.forEach(function (id, i) { on[id] = true; if (i) on[p[i - 1] + '>' + id] = true; });
        FA.edges.forEach(function (e) {
          var a = on[e.f + '>' + e.to];
          o += '<path d="' + U.path(e.p) + '" style="fill:none;stroke:' + (a ? 'var(--acc)' : 'var(--rule-2)') + ';stroke-width:' + (a ? 2.6 : 1.3) + '" marker-end="url(#' + (a ? 'fa-ara' : 'fa-ar') + ')"/>';
          if (e.lb) o += '<text class="sm' + (a ? ' la' : '') + '" x="' + e.lb[1] + '" y="' + e.lb[2] + '">' + e.lb[0] + '</text>';
        });
        Object.keys(FA.nodes).forEach(function (id) {
          var n = FA.nodes[id], a = on[id], sty = 'fill:' + (a ? 'var(--acc-soft)' : 'var(--surface)') + ';stroke:' + (a ? 'var(--acc)' : 'var(--rule-2)') + ';stroke-width:' + (a ? 2 : 1.2);
          if (n.t === 'd') o += '<path d="M' + n.x + ',' + (n.y - 24) + 'L' + (n.x + 62) + ',' + n.y + 'L' + n.x + ',' + (n.y + 24) + 'L' + (n.x - 62) + ',' + n.y + 'Z" style="' + sty + '"/>';
          else o += '<rect x="' + (n.x - 76) + '" y="' + (n.y - 19) + '" width="152" height="38" rx="8" style="' + sty + '"/>';
          n.l.forEach(function (s, k) { o += '<text x="' + n.x + '" y="' + (n.y + 4 + (k - (n.l.length - 1) / 2) * 13).toFixed(1) + '" text-anchor="middle" style="font-size:11.5px;' + (a ? 'font-weight:700;fill:var(--ink)' : '') + '">' + esc(s) + '</text>'; });
        });
        wrap.innerHTML = o + '</svg>';
        var steps = p.filter(function (id) { return FA_TXT[id]; });
        out.innerHTML = '<h4><small>Generált műveletelem-sorrend</small>' + steps.length + ' műveletelem</h4><ol style="margin:6px 0 0 18px;font-size:14.5px;line-height:1.5">' + steps.map(function (id) { return '<li>' + esc(FA_TXT[id]) + '</li>'; }).join('') + '</ol>' +
          (S.tomor === 'n' ? '<p class="ix-note">Előfuratos (öntött, kovácsolt vagy előmunkált) darabnál a fúrás elmarad, az algoritmus rögtön a süllyesztéssel kezd.</p>' : '');
      }
      draw();
    },
  });

  /* ================================================================== */
  /* Közös: forgástest-vázlat (felül nézet, alul metszet)                */
  /* ================================================================== */
  // spec: {segs:[[hossz, r0, r1]], bore:[[hossz, r0, r1]], thread:i, spline:i, gear:i, key:i, hole:i, flat:i, groove:[i], grind:[i]}
  function shaftSVG(spec, x0, y0, w, h, id, opt) {
    opt = opt || {};
    var L = 0, R = 0, o = '';
    spec.segs.forEach(function (s) { L += s[0]; R = Math.max(R, s[1], s[2]); });
    var sc = Math.min(w / L, (h / 2) / R), cx = x0 + (w - L * sc) / 2, cy = y0 + h / 2;
    function X(v) { return (cx + v * sc).toFixed(1); }
    function Yu(r) { return (cy - r * sc).toFixed(1); }
    function Yd(r) { return (cy + r * sc).toFixed(1); }
    var xs = [], x = 0;
    spec.segs.forEach(function (s) { xs.push(x); x += s[0]; });
    // külső kontúr (felső fél)
    var up = 'M' + X(0) + ',' + cy.toFixed(1), dn = 'M' + X(0) + ',' + cy.toFixed(1);
    spec.segs.forEach(function (s, i) { up += 'L' + X(xs[i]) + ',' + Yu(s[1]) + 'L' + X(xs[i] + s[0]) + ',' + Yu(s[2]); dn += 'L' + X(xs[i]) + ',' + Yd(s[1]) + 'L' + X(xs[i] + s[0]) + ',' + Yd(s[2]); });
    up += 'L' + X(L) + ',' + cy.toFixed(1); dn += 'L' + X(L) + ',' + cy.toFixed(1);
    // alsó fél metszetben: anyag = külső − furat
    var bore = spec.bore || [], bx = [], b = 0;
    bore.forEach(function (s) { bx.push(b); b += s[0]; });
    var mat = dn;
    if (bore.length) {
      mat = 'M' + X(0) + ',' + Yd(bore[0][1]);
      spec.segs.forEach(function (s, i) { mat += 'L' + X(xs[i]) + ',' + Yd(s[1]) + 'L' + X(xs[i] + s[0]) + ',' + Yd(s[2]); });
      for (var k = bore.length - 1; k >= 0; k--) mat += 'L' + X(bx[k] + bore[k][0]) + ',' + Yd(bore[k][2]) + 'L' + X(bx[k]) + ',' + Yd(bore[k][1]);
      mat += 'Z';
    } else mat += 'Z';
    o += '<defs><pattern id="' + id + '-h" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" style="stroke:var(--muted);stroke-width:1"/></pattern></defs>';
    o += '<path d="' + up + 'Z" style="fill:var(--surface);stroke:none"/>';
    o += '<path d="' + mat + '" style="fill:url(#' + id + '-h);stroke:var(--ink);stroke-width:1.5;stroke-linejoin:round"/>';
    o += '<path d="' + up + '" style="fill:none;stroke:var(--ink);stroke-width:1.6;stroke-linejoin:round"/>';
    // vállvonalak a nézeten
    spec.segs.forEach(function (s, i) { if (i) o += '<line x1="' + X(xs[i]) + '" x2="' + X(xs[i]) + '" y1="' + cy.toFixed(1) + '" y2="' + Yu(Math.max(s[1], spec.segs[i - 1][2])) + '" style="stroke:var(--ink);stroke-width:1.2"/>'; });
    // furat rejtett vonallal a nézeten
    bore.forEach(function (s, i) {
      o += '<line x1="' + X(bx[i]) + '" y1="' + Yu(s[1]) + '" x2="' + X(bx[i] + s[0]) + '" y2="' + Yu(s[2]) + '" style="stroke:var(--muted);stroke-width:1;stroke-dasharray:4 3"/>';
      if (i) o += '<line x1="' + X(bx[i]) + '" x2="' + X(bx[i]) + '" y1="' + Yu(bore[i - 1][2]) + '" y2="' + Yu(s[1]) + '" style="stroke:var(--muted);stroke-width:1;stroke-dasharray:4 3"/>';
    });
    function seg(i) { i = Math.max(0, Math.min(spec.segs.length - 1, i)); return { x0: xs[i], x1: xs[i] + spec.segs[i][0], r: Math.min(spec.segs[i][1], spec.segs[i][2]), rm: Math.max(spec.segs[i][1], spec.segs[i][2]) }; }
    var ac = 'var(--acc)';
    if (spec.thread != null) { // menet: vékony magvonal + ferde vonalkák
      var t = seg(spec.thread), rr = t.r * 0.84;
      o += '<line x1="' + X(t.x0 + 2) + '" x2="' + X(t.x1) + '" y1="' + Yu(rr) + '" y2="' + Yu(rr) + '" style="stroke:' + ac + ';stroke-width:1"/>';
      for (var q = t.x0 + 3; q < t.x1 - 1; q += Math.max(2.5, (t.x1 - t.x0) / 10)) o += '<line x1="' + X(q) + '" x2="' + X(q + 1.6) + '" y1="' + Yu(t.r) + '" y2="' + Yu(rr) + '" style="stroke:' + ac + ';stroke-width:1"/>';
    }
    if (spec.spline != null) { // bordás felület
      var sp = seg(spec.spline);
      for (var q2 = sp.x0 + 2; q2 < sp.x1 - 1; q2 += Math.max(2, (sp.x1 - sp.x0) / 12)) o += '<line x1="' + X(q2) + '" x2="' + X(q2) + '" y1="' + Yu(sp.r) + '" y2="' + Yu(sp.r * 0.8) + '" style="stroke:' + ac + ';stroke-width:1.4"/>';
    }
    if (spec.gear != null) { // fogazás: cikcakk + osztókör
      var gr = seg(spec.gear), zz = 'M' + X(gr.x0) + ',' + Yu(gr.rm), n = 10, dx = (gr.x1 - gr.x0) / n;
      for (var j = 0; j < n; j++) zz += 'L' + X(gr.x0 + (j + 0.5) * dx) + ',' + Yu(gr.rm * 1.08) + 'L' + X(gr.x0 + (j + 1) * dx) + ',' + Yu(gr.rm);
      o += '<path d="' + zz + '" style="fill:none;stroke:' + ac + ';stroke-width:1.4"/><line x1="' + X(gr.x0) + '" x2="' + X(gr.x1) + '" y1="' + Yu(gr.rm * 0.95) + '" y2="' + Yu(gr.rm * 0.95) + '" style="stroke:' + ac + ';stroke-width:1;stroke-dasharray:8 3 2 3"/>';
    }
    if (spec.key != null) { // reteszhorony (felülnézet)
      var ky = seg(spec.key), kl = (ky.x1 - ky.x0) * 0.6, kx = ky.x0 + (ky.x1 - ky.x0) * 0.2, kh = ky.r * 0.5;
      o += '<rect x="' + X(kx) + '" y="' + Yu(ky.r * 0.72) + '" width="' + (kl * sc).toFixed(1) + '" height="' + (kh * sc * 0.55).toFixed(1) + '" rx="' + (kh * sc * 0.27).toFixed(1) + '" style="fill:var(--surface-2);stroke:' + ac + ';stroke-width:1.4"/>';
    }
    if (spec.hole != null) { // keresztfurat
      var hl = seg(spec.hole), hx = (hl.x0 + hl.x1) / 2, hr = hl.r * 0.28;
      o += '<circle cx="' + X(hx) + '" cy="' + Yu(hl.r * 0.45) + '" r="' + (hr * sc).toFixed(1) + '" style="fill:var(--surface-2);stroke:' + ac + ';stroke-width:1.4"/>';
    }
    if (spec.flat != null) { // síkfelület (lelapolás): átlós vékony vonalak
      var fl = seg(spec.flat), fa = fl.x0 + (fl.x1 - fl.x0) * 0.25, fb = fl.x1 - (fl.x1 - fl.x0) * 0.25;
      o += '<rect x="' + X(fa) + '" y="' + Yu(fl.r * 0.95) + '" width="' + ((fb - fa) * sc).toFixed(1) + '" height="' + (fl.r * 0.55 * sc).toFixed(1) + '" style="fill:none;stroke:' + ac + ';stroke-width:1.2"/>';
      o += '<path d="M' + X(fa) + ',' + Yu(fl.r * 0.95) + 'L' + X(fb) + ',' + Yu(fl.r * 0.4) + 'M' + X(fb) + ',' + Yu(fl.r * 0.95) + 'L' + X(fa) + ',' + Yu(fl.r * 0.4) + '" style="stroke:' + ac + ';stroke-width:.9"/>';
    }
    (spec.groove || []).forEach(function (i) { // beszúrás a szakasz végén
      var gv = seg(i), gx = gv.x1 - Math.min(4, (gv.x1 - gv.x0) * 0.15);
      o += '<rect x="' + X(gx - 1.2) + '" y="' + Yu(gv.r) + '" width="' + (2.4 * sc).toFixed(1) + '" height="' + (gv.r * 0.14 * sc).toFixed(1) + '" style="fill:var(--surface-2);stroke:' + ac + ';stroke-width:1.3"/>';
    });
    (spec.grind || []).forEach(function (i) { // köszörült palást: jelölés
      var gd = seg(i), gx2 = (gd.x0 + gd.x1) / 2;
      o += '<path d="M' + X(gx2 - 2) + ',' + (+Yu(gd.rm) - 12) + 'l' + (2 * sc).toFixed(1) + ',10 l' + (2 * sc).toFixed(1) + ',-10" style="fill:none;stroke:' + ac + ';stroke-width:1.2"/>';
    });
    // tengelyvonal
    o += '<line x1="' + (cx - 8).toFixed(1) + '" x2="' + (cx + L * sc + 8).toFixed(1) + '" y1="' + cy.toFixed(1) + '" y2="' + cy.toFixed(1) + '" style="stroke:var(--muted);stroke-width:1;stroke-dasharray:14 3 2 3"/>';
    if (opt.dims) {
      o += '<line x1="' + X(0) + '" x2="' + X(L) + '" y1="' + (+Yd(R) + 16) + '" y2="' + (+Yd(R) + 16) + '" style="stroke:var(--ink-2);stroke-width:1" marker-start="url(#' + id + '-ms)" marker-end="url(#' + id + '-m)"/>';
      o += '<defs><marker id="' + id + '-m" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0L10,5L0,10z" style="fill:var(--ink-2)"/></marker><marker id="' + id + '-ms" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M10,0L0,5L10,10z" style="fill:var(--ink-2)"/></marker></defs>';
      o += '<text class="sm" x="' + ((+X(0) + +X(L)) / 2).toFixed(1) + '" y="' + (+Yd(R) + 30) + '" text-anchor="middle">L = ' + fmt(L, 0) + ' mm</text>';
      o += '<text class="sm" x="' + (+X(0) - 6).toFixed(1) + '" y="' + (+Yu(R) + 4).toFixed(1) + '" text-anchor="end">Ø' + fmt(2 * R, 0) + '</text>';
    }
    return o;
  }

  /* ================================================================== */
  /* B/04 — alkatrész technológiai kódja (jegyzet 7.1, 7.4. ábra)        */
  /* ================================================================== */
  var TK = {
    kulso: [['1', 'hengeres'], ['2', 'hengeres, kúpos'], ['3', 'lépcsős egyik irányban'], ['4', 'lépcsős egyik irányban + kúpos'], ['5', 'lépcsős mindkét irányban']],
    belso: [['0', 'nincs'], ['1', 'hengeres'], ['2', 'hengeres, kúpos'], ['3', 'lépcsős egyik irányban'], ['4', 'lépcsős egyik irányban, kúppal'], ['5', 'lépcsős mindkét irányban']],
    m1: [['0', 'nincs'], ['1', 'menet'], ['2', 'bordás felület'], ['3', 'fogazás']],
    m2: [['0', 'nincs'], ['1', 'horony'], ['2', 'rögzítő furat'], ['3', 'síkok, sokszögalakzatok']],
    anyag: [['1', 'acél'], ['2', 'ötvözött acél'], ['3', 'öntöttvas']],
    elo: [['1', 'rúd'], ['2', 'cső'], ['3', 'süllyesztékes kovácsdarab'], ['4', 'öntvény'], ['5', 'lemez']],
    it: [['1', 'IT5-ig'], ['2', 'IT6–IT7'], ['3', 'IT8–IT9']],
    hok: [['1', 'hőkezelés nincs'], ['2', 'izzítás'], ['3', 'normalizálás'], ['4', 'nemesítés'], ['5', 'edzés']],
  };
  var TK_EX = { L: 220, D: 40, kulso: '5', belso: '0', m1: '1', m2: '1', anyag: '1', elo: '1', it: '2', hok: '1' };
  function tkLd(ld) { return ld < 0.5 ? 1 : ld < 1 ? 2 : ld < 3 ? 3 : ld <= 6 ? 4 : 5; }
  function tkDm(D) { return D <= 10 ? 1 : D <= 25 ? 2 : D <= 50 ? 3 : 4; }
  function tkSpec(S) {
    var L = S.L, R = S.D / 2, segs, bore = [];
    var prof = {
      1: [[1, 1, 1]],
      2: [[0.72, 1, 1], [0.28, 1, 0.66]],
      3: [[0.4, 1, 1], [0.35, 0.8, 0.8], [0.25, 0.62, 0.62]],
      4: [[0.36, 1, 1], [0.34, 0.8, 0.8], [0.3, 0.72, 0.54]],
      5: [[0.18, 0.66, 0.66], [0.18, 0.83, 0.83], [0.3, 1, 1], [0.16, 0.83, 0.83], [0.18, 0.66, 0.66]],
    }[S.kulso];
    segs = prof.map(function (p) { return [p[0] * L, p[1] * R, p[2] * R]; });
    var bp = { 0: [], 1: [[1, 0.34, 0.34]], 2: [[0.7, 0.34, 0.34], [0.3, 0.34, 0.48]], 3: [[0.5, 0.42, 0.42], [0.5, 0.28, 0.28]], 4: [[0.4, 0.44, 0.44], [0.35, 0.3, 0.3], [0.25, 0.3, 0.44]], 5: [[0.25, 0.28, 0.28], [0.5, 0.42, 0.42], [0.25, 0.28, 0.28]] }[S.belso];
    bore = bp.map(function (p) { return [p[0] * L, p[1] * R, p[2] * R]; });
    var last = segs.length - 1, mid = Math.floor(segs.length / 2);
    var sp = { segs: segs, bore: bore };
    if (S.m1 === '1') sp.thread = last;
    if (S.m1 === '2') sp.spline = 0;
    if (S.m1 === '3') sp.gear = S.kulso === '5' ? mid : 0;
    if (S.m2 === '1') sp.key = segs.length > 2 ? 1 : 0;
    if (S.m2 === '2') sp.hole = segs.length > 2 ? 1 : 0;
    if (S.m2 === '3') sp.flat = segs.length > 2 ? segs.length - 2 : 0;
    return sp;
  }
  AVIX.def('tkod', {
    title: 'Az alkatrész technológiai kódja',
    sub: 'A jegyzet 11 jegyű osztályozókódja forgástestekre — kódolás a műhelyrajzból és visszafejtés',
    mount: function (el) {
      var st = U.store('tkod', TK_EX), S = st.get();
      el.innerHTML = '<p class="ix-lead">A kód a műhelyrajzból meghatározható: alak, méret, pontosság, anyag, előgyártmány, hőkezelés. <b>Állítsd a jellemzőket</b> — a vázlat és a kód együtt változik. A hasonló kódú alkatrészek egy technológiai csoportba, közös típustechnológiához kerülnek.</p>';
      var codeBox = U.h('div'); codeBox.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;margin:0 0 10px'; el.appendChild(codeBox);
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.62 : 0.36; }, minH: 190, maxH: 300, label: 'Az alkatrész vázlata' });
      var g = U.sliders(el);
      var sL = U.slider(g, { label: 'Hossz l', min: 10, max: 600, step: 5, value: S.L, unit: 'mm', dec: 0, onInput: function (v) { S.L = v; upd(); } });
      var sD = U.slider(g, { label: 'Dmax', min: 4, max: 100, step: 1, value: S.D, unit: 'mm', dec: 0, onInput: function (v) { S.D = v; upd(); } });
      var chipRows = {};
      [['kulso', '3. Külső felületek'], ['belso', '4. Belső felületek'], ['m1', '5. Mellékelemek I.'], ['m2', '6. Mellékelemek II.'], ['anyag', '8. Anyag'], ['elo', '9. Előgyártmány'], ['it', '10. IT-osztály'], ['hok', '11. Hőkezelés']].forEach(function (f) {
        var lab = U.h('div', 'ix-note', f[1]); lab.style.margin = '8px 0 4px'; el.appendChild(lab);
        chipRows[f[0]] = U.chips(el, TK[f[0]].map(function (it) { return [it[0], it[0] + ' · ' + it[1]]; }), S[f[0]], function (v) { S[f[0]] = v; upd(); }, f[1]);
      });
      var tools = U.h('div', 'ix-row'); tools.style.marginTop = '12px'; el.appendChild(tools);
      var ex = U.h('button', 'ix-btn', 'A jegyzet példája (7.4. ábra)'); ex.type = 'button'; tools.appendChild(ex);
      var inp = U.h('input'); inp.type = 'text'; inp.inputMode = 'numeric'; inp.placeholder = 'Kód visszafejtése, pl. 14501131121'; inp.setAttribute('aria-label', 'Technológiai kód visszafejtése');
      inp.style.cssText = 'flex:1;min-width:200px;min-height:38px;padding:0 10px;border:1px solid var(--rule-2);border-radius:9px;background:var(--surface);color:var(--ink);font:500 15px var(--mono)';
      tools.appendChild(inp);
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function digits() {
        return ['1', String(tkLd(S.L / S.D)), S.kulso, S.belso, S.m1, S.m2, String(tkDm(S.D)), S.anyag, S.elo, S.it, S.hok];
      }
      var LAB = ['alaptípus', 'l/d', 'külső', 'belső', 'mell. I', 'mell. II', 'Dmax', 'anyag', 'előgy.', 'IT', 'hőkez.'];
      function upd() {
        st.set(S);
        var d = digits();
        codeBox.innerHTML = d.map(function (c, i) {
          var warn = (i === 1 && c === '5');
          return '<div style="display:grid;justify-items:center;gap:2px;min-width:44px"><b style="display:flex;align-items:center;justify-content:center;width:40px;height:44px;border-radius:8px;background:' + (i === 1 || i === 6 ? 'var(--surface-2)' : 'var(--acc-soft)') + ';border:1px solid ' + (warn ? 'var(--ix-5)' : 'var(--acc-line)') + ';font:700 22px var(--mono);color:var(--ink)">' + c + '</b><small style="font-size:10.5px;color:var(--muted)">' + (i + 1) + '. ' + LAB[i] + '</small></div>';
        }).join('');
        P.render();
        var ld = S.L / S.D;
        out.innerHTML = '<h4><small>Technológiai kód</small>' + d.join(' ') + '</h4><p>Forgástest; l/d = ' + fmt(ld, 2) + (ld > 6 ? ' — <b>a jegyzet listája l/d ≤ 6-ig tart</b> („…”), itt 5-öt írtunk' : '') + '; Dmax = Ø' + S.D + ' mm; ' +
          ['kulso', 'belso', 'm1', 'm2', 'anyag', 'elo', 'it', 'hok'].map(function (k) { return TK[k].filter(function (it) { return it[0] === S[k]; })[0][1]; }).join('; ') + '.</p>' +
          '<p class="ix-note">A 2. (l/d) és a 7. (Dmax) jegy a méretekből adódik (szürke mezők). A jegyzet listájában a „hőkezelés nincs” kódja 1, a 7.4. ábra példakódja (1 4 5 0 1 1 3 1 1 2 0) viszont 0-val zárul — a jegyzeten belüli ellentmondás; itt a listát követjük.</p>';
      }
      P.draw = function (w, h) {
        P.svg.innerHTML = shaftSVG(tkSpec(S), 50, 14, w - 80, h - 60, 'tk', { dims: true });
      };
      ex.addEventListener('click', function () {
        Object.keys(TK_EX).forEach(function (k) { S[k] = TK_EX[k]; });
        sL.set(S.L, true); sD.set(S.D, true);
        Object.keys(chipRows).forEach(function (k) { chipRows[k].set(S[k]); });
        inp.value = ''; upd();
      });
      inp.addEventListener('input', function () {
        var c = inp.value.replace(/\D/g, '');
        if (c.length !== 11) { inp.style.borderColor = c.length ? 'var(--ix-1)' : 'var(--rule-2)'; return; }
        var ok = c[0] === '1' && +c[1] >= 1 && +c[1] <= 5 && +c[6] >= 1 && +c[6] <= 4;
        var keys = ['kulso', 'belso', 'm1', 'm2', null, 'anyag', 'elo', 'it', 'hok'], pos = [2, 3, 4, 5, 6, 7, 8, 9, 10];
        keys.forEach(function (k, i) { if (k && !TK[k].some(function (it) { return it[0] === c[pos[i]]; })) ok = false; });
        inp.style.borderColor = ok ? 'var(--ok)' : 'var(--ix-5)';
        if (!ok) { out.innerHTML = '<h4><small>Visszafejtés</small>Érvénytelen kód</h4><p>A jegyzet forgástest-kódja 1-gyel kezdődik; minden helyiértéknek a táblázat valamelyik értékét kell felvennie (pl. 1 4 5 0 1 1 3 1 1 2 1).</p>'; return; }
        var D = [8, 18, 40, 75][+c[6] - 1], ld = [0.35, 0.75, 2, 4.5, 7][+c[1] - 1];
        S.D = D; S.L = Math.round(ld * D / 5) * 5 || 10;
        keys.forEach(function (k, i) { if (k) S[k] = c[pos[i]]; });
        sL.set(S.L, true); sD.set(S.D, true);
        Object.keys(chipRows).forEach(function (k) { chipRows[k].set(S[k]); });
        upd();
      });
      upd();
    },
  });

  /* ================================================================== */
  /* B/04 — reprezentáns alkatrész és típustechnológia (7.5. ábra)       */
  /* ================================================================== */
  var RP_OPS = [
    ['Darabolás (rúdból)', null], ['Homlokolás, központfúrás', null], ['Nagyoló esztergálás', null], ['Lépcsők simító esztergálása', 'lepcso'],
    ['Kúp esztergálása', 'kup'], ['Beszúrás', 'besz'], ['Menetesztergálás', 'menet'], ['Reteszhorony marása', 'horony'], ['Keresztfurat fúrása', 'furat'],
    ['Hőkezelés (edzés)', 'edzes'], ['Csapok köszörülése', 'kosz'], ['Végellenőrzés', null],
  ];
  var RP_FEAT = { lepcso: 'lépcsők', kup: 'kúp', besz: 'beszúrás', menet: 'menet', horony: 'reteszhorony', furat: 'keresztfurat', edzes: 'edzés', kosz: 'köszörült csap' };
  var RP_PARTS = {
    A: { n: 'Hajtótengely', f: ['lepcso', 'horony', 'kosz', 'edzes'], s: { segs: [[40, 15, 15], [90, 20, 20], [60, 15, 15]], key: 1, grind: [0, 2] } },
    B: { n: 'Orsó', f: ['lepcso', 'besz', 'menet'], s: { segs: [[70, 18, 18], [80, 14, 14], [40, 11, 11]], groove: [1], thread: 2 } },
    C: { n: 'Kúpos csap', f: ['lepcso', 'kup', 'kosz', 'edzes'], s: { segs: [[50, 16, 16], [80, 20, 20], [50, 16, 11]], grind: [0] } },
    D: { n: 'Tengelycsonk', f: ['lepcso', 'furat', 'horony', 'besz'], s: { segs: [[60, 20, 20], [70, 15, 15], [30, 12, 12]], key: 1, hole: 0, groove: [0] } },
    E: { n: 'Csavarorsó', f: ['menet'], s: { segs: [[160, 12, 12]], thread: 0 } },
  };
  var RP_REP = { segs: [[40, 15, 15], [80, 20, 20], [50, 16, 16], [30, 16, 12], [35, 12, 12]], key: 1, hole: 2, groove: [2], grind: [0, 2], thread: 4 };
  AVIX.def('reprez', {
    title: 'Reprezentáns alkatrész és típustechnológia',
    sub: 'A csoport minden felületelemét tartalmazó „gyűjtő” alkatrész — a konkrét folyamat elhagyással, átszámítással származik',
    mount: function (el) {
      var st = U.store('reprez', { p: 'R', full: 'i' }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Öt hasonló technológiájú forgástest egy csoportban. A <b>reprezentáns (komplex) alkatrész</b> — lehet kitalált is — minden felületelemüket tartalmazza; erre készül a típustechnológia. <b>Válassz egy konkrét alkatrészt</b>: a típustechnológiából elhagyjuk a rá nem vonatkozó műveleteket.</p>';
      var r1 = U.h('div', 'ix-row'); el.appendChild(r1);
      U.chips(r1, [['R', 'Reprezentáns']].concat(Object.keys(RP_PARTS).map(function (k) { return [k, k + ' · ' + RP_PARTS[k].n]; })), S.p, function (v) { S.p = v; st.set(S); draw(); }, 'Alkatrész');
      var r2 = U.h('div', 'ix-row'); el.appendChild(r2);
      r2.appendChild(U.h('span', 'ix-note', 'Reprezentáns:')).style.margin = '0';
      U.seg(r2, [['i', 'teljes'], ['n', 'hiányos (kúp és beszúrás nélkül)']], S.full, function (v) { S.full = v; st.set(S); draw(); }, 'Reprezentáns');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.5 : 0.28; }, minH: 150, maxH: 230, label: 'Az alkatrész vázlata' });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function repFeats() {
        var all = {};
        Object.keys(RP_PARTS).forEach(function (k) { RP_PARTS[k].f.forEach(function (f) { all[f] = true; }); });
        if (S.full === 'n') { delete all.kup; delete all.besz; }
        return all;
      }
      function draw() { P.render(); }
      P.draw = function (w, h) {
        var spec;
        if (S.p === 'R') {
          spec = JSON.parse(JSON.stringify(RP_REP));
          if (S.full === 'n') { spec.segs[3] = [30, 16, 16]; spec.groove = []; }
        } else spec = RP_PARTS[S.p].s;
        P.svg.innerHTML = shaftSVG(spec, 20, 10, w - 40, h - 20, 'rp');
        var rf = repFeats(), need = S.p === 'R' ? rf : {}, miss = [];
        if (S.p !== 'R') RP_PARTS[S.p].f.forEach(function (f) { need[f] = true; if (!rf[f]) miss.push(f); });
        var kept = 0;
        var list = RP_OPS.map(function (op, i) {
          var inRep = !op[1] || rf[op[1]], used = !op[1] || need[op[1]];
          if (!inRep) return '';
          if (used) kept++;
          return '<li style="' + (used ? '' : 'text-decoration:line-through;color:var(--muted)') + '">' + esc(op[0]) + (op[1] ? ' <small style="color:var(--muted)">(' + RP_FEAT[op[1]] + ')</small>' : '') + '</li>';
        }).join('');
        out.innerHTML = '<h4><small>' + (S.p === 'R' ? 'Típustechnológiai folyamat (a reprezentánsra)' : 'Származtatott folyamat: ' + S.p + ' · ' + RP_PARTS[S.p].n) + '</small>' + kept + ' művelet</h4><ol style="margin:6px 0 0 18px;font-size:14.5px;line-height:1.55">' + list + '</ol>' +
          (miss.length ? '<p class="ix-hint" style="border-left-color:var(--ix-5)"><b>Hiányzó művelet!</b> A reprezentáns nem tartalmazza: ' + miss.map(function (f) { return RP_FEAT[f]; }).join(', ') + ' — a típustechnológiából ez az alkatrész nem származtatható. Ezért kell, hogy a reprezentáns a csoport <b>összes</b> felületelemét hordozza.</p>' : '') +
          (S.p !== 'R' && !miss.length ? '<p class="ix-note">Az áthúzott műveletek elmaradnak; a megmaradók paramétereit (méretek, forgácsolási adatok) átszámítjuk. Sorrendtervezés szintjén ez problémamentes, művelettervezésnél a méretes szerszámok kiválasztása okozhat gondot.</p>' : '');
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/04 — csoportképzés alkatrész–gép mátrixszal (kitekintés)          */
  /* ================================================================== */
  var GT_MN = { M: 'marógép', E: 'eszterga', F: 'fúrógép', K: 'palástköszörű', S: 'síkköszörű', Fg: 'fogmarógép' };
  var GT_P = { P1: ['E', 'K', 'Fg'], P2: ['M', 'F', 'S'], P3: ['E', 'K', 'F'], P4: ['E', 'Fg'], P5: ['M', 'S'], P6: ['M', 'F'], P7: ['E', 'K'], P8: ['F', 'S', 'M'] };
  var GT_CELL = { E: 1, K: 1, Fg: 1, M: 2, F: 2, S: 2 };
  AVIX.def('gtcsop', {
    title: 'Alkatrészcsaládok és gyártócellák képzése',
    sub: 'Kitekintés: alkatrész–gép mátrix rendezése (King-féle ROC) → cellák, cellák közötti anyagmozgás',
    mount: function (el) {
      var rows = ['P3', 'P5', 'P1', 'P8', 'P4', 'P2', 'P7', 'P6'], cols = ['K', 'M', 'Fg', 'F', 'E', 'S'], steps = 0;
      function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
      el.innerHTML = '<p class="ix-lead">A csoportmegmunkálás mai formája a gyártócella: a hasonló műveleti utú alkatrészek gépei egy helyre kerülnek. A mátrix egy sora azt mutatja, mely gépeken halad át az alkatrész. <b>Rendezd a mátrixot</b> — a sorokat és oszlopokat bináris súlyuk szerint csökkenő sorrendbe tesszük, amíg a blokkok (cellák) ki nem rajzolódnak.</p>';
      var tb = U.h('div', 'ix-row'); el.appendChild(tb);
      var bStep = U.h('button', 'ix-btn', 'Egy rendezési lépés'); bStep.type = 'button'; tb.appendChild(bStep);
      var bMix = U.h('button', 'ix-btn', 'Keverés'); bMix.type = 'button'; tb.appendChild(bMix);
      var grid = U.h('div'); grid.style.overflowX = 'auto'; el.appendChild(grid);
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function has(p, m) { return GT_P[p].indexOf(m) >= 0; }
      function weightRow(p) { var w = 0; cols.forEach(function (m, i) { if (has(p, m)) w += Math.pow(2, cols.length - 1 - i); }); return w; }
      function weightCol(m) { var w = 0; rows.forEach(function (p, i) { if (has(p, m)) w += Math.pow(2, rows.length - 1 - i); }); return w; }
      function stable() {
        var r = rows.slice().sort(function (a, b) { return weightRow(b) - weightRow(a); });
        return r.join() === rows.join() && cols.slice().sort(function (a, b) { return weightCol(b) - weightCol(a); }).join() === cols.join();
      }
      function cellOf(p) { var c = { 1: 0, 2: 0 }; GT_P[p].forEach(function (m) { c[GT_CELL[m]]++; }); return c[1] >= c[2] ? 1 : 2; }
      function draw() {
        var done = stable(), exc = [];
        var h = '<table class="ix-tbl" style="width:auto;min-width:100%;text-align:center"><thead><tr><th></th>' + cols.map(function (m) { return '<th style="text-align:center" title="' + GT_MN[m] + '">' + m + '</th>'; }).join('') + '<th>súly</th></tr></thead><tbody>';
        rows.forEach(function (p) {
          h += '<tr><th style="text-align:left">' + p + '</th>';
          cols.forEach(function (m) {
            var on = has(p, m), same = done && GT_CELL[m] === cellOf(p);
            if (on && done && !same) exc.push(p + ' → ' + m);
            var bg = done && same ? (GT_CELL[m] === 1 ? 'background:rgba(59,130,196,.18)' : 'background:rgba(61,139,90,.2)') : '';
            h += '<td style="' + bg + ';font:700 15px var(--mono);' + (on && done && !same ? 'color:var(--ix-5)' : '') + '">' + (on ? '1' : '<span style="color:var(--rule-2)">·</span>') + '</td>';
          });
          h += '<td style="font:500 12px var(--mono);color:var(--muted)">' + weightRow(p) + '</td></tr>';
        });
        grid.innerHTML = h + '</tbody></table>';
        bStep.disabled = done;
        out.innerHTML = done
          ? '<h4><small>' + steps + ' lépés után stabil</small>Két cella rajzolódott ki</h4>' + U.kv([['1. cella (forgástestek)', 'E, K, Fg', 'P1, P3, P4, P7 — esztergálás, palástköszörülés, fogazás'], ['2. cella (prizmatikus darabok)', 'M, F, S', 'P2, P5, P6, P8 — marás, fúrás, síkköszörülés'], ['Cellák közötti anyagmozgás', exc.length + ' db', exc.join(', ') + ' — megoldás: fúrógép a 1. cellába, vagy más technológiai változat (a fúrás esztergán, hajtott szerszámmal)']])
          : '<h4><small>Rendezés</small>' + steps + '. lépés</h4><p>Nyomd meg újra, amíg a sorrend nem változik. A súly a sor bináris értéke (bal oldali oszlop = legnagyobb helyiérték); az oszlopoknál ugyanígy, felülről lefelé.</p><p class="ix-note">A módszer a jegyzeten túlmutató kitekintés (termelési folyamatelemzés, King-féle rangsor-rendezés); a jegyzet a csoportképzést a technológiai kódra alapozza.</p>';
      }
      bStep.addEventListener('click', function () {
        steps++;
        rows.sort(function (a, b) { return weightRow(b) - weightRow(a); });
        cols.sort(function (a, b) { return weightCol(b) - weightCol(a); });
        draw();
      });
      bMix.addEventListener('click', function () { shuffle(rows); shuffle(cols); steps = 0; draw(); });
      draw();
    },
  });

  /* ================================================================== */
  /* B/05 — pont-, szakasz- és pályavezérlés                              */
  /* ================================================================== */
  function tlLine(A, B, v) { var d = Math.hypot(B[0] - A[0], B[1] - A[1]), T = d / v; return { T: T, cut: true, pos: function (t) { var u = t / T; return [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u]; }, vel: function () { return [(B[0] - A[0]) / T, (B[1] - A[1]) / T]; } }; }
  function tlArc(C, r, a0, a1, v) { var T = r * Math.abs(a1 - a0) / v, w = (a1 - a0) / T; return { T: T, cut: true, pos: function (t) { var a = a0 + w * t; return [C[0] + r * Math.cos(a), C[1] + r * Math.sin(a)]; }, vel: function (t) { var a = a0 + w * t; return [-r * w * Math.sin(a), r * w * Math.cos(a)]; } }; }
  function tlRapid(A, B, vm) {
    var dx = B[0] - A[0], dy = B[1] - A[1], tx = Math.abs(dx) / vm, ty = Math.abs(dy) / vm, T = Math.max(tx, ty, 0.001), sx = dx < 0 ? -1 : 1, sy = dy < 0 ? -1 : 1;
    return { T: T, rapid: true, pos: function (t) { return [A[0] + sx * vm * Math.min(t, tx), A[1] + sy * vm * Math.min(t, ty)]; }, vel: function (t) { return [t < tx ? sx * vm : 0, t < ty ? sy * vm : 0]; } };
  }
  function tlDwell(A, T) { return { T: T, drill: true, pos: function () { return A; }, vel: function () { return [0, 0]; } }; }
  function vzTimeline(mode) {
    var tl = [], vf = 12, vr = 30;
    if (mode === 'pont') {
      var pts = [[15, 15], [50, 15], [85, 15], [85, 55], [50, 55], [15, 55]], cur = [0, 0];
      pts.forEach(function (p) { tl.push(tlRapid(cur, p, vr)); tl.push(tlDwell(p, 1.2)); cur = p; });
      tl.push(tlRapid(cur, [0, 0], vr));
    } else if (mode === 'szakasz') {
      tl.push(tlRapid([0, 0], [10, 10], vr));
      [[10, 10], [90, 10], [90, 60], [10, 60], [10, 10]].reduce(function (a, b) { tl.push(tlLine(a, b, vf)); return b; });
      tl.push(tlRapid([10, 10], [0, 0], vr));
    } else {
      tl.push(tlRapid([0, 0], [10, 10], vr));
      tl.push(tlLine([10, 10], [70, 10], vf));
      tl.push(tlArc([70, 28], 18, -Math.PI / 2, 0, vf));
      tl.push(tlLine([88, 28], [56, 50], vf));
      tl.push(tlArc([38, 50], 18, 0, Math.PI, vf));
      tl.push(tlLine([20, 50], [10, 50], vf));
      tl.push(tlLine([10, 50], [10, 10], vf));
      tl.push(tlRapid([10, 10], [0, 0], vr));
    }
    var t = 0; tl.forEach(function (s) { s.t0 = t; t += s.T; });
    return { segs: tl, T: t };
  }
  function vzAt(tl, t) { for (var i = 0; i < tl.segs.length; i++) { var s = tl.segs[i]; if (t <= s.t0 + s.T || i === tl.segs.length - 1) { var u = U.clamp(t - s.t0, 0, s.T); return { s: s, i: i, p: s.pos(u), v: s.vel(u), u: u }; } } }
  var VZ_TXT = {
    pont: ['Pontvezérlés', 'A cél a pont pontos elérése; közben a tengelyek egymástól függetlenül, gyorsmenetben mozognak (a pálya nem vezérelt — előbb átlósan, majd egyenesen). A forgácsolás az elért pontban, egy tengely (Z) mentén történik. Fúró-, ponthegesztő gép, mérőgép.'],
    szakasz: ['Szakaszvezérlés', 'A forgácsoló mozgás koordinátatengellyel párhuzamos egyenes; egyszerre csak egy tengely mozog, a sebessége vezérelt. Vállas tengely esztergálása, hasáb marása.'],
    palya: ['Pályavezérlés', 'A szerszám tetszőleges sík- vagy térgörbén halad: egyszerre több tengely mozog, és a sebességeik között rögzített függvénykapcsolat van (interpoláció). Bonyolult forgástestek, süllyesztékek, szoborfelületek.'],
  };
  AVIX.def('vezmozg', {
    title: 'Pont-, szakasz- és pályavezérlés',
    sub: 'A szerszám útja és a tengelysebességek (v_x, v_y) időben — mikor mozognak a tengelyek együtt?',
    mount: function (el) {
      var st = U.store('vezmozg', { m: 'palya' }), S = st.get(), tl = vzTimeline(S.m), t = 0, playing = false, last = 0;
      el.innerHTML = '<p class="ix-lead">Ugyanaz a lap, háromféle vezérléssel. <b>Indítsd el</b>, és figyeld az alsó diagramot: pontvezérlésnél a tengelyek függetlenül mozognak, szakaszvezérlésnél egyszerre csak egy, pályavezérlésnél együtt, összehangoltan.</p>';
      var row = U.h('div', 'ix-row'); el.appendChild(row);
      U.seg(row, [['pont', 'Pont'], ['szakasz', 'Szakasz'], ['palya', 'Pálya']], S.m, function (v) { S.m = v; st.set(S); tl = vzTimeline(v); t = 0; P.render(); }, 'Vezérléstípus');
      var play = U.h('button', 'ix-btn', '▶ Lejátszás'); play.type = 'button'; row.appendChild(play);
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 1.05 : 0.72; }, minH: 320, maxH: 520, label: 'Szerszámút és tengelysebességek' });
      var g = U.sliders(el);
      var sT = U.slider(g, { label: 'Idő', min: 0, max: 1000, step: 1, value: 0, fmt: function (v) { return fmt(v / 10, 0) + ' %'; }, onInput: function (v) { t = v / 1000 * tl.T; playing = false; play.textContent = '▶ Lejátszás'; P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function frame(ts) {
        if (!playing) return;
        var dt = last ? (ts - last) / 1000 : 0; last = ts;
        t += dt * tl.T / 9; if (t >= tl.T) { t = tl.T; playing = false; play.textContent = '▶ Lejátszás'; }
        sT.set(t / tl.T * 1000, true); P.render();
        if (playing) requestAnimationFrame(frame);
      }
      play.addEventListener('click', function () {
        playing = !playing; play.textContent = playing ? '❚❚ Szünet' : '▶ Lejátszás';
        if (playing) { if (t >= tl.T) t = 0; last = 0; requestAnimationFrame(frame); }
      });
      P.draw = function (w, h) {
        var ph = Math.round(h * 0.6), o = '';
        var sc = Math.min((w - 40) / 100, (ph - 30) / 70), ox = (w - 100 * sc) / 2, oy = 14;
        function X(x) { return (ox + x * sc).toFixed(1); }
        function Y(y) { return (oy + (70 - y) * sc).toFixed(1); }
        o += '<rect x="' + X(0) + '" y="' + Y(70) + '" width="' + (100 * sc).toFixed(1) + '" height="' + (70 * sc).toFixed(1) + '" rx="4" style="fill:var(--surface);stroke:var(--rule-2)"/>';
        var cur = vzAt(tl, t), path = '', rp = '';
        tl.segs.forEach(function (s, i) {
          var n = s.rapid ? 12 : 24, pts = [];
          for (var k = 0; k <= n; k++) pts.push(s.pos(s.T * k / n));
          var d = U.path(pts, function (x) { return +X(x); }, function (y) { return +Y(y); });
          if (s.rapid) rp += d; else if (!s.drill) path += d;
        });
        o += '<path d="' + rp + '" style="fill:none;stroke:var(--muted);stroke-width:1.2;stroke-dasharray:5 4"/>';
        o += '<path d="' + path + '" style="fill:none;stroke:var(--rule-2);stroke-width:5;stroke-linecap:round;stroke-linejoin:round;opacity:.5"/>';
        // megtett forgácsoló út
        var done = '';
        tl.segs.forEach(function (s) {
          if (s.rapid || s.drill || t <= s.t0) return;
          var e = Math.min(t - s.t0, s.T), pts = [];
          for (var k = 0; k <= 30; k++) pts.push(s.pos(e * k / 30));
          done += U.path(pts, function (x) { return +X(x); }, function (y) { return +Y(y); });
        });
        o += '<path d="' + done + '" style="fill:none;stroke:var(--acc);stroke-width:5;stroke-linecap:round;stroke-linejoin:round"/>';
        tl.segs.forEach(function (s) { if (s.drill) { var p = s.pos(0), f = U.clamp((t - s.t0) / s.T, 0, 1); o += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="' + (3.2 * sc).toFixed(1) + '" style="fill:' + (f >= 1 ? 'var(--acc)' : 'var(--surface-2)') + ';stroke:var(--acc);stroke-width:1.5"/>'; if (f > 0 && f < 1) o += '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="' + (3.2 * sc * f).toFixed(1) + '" class="fa"/>'; } });
        o += '<circle cx="' + X(cur.p[0]) + '" cy="' + Y(cur.p[1]) + '" r="' + Math.max(5, 2.5 * sc).toFixed(1) + '" style="fill:var(--ink);fill-opacity:.85;stroke:var(--surface);stroke-width:2"/>';
        o += '<text class="tk" x="' + X(0) + '" y="' + (+Y(0) + 13) + '">X →</text><text class="tk" x="' + (+X(0) - 4) + '" y="' + Y(66) + '" text-anchor="end">Y</text>';
        // sebességdiagram
        var cy0 = ph + 18, cy1 = h - 24, cx0 = 44, cx1 = w - 12, vm = 32;
        var sx = U.scale(0, tl.T, cx0, cx1), sy = U.scale(-vm, vm, cy1, cy0);
        o += '<rect class="ax" x="' + cx0 + '" y="' + cy0 + '" width="' + (cx1 - cx0) + '" height="' + (cy1 - cy0) + '" fill="none"/><line class="grid" x1="' + cx0 + '" x2="' + cx1 + '" y1="' + sy(0).toFixed(1) + '" y2="' + sy(0).toFixed(1) + '"/>';
        o += '<text class="tk" x="' + (cx0 - 5) + '" y="' + (cy0 + 9) + '" text-anchor="end">+v</text><text class="tk" x="' + (cx0 - 5) + '" y="' + (cy1) + '" text-anchor="end">−v</text><text class="tk" x="' + cx1 + '" y="' + (h - 8) + '" text-anchor="end">idő →</text>';
        var vxP = [], vyP = [], N = 500;
        for (var k = 0; k <= N; k++) { var tt = tl.T * k / N, a = vzAt(tl, tt); vxP.push([sx(tt), sy(a.v[0])]); vyP.push([sx(tt), sy(a.v[1])]); }
        o += '<path d="' + U.path(vxP) + '" style="fill:none;stroke:var(--ix-2);stroke-width:1.8"/><path d="' + U.path(vyP) + '" style="fill:none;stroke:var(--ix-1);stroke-width:1.8"/>';
        o += '<line x1="' + sx(t).toFixed(1) + '" x2="' + sx(t).toFixed(1) + '" y1="' + cy0 + '" y2="' + cy1 + '" style="stroke:var(--ink);stroke-width:1.2"/>';
        o += '<text class="sm" x="' + (cx0 + 6) + '" y="' + (cy0 + 13) + '" style="fill:var(--ix-2);font-weight:700">v_x</text><text class="sm" x="' + (cx0 + 30) + '" y="' + (cy0 + 13) + '" style="fill:var(--ix-1);font-weight:700">v_y</text>';
        P.svg.innerHTML = o;
        var s = cur.s, what = s.drill ? 'fúrás (Z tengely), X és Y áll' : s.rapid ? 'gyorsmenet — ' + (Math.abs(cur.v[0]) > 0 && Math.abs(cur.v[1]) > 0 ? 'mindkét tengely maximális sebességgel, egymástól függetlenül' : 'az egyik tengely már célba ért, a másik még mozog') : (Math.abs(cur.v[0]) > 0.01 && Math.abs(cur.v[1]) > 0.01 ? 'forgácsolás, X és Y együtt, rögzített arányban' : 'forgácsolás, csak ' + (Math.abs(cur.v[0]) > 0.01 ? 'X' : 'Y') + ' mozog');
        out.innerHTML = '<h4><small>' + VZ_TXT[S.m][0] + '</small>' + what + '</h4><p>' + VZ_TXT[S.m][1] + '</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/05 — 3D és 5D: előredöntési szög, effektív forgácsolósebesség     */
  /* ================================================================== */
  var ED = { R: 6, n: 10000 };
  function edZ(x) { return 34 + 14 * Math.sin(2 * Math.PI * (x - 10) / 100); }
  function edDZ(x) { return 14 * 2 * Math.PI / 100 * Math.cos(2 * Math.PI * (x - 10) / 100); }
  function edState(x, mode, beta) {
    var d = edDZ(x), L = Math.hypot(d, 1), nx = -d / L, nz = 1 / L, th;
    var P = [x, edZ(x)], C = [P[0] + ED.R * nx, P[1] + ED.R * nz], t;
    if (mode === '3d') { t = [0, 1]; th = Math.acos(U.clamp(nz, -1, 1)); }
    else { var b = -beta * Math.PI / 180, c = Math.cos(b), s = Math.sin(b); t = [nx * c - nz * s, nx * s + nz * c]; th = beta * Math.PI / 180; }
    var rho = ED.R * Math.sin(th), v = Math.PI * 2 * rho * ED.n / 1000;
    return { P: P, C: C, n: [nx, nz], t: t, th: th, rho: rho, v: v };
  }
  AVIX.def('eloredontes', {
    title: 'Mozgásvektorok: 3D és 5D marás gömbvégű maróval',
    sub: 'Szerszámtengely t, felületi normális n, előredöntési szög — és az effektív forgácsolósebesség a pálya mentén',
    mount: function (el) {
      var st = U.store('eloredontes', { m: '3d', b: 15, x: 35 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">Gömbvégű maró (R = 6 mm, n = 10 000 1/min) szabadformájú felületen. 3D-nél a szerszámtengely mindig Z irányú, így a tengely és a normális szöge a pálya mentén változik; ahol a felület vízszintes, a maró <b>csúcsával</b> forgácsol, ahol a forgácsolósebesség nulla. 5D-nél a t vektor a normálishoz képest <b>állandó előredöntéssel</b> fordul.</p>';
      var row = U.h('div', 'ix-row'); el.appendChild(row);
      U.seg(row, [['3d', '3D (t = Z)'], ['5d', '5D (állandó előredöntés)']], S.m, function (v) { S.m = v; st.set(S); P.render(); }, 'Megmunkálás');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 1 : 0.66; }, minH: 320, maxH: 520, label: 'Szerszám a felületen és a sebességdiagram' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Helyzet x', min: 5, max: 115, step: 0.5, value: S.x, unit: 'mm', dec: 0, onInput: function (v) { S.x = v; st.set(S); P.render(); } });
      U.slider(g, { label: 'Előredöntés β', min: 0, max: 40, step: 1, value: S.b, unit: '°', dec: 0, onInput: function (v) { S.b = v; st.set(S); P.render(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      var gx = { ox: 20, sc: 1 };
      P.drag(function (x) { /* vízszintes húzás: helyzet */ S.x = U.clamp((x - gx.ox) / gx.sc, 5, 115); st.set(S); P.render(); });
      P.draw = function (w, h) {
        var ph = Math.round(h * 0.62), o = '', sc = Math.min((w - 40) / 120, (ph - 16) / 76), oy = ph - 6, ox = (w - 120 * sc) / 2;
        gx.ox = ox; gx.sc = sc;
        function X(x) { return (ox + x * sc).toFixed(1); }
        function Y(z) { return (oy - (z - 12) * sc).toFixed(1); }
        var pts = [];
        for (var x = 0; x <= 120; x += 1) pts.push([+X(x), +Y(edZ(x))]);
        o += '<path d="' + U.path(pts) + 'L' + X(120) + ',' + oy + 'L' + X(0) + ',' + oy + 'Z" style="fill:var(--ix-8);fill-opacity:.22;stroke:var(--ink);stroke-width:1.6"/>';
        var s = edState(S.x, S.m, S.b), k = sc;
        // szár a t irányában
        var tx = s.t[0], tz = s.t[1], px = -tz, pz = tx, Lsh = 30, r = ED.R;
        var c = [+X(s.C[0]), +Y(s.C[1])];
        function Q(a, b) { return (c[0] + (a * px + b * tx) * sc).toFixed(1) + ',' + (c[1] - (a * pz + b * tz) * k).toFixed(1); }
        o += '<path d="M' + Q(-r, 0) + 'L' + Q(-r, Lsh) + 'L' + Q(r, Lsh) + 'L' + Q(r, 0) + '" style="fill:var(--surface);stroke:var(--ink-2);stroke-width:1.3"/>';
        o += '<ellipse cx="' + c[0].toFixed(1) + '" cy="' + c[1].toFixed(1) + '" rx="' + (r * sc).toFixed(1) + '" ry="' + (r * k).toFixed(1) + '" style="fill:var(--surface);stroke:var(--ink-2);stroke-width:1.3"/>';
        var qa = Q(0, -r - 4).split(','), qb = Q(0, Lsh + 6).split(',');
        o += '<line x1="' + qa[0] + '" y1="' + qa[1] + '" x2="' + qb[0] + '" y2="' + qb[1] + '" style="stroke:var(--muted);stroke-dasharray:10 3 2 3"/>';
        // vektorok
        var Pp = [+X(s.P[0]), +Y(s.P[1])];
        function arrow(x0, y0, dx, dy, col, lab) {
          var x1 = x0 + dx, y1 = y0 + dy, a = Math.atan2(dy, dx), hl = 8;
          return '<line x1="' + x0.toFixed(1) + '" y1="' + y0.toFixed(1) + '" x2="' + x1.toFixed(1) + '" y2="' + y1.toFixed(1) + '" style="stroke:' + col + ';stroke-width:2.2"/><path d="M' + x1.toFixed(1) + ',' + y1.toFixed(1) + 'L' + (x1 - hl * Math.cos(a - 0.4)).toFixed(1) + ',' + (y1 - hl * Math.sin(a - 0.4)).toFixed(1) + 'L' + (x1 - hl * Math.cos(a + 0.4)).toFixed(1) + ',' + (y1 - hl * Math.sin(a + 0.4)).toFixed(1) + 'Z" style="fill:' + col + '"/><text class="lb" x="' + (x1 + 6 * Math.cos(a)).toFixed(1) + '" y="' + (y1 + 6 * Math.sin(a) + 4).toFixed(1) + '" style="fill:' + col + '">' + lab + '</text>';
        }
        var La = Math.max(52, 12 * sc);
        o += arrow(Pp[0], Pp[1], s.n[0] * La, -s.n[1] * La, 'var(--acc)', 'n');
        o += arrow(c[0], c[1], s.t[0] * La * 1.25, -s.t[1] * La * 1.25, 'var(--ink)', 't');
        // érintkezési pont és effektív sugár
        o += '<circle cx="' + Pp[0].toFixed(1) + '" cy="' + Pp[1].toFixed(1) + '" r="4.5" style="fill:var(--ix-5)"/>';
        var foot = [s.C[0] + ((s.P[0] - s.C[0]) * s.t[0] + (s.P[1] - s.C[1]) * s.t[1]) * s.t[0], s.C[1] + ((s.P[0] - s.C[0]) * s.t[0] + (s.P[1] - s.C[1]) * s.t[1]) * s.t[1]];
        o += '<line x1="' + Pp[0].toFixed(1) + '" y1="' + Pp[1].toFixed(1) + '" x2="' + X(foot[0]) + '" y2="' + Y(foot[1]) + '" style="stroke:var(--ix-5);stroke-width:2"/>';
        o += '<text class="lb" x="' + (Pp[0] + 8).toFixed(1) + '" y="' + (Pp[1] + 18).toFixed(1) + '">P</text>';
        // diagram: effektív sebesség a pálya mentén
        var cy0 = ph + 16, cy1 = h - 24, cx0 = 44, cx1 = w - 12, vmax = Math.PI * 2 * ED.R * ED.n / 1000;
        var sx = U.scale(0, 120, cx0, cx1), sy = U.scale(0, vmax * 1.05, cy1, cy0);
        o += '<rect class="ax" x="' + cx0 + '" y="' + cy0 + '" width="' + (cx1 - cx0) + '" height="' + (cy1 - cy0) + '" fill="none"/>';
        [0, 100, 200, 300].forEach(function (v) { if (v <= vmax) o += '<line class="grid" x1="' + cx0 + '" x2="' + cx1 + '" y1="' + sy(v).toFixed(1) + '" y2="' + sy(v).toFixed(1) + '"/><text class="tk" x="' + (cx0 - 5) + '" y="' + (sy(v) + 3.5).toFixed(1) + '" text-anchor="end">' + v + '</text>'; });
        o += '<text class="tk" x="' + (cx0 - 5) + '" y="' + (cy0 - 4) + '" text-anchor="end">v_eff, m/min</text>';
        ['3d', '5d'].forEach(function (m) {
          var q = [];
          for (var x2 = 0; x2 <= 120; x2 += 1) q.push([sx(x2), sy(edState(x2, m, S.b).v)]);
          o += '<path d="' + U.path(q) + '" style="fill:none;stroke:' + (m === S.m ? 'var(--acc)' : 'var(--muted)') + ';stroke-width:' + (m === S.m ? 2.2 : 1.2) + (m === S.m ? '' : ';stroke-dasharray:5 4') + '"/>';
        });
        o += '<line x1="' + sx(S.x).toFixed(1) + '" x2="' + sx(S.x).toFixed(1) + '" y1="' + cy0 + '" y2="' + cy1 + '" style="stroke:var(--ink);stroke-width:1.2"/><circle cx="' + sx(S.x).toFixed(1) + '" cy="' + sy(s.v).toFixed(1) + '" r="4.5" style="fill:var(--ix-5)"/>';
        P.svg.innerHTML = o;
        var deg = s.th * 180 / Math.PI, bad = s.v < 0.2 * vmax;
        out.innerHTML = '<h4><small>' + (S.m === '3d' ? '3D-s megmunkálás' : '5D-s megmunkálás, β = ' + S.b + '°') + '</small>Szög (t, n) = ' + fmt(deg, 1) + '° → v_eff = ' + fmt(s.v, 0) + ' m/min</h4>' +
          U.kv([['Effektív forgácsolósugár', 'ρ = R·sin(t, n) = ' + fmt(s.rho, 2) + ' mm', 'a P pont távolsága a szerszámtengelytől'], ['Legnagyobb (az egyenlítőn)', fmt(vmax, 0) + ' m/min', 'ρ = R esetén']]) +
          (bad ? '<p class="ix-hint" style="border-left-color:var(--ix-5)"><b>A csúcs közelében forgácsol.</b> A forgácsolósebesség ' + (s.v < 1 ? 'nulla' : 'nagyon kicsi') + ' — rossz felület, nyomódás, nagy kopás. 3D-nél ez a felület vízszintes részein elkerülhetetlen; 5D-nél az állandó előredöntés megszünteti.</p>' : '') +
          '<p class="ix-note">r = [X, Y, Z] a vezérelt pont helyzete, t = [i, j, k] a szerszámtengely iránya. 5D-nél mindkettő programozott — ezért kell hozzá két forgótengely (asztal–asztal, fej–fej vagy fej–asztal kinematika).</p>';
      };
      P.render();
    },
  });

  /* ================================================================== */
  /* B/05 — barázdamélység (12.16. ábra)                                  */
  /* ================================================================== */
  function bzH(R, s, mode, rho) {
    if (mode === 'sik') return s >= 2 * R ? R : R - Math.sqrt(R * R - s * s / 4);
    var th = s / rho, cs = Math.cos(th / 2), sn = Math.sin(th / 2);
    if (mode === 'dom') { var a = rho + R, q = R * R - a * a * sn * sn; return q < 0 ? NaN : a * cs - Math.sqrt(q) - rho; }
    var b = rho - R, q2 = R * R - b * b * sn * sn; return q2 < 0 ? NaN : rho - (b * cs + Math.sqrt(q2));
  }
  AVIX.def('barazda', {
    title: 'Barázdamélység gömbvégű maróval',
    sub: 'h a pályatávolságtól, a szerszámsugártól, a felület lejtésétől és görbületétől függ — mekkora lehet a sorköz?',
    mount: function (el) {
      var st = U.store('barazda', { R: 5, p: 1, m: 'sik', a: 30, rho: 20, hm: 0.01 }), S = st.get();
      el.innerHTML = '<p class="ix-lead">A szomszédos pályák távolságát a lehető legnagyobbra vesszük úgy, hogy a visszamaradó barázda (h) a tűrésen belül maradjon. 3D-s sormarásnál a sorközt (p) a vetületben adjuk meg — <b>meredek felületen a tényleges távolság s = p/cos α nagyobb</b>, ezért ott mélyebb a barázda.</p>';
      var row = U.h('div', 'ix-row'); el.appendChild(row);
      U.seg(row, [['sik', 'Sík (lejtős)'], ['dom', 'Domború'], ['hom', 'Homorú']], S.m, function (v) { S.m = v; st.set(S); upd(); }, 'Felület');
      var P = U.plot(el, { ratio: function (w) { return w < 520 ? 0.7 : 0.42; }, minH: 220, maxH: 340, label: 'Barázda metszetben' });
      var g = U.sliders(el);
      U.slider(g, { label: 'Gömbsugár R', min: 1, max: 10, step: 0.5, value: S.R, unit: 'mm', dec: 1, onInput: function (v) { S.R = v; upd(); } });
      U.slider(g, { label: 'Sorköz p', min: 0.1, max: 4, step: 0.05, value: S.p, unit: 'mm', dec: 2, onInput: function (v) { S.p = v; upd(); } });
      var sA = U.slider(g, { label: 'Lejtés α', min: 0, max: 75, step: 1, value: S.a, unit: '°', dec: 0, onInput: function (v) { S.a = v; upd(); } });
      var sR = U.slider(g, { label: 'Görbület ρ', min: 8, max: 100, step: 1, value: S.rho, unit: 'mm', dec: 0, onInput: function (v) { S.rho = v; upd(); } });
      U.slider(g, { label: 'Megengedett h', min: 0.001, max: 0.1, step: 0.001, value: S.hm, unit: 'mm', dec: 3, onInput: function (v) { S.hm = v; upd(); } });
      var out = U.h('div', 'ix-out'); el.appendChild(out);
      function sOf() { return S.m === 'sik' ? S.p / Math.cos(S.a * Math.PI / 180) : S.p; }
      function upd() {
        st.set(S);
        [sA, sR].forEach(function (sl, i) { var on = i === 0 ? S.m === 'sik' : S.m !== 'sik'; [].forEach.call(sl.el.children, function (c) { c.style.opacity = on ? '1' : '.35'; }); sl.input.disabled = !on; });
        P.render();
      }
      P.draw = function (w, h) {
        var R = S.R, s = sOf(), rho = S.rho, hh = bzH(R, s, S.m, rho), o = '';
        if (S.m === 'hom' && rho <= R) hh = NaN;
        // nézet: 2,6 sorköz szélesség, szükség esetén függőleges nagyítás
        var W = 2.6 * s, sc = (w - 40) / W, ex = 1;
        if (isFinite(hh) && hh * sc < 26) ex = Math.min(400, Math.ceil(26 / Math.max(hh * sc, 1e-6)));
        var cx = w / 2, base = h * 0.62;
        function X(u) { return cx + u * sc; }
        function Y(v) { return base - v * sc * ex; }
        // felület (lokális koordináta: vízszintes érintő a középső barázdánál)
        function surf(u) { if (S.m === 'sik') return 0; var sg = S.m === 'dom' ? 1 : -1; return sg * (Math.sqrt(Math.max(rho * rho - u * u, 0)) - rho); }
        var sp = [];
        for (var u = -W / 2; u <= W / 2 + 1e-9; u += W / 120) sp.push([X(u), Y(surf(u))]);
        o += '<path d="' + U.path(sp) + 'L' + X(W / 2) + ',' + h + 'L' + X(-W / 2) + ',' + h + 'Z" style="fill:var(--ix-8);fill-opacity:.2;stroke:var(--muted);stroke-width:1;stroke-dasharray:4 3"/>';
        // szerszámpályák: középpontok a felülettől R-re, ±s/2 és ±3s/2 helyen
        var cen = [-1.5, -0.5, 0.5, 1.5].map(function (k) {
          var arc = k * s;
          if (S.m === 'sik') return [arc, R];
          var sg = S.m === 'dom' ? 1 : -1, th = arc / rho, rr = S.m === 'dom' ? rho + R : rho - R;
          return [rr * Math.sin(th) * (S.m === 'dom' ? 1 : 1), sg * (rr * Math.cos(th)) - sg * rho + (S.m === 'dom' ? 0 : 0)];
        });
        // megmunkált profil: a gömbök alsó határainak minimuma (ennél mélyebbre egyik pálya sem ért)
        var prof = [];
        for (var u2 = -W / 2; u2 <= W / 2 + 1e-9; u2 += W / 400) {
          var best = null;
          cen.forEach(function (c) { var d = u2 - c[0]; if (Math.abs(d) <= R) { var y = c[1] - Math.sqrt(R * R - d * d); if (best == null || y < best) best = y; } });
          if (best != null) prof.push([X(u2), Y(best)]);
        }
        o += '<path d="' + U.path(prof) + '" style="fill:none;stroke:var(--acc);stroke-width:2.4;stroke-linejoin:round"/>';
        cen.forEach(function (c, i) {
          var arcP = [];
          for (var a = -Math.PI; a <= 0; a += Math.PI / 60) arcP.push([X(c[0] + R * Math.cos(a)), Y(c[1] + R * Math.sin(a))]);
          o += '<path d="' + U.path(arcP) + '" style="fill:none;stroke:var(--ink-2);stroke-width:1;opacity:.5"/><line x1="' + X(c[0]).toFixed(1) + '" x2="' + X(c[0]).toFixed(1) + '" y1="' + Y(c[1] - R).toFixed(1) + '" y2="' + (Y(c[1] - R) - 16).toFixed(1) + '" style="stroke:var(--muted);stroke-dasharray:3 3"/>';
        });
        if (isFinite(hh)) {
          var yb = Y(surf(0)), yt = Y(surf(0) + hh);
          o += '<line x1="' + (X(0) + 14).toFixed(1) + '" x2="' + (X(0) + 14).toFixed(1) + '" y1="' + yb.toFixed(1) + '" y2="' + yt.toFixed(1) + '" style="stroke:var(--ix-5);stroke-width:2"/><text class="lb" x="' + (X(0) + 20).toFixed(1) + '" y="' + ((yb + yt) / 2 + 4).toFixed(1) + '">h</text>';
        }
        o += '<line x1="' + X(-0.5 * s).toFixed(1) + '" x2="' + X(0.5 * s).toFixed(1) + '" y1="' + (base + 26) + '" y2="' + (base + 26) + '" style="stroke:var(--ink-2)"/><text class="sm" x="' + X(0).toFixed(1) + '" y="' + (base + 40) + '" text-anchor="middle">s = ' + fmt(s, 2) + ' mm</text>';
        if (ex > 1) o += '<text class="tk" x="' + (w - 10) + '" y="16" text-anchor="end">függőleges nagyítás ×' + ex + '</text>';
        if (S.m === 'sik') { // kis ábra: vetületi sorköz és lejtés
          var bx = 16, by = 16, bl = 70, al = S.a * Math.PI / 180;
          o += '<line x1="' + bx + '" y1="' + (by + 44) + '" x2="' + (bx + bl) + '" y2="' + (by + 44 - bl * Math.tan(Math.min(al, 1.2))).toFixed(1) + '" style="stroke:var(--ink);stroke-width:1.5"/><text class="tk" x="' + bx + '" y="' + (by + 58) + '">α = ' + S.a + '°</text>';
        }
        P.svg.innerHTML = o;
        var approx = S.m === 'sik' ? s * s / (8 * R) : S.m === 'dom' ? s * s / 8 * (1 / R + 1 / rho) : s * s / 8 * (1 / R - 1 / rho);
        // legnagyobb sorköz a megengedett h-hoz (bisection)
        var lo = 0, hi = S.m === 'sik' ? 2 * R : Math.min(2 * R, rho), it;
        for (it = 0; it < 60; it++) { var mid = (lo + hi) / 2, hv = bzH(R, mid, S.m, rho); if (isFinite(hv) && hv <= S.hm) lo = mid; else hi = mid; }
        var pmax = S.m === 'sik' ? lo * Math.cos(S.a * Math.PI / 180) : lo;
        out.innerHTML = (S.m === 'hom' && rho <= R) ? '<h4><small>Homorú felület</small>A szerszámsugár nagyobb, mint a görbületi sugár</h4><p>R ≥ ρ esetén a gömb nem fér be a homorú részbe: <b>összemetsződés</b> — kisebb sugarú szerszám kell (a szerszámsugár ne legyen nagyobb a legkisebb felületi görbületi sugárnál).</p>'
          : '<h4><small>' + (S.m === 'sik' ? 's = p / cos α' : 's = p (ívhossz a felületen)') + '</small>h = ' + fmt(hh * 1000, 1) + ' µm</h4>' +
          U.kv([['Közelítés', fmt(approx * 1000, 1) + ' µm', S.m === 'sik' ? 'h ≈ s²/(8R)' : S.m === 'dom' ? 'h ≈ s²/8 · (1/R + 1/ρ) — domború felületen mélyebb' : 'h ≈ s²/8 · (1/R − 1/ρ) — homorú felületen sekélyebb'],
            ['Legnagyobb sorköz', 'p_max = ' + fmt(pmax, 3) + ' mm', 'h ≤ ' + fmt(S.hm * 1000, 0) + ' µm feltétellel' + (S.m === 'sik' && S.a > 0 ? ' (vízszintes felületen ' + fmt(lo, 3) + ' mm lenne)' : '')]]) +
          '<p class="ix-note">Nagyobb gömbsugárral azonos h mellett nagyobb sorköz vehető — a szerszámsugarat viszont a legkisebb homorú görbületi sugár korlátozza.</p>';
      };
      upd();
    },
  });
})();

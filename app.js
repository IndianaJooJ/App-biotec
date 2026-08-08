/* ============================================================
   APP.JS — Lógica do BioPulse (Painel de Formação em Biotecnologia)
   ============================================================ */

/* ===== RASTREADOR AVANÇADO DE EVENTOS GLOBAL (GA4 + Vercel Insights) ===== */
window.trackEvent = function (eventName, eventParams) {
  eventParams = eventParams || {};
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventParams);
    }
    if (typeof window.va === 'function') {
      window.va('event', { name: eventName, data: eventParams });
    }
  } catch (e) {
    console.warn('Erro ao enviar evento de analytics:', e);
  }
};

document.addEventListener('DOMContentLoaded', function () {
  "use strict";

  /* ===== 01. PONTES COM MÓDULOS EXTERNOS & STORE ===== */
  var D = window.BP_DATA || {};
  var P = window.BP_PARTICLES || { init: function () {}, resizeAll: function () {}, buildDNA: function () {} };

  var SEM1 = D.SEM1 || [], SEMS = D.SEMS || {}, OPTATIVAS = D.OPTATIVAS || [], TOTAL_HA = D.TOTAL_HA || 3960;
  var GNODES = D.GNODES || [], GEDGES = D.GEDGES || [], CH_BY_NAME = D.CH_BY_NAME || {};
  var MONTHLY_DAYS_OFICIAL = D.MONTHLY_DAYS_OFICIAL || {}, OPT_CATALOGUE = D.OPT_CATALOGUE || {}, CALENDAR_DB = D.CALENDAR_DB || [];

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  var saveBtn = document.getElementById('btnsave'), saveT;
  function flashSave() {
    if (saveBtn) {
      saveBtn.classList.add('show');
      clearTimeout(saveT);
      saveT = setTimeout(function () { saveBtn.classList.remove('show'); }, 1400);
    }
  }

  function esc(s) {
    return ('' + (s == null ? '' : s)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ===== 02. VERSIONAMENTO E MIGRAÇÃO DE DADOS LOCAIS ===== */
  var DATA_VERSION = 3;
  (function migrateData() {
    var v = parseInt(store.get('bp_dataversion', 1), 10) || 1;
    if (v < 3) {
      var oldGrades = store.get('bp_grades', null);
      var evals = store.get('bp_evals', {});
      if (oldGrades) {
        Object.keys(oldGrades).forEach(function (k) {
          var g = oldGrades[k];
          if (g !== undefined && g !== '' && !isNaN(parseFloat(g)) && !evals[k]) {
            evals[k] = [{ nome: 'Nota', data: '', nota: g }];
          }
        });
        store.set('bp_evals', evals);
      }
    }
    if (v < DATA_VERSION) { store.set('bp_dataversion', DATA_VERSION); }
  })();

  /* ===== 03. TEMA CLARO / ESCURO & BOTÃO FERRAMENTAS ===== */
  var theme = store.get('bp_theme', 'light');
  function applyTheme(t) {
    document.body.classList.toggle('theme-dark', t === 'dark');
    var ico = document.getElementById('theme-ico');
    if (ico) {
      if (t === 'dark') {
        ico.innerHTML = '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" fill="currentColor" stroke="none"/>';
      } else {
        ico.innerHTML = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" stroke-linecap="round"/>';
      }
    }
  }
  applyTheme(theme);

  var themeTg = document.getElementById('theme-tg');
  if (themeTg) {
    themeTg.addEventListener('click', function () {
      theme = (theme === 'dark' ? 'light' : 'dark');
      store.set('bp_theme', theme);
      applyTheme(theme);
      window.trackEvent('alternar_tema', { tema: theme });
    });
  }

  var tools = document.getElementById('tools');
  var toolsToggle = document.getElementById('tools-toggle');
  if (toolsToggle) {
    toolsToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (tools) tools.classList.toggle('open');
    });
  }
  document.addEventListener('click', function (e) {
    if (tools && !tools.contains(e.target)) tools.classList.remove('open');
  });

  /* ===== 04. EFEITOS VISUAIS ===== */
  var glow = document.getElementById('glow'), mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
  (function loop() {
    if (glow) {
      cx += (mx - cx) * .12;
      cy += (my - cy) * .12;
      glow.style.left = cx + 'px';
      glow.style.top = cy + 'px';
    }
    requestAnimationFrame(loop);
  })();

  addEventListener('scroll', function () {
    var h = document.documentElement, m = h.scrollHeight - h.clientHeight;
    var prog = document.getElementById('progress');
    if (prog) prog.style.width = (m > 0 ? h.scrollTop / m * 100 : 0) + '%';
  }, { passive: true });

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: .12 });

  function observeReveals() {
    document.querySelectorAll('.reveal:not(.in)').forEach(function (el) { io.observe(el); });
  }
  observeReveals();

  /* ===== 05. CANVAS DE PARTÍCULAS DE FUNDO & NAVEGAÇÃO ===== */
  ['soup-hero', 'soup-sci', 'soup-firms', 'soup-cefet', 'soup-footer', 'm-cal'].forEach(function (id) { P.init(document.getElementById(id), { mode: 'soup' }); });
  ['m-hist', 'm-cefet', 'm-struct', 'm-areas', 'm-infos', 'm-trilha', 'm-opt', 'm-painel'].forEach(function (id) { P.init(document.getElementById(id), { mode: 'mol' }); });
  P.init(document.getElementById('m-grade-canvas'), { mode: 'mol' });
  P.init(document.getElementById('m-avisos-canvas'), { mode: 'soup' });
  P.init(document.getElementById('m-blog-canvas'), { mode: 'mol' });
  P.buildDNA();

  var links = document.querySelectorAll('nav button.lnk'), pages = document.querySelectorAll('.page');
  links.forEach(function (b) {
    b.addEventListener('click', function () {
      var p = b.getAttribute('data-page');
      
      window.trackEvent('page_view_custom', {
        page_title: 'BioPulse — ' + p.toUpperCase(),
        page_location: window.location.href + '#' + p,
        page_path: '/' + p
      });

      links.forEach(function (x) { x.classList.toggle('active', x === b); });
      pages.forEach(function (pg) { pg.classList.toggle('on', pg.id === 'page-' + p); });
      scrollTo({ top: 0, behavior: 'smooth' });
      observeReveals();
      setTimeout(function () {
        P.resizeAll();
        if (p === 'painel') renderVisao();
        if (p === 'calendario') renderCalendario();
      }, 90);
    });
  });

  /* ===== 06. GRAFO DE PRÉ-REQUISITOS ===== */
  var gselected = null, COLX = {};
  function layoutGraph() {
    var cv = document.getElementById('graph-canvas');
    if (!cv) return;
    var w = cv.clientWidth, h = cv.clientHeight;
    if (w < 10) { setTimeout(layoutGraph, 120); return; }
    var minP = 3, maxP = 8, padX = 86, padY = 72;
    cv.querySelectorAll('.gnode').forEach(function (n) { n.remove(); });
    var byP = {};
    GNODES.forEach(function (nd) { (byP[nd.p] = byP[nd.p] || []).push(nd); });
    COLX = {};
    Object.keys(byP).forEach(function (p) {
      var arr = byP[p].sort(function (a, b) { return a.row - b.row; });
      var x = padX + (w - 2 * padX) * ((p - minP) / (maxP - minP));
      COLX[p] = x;
      var n = arr.length;
      arr.forEach(function (nd, i) {
        nd.x = x;
        nd.y = (n === 1) ? h / 2 : padY + (h - 2 * padY) * (i / (n - 1));
      });
    });
    GNODES.forEach(function (nd) {
      var el = document.createElement('button');
      el.className = 'gnode';
      el.setAttribute('data-id', nd.id);
      el.style.left = nd.x + 'px';
      el.style.top = nd.y + 'px';
      el.innerHTML = nd.n + '<small>' + nd.p + 'º' + (nd.opt ? ' · optativa' : '') + '</small>';
      el.addEventListener('click', function () { selectGraph(nd.id); });
      cv.appendChild(el);
    });
    drawGraphEdges();
    applyGraphSel();
  }

  function drawGraphEdges() {
    var cv = document.getElementById('graph-canvas');
    var h = cv ? cv.clientHeight : 780;
    var svg = document.getElementById('graph-svg');
    var g = '';
    Object.keys(COLX).forEach(function (p) {
      var x = COLX[p];
      g += '<line x1="' + x + '" y1="44" x2="' + x + '" y2="' + (h - 22) + '" stroke="rgba(15,168,119,.10)" stroke-width="1" stroke-dasharray="2 8"/>';
      g += '<text x="' + x + '" y="30" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="11.5" font-weight="700" fill="rgba(15,168,119,.55)">' + p + 'º</text>';
    });
    function pos(id) {
      for (var i = 0; i < GNODES.length; i++) if (GNODES[i].id === id) return GNODES[i];
      return null;
    }
    GEDGES.forEach(function (e) {
      var a = pos(e[0]), b = pos(e[1]);
      if (!a || !b) return;
      var dx = (b.x - a.x) * 0.45;
      g += '<path d="M' + a.x + ' ' + a.y + ' C' + (a.x + dx) + ' ' + a.y + ',' + (b.x - dx) + ' ' + b.y + ',' + b.x + ' ' + b.y + '" fill="none" stroke="rgba(15,168,119,.22)" stroke-width="1.5" stroke-linecap="round" data-from="' + e[0] + '" data-to="' + e[1] + '"/>';
    });
    svg.innerHTML = g;
  }

  function relatives(id) {
    var unlocks = [], prereqs = [];
    GEDGES.forEach(function (e) {
      if (e[0] === id) unlocks.push(e[1]);
      if (e[1] === id) prereqs.push(e[0]);
    });
    return { unlocks: unlocks, prereqs: prereqs };
  }

  function applyGraphSel() {
    var cv = document.getElementById('graph-canvas');
    if (!cv) return;
    cv.querySelectorAll('.gnode').forEach(function (n) { n.classList.remove('sel', 'unlocks', 'prereq', 'dim'); });
    document.querySelectorAll('#graph-svg path').forEach(function (p) {
      p.setAttribute('stroke', 'rgba(15,168,119,.22)');
      p.setAttribute('stroke-width', '1.5');
    });
    if (!gselected) return;
    var rel = relatives(gselected);
    cv.querySelectorAll('.gnode').forEach(function (n) {
      var id = n.getAttribute('data-id');
      if (id === gselected) n.classList.add('sel');
      else if (rel.unlocks.indexOf(id) >= 0) n.classList.add('unlocks');
      else if (rel.prereqs.indexOf(id) >= 0) n.classList.add('prereq');
      else n.classList.add('dim');
    });
    document.querySelectorAll('#graph-svg path').forEach(function (p) {
      if (p.getAttribute('data-from') === gselected || p.getAttribute('data-to') === gselected) {
        p.setAttribute('stroke', 'rgba(15,168,119,.9)');
        p.setAttribute('stroke-width', '2.6');
      }
    });
  }

  function nameOf(id) { for (var i = 0; i < GNODES.length; i++) if (GNODES[i].id === id) return GNODES[i].n; return id; }
  function nodeOf(id) { for (var i = 0; i < GNODES.length; i++) if (GNODES[i].id === id) return GNODES[i]; return null; }

  function selectGraph(id) {
    gselected = id;
    applyGraphSel();
    var nd = nodeOf(id);
    var rel = relatives(id);
    document.getElementById('gside-title').textContent = nd.n + (nd.opt ? ' (optativa)' : '');
    document.getElementById('gside-info').textContent = nd.p + 'º período. Veja abaixo o que ela exige antes (raízes) e o que habilita depois (ramos).';
    var html = '';
    html += '<div class="glab p">Raízes — precisa antes</div>';
    html += rel.prereqs.length ? rel.prereqs.map(function (x) { return '<span class="gchip">' + nameOf(x) + '</span>'; }).join('') : '<span class="ginfo" style="font-size:12px">Nenhum no recorte.</span>';
    html += '<div class="glab u">Ramos — destrava depois</div>';
    html += rel.unlocks.length ? rel.unlocks.map(function (x) { return '<span class="gchip">' + nameOf(x) + '</span>'; }).join('') : '<span class="ginfo" style="font-size:12px">Não destrava outras (neste recorte).</span>';
    document.getElementById('gside-list').innerHTML = html;

    if (nd) {
      window.trackEvent('selecionar_no_grafo', { materia_id: id, materia_nome: nd.n, periodo: nd.p });
    }
  }

  /* ===== 07. HELPERS DE CURRÍCULO E VALIDAÇÕES ACADÊMICAS ===== */
  var faltas = store.get('bp_faltas', {}), rooms = store.get('bp_rooms', {});
  var addedOpt = store.get('bp_opt', {}); if (Array.isArray(addedOpt)) { addedOpt = { '1': addedOpt }; store.set('bp_opt', addedOpt); }
  var removedSubjs = store.get('bp_removed', {});
  var notes = store.get('bp_notes', {});
  var evals = store.get('bp_evals', {});
  var curPeriod = store.get('bp_curperiod', 1);
  var comp = store.get('bp_comp', { meta: 120, items: [] });
  var agenda = store.get('bp_agenda', []);
  var plan = store.get('bp_plan', {});
  var expandedSubjects = store.get('bp_expanded', {});

  function maxFaltas(ch) { return Math.floor(ch * 0.25); }
  function chFromName(n) { var m = n.match(/(\d+)\s*h\/a/); return m ? parseInt(m[1], 10) : 30; }
  function editableSem(sem) { return parseInt(sem, 10) <= curPeriod; }

  function findDeptForSubject(nome) {
    if (!nome) return 'deteq';
    var cleanName = nome.replace(/\s*\(\d+\s*h\/a\)/i, '').trim();

    for (var i = 0; i < SEM1.length; i++) {
      if (SEM1[i].nome.toLowerCase() === cleanName.toLowerCase()) return SEM1[i].dept || 'debio';
    }
    var keys = Object.keys(SEMS);
    for (var k = 0; k < keys.length; k++) {
      var arr = SEMS[keys[k]] || [];
      for (var j = 0; j < arr.length; j++) {
        if (arr[j][0].toLowerCase() === cleanName.toLowerCase()) return arr[j][3] || 'debio';
      }
    }
    var optKeys = Object.keys(OPT_CATALOGUE);
    for (var o = 0; o < optKeys.length; o++) {
      var opt = OPT_CATALOGUE[optKeys[o]];
      if (opt && opt.title && opt.title.toLowerCase() === cleanName.toLowerCase()) {
        return opt.dept ? opt.dept.toLowerCase() : 'debio';
      }
    }
    return 'deteq';
  }

  function listFor(sem) {
    var rawList = [];
    if (sem === '1') {
      rawList = SEM1.map(function (o) { return { cod: o.cod, nome: o.nome, ch: o.ch, dept: o.dept }; });
    } else {
      rawList = (SEMS[sem] || []).map(function (a) { return { cod: a[2] || '', nome: a[0], ch: a[1], dept: a[3] || '' }; });
    }

    (addedOpt[sem] || []).forEach(function (name) {
      var d = findDeptForSubject(name);
      rawList.push({ cod: 'CUSTOM', nome: name, ch: chFromName(name), opt: true, dept: d });
    });

    var removedInSem = removedSubjs[sem] || [];
    return rawList.filter(function(it) {
      return removedInSem.indexOf(it.nome) === -1;
    });
  }

  function keyOf(sem, it) { return sem + '|' + (it.cod && it.cod !== 'CUSTOM' ? it.cod : it.nome); }
  function evalsFor(k) { return evals[k] || []; }
  
  function notaFinal(k) {
    var arr = evalsFor(k).map(function (e) { return parseFloat(e.nota); }).filter(function (v) { return !isNaN(v); });
    if (!arr.length) return NaN;
    var soma = arr.reduce(function (a, b) { return a + b; }, 0);
    return Math.min(100, soma);
  }

  function isAprovado(sem, it) {
    var k = keyOf(String(sem), it);
    var n = notaFinal(k);
    var f = faltas[k] || 0;
    var mx = maxFaltas(it.ch);
    return (!isNaN(n) && n >= 60 && f <= mx);
  }

  function isAprovadoEmSemestreAnterior(nomeMateria, semAtual) {
    var targetSem = parseInt(semAtual, 10);
    for (var s = 1; s < targetSem; s++) {
      var listSem = listFor(String(s));
      for (var i = 0; i < listSem.length; i++) {
        var it = listSem[i];
        if (it.nome === nomeMateria && isAprovado(s, it)) {
          return s;
        }
      }
    }
    return false;
  }

  var curSem = '1';

  /* ===== 08. CÁLCULO DE CRA REAL, HORAS INTEGRALIZADAS E GRÁFICO SVG ===== */
  function doneHours() {
    var total = 0;
    for (var s = 1; s <= 9; s++) {
      listFor(String(s)).forEach(function (it) {
        if (isAprovado(s, it)) total += it.ch;
      });
    }
    return total;
  }

  function realCRA() {
    var sumP = 0, sumCH = 0;
    for (var s = 1; s <= 9; s++) {
      listFor(String(s)).forEach(function (it) {
        var k = keyOf(String(s), it);
        var n = notaFinal(k);
        if (!isNaN(n)) {
          sumP += n * it.ch;
          sumCH += it.ch;
        }
      });
    }
    return sumCH > 0 ? (sumP / sumCH) : null;
  }

  function drawCra() {
    var craEl = document.getElementById('sim-cra-big');
    var chart = document.getElementById('cra-chart');
    if (!craEl) return;

    var craVal = realCRA();
    if (craVal !== null) {
      craEl.innerHTML = '<div class="scv">' + craVal.toFixed(1) + '</div><div class="scl">CRA Real Geral</div><div class="scs">Média ponderada acumulada por carga horária</div>';
    } else {
      craEl.innerHTML = '<div class="scv">—</div><div class="scl">CRA Real Geral</div><div class="scs">Lance notas na aba "Notas & Faltas" para calcular</div>';
    }

    if (!chart) return;

    var pts = [];
    for (var s = 1; s <= 9; s++) {
      var sumP = 0, sumCH = 0;
      listFor(String(s)).forEach(function (it) {
        var k = keyOf(String(s), it);
        var n = notaFinal(k);
        if (!isNaN(n)) { sumP += n * it.ch; sumCH += it.ch; }
      });
      if (sumCH > 0) {
        pts.push({ s: s, val: sumP / sumCH });
      }
    }

    if (pts.length < 1) {
      chart.innerHTML = '<text x="260" y="105" text-anchor="middle" fill="rgba(232,242,238,.4)" font-size="13">Sem notas suficientes para gráfico de evolução</text>';
      return;
    }

    var w = 520, h = 180, padL = 40, padR = 20, padT = 30, padB = 30;
    var innerW = w - padL - padR, innerH = h - padT - padB;

    var svg = '';
    svg += '<line x1="' + padL + '" y1="' + (h - padB) + '" x2="' + (w - padR) + '" y2="' + (h - padB) + '" stroke="rgba(127,224,188,.2)" stroke-width="1"/>';
    svg += '<line x1="' + padL + '" y1="' + padT + '" x2="' + padL + '" y2="' + (h - padB) + '" stroke="rgba(127,224,188,.2)" stroke-width="1"/>';

    var y60 = h - padB - (60 / 100) * innerH;
    var y75 = h - padB - (75 / 100) * innerH;
    svg += '<line x1="' + padL + '" y1="' + y60 + '" x2="' + (w - padR) + '" y2="' + y60 + '" stroke="rgba(231,76,60,.3)" stroke-width="1" stroke-dasharray="3 3"/>';
    svg += '<line x1="' + padL + '" y1="' + y75 + '" x2="' + (w - padR) + '" y2="' + y75 + '" stroke="rgba(194,238,115,.3)" stroke-width="1" stroke-dasharray="3 3"/>';

    var pathD = '';
    pts.forEach(function (pt, i) {
      var x = padL + ((pt.s - 1) / 8) * innerW;
      var y = h - padB - (pt.val / 100) * innerH;
      if (i === 0) pathD += 'M' + x + ' ' + y;
      else pathD += ' L' + x + ' ' + y;

      svg += '<circle cx="' + x + '" cy="' + y + '" r="4" fill="#C2EE73" stroke="#0C302B" stroke-width="2"/>';
      svg += '<text x="' + x + '" y="' + (y - 8) + '" text-anchor="middle" fill="#C2EE73" font-size="10" font-weight="bold">' + pt.val.toFixed(1) + '</text>';
      svg += '<text x="' + x + '" y="' + (h - 10) + '" text-anchor="middle" fill="rgba(232,242,238,.6)" font-size="10">' + pt.s + 'ºP</text>';
    });

    if (pts.length > 1) {
      svg += '<path d="' + pathD + '" fill="none" stroke="#0FA877" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>';
    }

    chart.innerHTML = svg;
  }

  function renderIntegr() {
    var el = document.getElementById('integr');
    if (!el) return;

    var done = doneHours();
    var pct = Math.min(100, (done / TOTAL_HA) * 100);

    el.innerHTML = ''
      + '<div class="itop"><h4>Progresso de Integralização do Curso</h4><div class="icount">' + done + ' / ' + TOTAL_HA + ' h/a</div></div>'
      + '<div class="isub">Progresso geral considerando aprovação em matérias obrigatórias e optativas.</div>'
      + '<div class="ibar"><div class="ifill" style="width:' + pct.toFixed(1) + '%"></div></div>'
      + '<div class="imeta"><span>Concluído: <b>' + pct.toFixed(1) + '%</b></span><span>Restantes: <b>' + Math.max(0, TOTAL_HA - done) + ' h/a</b></span></div>';
  }

  /* ===== 09. SELETOR DE PERÍODO & MENU DROPDOWN DO PAINEL ===== */
  var periodPicker = document.getElementById('period-picker');
  var periodBtn = document.getElementById('period-btn');
  var periodMenu = document.getElementById('period-menu');
  var periodLabel = document.getElementById('period-btn-label');

  function buildPeriodMenu() {
    if (!periodMenu) return;
    var h = '';
    for (var s = 1; s <= 9; s++) {
      h += '<button class="period-opt' + (s === curPeriod ? ' sel' : '') + '" data-p="' + s + '" role="option">' + s + 'º período</button>';
    }
    periodMenu.innerHTML = h;
    if (periodLabel) periodLabel.textContent = curPeriod + 'º período';
  }

  function setPeriod(p) {
    curPeriod = p;
    store.set('bp_curperiod', curPeriod);
    curSem = String(curPeriod);
    buildPeriodMenu();
    renderNotas();
    renderVisao();
    renderHorarios();
    flashSave();
    window.trackEvent('trocar_periodo_painel', { periodo_selecionado: p });
  }

  if (periodBtn && periodMenu && periodPicker) {
    buildPeriodMenu();
    periodBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = periodPicker.classList.toggle('open');
      periodBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    periodMenu.addEventListener('click', function (e) {
      var opt = e.target.closest('.period-opt'); if (!opt) return;
      setPeriod(parseInt(opt.getAttribute('data-p'), 10));
      periodPicker.classList.remove('open');
      periodBtn.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('click', function (e) {
      if (!periodPicker.contains(e.target)) {
        periodPicker.classList.remove('open');
        periodBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  (function () {
    var col = document.getElementById('cra-collapse');
    var tog = document.getElementById('cra-toggle');
    if (col && tog) {
      tog.addEventListener('click', function () {
        var open = col.classList.toggle('open');
        tog.setAttribute('aria-expanded', open ? 'true' : 'false');
        tog.querySelector('span').textContent = open ? 'Ocultar evolução do CRA' : 'Ver evolução do CRA';
      });
    }
  })();

  /* ===== 10. ACOMPANHAMENTO DE NOTAS, FALTAS E CARDS ===== */
  var renderers = { visao: renderVisao, notas: renderNotas, horarios: renderHorarios, prereqs: function () { setTimeout(layoutGraph, 30); renderPlanner(); }, complementares: renderComp, calendario: renderCalendario };
  var subnavElem = document.getElementById('subnav');
  if (subnavElem) {
    subnavElem.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var bl = b.getAttribute('data-block');
      document.querySelectorAll('#subnav button').forEach(function (x) { x.classList.toggle('on', x === b); });
      document.querySelectorAll('.panel-block').forEach(function (p) { p.classList.toggle('on', p.id === 'block-' + bl); });
      if (renderers[bl]) renderers[bl]();
    });
  }

  function currentList() { var ed = editableSem(curSem); return listFor(curSem).map(function (it) { it.locked = !ed; return it; }); }
  
  function statusOf(n, f, mx) { 
    if (f > mx) return ['Reprovado por falta', 'bad']; 
    if (isNaN(n)) return ['Sem nota', 'neutral']; 
    if (n >= 60) return ['Aprovado', 'ok']; 
    if (n >= 40) return ['Em risco', 'warn']; 
    return ['Insuficiente', 'bad']; 
  }

  var TRASH_ICON = '<svg class="rm-opt-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';

  function renderNotas() {
    var list = currentList(), html = '', aprov = 0, somaN = 0, cntN = 0;
    list.forEach(function (it) {
      var k = keyOf(curSem, it), f = faltas[k] || 0, mx = maxFaltas(it.ch), n = notaFinal(k);
      var st = statusOf(n, f, mx), pct = isNaN(n) ? 0 : Math.min(100, Math.round(n / 100 * 100));
      var pctFaltas = mx > 0 ? Math.min(100, Math.round(f / mx * 100)) : 0;
      
      if (!isNaN(n)) { 
        somaN += n; 
        cntN++; 
        if (isAprovado(curSem, it)) aprov++; 
      }

      var isExpanded = expandedSubjects[k] === true;
      var evs = evalsFor(k);
      var evRows = evs.length ? evs.map(function (e, i) { return '<div class="eval-row"><span class="ev-n">' + esc(e.nome || 'Avaliação') + '</span><span class="ev-d">' + esc(e.data || '—') + '</span><span class="ev-v">' + esc(e.nota) + ' pts</span><span class="ev-x" data-evx="' + k + '|' + i + '">✕</span></div>'; }).join('') : '<div class="eval-empty">Nenhuma avaliação lançada ainda.</div>';
      
      html += '<div class="subj' + (it.locked ? ' locked' : '') + (isExpanded ? ' open' : '') + '" id="card-' + k.replace(/\|/g, '_') + '">'
        + '<div class="subj-header" data-toggle-k="' + k + '">'
        + '<div class="subj-header-top">'
        + '<div class="top"><div><span class="nm">' + it.nome + '</span>' + (it.cod && it.cod !== 'CUSTOM' ? '<span class="cd">' + it.cod + '</span>' : '') + (it.dept ? '<span class="tag-dept ' + it.dept.toLowerCase() + '">' + it.dept.toUpperCase() + '</span>' : '') + '<button class="rm-opt" data-rm-name="' + encodeURIComponent(it.nome) + '" data-rm-key="' + encodeURIComponent(k) + '" title="Excluir matéria da grade">' + TRASH_ICON + '</button><div class="ch">' + it.ch + ' h/a · aprovação ≥ 60</div></div><span class="badge ' + st[1] + '">' + st[0] + '</span></div>'
        + '<div class="subj-chevron"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></div>'
        + '</div>'
        + '<div class="subj-compact-bars">'
        + '<div class="subj-bar-container"><div class="subj-bar-meta"><span>Notas acumuladas</span><span class="val">' + (isNaN(n) ? '0' : n.toFixed(1)) + 'pts</span></div><div class="subj-bar-track"><div class="subj-bar-fill" style="width:' + pct + '%; background:var(--grad-nota)"></div></div></div>'
        + '<div class="subj-bar-container"><div class="subj-bar-meta"><span>Faltas</span><span class="val">' + f + ' fls</span></div><div class="subj-bar-track"><div class="subj-bar-fill" style="width:' + pctFaltas + '%; background:var(--grad-falta)"></div></div></div>'
        + '</div>'
        + '</div>'
        + '<div class="subj-body">'
        + '<div class="subj-sub">Avaliações</div>'
        + '<div class="eval-list">' + evRows + '</div>'
        + (it.locked ? '' : '<div class="eval-add" data-k="' + k + '"><input type="text" class="add-nome" placeholder="Nome (ex: Prova 1)"><input type="date" class="add-data"><input type="number" class="add-nota" min="0" max="100" placeholder="nota"><button class="ev-btn-add">Adicionar</button></div>')
        + '<div class="subj-sub">Controle de Faltas</div>'
        + '<div class="faltas-row"><div class="stepper"><button data-f="' + k + '" data-d="-1" ' + (it.locked ? 'disabled' : '') + '>−</button><span class="cnt">' + f + '</span><button data-f="' + k + '" data-d="1" ' + (it.locked ? 'disabled' : '') + '>+</button></div><div class="bar2"><div class="fill" style="width:' + pctFaltas + '%;background:' + (f > mx ? 'var(--danger)' : (f >= mx - 1 ? 'var(--warn)' : 'var(--emerald)')) + '"></div></div><span class="faltas-info"><b>' + f + '</b> de ' + mx + ' · restam <b>' + Math.max(0, mx - f) + '</b></span></div>'
        + (it.locked ? '' : '<textarea class="note-in" data-nk="' + k + '" placeholder="Anotações, links, tarefas…">' + esc(notes[k] || '') + '</textarea>')
        + '</div>'
        + '</div>';
    });

    var gradeListElem = document.getElementById('grade-list');
    if (gradeListElem) gradeListElem.innerHTML = html;
    var media = cntN ? (somaN / cntN).toFixed(1) : '—';
    var summaryElem = document.getElementById('grade-summary');
    if (summaryElem) {
      summaryElem.innerHTML = ''
        + '<div class="sm"><div class="v">' + list.length + '</div><div class="l">Disciplinas</div></div>'
        + '<div class="sm"><div class="v">' + aprov + '</div><div class="l">Aprovadas</div></div>'
        + '<div class="sm"><div class="v">' + (media !== '—' ? media : '—') + '</div><div class="l">Média Período</div></div>'
        + '<div class="sm"><div class="v">' + (editableSem(curSem) ? 'Sim' : 'Não') + '</div><div class="l">Editável</div></div>';
    }
    var addoptZone = document.getElementById('addopt-zone');
    if (addoptZone) addoptZone.style.display = editableSem(curSem) ? 'flex' : 'none';
    renderIntegr();
    drawCra();
  }

  var gradeListContainer = document.getElementById('grade-list');
  if (gradeListContainer) {
    gradeListContainer.addEventListener('click', function (e) {
      var target = e.target;
      var rmBtn = target.closest('.rm-opt');
      
      if (rmBtn) {
        e.stopPropagation();
        e.preventDefault();
        
        var name = decodeURIComponent(rmBtn.getAttribute('data-rm-name'));
        var keyVal = decodeURIComponent(rmBtn.getAttribute('data-rm-key'));

        if (!confirm('Deseja realmente remover a matéria "' + name + '" deste semestre?')) {
          return;
        }

        removedSubjs[curSem] = removedSubjs[curSem] || [];
        if (removedSubjs[curSem].indexOf(name) === -1) {
          removedSubjs[curSem].push(name);
          store.set('bp_removed', removedSubjs);
        }

        if (addedOpt[curSem]) {
          addedOpt[curSem] = addedOpt[curSem].filter(function (n) { return n !== name; });
          store.set('bp_opt', addedOpt);
        }

        delete faltas[keyVal]; delete notes[keyVal]; delete evals[keyVal];
        var altKey = curSem + '|' + name;
        delete faltas[altKey]; delete notes[altKey]; delete evals[altKey];

        store.set('bp_faltas', faltas); store.set('bp_notes', notes); store.set('bp_evals', evals);
        
        window.trackEvent('remover_materia_grade', { materia_nome: name, periodo: curSem });

        renderNotas(); 
        renderVisao();
        flashSave(); 
        return;
      }

      var header = target.closest('.subj-header');
      if (header) {
        var kToggle = header.getAttribute('data-toggle-k');
        var card = document.getElementById('card-' + kToggle.replace(/\|/g, '_'));
        if (card) { var isOpen = card.classList.toggle('open'); expandedSubjects[kToggle] = isOpen; store.set('bp_expanded', expandedSubjects); }
        return;
      }

      if (target.classList.contains('ev-btn-add')) {
        var form = target.closest('.eval-add');
        var k3 = form.getAttribute('data-k');
        var nome = form.querySelector('.add-nome').value || 'Avaliação';
        var data = form.querySelector('.add-data').value || '';
        var notaVal = form.querySelector('.add-nota').value;
        if (notaVal === '' || isNaN(parseFloat(notaVal))) return;
        evals[k3] = evals[k3] || [];
        evals[k3].push({ nome: nome, data: data, nota: Math.max(0, Math.min(100, parseFloat(notaVal))) });
        store.set('bp_evals', evals);
        
        window.trackEvent('adicionar_avaliacao', { materia_key: k3, nota: notaVal, nome_eval: nome });

        renderNotas(); renderVisao(); flashSave(); return;
      }

      var f = target.closest('button[data-f]');
      if (f) {
        var k2 = f.getAttribute('data-f'), d = parseInt(f.getAttribute('data-d'), 10);
        faltas[k2] = Math.max(0, (faltas[k2] || 0) + d);
        store.set('bp_faltas', faltas);
        
        window.trackEvent('alterar_faltas', { materia_key: k2, direcao: d > 0 ? 'incremento' : 'decremento' });

        renderNotas(); renderVisao(); flashSave(); return;
      }

      var xr = target.closest('.ev-x');
      if (xr) { 
        var dataVal = xr.getAttribute('data-evx'); 
        var parts = dataVal.split('|'); 
        var key = parts[0] + '|' + parts[1]; 
        var index = parseInt(parts[2], 10); 
        if (evals[key]) { 
          evals[key].splice(index, 1); 
          store.set('bp_evals', evals); 

          window.trackEvent('excluir_avaliacao', { materia_key: key });

          renderNotas(); renderVisao(); 
        } 
        return; 
      }
    });

    gradeListContainer.addEventListener('input', function (e) {
      var ta = e.target.closest('textarea.note-in');
      if (ta) { notes[ta.getAttribute('data-nk')] = ta.value; store.set('bp_notes', notes); flashSave(); }
    });
  }

  /* ===== 11. ADIÇÃO E CUSTOMIZAÇÃO DA GRADE ===== */
  function initIrregularGridControls() {
    var gradeSelect = document.getElementById('grade-subj-select');
    var addGradeBtn = document.getElementById('btn-add-grade-subj');
    var restoreBtn = document.getElementById('btn-restore-default-grid');
    var optSelect = document.getElementById('opt-select');
    var optAddBtn = document.getElementById('opt-add');

    if (gradeSelect) {
      var optionsHtml = '';
      for (var s = 1; s <= 9; s++) {
        var subjs = listFor(String(s));
        subjs.forEach(function(sub) {
          if (!sub.opt) {
            optionsHtml += '<option value="' + sub.nome + '">' + s + 'º P · ' + sub.nome + ' (' + sub.ch + 'h)</option>';
          }
        });
      }
      gradeSelect.innerHTML = optionsHtml;
    }

    if (optSelect) {
      optSelect.innerHTML = OPTATIVAS.map(function (o) { return '<option>' + o + '</option>'; }).join('');
    }

    function tentarAdicionarMateria(nomeMateria) {
      var activeList = listFor(curSem);
      
      var jaAtiva = activeList.some(function(it) { return it.nome === nomeMateria; });
      if (jaAtiva) {
        alert('A matéria "' + nomeMateria + '" já está cadastrada no semestre atual.');
        return;
      }

      var semAprovado = isAprovadoEmSemestreAnterior(nomeMateria, curSem);
      if (semAprovado !== false) {
        alert('Não é possível adicionar: O aluno já foi APROVADO na matéria "' + nomeMateria + '" no ' + semAprovado + 'º período.');
        return;
      }

      if (removedSubjs[curSem]) {
        removedSubjs[curSem] = removedSubjs[curSem].filter(function(n) { return n !== nomeMateria; });
        store.set('bp_removed', removedSubjs);
      }

      addedOpt[curSem] = addedOpt[curSem] || [];
      if (addedOpt[curSem].indexOf(nomeMateria) === -1) {
        addedOpt[curSem].push(nomeMateria);
        store.set('bp_opt', addedOpt);

        window.trackEvent('adicionar_materia_custom', { materia_nome: nomeMateria, periodo: curSem });
      }

      renderNotas();
      renderVisao();
      flashSave();
    }

    if (addGradeBtn && gradeSelect) {
      addGradeBtn.addEventListener('click', function() {
        tentarAdicionarMateria(gradeSelect.value);
      });
    }

    if (optAddBtn && optSelect) {
      optAddBtn.addEventListener('click', function() {
        tentarAdicionarMateria(optSelect.value);
      });
    }

    if (restoreBtn) {
      restoreBtn.addEventListener('click', function() {
        if (confirm('Deseja restaurar a grade padrão do ' + curPeriod + 'º período? Matérias removidas voltarão e adições personalizadas deste semestre serão limpas.')) {
          delete addedOpt[curSem];
          delete removedSubjs[curSem];
          store.set('bp_opt', addedOpt);
          store.set('bp_removed', removedSubjs);

          window.trackEvent('restaurar_grade_padrao', { periodo: curSem });

          renderNotas();
          renderVisao();
          flashSave();
        }
      });
    }
  }

  setTimeout(initIrregularGridControls, 400);

  /* ===== 12. QUADRO DE HORÁRIOS, SALAS E FILTRO T1/T2 ===== */
  var selectedTurmaFilter = 'ALL';

  var SCHED_DATA = {
    '1': {
      head: ['Horário', 'SEG · NS', 'TER · NS', 'QUA · NS', 'QUI · NG', 'SEX · NS'],
      rows: [
        {
          t: '19:00–20:40',
          cells: [
            { c: 'G00QUIM1.01', n: 'Química Teórica', p: 'Claudinei Calado', rk: 'seg1_p1', rd: '421', cp: 'ns' },
            { c: 'G00PAOR0.01', n: 'Psicologia Apl. às Organizações', p: 'Thiago Nunes', rk: 'ter1_p1', rd: '421', cp: 'ns' },
            { 
              c: 'G00BCEL0.01 / G00BFLA0.01', 
              n: 'Bio. Celular Prát. (T1) / Biosseg. Prát. (T2)', 
              p: 'L. M. Costa Moreira / M. M. Drumond', 
              rk: 'qua1_p1', rd: 'Lab 208 / 209', cp: 'ns',
              isPractice: true,
              t1Info: { n: 'Bio. Celular Prát. (T1)', p: 'L. M. Costa Moreira', rd: 'Lab 208' },
              t2Info: { n: 'Biosseg. Prát. (T2)', p: 'M. M. Drumond', rd: 'Lab 209' }
            },
            { 
              c: 'G00LQUI1.01 / G00BIOE1.01', 
              n: 'Lab. Química (T1) / Bioestatística I (T2)', 
              p: 'Eudes Lourenço / M. M. Drumond', 
              rk: 'qui1_p1', rd: 'Lab 205 / 121A', cp: 'ng',
              isPractice: true,
              t1Info: { n: 'Lab. Química (T1)', p: 'Eudes Lourenço', rd: 'Lab 205' },
              t2Info: { n: 'Bioestatística I (T2)', p: 'M. M. Drumond', rd: '121A' }
            },
            { c: 'G00QUIM1.01', n: 'Química Teórica', p: 'Claudinei Calado', rk: 'sex1_p1', rd: '421', cp: 'ns' }
          ]
        },
        {
          t: '20:50–22:30',
          cells: [
            { c: 'G00BCEL0.01', n: 'Biologia Celular Teórica', p: 'Thiago Cotta Ribeiro', rk: 'seg2_p1', rd: '421', cp: 'ns' },
            { c: 'G00CSPB0.01', n: 'Contexto Social e Prof. da Biotec.', p: 'Leila S. Ortega / Raquel C. S. Chagas', rk: 'ter2_p1', rd: '421', cp: 'ns' },
            { 
              c: 'G00BCEL0.01 / G00BFLA0.01', 
              n: 'Bio. Celular Prát. (T2) / Biosseg. Prát. (T1)', 
              p: 'L. M. Costa Moreira / M. M. Drumond', 
              rk: 'qua2_p1', rd: 'Lab 208 / 209', cp: 'ns',
              isPractice: true,
              t1Info: { n: 'Biosseg. Prát. (T1)', p: 'M. M. Drumond', rd: 'Lab 209' },
              t2Info: { n: 'Bio. Celular Prát. (T2)', p: 'L. M. Costa Moreira', rd: 'Lab 208' }
            },
            { 
              c: 'G00LQUI1.01 / G00BIOE1.01', 
              n: 'Lab. Química (T2) / Bioestatística I (T1)', 
              p: 'Eudes Lourenço / M. M. Drumond', 
              rk: 'qui2_p1', rd: 'Lab 205 / 121A', cp: 'ng',
              isPractice: true,
              t1Info: { n: 'Bioestatística I (T1)', p: 'M. M. Drumond', rd: '121A' },
              t2Info: { n: 'Lab. Química (T2)', p: 'Eudes Lourenço', rd: 'Lab 205' }
            },
            { c: 'G00FITE0.01', n: 'Filosofia da Tecnologia', p: 'Huener Silva Gonçalves', rk: 'sex2_p1', rd: '421', cp: 'ns' }
          ]
        }
      ]
    },
    '2': {
      head: ['Horário', 'SEG · NS', 'TER · NS', 'QUA · NS', 'QUI · NS', 'SEX · NS'],
      rows: [
        {
          t: '19:00–20:40',
          cells: [
            { c: 'G00EPCO1.01', n: 'Estrutura e Propriedades dos Compostos Orgânicos', p: 'Prof. Cleverson Fernando Garcia', rk: 'seg1_p2', rd: '422', cp: 'ns' },
            { c: 'G00INSO0.01', n: 'Introdução à Sociologia', p: 'Profª Fabia Barboza Heluy Caram', rk: 'ter1_p2', rd: '422', cp: 'ns' },
            { c: 'G00EPCO1.01', n: 'Estrutura e Propriedades dos Compostos Orgânicos', p: 'Prof. Cleverson Fernando Garcia', rk: 'qua1_p2', rd: '422', cp: 'ns' },
            { c: 'G00HGHU0.01', n: 'Histologia Geral Humana', p: 'Profª Graziele Pereira Oliveira', rk: 'qui1_p2', rd: '422', cp: 'ns' },
            { 
              c: 'G00BIOE2.01 / G00HGHU0.01', 
              n: 'Bioestatística II (T1) / Histologia Prática (T2)', 
              p: 'Profª Mariana / Profª Graziele', rk: 'sex1_p2', rd: 'Lab. 123 / Lab. 208 DCB', cp: 'ns',
              isPractice: true,
              t1Info: { n: 'Bioestatística II (T1)', p: 'Profª Mariana Martins Drumond', rd: 'Lab. 123 Depto. Materiais' },
              t2Info: { n: 'Histologia Prática (T2)', p: 'Profª Graziele Pereira Oliveira', rd: 'Lab. 208 DCB' }
            }
          ]
        },
        {
          t: '20:50–22:30',
          cells: [
            { c: 'G00SRBIO.01', n: 'Segurança e Regulamentação em Biotecnologia', p: 'Prof. Gilberto Cifuentes Dias Araújo', rk: 'seg2_p2', rd: '422', cp: 'ns' },
            { c: 'G00MGER0.01', n: 'Microbiologia Geral', p: 'Profª Mariana de Lourdes Almeida Vieira', rk: 'ter2_p2', rd: '422', cp: 'ns' },
            { c: 'G00MCIE0.01', n: 'Metodologia Científica', p: 'Profª Mariana de Lourdes Almeida Vieira', rk: 'qua2_p2', rd: '422', cp: 'ns' },
            { c: 'G00MGER0.01', n: 'Microbiologia Geral', p: 'Profª Mariana de Lourdes Almeida Vieira', rk: 'qui2_p2', rd: '422', cp: 'ns' },
            { 
              c: 'G00BIOE2.01 / G00HGHU0.01', 
              n: 'Bioestatística II (T2) / Histologia Prática (T1)', 
              p: 'Profª Mariana / Profª Graziele', rk: 'sex2_p2', rd: 'Lab. 123 / Lab. 208 DCB', cp: 'ns',
              isPractice: true,
              t1Info: { n: 'Histologia Prática (T1)', p: 'Profª Graziele Pereira Oliveira', rd: 'Lab. 208 DCB' },
              t2Info: { n: 'Bioestatística II (T2)', p: 'Profª Mariana Martins Drumond', rd: 'Lab. 123 Depto. Materiais' }
            }
          ]
        }
      ]
    }
  };

  function schedTable(editable) {
    var pKey = String(curPeriod > 2 ? 1 : curPeriod);
    var sched = SCHED_DATA[pKey] || SCHED_DATA['1'];
    
    var th = '<tr>' + sched.head.map(function(h){ return '<th>' + h + '</th>'; }).join('') + '</tr>';
    var body = sched.rows.map(function(r){
      return '<tr><td class="time">' + r.t + '</td>' + r.cells.map(function(c){
        var rd = rooms[c.rk] !== undefined ? rooms[c.rk] : c.rd;
        
        var isHighlighted = false;
        var displayTitle = c.n;
        var displayProf = c.p;
        var displayRoom = rd;

        if (c.isPractice && selectedTurmaFilter !== 'ALL') {
          isHighlighted = true;
          var tData = (selectedTurmaFilter === 'T1') ? c.t1Info : c.t2Info;
          if (tData) {
            displayTitle = tData.n;
            displayProf = tData.p;
            displayRoom = rooms[c.rk] !== undefined ? rooms[c.rk] : tData.rd;
          }
        }

        var roomHtml = editable ? 
          '<div class="cell-room"><label>sala</label><input data-rk="' + c.rk + '" value="' + esc(displayRoom) + '"></div>' : 
          '<div class="cell-room"><span class="rd">sala ' + esc(displayRoom) + '</span></div>';
        
        var cellContent = '<span class="campus-tag campus-' + c.cp + '">' + (c.cp === 'ng' ? 'NG' : 'NS') + '</span> ' +
                          '<span class="cell-c">' + c.c + '</span>' +
                          '<div class="cell-n">' + esc(displayTitle) + '</div>' +
                          '<div class="cell-p">' + esc(displayProf) + '</div>' + roomHtml;

        return '<td class="' + (isHighlighted ? 'cell-practice-highlight' : '') + '">' + cellContent + '</td>';
      }).join('') + '</tr>';
    }).join('');

    return '<table class="grid-sched">' + th + body + '</table>';
  }

  function renderHorarios() {
    var host = document.getElementById('sched-horarios');
    if (!host) return;

    var schedSelect = document.getElementById('sched-period-select');
    if (schedSelect) schedSelect.value = String(curPeriod > 2 ? 1 : curPeriod);

    var turmaSelect = document.getElementById('sched-turma-select');
    if (turmaSelect) turmaSelect.value = selectedTurmaFilter;

    host.innerHTML = schedTable(true);
    host.querySelectorAll('input[data-rk]').forEach(function(inp){
      inp.addEventListener('input', function(){
        rooms[inp.getAttribute('data-rk')] = inp.value;
        store.set('bp_rooms', rooms);
        flashSave();
        renderVisao();
      });
    });
    renderAgenda();
  }

  var schedPeriodSelect = document.getElementById('sched-period-select');
  if (schedPeriodSelect) {
    schedPeriodSelect.addEventListener('change', function(){
      curPeriod = parseInt(this.value, 10);
      store.set('bp_curperiod', curPeriod);
      buildPeriodMenu();
      renderNotas();
      renderVisao();
      renderHorarios();
      flashSave();
    });
  }

  var schedTurmaSelect = document.getElementById('sched-turma-select');
  if (schedTurmaSelect) {
    schedTurmaSelect.addEventListener('change', function(){
      selectedTurmaFilter = this.value;
      renderHorarios();
      renderVisao();
    });
  }

  /* ===== 13. PAINEL VISÃO GERAL INTEGRADO E DINÂMICO ===== */
  async function renderVisaoAvisosBanner() {
    var banner = document.getElementById('vg-aviso-banner');
    var titleElem = document.getElementById('vg-aviso-title');
    var pillElem = document.getElementById('vg-aviso-pill');
    if (!banner || !titleElem) return;

    var list = (window.BP_AVISOS && typeof window.BP_AVISOS.getLoadedAvisos === 'function') 
      ? window.BP_AVISOS.getLoadedAvisos() 
      : [];

    if (!list.length) {
      banner.style.display = 'none';
      return;
    }

    var latestAviso = list[0];
    banner.style.display = 'block';
    titleElem.textContent = ' ' + latestAviso.titulo + ' (' + latestAviso.data_inicio + ')';
    
    if (pillElem) {
      pillElem.textContent = latestAviso.nivel === 'critico' ? 'Aviso Crítico' : (latestAviso.nivel === 'atencao' ? 'Atenção' : 'Aviso');
      pillElem.className = 'aviso-tag-pill ' + latestAviso.nivel;
    }

    banner.onclick = function() {
      var btnNav = document.querySelector('nav button[data-page="avisos"]');
      if (btnNav) btnNav.click();
    };
  }

  function renderVisao(){
    renderVisaoAvisosBanner();
    
    var wrap = document.getElementById('visao-wrap'); 
    var extraBlocks = document.getElementById('visao-extra-blocks');
    if(!wrap) return;

    var done = doneHours();
    var pctInt = Math.min(100, done / TOTAL_HA * 100);
    var cra = realCRA();
    var compTotal = comp.items.reduce(function(a,b){ return a + (parseFloat(b.horas) || 0); }, 0);
    var compPct = comp.meta > 0 ? Math.min(100, compTotal / comp.meta * 100) : 0;

    var risco = [];
    for(var s = 1; s <= curPeriod; s++){
      listFor(String(s)).forEach(function(it){
        var k = keyOf(String(s), it), f = faltas[k] || 0, mx = maxFaltas(it.ch);
        if(mx > 0 && f >= Math.ceil(mx * 0.6)){
          var stat = f > mx ? ['Reprovado', 'bad'] : (f >= mx - 1 ? ['No limite', 'warn'] : ['Atenção', 'warn']);
          risco.push({ nome: it.nome, sem: s, f: f, mx: mx, stat: stat, ratio: f / mx });
        }
      });
    }
    risco.sort(function(a,b){ return b.ratio - a.ratio; });
    risco = risco.slice(0, 5);

    var today = new Date(); today.setHours(0,0,0,0);
    var combinedEvents = [];

    if (typeof CALENDAR_DB !== 'undefined') {
      CALENDAR_DB.forEach(function(ev){
        var d = new Date(ev.date + 'T00:00:00');
        if(d >= today) { combinedEvents.push({ title: ev.title, date: ev.date, type: ev.type, oficial: true }); }
      });
    }

    if (typeof agenda !== 'undefined') {
      agenda.forEach(function(ev){
        if(ev.date) {
          var d = new Date(ev.date + 'T00:00:00');
          if(d >= today) { combinedEvents.push({ title: ev.title, date: ev.date, type: ev.type, oficial: false }); }
        }
      });
    }

    combinedEvents.sort(function(x,y){ return x.date.localeCompare(y.date); });
    var prox = combinedEvents.slice(0, 5);
    var activePeriodNumber = (curPeriod > 2 ? 1 : curPeriod);

    var schedControls = '<div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">' +
      '<div><label style="font-size:11px; font-weight:800; color:var(--ink-soft); margin-right:6px;">PERÍODO:</label>' +
      '<select id="vg-sched-period-select" class="sched-select-dropdown">' +
        '<option value="1"' + (activePeriodNumber === 1 ? ' selected' : '') + '>1º período</option>' +
        '<option value="2"' + (activePeriodNumber === 2 ? ' selected' : '') + '>2º período</option>' +
      '</select></div>' +
      '<div><label style="font-size:11px; font-weight:800; color:var(--ink-soft); margin-right:6px;">TURMA:</label>' +
      '<select id="vg-sched-turma-select" class="sched-select-dropdown">' +
        '<option value="ALL"' + (selectedTurmaFilter === 'ALL' ? ' selected' : '') + '>Todas</option>' +
        '<option value="T1"' + (selectedTurmaFilter === 'T1' ? ' selected' : '') + '>T1</option>' +
        '<option value="T2"' + (selectedTurmaFilter === 'T2' ? ' selected' : '') + '>T2</option>' +
      '</select></div>' +
      '</div>';

    var schedBlock = '<div class="ov-card" style="margin-bottom:var(--s3)"><div class="oh" style="flex-wrap:wrap; gap:10px;">' +
      '<div><h4>Grade da semana · ' + activePeriodNumber + 'º período</h4>' +
      '<span class="olink" data-go="horarios" style="display:inline-block; margin-top:4px;">editar períodos e salas →</span></div>' +
      schedControls + 
      '</div><div style="overflow-x:auto">' + schedTable(false) + '</div></div>';

    var eventos = '<div class="ov-card" style="margin-bottom:var(--s3)"><div class="oh"><h4>Próximos eventos (Unificados)</h4><span class="olink" data-go="calendario">ver calendário completo →</span></div>'
      + (prox.length ? prox.map(function(a){
        var d = new Date(a.date + 'T00:00:00');
        var dias = Math.round((d - today) / 86400000);
        var quando = dias === 0 ? 'hoje' : (dias === 1 ? 'amanhã' : 'em ' + dias + ' dias');
        return '<div class="ov-li"><div><div class="oname">' + (a.oficial ? '<span style="color:var(--accent); font-weight:800; font-size:11px">[Oficial ✓]</span> ' : '') + esc(a.title) + '</div><div class="osub">' + esc(a.type) + ' · ' + esc(a.date) + '</div></div><span class="badge ' + (dias <= 3 ? 'warn' : 'neutral') + '">' + quando + '</span></div>';
      }).join('') : '<div class="ov-empty">Nenhum evento futuro encontrado.</div>')
      + '</div>';

    var faltasRisco = '<div class="ov-card" style="margin-bottom:var(--s3)"><div class="oh"><h4>Faltas em risco</h4><span class="olink" data-go="notas">ver notas &amp; faltas →</span></div>'
      + (risco.length ? risco.map(function(r){ return '<div class="ov-li"><div><div class="oname">' + esc(r.nome) + '</div><div class="osub">' + r.sem + 'º período · ' + r.f + ' de ' + r.mx + ' faltas</div></div><span class="badge ' + r.stat[1] + '">' + r.stat[0] + '</span></div>'; }).join('') : '<div class="ov-empty">Tudo tranquilo — nenhuma disciplina em risco.</div>')
      + '</div>';

    var kpis = ''
      + '<div class="ov-kpi"><div class="kv">' + (cra !== null ? cra.toFixed(1) : '—') + '</div><div class="kl">CRA real</div><div class="ks">' + (cra !== null ? (cra >= 75 ? 'acima da meta 75' : 'meta ~75') : 'sem notas ainda') + '</div></div>'
      + '<div class="ov-kpi"><div class="kv">' + pctInt.toFixed(0) + '%</div><div class="kl">Integralização</div><div class="ks">' + done + ' / ' + TOTAL_HA + ' h/a</div></div>'
      + '<div class="ov-kpi"><div class="kv">' + curPeriod + 'º</div><div class="kl">Período atual</div><div class="ks">' + (9 - curPeriod) + ' restante(s) de 9</div></div>'
      + '<div class="ov-kpi"><div class="kv">' + compTotal + '</div><div class="kl">Horas complementares</div><div class="ks">' + compPct.toFixed(0) + '% da meta de ' + comp.meta + ' h</div></div>';

    wrap.innerHTML = schedBlock;
    if (extraBlocks) extraBlocks.innerHTML = eventos + faltasRisco + '<div class="ov-kpis">' + kpis + '</div>';

    var vgPeriodSelect = document.getElementById('vg-sched-period-select');
    if (vgPeriodSelect) {
      vgPeriodSelect.addEventListener('change', function(){
        curPeriod = parseInt(this.value, 10);
        store.set('bp_curperiod', curPeriod);
        buildPeriodMenu(); renderNotas(); renderVisao(); renderHorarios(); flashSave();
      });
    }

    var vgTurmaSelect = document.getElementById('vg-sched-turma-select');
    if (vgTurmaSelect) {
      vgTurmaSelect.addEventListener('change', function(){
        selectedTurmaFilter = this.value;
        renderVisao(); renderHorarios();
      });
    }
  }

  /* ===== 14. AGENDA DE EVENTOS & HORAS COMPLEMENTARES ===== */
  function renderAgenda() { var wrap = document.getElementById('agenda-wrap'); if(!wrap) return; var today = new Date(); today.setHours(0, 0, 0, 0); var sorted = agenda.map(function (a, i) { return { a: a, i: i }; }).sort(function (x, y) { return (x.a.date || '').localeCompare(y.a.date || ''); }); var items = sorted.length ? sorted.map(function (o) { var a = o.a; var d = a.date ? new Date(a.date + 'T00:00:00') : null; var dias = d ? Math.round((d - today) / 86400000) : null; var sub = d ? (dias > 0 ? 'em ' + dias + ' dia(s)' : (dias === 0 ? 'hoje' : Math.abs(dias) + ' dia(s) atrás')) : ''; var dim = (dias !== null && dias < 0) ? 'opacity:.55;' : ''; return '<div class="titem" style="' + dim + '"><div><div class="ti-main">' + esc(a.title) + '</div><div class="ti-sub"><span class="ti-tag">' + esc(a.type) + '</span> · ' + esc(a.date || '') + (sub ? ' · ' + sub : '') + '</div></div><span class="ti-rm" data-rm="' + o.i + '">remover</span></div>'; }).join('') : '<div class="empty">Sem eventos de agenda.</div>'; wrap.innerHTML = '<div class="addrow"><input id="ag-date" type="date"><input class="grow" id="ag-title" placeholder="Título (ex: Exame Especial - Cálculo I)"><select id="ag-type"><option>Prova</option><option>Entrega</option><option>Evento</option><option>Reunião</option><option>Outro</option></select><input class="grow" id="ag-desc" placeholder="Breve descrição opcional"><button class="add" id="ag-add">Adicionar</button></div>' + items; }
  (function () { 
    var w = document.getElementById('agenda-wrap'); 
    if (w) { 
      w.addEventListener('click', function (e) { 
        var a = e.target.closest('#ag-add'); 
        if (a) { 
          var date = document.getElementById('ag-date').value; 
          var title = document.getElementById('ag-title').value; 
          var type = document.getElementById('ag-type').value; 
          var desc = document.getElementById('ag-desc').value; 
          if (!title) { alert('Por favor, informe o título do evento.'); return; } 
          if (!date) { var td = new Date(); date = td.getFullYear() + '-' + String(td.getMonth() + 1).padStart(2, '0') + '-' + String(td.getDate()).padStart(2, '0'); } 
          agenda.push({ date: date, title: title, type: type, desc: desc }); 
          store.set('bp_agenda', agenda); 

          window.trackEvent('adicionar_evento_agenda', { titulo_evento: title, tipo: type, data_evento: date });

          renderAgenda(); renderVisao(); if (document.getElementById('page-calendario').classList.contains('on')) renderCalendario(); flashSave(); return; 
        } 
        var rm = e.target.closest('.ti-rm'); 
        if (rm) { agenda.splice(+rm.getAttribute('data-rm'), 1); store.set('bp_agenda', agenda); renderAgenda(); renderVisao(); if (document.getElementById('page-calendario').classList.contains('on')) renderCalendario(); flashSave(); } 
      }); 
    } 
  })();

  var visaoWrap = document.getElementById('visao-wrap');
  if (visaoWrap) {
    visaoWrap.addEventListener('click', function (e) { var g = e.target.closest('[data-go]'); if (!g) return; var blk = g.getAttribute('data-go'); if (blk === 'calendario') { var btnCal = document.querySelector('nav button[data-page="calendario"]'); if (btnCal) btnCal.click(); } else { var btnPainel = document.querySelector('nav button[data-page="painel"]'); if (btnPainel) btnPainel.click(); setTimeout(function () { var tab = document.querySelector('#subnav button[data-block="' + blk + '"]'); if (tab) tab.click(); }, 100); } });
  }

  function renderComp() { var wrap = document.getElementById('comp-wrap'); if (!wrap) return; var total = comp.items.reduce(function (a, b) { return a + (parseFloat(b.horas) || 0); }, 0); var pct = comp.meta > 0 ? Math.min(100, total / comp.meta * 100) : 0; var items = comp.items.length ? comp.items.map(function (it, i) { return '<div class="titem"><div><div class="ti-main">' + esc(it.desc || it.cat) + '</div><div class="ti-sub"><span class="ti-tag">' + esc(it.cat) + '</span> · ' + (parseFloat(it.horas) || 0) + ' h</div></div><span class="ti-rm" data-rm="' + i + '">remover</span></div>'; }).join('') : '<div class="empty">Nenhuma atividade lançada ainda.</div>'; wrap.innerHTML = '<div class="miniprog" style="margin-bottom:var(--s4)"><div class="mt"><span>Horas complementares</span><b>' + total + ' / ' + comp.meta + ' h</b></div><div class="mbar"><div class="mf" style="width:' + pct + '%"></div></div></div><div class="addrow"><select id="comp-cat"><option>Eventos/Palestras</option><option>Cursos</option><option>Iniciação Científica</option><option>Monitoria</option><option>Extensão</option><option>Publicação</option><option>Visita técnica</option><option>Outro</option></select><input class="grow" id="comp-desc" placeholder="Descrição"><input class="mini" id="comp-h" type="number" placeholder="horas"><button class="add" id="comp-add">Adicionar</button><label>meta <input class="mini" id="comp-meta" type="number" value="' + comp.meta + '"></label></div>' + items; }
  (function () { var w = document.getElementById('comp-wrap'); if (w) { w.addEventListener('click', function (e) { var a = e.target.closest('#comp-add'); if (a) { var cat = document.getElementById('comp-cat').value, desc = document.getElementById('comp-desc').value, h = document.getElementById('comp-h').value; if (!h) { return; } comp.items.push({ cat: cat, desc: desc, horas: h }); store.set('bp_comp', comp); renderComp(); renderVisao(); flashSave(); return; } var rm = e.target.closest('.ti-rm'); if (rm) { comp.items.splice(+rm.getAttribute('data-rm'), 1); store.set('bp_comp', comp); renderComp(); renderVisao(); flashSave(); } }); w.addEventListener('change', function (e) { if (e.target.id === 'comp-meta') { comp.meta = parseFloat(e.target.value) || 0; store.set('bp_comp', comp); renderComp(); renderVisao(); flashSave(); } }); } })();

  /* ===== 15. PLANEJADOR DE OPTATIVAS ===== */
  function chOfOptNode(nd) { return CH_BY_NAME[nd.n] || 30; }
  function optNodes() { return GNODES.filter(function (n) { return n.opt; }); }
  function renderPlanner() { var pool = document.getElementById('pool-items'); var grid = document.getElementById('plan-grid'); if (!pool || !grid) return; var periods = [3, 4, 5, 7, 8, 9]; grid.innerHTML = periods.map(function (p) { return '<div class="plan-col" data-p="' + p + '"><div class="pct">' + p + 'º período</div><div class="pch" id="pch-' + p + '"></div><div class="pdrop" id="drop-' + p + '"></div></div>'; }).join(''); pool.innerHTML = ''; optNodes().forEach(function (o) { if (plan[o.id] === undefined) { pool.appendChild(chip(o, null)); } }); periods.forEach(function (p) { var d = document.getElementById('drop-' + p); optNodes().forEach(function (o) { if (plan[o.id] === p) d.appendChild(chip(o, p)); }); updateColCh(p); }); attachDnD(); }
  function chip(nd, period) { var el = document.createElement('div'); el.className = 'optchip'; el.setAttribute('draggable', 'true'); el.setAttribute('data-id', nd.id); var bad = false, warn = ''; if (period !== null) { var rel = relatives(nd.id); rel.prereqs.forEach(function (prId) { var prNode = nodeOf(prId); if (!prNode) return; var satisfied = prNode.opt ? (plan[prId] !== undefined && plan[prId] < period) : (prNode.p < period); if (!satisfied) { bad = true; warn = 'Pré: ' + prNode.n + ' (' + prNode.p + 'º)'; } }); } if (bad) el.classList.add('bad'); el.innerHTML = '<span>' + nd.n + '<small> · ' + chOfOptNode(nd) + ' h/a</small>' + (bad ? '<div class="plan-warn">⚠ ' + warn + ' antes</div>' : '') + '</span>'; return el; }
  function updateColCh(p) { var sum = 0; optNodes().forEach(function (o) { if (plan[o.id] === p) sum += chOfOptNode(o); }); var el = document.getElementById('pch-' + p); if (el) el.textContent = sum + ' h/a planejadas'; }
  var dragId = null;
  function attachDnD() { 
    document.querySelectorAll('.optchip').forEach(function (c) { c.addEventListener('dragstart', function () { dragId = c.getAttribute('data-id'); c.classList.add('dragging'); }); c.addEventListener('dragend', function () { c.classList.remove('dragging'); }); }); 
    document.querySelectorAll('.plan-col').forEach(function (col) { 
      col.addEventListener('dragover', function (e) { e.preventDefault(); col.classList.add('over'); }); 
      col.addEventListener('dragleave', function (e) { e.preventDefault(); col.classList.remove('over'); }); 
      col.addEventListener('drop', function (e) { 
        e.preventDefault(); 
        col.classList.remove('over'); 
        if (dragId === null) return; 
        var targetP = parseInt(col.getAttribute('data-p'), 10);
        plan[dragId] = targetP; 
        store.set('bp_plan', plan); 

        window.trackEvent('arrastar_optativa_planejador', { optativa_id: dragId, periodo_destino: targetP });

        dragId = null; 
        renderPlanner(); 
        flashSave(); 
      }); 
    }); 
    var pool = document.getElementById('plan-pool'); 
    if (pool) { 
      pool.addEventListener('dragover', function (e) { e.preventDefault(); }); 
      pool.addEventListener('drop', function (e) { e.preventDefault(); if (dragId === null) return; delete plan[dragId]; store.set('bp_plan', plan); dragId = null; renderPlanner(); flashSave(); }); 
    } 
  }

  /* ===== 16. CALENDÁRIO ACADÊMICO E EMENTAS KANBAN ===== */
  var calendarCurrentDate = new Date(2026, 7, 1);
  function renderCalendario() {
    var grid = document.getElementById('calendar-days-grid'); var monthTitle = document.getElementById('cal-month-title'); var statsBox = document.getElementById('cal-stats-box'); if (!grid || !monthTitle || !statsBox) return;
    grid.innerHTML = ''; var year = calendarCurrentDate.getFullYear(); var month = calendarCurrentDate.getMonth();
    var mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    monthTitle.textContent = mesesNomes[month] + ' ' + year;
    var totalDaysOficial = MONTHLY_DAYS_OFICIAL[month + 1] !== undefined ? MONTHLY_DAYS_OFICIAL[month + 1] : '--';
    statsBox.innerHTML = 'Dias letivos oficiais no mês: <b>' + totalDaysOficial + '</b>';
    var diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    grid.insertAdjacentHTML('beforeend', diasSemana.map(function (d) { return '<div class="calendar-weekday">' + d + '</div>'; }).join(''));
    var firstDayIndex = new Date(year, month, 1).getDay(); var lastDay = new Date(year, month + 1, 0).getDate(); var prevMonthLastDay = new Date(year, month, 0).getDate();
    for (var i = firstDayIndex; i > 0; i--) { var d = prevMonthLastDay - i + 1; grid.appendChild(createDayCell(year, month - 1, d, true)); }
    var today = new Date();
    for (var day = 1; day <= lastDay; day++) { var isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year; grid.appendChild(createDayCell(year, month, day, false, isToday)); }
    var totalCellsSoFar = firstDayIndex + lastDay; var remainingCells = (7 - (totalCellsSoFar % 7)) % 7;
    for (var dayNext = 1; dayNext <= remainingCells; dayNext++) { grid.appendChild(createDayCell(year, month + 1, dayNext, true)); }
  }

  function createDayCell(year, month, day, isOtherMonth, isToday) {
    var cell = document.createElement('div'); cell.className = 'calendar-day' + (isOtherMonth ? ' other-month' : '') + (isToday ? ' today' : '');
    var dayNum = document.createElement('span'); dayNum.className = 'calendar-day-num'; dayNum.textContent = day; cell.appendChild(dayNum);
    var formattedMonth = String(month + 1).padStart(2, '0'); var formattedDay = String(day).padStart(2, '0'); var dateString = year + '-' + formattedMonth + '-' + formattedDay;
    var eventsContainer = document.createElement('div'); eventsContainer.className = 'calendar-events-wrap';
    if (typeof CALENDAR_DB !== 'undefined') { CALENDAR_DB.forEach(function (ev) { if (ev.date === dateString) { eventsContainer.appendChild(createEventPill(ev, true, formattedMonth, formattedDay)); } }); }
    agenda.forEach(function (ev, idx) { if (ev.date === dateString) { var eventCopy = Object.assign({}, ev); eventCopy.index = idx; eventsContainer.appendChild(createEventPill(eventCopy, false, formattedMonth, formattedDay)); } });
    cell.appendChild(eventsContainer); return cell;
  }

  function createEventPill(ev, isOficial, m, d) {
    var pill = document.createElement('div'); pill.className = 'calendar-event-pill'; pill.title = ev.title + ' (' + ev.type + ')';
    var colorVar = '--cal-user';
    if (isOficial) { if (ev.type === 'Ensino & Aulas') colorVar = '--cal-ensino'; else if (ev.type === 'Matrículas & Ajustes') colorVar = '--cal-matricula'; else if (ev.type === 'Prazos & Trancamento') colorVar = '--cal-prazos'; else if (ev.type === 'TCC, Estágio & Ext.') colorVar = '--cal-tcc'; else if (ev.type === 'Avaliação & Exames') colorVar = '--cal-aval'; else if (ev.type === 'Feriados & Recessos') colorVar = '--cal-feriado'; }
    pill.style.backgroundColor = 'var(' + colorVar + ')';
    pill.innerHTML = (isOficial ? '<span class="badge-ofic">✓</span> ' : '') + esc(ev.title);
    pill.addEventListener('click', function (e) { e.stopPropagation(); window.openEventDetailsModal(ev, isOficial, colorVar); });
    return pill;
  }

  /* Clique nos cartões Kanban das Obrigatórias */
  var gradeKanban = document.getElementById('grade-kanban-board');
  if (gradeKanban) {
    gradeKanban.addEventListener('click', function (e) {
      var card = e.target.closest('.kanban-card'); if (!card) return;
      var subjId = card.getAttribute('data-subj-id');
      var data = (D.OBR_CATALOGUE || {})[subjId]; if (!data) return;
      
      window.openEventDetailsModal({
        title: data.title + ' (' + data.code + ')',
        type: 'Disciplina Obrigatória · ' + data.dept,
        credits: data.hours + ' · ' + data.credits + ' Créditos',
        desc: data.desc
      }, true, data.color);
    });
  }

  /* Clique nos cartões Kanban das Optativas */
  var optKanban = document.getElementById('opt-kanban-board');
  if (optKanban) {
    optKanban.addEventListener('click', function (e) {
      var card = e.target.closest('.kanban-card'); if (!card) return;
      var optId = card.getAttribute('data-opt-id'); var data = OPT_CATALOGUE[optId]; if (!data) return;

      window.openEventDetailsModal({
        title: data.title + ' (' + data.code + ')',
        type: 'Disciplina Optativa · ' + data.dept,
        credits: data.hours + ' · ' + data.credits + ' Créditos',
        desc: data.desc
      }, true, data.color);
    });
  }

  /* ===== 17. SUB-ABAS DA GRADE OBRIGATÓRIA / OPTATIVAS ===== */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-grade-tab]');
    if (!btn) return;

    var tabKey = btn.getAttribute('data-grade-tab');

    document.querySelectorAll('button[data-grade-tab]').forEach(function (x) {
      x.classList.toggle('on', x === btn);
    });

    var blockObr = document.getElementById('grade-tab-obrigatorias');
    var blockOpt = document.getElementById('grade-tab-optativas');

    if (blockObr && blockOpt) {
      if (tabKey === 'optativas') {
        blockObr.classList.remove('on');
        blockObr.style.display = 'none';
        blockOpt.classList.add('on');
        blockOpt.style.display = 'block';
      } else {
        blockOpt.classList.remove('on');
        blockOpt.style.display = 'none';
        blockObr.classList.add('on');
        blockObr.style.display = 'block';
      }
    }
  });

  /* MODAL DE EVENTOS E EMENTAS GLOBAL */
  var modalOverlay = document.getElementById('cal-event-modal-overlay');
  var closeBtn = document.getElementById('cal-modal-close-btn');

  window.openEventDetailsModal = function (ev, isOficial, colorVar) {
    var bgHeader = document.getElementById('cal-modal-header-bg'); 
    if (bgHeader) bgHeader.style.backgroundColor = 'var(' + colorVar + ')';
    
    var catElem = document.getElementById('cal-modal-category'); 
    if (catElem) catElem.textContent = ev.type;
    
    var titleElem = document.getElementById('cal-modal-title'); 
    if (titleElem) titleElem.textContent = ev.title;
    
    var dateRow = document.querySelector('.cal-modal-info-row:has(#cal-modal-date-str)');
    var dateStrElem = document.getElementById('cal-modal-date-str');

    // Se for disciplina (sem formato YYYY-MM-DD), esconde a linha da data
    if (ev.date && ev.date.indexOf('-') !== -1 && ev.date.split('-').length === 3) {
      if (dateRow) dateRow.style.display = 'flex';
      var dateParts = ev.date.split('-'); 
      var parsedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]); 
      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }; 
      var dateStr = parsedDate.toLocaleDateString('pt-BR', options); 
      if (dateStrElem) dateStrElem.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    } else {
      if (dateRow) dateRow.style.display = 'none';
      if (dateStrElem) dateStrElem.textContent = '';
    }

    var originContainer = document.getElementById('cal-modal-origin');
    if (originContainer) {
      if (ev.credits) {
        originContainer.textContent = ev.credits;
      } else if (!isOficial) { 
        originContainer.innerHTML = 'Agenda Pessoal / Customizada <br><button id="btn-delete-cal-event" class="badge bad" style="margin-top: 8px; border: none; cursor: pointer;">Excluir este evento</button>'; 
        var delBtn = document.getElementById('btn-delete-cal-event'); 
        if (delBtn) delBtn.onclick = function () { 
          if (confirm("Deseja realmente apagar este evento de sua agenda?")) { 
            agenda.splice(ev.index, 1); 
            store.set('bp_agenda', agenda); 
            if (modalOverlay) modalOverlay.style.display = 'none'; 
            renderCalendario(); renderVisao(); renderAgenda(); flashSave(); 
          } 
        }; 
      } else { 
        originContainer.textContent = 'Oficial — Deliberação CGRAD 25/2026 (CEFET-MG)'; 
      }
    }

    var descElem = document.getElementById('cal-modal-desc'); 
    if (descElem) descElem.innerHTML = ev.desc ? esc(ev.desc) : 'Sem descrição disponível para este item.';
    
    if (modalOverlay) modalOverlay.style.display = 'flex';
  };

  if (closeBtn) closeBtn.addEventListener('click', function () { if (modalOverlay) modalOverlay.style.display = 'none'; });
  if (modalOverlay) modalOverlay.addEventListener('click', function (e) { if (e.target === modalOverlay) { modalOverlay.style.display = 'none'; } });
  var calPrev = document.getElementById('cal-prev'); if (calPrev) calPrev.addEventListener('click', function () { calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() - 1); renderCalendario(); });
  var calNext = document.getElementById('cal-next'); if (calNext) calNext.addEventListener('click', function () { calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + 1); renderCalendario(); });

  /* ===== BACKUPS E ADMIN ===== */
  var KEYS = ['bp_faltas', 'bp_rooms', 'bp_opt', 'bp_plan', 'bp_curperiod', 'bp_notes', 'bp_evals', 'bp_comp', 'bp_agenda', 'bp_theme', 'bp_dataversion', 'bp_expanded', 'bp_removed'];
  var fabBackup = document.getElementById('fab-backup'); if (fabBackup) fabBackup.addEventListener('click', function (e) { e.stopPropagation(); if (tools) tools.classList.remove('open'); var data = {}; KEYS.forEach(function (k) { var v = localStorage.getItem(k); if (v !== null) data[k] = v; }); data.__exported = new Date().toISOString(); var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = 'biopulse-backup.json'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 120); flashSave(); });
  var fabImport = document.getElementById('fab-import'); if (fabImport) fabImport.addEventListener('click', function (e) { e.stopPropagation(); if (tools) tools.classList.remove('open'); var impFile = document.getElementById('import-file'); if (impFile) impFile.click(); });
  var impFileElem = document.getElementById('import-file'); if (impFileElem) impFileElem.addEventListener('change', function (e) { var f = e.target.files && e.target.files[0]; if (!f) return; var rd = new FileReader(); rd.onload = function () { try { var data = JSON.parse(rd.result); if (!confirm('Restaurar este backup? Os dados atuais serão substituídos.')) return; KEYS.forEach(function (k) { if (data[k] !== undefined) localStorage.setItem(k, data[k]); }); location.reload(); } catch (err) { alert('Arquivo inválido.'); } }; rd.readAsText(f); e.target.value = ''; });
  var fabPrint = document.getElementById('fab-print'); if (fabPrint) fabPrint.addEventListener('click', function (e) { e.stopPropagation(); if (tools) tools.classList.remove('open'); window.print(); });
  var fabClear = document.getElementById('fab-clear'); if (fabClear) fabClear.addEventListener('click', function (e) { e.stopPropagation(); if (tools) tools.classList.remove('open'); if (confirm('Limpar TODOS os dados salvos? O tema será mantido.')) { KEYS.forEach(function (k) { if (k !== 'bp_theme') localStorage.removeItem(k); }); location.reload(); } });

  /* ===== 18. TUTORIAL INTERATIVO / ONBOARDING ===== */
  var onboardingOverlay = document.getElementById('onboarding-overlay');
  var onboardingCloseBtn = document.getElementById('onboarding-close-btn');
  var onboardingDismissBtn = document.getElementById('onboarding-dismiss-btn');
  var onboardingPrevBtn = document.getElementById('onboarding-prev-btn');
  var onboardingNextBtn = document.getElementById('onboarding-next-btn');
  var onboardingStepCounter = document.getElementById('onboarding-step-counter');
  var slides = document.querySelectorAll('.onboarding-slide');
  var dots = document.querySelectorAll('.onboarding-dot');
  var currentSlide = 1;
  var totalSlides = slides.length;

  function openOnboarding() {
    currentSlide = 1;
    updateSlideDisplay();
    if (onboardingOverlay) onboardingOverlay.classList.add('open');
    window.trackEvent('onboarding_aberto', { categoria: 'Engajamento' });
  }

  function closeOnboarding(markAsSeen) {
    if (onboardingOverlay) onboardingOverlay.classList.remove('open');
    if (markAsSeen) { store.set('bp_onboarding_seen', true); }
  }

  function updateSlideDisplay() {
    slides.forEach(function(s) {
      var slideNum = parseInt(s.getAttribute('data-slide'), 10);
      s.classList.toggle('active', slideNum === currentSlide);
    });

    dots.forEach(function(d) {
      var dotNum = parseInt(d.getAttribute('data-dot'), 10);
      d.classList.toggle('active', dotNum === currentSlide);
    });

    if (onboardingStepCounter) { onboardingStepCounter.textContent = 'Etapa ' + currentSlide + ' de ' + totalSlides; }
    if (onboardingPrevBtn) onboardingPrevBtn.disabled = (currentSlide === 1);
    
    if (onboardingNextBtn) {
      onboardingNextBtn.textContent = (currentSlide === totalSlides) ? 'Concluir' : 'Próximo';
    }

    if (onboardingDismissBtn) {
      if (currentSlide === 1) onboardingDismissBtn.classList.remove('hidden');
      else onboardingDismissBtn.classList.add('hidden');
    }
  }

  function nextSlide() {
    if (currentSlide < totalSlides) { currentSlide++; updateSlideDisplay(); }
    else { closeOnboarding(true); }
  }

  function prevSlide() {
    if (currentSlide > 1) { currentSlide--; updateSlideDisplay(); }
  }

  if (onboardingCloseBtn) onboardingCloseBtn.addEventListener('click', function() { closeOnboarding(true); });
  if (onboardingDismissBtn) onboardingDismissBtn.addEventListener('click', function() { closeOnboarding(true); });
  if (onboardingNextBtn) onboardingNextBtn.addEventListener('click', nextSlide);
  if (onboardingPrevBtn) onboardingPrevBtn.addEventListener('click', prevSlide);

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && onboardingOverlay && onboardingOverlay.classList.contains('open')) {
      closeOnboarding(true);
    }
  });

  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      currentSlide = parseInt(dot.getAttribute('data-dot'), 10);
      updateSlideDisplay();
    });
  });

  var toolsMenu = document.getElementById('tools-menu');
  if (toolsMenu && !document.getElementById('fab-tutorial')) {
    var fabTutorial = document.createElement('button');
    fabTutorial.id = 'fab-tutorial';
    fabTutorial.title = 'Abrir Tutorial';
    fabTutorial.setAttribute('aria-label', 'Abrir Tutorial');
    fabTutorial.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    
    fabTutorial.addEventListener('click', function(e) {
      e.stopPropagation();
      if (tools) tools.classList.remove('open');
      openOnboarding();
    });

    toolsMenu.insertBefore(fabTutorial, toolsMenu.firstChild);
  }

  /* DEMOS DO ONBOARDING */
  var demoFaltas = 2;
  var demoFaltaMinus = document.getElementById('demo-falta-minus');
  var demoFaltaPlus = document.getElementById('demo-falta-plus');
  var demoFaltasVal = document.getElementById('demo-faltas-val');
  var demoFaltasFill = document.getElementById('demo-faltas-fill');
  var demoBadgeStatus = document.getElementById('demo-badge-status');

  function updateDemoFaltas() {
    if (!demoFaltasVal || !demoFaltasFill) return;
    demoFaltasVal.textContent = demoFaltas + ' fls';
    var pct = Math.min(100, Math.round((demoFaltas / 6) * 100));
    demoFaltasFill.style.width = pct + '%';
    if (demoFaltas > 5) { demoBadgeStatus.textContent = 'Reprovado por Falta'; demoBadgeStatus.className = 'badge bad'; }
    else if (demoFalta >= 4) { demoBadgeStatus.textContent = 'Atenção'; demoBadgeStatus.className = 'badge warn'; }
    else { demoBadgeStatus.textContent = 'Aprovado'; demoBadgeStatus.className = 'badge ok'; }
  }

  if (demoFaltaMinus) demoFaltaMinus.addEventListener('click', function() { if (demoFaltas > 0) { demoFaltas--; updateDemoFaltas(); } });
  if (demoFaltaPlus) demoFaltaPlus.addEventListener('click', function() { if (demoFaltas < 6) { demoFaltas++; updateDemoFaltas(); } });

  var demoNode1 = document.getElementById('demo-node-1');
  var demoNode2 = document.getElementById('demo-node-2');
  var demoEdgeLine = document.getElementById('demo-edge-line');
  if (demoNode1 && demoNode2 && demoEdgeLine) {
    demoNode1.addEventListener('click', function() {
      demoNode1.classList.toggle('active');
      demoEdgeLine.classList.toggle('active');
      demoNode2.classList.toggle('active');
    });
  }

  var demoCalTrigger = document.getElementById('demo-cal-trigger');
  if (demoCalTrigger) {
    demoCalTrigger.addEventListener('click', function() {
      window.openEventDetailsModal({
        title: 'Início do Semestre Letivo 2026.2',
        type: 'Ensino & Aulas',
        date: '2026-08-05',
        desc: 'Aula inaugural e recepção oficial das turmas de veteranos de Biotecnologia e Engenharia.'
      }, true, '--cal-ensino');
    });
  }

  /* Abertura automática no primeiro acesso */
  setTimeout(function() {
    var hasSeen = store.get('bp_onboarding_seen', false);
    if (!hasSeen) { openOnboarding(); }
  }, 400);

  /* ===== 19. INICIALIZAÇÃO DO SISTEMA (INIT) ===== */
  curSem = String(curPeriod);
  renderNotas(); 
  renderHorarios(); 
  renderPlanner(); 
  renderComp(); 
  renderVisao(); 
  observeReveals(); 
  renderCalendario();
});
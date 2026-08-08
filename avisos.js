/* ============================================================
   AVISOS.JS — Módulo Exclusivo de Gestão e Mural de Avisos (Supabase Integrated)
   ============================================================ */

window.BP_AVISOS = (function () {
  "use strict";

  var SUPABASE_URL = "https://bhalzllmozefvbytcghh.supabase.co";
  var SUPABASE_KEY = "sb_publishable_NftyZFwgxOi9x4XPxsalaw_uLCBeEeF";

  var supabaseClient = null;
  var currentFilter = 'todos';
  var loadedAvisos = [];

  function initSupabase() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  }

  function esc(s) {
    return ('' + (s == null ? '' : s)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatDateBR(dateStr) {
    if (!dateStr) return '—';
    var p = dateStr.split('-');
    if (p.length === 3) return p[2] + '/' + p[1] + '/' + p[0];
    return dateStr;
  }

  /* Busca os avisos ativos no Supabase */
  async function fetchAvisos() {
    if (!supabaseClient) return [];
    
    // Obtém a data atual em formato YYYY-MM-DD
    var todayStr = new Date().toISOString().split('T')[0];

    try {
      var { data, error } = await supabaseClient
        .from('avisos')
        .select('*')
        .eq('status', 'aprovado')
        .lte('data_inicio', todayStr)
        .gte('data_fim', todayStr)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      loadedAvisos = data || [];
      return loadedAvisos;
    } catch (err) {
      console.error("Erro ao carregar avisos do Supabase:", err);
      return [];
    }
  }

  /* Renderização do Feed de Avisos */
  async function renderFeed() {
    var container = document.getElementById('avisos-feed-container');
    if (!container) return;

    container.innerHTML = '<div class="empty">Conectando ao mural de avisos oficiais...</div>';

    var list = await fetchAvisos();

    var filtered = list.filter(function (a) {
      if (currentFilter === 'todos') return true;
      return a.nivel === currentFilter;
    });

    if (!filtered.length) {
      container.innerHTML = '<div class="empty">Nenhum aviso ativo publicado para o filtro selecionado no momento.</div>';
      return;
    }

    var html = filtered.map(function (a) {
      var labelNivel = a.nivel === 'critico' ? 'Crítico' : (a.nivel === 'atencao' ? 'Atenção' : 'Comum');
      var dataExibicao = formatDateBR(a.data_inicio);

      return '<div class="aviso-card ' + a.nivel + '" data-aviso-id="' + a.id + '" style="cursor: pointer;">' +
        '<div class="aviso-card-header">' +
          '<div style="display:flex; align-items:center; gap:10px;">' +
            '<span class="aviso-tag-pill ' + a.nivel + '">' + labelNivel + '</span>' +
            '<span class="aviso-meta-info">' + esc(a.categoria) + ' · Por ' + esc(a.autor) + '</span>' +
          '</div>' +
          '<span class="aviso-meta-info">Válido até ' + formatDateBR(a.data_fim) + '</span>' +
        '</div>' +
        '<div class="aviso-card-title">' + esc(a.titulo) + '</div>' +
        '<div class="aviso-card-msg">' + esc(a.mensagem) + '</div>' +
      '</div>';
    }).join('');

    container.innerHTML = html;
  }

  function initFeedCardClicks() {
    var container = document.getElementById('avisos-feed-container');
    if (!container) return;

    container.addEventListener('click', function (e) {
      var card = e.target.closest('.aviso-card[data-aviso-id]');
      if (!card) return;

      var id = card.getAttribute('data-aviso-id');
      var aviso = loadedAvisos.find(function (x) { return String(x.id) === String(id); });
      if (!aviso) return;

      if (typeof window.openEventDetailsModal === 'function') {
        var colorVar = aviso.nivel === 'critico' ? '--cal-aval' : (aviso.nivel === 'atencao' ? '--cal-prazos' : '--cal-ensino');
        window.openEventDetailsModal({
          title: aviso.titulo,
          type: 'Aviso Oficial · ' + aviso.categoria + ' (' + aviso.autor + ')',
          date: aviso.data_inicio,
          desc: aviso.mensagem
        }, true, colorVar);
      }
    });
  }

  function initFilterChips() {
    var chipsContainer = document.getElementById('avisos-filter-chips');
    if (!chipsContainer) return;

    chipsContainer.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-aviso-filter]');
      if (!btn) return;

      currentFilter = btn.getAttribute('data-aviso-filter');
      document.querySelectorAll('#avisos-filter-chips button').forEach(function (x) {
        x.classList.toggle('on', x === btn);
      });
      renderFeed();
    });
  }

  function initFabAvisosButton() {
    var toolsMenu = document.getElementById('tools-menu');
    if (toolsMenu && !document.getElementById('fab-avisos')) {
      var fabAvisos = document.createElement('button');
      fabAvisos.id = 'fab-avisos';
      fabAvisos.title = 'Mural de Avisos';
      fabAvisos.setAttribute('aria-label', 'Mural de Avisos');
      fabAvisos.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>';

      fabAvisos.addEventListener('click', function (e) {
        e.stopPropagation();
        var tools = document.getElementById('tools');
        if (tools) tools.classList.remove('open');

        var btnNavAvisos = document.querySelector('nav button[data-page="avisos"]');
        if (btnNavAvisos) btnNavAvisos.click();
      });

      toolsMenu.insertBefore(fabAvisos, toolsMenu.firstChild);
    }
  }

  async function checkUnreadPopUp() {
    var list = await fetchAvisos();
    if (!list.length) return;

    var lastSeenId = '';
    try {
      lastSeenId = JSON.parse(localStorage.getItem('bp_last_seen_aviso_id')) || '';
    } catch (e) {}

    var latestAviso = list[0];

    if (latestAviso && String(latestAviso.id) !== String(lastSeenId)) {
      if (typeof window.openEventDetailsModal === 'function') {
        var colorVar = latestAviso.nivel === 'critico' ? '--cal-aval' : (latestAviso.nivel === 'atencao' ? '--cal-prazos' : '--cal-ensino');
        window.openEventDetailsModal({
          title: latestAviso.titulo,
          type: 'Aviso Oficial · ' + latestAviso.categoria + ' (' + latestAviso.autor + ')',
          date: latestAviso.data_inicio,
          desc: latestAviso.mensagem
        }, true, colorVar);

        try {
          localStorage.setItem('bp_last_seen_aviso_id', JSON.stringify(latestAviso.id));
        } catch (e) {}
      }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSupabase();
    renderFeed();
    initFilterChips();
    initFeedCardClicks();
    initFabAvisosButton();
    setTimeout(checkUnreadPopUp, 1000);
  });

  return {
    getLoadedAvisos: function() { return loadedAvisos; },
    renderFeed: renderFeed,
    fetchAvisos: fetchAvisos,
    checkUnreadPopUp: checkUnreadPopUp
  };
})();
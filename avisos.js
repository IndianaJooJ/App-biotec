/* ============================================================
   AVISOS.JS — Módulo Exclusivo de Gestão e Mural de Avisos (v35)
   
   ÍNDICE E ESTRUTURA DO ARQUIVO:
   1. BASE DE DADOS DOS AVISOS (YYYY-MM-DD) (Linha 15)
   2. TRATAMENTO INTELIGENTE DE DATAS (Linha 55)
   3. RENDERIZAÇÃO DO FEED COM CLIQUE PARA MODAL (Linha 80)
   4. FILTROS POR PRIORIDADE (Linha 120)
   5. BOTÃO DE AVISOS NO MENU FLUTUANTE / FAB (Linha 140)
   6. POP-UP DE AVISO NÃO LIDO NO ACESSO (Linha 170)
   7. INICIALIZAÇÃO AUTOMÁTICA (Linha 195)
   ============================================================ */

window.BP_AVISOS = (function () {
  "use strict";

  /* ============================================================
     1. BASE DE DADOS MODULAR DOS AVISOS (MODELOS DE EXEMPLO)
     ============================================================ */
  var AVISOS_DB = [
    {
      id: "AVISO-EXEMPLO-01",
      data: "2026-08-10",
      titulo: "[EXEMPLO] Alteração de Sala - Química Teórica",
      categoria: "Demonstração / DEQUI",
      nivel: "critico",
      mensagem: "Este é um aviso de exemplo (nível crítico). Excepcionalmente nesta quinta-feira, a aula de Química Teórica será ministrada no Laboratório 205 do Campus Nova Gameleira (NG)."
    },
    {
      id: "AVISO-EXEMPLO-02",
      data: "2026-08-08",
      titulo: "[EXEMPLO] Prazo Final para Ajuste de Matrícula",
      categoria: "Demonstração / Colegiado",
      nivel: "atencao",
      mensagem: "Este é um aviso de exemplo (nível atenção). Lembrete: o período de solicitação de ajuste e acerto presencial de matrícula encerra-se nesta sexta-feira diretamente pelo SIGAA."
    },
    {
      id: "AVISO-EXEMPLO-03",
      data: "2026-08-05",
      titulo: "[EXEMPLO] Bem-vindos ao Semestre Letivo 2026.2",
      categoria: "Demonstração / Diretoria",
      nivel: "comum",
      mensagem: "Este é um aviso de exemplo (nível comum). Desejamos a todos os estudantes de Biotecnologia um excelente semestre letivo! Acompanhem este mural para novidades do curso."
    }
  ];

  var currentFilter = 'todos';

  /* ============================================================
     2. TRATAMENTO INTELIGENTE DE DATAS
     ============================================================ */
  function esc(s) {
    return ('' + (s == null ? '' : s)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function normalizeISO(dateStr) {
    if (!dateStr) return "2026-08-05";
    if (dateStr.indexOf('/') !== -1) {
      var p = dateStr.split('/');
      return p[2] + '-' + p[1].padStart(2, '0') + '-' + p[0].padStart(2, '0');
    }
    return dateStr;
  }

  function formatDateBR(dateStr) {
    var iso = normalizeISO(dateStr);
    var p = iso.split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }

  /* ============================================================
     3. RENDERIZAÇÃO DO FEED DE AVISOS (COM CLIQUE PARA ABRIR MODAL)
     ============================================================ */
  function renderFeed() {
    var container = document.getElementById('avisos-feed-container');
    if (!container) return;

    var filtered = AVISOS_DB.filter(function (a) {
      if (currentFilter === 'todos') return true;
      return a.nivel === currentFilter;
    });

    if (!filtered.length) {
      container.innerHTML = '<div class="empty">Nenhum aviso encontrado para este filtro de prioridade.</div>';
      return;
    }

    var html = filtered.map(function (a, index) {
      var labelNivel = a.nivel === 'critico' ? 'Crítico' : (a.nivel === 'atencao' ? 'Atenção' : 'Comum');
      var dataExibicao = formatDateBR(a.data);

      return '<div class="aviso-card ' + a.nivel + '" data-aviso-index="' + index + '" style="cursor: pointer;">' +
        '<div class="aviso-card-header">' +
          '<div style="display:flex; align-items:center; gap:10px;">' +
            '<span class="aviso-tag-pill ' + a.nivel + '">' + labelNivel + '</span>' +
            '<span class="aviso-meta-info">' + esc(a.categoria) + '</span>' +
          '</div>' +
          '<span class="aviso-meta-info">' + esc(dataExibicao) + '</span>' +
        '</div>' +
        '<div class="aviso-card-title">' + esc(a.titulo) + '</div>' +
        '<div class="aviso-card-msg">' + esc(a.mensagem) + '</div>' +
      '</div>';
    }).join('');

    container.innerHTML = html;
  }

  /* Listener para clique nos cartões do feed abrindo o modal descritivo */
  function initFeedCardClicks() {
    var container = document.getElementById('avisos-feed-container');
    if (!container) return;

    container.addEventListener('click', function (e) {
      var card = e.target.closest('.aviso-card[data-aviso-index]');
      if (!card) return;

      var idx = parseInt(card.getAttribute('data-aviso-index'), 10);
      var aviso = AVISOS_DB[idx];
      if (!aviso) return;

      if (typeof window.openEventDetailsModal === 'function') {
        var colorVar = aviso.nivel === 'critico' ? '--cal-aval' : (aviso.nivel === 'atencao' ? '--cal-prazos' : '--cal-ensino');
        window.openEventDetailsModal({
          title: aviso.titulo,
          type: 'Aviso Oficial · ' + aviso.categoria,
          date: normalizeISO(aviso.data),
          desc: aviso.mensagem
        }, true, colorVar);
      }
    });
  }

  /* ============================================================
     4. FILTROS DE PRIORIDADE
     ============================================================ */
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

  /* ============================================================
     5. BOTÃO DE AVISOS NO MENU FLUTUANTE (FAB)
     ============================================================ */
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

        // Redireciona o usuário para a página de Avisos de qualquer lugar
        var btnNavAvisos = document.querySelector('nav button[data-page="avisos"]');
        if (btnNavAvisos) {
          btnNavAvisos.click();
        }
      });

      toolsMenu.insertBefore(fabAvisos, toolsMenu.firstChild);
    }
  }

  /* ============================================================
     6. POP-UP DE AVISO NÃO LIDO NO ACESSO
     ============================================================ */
  function checkUnreadPopUp() {
    if (!AVISOS_DB.length) return;

    var lastSeenId = '';
    try {
      lastSeenId = JSON.parse(localStorage.getItem('bp_last_seen_aviso_id')) || '';
    } catch (e) {}

    var latestAviso = AVISOS_DB[0];

    if (latestAviso && latestAviso.id !== lastSeenId) {
      if (typeof window.openEventDetailsModal === 'function') {
        var colorVar = latestAviso.nivel === 'critico' ? '--cal-aval' : (latestAviso.nivel === 'atencao' ? '--cal-prazos' : '--cal-ensino');
        window.openEventDetailsModal({
          title: latestAviso.titulo,
          type: 'Aviso Oficial · ' + latestAviso.categoria,
          date: normalizeISO(latestAviso.data),
          desc: latestAviso.mensagem
        }, true, colorVar);

        try {
          localStorage.setItem('bp_last_seen_aviso_id', JSON.stringify(latestAviso.id));
        } catch (e) {}
      }
    }
  }

  /* ============================================================
     7. INICIALIZAÇÃO AUTOMÁTICA
     ============================================================ */
  document.addEventListener('DOMContentLoaded', function () {
    renderFeed();
    initFilterChips();
    initFeedCardClicks();
    initFabAvisosButton();
    setTimeout(checkUnreadPopUp, 1000);
  });

  return {
    AVISOS_DB: AVISOS_DB,
    renderFeed: renderFeed,
    checkUnreadPopUp: checkUnreadPopUp
  };
})();
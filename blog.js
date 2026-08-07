/* ============================================================
   blog.js — Módulo do Blog do Estudante com Supabase (BioPulse)
   ============================================================ */
window.BP_BLOG = (function () {
  "use strict";

  /* Credenciais Oficiais Supabase */
  var SUPABASE_URL = "https://bhalzllmozefvbytcghh.supabase.co";
  var SUPABASE_KEY = "sb_publishable_NftyZFwgxOi9x4XPxsalaw_uLCBeEeF";

  var supabaseClient = null;
  var currentFilter = 'todos';

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
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
  }

  /* Busca e renderiza os artigos aprovados do banco */
  async function fetchAndRenderPosts() {
    var container = document.getElementById('blog-feed-container');
    if (!container) return;

    if (!supabaseClient) {
      container.innerHTML = '<div class="empty">Inicializando conexão com o banco do Blog...</div>';
      return;
    }

    try {
      var { data: posts, error } = await supabaseClient
        .from('posts')
        .select('*')
        .eq('status', 'aprovado')
        .order('created_at', { ascending: false });

      if (error) throw error;

      var filtered = (posts || []).filter(function (p) {
        if (currentFilter === 'todos') return true;
        return p.categoria === currentFilter;
      });

      if (!filtered.length) {
        container.innerHTML = '<div class="empty">Nenhum artigo publicado nesta categoria ainda. Seja o primeiro a escrever!</div>';
        return;
      }

      var html = filtered.map(function (p) {
        return '<div class="aviso-card comum" style="display:flex; flex-direction:column; justify-content:space-between; height:100%;">' +
          '<div>' +
            '<div class="aviso-card-header" style="margin-bottom:8px;">' +
              '<span class="aviso-tag-pill comum">' + esc(p.categoria) + '</span>' +
              '<span class="aviso-meta-info">' + formatDateBR(p.created_at) + '</span>' +
            '</div>' +
            '<div class="aviso-card-title" style="margin-bottom:8px;">' + esc(p.titulo) + '</div>' +
            '<div class="aviso-card-msg" style="margin-bottom:12px;">' + esc(p.resumo) + '</div>' +
          '</div>' +
          '<div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--line-soft); padding-top:10px; margin-top:12px;">' +
            '<span style="font-size:11.5px; color:var(--ink-soft); font-weight:600;">Por: <b>' + esc(p.autor) + '</b></span>' +
            '<button class="olink" onclick="window.BP_BLOG.openPostModal(' + p.id + ')" style="font-size:11.5px; font-weight:700; color:var(--accent);">Ler artigo →</button>' +
          '</div>' +
        '</div>';
      }).join('');

      container.innerHTML = html;
      window._currentBlogPosts = posts;
    } catch (err) {
      console.error(err);
      container.innerHTML = '<div class="empty">Erro ao carregar artigos do Blog.</div>';
    }
  }

  /* Envio de novo artigo */
  async function submitNewPost(e) {
    e.preventDefault();
    var submitBtn = document.getElementById('btn-submit-blog');
    
    var autor = document.getElementById('blog-input-autor').value.trim();
    var categoria = document.getElementById('blog-input-categoria').value;
    var titulo = document.getElementById('blog-input-titulo').value.trim();
    var resumo = document.getElementById('blog-input-resumo').value.trim();
    var conteudo = document.getElementById('blog-input-conteudo').value.trim();

    if (!autor || !titulo || !resumo || !conteudo) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";
    }

    try {
      var { error } = await supabaseClient
        .from('posts')
        .insert([{
          autor: autor,
          categoria: categoria,
          titulo: titulo,
          resumo: resumo,
          conteudo: conteudo,
          status: 'pendente'
        }]);

      if (error) throw error;

      alert("Artigo enviado com sucesso! Ele passará pela moderação antes de ser publicado no mural.");
      document.getElementById('blog-post-form').reset();
      document.getElementById('blog-form-box').style.display = 'none';
    } catch (err) {
      alert("Erro ao enviar o artigo. Tente novamente.");
      console.error(err);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Enviar para Aprovação";
      }
    }
  }

  /* Abre o modal oficial de leitura do artigo */
  function openPostModal(id) {
    var posts = window._currentBlogPosts || [];
    var post = posts.find(function (p) { return p.id === id; });
    if (!post) return;

    if (typeof window.openEventDetailsModal === 'function') {
      window.openEventDetailsModal({
        title: post.titulo,
        type: 'Blog · ' + post.categoria + ' (Por: ' + post.autor + ')',
        date: formatDateBR(post.created_at),
        desc: post.conteudo
      }, true, '--cal-ensino');
    }
  }

  function initBlogEvents() {
    var btnOpenForm = document.getElementById('btn-open-blog-form');
    var btnCancelForm = document.getElementById('btn-cancel-blog-form');
    var formBox = document.getElementById('blog-form-box');
    var postForm = document.getElementById('blog-post-form');
    var filterChips = document.getElementById('blog-filter-chips');

    if (btnOpenForm && formBox) {
      btnOpenForm.addEventListener('click', function () {
        formBox.style.display = (formBox.style.display === 'none') ? 'block' : 'none';
      });
    }

    if (btnCancelForm && formBox) {
      btnCancelForm.addEventListener('click', function () { formBox.style.display = 'none'; });
    }

    if (postForm) postForm.addEventListener('submit', submitNewPost);

    if (filterChips) {
      filterChips.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-blog-filter]');
        if (!btn) return;
        currentFilter = btn.getAttribute('data-blog-filter');
        document.querySelectorAll('#blog-filter-chips button').forEach(function (x) {
          x.classList.toggle('on', x === btn);
        });
        fetchAndRenderPosts();
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSupabase();
    initBlogEvents();
    fetchAndRenderPosts();
  });

  return {
    fetchAndRenderPosts: fetchAndRenderPosts,
    openPostModal: openPostModal
  };
})();
/* ============================================================
   blog.js — BioBlog CEFET-MG (Modal Exclusivo + Comentários + Suporte a Datas)
   ============================================================ */
window.BP_BLOG = (function () {
  "use strict";

  var SUPABASE_URL = "https://bhalzllmozefvbytcghh.supabase.co";
  var SUPABASE_KEY = "sb_publishable_NftyZFwgxOi9x4XPxsalaw_uLCBeEeF";

  var supabaseClient = null;
  var currentFilter = 'todos';
  var activePostIdForComments = null;

  function initSupabase() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
  }

  function esc(s) {
    return ('' + (s == null ? '' : s)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Formatação confiável de datas sem Invalid Date */
  function formatDateBR(dateStr) {
    if (!dateStr) return '—';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
  }

  /* Busca e exibe os artigos do BioBlog */
  async function fetchAndRenderPosts() {
    var container = document.getElementById('blog-feed-container');
    if (!container) return;

    if (!supabaseClient) {
      container.innerHTML = '<div class="empty">Conectando ao BioBlog CEFET-MG...</div>';
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
        return '<div class="aviso-card comum" onclick="window.BP_BLOG.openPostModal(' + p.id + ')" style="display:flex; flex-direction:column; justify-space-between; height:100%; cursor:pointer;">' +
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
            '<span style="font-size:11.5px; font-weight:700; color:var(--accent);">Ler artigo completo →</span>' +
          '</div>' +
        '</div>';
      }).join('');

      container.innerHTML = html;
      window._currentBlogPosts = posts;
    } catch (err) {
      console.error(err);
      container.innerHTML = '<div class="empty">Erro ao carregar os artigos do BioBlog.</div>';
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

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Publicando..."; }

    try {
      var { error } = await supabaseClient
        .from('posts')
        .insert([{ autor: autor, categoria: categoria, titulo: titulo, resumo: resumo, conteudo: conteudo, status: 'aprovado' }]);

      if (error) throw error;

      alert("Artigo publicado com sucesso no BioBlog CEFET-MG!");
      document.getElementById('blog-post-form').reset();
      document.getElementById('blog-form-box').style.display = 'none';
      fetchAndRenderPosts();
    } catch (err) {
      alert("Erro ao publicar o artigo. O texto pode conter palavras bloqueadas pelas diretrizes.");
      console.error(err);
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Publicar no BioBlog"; }
    }
  }

  /* Modal de Leitura do BioBlog Exclusivo e Maior */
  function openPostModal(id) {
    var posts = window._currentBlogPosts || [];
    var post = posts.find(function (p) { return p.id === id; });
    if (!post) return;

    activePostIdForComments = post.id;

    var overlay = document.getElementById('blog-reader-modal-overlay');
    var titleElem = document.getElementById('blog-modal-title');
    var catElem = document.getElementById('blog-modal-category');
    var authorDateElem = document.getElementById('blog-modal-author-date');
    var contentElem = document.getElementById('blog-modal-content-body');

    if (titleElem) titleElem.textContent = post.titulo;
    if (catElem) catElem.textContent = post.categoria;
    if (authorDateElem) authorDateElem.textContent = 'Por: ' + post.autor + ' · Publicado em ' + formatDateBR(post.created_at);
    if (contentElem) contentElem.innerHTML = esc(post.conteudo).replace(/\n/g, '<br>');

    if (overlay) overlay.style.display = 'flex';
    fetchAndRenderComments(post.id);
  }

  /* Busca e renderiza os comentários do post */
  async function fetchAndRenderComments(postId) {
    var feed = document.getElementById('blog-comments-feed');
    if (!feed) return;

    try {
      var { data: comments, error } = await supabaseClient
        .from('comentarios')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'aprovado')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!comments || !comments.length) {
        feed.innerHTML = '<div style="font-size:12px; color:var(--ink-soft);">Seja o primeiro a comentar neste artigo!</div>';
        return;
      }

      feed.innerHTML = comments.map(function (c) {
        return '<div style="background:var(--bg-soft); padding:10px 12px; border-radius:var(--radius); border:1px solid var(--line-soft); font-size:12.5px;">' +
          '<div style="display:flex; justify-space-between; margin-bottom:4px;">' +
            '<b style="color:var(--ink);">' + esc(c.autor) + '</b>' +
            '<span style="font-size:10.5px; color:var(--ink-soft);">' + formatDateBR(c.created_at) + '</span>' +
          '</div>' +
          '<div style="color:var(--ink-soft); line-height:1.4;">' + esc(c.conteudo) + '</div>' +
        '</div>';
      }).join('');
    } catch (err) {
      console.error(err);
      feed.innerHTML = '<div style="font-size:12px; color:var(--danger);">Erro ao carregar comentários.</div>';
    }
  }

  /* Envio de novo comentário */
  async function submitComment(e) {
    e.preventDefault();
    if (!activePostIdForComments || !supabaseClient) return;

    var autor = document.getElementById('comment-input-autor').value.trim();
    var texto = document.getElementById('comment-input-text').value.trim();

    if (!autor || !texto) return;

    try {
      var { error } = await supabaseClient
        .from('comentarios')
        .insert([{ post_id: activePostIdForComments, autor: autor, conteudo: texto, status: 'aprovado' }]);

      if (error) throw error;

      document.getElementById('comment-input-text').value = '';
      fetchAndRenderComments(activePostIdForComments);
    } catch (err) {
      alert("Erro ao publicar comentário. Evite palavras inadequadas.");
      console.error(err);
    }
  }

  function initEvents() {
    var btnOpenForm = document.getElementById('btn-open-blog-form');
    var btnCancelForm = document.getElementById('btn-cancel-blog-form');
    var formBox = document.getElementById('blog-form-box');
    var postForm = document.getElementById('blog-post-form');
    var filterChips = document.getElementById('blog-filter-chips');
    var blogSubnav = document.getElementById('blog-subnav');
    var readerOverlay = document.getElementById('blog-reader-modal-overlay');
    var readerCloseBtn = document.getElementById('blog-modal-close-btn');
    var commentForm = document.getElementById('blog-comment-form');

    if (btnOpenForm && formBox) {
      btnOpenForm.addEventListener('click', function () {
        formBox.style.display = (formBox.style.display === 'none') ? 'block' : 'none';
      });
    }

    if (btnCancelForm && formBox) {
      btnCancelForm.addEventListener('click', function () { formBox.style.display = 'none'; });
    }

    if (postForm) postForm.addEventListener('submit', submitNewPost);
    if (commentForm) commentForm.addEventListener('submit', submitComment);

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

    /* Sub-abas do BioBlog (Feed / Como Funciona) */
    if (blogSubnav) {
      blogSubnav.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-blog-tab]');
        if (!btn) return;
        var tabKey = btn.getAttribute('data-blog-tab');

        document.querySelectorAll('#blog-subnav button').forEach(function (x) {
          x.classList.toggle('on', x === btn);
        });

        var feedTab = document.getElementById('blog-tab-feed');
        var infoTab = document.getElementById('blog-tab-comofunciona');

        if (feedTab && infoTab) {
          if (tabKey === 'comofunciona') {
            feedTab.style.display = 'none';
            infoTab.style.display = 'block';
          } else {
            infoTab.style.display = 'none';
            feedTab.style.display = 'block';
          }
        }
      });
    }

    if (readerCloseBtn && readerOverlay) {
      readerCloseBtn.addEventListener('click', function () { readerOverlay.style.display = 'none'; });
      readerOverlay.addEventListener('click', function (e) { if (e.target === readerOverlay) readerOverlay.style.display = 'none'; });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSupabase();
    initEvents();
    fetchAndRenderPosts();
  });

  return {
    openPostModal: openPostModal
  };
})();
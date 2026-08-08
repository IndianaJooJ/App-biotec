/* ============================================================
   blog.js — BioBlog CEFET-MG (Modal + Comentários + Likes/Dislikes + Polling 10s)
   ============================================================ */
window.BP_BLOG = (function () {
  "use strict";

  var SUPABASE_URL = "https://bhalzllmozefvbytcghh.supabase.co";
  var SUPABASE_KEY = "sb_publishable_NftyZFwgxOi9x4XPxsalaw_uLCBeEeF";

  var supabaseClient = null;
  var currentFilter = 'todos';
  var activePostIdForComments = null;
  var autoRefreshTimer = null;

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

  async function reagirPost(postId, tipo) {
    if (!supabaseClient) return;

    var storageKey = 'bp_voto_post_' + postId;
    if (localStorage.getItem(storageKey)) {
      alert("Você já reagiu a este artigo!");
      return;
    }

    try {
      var { error } = await supabaseClient.rpc('reacao_post', {
        post_id_param: postId,
        tipo_reacao: tipo
      });

      if (error) throw error;

      localStorage.setItem(storageKey, tipo);
      
      if (typeof window.trackEvent === 'function') {
        window.trackEvent('reagir_post_blog', { post_id: postId, tipo: tipo });
      }

      await fetchAndRenderPosts();
      
      if (activePostIdForComments === postId) {
        updateModalReacoes(postId);
      }
    } catch (err) {
      console.error("Erro ao registrar reação:", err);
    }
  }

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

      window._currentBlogPosts = posts || [];

      var filtered = (posts || []).filter(function (p) {
        if (currentFilter === 'todos') return true;
        return p.categoria === currentFilter;
      });

      if (!filtered.length) {
        container.innerHTML = '<div class="empty">Nenhum artigo publicado nesta categoria ainda. Seja o primeiro a escrever!</div>';
        return;
      }

      var html = filtered.map(function (p) {
        var likesCount = p.likes || 0;
        var dislikesCount = p.dislikes || 0;

        return '<div class="aviso-card comum" style="display:flex; flex-direction:column; justify-space-between; height:100%;">' +
          '<div onclick="window.BP_BLOG.openPostModal(' + p.id + ')" style="cursor:pointer;">' +
            '<div class="aviso-card-header" style="margin-bottom:8px;">' +
              '<span class="aviso-tag-pill comum">' + esc(p.categoria) + '</span>' +
              '<span class="aviso-meta-info">' + formatDateBR(p.created_at) + '</span>' +
            '</div>' +
            '<div class="aviso-card-title" style="margin-bottom:8px;">' + esc(p.titulo) + '</div>' +
            '<div class="aviso-card-msg" style="margin-bottom:12px;">' + esc(p.resumo) + '</div>' +
          '</div>' +
          
          '<div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--line-soft); padding-top:10px; margin-top:12px;">' +
            '<span style="font-size:11.5px; color:var(--ink-soft); font-weight:600;">Por: <b>' + esc(p.autor) + '</b></span>' +
            
            '<div style="display:flex; align-items:center; gap:8px;">' +
              '<button class="blog-react-btn" onclick="window.BP_BLOG.reagirPost(' + p.id + ', \'like\')" title="Curtir artigo">' +
                '👍 <b>' + likesCount + '</b>' +
              '</button>' +
              '<button class="blog-react-btn" onclick="window.BP_BLOG.reagirPost(' + p.id + ', \'dislike\')" title="Não gostei">' +
                '👎 <b>' + dislikesCount + '</b>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('');

      container.innerHTML = html;
    } catch (err) {
      console.error(err);
      container.innerHTML = '<div class="empty">Erro ao carregar os artigos do BioBlog.</div>';
    }
  }

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
        .insert([{ autor: autor, categoria: categoria, titulo: titulo, resumo: resumo, conteudo: conteudo, status: 'aprovado', likes: 0, dislikes: 0 }]);

      if (error) throw error;

      alert("Artigo publicado com sucesso no BioBlog CEFET-MG!");
      document.getElementById('blog-post-form').reset();
      document.getElementById('blog-form-box').style.display = 'none';

      await fetchAndRenderPosts();
    } catch (err) {
      alert("Erro ao publicar o artigo. O texto pode conter palavras bloqueadas pelas diretrizes.");
      console.error(err);
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Publicar no BioBlog"; }
    }
  }

  function updateModalReacoes(postId) {
    var posts = window._currentBlogPosts || [];
    var post = posts.find(function (p) { return p.id === postId; });
    if (!post) return;

    var likesElem = document.getElementById('blog-modal-likes-cnt');
    var dislikesElem = document.getElementById('blog-modal-dislikes-cnt');

    if (likesElem) likesElem.textContent = post.likes || 0;
    if (dislikesElem) dislikesElem.textContent = post.dislikes || 0;
  }

  function openPostModal(id) {
    var posts = window._currentBlogPosts || [];
    var post = posts.find(function (p) { return p.id === id; });
    if (!post) return;

    activePostIdForComments = post.id;

    if (typeof window.trackEvent === 'function') {
      window.trackEvent('ler_artigo_blog', { post_id: id, titulo: post.titulo, categoria: post.categoria });
    }

    var overlay = document.getElementById('blog-reader-modal-overlay');
    var titleElem = document.getElementById('blog-modal-title');
    var catElem = document.getElementById('blog-modal-category');
    var authorDateElem = document.getElementById('blog-modal-author-date');
    var contentElem = document.getElementById('blog-modal-content-body');

    if (titleElem) titleElem.textContent = post.titulo;
    if (catElem) catElem.textContent = post.categoria;
    if (authorDateElem) authorDateElem.textContent = 'Por: ' + post.autor + ' · Publicado em ' + formatDateBR(post.created_at);
    if (contentElem) {
      contentElem.innerHTML = esc(post.conteudo).replace(/\n/g, '<br>') +
        '<div style="margin-top:20px; padding-top:14px; border-top:1px solid var(--line-soft); display:flex; gap:12px; align-items:center;">' +
          '<span style="font-size:12px; font-weight:700; color:var(--ink-soft);">Gostou do artigo?</span>' +
          '<button class="blog-react-btn" onclick="window.BP_BLOG.reagirPost(' + post.id + ', \'like\')">👍 <b id="blog-modal-likes-cnt">' + (post.likes || 0) + '</b></button>' +
          '<button class="blog-react-btn" onclick="window.BP_BLOG.reagirPost(' + post.id + ', \'dislike\')">👎 <b id="blog-modal-dislikes-cnt">' + (post.dislikes || 0) + '</b></button>' +
        '</div>';
    }

    if (overlay) overlay.style.display = 'flex';
    fetchAndRenderComments(post.id);
  }

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
          '<div style="display:flex; justify-content:space-between; margin-bottom:4px;">' +
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
      await fetchAndRenderComments(activePostIdForComments);
    } catch (err) {
      alert("Erro ao publicar comentário. Evite palavras inadequadas.");
      console.error(err);
    }
  }

  function startAutoRefresh() {
    stopAutoRefresh();
    autoRefreshTimer = setInterval(function () {
      var blogPage = document.getElementById('page-blog');
      if (blogPage && blogPage.classList.contains('on')) {
        fetchAndRenderPosts();
        if (activePostIdForComments) {
          fetchAndRenderComments(activePostIdForComments);
        }
      }
    }, 10000);
  }

  function stopAutoRefresh() {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer);
      autoRefreshTimer = null;
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
      readerCloseBtn.addEventListener('click', function () { 
        readerOverlay.style.display = 'none'; 
        activePostIdForComments = null;
      });
      readerOverlay.addEventListener('click', function (e) { 
        if (e.target === readerOverlay) {
          readerOverlay.style.display = 'none'; 
          activePostIdForComments = null;
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSupabase();
    initEvents();
    fetchAndRenderPosts();
    startAutoRefresh();
  });

  return {
    openPostModal: openPostModal,
    fetchAndRenderPosts: fetchAndRenderPosts,
    reagirPost: reagirPost,
    startAutoRefresh: startAutoRefresh,
    stopAutoRefresh: stopAutoRefresh
  };
})();

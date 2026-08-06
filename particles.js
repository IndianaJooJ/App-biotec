/* ============================================================
   particles.js — Motor de partículas + hélice de DNA do BioPulse
   Expõe window.BP_PARTICLES = { init, resizeAll, buildDNA, enabled }
   ------------------------------------------------------------
   >>> COMO DESLIGAR AS PARTÍCULAS (deixar o app mais leve) <<<
   Troque a linha abaixo de:
        var ENABLED = true;
   para:
        var ENABLED = false;
   Isso transforma init/resizeAll/buildDNA em "no-op" (não fazem
   nada). NENHUM outro arquivo precisa ser alterado: o app.js
   continua chamando as funções normalmente, só que elas param
   de rodar. Assim, nenhuma animação consome CPU.

   Observações:
   - Os <canvas class="biosoup"> permanecem no HTML, porém ficam
     inertes e invisíveis (sem desenho). O layout não muda.
   - "ENABLED = false" desliga TUDO (partículas de fundo + a
     hélice de DNA do hero).
   - Se quiser desligar SÓ as partículas de fundo e MANTER a
     hélice do hero, use "ENABLED = false" e, no app.js, mantenha
     a chamada BP_PARTICLES.buildDNA() — porém, por padrão, o
     buildDNA também respeita este interruptor (ver abaixo).
   ============================================================ */
(function () {
  "use strict";

  /* ⇩⇩⇩ INTERRUPTOR MESTRE — true = ligado / false = desligado ⇩⇩⇩ */
  var ENABLED = true;
  /* ⇧⇧⇧ ------------------------------------------------------ ⇧⇧⇧ */

  /* Lista interna de "resizers" — um por canvas inicializado.
     app.js chama BP_PARTICLES.resizeAll() ao trocar de página. */
  var canvasResizers = [];

  /* ---------- MOTOR DE PARTÍCULAS ---------- */
  function initParticles(canvas, opts) {
    if (!ENABLED) return;          /* interruptor: no-op quando desligado */
    if (!canvas) return;
    opts = opts || {};
    var mode = opts.mode || 'soup';
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, parts = [];

    function resize() {
      var r = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = r.width;
      H = canvas.height = Math.max(r.height, canvas.parentElement.offsetHeight);
    }
    function rnd(a, b) { return a + Math.random() * (b - a); }

    var SOUP = ['tardigrade', 'diatom', 'diatomtri', 'paramecium', 'bacterium', 'alga', 'centipede', 'amoeba', 'rotifer', 'volvox', 'euglena', 'spirochete', 'phage', 'cocci', 'stentor', 'bubble', 'bubcluster', 'molecule', 'carbon', 'water', 'dots', 'helix', 'ring', 'membrane', 'specks'];
    var MOL = ['bubble', 'bubcluster', 'molecule', 'carbon', 'water', 'dots', 'helix', 'ring', 'membrane', 'specks', 'spark', 'hexlat', 'spiral', 'diatomtri', 'volvox', 'star'];
    function pick() { var pool = mode === 'soup' ? SOUP : MOL; return pool[Math.floor(Math.random() * pool.length)]; }
    function make() { var div = mode === 'soup' ? 42000 : 50000; var mn = mode === 'soup' ? 16 : 12, mxn = mode === 'soup' ? 42 : 32; var n = Math.max(mn, Math.min(mxn, Math.round(W * H / div))); parts = []; for (var i = 0; i < n; i++) { var t = pick(); parts.push({ t: t, x: rnd(0, W), y: rnd(0, H), s: rnd(.5, 1.35) * (t === 'centipede' ? 1.25 : 1), vx: rnd(-.13, .13), vy: rnd(-.09, .09), rot: rnd(0, 6.28), vr: rnd(-.0035, .0035), ph: rnd(0, 6.28), al: mode === 'soup' ? rnd(.035, .11) : rnd(.10, .20) }); } }

    function dTard(c){ctx.beginPath();ctx.ellipse(0,0,18,9,0,0,6.28);ctx.stroke();for(var i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(i*5,7);ctx.lineTo(i*5+Math.sin(c.ph+i)*2,13);ctx.stroke();}ctx.beginPath();ctx.arc(15,-2,2.2,0,6.28);ctx.stroke();}
    function dDiat(){ctx.beginPath();ctx.ellipse(0,0,8,16,0,0,6.28);ctx.stroke();for(var i=-12;i<=12;i+=4){ctx.beginPath();ctx.moveTo(-6,i);ctx.lineTo(6,i);ctx.stroke();}}
    function dDiatTri(){ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(13,9);ctx.lineTo(-13,9);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(7,5);ctx.lineTo(-7,5);ctx.closePath();ctx.stroke();}
    function dPara(){ctx.beginPath();ctx.ellipse(0,0,16,7,0,0,6.28);ctx.stroke();for(var a=0;a<6.28;a+=.5){var x=Math.cos(a)*16,y=Math.sin(a)*7;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(x*1.18,y*1.18);ctx.stroke();}}
    function dBact(c){ctx.beginPath();ctx.ellipse(0,0,10,4,0,0,6.28);ctx.stroke();ctx.beginPath();ctx.moveTo(10,0);ctx.quadraticCurveTo(18,Math.sin(c.ph)*4,24,0);ctx.stroke();}
    function dAlga(){for(var i=0;i<5;i++){ctx.beginPath();ctx.arc(0,i*7-14,4,0,6.28);ctx.stroke();}}
    function dCent(c){var seg=16,len=8;ctx.beginPath();for(var i=0;i<seg;i++){var x=i*len-seg*len/2,y=Math.sin(c.ph+i*0.5)*4;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();for(var j=0;j<seg;j++){var x2=j*len-seg*len/2,y2=Math.sin(c.ph+j*0.5)*4;ctx.beginPath();ctx.arc(x2,y2,2.3,0,6.28);ctx.stroke();ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2+Math.sin(c.ph+j)*1.5,y2-6);ctx.stroke();ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2+Math.sin(c.ph+j)*1.5,y2+6);ctx.stroke();}var hx=-seg*len/2,hy=Math.sin(c.ph)*4;ctx.beginPath();ctx.arc(hx,hy,3.3,0,6.28);ctx.stroke();ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx-5,hy-3);ctx.moveTo(hx,hy);ctx.lineTo(hx-5,hy+3);ctx.stroke();}
    function dAmoeba(c){ctx.beginPath();for(var a=0;a<=6.29;a+=.4){var r=12+Math.sin(a*3+c.ph)*3.2;var x=Math.cos(a)*r,y=Math.sin(a)*r;if(a===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.stroke();ctx.beginPath();ctx.arc(2,-2,3,0,6.28);ctx.stroke();}
    function dRotifer(c){ctx.beginPath();ctx.moveTo(-7,-12);ctx.quadraticCurveTo(11,-6,8,8);ctx.quadraticCurveTo(2,16,-4,14);ctx.quadraticCurveTo(-11,2,-7,-12);ctx.stroke();ctx.beginPath();ctx.arc(-2,-12,6,Math.PI,0);ctx.stroke();for(var i=-5;i<=5;i+=2){ctx.beginPath();ctx.moveTo(i,-14);ctx.lineTo(i+Math.sin(c.ph+i)*1.5,-19);ctx.stroke();}}
    function dVolvox(){ctx.beginPath();ctx.arc(0,0,15,0,6.28);ctx.stroke();for(var i=0;i<8;i++){var a=i*0.785;ctx.beginPath();ctx.arc(Math.cos(a)*8,Math.sin(a)*8,2,0,6.28);ctx.stroke();}}
    function dEuglena(c){ctx.beginPath();ctx.ellipse(0,2,7,13,0,0,6.28);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-11);ctx.quadraticCurveTo(Math.sin(c.ph)*8,-20,Math.sin(c.ph)*4,-26);ctx.stroke();ctx.beginPath();ctx.arc(0,4,2.5,0,6.28);ctx.stroke();}
    function dSpir(c){ctx.beginPath();for(var i=0;i<=40;i++){var t=i/40,x=t*32-16,y=Math.sin(t*12+c.ph)*5;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}
    function dPhage(){ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(9,-9);ctx.lineTo(9,1);ctx.lineTo(0,6);ctx.lineTo(-9,1);ctx.lineTo(-9,-9);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.moveTo(0,6);ctx.lineTo(0,16);ctx.stroke();for(var i=-1;i<=1;i+=2){ctx.beginPath();ctx.moveTo(0,16);ctx.lineTo(i*7,22);ctx.stroke();}}
    function dCocci(){var pts=[[0,0],[7,2],[3,8],[-5,5],[-6,-3],[2,-6]];pts.forEach(function(p){ctx.beginPath();ctx.arc(p[0],p[1],3.2,0,6.28);ctx.stroke();});}
    function dStentor(c){ctx.beginPath();ctx.moveTo(-10,-12);ctx.lineTo(10,-12);ctx.lineTo(2,16);ctx.lineTo(-2,16);ctx.closePath();ctx.stroke();for(var i=-9;i<=9;i+=3){ctx.beginPath();ctx.moveTo(i,-12);ctx.lineTo(i+Math.sin(c.ph+i)*1.5,-17);ctx.stroke();}}
    function dBub(){ctx.beginPath();ctx.arc(0,0,11,0,6.28);ctx.stroke();ctx.beginPath();ctx.arc(-4,-4,2.6,0,6.28);ctx.stroke();}
    function dBubCluster(){[[0,0,8],[10,4,5],[-7,6,4],[5,-8,3]].forEach(function(b){ctx.beginPath();ctx.arc(b[0],b[1],b[2],0,6.28);ctx.stroke();});}
    function dMol(){ctx.beginPath();ctx.arc(0,0,5,0,6.28);ctx.stroke();var arms=[[16,0],[-12,10],[-10,-12]];arms.forEach(function(a){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(a[0],a[1]);ctx.stroke();ctx.beginPath();ctx.arc(a[0],a[1],3.2,0,6.28);ctx.stroke();});}
    function dCarb(){ctx.beginPath();for(var i=0;i<6;i++){var a=Math.PI/3*i,x=Math.cos(a)*13,y=Math.sin(a)*13;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.stroke();ctx.beginPath();ctx.arc(0,0,6,0,6.28);ctx.stroke();}
    function dMolWater(){ctx.beginPath();ctx.arc(0,0,6,0,6.28);ctx.stroke();[[12,-9],[12,9]].forEach(function(h){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(h[0],h[1]);ctx.stroke();ctx.beginPath();ctx.arc(h[0],h[1],3.4,0,6.28);ctx.stroke();});}
    function dDots(){for(var i=0;i<7;i++){var a=i*0.9,r=4+i*1.4;ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,1.3,0,6.28);ctx.fill();}}
    function dHelix(c){for(var i=0;i<10;i++){var y=i*4-18;var x=Math.sin(i*0.6+c.ph)*7;var x2=Math.sin(i*0.6+c.ph+Math.PI)*7;ctx.beginPath();ctx.arc(x,y,1.6,0,6.28);ctx.stroke();ctx.beginPath();ctx.arc(x2,y,1.6,0,6.28);ctx.stroke();if(i%2===0){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y);ctx.stroke();}}}
    function dRing(){ctx.beginPath();ctx.arc(0,0,12,0,6.28);ctx.stroke();ctx.beginPath();ctx.arc(0,0,7,0,6.28);ctx.stroke();}
    function dMembrane(){ctx.beginPath();ctx.arc(0,0,14,0,6.28);ctx.stroke();for(var a=0;a<6.28;a+=0.52){ctx.beginPath();ctx.arc(Math.cos(a)*14,Math.sin(a)*14,1.6,0,6.28);ctx.stroke();}}
    function dSpecks(){var pts=[[0,0],[6,3],[-5,4],[3,-6],[-6,-3]];pts.forEach(function(p){ctx.beginPath();ctx.arc(p[0],p[1],1.2,0,6.28);ctx.fill();});}
    function dSpark(){ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(0,9);ctx.moveTo(-9,0);ctx.lineTo(9,0);ctx.moveTo(-5,-5);ctx.lineTo(5,5);ctx.moveTo(-5,5);ctx.lineTo(5,-5);ctx.stroke();}
    function dHexLat(){[[0,0],[18,0],[9,15]].forEach(function(o){ctx.beginPath();for(var i=0;i<6;i++){var a=Math.PI/3*i,x=o[0]-9+Math.cos(a)*8,y=o[1]-7+Math.sin(a)*8;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.stroke();});}
    function dStar(){ctx.beginPath();ctx.arc(0,0,1.8,0,6.28);ctx.fill();}

    function draw(c){switch(c.t){case 'tardigrade':return dTard(c);case 'diatom':return dDiat();case 'diatomtri':return dDiatTri();case 'paramecium':return dPara();case 'bacterium':return dBact(c);case 'alga':return dAlga();case 'centipede':return dCent(c);case 'amoeba':return dAmoeba(c);case 'rotifer':return dRotifer(c);case 'volvox':return dVolvox();case 'euglena':return dEuglena(c);case 'spirochete':return dSpir(c);case 'phage':return dPhage();case 'cocci':return dCocci();case 'stentor':return dStentor(c);case 'bubble':return dBub();case 'bubcluster':return dBubCluster();case 'molecule':return dMol();case 'carbon':return dCarb();case 'water':return dMolWater();case 'dots':return dDots();case 'helix':return dRing();case 'ring':return dRing();case 'membrane':return dMembrane();case 'specks':return dSpecks();case 'spark':return dSpark();case 'hexlat':return dHexLat();case 'spiral':return dSpir(c);case 'star':return dStar();}}

    function frame(){requestAnimationFrame(frame);if(!W||!H||canvas.offsetParent===null)return;ctx.clearRect(0,0,W,H);var dark=document.body.classList.contains('theme-dark');var col=(mode==='soup')?'#9FF0D4':(dark?'#7FE0BC':'#6E8A80');ctx.lineWidth=mode==='soup'?1:1.1;parts.forEach(function(c){c.x+=c.vx;c.y+=c.vy;c.rot+=c.vr;c.ph+=.03;if(c.x<-50)c.x=W+50;if(c.x>W+50)c.x=-50;if(c.y<-50)c.y=H+50;if(c.y>H+50)c.y=-50;ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.rot);ctx.scale(c.s,c.s);ctx.globalAlpha=c.al;ctx.strokeStyle=col;ctx.fillStyle=col;draw(c);ctx.restore();});}

    function full() { resize(); make(); }
    full(); frame(); canvasResizers.push(full);
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(full, 250); });
  }

  /* ---------- HÉLICE DE DNA 3D (herói) ---------- */
  function buildDNA() {
    if (!ENABLED) return;          /* interruptor: no-op quando desligado */
    var helix = document.getElementById('helix'); if (!helix) return;
    var rungs = 26, spacing = 15, radius = 80, turn = 34, totalH = rungs * spacing;
    var palette = [['s1', 's2', 'at'], ['s2', 's1', 'gc']];
    for (var i = 0; i < rungs; i++) {
      var y = i * spacing - totalH / 2, ang = i * turn, rung = document.createElement('div');
      rung.className = 'rung';
      rung.style.transform = 'translateY(' + y + 'px) rotateY(' + ang + 'deg)';
      var pal = palette[i % 2];
      var bar = document.createElement('div'); bar.className = 'bar ' + pal[2];
      bar.style.width = (radius * 2) + 'px'; bar.style.transform = 'translateX(-' + radius + 'px)'; bar.style.opacity = '0.85';
      var b1 = document.createElement('div'); b1.className = 'bead ' + pal[0]; b1.style.transform = 'translateX(-' + radius + 'px)';
      var b2 = document.createElement('div'); b2.className = 'bead ' + pal[1]; b2.style.transform = 'translateX(' + radius + 'px)';
      rung.appendChild(bar); rung.appendChild(b1); rung.appendChild(b2); helix.appendChild(rung);
    }
    var wrap = document.getElementById('dna3d'), stage = document.getElementById('dna-stage');
    if (wrap && stage) {
      wrap.addEventListener('mousemove', function (e) { var r = wrap.getBoundingClientRect(); var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5; stage.style.transform = 'rotateX(' + (8 - py * 16) + 'deg) rotateZ(' + (px * 8) + 'deg)'; });
      wrap.addEventListener('mouseleave', function () { stage.style.transform = 'rotateX(8deg)'; });
    }
  }

  /* ---------- Exposição global ---------- */
  window.BP_PARTICLES = {
    enabled: ENABLED,             /* leitura do estado atual (informativo) */
    init: initParticles,
    resizeAll: function () { if (!ENABLED) return; canvasResizers.forEach(function (f) { f(); }); },
    buildDNA: buildDNA
  };
})();
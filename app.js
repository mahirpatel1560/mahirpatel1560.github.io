/* MAHIR PATEL — cobalt monolith + living chapters */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* helper: DPR-fit a canvas to its parent, return ctx + size */
  function fitCanvas(cv) {
    var p = cv.parentElement, r = p.getBoundingClientRect();
    var d = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.max(2, r.width * d); cv.height = Math.max(2, r.height * d);
    var x = cv.getContext('2d'); x.setTransform(d, 0, 0, d, 0, 0);
    return { x: x, w: r.width, h: r.height };
  }
  /* helper: run an rAF loop only while el is on screen */
  function whenVisible(el, start, stop) {
    var on = false;
    new IntersectionObserver(function (en) {
      var v = en[0].isIntersecting;
      if (v && !on) { on = true; start(); }
      else if (!v && on) { on = false; stop && stop(); }
    }, { threshold: 0.08 }).observe(el);
  }

  /* ================= MONOLITH ================= */
  var FACES = [
    { idx: '01 / LIVE PRODUCT', title: 'RINGLATCH', sub: 'AI phone receptionist for local businesses — built solo, in production, answering real calls.', meta: '2026 —\nCO-FOUNDER' },
    { idx: '02 / RESEARCH — URSA', title: 'MAGNET', sub: 'Serving multi-agent LLM workflows as dataflow — just-in-time prefill, traces, a scheduling simulator.', meta: 'AUG 2025 – JAN 2026\nLLM SERVING' },
    { idx: '03 / 100+ USERS', title: 'NOVA', sub: 'A multi-agent study companion with memory, planning, and tools — live at novabrain.dev.', meta: '2026 —\nFOUNDER' },
    { idx: '04 / HARDWARE', title: 'COPPER', sub: 'Custom PCB through 3 revisions, a verified 32-bit ALU, and the Iron Man helmet’s JARVIS brain.', meta: '2025 – 2026\nKICAD · RTL' }
  ];
  var fIdx = document.getElementById('fIdx'), fTitle = document.getElementById('fTitle'),
      fSub = document.getElementById('fSub'), fMeta = document.getElementById('fMeta'),
      progEl = document.getElementById('prog'), heroOpen = document.getElementById('heroOpen'),
      heroHint = document.getElementById('heroHint');
  var stage = document.getElementById('stage');
  var htxts = [fIdx, fTitle, fSub, fMeta];
  var curFace = -1, titleTimer = null;

  function setFace(i) {
    if (i === curFace) return;
    curFace = i;
    if (i < 0) { htxts.forEach(function (el) { el && el.classList.remove('on'); }); if (progEl) [].forEach.call(progEl.children, function (d) { d.classList.remove('on'); }); return; }
    if (progEl) [].forEach.call(progEl.children, function (d, k) { d.classList.toggle('on', k === i); });
    clearTimeout(titleTimer);
    htxts.forEach(function (el) { el && el.classList.remove('on'); });
    titleTimer = setTimeout(function () {
      var f = FACES[i]; if (!f) return;
      fIdx.textContent = f.idx; fTitle.textContent = f.title; fSub.textContent = f.sub;
      fMeta.innerHTML = f.meta.replace(/\n/g, '<br>');
      htxts.forEach(function (el) { el && el.classList.add('on'); });
    }, reduced ? 0 : 180);
  }

  var three = (function () {
    var cv = document.getElementById('gl');
    if (!cv || typeof THREE === 'undefined' || !window.WebGLRenderingContext) return null;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); }
    catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(34, 2, 0.1, 60);
    cam.position.set(0, 0.4, 9.2);
    scene.add(new THREE.AmbientLight(0x9aa0ff, 0.55));
    var key = new THREE.DirectionalLight(0xffffff, 1.35); key.position.set(5, 7, 6); scene.add(key);
    var rim = new THREE.DirectionalLight(0x4d55ff, 0.9); rim.position.set(-6, -3, -4); scene.add(rim);

    function faceTexture(f) {
      var c = document.createElement('canvas'); c.width = 640; c.height = 640;
      var x = c.getContext('2d');
      x.fillStyle = '#0B0B10'; x.fillRect(0, 0, 640, 640);
      x.strokeStyle = 'rgba(255,255,255,0.10)'; x.lineWidth = 2; x.strokeRect(14, 14, 612, 612);
      x.strokeStyle = 'rgba(255,255,255,0.045)'; x.lineWidth = 1;
      for (var g = 80; g < 640; g += 80) { x.beginPath(); x.moveTo(g, 14); x.lineTo(g, 626); x.stroke(); x.beginPath(); x.moveTo(14, g); x.lineTo(626, g); x.stroke(); }
      x.fillStyle = 'rgba(255,255,255,0.55)'; x.font = '500 24px "Geist Mono", monospace';
      x.fillText(f.idx, 44, 84);
      x.fillStyle = '#FFFFFF'; x.font = '400 118px "Anton", Impact, sans-serif';
      f.title.split(' ').forEach(function (wd, i2) { x.fillText(wd, 40, 250 + i2 * 118); });
      x.fillStyle = 'rgba(255,255,255,0.5)'; x.font = '500 20px "Geist Mono", monospace';
      x.fillText(f.meta.split('\n')[0], 44, 580);
      var t = new THREE.CanvasTexture(c);
      t.anisotropy = 4; t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    var slab, world = new THREE.Group(); scene.add(world);
    function buildSlab() {
      if (slab) return;
      var side = new THREE.MeshStandardMaterial({ color: 0x0B0B10, roughness: 0.42, metalness: 0.35 });
      var mats = [
        new THREE.MeshStandardMaterial({ map: faceTexture(FACES[3]), roughness: 0.5, metalness: 0.2 }),
        new THREE.MeshStandardMaterial({ map: faceTexture(FACES[1]), roughness: 0.5, metalness: 0.2 }),
        side, side,
        new THREE.MeshStandardMaterial({ map: faceTexture(FACES[0]), roughness: 0.5, metalness: 0.2 }),
        new THREE.MeshStandardMaterial({ map: faceTexture(FACES[2]), roughness: 0.5, metalness: 0.2 })
      ];
      slab = new THREE.Mesh(new THREE.BoxGeometry(4.6, 4.6, 4.6), mats);
      world.add(slab);
      slab.add(new THREE.LineSegments(new THREE.EdgesGeometry(slab.geometry),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 })));
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(buildSlab);
      setTimeout(buildSlab, 1800);
    } else buildSlab();

    var mx = 0, my = 0;
    window.addEventListener('mousemove', function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    function size() {
      var w = cv.clientWidth || window.innerWidth, h = cv.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
    }
    size(); window.addEventListener('resize', size);
    return { renderer: renderer, scene: scene, cam: cam, get slab() { return slab; }, mouse: function () { return [mx, my]; } };
  })();

  var vhh = window.innerHeight, stageTop = 0, stageH = 1;
  function measure() {
    vhh = window.innerHeight;
    if (!stage) return;
    var r = stage.getBoundingClientRect();
    stageTop = r.top + window.scrollY;
    stageH = stage.offsetHeight - vhh;
  }
  measure(); window.addEventListener('resize', measure);

  var targRotY = 0, curRotY = 0, targRotX = 0, curRotX = 0, scl = 1, targScl = 1;
  function onScroll() {
    if (!stage) return;
    var p = (window.scrollY - stageTop) / Math.max(1, stageH);
    p = Math.max(0, Math.min(1, p));
    var open = p < 0.10;
    if (heroOpen) { heroOpen.style.opacity = open ? 1 : 0; heroOpen.style.transition = 'opacity .4s'; }
    if (heroHint) heroHint.style.opacity = p > 0.9 ? 0 : 1;
    var fp = Math.max(0, Math.min(0.9999, (p - 0.10) / 0.90));
    var face = Math.floor(fp * 4);
    setFace(open ? -1 : face);
    var seg = fp * 4 - face;
    var eased = seg < 0.5 ? 2 * seg * seg : 1 - Math.pow(-2 * seg + 2, 2) / 2;
    targRotY = -(face + eased) * (Math.PI / 2);
    targRotX = 0.12 + Math.sin(fp * Math.PI) * 0.05;
    targScl = open ? 0.66 : 1;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (three) {
    var t0 = 0, heroVis = true;
    new IntersectionObserver(function (en) { heroVis = en[0].isIntersecting; }, { threshold: 0 }).observe(document.getElementById('gl'));
    three.renderer.setAnimationLoop(function () {
      if (!heroVis) return;
      t0 += 0.016;
      var s = three.slab;
      if (!s) { three.renderer.render(three.scene, three.cam); return; }
      curRotY += (targRotY - curRotY) * (reduced ? 1 : 0.085);
      curRotX += (targRotX - curRotX) * (reduced ? 1 : 0.085);
      scl += (targScl - scl) * (reduced ? 1 : 0.09);
      var m = three.mouse();
      s.rotation.y = curRotY + (reduced ? 0 : m[0] * 0.06);
      s.rotation.x = curRotX + (reduced ? 0 : m[1] * 0.05 + Math.sin(t0 * 0.7) * 0.012);
      s.position.y = reduced ? 0 : Math.sin(t0 * 0.9) * 0.08;
      s.scale.setScalar(scl);
      three.renderer.render(three.scene, three.cam);
    });
  } else {
    if (stage) stage.style.height = '100vh';
    setFace(0);
  }

  /* ================= CH 01 — CALL WAVEFORM ================= */
  (function () {
    var cv = document.getElementById('vizWave'); if (!cv) return;
    var s = fitCanvas(cv), raf = null, t = 0;
    window.addEventListener('resize', function () { s = fitCanvas(cv); });
    var N = 46;
    function draw() {
      t += 0.016;
      var x = s.x, w = s.w, h = s.h;
      x.clearRect(0, 0, w, h);
      var turn = Math.floor(t / 2.2) % 2;           /* 0 agent, 1 caller */
      var tt = (t % 2.2) / 2.2;
      var lanes = [
        { y: h * 0.32, col: '#FFFFFF', label: 1, active: turn === 0 },
        { y: h * 0.68, col: '#6F79FF', label: 1, active: turn === 1 }
      ];
      var bw = (w - 80) / N;
      lanes.forEach(function (L, li) {
        for (var i = 0; i < N; i++) {
          var ph = t * (L.active ? 9 : 2.4) + i * 0.55 + li * 7;
          var env = L.active ? (0.35 + 0.65 * Math.abs(Math.sin(ph * 0.31)) * Math.abs(Math.sin(ph * 0.13 + 1))) : 0.10;
          var amp = (h * 0.135) * env * (0.55 + 0.45 * Math.sin(ph));
          x.fillStyle = L.active ? L.col : 'rgba(255,255,255,0.16)';
          var bx = 40 + i * bw;
          x.fillRect(bx, L.y - Math.abs(amp), Math.max(1.6, bw * 0.42), Math.abs(amp) * 2 + 1.4);
        }
        x.font = '500 10px "Geist Mono", monospace';
        x.fillStyle = L.active ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)';
        x.fillText(li === 0 ? 'AGENT — RILEY' : 'CALLER', 40, L.y - h * 0.16);
        if (L.active) { x.fillStyle = '#4EF0B0'; x.beginPath(); x.arc(30, L.y, 3, 0, 7); x.fill(); }
      });
      /* playhead */
      x.fillStyle = 'rgba(255,255,255,0.25)';
      x.fillRect(40, h - 26, w - 80, 1);
      x.fillStyle = '#4EF0B0';
      x.fillRect(40 + (w - 80) * tt, h - 30, 2, 9);
      raf = requestAnimationFrame(draw);
    }
    if (reduced) { t = 1.2; draw(); cancelAnimationFrame(raf); return; }
    draw(); cancelAnimationFrame(raf); /* paint one frame immediately so the panel is never blank */
    whenVisible(cv, function () { raf = requestAnimationFrame(draw); }, function () { cancelAnimationFrame(raf); });
  })();

  /* ================= CH 02 — DATAFLOW DAG ================= */
  (function () {
    var cv = document.getElementById('vizDag'); if (!cv) return;
    var s = fitCanvas(cv), raf = null, t = 0;
    window.addEventListener('resize', function () { s = fitCanvas(cv); });
    function P(fx, fy) { return { x: s.w * fx, y: s.h * fy }; }
    function draw() {
      t += 0.016;
      var x = s.x, w = s.w, h = s.h;
      x.clearRect(0, 0, w, h);
      var A = P(0.16, 0.30), B = P(0.16, 0.72), V = P(0.52, 0.51), C = P(0.86, 0.51);
      var T = t % 8;                                   /* 8s loop */
      var genA = Math.min(1, T / 4.4);                 /* A generates 0–4.4s */
      var genB = Math.min(1, Math.max(0, (T - 0.6) / 4.4) );
      var pre = Math.min(1, Math.max(0, (T - 1.6) / 3.4));   /* V prefill starts at 1.6s — BEFORE A finishes */
      var out = Math.min(1, Math.max(0, (T - 5.4) / 2.2));   /* V→C */
      function edge(a, b, act) {
        x.strokeStyle = act ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.14)';
        x.lineWidth = 1.2;
        x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke();
      }
      function tokens(a, b, prog, n, col) {
        for (var i = 0; i < n; i++) {
          var k = (prog * 1.15 + i * 0.13) % 1;
          if (k > prog + 0.02) continue;
          x.fillStyle = col;
          x.beginPath(); x.arc(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k, 2.3, 0, 7); x.fill();
        }
      }
      function node(p, name, prog, col, sub) {
        var W = Math.min(120, w * 0.22), H = 46;
        x.fillStyle = '#101018'; x.strokeStyle = 'rgba(255,255,255,0.28)'; x.lineWidth = 1;
        x.fillRect(p.x - W / 2, p.y - H / 2, W, H); x.strokeRect(p.x - W / 2, p.y - H / 2, W, H);
        if (prog > 0) { x.fillStyle = col; x.globalAlpha = 0.28; x.fillRect(p.x - W / 2, p.y - H / 2, W * prog, H); x.globalAlpha = 1; }
        x.fillStyle = 'rgba(255,255,255,0.9)'; x.font = '500 10.5px "Geist Mono", monospace'; x.textAlign = 'center';
        x.fillText(name, p.x, p.y - 3);
        x.fillStyle = 'rgba(255,255,255,0.4)'; x.font = '500 9px "Geist Mono", monospace';
        x.fillText(sub, p.x, p.y + 12);
        x.textAlign = 'left';
      }
      edge(A, V, genA > 0.1 && genA < 1.05); edge(B, V, genB > 0.1); edge(V, C, out > 0);
      tokens(A, V, genA, 7, '#FFFFFF'); tokens(B, V, genB, 7, '#FFFFFF'); tokens(V, C, out, 7, '#4EF0B0');
      node(A, 'AGENT A', genA, '#6F79FF', genA < 1 ? 'GENERATING' : 'DONE');
      node(B, 'AGENT B', genB, '#6F79FF', genB < 1 ? 'GENERATING' : 'DONE');
      node(V, 'VERIFIER', pre, '#4EF0B0', pre < 1 ? 'JIT PREFILL' : 'READY');
      node(C, 'COMBINER', out, '#FFFFFF', out > 0 ? 'DECODING' : 'WAITING');
      /* the point, printed */
      if (pre > 0 && genA < 1) { x.fillStyle = '#4EF0B0'; x.font = '500 10px "Geist Mono", monospace'; x.fillText('▸ OVERLAP', w - 84, 24); }
      raf = requestAnimationFrame(draw);
    }
    if (reduced) { t = 3.0; draw(); cancelAnimationFrame(raf); return; }
    t = 2.2; draw(); cancelAnimationFrame(raf); t = 0; /* first frame mid-overlap so the panel reads instantly */
    whenVisible(cv, function () { raf = requestAnimationFrame(draw); }, function () { cancelAnimationFrame(raf); });
  })();

  /* ================= CH 03 — NOVA CONSTELLATION ================= */
  (function () {
    var cv = document.getElementById('vizNova'); if (!cv) return;
    var s = fitCanvas(cv), raf = null, t = 0;
    window.addEventListener('resize', function () { s = fitCanvas(cv); });
    var SAT = ['MEMORY', 'PLANNER', 'RETRIEVAL', 'COURSES', 'TOOLS', 'USER'];
    function draw() {
      t += 0.016;
      var x = s.x, w = s.w, h = s.h, cx = w / 2, cy = h / 2;
      x.clearRect(0, 0, w, h);
      var R = Math.min(w, h) * 0.34;
      var fireIdx = Math.floor(t / 1.6) % SAT.length;
      var ft = (t % 1.6) / 1.6;
      var pts = SAT.map(function (nm, i) {
        var a = t * 0.12 + (i / SAT.length) * Math.PI * 2;
        return { x: cx + Math.cos(a) * R * (i % 2 ? 1 : 0.82), y: cy + Math.sin(a) * R * 0.72, nm: nm };
      });
      pts.forEach(function (p, i) {
        var fire = i === fireIdx;
        x.strokeStyle = fire ? 'rgba(78,240,176,0.7)' : 'rgba(255,255,255,0.16)';
        x.lineWidth = fire ? 1.4 : 1;
        x.beginPath(); x.moveTo(cx, cy); x.lineTo(p.x, p.y); x.stroke();
        if (fire) {
          var k = ft < 0.5 ? ft * 2 : (1 - ft) * 2;
          x.fillStyle = '#4EF0B0';
          x.beginPath(); x.arc(cx + (p.x - cx) * k, cy + (p.y - cy) * k, 2.6, 0, 7); x.fill();
        }
        x.fillStyle = fire ? '#4EF0B0' : 'rgba(255,255,255,0.75)';
        x.beginPath(); x.arc(p.x, p.y, fire ? 4.5 : 3.2, 0, 7); x.fill();
        x.fillStyle = fire ? 'rgba(78,240,176,0.9)' : 'rgba(255,255,255,0.4)';
        x.font = '500 9.5px "Geist Mono", monospace'; x.textAlign = 'center';
        x.fillText(p.nm, p.x, p.y + 16); x.textAlign = 'left';
      });
      /* core */
      var pulse = 1 + Math.sin(t * 2.4) * 0.08;
      x.fillStyle = '#FFFFFF';
      x.beginPath(); x.arc(cx, cy, 7 * pulse, 0, 7); x.fill();
      x.strokeStyle = 'rgba(255,255,255,0.35)';
      x.beginPath(); x.arc(cx, cy, 14 * pulse, 0, 7); x.stroke();
      x.fillStyle = 'rgba(255,255,255,0.85)'; x.font = '500 11px "Geist Mono", monospace'; x.textAlign = 'center';
      x.fillText('NOVA', cx, cy - 20 * pulse - 4); x.textAlign = 'left';
      raf = requestAnimationFrame(draw);
    }
    if (reduced) { t = 0.8; draw(); cancelAnimationFrame(raf); return; }
    t = 0.8; draw(); cancelAnimationFrame(raf); t = 0; /* first frame immediately */
    whenVisible(cv, function () { raf = requestAnimationFrame(draw); }, function () { cancelAnimationFrame(raf); });
  })();

  /* ================= CH 04 — 3D BOARD ================= */
  (function () {
    var cv = document.getElementById('vizBoard'); if (!cv) return;
    if (typeof THREE === 'undefined' || !window.WebGLRenderingContext) return;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); }
    catch (e) { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    var scene = new THREE.Scene();
    var cam = new THREE.PerspectiveCamera(38, 2, 0.1, 100);
    cam.position.set(0, 5.4, 9.4); cam.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(0x9aa0ff, 0.7));
    var key = new THREE.DirectionalLight(0xffffff, 1.15); key.position.set(4, 8, 5); scene.add(key);
    var cool = new THREE.PointLight(0x4d55ff, 1.1, 26); cool.position.set(-5, 5, -2); scene.add(cool);
    var world = new THREE.Group(); scene.add(world);
    world.add(new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.28, 5.6),
      new THREE.MeshStandardMaterial({ color: 0x0E0E16, roughness: 0.5, metalness: 0.3 })));
    var grid = new THREE.GridHelper(8, 16, 0x2a2a55, 0x1e1e40);
    grid.position.y = 0.145; grid.scale.z = 0.7; world.add(grid);
    var chipMat = new THREE.MeshStandardMaterial({ color: 0x05050A, roughness: 0.4, metalness: 0.55 });
    function chip(w2, h2, d2, x2, z2) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(w2, h2, d2), chipMat);
      m.position.set(x2, 0.14 + h2 / 2, z2); world.add(m);
    }
    chip(1.7, 0.22, 1.7, -1.6, -0.4); chip(1.0, 0.18, 0.8, 1.9, -1.4);
    chip(0.8, 0.18, 0.8, 1.2, 1.5); chip(0.5, 0.3, 1.2, 3.3, 0.2);
    for (var i = 0; i < 7; i++) chip(0.28, 0.12, 0.16, -3.2 + i * 0.5, 2.1);
    var traceMat = new THREE.LineBasicMaterial({ color: 0x8a93ff, transparent: true, opacity: 0.9 });
    function trace(points) {
      var pts = points.map(function (p) { return new THREE.Vector3(p[0], 0.152, p[1]); });
      world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), traceMat));
    }
    trace([[-1.6, -0.4], [-1.6, -2.2], [1.9, -2.2], [1.9, -1.4]]);
    trace([[-1.6, -0.4], [0.2, -0.4], [0.2, 1.5], [1.2, 1.5]]);
    trace([[-1.6, -0.4], [-3.4, -0.4], [-3.4, 2.1]]);
    trace([[1.9, -1.4], [3.3, -1.4], [3.3, 0.2]]);
    trace([[1.2, 1.5], [1.2, 2.3], [-1.0, 2.3], [-1.0, 2.1]]);
    var leds = [];
    [[-3.7, -2.3, 0x4EF0B0], [3.7, 2.4, 0xFFFFFF], [3.7, -2.3, 0x8a93ff]].forEach(function (c) {
      var led = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), new THREE.MeshBasicMaterial({ color: c[2] }));
      led.position.set(c[0], 0.2, c[1]); world.add(led); leds.push(led);
    });
    var pulse = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    world.add(pulse);
    var path = [new THREE.Vector3(-1.6, 0.2, -0.4), new THREE.Vector3(-1.6, 0.2, -2.2), new THREE.Vector3(1.9, 0.2, -2.2), new THREE.Vector3(1.9, 0.2, -1.4)];
    world.rotation.x = 0.02;
    var targY = 0.5, targX = 0.0, dragging = false, lx = 0, ly = 0;
    cv.addEventListener('pointerdown', function (e) { dragging = true; lx = e.clientX; ly = e.clientY; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      targY += (e.clientX - lx) * 0.006; targX += (e.clientY - ly) * 0.004;
      targX = Math.max(-0.15, Math.min(0.9, targX));
      lx = e.clientX; ly = e.clientY;
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { cv.addEventListener(ev, function () { dragging = false; }); });
    var visible = false, t = 0;
    function size() {
      var w = cv.parentElement.clientWidth, h = cv.parentElement.clientHeight || 360;
      renderer.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
    }
    size(); window.addEventListener('resize', size);
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.05 }).observe(cv);
    renderer.setAnimationLoop(function () {
      if (!visible) return;
      t += 0.016;
      if (!dragging && !reduced) targY += 0.0022;
      world.rotation.y += (targY - world.rotation.y) * 0.08;
      world.rotation.x += (targX + 0.02 - world.rotation.x) * 0.08;
      leds.forEach(function (l, i) { l.visible = Math.sin(t * (1.3 + i * 0.6) + i) > -0.6; });
      var k = (t * 0.3) % 1, seg = Math.min(2, Math.floor(k * 3)), f = k * 3 - seg;
      pulse.position.lerpVectors(path[seg], path[seg + 1], f);
      renderer.render(scene, cam);
    });
  })();

  /* ================= reveals + counters ================= */
  var io = new IntersectionObserver(function (ents) {
    ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  setTimeout(function () {
    document.querySelectorAll('.rv:not(.in)').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in');
    });
  }, 1500);

  var cio = new IntersectionObserver(function (ents) {
    ents.forEach(function (e) {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      e.target.querySelectorAll('[data-count]').forEach(function (el) {
        var target = +el.getAttribute('data-count'), t1 = null;
        if (reduced) { el.textContent = target; return; }
        el.textContent = '0';
        function step(ts) {
          if (!t1) t1 = ts;
          var k = Math.min((ts - t1) / 1000, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    });
  }, { threshold: 0.4 });
  var cEl = document.getElementById('counters'); if (cEl) cio.observe(cEl);

  /* ================= terminal ================= */
  var term = document.getElementById('term'), tout = document.getElementById('tout'), tin = document.getElementById('tin');
  if (!term) return;
  var history = [], hIdx = -1;
  function tprint(html) { tout.innerHTML += html + '\n'; tout.scrollTop = tout.scrollHeight; }
  function openTerm() {
    term.classList.add('open');
    if (!tout.innerHTML) {
      tprint('<span class="c-b">mahir.patel</span> — you found the terminal.');
      tprint('type <span class="c-g">help</span> to see commands.\n');
    }
    tin.focus();
  }
  function closeTerm() { term.classList.remove('open'); }
  document.getElementById('termBtn').addEventListener('click', openTerm);
  document.getElementById('termX').addEventListener('click', closeTerm);
  window.addEventListener('keydown', function (e) {
    if (e.key === '`' && !e.target.closest('input,textarea')) { e.preventDefault(); term.classList.contains('open') ? closeTerm() : openTerm(); }
    if (e.key === 'Escape' && term.classList.contains('open')) closeTerm();
  });
  var CMDS = {
    help: function () {
      tprint('<span class="c-d">commands:</span>');
      tprint('  <span class="c-g">whoami</span>      who is this guy');
      tprint('  <span class="c-g">projects</span>    the work');
      tprint('  <span class="c-g">research</span>    URSA / Magnet');
      tprint('  <span class="c-g">ringlatch</span>   call my product');
      tprint('  <span class="c-g">nova</span>        the study companion');
      tprint('  <span class="c-g">skills</span>      the toolbox');
      tprint('  <span class="c-g">resume</span>      open the PDF');
      tprint('  <span class="c-g">contact</span>     reach me');
      tprint('  <span class="c-g">sudo hire-me</span>');
      tprint('  <span class="c-g">clear</span> · <span class="c-g">exit</span>');
    },
    whoami: function () {
      tprint('Mahir Patel — ECE @ Illinois \'29, CS + Math minors, GPA 3.70.');
      tprint('Co-founder @ <span class="c-b">Ringlatch</span>. Builder of NOVA (100+ users).');
      tprint('LLM-serving researcher. FCC-licensed. Ships weekly.');
    },
    projects: function () {
      tprint('<span class="c-b">ringlatch</span>   live AI phone receptionist — whole stack, solo');
      tprint('<span class="c-b">nova</span>        study companion, 100+ users — novabrain.dev');
      tprint('<span class="c-b">magnet</span>      LLM-serving research (URSA)');
      tprint('<span class="c-b">copper</span>      PCB ×3 revs · 32-bit ALU · JARVIS helmet');
      tprint('<span class="c-b">qwen3-vl</span>    fine-tuned driving grader @ 24-60 fps');
      tprint('<span class="c-b">gesturelab</span>  10-sensor desk assistant, built in 24h');
    },
    research: function () {
      tprint('<span class="c-b">Magnet</span> (URSA, Aug 2025 – Jan 2026): serving multi-agent LLM');
      tprint('workflows as dataflow — just-in-time + parallel prefill.');
      tprint('My part: workload instrumentation, execution traces, and a');
      tprint('trace-driven simulator for JIT prefill scheduling.');
    },
    ringlatch: function () {
      tprint('dial <span class="c-b">(708) 719-6505</span> — my AI answers. seriously, call it.');
      tprint('site: <a href="https://www.ringlatch.workers.dev" target="_blank" rel="noopener">www.ringlatch.workers.dev</a>');
    },
    nova: function () {
      tprint('NOVA — the AI study companion that knows you.');
      tprint('live at <a href="https://novabrain.dev" target="_blank" rel="noopener">novabrain.dev</a> · 100+ students');
    },
    skills: function () {
      tprint('python · c/c++ · systemverilog · js · pytorch · kicad · vivado');
      tprint('cloudflare workers · supabase · stm32 · scope + logic analyzer');
    },
    resume: function () { tprint('opening resume.pdf …'); window.open('Mahir_Patel_Resume.pdf', '_blank'); },
    contact: function () {
      tprint('email    <a href="mailto:mpate452@illinois.edu">mpate452@illinois.edu</a>');
      tprint('github   <a href="https://github.com/mahirpatel1560" target="_blank" rel="noopener">mahirpatel1560</a>');
      tprint('linkedin <a href="https://linkedin.com/in/mahirpatel1" target="_blank" rel="noopener">mahirpatel1</a>');
    },
    ls: function () { tprint('ringlatch/  magnet/  nova/  copper/  archive/'); },
    clear: function () { tout.innerHTML = ''; },
    exit: closeTerm
  };
  function run(raw) {
    var cmd = raw.trim().toLowerCase();
    tprint('<span class="c-b">mahir@site:~$</span> ' + raw.replace(/</g, '&lt;'));
    if (!cmd) return;
    history.push(raw); hIdx = history.length;
    if (cmd === 'sudo hire-me' || cmd === 'sudo hire me' || cmd === 'hire-me' || cmd === 'hire me') {
      tprint('<span class="c-g">[sudo] permission granted.</span>');
      tprint('summer 2027: software · ML · embedded · silicon.');
      tprint('email me: <a href="mailto:mpate452@illinois.edu?subject=Summer%202027">mpate452@illinois.edu</a>');
      return;
    }
    if (CMDS[cmd]) CMDS[cmd]();
    else tprint('<span class="c-d">command not found: ' + cmd.replace(/</g, '&lt;') + ' — try</span> <span class="c-g">help</span>');
  }
  tin.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { run(tin.value); tin.value = ''; }
    else if (e.key === 'ArrowUp') { if (hIdx > 0) { hIdx--; tin.value = history[hIdx] || ''; e.preventDefault(); } }
    else if (e.key === 'ArrowDown') { if (hIdx < history.length) { hIdx++; tin.value = history[hIdx] || ''; e.preventDefault(); } }
  });
  term.addEventListener('click', function (e) { if (e.target === tout || e.target === term) tin.focus(); });
})();

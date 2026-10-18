// Scope trace in the hero: decoration only, labelled as an illustration. Still frame when motion is reduced.
(() => {
  const c = document.getElementById('scope');
  if (!c) return;
  const g = c.getContext('2d');
  const W = c.width, H = c.height;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const draw = (t) => {
    g.fillStyle = '#0a100d'; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(207,224,214,.12)'; g.lineWidth = 1;
    for (let i = 1; i < 10; i++) { g.beginPath(); g.moveTo(i * W / 10, 0); g.lineTo(i * W / 10, H); g.stroke(); }
    for (let j = 1; j < 8; j++) { g.beginPath(); g.moveTo(0, j * H / 8); g.lineTo(W, j * H / 8); g.stroke(); }
    // CH1 (yellow): square wave with a gentle ring on each edge. CH2 (cyan): sine, phase locked.
    const trace = (color, y0, fn) => {
      g.strokeStyle = color; g.lineWidth = 2.5; g.shadowColor = color; g.shadowBlur = 8; g.beginPath();
      for (let x = 0; x <= W; x += 2) { const y = y0 + fn(x / W * 4 * Math.PI * 2 + t); x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke(); g.shadowBlur = 0;
    };
    trace('#ffd21f', H * 0.3, (p) => { const s = Math.sin(p) >= 0 ? -1 : 1; const edge = Math.exp(-((p % Math.PI) * 5)); return s * H * 0.1 * (1 + 0.25 * edge * Math.sin(p * 14)); });
    trace('#3fe3f2', H * 0.72, (p) => -Math.sin(p) * H * 0.12);
  };
  draw(0);
  const run = document.getElementById('run');
  if (reduce) { if (run) run.hidden = true; return; }
  let t = 0, last = 0, running = true, raf = 0;
  const loop = (now) => {
    raf = 0;
    if (!running || document.hidden) return;
    if (now - last > 33) { t += 0.05; last = now; draw(t); }
    raf = requestAnimationFrame(loop);
  };
  const start = () => { if (!raf) raf = requestAnimationFrame(loop); };
  document.addEventListener('visibilitychange', start);
  start();
  // Run/Stop key: stops the trace (WCAG 2.2.2).
  run.addEventListener('click', () => {
    running = !running;
    run.setAttribute('aria-pressed', String(!running));
    run.textContent = running ? 'Stop' : 'Run';
    if (running) start();
  });
})();

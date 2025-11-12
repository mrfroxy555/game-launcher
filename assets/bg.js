// Animated particle background
(() => {
  const c = document.getElementById('bg');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w = 0, h = 0, dpr = Math.max(1, window.devicePixelRatio || 1);

  function resize() {
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    c.style.width = w + 'px';
    c.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const mouse = { x: 0, y: 0, active: false };
  window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
  window.addEventListener('pointerleave', () => { mouse.active = false; });

  let particles = [];
  function resetParticles() {
    const target = Math.min(140, Math.floor((w * h) / 18000));
    particles = Array.from({ length: target }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1.6 + Math.random() * 0.9,
    }));
  }

  function step() {
    // background gradient
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#0b0f16');
    g.addColorStop(1, '#0a0e14');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // subtle vignette
    const rad = ctx.createRadialGradient(w * 0.8, h * 0.2, 0, w * 0.8, h * 0.2, Math.max(w, h));
    rad.addColorStop(0, 'rgba(46,211,183,0.06)');
    rad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, w, h);

    // physics
    for (const p of particles) {
      // simple drift
      p.x += p.vx; p.y += p.vy;
      // mouse repulsion/attraction
      if (mouse.active) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y; const d2 = dx*dx + dy*dy; const d = Math.sqrt(d2) || 1;
        if (d < 140) { const f = (140 - d) / 140 * 0.06; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
      }
      // bounds wrap
      if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
    }

    // connections
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y; const dist2 = dx*dx + dy*dy;
        if (dist2 < 140*140) {
          const alpha = 0.22 * (1 - Math.sqrt(dist2) / 140);
          ctx.strokeStyle = `rgba(46,211,183,${alpha.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }

    // dots
    for (const p of particles) {
      ctx.fillStyle = 'rgba(46,211,183,0.8)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }

    requestAnimationFrame(step);
  }

  window.addEventListener('resize', () => { resize(); resetParticles(); });
  resize(); resetParticles(); requestAnimationFrame(step);
})();

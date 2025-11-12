// Simple Platform Jumper
document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const heightElement = document.getElementById('height');
  
  let player = { x: 240, y: 500, w: 20, h: 20, vx: 0, vy: 0 };
  let platforms = [];
  let score = 0;
  let running = true;
  let keys = {};
  let cameraY = 0;
  
  document.getElementById('new').onclick = reset;
  
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
  });
  
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });
  
  function reset() {
    platforms = [];
    score = 0;
    running = true;
    cameraY = 0;
    
    // Create simple platforms - first one fixed at bottom center
    platforms.push({
      x: canvas.width / 2 - 60,
      y: canvas.height - 100,
      w: 120,
      h: 10
    });
    
    // Add more platforms above - varied sizes and distances
    for (let i = 1; i < 20; i++) {
      const width = 60 + Math.random() * 80; // 60-140px
      const distance = 60 + Math.random() * 40; // 60-100px
      const prevY = i === 1 ? canvas.height - 100 : platforms[i-1].y;
      platforms.push({
        x: Math.random() * (canvas.width - width),
        y: prevY - distance,
        w: width,
        h: 10
      });
    }
    
    // Place player on the first (bottom) platform
    const startPlatform = platforms[0];
    player = { 
      x: startPlatform.x + startPlatform.w / 2 - 10, 
      y: startPlatform.y - 20, 
      w: 20, 
      h: 20, 
      vx: 0, 
      vy: 0 
    };
    
    heightElement.textContent = '0';
    loop();
  }
  
  function loop() {
    if (!running) return;
    
    // Movement
    player.vx = 0;
    if (keys['ArrowLeft'] || keys['KeyA']) player.vx = -3;
    if (keys['ArrowRight'] || keys['KeyD']) player.vx = 3;
    
    // Jump
    let onPlatform = false;
    for (const p of platforms) {
      if (player.x < p.x + p.w && player.x + player.w > p.x &&
          player.y + player.h >= p.y && player.y + player.h < p.y + 15 &&
          player.vy >= 0) {
        onPlatform = true;
        player.y = p.y - player.h;
        player.vy = 0;
        if (keys['Space'] || keys['ArrowUp'] || keys['KeyW']) {
          player.vy = -14;
        }
        break;
      }
    }
    
    // Gravity
    if (!onPlatform) {
      player.vy += 0.35;
    }
    
    // Update position
    player.x += player.vx;
    player.y += player.vy;
    
    // Keep player on screen
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
    
    // Scroll camera up
    if (player.y < canvas.height / 2) {
      const diff = canvas.height / 2 - player.y;
      player.y = canvas.height / 2;
      cameraY -= diff;
      for (const p of platforms) {
        p.y += diff;
      }
      score += Math.floor(diff / 10);
      heightElement.textContent = score;
    }
    
    // Generate new platforms continuously above
    if (platforms.length > 0) {
      const screenTop = player.y - canvas.height / 2;
      
      // Keep generating platforms above (at least 300px above screen top)
      let highest = Math.min(...platforms.map(p => p.y));
      while (highest > screenTop - 300) {
        const width = 60 + Math.random() * 80; // 60-140px
        const distance = 60 + Math.random() * 40; // 60-100px
        const newY = highest - distance;
        platforms.push({
          x: Math.random() * (canvas.width - width),
          y: newY,
          w: width,
          h: 10
        });
        highest = newY; // Update highest for next iteration
      }
    }
    
    // Remove old platforms below screen
    platforms = platforms.filter(p => p.y < canvas.height + 100);
    
    // Game over
    if (player.y > canvas.height) {
      running = false;
      setTimeout(() => alert('Vége! Pont: ' + score), 100);
      return;
    }
    
    // Draw
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Platforms
    ctx.fillStyle = '#4a5568';
    for (const p of platforms) {
      ctx.fillRect(p.x, p.y, p.w, p.h);
    }
    
    // Player
    ctx.fillStyle = '#2ed3b7';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    
    requestAnimationFrame(loop);
  }
  
  reset();
});

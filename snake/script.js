const canvas=document.getElementById('c');
const ctx=canvas.getContext('2d');
const S=20, N=canvas.width/S; // 21x21 if 420px
let snake, dir, apple, running=true, speed=120, last=0;

document.getElementById('new').onclick=start;

function start(){
  snake=[{x:10,y:10}]; dir={x:1,y:0};
  apple=spawnApple(); running=true; speed=120; last=0; window.requestAnimationFrame(loop);
}

function spawnApple(){
  let a; do{ a={x:Math.floor(Math.random()*N), y:Math.floor(Math.random()*N)}; }
  while(snake.some(s=>s.x===a.x&&s.y===a.y)); return a;
}

function step(){
  const head={x:snake[0].x+dir.x, y:snake[0].y+dir.y};
  if(head.x<0||head.y<0||head.x>=N||head.y>=N||snake.some(s=>s.x===head.x&&s.y===head.y)){ running=false; setTimeout(()=>alert('Vége!'),10); return; }
  snake.unshift(head);
  if(head.x===apple.x&&head.y===apple.y){ apple=spawnApple(); speed=Math.max(60,speed-2); }
  else snake.pop();
}

function draw(){
  ctx.fillStyle='#0c1221'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#2ed3b7'; snake.forEach(p=>ctx.fillRect(p.x*S+1,p.y*S+1,S-2,S-2));
  ctx.fillStyle='#ff6b6b'; ctx.fillRect(apple.x*S+2,apple.y*S+2,S-4,S-4);
}

function loop(ts){ if(!running) return; if(ts-last>speed){ step(); last=ts; } draw(); requestAnimationFrame(loop); }

window.addEventListener('keydown',e=>{
  const k=e.key; const d={x:dir.x,y:dir.y};
  if(k==='ArrowUp'&&d.y!==1) dir={x:0,y:-1};
  if(k==='ArrowDown'&&d.y!==-1) dir={x:0,y:1};
  if(k==='ArrowLeft'&&d.x!==1) dir={x:-1,y:0};
  if(k==='ArrowRight'&&d.x!==-1) dir={x:1,y:0};
});

start();

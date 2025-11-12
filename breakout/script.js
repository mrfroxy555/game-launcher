const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
let ball, paddle, bricks, running=true;
const ROWS=6, COLS=8, BW=50, BH=18, GAP=6, TOP=60;

function reset(){
  ball={x:W/2,y:H-80, vx:3, vy:-4, r:8};
  paddle={x:W/2-50,y:H-40,w:100,h:12,s:7};
  bricks=[];
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      bricks.push({x: 40+c*(BW+GAP), y: TOP+r*(BH+GAP), w:BW, h:BH, alive:true, hue: 170 + r*18});
    }
  }
  running=true;
}

document.getElementById('new').onclick=reset;
window.addEventListener('keydown',e=>{ if(e.key==='ArrowLeft') paddle.x-=paddle.s*2; if(e.key==='ArrowRight') paddle.x+=paddle.s*2;});
canvas.addEventListener('mousemove',e=>{ const rect=canvas.getBoundingClientRect(); const x=(e.clientX-rect.left)/rect.width*W; paddle.x=x-paddle.w/2;});

function draw(){
  ctx.clearRect(0,0,W,H);
  // paddle
  ctx.fillStyle='#2ed3b7'; ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
  // ball
  ctx.beginPath(); ctx.fillStyle='#e7e9ed'; ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill();
  // bricks
  for(const b of bricks){ if(!b.alive) continue; ctx.fillStyle=`hsl(${b.hue} 55% 45% / 1)`; ctx.fillRect(b.x,b.y,b.w,b.h); }
}

function step(){
  if(!running) return;
  ball.x+=ball.vx; ball.y+=ball.vy;
  if(ball.x<ball.r||ball.x>W-ball.r) ball.vx*=-1;
  if(ball.y<ball.r) ball.vy*=-1;
  if(ball.y>H+20){ running=false; setTimeout(()=>alert('Vége!'),10); }
  // paddle collision
  if(ball.y+ball.r>paddle.y && ball.x>paddle.x && ball.x<paddle.x+paddle.w && ball.vy>0){
    ball.vy*=-1; const hit=(ball.x-(paddle.x+paddle.w/2))/(paddle.w/2); ball.vx=hit*5;
  }
  // brick collisions
  for(const b of bricks){ if(!b.alive) continue; if(ball.x>b.x && ball.x<b.x+b.w && ball.y-ball.r<b.y+b.h && ball.y+ball.r>b.y){ b.alive=false; ball.vy*=-1; }
  }
  draw();
  requestAnimationFrame(step);
}

reset();
step();

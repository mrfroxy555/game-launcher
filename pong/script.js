const canvas=document.getElementById('c');
const ctx=canvas.getContext('2d');
let ball, left, right, score=[0,0], running=true;
let countdown=0, countdownActive=false;

function reset(){
  // Reset paddles
  left={x:20,y:canvas.height/2-35,w:10,h:70,vy:3};
  right={x:canvas.width-30,y:canvas.height/2-35,w:10,h:70,vy:5};
  
  // Random ball position and direction
  const randomX = canvas.width/2 + (Math.random()-0.5)*100;
  const randomY = canvas.height/2 + (Math.random()-0.5)*100;
  const randomVX = (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 2); // 3-5 speed, random direction
  const randomVY = (Math.random()-0.5) * 4; // -2 to 2
  
  ball={x:randomX,y:randomY,vx:randomVX,vy:randomVY,r:7};
  
  // Start countdown
  countdown=3;
  countdownActive=true;
  running=true;
}

document.getElementById('new').onclick=reset;
canvas.addEventListener('mousemove',e=>{ const r=canvas.getBoundingClientRect(); right.y=(e.clientY-r.top)/r.height*canvas.height-right.h/2;});
window.addEventListener('keydown',e=>{ if(e.key==='ArrowUp') right.y-=14; if(e.key==='ArrowDown') right.y+=14;});

function step(){
  // Countdown
  if(countdownActive){
    // Draw everything
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#2ed3b7'; ctx.fillRect(left.x,left.y,left.w,left.h); ctx.fillRect(right.x,right.y,right.w,right.h);
    ctx.beginPath(); ctx.fillStyle='#e7e9ed'; ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#aab3c5'; ctx.font='bold 24px Segoe UI'; ctx.fillText(score[0]+" - "+score[1], canvas.width/2-30, 30);
    
    // Draw countdown
    ctx.fillStyle='#2ed3b7';
    ctx.font='bold 72px Segoe UI';
    ctx.textAlign='center';
    ctx.fillText(countdown, canvas.width/2, canvas.height/2);
    ctx.textAlign='left';
    
    // Update countdown
    const now=Date.now();
    if(!step.lastCountdownTime) step.lastCountdownTime=now;
    if(now-step.lastCountdownTime>=1000){
      countdown--;
      step.lastCountdownTime=now;
      if(countdown<=0){
        countdownActive=false;
        step.lastCountdownTime=0;
      }
    }
    
    if(running) requestAnimationFrame(step);
    return;
  }
  
  // AI for left paddle
  if(ball.y < left.y+left.h/2) left.y-=left.vy; else left.y+=left.vy;
  left.y=Math.max(0,Math.min(canvas.height-left.h,left.y));

  // move ball
  ball.x+=ball.vx; ball.y+=ball.vy;
  if(ball.y<ball.r||ball.y>canvas.height-ball.r) ball.vy*=-1;

  // paddles collision
  function collide(p){ return ball.x-ball.r<p.x+p.w && ball.x+ball.r>p.x && ball.y+ball.r>p.y && ball.y-ball.r<p.y+p.h; }
  if(collide(left) && ball.vx<0){ ball.vx*=-1; ball.vy += (ball.y-(left.y+left.h/2))/12; }
  if(collide(right) && ball.vx>0){ ball.vx*=-1; ball.vy += (ball.y-(right.y+right.h/2))/12; }

  // scoring
  if(ball.x<-20){ score[1]++; reset(); }
  if(ball.x>canvas.width+20){ score[0]++; reset(); }

  // draw
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#2ed3b7'; ctx.fillRect(left.x,left.y,left.w,left.h); ctx.fillRect(right.x,right.y,right.w,right.h);
  ctx.beginPath(); ctx.fillStyle='#e7e9ed'; ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#aab3c5'; ctx.font='bold 24px Segoe UI'; ctx.fillText(score[0]+" - "+score[1], canvas.width/2-30, 30);

  if(running) requestAnimationFrame(step);
}
reset();
requestAnimationFrame(step);

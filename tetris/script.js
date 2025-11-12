const canvas=document.getElementById('c');
const ctx=canvas.getContext('2d');
const COLS=10, ROWS=20, S=32; // 320x640
const colors=['#000','#2ed3b7','#7aa2ff','#f78c6c','#c3e88d','#ff5370','#82aaff','#f2cd5d'];
let grid, piece, dropCounter=0, dropInterval=700, last=0, running=true, score=0;

const SHAPES={
  I:[[1,1,1,1]],
  O:[[2,2],[2,2]],
  T:[[0,3,0],[3,3,3]],
  S:[[0,4,4],[4,4,0]],
  Z:[[5,5,0],[0,5,5]],
  J:[[6,0,0],[6,6,6]],
  L:[[0,0,7],[7,7,7]],
};

function reset(){
  grid=Array.from({length:ROWS},()=>Array(COLS).fill(0));
  newPiece(); running=true; score=0; dropInterval=700;
}

document.getElementById('new').onclick=reset;

function newPiece(){
  const keys=Object.keys(SHAPES); const k=keys[Math.floor(Math.random()*keys.length)];
  piece={m:SHAPES[k].map(r=>r.slice()), x:3, y:0};
  if(collide(piece,grid)) { running=false; setTimeout(()=>alert('Vége!'),10); }
}

function rotate(m){
  const N=m.length, M=m[0].length; const r=Array.from({length:M},()=>Array(N).fill(0));
  for(let y=0;y<N;y++) for(let x=0;x<M;x++) r[x][N-1-y]=m[y][x];
  return r;
}

function collide(p,g){
  for(let y=0;y<p.m.length;y++) for(let x=0;x<p.m[0].length;x++){
    const v=p.m[y][x]; if(!v) continue; const gx=p.x+x, gy=p.y+y;
    if(gy<0||gx<0||gx>=COLS||gy>=ROWS||g[gy][gx]) return true;
  }
  return false;
}

function merge(p,g){
  for(let y=0;y<p.m.length;y++) for(let x=0;x<p.m[0].length;x++){
    const v=p.m[y][x]; if(v) g[p.y+y][p.x+x]=v;
  }
}

function clearLines(){
  let lines=0;
  for(let y=ROWS-1;y>=0;y--){
    if(grid[y].every(v=>v)) { grid.splice(y,1); grid.unshift(Array(COLS).fill(0)); lines++; y++; }
  }
  if(lines){ score += [0,40,100,300,1200][lines]; dropInterval=Math.max(120, dropInterval-20*lines); }
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // grid
  for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
    const v=grid[y][x]; if(v){ ctx.fillStyle=colors[v]; ctx.fillRect(x*S,y*S,S-1,S-1);} else { ctx.fillStyle='rgba(255,255,255,.03)'; ctx.fillRect(x*S,y*S,S-1,S-1); }
  }
  // piece
  for(let y=0;y<piece.m.length;y++) for(let x=0;x<piece.m[0].length;x++){
    const v=piece.m[y][x]; if(v){ ctx.fillStyle=colors[v]; ctx.fillRect((piece.x+x)*S,(piece.y+y)*S,S-1,S-1); }
  }
}

function drop(){ piece.y++; if(collide(piece,grid)){ piece.y--; merge(piece,grid); clearLines(); newPiece(); }
}

function update(t){
  if(!running) return;
  const dt=t-last; last=t; dropCounter+=dt; if(dropCounter>dropInterval){ drop(); dropCounter=0; }
  draw(); requestAnimationFrame(update);
}

window.addEventListener('keydown',e=>{
  if(!running) return;
  if(e.key==='ArrowLeft'){ piece.x--; if(collide(piece,grid)) piece.x++; }
  if(e.key==='ArrowRight'){ piece.x++; if(collide(piece,grid)) piece.x--; }
  if(e.key==='ArrowDown'){ drop(); }
  if(e.key==='ArrowUp'){ const m=rotate(piece.m); const old=piece.m; piece.m=m; if(collide(piece,grid)) piece.m=old; }
  if(e.key===' '){ while(!collide(piece,grid)){ piece.y++; } piece.y--; merge(piece,grid); clearLines(); newPiece(); }
});

reset();
requestAnimationFrame(update);

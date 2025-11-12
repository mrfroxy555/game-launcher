const pads=[...document.querySelectorAll('.pad')];
const lvl=document.getElementById('lvl');
let seq=[], step=0, playing=false, alive=true;

document.getElementById('new').onclick=start;

pads.forEach(p=>{
  p.addEventListener('click',()=>{
    if(!alive||playing) return;
    const id=Number(p.dataset.id);
    flash(id);
    if(id===seq[step]){ step++; if(step===seq.length){ next(); } }
    else { alive=false; setTimeout(()=>alert('Vége! Szint: '+(seq.length-1)),10); }
  });
});

function start(){ seq=[]; alive=true; next(); }

function next(){ step=0; seq.push(Math.floor(Math.random()*4)); lvl.textContent=seq.length; playSeq(); }

function flash(id){ const el=pads[id]; el.classList.add('glow'); setTimeout(()=>el.classList.remove('glow'),220); }

function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }

async function playSeq(){ playing=true; await wait(300); for(const id of seq){ flash(id); await wait(Math.max(180, 600 - seq.length*30)); } playing=false; }

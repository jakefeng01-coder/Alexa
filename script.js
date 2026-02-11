// ---------- Cute "No" button that runs away ----------
const noBtn = document.getElementById("no");
const yesBtn = document.getElementById("yes");
const result = document.getElementById("result");

let noMoves = 0;

function moveNoButton() {
  const pad = 18;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const rect = noBtn.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  const x = Math.random() * (vw - w - pad * 2) + pad;
  const y = Math.random() * (vh - h - pad * 2) + pad;

  noBtn.style.position = "fixed";
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;

  noMoves++;
  // after a few moves, make it smaller to be extra funny
  const scale = Math.max(0.78, 1 - noMoves * 0.05);
  noBtn.style.transform = `scale(${scale})`;
}

noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveNoButton();
}, { passive: false });

// ---------- YES: show result + confetti hearts ----------
yesBtn.addEventListener("click", () => {
  result.classList.remove("hidden");
  burstHearts(42);
});

// ---------- Background floating hearts + sparkles ----------
const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");

function resize() {
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

function rand(a,b){ return Math.random()*(b-a)+a; }

const hearts = Array.from({length: 26}, () => ({
  x: rand(0, window.innerWidth),
  y: rand(0, window.innerHeight),
  s: rand(10, 26),
  vy: rand(0.25, 0.9),
  vx: rand(-0.15, 0.15),
  rot: rand(0, Math.PI*2),
  vr: rand(-0.01, 0.01),
  a: rand(0.25, 0.55)
}));

const sparkles = Array.from({length: 70}, () => ({
  x: rand(0, window.innerWidth),
  y: rand(0, window.innerHeight),
  r: rand(0.7, 1.6),
  a: rand(0.08, 0.22),
  t: rand(0, 1000)
}));

function drawHeart(x, y, size, rot, alpha){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;

  ctx.beginPath();
  const s = size;
  ctx.moveTo(0, s*0.3);
  ctx.bezierCurveTo(s*0.8, -s*0.4, s*1.2, s*0.6, 0, s*1.1);
  ctx.bezierCurveTo(-s*1.2, s*0.6, -s*0.8, -s*0.4, 0, s*0.3);
  ctx.closePath();

  const grad = ctx.createLinearGradient(-s, -s, s, s);
  grad.addColorStop(0, "rgba(255,79,216,0.9)");
  grad.addColorStop(0.5, "rgba(255,61,106,0.9)");
  grad.addColorStop(1, "rgba(155,92,255,0.9)");
  ctx.fillStyle = grad;
  ctx.shadowColor = "rgba(255,79,216,0.25)";
  ctx.shadowBlur = 18;
  ctx.fill();

  ctx.restore();
}

function tick(t){
  ctx.clearRect(0,0,window.innerWidth,window.innerHeight);

  // sparkles
  for (const sp of sparkles){
    sp.t += 0.015;
    const tw = (Math.sin(sp.t) + 1) / 2; // 0..1
    ctx.globalAlpha = sp.a + tw*0.18;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, sp.r + tw*1.1, 0, Math.PI*2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();
  }

  // floating hearts
  for (const h of hearts){
    h.x += h.vx;
    h.y -= h.vy;
    h.rot += h.vr;

    if (h.y < -60) { h.y = window.innerHeight + rand(10, 120); h.x = rand(0, window.innerWidth); }
    if (h.x < -60) h.x = window.innerWidth + 60;
    if (h.x > window.innerWidth + 60) h.x = -60;

    drawHeart(h.x, h.y, h.s, h.rot, h.a);
  }

  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ---------- Heart confetti burst ----------
const bursts = [];

function burstHearts(n){
  const cx = window.innerWidth/2;
  const cy = window.innerHeight/2;

  for(let i=0;i<n;i++){
    bursts.push({
      x: cx + rand(-10,10),
      y: cy + rand(-10,10),
      vx: rand(-6,6),
      vy: rand(-11,-4),
      g: rand(0.18, 0.35),
      s: rand(7, 14),
      rot: rand(0, Math.PI*2),
      vr: rand(-0.25, 0.25),
      life: rand(55, 95)
    });
  }
}

function drawBursts(){
  for(let i=bursts.length-1;i>=0;i--){
    const p = bursts[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.g;
    p.rot += p.vr;
    p.life -= 1;

    drawHeart(p.x, p.y, p.s, p.rot, Math.max(0, p.life/95));

    if(p.life <= 0) bursts.splice(i,1);
  }
  requestAnimationFrame(drawBursts);
}
drawBursts();

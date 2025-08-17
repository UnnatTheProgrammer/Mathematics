// GSAP setup
if (window.gsap) {
  gsap.registerPlugin(ScrollTrigger);
}

// Mobile menu
const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');
if (hamburger && menu) {
  hamburger.addEventListener('click', () => {
    const show = !menu.classList.contains('show');
    menu.classList.toggle('show', show);
    hamburger.setAttribute('aria-expanded', String(show));
  });
  document.querySelectorAll('.menu a').forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('show'));
  });
}

// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Scroll progress
const scrollProgress = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  scrollProgress.value = Math.round((scrollTop / height) * 100);
});

// Mouse-reactive buttons glow
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  });
});

// Magnetic buttons
document.querySelectorAll('.magnetic').forEach(el => {
  const strength = 20;
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width/2);
    const y = e.clientY - (r.top + r.height/2);
    el.style.transform = `translate(${x/strength}px, ${y/strength}px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});

// Tilt effect
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const ry = ((x / r.width) - 0.5) * 8;
    const rx = -((y / r.height) - 0.5) * 8;
    card.style.setProperty('--rx', `${rx}deg`);
    card.style.setProperty('--ry', `${ry}deg`);
  });
  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--rx','0deg');
    card.style.setProperty('--ry','0deg');
  });
});

// Intersection reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('show');
  });
}, {threshold: 0.12});

document.querySelectorAll('section').forEach(s => {
  s.classList.add('section-reveal');
  observer.observe(s);
});

// Hero parallax and counters
if (window.gsap) {
  gsap.to('.hero-visual img', {
    yPercent: 8,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', scrub: true }
  });
}

document.querySelectorAll('.metric .metric-value').forEach(el => {
  const target = Number(el.dataset.count || '0');
  const duration = 1000;
  let start = null;
  const step = (t) => {
    if (!start) start = t;
    const p = Math.min((t - start) / duration, 1);
    el.textContent = Math.floor(p * target);
    if (p < 1) requestAnimationFrame(step);
  };
  const onShow = new IntersectionObserver(ents => {
    ents.forEach(en => {
      if (en.isIntersecting) {
        requestAnimationFrame(step);
        onShow.disconnect();
      }
    });
  }, {threshold: 0.6});
  onShow.observe(el);
});

// Particles canvas (math symbols)
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
const symbols = ['∑','π','√','∞','∫','Δ','θ','λ','≈','≠','≥','≤','→','←','×','÷'];
let dots = [], mouse = {x:0,y:0};
const DPR = Math.min(window.devicePixelRatio || 1, 2);

function resize(){
  canvas.width = innerWidth * DPR;
  canvas.height = innerHeight * DPR;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
}
resize();
addEventListener('resize', resize);

function spawn(n=60){
  dots = [];
  for (let i=0;i<n;i++){
    dots.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      vx: (Math.random()-.5)*0.3,
      vy: (Math.random()-.5)*0.3,
      s: 14 + Math.random()*20,
      a: 0.35 + Math.random()*0.35,
      sym: symbols[Math.floor(Math.random()*symbols.length)]
    });
  }
}
spawn();

addEventListener('mousemove', e=>{
  mouse.x = e.clientX * DPR;
  mouse.y = e.clientY * DPR;
});

function tick(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  dots.forEach(d=>{
    // mouse repulsion
    const dx = d.x - mouse.x, dy = d.y - mouse.y;
    const dist2 = dx*dx + dy*dy;
    const force = dist2 < (200*DPR)*(200*DPR) ? 1 - (Math.sqrt(dist2)/(200*DPR)) : 0;
    d.vx += (dx/2000) * force;
    d.vy += (dy/2000) * force;

    d.x += d.vx; d.y += d.vy;
    // boundaries wrap
    if (d.x < -50) d.x = canvas.width+50;
    if (d.x > canvas.width+50) d.x = -50;
    if (d.y < -50) d.y = canvas.height+50;
    if (d.y > canvas.height+50) d.y = -50;

    ctx.save();
    ctx.globalAlpha = d.a;
    ctx.fillStyle = '#cfe8ff';
    ctx.font = `${d.s}px Fraunces, serif`;
    ctx.fillText(d.sym, d.x, d.y);
    ctx.restore();
  });
  requestAnimationFrame(tick);
}
tick();

// Course filter
const chips = document.querySelectorAll('.course-filter .chip');
const courses = document.querySelectorAll('.course-grid .course');
chips.forEach(ch => ch.addEventListener('click', ()=>{
  chips.forEach(c=>c.classList.remove('active'));
  ch.classList.add('active');
  const cat = ch.dataset.filter;
  courses.forEach(card=>{
    const show = cat === 'all' || card.dataset.cat === cat;
    card.style.display = show ? '' : 'none';
  });
}));

// Pricing estimator (tunable rates)
const sessions = document.getElementById('sessions');
const minutes = document.getElementById('minutes');
const batch = document.getElementById('batch');
const sessionsVal = document.getElementById('sessionsVal');
const minutesVal = document.getElementById('minutesVal');
const estimateEl = document.getElementById('estimate');

// Adjust these base rates easily
const RATE_PER_MIN_1 = 20;   // ₹ per minute for 1:1
const RATE_PER_MIN_3 = 12;   // ₹ per minute for 1:3
const RATE_PER_MIN_6 = 8;    // ₹ per minute for 1:6

function calc(){
  sessionsVal.textContent = sessions.value;
  minutesVal.textContent = minutes.value;
  const s = Number(sessions.value);
  const m = Number(minutes.value);
  const b = Number(batch.value);
  const rate = b===1?RATE_PER_MIN_1 : b===3?RATE_PER_MIN_3 : RATE_PER_MIN_6;
  const monthly = s * m * rate * 4; // approx 4 weeks
  estimateEl.textContent = `₹${monthly.toLocaleString('en-IN')}`;
}
[sessions, minutes, batch].forEach(el=>el.addEventListener('input', calc));
calc();

// Testimonials carousel
const track = document.querySelector('.carousel-track');
const prev = document.querySelector('.carousel .prev');
const next = document.querySelector('.carousel .next');
if (track && prev && next){
  const step = ()=> track.clientWidth * 0.94;
  prev.addEventListener('click', ()=> track.scrollBy({left:-step(), behavior:'smooth'}));
  next.addEventListener('click', ()=> track.scrollBy({left:+step(), behavior:'smooth'}));
}

// Back to top keyboard accessibility
const toTop = document.querySelector('.to-top');
toTop.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') e.target.click();
});

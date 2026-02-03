// Apple-Inspired Liquid Flow Field + Sentient Eyes
(function() {
  'use strict';

  let canvas, ctx;
  let w, h;

  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let targetMouse = { x: mouse.x, y: mouse.y };

  const particles = [];
  const PARTICLE_COUNT = 700;
  const FLOW_SCALE = 0.0018;

  // Apple Palette
  const appleColors = [
    { h: 210, s: 100, l: 60 },
    { h: 340, s: 82, l: 62 },
    { h: 160, s: 43, l: 54 },
    { h: 35, s: 92, l: 55 },
    { h: 255, s: 50, l: 65 }
  ];

  // lightweight pseudo noise
  function noise(x, y) {
    return Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      const c = appleColors[Math.floor(Math.random() * appleColors.length)];
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.vx = 0;
      this.vy = 0;
      this.life = Math.random() * 400 + 200;
      this.size = Math.random() * 1.2 + 0.4;
      this.h = c.h;
      this.s = c.s;
      this.l = c.l;
    }

    update() {
      const nx = this.x * FLOW_SCALE;
      const ny = this.y * FLOW_SCALE;

      const angle = noise(nx, ny) * Math.PI * 2;

      const fx = Math.cos(angle);
      const fy = Math.sin(angle);

      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;

      this.vx += fx * 0.25 + dx / dist * 0.04;
      this.vy += fy * 0.25 + dy / dist * 0.04;

      this.vx *= 0.92;
      this.vy *= 0.92;

      this.x += this.vx;
      this.y += this.vy;

      this.life--;

      if (
        this.life <= 0 ||
        this.x < 0 ||
        this.x > w ||
        this.y < 0 ||
        this.y > h
      ) {
        this.reset();
      }
    }

    draw() {
      ctx.fillStyle = `hsla(${this.h},${this.s}%,${this.l}%,0.35)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function init() {
    canvas = document.createElement('canvas');
    canvas.id = 'apple-gradient-canvas';
    canvas.style.cssText = `
      position:fixed;
      inset:0;
      z-index:0;
      pointer-events:none;
      background:#fbfbfd;
    `;
    document.body.insertBefore(canvas, document.body.firstChild);

    ctx = canvas.getContext('2d');
    resize();

    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', e => {
      targetMouse.x = e.clientX;
      targetMouse.y = e.clientY;
    });

    document.addEventListener('touchmove', e => {
      if (e.touches[0]) {
        targetMouse.x = e.touches[0].clientX;
        targetMouse.y = e.touches[0].clientY;
      }
    }, { passive: true });

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    animate();
  }

  function animate() {
    requestAnimationFrame(animate);

    mouse.x += (targetMouse.x - mouse.x) * 0.07;
    mouse.y += (targetMouse.y - mouse.y) * 0.07;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'lighter';

    particles.forEach(p => {
      p.update();
      p.draw();
    });
  }

  // ===== KEEP YOUR EXISTING EYES EXACTLY =====

  function initEyes() {
    const container = document.createElement('div');
    container.id = 'sentient-eyes';
    container.innerHTML = `
      <div class="eye left-eye"><div class="pupil"><div class="glint"></div></div></div>
      <div class="eye right-eye"><div class="pupil"><div class="glint"></div></div></div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      #sentient-eyes {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        gap: 40px;
        z-index: 10;
        pointer-events: none;
        filter: drop-shadow(0 20px 40px rgba(0,0,0,0.08));
      }
      .eye {
        width: 90px;
        height: 90px;
        background: rgba(255,255,255,0.7);
        backdrop-filter: blur(10px);
        border-radius: 50%;
        display:flex;
        align-items:center;
        justify-content:center;
      }
      .pupil {
        width:36px;
        height:36px;
        background:#1d1d1f;
        border-radius:50%;
        position:relative;
      }
      .glint {
        position:absolute;
        width:10px;
        height:10px;
        background:white;
        border-radius:50%;
        top:6px;
        left:6px;
      }
      .eye.blink { animation: appleBlink .2s ease; }
      @keyframes appleBlink {50%{transform:scaleY(.05)}}
      [data-theme="dark"] #apple-gradient-canvas{background:#000}
      [data-theme="dark"] .eye{background:rgba(255,255,255,.1)}
      [data-theme="dark"] .pupil{background:#f5f5f7}
    `;

    document.head.appendChild(style);
    document.body.appendChild(container);

    const pupils = container.querySelectorAll('.pupil');
    let tx=0,ty=0,cx=0,cy=0;

    document.addEventListener('mousemove',e=>{
      const dx=e.clientX-window.innerWidth/2;
      const dy=e.clientY-window.innerHeight/2;
      tx=dx/40; ty=dy/40;
    });

    function loop(){
      cx+=(tx-cx)*.08;
      cy+=(ty-cy)*.08;
      pupils.forEach(p=>p.style.transform=`translate(${cx}px,${cy}px)`);
      requestAnimationFrame(loop);
    }
    loop();

    setInterval(()=>{
      container.querySelectorAll('.eye').forEach(e=>e.classList.add('blink'));
      setTimeout(()=>container.querySelectorAll('.eye').forEach(e=>e.classList.remove('blink')),200);
    },3500+Math.random()*3000);
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{init();initEyes();});
  } else {
    init();initEyes();
  }

})();

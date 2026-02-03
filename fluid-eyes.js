// Apple-Inspired Fluid Eyes & Gradient
(function() {
    'use strict';

    let canvas, ctx;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let particles = [];
    
    // Apple Palette: Azure, Rose, Mint, Amber, Lavender
    const appleColors = [
        { h: 210, s: 100, l: 60 }, // Azure
        { h: 340, s: 82, l: 62 },  // Rose
        { h: 160, s: 43, l: 54 },  // Mint
        { h: 35, s: 92, l: 55 },   // Amber
        { h: 255, s: 50, l: 65 }   // Lavender
    ];

    function init() {
        canvas = document.createElement('canvas');
        canvas.id = 'apple-gradient-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
            background: #fbfbfd; /* Apple Light Mode background */
        `;
        document.body.insertBefore(canvas, document.body.firstChild);

        ctx = canvas.getContext('2d');
        resizeCanvas();

        document.addEventListener('mousemove', onMouseMove);
        window.addEventListener('resize', resizeCanvas);

        animate();
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function onMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        for (let i = 0; i < 1; i++) {
            const color = appleColors[Math.floor(Math.random() * appleColors.length)];
            particles.push({
                x: mouseX,
                y: mouseY,
                size: 150 + Math.random() * 100,
                h: color.h,
                s: color.s,
                l: color.l,
                life: 1,
                decay: 0.008
            });
        }
        
        if (particles.length > 25) particles.shift();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, i) => {
            p.life -= p.decay;
            if (p.life <= 0) {
                particles.splice(i, 1);
                return;
            }

            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            const alpha = p.life * 0.15; // Very subtle Apple-style glow
            
            gradient.addColorStop(0, `hsla(${p.h}, ${p.s}%, ${p.l}%, ${alpha})`);
            gradient.addColorStop(1, `hsla(${p.h}, ${p.s}%, ${p.l}%, 0)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

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
                background: rgba(255, 255, 255, 0.7);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border: 0.5px solid rgba(255, 255, 255, 0.4);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                overflow: hidden;
            }
            .pupil {
                width: 36px;
                height: 36px;
                background: #1d1d1f; /* Apple Black */
                border-radius: 50%;
                position: relative;
                will-change: transform;
            }
            .glint {
                position: absolute;
                width: 10px;
                height: 10px;
                background: rgba(255,255,255,0.9);
                border-radius: 50%;
                top: 6px;
                left: 6px;
            }
            .eye.blink {
                animation: appleBlink 0.2s cubic-bezier(0.45, 0, 0.55, 1);
            }
            @keyframes appleBlink {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(0.05); }
            }
            [data-theme="dark"] #apple-gradient-canvas { background: #000000; }
            [data-theme="dark"] .eye { 
                background: rgba(255, 255, 255, 0.1); 
                border-color: rgba(255,255,255,0.1); 
            }
            [data-theme="dark"] .pupil { background: #f5f5f7; }
        `;

        document.head.appendChild(style);
        document.body.appendChild(container);

        const pupils = container.querySelectorAll('.pupil');
        const eyes = container.querySelectorAll('.eye');
        let targetX = 0, targetY = 0, curX = 0, curY = 0;

        document.addEventListener('mousemove', (e) => {
            const dx = e.clientX - window.innerWidth / 2;
            const dy = e.clientY - window.innerHeight / 2;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const max = 20;
            targetX = (dx / (dist + 500)) * 100; 
            targetY = (dy / (dist + 500)) * 100;
        });

        function smoothMove() {
            curX += (targetX - curX) * 0.08;
            curY += (targetY - curY) * 0.08;
            pupils.forEach(p => p.style.transform = `translate(${curX}px, ${curY}px)`);
            requestAnimationFrame(smoothMove);
        }
        smoothMove();

        setInterval(() => {
            eyes.forEach(e => e.classList.add('blink'));
            setTimeout(() => eyes.forEach(e => e.classList.remove('blink')), 200);
        }, 3500 + Math.random() * 3000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { init(); initEyes(); });
    } else {
        init(); initEyes();
    }
})();

// Bright Swirling Color Effect
// Beautiful vivid colors that follow cursor

(function() {
    'use strict';

    let canvas, ctx;
    let particles = [];
    let mouseX = -500, mouseY = -500;
    let lastMouseX = -500, lastMouseY = -500;
    let colorAngle = 0;

    // BRIGHT VIVID COLORS - like the reference image
    const lightModeColors = [
        [255, 80, 130],   // Bright Pink
        [255, 130, 80],   // Coral Orange  
        [255, 200, 50],   // Golden Yellow
        [100, 255, 130],  // Bright Green
        [80, 230, 210],   // Cyan Teal
        [150, 100, 255],  // Purple
        [230, 130, 230],  // Magenta Pink
        [80, 180, 255],   // Sky Blue
    ];

    const darkModeColors = [
        [255, 50, 130],   // Hot Pink
        [255, 100, 50],   // Bright Orange
        [255, 230, 30],   // Vivid Yellow
        [50, 255, 100],   // Neon Green
        [30, 255, 230],   // Neon Cyan
        [130, 80, 255],   // Electric Purple
        [255, 100, 200],  // Bright Magenta
        [50, 150, 255],   // Electric Blue
    ];

    function isDarkMode() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    function getColors() {
        return isDarkMode() ? darkModeColors : lightModeColors;
    }

    function init() {
        canvas = document.createElement('canvas');
        canvas.id = 'swirl-canvas';
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
        document.body.insertBefore(canvas, document.body.firstChild);
        ctx = canvas.getContext('2d');
        resize();

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('resize', resize);

        // Hide old effects
        const oldGradient = document.querySelector('.mouse-gradient');
        if (oldGradient) oldGradient.style.display = 'none';

        animate();
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function onMouseMove(e) {
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        mouseX = e.clientX;
        mouseY = e.clientY;
        createParticles();
    }

    function onTouchMove(e) {
        const touch = e.touches[0];
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        mouseX = touch.clientX;
        mouseY = touch.clientY;
        createParticles();
    }

    function createParticles() {
        const dx = mouseX - lastMouseX;
        const dy = mouseY - lastMouseY;
        const speed = Math.sqrt(dx * dx + dy * dy);

        if (speed < 1) return;

        const colors = getColors();
        const numParticles = Math.min(Math.floor(speed / 2) + 2, 6);

        for (let i = 0; i < numParticles; i++) {
            const color = colors[Math.floor(colorAngle + i) % colors.length];
            const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 2;
            const spd = 1 + Math.random() * 2;

            particles.push({
                x: mouseX + (Math.random() - 0.5) * 15,
                y: mouseY + (Math.random() - 0.5) * 15,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                size: 50 + Math.random() * 60,
                color: color,
                alpha: 1.0,
                decay: 0.008 + Math.random() * 0.006,
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.12
            });
        }

        colorAngle = (colorAngle + 0.3) % colors.length;

        // Keep particles limited
        if (particles.length > 150) {
            particles = particles.slice(-150);
        }
    }

    function animate() {
        // Clear canvas completely each frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];

            // Swirl motion
            p.angle += p.spin;
            p.x += p.vx + Math.cos(p.angle) * 0.5;
            p.y += p.vy + Math.sin(p.angle) * 0.5;
            
            // Slow down
            p.vx *= 0.97;
            p.vy *= 0.97;
            
            // Fade out
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            // Draw bright, solid colored circle
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            const r = p.color[0], g = p.color[1], b = p.color[2];
            
            // Solid center, fade only at edges
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.alpha})`);
            gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.95})`);
            gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.6})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }

    // Sentient Eyes
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
                gap: 30px;
                z-index: 5;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.8s ease;
            }
            #sentient-eyes.visible { opacity: 1; }
            .eye {
                width: 80px;
                height: 80px;
                background: radial-gradient(circle at 35% 35%, #fff, #f5f5f5);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 6px 24px rgba(0,0,0,0.1), inset 0 -3px 8px rgba(0,0,0,0.05);
                animation: eyeFloat 4s ease-in-out infinite;
                transition: background 0.3s, box-shadow 0.3s;
            }
            .left-eye { animation-delay: 0s; }
            .right-eye { animation-delay: 0.4s; }
            @keyframes eyeFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            .pupil {
                width: 40px;
                height: 40px;
                background: radial-gradient(circle at 35% 35%, #3a3a3a, #111);
                border-radius: 50%;
                position: relative;
                transition: transform 0.1s ease-out;
            }
            .glint {
                position: absolute;
                width: 12px;
                height: 12px;
                background: white;
                border-radius: 50%;
                top: 7px;
                left: 7px;
            }
            .glint::after {
                content: '';
                position: absolute;
                width: 5px;
                height: 5px;
                background: white;
                border-radius: 50%;
                bottom: -10px;
                right: -6px;
                opacity: 0.5;
            }
            .eye.blink { animation: blink 0.15s ease-in-out; }
            @keyframes blink {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(0.1); }
            }
            [data-theme="dark"] .eye {
                background: radial-gradient(circle at 35% 35%, #f0f0f0, #d0d0d0);
                box-shadow: 0 6px 24px rgba(0,0,0,0.4), inset 0 -3px 8px rgba(0,0,0,0.1);
            }
            [data-theme="dark"] .pupil {
                background: radial-gradient(circle at 35% 35%, #1a1a1a, #000);
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(container);

        const leftPupil = container.querySelector('.left-eye .pupil');
        const rightPupil = container.querySelector('.right-eye .pupil');
        const leftEye = container.querySelector('.left-eye');
        const rightEye = container.querySelector('.right-eye');

        let targetX = 0, targetY = 0, currentX = 0, currentY = 0;

        document.addEventListener('mousemove', (e) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const maxOffset = 15;
            const ratio = Math.min(dist / 300, 1);
            targetX = (dx / dist) * maxOffset * ratio;
            targetY = (dy / dist) * maxOffset * ratio;
        });

        function animateEyes() {
            currentX += (targetX - currentX) * 0.12;
            currentY += (targetY - currentY) * 0.12;
            leftPupil.style.transform = `translate(${currentX}px, ${currentY}px)`;
            rightPupil.style.transform = `translate(${currentX}px, ${currentY}px)`;
            requestAnimationFrame(animateEyes);
        }
        animateEyes();

        function blink() {
            leftEye.classList.add('blink');
            rightEye.classList.add('blink');
            setTimeout(() => {
                leftEye.classList.remove('blink');
                rightEye.classList.remove('blink');
            }, 150);
        }

        function scheduleBlink() {
            setTimeout(() => { blink(); scheduleBlink(); }, 2500 + Math.random() * 4000);
        }
        scheduleBlink();

        setTimeout(() => container.classList.add('visible'), 400);
    }

    // Start
    function start() {
        init();
        
        // Only show eyes on role pages, not index
        const isIndex = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname === '/' ||
                       window.location.pathname.endsWith('/');
        if (!isIndex) {
            initEyes();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();

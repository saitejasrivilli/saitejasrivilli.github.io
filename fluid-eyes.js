// Simple Mouse-Follow Gradient Effect
// Clean pastel colors that follow the cursor

(function() {
    'use strict';

    let canvas, ctx;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let particles = [];
    let hue = 0;

    function init() {
        canvas = document.createElement('canvas');
        canvas.id = 'gradient-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
        `;
        document.body.insertBefore(canvas, document.body.firstChild);

        ctx = canvas.getContext('2d');
        resizeCanvas();

        document.addEventListener('mousemove', onMouseMove);
        window.addEventListener('resize', resizeCanvas);

        // Hide old gradient
        const oldGradient = document.querySelector('.mouse-gradient');
        if (oldGradient) oldGradient.style.display = 'none';

        animate();
        return true;
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function onMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Add new particles on mouse move
        for (let i = 0; i < 2; i++) {
            particles.push({
                x: mouseX + (Math.random() - 0.5) * 20,
                y: mouseY + (Math.random() - 0.5) * 20,
                size: 60 + Math.random() * 80,
                hue: hue + Math.random() * 60,
                life: 1,
                decay: 0.01 + Math.random() * 0.01
            });
        }
        
        hue = (hue + 2) % 360;

        // Limit particles
        if (particles.length > 40) {
            particles = particles.slice(-40);
        }
    }

    function animate() {
        // Clear canvas completely each frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            
            p.life -= p.decay;
            
            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            // Create soft gradient
            const gradient = ctx.createRadialGradient(
                p.x, p.y, 0,
                p.x, p.y, p.size
            );

            const alpha = p.life * 0.4;
            const color = `hsla(${p.hue}, 70%, 75%, ${alpha})`;
            
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.5, `hsla(${p.hue}, 70%, 75%, ${alpha * 0.4})`);
            gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw glow at current mouse position
        const glowGradient = ctx.createRadialGradient(
            mouseX, mouseY, 0,
            mouseX, mouseY, 120
        );
        glowGradient.addColorStop(0, `hsla(${hue}, 70%, 80%, 0.3)`);
        glowGradient.addColorStop(0.5, `hsla(${(hue + 40) % 360}, 70%, 80%, 0.15)`);
        glowGradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 120, 0, Math.PI * 2);
        ctx.fill();

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
                box-shadow: 
                    0 6px 24px rgba(0,0,0,0.1),
                    inset 0 -3px 8px rgba(0,0,0,0.05);
                animation: eyeFloat 4s ease-in-out infinite;
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
                background: radial-gradient(circle at 35% 35%, #e0e0e0, #c0c0c0);
            }
            [data-theme="dark"] .pupil {
                background: radial-gradient(circle at 35% 35%, #2a2a2a, #000);
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
            setTimeout(() => {
                blink();
                scheduleBlink();
            }, 2500 + Math.random() * 4000);
        }
        scheduleBlink();

        setTimeout(() => container.classList.add('visible'), 400);
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { init(); initEyes(); });
    } else {
        init();
        initEyes();
    }
})();

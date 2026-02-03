// Subtle Mouse-Follow Gradient Effect
// Colors appear only around the cursor in a limited radius

(function() {
    'use strict';

    // Pastel color palette
    const colors = [
        'rgba(255, 182, 193, 0.6)',  // Pink
        'rgba(221, 160, 221, 0.6)',  // Plum
        'rgba(186, 85, 211, 0.5)',   // Purple
        'rgba(135, 206, 250, 0.6)',  // Sky blue
        'rgba(127, 255, 212, 0.5)',  // Aquamarine
        'rgba(144, 238, 144, 0.5)',  // Light green
        'rgba(255, 255, 150, 0.5)',  // Yellow
        'rgba(255, 218, 185, 0.5)',  // Peach
        'rgba(255, 160, 122, 0.5)',  // Salmon
    ];

    let canvas, ctx;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let trails = [];
    let colorIndex = 0;
    let lastTrailTime = 0;

    function init() {
        // Create canvas
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

        // Event listeners
        document.addEventListener('mousemove', onMouseMove);
        window.addEventListener('resize', resizeCanvas);

        // Start animation
        animate();

        // Hide old gradient
        const oldGradient = document.querySelector('.mouse-gradient');
        if (oldGradient) oldGradient.style.display = 'none';

        return true;
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function onMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        const now = Date.now();
        // Add trail point every 30ms
        if (now - lastTrailTime > 30) {
            addTrail(mouseX, mouseY);
            lastTrailTime = now;
        }
    }

    function addTrail(x, y) {
        // Add multiple colored circles at slightly offset positions
        const numCircles = 3;
        for (let i = 0; i < numCircles; i++) {
            const offset = 15;
            const ox = x + (Math.random() - 0.5) * offset;
            const oy = y + (Math.random() - 0.5) * offset;
            const color = colors[(colorIndex + i) % colors.length];
            const size = 80 + Math.random() * 60; // 80-140px radius

            trails.push({
                x: ox,
                y: oy,
                color: color,
                size: size,
                alpha: 0.7,
                life: 1.0
            });
        }
        colorIndex = (colorIndex + 1) % colors.length;

        // Limit trail length
        if (trails.length > 50) {
            trails = trails.slice(-50);
        }
    }

    function animate() {
        // Clear with slight fade for trail effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Check for dark mode
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw trails
        for (let i = trails.length - 1; i >= 0; i--) {
            const trail = trails[i];
            
            // Fade out
            trail.life -= 0.015;
            trail.alpha = trail.life * 0.6;

            if (trail.life <= 0) {
                trails.splice(i, 1);
                continue;
            }

            // Draw soft gradient circle
            const gradient = ctx.createRadialGradient(
                trail.x, trail.y, 0,
                trail.x, trail.y, trail.size
            );

            // Parse color and apply alpha
            const baseColor = trail.color.replace(/[\d.]+\)$/, `${trail.alpha})`);
            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(0.5, baseColor.replace(/[\d.]+\)$/, `${trail.alpha * 0.5})`));
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw current position highlight
        if (trails.length > 0) {
            const currentColor = colors[colorIndex % colors.length];
            const gradient = ctx.createRadialGradient(
                mouseX, mouseY, 0,
                mouseX, mouseY, 100
            );
            gradient.addColorStop(0, currentColor);
            gradient.addColorStop(0.6, currentColor.replace(/[\d.]+\)$/, '0.2)'));
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 100, 0, Math.PI * 2);
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
            .eye.blink {
                animation: blink 0.15s ease-in-out;
            }
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

        // Smooth eye tracking
        let targetX = 0, targetY = 0;
        let currentX = 0, currentY = 0;

        document.addEventListener('mousemove', (e) => {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxOffset = 15;
            const ratio = Math.min(dist / 300, 1);
            
            targetX = (dx / (dist || 1)) * maxOffset * ratio;
            targetY = (dy / (dist || 1)) * maxOffset * ratio;
        });

        function animateEyes() {
            currentX += (targetX - currentX) * 0.12;
            currentY += (targetY - currentY) * 0.12;
            
            leftPupil.style.transform = `translate(${currentX}px, ${currentY}px)`;
            rightPupil.style.transform = `translate(${currentX}px, ${currentY}px)`;
            
            requestAnimationFrame(animateEyes);
        }
        animateEyes();

        // Natural blinking
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
                if (Math.random() < 0.25) {
                    setTimeout(blink, 180);
                }
                scheduleBlink();
            }, 2500 + Math.random() * 4000);
        }
        scheduleBlink();

        setTimeout(() => container.classList.add('visible'), 400);
    }

    // Initialize
    function start() {
        init();
        initEyes();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();

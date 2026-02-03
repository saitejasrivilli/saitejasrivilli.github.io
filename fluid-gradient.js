// Enhanced Fluid Mesh Gradient Background with Mouse Interaction
// Bright sunset colors: vibrant pinks, oranges, yellows - ONLY around mouse cursor

(function() {
    'use strict';

    let canvas, ctx;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    let particles = [];
    let animationTime = 0;

    // Bright, vibrant sunset palette
    const colorPalette = [
        { h: 340, s: 100, l: 60 }, // Bright pink
        { h: 20, s: 100, l: 55 },  // Vibrant orange
        { h: 45, s: 100, l: 60 },  // Bright yellow
        { h: 10, s: 100, l: 58 },  // Bright red-orange
        { h: 330, s: 95, l: 62 },  // Hot pink
        { h: 50, s: 100, l: 65 }   // Golden yellow
    ];

    function init() {
        canvas = document.createElement('canvas');
        canvas.id = 'fluid-gradient-canvas';
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

        ctx = canvas.getContext('2d', { alpha: false });
        resizeCanvas();

        // Initialize floating particles around mouse
        createParticles();

        document.addEventListener('mousemove', onMouseMove);
        window.addEventListener('resize', onResize);

        // Hide old gradient elements if they exist
        const oldGradient = document.querySelector('.mouse-gradient');
        if (oldGradient) oldGradient.style.display = 'none';

        animate();
        return true;
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function onResize() {
        resizeCanvas();
    }

    function onMouseMove(e) {
        targetMouseX = e.clientX;
        targetMouseY = e.clientY;
        
        // Add particles on mouse move
        if (Math.random() < 0.4) {
            particles.push({
                x: targetMouseX + (Math.random() - 0.5) * 30,
                y: targetMouseY + (Math.random() - 0.5) * 30,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                size: 40 + Math.random() * 60,
                color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
                life: 1,
                decay: 0.012 + Math.random() * 0.018
            });
        }
        
        // Limit particle count
        if (particles.length > 25) {
            particles = particles.slice(-25);
        }
    }

    function createParticles() {
        particles = [];
        // Start with a few particles at initial mouse position
        for (let i = 0; i < 5; i++) {
            particles.push({
                x: mouseX + (Math.random() - 0.5) * 60,
                y: mouseY + (Math.random() - 0.5) * 60,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                size: 50 + Math.random() * 70,
                color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
                life: 1,
                decay: 0.012 + Math.random() * 0.018
            });
        }
    }

    function updateParticles() {
        const mouseInfluence = 80;
        const mouseForce = 0.02;

        particles.forEach((p, index) => {
            // Fade out
            p.life -= p.decay;
            
            if (p.life <= 0) {
                particles.splice(index, 1);
                return;
            }

            // Mouse interaction - gentle push
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouseInfluence && distance > 0) {
                const force = (1 - distance / mouseInfluence) * mouseForce;
                p.vx -= (dx / distance) * force * 50;
                p.vy -= (dy / distance) * force * 50;
            }

            // Apply velocity with damping
            p.vx *= 0.94;
            p.vy *= 0.94;
            p.x += p.vx;
            p.y += p.vy;
        });
    }

    function drawParticles() {
        particles.forEach(p => {
            const gradient = ctx.createRadialGradient(
                p.x, p.y, 0,
                p.x, p.y, p.size
            );

            const alpha = p.life * 0.5;
            gradient.addColorStop(0, `hsla(${p.color.h}, ${p.color.s}%, ${p.color.l}%, ${alpha})`);
            gradient.addColorStop(0.4, `hsla(${p.color.h}, ${p.color.s}%, ${p.color.l + 8}%, ${alpha * 0.65})`);
            gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function drawMouseGlow() {
        // Main glow at mouse position - smaller radius
        const gradient = ctx.createRadialGradient(
            mouseX, mouseY, 0,
            mouseX, mouseY, 120
        );

        const glowColor = colorPalette[Math.floor((animationTime * 0.015) % colorPalette.length)];
        gradient.addColorStop(0, `hsla(${glowColor.h}, ${glowColor.s}%, ${glowColor.l}%, 0.6)`);
        gradient.addColorStop(0.35, `hsla(${glowColor.h + 15}, ${glowColor.s}%, ${glowColor.l + 10}%, 0.35)`);
        gradient.addColorStop(0.7, `hsla(${glowColor.h - 15}, ${glowColor.s - 10}%, ${glowColor.l}%, 0.15)`);
        gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 120, 0, Math.PI * 2);
        ctx.fill();

        // Add a secondary smaller, brighter glow
        const gradient2 = ctx.createRadialGradient(
            mouseX, mouseY, 0,
            mouseX, mouseY, 70
        );

        const glowColor2 = colorPalette[(Math.floor((animationTime * 0.015) % colorPalette.length) + 3) % colorPalette.length];
        gradient2.addColorStop(0, `hsla(${glowColor2.h}, ${glowColor2.s}%, ${glowColor2.l + 5}%, 0.5)`);
        gradient2.addColorStop(0.5, `hsla(${glowColor2.h}, ${glowColor2.s}%, ${glowColor2.l}%, 0.25)`);
        gradient2.addColorStop(1, 'hsla(0, 0%, 0%, 0)');

        ctx.fillStyle = gradient2;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 70, 0, Math.PI * 2);
        ctx.fill();
    }

    function animate() {
        // Smooth mouse movement with inertia
        mouseX += (targetMouseX - mouseX) * 0.1;
        mouseY += (targetMouseY - mouseY) * 0.1;

        animationTime++;

        // Clear with WHITE background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw mouse glow first
        drawMouseGlow();

        // Update and draw particles
        updateParticles();
        drawParticles();

        requestAnimationFrame(animate);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

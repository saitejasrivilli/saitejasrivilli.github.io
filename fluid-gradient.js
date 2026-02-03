// Enhanced Fluid Mesh Gradient Background with Mouse Interaction
// Sunset pastel colors: pinks, oranges, yellows - ONLY around mouse cursor

(function() {
    'use strict';

    let canvas, ctx;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    let particles = [];
    let animationTime = 0;

    // Sunset palette - soft pastels
    const colorPalette = [
        { h: 350, s: 85, l: 75 }, // Soft pink
        { h: 25, s: 90, l: 70 },  // Warm orange
        { h: 45, s: 95, l: 75 },  // Soft yellow
        { h: 15, s: 85, l: 72 },  // Peachy orange
        { h: 340, s: 80, l: 78 }  // Light pink
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
        if (Math.random() < 0.3) {
            particles.push({
                x: targetMouseX + (Math.random() - 0.5) * 40,
                y: targetMouseY + (Math.random() - 0.5) * 40,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: 60 + Math.random() * 100,
                color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
                life: 1,
                decay: 0.008 + Math.random() * 0.012
            });
        }
        
        // Limit particle count
        if (particles.length > 30) {
            particles = particles.slice(-30);
        }
    }

    function createParticles() {
        particles = [];
        // Start with a few particles at initial mouse position
        for (let i = 0; i < 5; i++) {
            particles.push({
                x: mouseX + (Math.random() - 0.5) * 100,
                y: mouseY + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: 80 + Math.random() * 120,
                color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
                life: 1,
                decay: 0.008 + Math.random() * 0.012
            });
        }
    }

    function updateParticles() {
        const mouseInfluence = 120;
        const mouseForce = 0.015;

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
                p.vx -= (dx / distance) * force * 40;
                p.vy -= (dy / distance) * force * 40;
            }

            // Apply velocity with damping
            p.vx *= 0.95;
            p.vy *= 0.95;
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

            const alpha = p.life * 0.4;
            gradient.addColorStop(0, `hsla(${p.color.h}, ${p.color.s}%, ${p.color.l}%, ${alpha})`);
            gradient.addColorStop(0.4, `hsla(${p.color.h}, ${p.color.s}%, ${p.color.l + 5}%, ${alpha * 0.6})`);
            gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function drawMouseGlow() {
        // Large glow at mouse position
        const gradient = ctx.createRadialGradient(
            mouseX, mouseY, 0,
            mouseX, mouseY, 250
        );

        const glowColor = colorPalette[Math.floor((animationTime * 0.01) % colorPalette.length)];
        gradient.addColorStop(0, `hsla(${glowColor.h}, ${glowColor.s}%, ${glowColor.l}%, 0.45)`);
        gradient.addColorStop(0.3, `hsla(${glowColor.h + 15}, ${glowColor.s}%, ${glowColor.l + 5}%, 0.25)`);
        gradient.addColorStop(0.6, `hsla(${glowColor.h - 15}, ${glowColor.s}%, ${glowColor.l}%, 0.12)`);
        gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 250, 0, Math.PI * 2);
        ctx.fill();

        // Add a secondary smaller glow
        const gradient2 = ctx.createRadialGradient(
            mouseX, mouseY, 0,
            mouseX, mouseY, 150
        );

        const glowColor2 = colorPalette[(Math.floor((animationTime * 0.01) % colorPalette.length) + 2) % colorPalette.length];
        gradient2.addColorStop(0, `hsla(${glowColor2.h}, ${glowColor2.s}%, ${glowColor2.l}%, 0.3)`);
        gradient2.addColorStop(0.5, `hsla(${glowColor2.h}, ${glowColor2.s}%, ${glowColor2.l}%, 0.15)`);
        gradient2.addColorStop(1, 'hsla(0, 0%, 0%, 0)');

        ctx.fillStyle = gradient2;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 150, 0, Math.PI * 2);
        ctx.fill();
    }

    function animate() {
        // Smooth mouse movement with inertia
        mouseX += (targetMouseX - mouseX) * 0.08;
        mouseY += (targetMouseY - mouseY) * 0.08;

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

// Enhanced Fluid Mesh Gradient Background with Mouse Interaction
// BRIGHT, VIVID sunset colors: vibrant pinks, oranges, yellows, greens - ONLY around mouse cursor

(function() {
    'use strict';

    let canvas, ctx;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    let particles = [];
    let animationTime = 0;

    // BRIGHT, VIVID color palette - like the reference image
    const colorPalette = [
        { h: 340, s: 100, l: 50 }, // Bright magenta/pink
        { h: 20, s: 100, l: 50 },  // Vivid orange
        { h: 50, s: 100, l: 50 },  // Bright yellow
        { h: 120, s: 100, l: 50 }, // Vibrant green
        { h: 10, s: 100, l: 45 },  // Deep orange-red
        { h: 330, s: 100, l: 55 }, // Hot pink
        { h: 140, s: 100, l: 45 }, // Bright lime green
        { h: 60, s: 100, l: 55 }   // Golden yellow
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
        
        // Add particles on mouse move - more frequently
        if (Math.random() < 0.5) {
            particles.push({
                x: targetMouseX + (Math.random() - 0.5) * 30,
                y: targetMouseY + (Math.random() - 0.5) * 30,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                size: 60 + Math.random() * 100,
                color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
                life: 1,
                decay: 0.008 + Math.random() * 0.012
            });
        }
        
        // Limit particle count
        if (particles.length > 35) {
            particles = particles.slice(-35);
        }
    }

    function createParticles() {
        particles = [];
        // Start with a few particles at initial mouse position
        for (let i = 0; i < 8; i++) {
            particles.push({
                x: mouseX + (Math.random() - 0.5) * 80,
                y: mouseY + (Math.random() - 0.5) * 80,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                size: 70 + Math.random() * 110,
                color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
                life: 1,
                decay: 0.008 + Math.random() * 0.012
            });
        }
    }

    function updateParticles() {
        const mouseInfluence = 100;
        const mouseForce = 0.025;

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
                p.vx -= (dx / distance) * force * 60;
                p.vy -= (dy / distance) * force * 60;
            }

            // Apply velocity with damping
            p.vx *= 0.93;
            p.vy *= 0.93;
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

            // MUCH HIGHER OPACITY for visibility
            const alpha = p.life * 0.7;
            gradient.addColorStop(0, `hsla(${p.color.h}, ${p.color.s}%, ${p.color.l}%, ${alpha})`);
            gradient.addColorStop(0.3, `hsla(${p.color.h}, ${p.color.s}%, ${p.color.l + 10}%, ${alpha * 0.75})`);
            gradient.addColorStop(0.6, `hsla(${p.color.h}, ${p.color.s}%, ${p.color.l + 5}%, ${alpha * 0.4})`);
            gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function drawMouseGlow() {
        // Main bright glow at mouse position
        const gradient = ctx.createRadialGradient(
            mouseX, mouseY, 0,
            mouseX, mouseY, 180
        );

        const glowColor = colorPalette[Math.floor((animationTime * 0.02) % colorPalette.length)];
        // VERY HIGH OPACITY for bright, visible effect
        gradient.addColorStop(0, `hsla(${glowColor.h}, ${glowColor.s}%, ${glowColor.l + 10}%, 0.75)`);
        gradient.addColorStop(0.25, `hsla(${glowColor.h + 20}, ${glowColor.s}%, ${glowColor.l + 15}%, 0.6)`);
        gradient.addColorStop(0.5, `hsla(${glowColor.h}, ${glowColor.s}%, ${glowColor.l}%, 0.4)`);
        gradient.addColorStop(0.75, `hsla(${glowColor.h - 20}, ${glowColor.s - 10}%, ${glowColor.l - 5}%, 0.2)`);
        gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 180, 0, Math.PI * 2);
        ctx.fill();

        // Secondary brighter core glow
        const gradient2 = ctx.createRadialGradient(
            mouseX, mouseY, 0,
            mouseX, mouseY, 100
        );

        const glowColor2 = colorPalette[(Math.floor((animationTime * 0.02) % colorPalette.length) + 4) % colorPalette.length];
        gradient2.addColorStop(0, `hsla(${glowColor2.h}, ${glowColor2.s}%, ${glowColor2.l + 15}%, 0.8)`);
        gradient2.addColorStop(0.4, `hsla(${glowColor2.h}, ${glowColor2.s}%, ${glowColor2.l + 10}%, 0.6)`);
        gradient2.addColorStop(0.7, `hsla(${glowColor2.h}, ${glowColor2.s}%, ${glowColor2.l}%, 0.3)`);
        gradient2.addColorStop(1, 'hsla(0, 0%, 0%, 0)');

        ctx.fillStyle = gradient2;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 100, 0, Math.PI * 2);
        ctx.fill();

        // Third layer - even brighter center
        const gradient3 = ctx.createRadialGradient(
            mouseX, mouseY, 0,
            mouseX, mouseY, 50
        );

        const glowColor3 = colorPalette[(Math.floor((animationTime * 0.02) % colorPalette.length) + 2) % colorPalette.length];
        gradient3.addColorStop(0, `hsla(${glowColor3.h}, ${glowColor3.s}%, ${glowColor3.l + 20}%, 0.85)`);
        gradient3.addColorStop(0.5, `hsla(${glowColor3.h}, ${glowColor3.s}%, ${glowColor3.l + 10}%, 0.5)`);
        gradient3.addColorStop(1, 'hsla(0, 0%, 0%, 0)');

        ctx.fillStyle = gradient3;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 50, 0, Math.PI * 2);
        ctx.fill();
    }

    function animate() {
        // Smooth mouse movement with inertia
        mouseX += (targetMouseX - mouseX) * 0.12;
        mouseY += (targetMouseY - mouseY) * 0.12;

        animationTime++;

        // Clear with WHITE background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw mouse glow first (layered approach)
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

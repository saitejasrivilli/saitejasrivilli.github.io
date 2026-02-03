// Enhanced Fluid Mesh Gradient Background with Mouse Interaction
// Sunset pastel colors: pinks, oranges, yellows with smooth transitions

(function() {
    'use strict';

    let canvas, ctx;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    let particles = [];
    let meshPoints = [];
    const GRID_SIZE = 6;
    const PARTICLE_COUNT = 50;
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

        // Initialize mesh points
        createMeshGrid();
        
        // Initialize floating particles
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
        createMeshGrid();
    }

    function onMouseMove(e) {
        targetMouseX = e.clientX;
        targetMouseY = e.clientY;
    }

    function createMeshGrid() {
        meshPoints = [];
        const cellWidth = canvas.width / (GRID_SIZE - 1);
        const cellHeight = canvas.height / (GRID_SIZE - 1);

        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                meshPoints.push({
                    baseX: x * cellWidth,
                    baseY: y * cellHeight,
                    x: x * cellWidth,
                    y: y * cellHeight,
                    vx: 0,
                    vy: 0,
                    color: colorPalette[Math.floor(Math.random() * colorPalette.length)]
                });
            }
        }
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                baseX: Math.random() * canvas.width,
                baseY: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: 80 + Math.random() * 120,
                color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
                phase: Math.random() * Math.PI * 2,
                speed: 0.3 + Math.random() * 0.4
            });
        }
    }

    function updateMeshPoints() {
        const mouseInfluenceRadius = 250;
        const mouseForce = 0.015;
        const returnForce = 0.02;
        const damping = 0.92;

        meshPoints.forEach(point => {
            // Calculate distance to mouse
            const dx = mouseX - point.x;
            const dy = mouseY - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Mouse repulsion force
            if (distance < mouseInfluenceRadius && distance > 0) {
                const force = (1 - distance / mouseInfluenceRadius) * mouseForce;
                point.vx -= (dx / distance) * force * 100;
                point.vy -= (dy / distance) * force * 100;
            }

            // Return to base position
            const returnX = (point.baseX - point.x) * returnForce;
            const returnY = (point.baseY - point.y) * returnForce;
            point.vx += returnX;
            point.vy += returnY;

            // Apply velocity with damping
            point.vx *= damping;
            point.vy *= damping;
            point.x += point.vx;
            point.y += point.vy;
        });
    }

    function updateParticles() {
        const mouseInfluence = 150;
        const mouseForce = 0.02;

        particles.forEach(p => {
            // Organic floating motion
            const floatX = Math.sin(animationTime * p.speed + p.phase) * 2;
            const floatY = Math.cos(animationTime * p.speed * 0.7 + p.phase) * 2;

            // Mouse interaction
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouseInfluence && distance > 0) {
                const force = (1 - distance / mouseInfluence) * mouseForce;
                p.x -= (dx / distance) * force * 50;
                p.y -= (dy / distance) * force * 50;
            }

            // Apply floating motion
            p.x += floatX;
            p.y += floatY;

            // Gentle drift
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around screen edges
            if (p.x < -100) p.x = canvas.width + 100;
            if (p.x > canvas.width + 100) p.x = -100;
            if (p.y < -100) p.y = canvas.height + 100;
            if (p.y > canvas.height + 100) p.y = -100;
        });
    }

    function drawMeshGradient() {
        // Create mesh gradient using triangulation
        for (let y = 0; y < GRID_SIZE - 1; y++) {
            for (let x = 0; x < GRID_SIZE - 1; x++) {
                const i1 = y * GRID_SIZE + x;
                const i2 = y * GRID_SIZE + x + 1;
                const i3 = (y + 1) * GRID_SIZE + x;
                const i4 = (y + 1) * GRID_SIZE + x + 1;

                const p1 = meshPoints[i1];
                const p2 = meshPoints[i2];
                const p3 = meshPoints[i3];
                const p4 = meshPoints[i4];

                // Draw two triangles to form a quad
                drawGradientTriangle(p1, p2, p3);
                drawGradientTriangle(p2, p4, p3);
            }
        }
    }

    function drawGradientTriangle(p1, p2, p3) {
        // Average color for the triangle
        const avgH = (p1.color.h + p2.color.h + p3.color.h) / 3;
        const avgS = (p1.color.s + p2.color.s + p3.color.s) / 3;
        const avgL = (p1.color.l + p2.color.l + p3.color.l) / 3;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(p1.x, p1.y, p3.x, p3.y);
        gradient.addColorStop(0, `hsla(${avgH}, ${avgS}%, ${avgL}%, 0.3)`);
        gradient.addColorStop(0.5, `hsla(${avgH + 10}, ${avgS}%, ${avgL + 5}%, 0.25)`);
        gradient.addColorStop(1, `hsla(${avgH - 10}, ${avgS}%, ${avgL}%, 0.3)`);

        ctx.fillStyle = gradient;
        ctx.fill();
    }

    function drawParticles() {
        particles.forEach(p => {
            const gradient = ctx.createRadialGradient(
                p.x, p.y, 0,
                p.x, p.y, p.size
            );

            const alpha = 0.25;
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
            mouseX, mouseY, 200
        );

        const glowColor = colorPalette[Math.floor((animationTime * 0.01) % colorPalette.length)];
        gradient.addColorStop(0, `hsla(${glowColor.h}, ${glowColor.s}%, ${glowColor.l}%, 0.35)`);
        gradient.addColorStop(0.3, `hsla(${glowColor.h + 15}, ${glowColor.s}%, ${glowColor.l + 5}%, 0.2)`);
        gradient.addColorStop(0.6, `hsla(${glowColor.h - 15}, ${glowColor.s}%, ${glowColor.l}%, 0.1)`);
        gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 200, 0, Math.PI * 2);
        ctx.fill();
    }

    function animate() {
        // Smooth mouse movement with inertia
        mouseX += (targetMouseX - mouseX) * 0.08;
        mouseY += (targetMouseY - mouseY) * 0.08;

        animationTime++;

        // Create base gradient background
        const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        bgGradient.addColorStop(0, '#fff5f5');
        bgGradient.addColorStop(0.3, '#fff9f0');
        bgGradient.addColorStop(0.6, '#fef9f3');
        bgGradient.addColorStop(1, '#fef3f5');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and draw mesh
        updateMeshPoints();
        drawMeshGradient();

        // Update and draw particles
        updateParticles();
        drawParticles();

        // Draw mouse glow
        drawMouseGlow();

        requestAnimationFrame(animate);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

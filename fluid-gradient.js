// Enhanced Fluid Mesh Gradient Background with Mouse Interaction
// BRIGHT, VIVID colors with speed-based intensity and flowing design

(function() {
    'use strict';

    let canvas, ctx;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    let prevMouseX = mouseX;
    let prevMouseY = mouseY;
    let mouseSpeed = 0;
    let trail = [];
    let animationTime = 0;

    // VERY BRIGHT color palette - lighter tones
    const colorPalette = [
        { h: 340, s: 100, l: 65 }, // Bright pink
        { h: 20, s: 100, l: 60 },  // Bright orange
        { h: 50, s: 100, l: 65 },  // Bright yellow
        { h: 120, s: 100, l: 60 }, // Bright green
        { h: 330, s: 100, l: 70 }, // Light pink
        { h: 60, s: 100, l: 65 },  // Golden yellow
        { h: 140, s: 100, l: 55 }, // Lime green
        { h: 10, s: 100, l: 60 }   // Orange-red
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
        
        // Calculate mouse speed
        const dx = targetMouseX - prevMouseX;
        const dy = targetMouseY - prevMouseY;
        mouseSpeed = Math.sqrt(dx * dx + dy * dy);
        
        prevMouseX = targetMouseX;
        prevMouseY = targetMouseY;
        
        // Add trail points
        trail.push({
            x: targetMouseX,
            y: targetMouseY,
            life: 1,
            color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
            speed: mouseSpeed
        });
        
        // Limit trail length
        if (trail.length > 25) {
            trail.shift();
        }
    }

    function updateTrail() {
        // Decay trail points
        for (let i = trail.length - 1; i >= 0; i--) {
            trail[i].life -= 0.03;
            if (trail[i].life <= 0) {
                trail.splice(i, 1);
            }
        }
    }

    function drawFlowingGradient() {
        // Calculate speed-based intensity (slow = bright, fast = dim)
        const speedFactor = Math.min(mouseSpeed / 20, 1);
        const baseIntensity = 1 - (speedFactor * 0.5); // Slow = 1.0, Fast = 0.5
        
        // Smooth mouse position
        mouseX += (targetMouseX - mouseX) * 0.15;
        mouseY += (targetMouseY - mouseY) * 0.15;

        // Draw flowing trail with smooth blending
        for (let i = 0; i < trail.length - 1; i++) {
            const current = trail[i];
            const next = trail[i + 1];
            
            // Create flowing gradient between points
            const gradient = ctx.createLinearGradient(
                current.x, current.y,
                next.x, next.y
            );
            
            const alpha = current.life * baseIntensity * 0.6;
            gradient.addColorStop(0, `hsla(${current.color.h}, ${current.color.s}%, ${current.color.l}%, ${alpha})`);
            gradient.addColorStop(1, `hsla(${next.color.h}, ${next.color.s}%, ${next.color.l}%, ${alpha * 0.8})`);
            
            // Draw flowing blob between points
            const distance = Math.sqrt((next.x - current.x) ** 2 + (next.y - current.y) ** 2);
            const size = 40 + (current.life * 40);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.ellipse(
                (current.x + next.x) / 2,
                (current.y + next.y) / 2,
                size,
                size * 0.8,
                Math.atan2(next.y - current.y, next.x - current.x),
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        // Main flowing glow at mouse position - SMALLER SIZE
        const mainGradient = ctx.createRadialGradient(
            mouseX, mouseY, 0,
            mouseX, mouseY, 100
        );

        const currentColor = colorPalette[Math.floor((animationTime * 0.03) % colorPalette.length)];
        const mainAlpha = baseIntensity * 0.85; // Bright when slow
        
        mainGradient.addColorStop(0, `hsla(${currentColor.h}, ${currentColor.s}%, ${currentColor.l + 15}%, ${mainAlpha})`);
        mainGradient.addColorStop(0.3, `hsla(${currentColor.h + 20}, ${currentColor.s}%, ${currentColor.l + 10}%, ${mainAlpha * 0.75})`);
        mainGradient.addColorStop(0.6, `hsla(${currentColor.h}, ${currentColor.s}%, ${currentColor.l}%, ${mainAlpha * 0.5})`);
        mainGradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');

        ctx.fillStyle = mainGradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 100, 0, Math.PI * 2);
        ctx.fill();

        
            }

    function animate() {
        animationTime++;

        // Decay mouse speed
        mouseSpeed *= 0.95;

        // Clear with WHITE background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update trail
        updateTrail();

        // Draw flowing gradient
        drawFlowingGradient();

        requestAnimationFrame(animate);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// Enhanced Fluid Simulation with Sentient Eyes
// Smooth, multi-color fluid that reacts immediately to mouse

(function() {
    'use strict';

    // Configuration for smooth, responsive fluid
    const config = {
        SIM_RESOLUTION: 256,
        DYE_RESOLUTION: 1024,
        DENSITY_DISSIPATION: 0.995,
        VELOCITY_DISSIPATION: 0.997,
        PRESSURE_ITERATIONS: 20,
        CURL: 25,
        SPLAT_RADIUS: 0.4,
        SPLAT_FORCE: 5000,
        BLOOM_INTENSITY: 0.4,
        MULTI_COLOR: true
    };

    // Rich color palette
    const colorPalette = [
        [1.0, 0.4, 0.7],   // Hot pink
        [0.9, 0.5, 0.9],   // Orchid
        [0.7, 0.4, 1.0],   // Purple
        [0.5, 0.5, 1.0],   // Periwinkle
        [0.4, 0.7, 1.0],   // Sky blue
        [0.3, 0.9, 0.9],   // Cyan
        [0.4, 1.0, 0.7],   // Mint
        [0.6, 1.0, 0.5],   // Lime
        [1.0, 1.0, 0.4],   // Yellow
        [1.0, 0.8, 0.4],   // Gold
        [1.0, 0.6, 0.4],   // Peach
        [1.0, 0.5, 0.5],   // Coral
    ];

    let canvas, gl;
    let programs = {};
    let framebuffers = {};
    let pointer = { x: 0.5, y: 0.5, dx: 0, dy: 0, moved: false, firstMove: true };
    let lastTime = 0;
    let colorAngle = 0;

    function init() {
        canvas = document.createElement('canvas');
        canvas.id = 'fluid-canvas';
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

        const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
        gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
        
        if (!gl) {
            console.warn('WebGL not supported');
            return false;
        }

        // Extensions
        gl.getExtension('OES_texture_float');
        gl.getExtension('OES_texture_float_linear');

        resizeCanvas();
        initShaders();
        initFramebuffers();
        initEventListeners();
        
        // Start with colorful splashes
        setTimeout(() => initialSplashes(), 100);
        
        requestAnimationFrame(render);
        return true;
    }

    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio, 2);
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
    }

    function initShaders() {
        const baseVert = `
            precision highp float;
            attribute vec2 aPosition;
            varying vec2 vUv;
            varying vec2 vL, vR, vT, vB;
            uniform vec2 texelSize;
            void main() {
                vUv = aPosition * 0.5 + 0.5;
                vL = vUv - vec2(texelSize.x, 0.0);
                vR = vUv + vec2(texelSize.x, 0.0);
                vT = vUv + vec2(0.0, texelSize.y);
                vB = vUv - vec2(0.0, texelSize.y);
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `;

        const splatFrag = `
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D uTarget;
            uniform float aspectRatio;
            uniform vec3 color;
            uniform vec2 point;
            uniform float radius;
            void main() {
                vec2 p = vUv - point;
                p.x *= aspectRatio;
                float d = length(p);
                float strength = exp(-d * d / radius);
                vec3 base = texture2D(uTarget, vUv).rgb;
                vec3 splat = strength * color;
                gl_FragColor = vec4(base + splat, 1.0);
            }
        `;

        const advectionFrag = `
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D uVelocity;
            uniform sampler2D uSource;
            uniform vec2 texelSize;
            uniform float dt;
            uniform float dissipation;
            void main() {
                vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                vec4 result = dissipation * texture2D(uSource, coord);
                gl_FragColor = result;
            }
        `;

        const divergenceFrag = `
            precision highp float;
            varying vec2 vL, vR, vT, vB;
            uniform sampler2D uVelocity;
            void main() {
                float L = texture2D(uVelocity, vL).x;
                float R = texture2D(uVelocity, vR).x;
                float T = texture2D(uVelocity, vT).y;
                float B = texture2D(uVelocity, vB).y;
                gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
            }
        `;

        const curlFrag = `
            precision highp float;
            varying vec2 vL, vR, vT, vB;
            uniform sampler2D uVelocity;
            void main() {
                float L = texture2D(uVelocity, vL).y;
                float R = texture2D(uVelocity, vR).y;
                float T = texture2D(uVelocity, vT).x;
                float B = texture2D(uVelocity, vB).x;
                gl_FragColor = vec4(R - L - T + B, 0.0, 0.0, 1.0);
            }
        `;

        const vorticityFrag = `
            precision highp float;
            varying vec2 vUv, vL, vR, vT, vB;
            uniform sampler2D uVelocity;
            uniform sampler2D uCurl;
            uniform float curl;
            uniform float dt;
            void main() {
                float L = texture2D(uCurl, vL).x;
                float R = texture2D(uCurl, vR).x;
                float T = texture2D(uCurl, vT).x;
                float B = texture2D(uCurl, vB).x;
                float C = texture2D(uCurl, vUv).x;
                vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
                force /= length(force) + 0.0001;
                force *= curl * C;
                force.y *= -1.0;
                vec2 vel = texture2D(uVelocity, vUv).xy + force * dt;
                gl_FragColor = vec4(vel, 0.0, 1.0);
            }
        `;

        const pressureFrag = `
            precision highp float;
            varying vec2 vUv, vL, vR, vT, vB;
            uniform sampler2D uPressure;
            uniform sampler2D uDivergence;
            void main() {
                float L = texture2D(uPressure, vL).x;
                float R = texture2D(uPressure, vR).x;
                float T = texture2D(uPressure, vT).x;
                float B = texture2D(uPressure, vB).x;
                float divergence = texture2D(uDivergence, vUv).x;
                gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
            }
        `;

        const gradientSubtractFrag = `
            precision highp float;
            varying vec2 vUv, vL, vR, vT, vB;
            uniform sampler2D uPressure;
            uniform sampler2D uVelocity;
            void main() {
                float L = texture2D(uPressure, vL).x;
                float R = texture2D(uPressure, vR).x;
                float T = texture2D(uPressure, vT).x;
                float B = texture2D(uPressure, vB).x;
                vec2 vel = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
                gl_FragColor = vec4(vel, 0.0, 1.0);
            }
        `;

        const clearFrag = `
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D uTexture;
            uniform float value;
            void main() {
                gl_FragColor = value * texture2D(uTexture, vUv);
            }
        `;

        const displayFrag = `
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D uTexture;
            void main() {
                vec3 c = texture2D(uTexture, vUv).rgb;
                // Boost saturation and vibrancy
                float gray = dot(c, vec3(0.299, 0.587, 0.114));
                c = mix(vec3(gray), c, 1.3);
                c = pow(c, vec3(0.9));
                float alpha = smoothstep(0.0, 0.1, length(c));
                gl_FragColor = vec4(c, alpha * 0.95);
            }
        `;

        programs.splat = createProgram(baseVert, splatFrag);
        programs.advection = createProgram(baseVert, advectionFrag);
        programs.divergence = createProgram(baseVert, divergenceFrag);
        programs.curl = createProgram(baseVert, curlFrag);
        programs.vorticity = createProgram(baseVert, vorticityFrag);
        programs.pressure = createProgram(baseVert, pressureFrag);
        programs.gradientSubtract = createProgram(baseVert, gradientSubtractFrag);
        programs.clear = createProgram(baseVert, clearFrag);
        programs.display = createProgram(baseVert, displayFrag);

        // Vertex buffer
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
    }

    function createProgram(vertSrc, fragSrc) {
        const vert = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vert, vertSrc);
        gl.compileShader(vert);

        const frag = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(frag, fragSrc);
        gl.compileShader(frag);

        const prog = gl.createProgram();
        gl.attachShader(prog, vert);
        gl.attachShader(prog, frag);
        gl.linkProgram(prog);

        const uniforms = {};
        const numUniforms = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < numUniforms; i++) {
            const name = gl.getActiveUniform(prog, i).name;
            uniforms[name] = gl.getUniformLocation(prog, name);
        }

        return { program: prog, uniforms };
    }

    function initFramebuffers() {
        const simW = Math.round(config.SIM_RESOLUTION * (canvas.width / canvas.height));
        const simH = config.SIM_RESOLUTION;
        const dyeW = Math.round(config.DYE_RESOLUTION * (canvas.width / canvas.height));
        const dyeH = config.DYE_RESOLUTION;

        framebuffers.velocity = createDoubleFBO(simW, simH, gl.RGBA, gl.FLOAT);
        framebuffers.dye = createDoubleFBO(dyeW, dyeH, gl.RGBA, gl.FLOAT);
        framebuffers.divergence = createFBO(simW, simH, gl.RGBA, gl.FLOAT);
        framebuffers.curl = createFBO(simW, simH, gl.RGBA, gl.FLOAT);
        framebuffers.pressure = createDoubleFBO(simW, simH, gl.RGBA, gl.FLOAT);
    }

    function createFBO(w, h, format, type) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, format, w, h, 0, format, type, null);

        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        return {
            fbo, texture, width: w, height: h,
            texelSizeX: 1 / w, texelSizeY: 1 / h,
            attach(id) {
                gl.activeTexture(gl.TEXTURE0 + id);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                return id;
            }
        };
    }

    function createDoubleFBO(w, h, format, type) {
        let fbo1 = createFBO(w, h, format, type);
        let fbo2 = createFBO(w, h, format, type);
        return {
            width: w, height: h,
            texelSizeX: 1 / w, texelSizeY: 1 / h,
            get read() { return fbo1; },
            get write() { return fbo2; },
            swap() { [fbo1, fbo2] = [fbo2, fbo1]; }
        };
    }

    function initEventListeners() {
        // Make fluid canvas interactive
        canvas.style.pointerEvents = 'auto';

        let isHovering = false;
        let hoverInterval = null;

        document.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = 1 - e.clientY / window.innerHeight;
            
            pointer.dx = (x - pointer.x) * 10;
            pointer.dy = (y - pointer.y) * 10;
            pointer.x = x;
            pointer.y = y;
            pointer.moved = true;

            // Create multiple color splats on movement
            if (Math.abs(pointer.dx) > 0.001 || Math.abs(pointer.dy) > 0.001) {
                multiColorSplat(x, y, pointer.dx, pointer.dy);
            }
        });

        document.addEventListener('mouseenter', () => {
            isHovering = true;
            // Continuous color emission while hovering
            hoverInterval = setInterval(() => {
                if (isHovering) {
                    ambientSplat(pointer.x, pointer.y);
                }
            }, 50);
        });

        document.addEventListener('mouseleave', () => {
            isHovering = false;
            if (hoverInterval) clearInterval(hoverInterval);
        });

        // Touch support
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const x = touch.clientX / window.innerWidth;
            const y = 1 - touch.clientY / window.innerHeight;
            pointer.dx = (x - pointer.x) * 10;
            pointer.dy = (y - pointer.y) * 10;
            pointer.x = x;
            pointer.y = y;
            multiColorSplat(x, y, pointer.dx, pointer.dy);
        }, { passive: false });

        window.addEventListener('resize', () => {
            resizeCanvas();
            initFramebuffers();
        });
    }

    function getColor(offset = 0) {
        const idx = Math.floor((colorAngle + offset) % colorPalette.length);
        return colorPalette[idx];
    }

    function multiColorSplat(x, y, dx, dy) {
        // Create 3-5 splats with different colors simultaneously
        const numSplats = 3 + Math.floor(Math.random() * 3);
        const spread = 0.02;

        for (let i = 0; i < numSplats; i++) {
            const color = getColor(i * 2);
            const offsetX = (Math.random() - 0.5) * spread;
            const offsetY = (Math.random() - 0.5) * spread;
            const force = 0.8 + Math.random() * 0.4;
            
            splat(x + offsetX, y + offsetY, dx * force, dy * force, color);
        }
        
        colorAngle = (colorAngle + 0.5) % colorPalette.length;
    }

    function ambientSplat(x, y) {
        // Subtle ambient colors when hovering in place
        const numSplats = 2;
        for (let i = 0; i < numSplats; i++) {
            const color = getColor(i * 3);
            const angle = Math.random() * Math.PI * 2;
            const force = 0.001 + Math.random() * 0.002;
            const dx = Math.cos(angle) * force;
            const dy = Math.sin(angle) * force;
            const spread = 0.03;
            
            splat(
                x + (Math.random() - 0.5) * spread,
                y + (Math.random() - 0.5) * spread,
                dx, dy, color
            );
        }
        colorAngle = (colorAngle + 0.3) % colorPalette.length;
    }

    function initialSplashes() {
        // Create beautiful initial splash pattern
        const centerX = 0.5;
        const centerY = 0.5;
        
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 0.15 + Math.random() * 0.1;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const dx = Math.cos(angle) * 0.002;
            const dy = Math.sin(angle) * 0.002;
            const color = colorPalette[i % colorPalette.length];
            
            splat(x, y, dx, dy, color);
        }
        
        // Center burst
        for (let i = 0; i < 6; i++) {
            const color = colorPalette[(i * 2) % colorPalette.length];
            const angle = Math.random() * Math.PI * 2;
            const dx = Math.cos(angle) * 0.001;
            const dy = Math.sin(angle) * 0.001;
            splat(centerX, centerY, dx, dy, color);
        }
    }

    function splat(x, y, dx, dy, color) {
        const vel = framebuffers.velocity;
        const dye = framebuffers.dye;

        gl.viewport(0, 0, vel.width, vel.height);
        gl.useProgram(programs.splat.program);
        gl.uniform1i(programs.splat.uniforms.uTarget, vel.read.attach(0));
        gl.uniform1f(programs.splat.uniforms.aspectRatio, canvas.width / canvas.height);
        gl.uniform2f(programs.splat.uniforms.point, x, y);
        gl.uniform3f(programs.splat.uniforms.color, dx * config.SPLAT_FORCE, dy * config.SPLAT_FORCE, 0);
        gl.uniform1f(programs.splat.uniforms.radius, config.SPLAT_RADIUS / 100);
        blit(vel.write.fbo);
        vel.swap();

        gl.viewport(0, 0, dye.width, dye.height);
        gl.uniform1i(programs.splat.uniforms.uTarget, dye.read.attach(0));
        gl.uniform3f(programs.splat.uniforms.color, color[0] * 0.8, color[1] * 0.8, color[2] * 0.8);
        blit(dye.write.fbo);
        dye.swap();
    }

    function blit(target) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, target);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    function render(time) {
        const dt = Math.min((time - lastTime) / 1000, 0.016);
        lastTime = time;

        if (!gl) {
            requestAnimationFrame(render);
            return;
        }

        const vel = framebuffers.velocity;
        const dye = framebuffers.dye;
        const div = framebuffers.divergence;
        const cur = framebuffers.curl;
        const pres = framebuffers.pressure;

        gl.disable(gl.BLEND);

        // Curl
        gl.viewport(0, 0, vel.width, vel.height);
        gl.useProgram(programs.curl.program);
        gl.uniform2f(programs.curl.uniforms.texelSize, vel.texelSizeX, vel.texelSizeY);
        gl.uniform1i(programs.curl.uniforms.uVelocity, vel.read.attach(0));
        blit(cur.fbo);

        // Vorticity
        gl.useProgram(programs.vorticity.program);
        gl.uniform2f(programs.vorticity.uniforms.texelSize, vel.texelSizeX, vel.texelSizeY);
        gl.uniform1i(programs.vorticity.uniforms.uVelocity, vel.read.attach(0));
        gl.uniform1i(programs.vorticity.uniforms.uCurl, cur.attach(1));
        gl.uniform1f(programs.vorticity.uniforms.curl, config.CURL);
        gl.uniform1f(programs.vorticity.uniforms.dt, dt);
        blit(vel.write.fbo);
        vel.swap();

        // Divergence
        gl.useProgram(programs.divergence.program);
        gl.uniform2f(programs.divergence.uniforms.texelSize, vel.texelSizeX, vel.texelSizeY);
        gl.uniform1i(programs.divergence.uniforms.uVelocity, vel.read.attach(0));
        blit(div.fbo);

        // Clear pressure
        gl.useProgram(programs.clear.program);
        gl.uniform1i(programs.clear.uniforms.uTexture, pres.read.attach(0));
        gl.uniform1f(programs.clear.uniforms.value, 0.8);
        blit(pres.write.fbo);
        pres.swap();

        // Pressure solve
        gl.useProgram(programs.pressure.program);
        gl.uniform2f(programs.pressure.uniforms.texelSize, vel.texelSizeX, vel.texelSizeY);
        gl.uniform1i(programs.pressure.uniforms.uDivergence, div.attach(0));
        for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
            gl.uniform1i(programs.pressure.uniforms.uPressure, pres.read.attach(1));
            blit(pres.write.fbo);
            pres.swap();
        }

        // Gradient subtract
        gl.useProgram(programs.gradientSubtract.program);
        gl.uniform2f(programs.gradientSubtract.uniforms.texelSize, vel.texelSizeX, vel.texelSizeY);
        gl.uniform1i(programs.gradientSubtract.uniforms.uPressure, pres.read.attach(0));
        gl.uniform1i(programs.gradientSubtract.uniforms.uVelocity, vel.read.attach(1));
        blit(vel.write.fbo);
        vel.swap();

        // Advect velocity
        gl.useProgram(programs.advection.program);
        gl.uniform2f(programs.advection.uniforms.texelSize, vel.texelSizeX, vel.texelSizeY);
        gl.uniform1i(programs.advection.uniforms.uVelocity, vel.read.attach(0));
        gl.uniform1i(programs.advection.uniforms.uSource, vel.read.attach(0));
        gl.uniform1f(programs.advection.uniforms.dt, dt);
        gl.uniform1f(programs.advection.uniforms.dissipation, config.VELOCITY_DISSIPATION);
        blit(vel.write.fbo);
        vel.swap();

        // Advect dye
        gl.viewport(0, 0, dye.width, dye.height);
        gl.uniform2f(programs.advection.uniforms.texelSize, dye.texelSizeX, dye.texelSizeY);
        gl.uniform1i(programs.advection.uniforms.uVelocity, vel.read.attach(0));
        gl.uniform1i(programs.advection.uniforms.uSource, dye.read.attach(1));
        gl.uniform1f(programs.advection.uniforms.dissipation, config.DENSITY_DISSIPATION);
        blit(dye.write.fbo);
        dye.swap();

        // Render to screen
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(programs.display.program);
        gl.uniform1i(programs.display.uniforms.uTexture, dye.read.attach(0));
        blit(null);

        requestAnimationFrame(render);
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
                gap: 35px;
                z-index: 5;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.8s ease;
            }
            #sentient-eyes.visible { opacity: 1; }
            .eye {
                width: 90px;
                height: 90px;
                background: radial-gradient(circle at 35% 35%, #fff, #f0f0f0);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 
                    0 8px 32px rgba(0,0,0,0.1),
                    inset 0 -4px 12px rgba(0,0,0,0.05),
                    inset 0 4px 8px rgba(255,255,255,0.8);
                animation: eyeFloat 4s ease-in-out infinite;
            }
            .left-eye { animation-delay: 0s; }
            .right-eye { animation-delay: 0.5s; }
            @keyframes eyeFloat {
                0%, 100% { transform: translateY(0) rotate(-2deg); }
                50% { transform: translateY(-12px) rotate(2deg); }
            }
            .pupil {
                width: 45px;
                height: 45px;
                background: radial-gradient(circle at 35% 35%, #3a3a3a, #0a0a0a);
                border-radius: 50%;
                position: relative;
                transition: transform 0.08s ease-out;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
            .glint {
                position: absolute;
                width: 14px;
                height: 14px;
                background: radial-gradient(circle, #fff, rgba(255,255,255,0.8));
                border-radius: 50%;
                top: 8px;
                left: 8px;
            }
            .glint::after {
                content: '';
                position: absolute;
                width: 6px;
                height: 6px;
                background: white;
                border-radius: 50%;
                bottom: -12px;
                right: -8px;
                opacity: 0.6;
            }
            .eye.blink {
                animation: blink 0.12s ease-in-out;
            }
            @keyframes blink {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(0.08); }
            }
            [data-theme="dark"] .eye {
                background: radial-gradient(circle at 35% 35%, #e8e8e8, #d0d0d0);
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
            const maxDist = 300;
            const maxOffset = 18;
            const ratio = Math.min(dist / maxDist, 1);
            
            targetX = (dx / (dist || 1)) * maxOffset * ratio;
            targetY = (dy / (dist || 1)) * maxOffset * ratio;
        });

        function animateEyes() {
            currentX += (targetX - currentX) * 0.15;
            currentY += (targetY - currentY) * 0.15;
            
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
            }, 120);
        }

        function scheduleBlink() {
            setTimeout(() => {
                blink();
                // Occasionally double-blink
                if (Math.random() < 0.3) {
                    setTimeout(blink, 200);
                }
                scheduleBlink();
            }, 2500 + Math.random() * 4000);
        }
        scheduleBlink();

        setTimeout(() => container.classList.add('visible'), 300);
    }

    // Initialize
    function start() {
        const success = init();
        initEyes();
        
        if (success) {
            const oldGradient = document.querySelector('.mouse-gradient');
            if (oldGradient) oldGradient.style.display = 'none';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();

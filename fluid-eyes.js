// Beautiful Swirling Fluid Simulation
// Bright vivid colors that flow like ink in water

(function() {
    'use strict';

    let canvas, gl;
    let programs = {};
    let velocity, dye, divergence, curl, pressure;
    let pointer = { x: 0, y: 0, dx: 0, dy: 0, moved: false };
    let lastTime = Date.now();
    let colorIndex = 0;

    // BRIGHT VIVID COLORS - matching the reference image
    const lightColors = [
        { r: 1.0, g: 0.3, b: 0.5 },   // Bright Pink
        { r: 1.0, g: 0.5, b: 0.3 },   // Coral Orange
        { r: 1.0, g: 0.8, b: 0.2 },   // Golden Yellow
        { r: 0.4, g: 1.0, b: 0.5 },   // Bright Green
        { r: 0.3, g: 0.9, b: 0.8 },   // Cyan Teal
        { r: 0.6, g: 0.4, b: 1.0 },   // Purple
        { r: 0.9, g: 0.5, b: 0.9 },   // Magenta Pink
        { r: 0.3, g: 0.7, b: 1.0 },   // Sky Blue
    ];

    const darkColors = [
        { r: 1.0, g: 0.2, b: 0.5 },   // Hot Pink
        { r: 1.0, g: 0.4, b: 0.2 },   // Bright Orange
        { r: 1.0, g: 0.9, b: 0.1 },   // Vivid Yellow
        { r: 0.2, g: 1.0, b: 0.4 },   // Neon Green
        { r: 0.1, g: 1.0, b: 0.9 },   // Neon Cyan
        { r: 0.5, g: 0.3, b: 1.0 },   // Electric Purple
        { r: 1.0, g: 0.4, b: 0.8 },   // Bright Magenta
        { r: 0.2, g: 0.6, b: 1.0 },   // Electric Blue
    ];

    const config = {
        SIM_RESOLUTION: 128,
        DYE_RESOLUTION: 1024,
        DENSITY_DISSIPATION: 0.995,
        VELOCITY_DISSIPATION: 0.99,
        PRESSURE: 0.8,
        PRESSURE_ITERATIONS: 20,
        CURL: 30,
        SPLAT_RADIUS: 0.25,
        SPLAT_FORCE: 6000,
        SHADING: true,
        COLOR_UPDATE_SPEED: 10,
    };

    function isDarkMode() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    function getColors() {
        return isDarkMode() ? darkColors : lightColors;
    }

    function pointerPrototype() {
        this.id = -1;
        this.texcoordX = 0;
        this.texcoordY = 0;
        this.prevTexcoordX = 0;
        this.prevTexcoordY = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.down = false;
        this.moved = false;
        this.color = { r: 0, g: 0, b: 0 };
    }

    function init() {
        canvas = document.createElement('canvas');
        canvas.id = 'fluid-canvas';
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
        document.body.insertBefore(canvas, document.body.firstChild);

        const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
        gl = canvas.getContext('webgl2', params);
        if (!gl) {
            gl = canvas.getContext('webgl', params);
        }
        if (!gl) return false;

        if (gl.getExtension('EXT_color_buffer_float')) {
            // WebGL2 support
        }
        gl.getExtension('OES_texture_float');
        gl.getExtension('OES_texture_float_linear');
        gl.getExtension('OES_texture_half_float');
        gl.getExtension('OES_texture_half_float_linear');

        resizeCanvas();
        initShaders();
        initFramebuffers();
        setupListeners();

        animate();
        return true;
    }

    function resizeCanvas() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }

    function initShaders() {
        const baseVertexShader = compileShader(gl.VERTEX_SHADER, `
            precision highp float;
            attribute vec2 aPosition;
            varying vec2 vUv;
            varying vec2 vL, vR, vT, vB;
            uniform vec2 texelSize;
            void main () {
                vUv = aPosition * 0.5 + 0.5;
                vL = vUv - vec2(texelSize.x, 0.0);
                vR = vUv + vec2(texelSize.x, 0.0);
                vT = vUv + vec2(0.0, texelSize.y);
                vB = vUv - vec2(0.0, texelSize.y);
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `);

        const clearShader = compileShader(gl.FRAGMENT_SHADER, `
            precision mediump float;
            uniform sampler2D uTexture;
            uniform float value;
            varying vec2 vUv;
            void main () {
                gl_FragColor = value * texture2D(uTexture, vUv);
            }
        `);

        const splatShader = compileShader(gl.FRAGMENT_SHADER, `
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D uTarget;
            uniform float aspectRatio;
            uniform vec3 color;
            uniform vec2 point;
            uniform float radius;
            void main () {
                vec2 p = vUv - point.xy;
                p.x *= aspectRatio;
                vec3 splat = exp(-dot(p, p) / radius) * color;
                vec3 base = texture2D(uTarget, vUv).xyz;
                gl_FragColor = vec4(base + splat, 1.0);
            }
        `);

        const advectionShader = compileShader(gl.FRAGMENT_SHADER, `
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D uVelocity;
            uniform sampler2D uSource;
            uniform vec2 texelSize;
            uniform float dt;
            uniform float dissipation;
            void main () {
                vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                vec4 result = dissipation * texture2D(uSource, coord);
                gl_FragColor = result;
            }
        `);

        const divergenceShader = compileShader(gl.FRAGMENT_SHADER, `
            precision mediump float;
            varying vec2 vUv;
            varying vec2 vL, vR, vT, vB;
            uniform sampler2D uVelocity;
            void main () {
                float L = texture2D(uVelocity, vL).x;
                float R = texture2D(uVelocity, vR).x;
                float T = texture2D(uVelocity, vT).y;
                float B = texture2D(uVelocity, vB).y;
                float div = 0.5 * (R - L + T - B);
                gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
            }
        `);

        const curlShader = compileShader(gl.FRAGMENT_SHADER, `
            precision mediump float;
            varying vec2 vUv;
            varying vec2 vL, vR, vT, vB;
            uniform sampler2D uVelocity;
            void main () {
                float L = texture2D(uVelocity, vL).y;
                float R = texture2D(uVelocity, vR).y;
                float T = texture2D(uVelocity, vT).x;
                float B = texture2D(uVelocity, vB).x;
                float vorticity = R - L - T + B;
                gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
            }
        `);

        const vorticityShader = compileShader(gl.FRAGMENT_SHADER, `
            precision highp float;
            varying vec2 vUv;
            varying vec2 vL, vR, vT, vB;
            uniform sampler2D uVelocity;
            uniform sampler2D uCurl;
            uniform float curl;
            uniform float dt;
            void main () {
                float L = texture2D(uCurl, vL).x;
                float R = texture2D(uCurl, vR).x;
                float T = texture2D(uCurl, vT).x;
                float B = texture2D(uCurl, vB).x;
                float C = texture2D(uCurl, vUv).x;
                vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
                force /= length(force) + 0.0001;
                force *= curl * C;
                force.y *= -1.0;
                vec2 vel = texture2D(uVelocity, vUv).xy;
                vel += force * dt;
                gl_FragColor = vec4(vel, 0.0, 1.0);
            }
        `);

        const pressureShader = compileShader(gl.FRAGMENT_SHADER, `
            precision mediump float;
            varying vec2 vUv;
            varying vec2 vL, vR, vT, vB;
            uniform sampler2D uPressure;
            uniform sampler2D uDivergence;
            void main () {
                float L = texture2D(uPressure, vL).x;
                float R = texture2D(uPressure, vR).x;
                float T = texture2D(uPressure, vT).x;
                float B = texture2D(uPressure, vB).x;
                float C = texture2D(uPressure, vUv).x;
                float divergence = texture2D(uDivergence, vUv).x;
                float pressure = (L + R + B + T - divergence) * 0.25;
                gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
            }
        `);

        const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, `
            precision mediump float;
            varying vec2 vUv;
            varying vec2 vL, vR, vT, vB;
            uniform sampler2D uPressure;
            uniform sampler2D uVelocity;
            void main () {
                float L = texture2D(uPressure, vL).x;
                float R = texture2D(uPressure, vR).x;
                float T = texture2D(uPressure, vT).x;
                float B = texture2D(uPressure, vB).x;
                vec2 velocity = texture2D(uVelocity, vUv).xy;
                velocity.xy -= vec2(R - L, T - B);
                gl_FragColor = vec4(velocity, 0.0, 1.0);
            }
        `);

        const displayShader = compileShader(gl.FRAGMENT_SHADER, `
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D uTexture;
            void main () {
                vec3 c = texture2D(uTexture, vUv).rgb;
                // Boost saturation and brightness
                float luminance = dot(c, vec3(0.299, 0.587, 0.114));
                c = mix(vec3(luminance), c, 1.4); // Increase saturation
                c *= 1.3; // Boost brightness
                c = pow(c, vec3(0.9)); // Slight gamma for vibrancy
                float a = max(c.r, max(c.g, c.b));
                a = smoothstep(0.0, 0.1, a);
                gl_FragColor = vec4(c, a);
            }
        `);

        programs.clear = createProgram(baseVertexShader, clearShader);
        programs.splat = createProgram(baseVertexShader, splatShader);
        programs.advection = createProgram(baseVertexShader, advectionShader);
        programs.divergence = createProgram(baseVertexShader, divergenceShader);
        programs.curl = createProgram(baseVertexShader, curlShader);
        programs.vorticity = createProgram(baseVertexShader, vorticityShader);
        programs.pressure = createProgram(baseVertexShader, pressureShader);
        programs.gradientSubtract = createProgram(baseVertexShader, gradientSubtractShader);
        programs.display = createProgram(baseVertexShader, displayShader);

        const vertices = new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
    }

    function compileShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    function createProgram(vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        const uniforms = {};
        const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            const uniformName = gl.getActiveUniform(program, i).name;
            uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
        }

        return { program, uniforms };
    }

    function initFramebuffers() {
        const simRes = getResolution(config.SIM_RESOLUTION);
        const dyeRes = getResolution(config.DYE_RESOLUTION);

        velocity = createDoubleFBO(simRes.width, simRes.height, gl.RGBA, gl.FLOAT);
        dye = createDoubleFBO(dyeRes.width, dyeRes.height, gl.RGBA, gl.FLOAT);
        divergence = createFBO(simRes.width, simRes.height, gl.RGBA, gl.FLOAT);
        curl = createFBO(simRes.width, simRes.height, gl.RGBA, gl.FLOAT);
        pressure = createDoubleFBO(simRes.width, simRes.height, gl.RGBA, gl.FLOAT);
    }

    function getResolution(resolution) {
        let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
        if (aspectRatio < 1) aspectRatio = 1 / aspectRatio;
        const min = Math.round(resolution);
        const max = Math.round(resolution * aspectRatio);
        if (gl.drawingBufferWidth > gl.drawingBufferHeight)
            return { width: max, height: min };
        else
            return { width: min, height: max };
    }

    function createFBO(w, h, internalFormat, format) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, gl.RGBA, format, null);

        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.viewport(0, 0, w, h);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const texelSizeX = 1.0 / w;
        const texelSizeY = 1.0 / h;

        return {
            texture,
            fbo,
            width: w,
            height: h,
            texelSizeX,
            texelSizeY,
            attach(id) {
                gl.activeTexture(gl.TEXTURE0 + id);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                return id;
            }
        };
    }

    function createDoubleFBO(w, h, internalFormat, format) {
        let fbo1 = createFBO(w, h, internalFormat, format);
        let fbo2 = createFBO(w, h, internalFormat, format);

        return {
            width: w,
            height: h,
            texelSizeX: fbo1.texelSizeX,
            texelSizeY: fbo1.texelSizeY,
            get read() { return fbo1; },
            set read(value) { fbo1 = value; },
            get write() { return fbo2; },
            set write(value) { fbo2 = value; },
            swap() {
                let temp = fbo1;
                fbo1 = fbo2;
                fbo2 = temp;
            }
        };
    }

    function setupListeners() {
        document.addEventListener('mousemove', e => {
            const x = e.clientX / canvas.clientWidth;
            const y = 1.0 - e.clientY / canvas.clientHeight;
            pointer.dx = (x - pointer.x) * 5.0;
            pointer.dy = (y - pointer.y) * 5.0;
            pointer.x = x;
            pointer.y = y;
            pointer.moved = true;
        });

        document.addEventListener('touchmove', e => {
            e.preventDefault();
            const touch = e.touches[0];
            const x = touch.clientX / canvas.clientWidth;
            const y = 1.0 - touch.clientY / canvas.clientHeight;
            pointer.dx = (x - pointer.x) * 5.0;
            pointer.dy = (y - pointer.y) * 5.0;
            pointer.x = x;
            pointer.y = y;
            pointer.moved = true;
        }, { passive: false });

        window.addEventListener('resize', () => {
            resizeCanvas();
            initFramebuffers();
        });
    }

    function splat(x, y, dx, dy, color) {
        gl.viewport(0, 0, velocity.width, velocity.height);
        gl.useProgram(programs.splat.program);
        gl.uniform1i(programs.splat.uniforms.uTarget, velocity.read.attach(0));
        gl.uniform1f(programs.splat.uniforms.aspectRatio, canvas.width / canvas.height);
        gl.uniform2f(programs.splat.uniforms.point, x, y);
        gl.uniform3f(programs.splat.uniforms.color, dx * config.SPLAT_FORCE, dy * config.SPLAT_FORCE, 0.0);
        gl.uniform1f(programs.splat.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100.0));
        blit(velocity.write);
        velocity.swap();

        gl.viewport(0, 0, dye.width, dye.height);
        gl.uniform1i(programs.splat.uniforms.uTarget, dye.read.attach(0));
        gl.uniform3f(programs.splat.uniforms.color, color.r, color.g, color.b);
        blit(dye.write);
        dye.swap();
    }

    function correctRadius(radius) {
        let aspectRatio = canvas.width / canvas.height;
        if (aspectRatio > 1) radius *= aspectRatio;
        return radius;
    }

    function blit(target) {
        if (target == null) {
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
            gl.viewport(0, 0, target.width, target.height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    function animate() {
        const dt = calcDeltaTime();
        
        if (pointer.moved) {
            pointer.moved = false;
            const colors = getColors();
            
            // Splat multiple colors at once for rich effect
            for (let i = 0; i < 3; i++) {
                const color = colors[(colorIndex + i) % colors.length];
                const offsetX = (Math.random() - 0.5) * 0.01;
                const offsetY = (Math.random() - 0.5) * 0.01;
                splat(pointer.x + offsetX, pointer.y + offsetY, pointer.dx, pointer.dy, color);
            }
            colorIndex = (colorIndex + 1) % colors.length;
        }

        step(dt);
        render();
        requestAnimationFrame(animate);
    }

    function calcDeltaTime() {
        const now = Date.now();
        let dt = (now - lastTime) / 1000;
        dt = Math.min(dt, 0.016666);
        lastTime = now;
        return dt;
    }

    function step(dt) {
        gl.disable(gl.BLEND);

        // Curl
        gl.useProgram(programs.curl.program);
        gl.uniform2f(programs.curl.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(programs.curl.uniforms.uVelocity, velocity.read.attach(0));
        blit(curl);

        // Vorticity
        gl.useProgram(programs.vorticity.program);
        gl.uniform2f(programs.vorticity.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(programs.vorticity.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(programs.vorticity.uniforms.uCurl, curl.attach(1));
        gl.uniform1f(programs.vorticity.uniforms.curl, config.CURL);
        gl.uniform1f(programs.vorticity.uniforms.dt, dt);
        blit(velocity.write);
        velocity.swap();

        // Divergence
        gl.useProgram(programs.divergence.program);
        gl.uniform2f(programs.divergence.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(programs.divergence.uniforms.uVelocity, velocity.read.attach(0));
        blit(divergence);

        // Clear pressure
        gl.useProgram(programs.clear.program);
        gl.uniform1i(programs.clear.uniforms.uTexture, pressure.read.attach(0));
        gl.uniform1f(programs.clear.uniforms.value, config.PRESSURE);
        blit(pressure.write);
        pressure.swap();

        // Pressure iterations
        gl.useProgram(programs.pressure.program);
        gl.uniform2f(programs.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(programs.pressure.uniforms.uDivergence, divergence.attach(0));
        for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
            gl.uniform1i(programs.pressure.uniforms.uPressure, pressure.read.attach(1));
            blit(pressure.write);
            pressure.swap();
        }

        // Gradient subtract
        gl.useProgram(programs.gradientSubtract.program);
        gl.uniform2f(programs.gradientSubtract.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(programs.gradientSubtract.uniforms.uPressure, pressure.read.attach(0));
        gl.uniform1i(programs.gradientSubtract.uniforms.uVelocity, velocity.read.attach(1));
        blit(velocity.write);
        velocity.swap();

        // Advection - velocity
        gl.useProgram(programs.advection.program);
        gl.uniform2f(programs.advection.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(programs.advection.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(programs.advection.uniforms.uSource, velocity.read.attach(0));
        gl.uniform1f(programs.advection.uniforms.dt, dt);
        gl.uniform1f(programs.advection.uniforms.dissipation, config.VELOCITY_DISSIPATION);
        blit(velocity.write);
        velocity.swap();

        // Advection - dye
        gl.uniform1i(programs.advection.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(programs.advection.uniforms.uSource, dye.read.attach(1));
        gl.uniform1f(programs.advection.uniforms.dissipation, config.DENSITY_DISSIPATION);
        blit(dye.write);
        dye.swap();
    }

    function render() {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.useProgram(programs.display.program);
        gl.uniform1i(programs.display.uniforms.uTexture, dye.read.attach(0));
        blit(null);
    }

    // Eyes
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
                position: fixed; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                display: flex; gap: 30px; z-index: 5;
                pointer-events: none; opacity: 0;
                transition: opacity 0.8s ease;
            }
            #sentient-eyes.visible { opacity: 1; }
            .eye {
                width: 80px; height: 80px;
                background: radial-gradient(circle at 35% 35%, #fff, #f5f5f5);
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 6px 24px rgba(0,0,0,0.1), inset 0 -3px 8px rgba(0,0,0,0.05);
                animation: eyeFloat 4s ease-in-out infinite;
            }
            .left-eye { animation-delay: 0s; }
            .right-eye { animation-delay: 0.4s; }
            @keyframes eyeFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            .pupil {
                width: 40px; height: 40px;
                background: radial-gradient(circle at 35% 35%, #3a3a3a, #111);
                border-radius: 50%; position: relative;
                transition: transform 0.1s ease-out;
            }
            .glint {
                position: absolute; width: 12px; height: 12px;
                background: white; border-radius: 50%;
                top: 7px; left: 7px;
            }
            .eye.blink { animation: blink 0.15s ease-in-out; }
            @keyframes blink {
                0%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(0.1); }
            }
            [data-theme="dark"] .eye {
                background: radial-gradient(circle at 35% 35%, #f0f0f0, #d0d0d0);
                box-shadow: 0 6px 24px rgba(0,0,0,0.4);
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

        let tX = 0, tY = 0, cX = 0, cY = 0;

        document.addEventListener('mousemove', e => {
            const dx = e.clientX - window.innerWidth / 2;
            const dy = e.clientY - window.innerHeight / 2;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            const r = Math.min(d / 300, 1);
            tX = (dx / d) * 15 * r;
            tY = (dy / d) * 15 * r;
        });

        function animEyes() {
            cX += (tX - cX) * 0.12;
            cY += (tY - cY) * 0.12;
            leftPupil.style.transform = `translate(${cX}px, ${cY}px)`;
            rightPupil.style.transform = `translate(${cX}px, ${cY}px)`;
            requestAnimationFrame(animEyes);
        }
        animEyes();

        function blink() {
            leftEye.classList.add('blink');
            rightEye.classList.add('blink');
            setTimeout(() => {
                leftEye.classList.remove('blink');
                rightEye.classList.remove('blink');
            }, 150);
            setTimeout(blink, 2500 + Math.random() * 4000);
        }
        setTimeout(blink, 2000);

        setTimeout(() => container.classList.add('visible'), 400);
    }

    // Start
    function start() {
        const success = init();
        
        // Only show eyes on role pages, not index
        const isIndex = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname === '/' ||
                       window.location.pathname.endsWith('/');
        if (!isIndex) {
            initEyes();
        }

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

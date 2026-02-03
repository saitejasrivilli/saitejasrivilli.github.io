// Fluid Simulation with Sentient Eyes
// WebGL-based fluid simulation with Navier-Stokes inspired physics

(function() {
    'use strict';

    // Configuration
    const config = {
        SIM_RESOLUTION: 128,
        DYE_RESOLUTION: 1024,
        DENSITY_DISSIPATION: 0.98,
        VELOCITY_DISSIPATION: 0.99,
        PRESSURE_ITERATIONS: 25,
        CURL: 30,
        SPLAT_RADIUS: 0.25,
        SPLAT_FORCE: 6000,
        SHADING: true,
        COLOR_UPDATE_SPEED: 10,
        BACK_COLOR: { r: 255, g: 255, b: 255 },
        TRANSPARENT: true,
        BLOOM: true,
        BLOOM_INTENSITY: 0.8,
        SUNRAYS: false
    };

    // Rich, vibrant pastel colors for the fluid
    const colors = [
        { r: 255, g: 105, b: 180 }, // Hot pink
        { r: 255, g: 182, b: 193 }, // Light pink
        { r: 238, g: 130, b: 238 }, // Violet
        { r: 186, g: 85, b: 211 },  // Medium orchid (purple)
        { r: 147, g: 112, b: 219 }, // Medium purple
        { r: 123, g: 104, b: 238 }, // Medium slate blue
        { r: 100, g: 149, b: 237 }, // Cornflower blue
        { r: 135, g: 206, b: 250 }, // Light sky blue
        { r: 64, g: 224, b: 208 },  // Turquoise
        { r: 127, g: 255, b: 212 }, // Aquamarine
        { r: 144, g: 238, b: 144 }, // Light green
        { r: 152, g: 251, b: 152 }, // Pale green
        { r: 255, g: 255, b: 150 }, // Light yellow
        { r: 255, g: 218, b: 185 }, // Peach
        { r: 255, g: 160, b: 122 }, // Light salmon
        { r: 255, g: 127, b: 80 },  // Coral
    ];

    let canvas, gl, ext;
    let pointers = [];
    let splatStack = [];
    let lastColorTime = 0;
    let colorIndex = 0;

    // WebGL programs
    let baseVertexShader, copyProgram, clearProgram, colorProgram, backgroundProgram;
    let displayProgram, displayBloomProgram, splatProgram, advectionProgram, divergenceProgram;
    let curlProgram, vorticityProgram, pressureProgram, gradientSubtractProgram;
    let bloomPrefilterProgram, bloomBlurProgram, bloomFinalProgram;

    // Framebuffers
    let dye, velocity, divergence, curl, pressure;
    let bloom;

    // Initialize fluid simulation
    function initFluid() {
        canvas = document.getElementById('fluid-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'fluid-canvas';
            canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
            document.body.insertBefore(canvas, document.body.firstChild);
        }

        resizeCanvas();

        const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };

        gl = canvas.getContext('webgl2', params);
        if (!gl) {
            gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
        }

        if (!gl) {
            console.log('WebGL not supported, using CSS fallback');
            return false;
        }

        ext = {
            formatRGBA: { internalFormat: gl.RGBA, format: gl.RGBA },
            formatRG: { internalFormat: gl.RGBA, format: gl.RGBA },
            formatR: { internalFormat: gl.RGBA, format: gl.RGBA },
            halfFloatTexType: gl.UNSIGNED_BYTE,
            supportLinearFiltering: gl.getExtension('OES_texture_float_linear')
        };

        if (gl.getExtension('OES_texture_float')) {
            ext.halfFloatTexType = gl.FLOAT;
        }

        initFramebuffers();
        initPrograms();

        // Add multiple pointers for richer interaction
        pointers.push({ id: -1, texcoordX: 0, texcoordY: 0, prevTexcoordX: 0, prevTexcoordY: 0, deltaX: 0, deltaY: 0, down: false, moved: false, color: generateColor() });

        // Event listeners
        canvas.style.pointerEvents = 'auto';
        
        document.addEventListener('mousemove', (e) => {
            const pointer = pointers[0];
            const posX = e.clientX / window.innerWidth;
            const posY = 1.0 - e.clientY / window.innerHeight;
            updatePointerMoveData(pointer, posX, posY);
        });

        document.addEventListener('mousedown', () => {
            pointers[0].down = true;
            pointers[0].color = generateColor();
        });

        document.addEventListener('mouseup', () => {
            pointers[0].down = false;
        });

        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touches = e.targetTouches;
            for (let i = 0; i < touches.length; i++) {
                const posX = touches[i].clientX / window.innerWidth;
                const posY = 1.0 - touches[i].clientY / window.innerHeight;
                if (pointers[0]) {
                    updatePointerMoveData(pointers[0], posX, posY);
                    pointers[0].down = true;
                    pointers[0].color = generateColor();
                }
            }
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touches = e.targetTouches;
            for (let i = 0; i < touches.length; i++) {
                const posX = touches[i].clientX / window.innerWidth;
                const posY = 1.0 - touches[i].clientY / window.innerHeight;
                if (pointers[0]) {
                    updatePointerMoveData(pointers[0], posX, posY);
                }
            }
        });

        canvas.addEventListener('touchend', () => {
            pointers[0].down = false;
        });

        // Initial splats to make it colorful from the start
        setTimeout(() => {
            multipleSplats(parseInt(Math.random() * 10) + 8);
        }, 100);

        // Start animation loop
        update();
        return true;
    }

    function multipleSplats(amount) {
        for (let i = 0; i < amount; i++) {
            const color = generateColor();
            const x = Math.random();
            const y = Math.random();
            const dx = 1000 * (Math.random() - 0.5);
            const dy = 1000 * (Math.random() - 0.5);
            splat(x, y, dx, dy, color);
        }
    }

    function resizeCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }
    }

    function initPrograms() {
        const baseVertexShaderSource = `
            attribute vec2 aPosition;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;
            uniform vec2 texelSize;

            void main () {
                vUv = aPosition * 0.5 + 0.5;
                vL = vUv - vec2(texelSize.x, 0.0);
                vR = vUv + vec2(texelSize.x, 0.0);
                vT = vUv + vec2(0.0, texelSize.y);
                vB = vUv - vec2(0.0, texelSize.y);
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `;

        const copyShaderSource = `
            precision mediump float;
            uniform sampler2D uTexture;
            varying vec2 vUv;
            void main () {
                gl_FragColor = texture2D(uTexture, vUv);
            }
        `;

        const clearShaderSource = `
            precision mediump float;
            uniform sampler2D uTexture;
            uniform float value;
            varying vec2 vUv;
            void main () {
                gl_FragColor = value * texture2D(uTexture, vUv);
            }
        `;

        const splatShaderSource = `
            precision highp float;
            uniform sampler2D uTarget;
            uniform float aspectRatio;
            uniform vec3 color;
            uniform vec2 point;
            uniform float radius;
            varying vec2 vUv;

            void main () {
                vec2 p = vUv - point.xy;
                p.x *= aspectRatio;
                vec3 splat = exp(-dot(p, p) / radius) * color;
                vec3 base = texture2D(uTarget, vUv).xyz;
                gl_FragColor = vec4(base + splat, 1.0);
            }
        `;

        const advectionShaderSource = `
            precision highp float;
            uniform sampler2D uVelocity;
            uniform sampler2D uSource;
            uniform vec2 texelSize;
            uniform float dt;
            uniform float dissipation;
            varying vec2 vUv;

            void main () {
                vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                vec4 result = dissipation * texture2D(uSource, coord);
                gl_FragColor = result;
            }
        `;

        const divergenceShaderSource = `
            precision mediump float;
            uniform sampler2D uVelocity;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;

            void main () {
                float L = texture2D(uVelocity, vL).x;
                float R = texture2D(uVelocity, vR).x;
                float T = texture2D(uVelocity, vT).y;
                float B = texture2D(uVelocity, vB).y;
                float div = 0.5 * (R - L + T - B);
                gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
            }
        `;

        const curlShaderSource = `
            precision mediump float;
            uniform sampler2D uVelocity;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;

            void main () {
                float L = texture2D(uVelocity, vL).y;
                float R = texture2D(uVelocity, vR).y;
                float T = texture2D(uVelocity, vT).x;
                float B = texture2D(uVelocity, vB).x;
                float vorticity = R - L - T + B;
                gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
            }
        `;

        const vorticityShaderSource = `
            precision highp float;
            uniform sampler2D uVelocity;
            uniform sampler2D uCurl;
            uniform float curl;
            uniform float dt;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;

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
                gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
            }
        `;

        const pressureShaderSource = `
            precision mediump float;
            uniform sampler2D uPressure;
            uniform sampler2D uDivergence;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;

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
        `;

        const gradientSubtractShaderSource = `
            precision mediump float;
            uniform sampler2D uPressure;
            uniform sampler2D uVelocity;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;

            void main () {
                float L = texture2D(uPressure, vL).x;
                float R = texture2D(uPressure, vR).x;
                float T = texture2D(uPressure, vT).x;
                float B = texture2D(uPressure, vB).x;
                vec2 velocity = texture2D(uVelocity, vUv).xy;
                velocity.xy -= vec2(R - L, T - B);
                gl_FragColor = vec4(velocity, 0.0, 1.0);
            }
        `;

        const displayShaderSource = `
            precision highp float;
            uniform sampler2D uTexture;
            uniform float uBrightness;
            varying vec2 vUv;

            void main () {
                vec3 c = texture2D(uTexture, vUv).rgb;
                c = pow(c, vec3(0.85)); // Gamma correction for vibrancy
                c *= uBrightness;
                float a = max(c.r, max(c.g, c.b));
                gl_FragColor = vec4(c, a * 0.9);
            }
        `;

        const bloomPrefilterShaderSource = `
            precision mediump float;
            uniform sampler2D uTexture;
            uniform vec3 curve;
            uniform float threshold;
            varying vec2 vUv;

            void main () {
                vec3 c = texture2D(uTexture, vUv).rgb;
                float br = max(c.r, max(c.g, c.b));
                float rq = clamp(br - curve.x, 0.0, curve.y);
                rq = curve.z * rq * rq;
                c *= max(rq, br - threshold) / max(br, 0.0001);
                gl_FragColor = vec4(c, 0.0);
            }
        `;

        const bloomBlurShaderSource = `
            precision mediump float;
            uniform sampler2D uTexture;
            uniform vec2 texelSize;
            uniform vec2 direction;
            varying vec2 vUv;

            void main () {
                vec4 color = vec4(0.0);
                vec2 off1 = vec2(1.3846153846) * direction;
                vec2 off2 = vec2(3.2307692308) * direction;
                color += texture2D(uTexture, vUv) * 0.2270270270;
                color += texture2D(uTexture, vUv + (off1 * texelSize)) * 0.3162162162;
                color += texture2D(uTexture, vUv - (off1 * texelSize)) * 0.3162162162;
                color += texture2D(uTexture, vUv + (off2 * texelSize)) * 0.0702702703;
                color += texture2D(uTexture, vUv - (off2 * texelSize)) * 0.0702702703;
                gl_FragColor = color;
            }
        `;

        const bloomFinalShaderSource = `
            precision mediump float;
            uniform sampler2D uTexture;
            uniform sampler2D uBloom;
            uniform float intensity;
            varying vec2 vUv;

            void main () {
                vec4 color = texture2D(uTexture, vUv);
                vec4 bloom = texture2D(uBloom, vUv);
                color.rgb += bloom.rgb * intensity;
                gl_FragColor = color;
            }
        `;

        baseVertexShader = compileShader(gl.VERTEX_SHADER, baseVertexShaderSource);
        copyProgram = createProgram(copyShaderSource);
        clearProgram = createProgram(clearShaderSource);
        splatProgram = createProgram(splatShaderSource);
        advectionProgram = createProgram(advectionShaderSource);
        divergenceProgram = createProgram(divergenceShaderSource);
        curlProgram = createProgram(curlShaderSource);
        vorticityProgram = createProgram(vorticityShaderSource);
        pressureProgram = createProgram(pressureShaderSource);
        gradientSubtractProgram = createProgram(gradientSubtractShaderSource);
        displayProgram = createProgram(displayShaderSource);
        bloomPrefilterProgram = createProgram(bloomPrefilterShaderSource);
        bloomBlurProgram = createProgram(bloomBlurShaderSource);
        bloomFinalProgram = createProgram(bloomFinalShaderSource);

        // Create vertex buffer
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

    function createProgram(fragmentSource) {
        const program = gl.createProgram();
        gl.attachShader(program, baseVertexShader);
        gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentSource));
        gl.linkProgram(program);

        return {
            program,
            uniforms: getUniforms(program)
        };
    }

    function getUniforms(program) {
        const uniforms = {};
        const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            const uniformName = gl.getActiveUniform(program, i).name;
            uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
        }
        return uniforms;
    }

    function initFramebuffers() {
        const simRes = getResolution(config.SIM_RESOLUTION);
        const dyeRes = getResolution(config.DYE_RESOLUTION);

        dye = createDoubleFBO(dyeRes.width, dyeRes.height, ext.formatRGBA.internalFormat, ext.formatRGBA.format, ext.halfFloatTexType, gl.LINEAR);
        velocity = createDoubleFBO(simRes.width, simRes.height, ext.formatRG.internalFormat, ext.formatRG.format, ext.halfFloatTexType, gl.LINEAR);
        divergence = createFBO(simRes.width, simRes.height, ext.formatR.internalFormat, ext.formatR.format, ext.halfFloatTexType, gl.NEAREST);
        curl = createFBO(simRes.width, simRes.height, ext.formatR.internalFormat, ext.formatR.format, ext.halfFloatTexType, gl.NEAREST);
        pressure = createDoubleFBO(simRes.width, simRes.height, ext.formatR.internalFormat, ext.formatR.format, ext.halfFloatTexType, gl.NEAREST);

        // Bloom framebuffers
        const bloomRes = getResolution(256);
        bloom = createFBO(bloomRes.width, bloomRes.height, ext.formatRGBA.internalFormat, ext.formatRGBA.format, ext.halfFloatTexType, gl.LINEAR);
    }

    function getResolution(resolution) {
        let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
        if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
        const min = Math.round(resolution);
        const max = Math.round(resolution * aspectRatio);
        return gl.drawingBufferWidth > gl.drawingBufferHeight ? { width: max, height: min } : { width: min, height: max };
    }

    function createFBO(w, h, internalFormat, format, type, filter) {
        gl.activeTexture(gl.TEXTURE0);
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

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

    function createDoubleFBO(w, h, internalFormat, format, type, filter) {
        let fbo1 = createFBO(w, h, internalFormat, format, type, filter);
        let fbo2 = createFBO(w, h, internalFormat, format, type, filter);

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
                const temp = fbo1;
                fbo1 = fbo2;
                fbo2 = temp;
            }
        };
    }

    function updatePointerMoveData(pointer, posX, posY) {
        pointer.prevTexcoordX = pointer.texcoordX;
        pointer.prevTexcoordY = pointer.texcoordY;
        pointer.texcoordX = posX;
        pointer.texcoordY = posY;
        pointer.deltaX = correctDeltaX(posX - pointer.prevTexcoordX);
        pointer.deltaY = correctDeltaY(posY - pointer.prevTexcoordY);
        pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    }

    function correctDeltaX(delta) {
        const aspectRatio = canvas.width / canvas.height;
        return aspectRatio < 1 ? delta * aspectRatio : delta;
    }

    function correctDeltaY(delta) {
        const aspectRatio = canvas.width / canvas.height;
        return aspectRatio > 1 ? delta / aspectRatio : delta;
    }

    function generateColor() {
        // Cycle through colors with some randomness
        colorIndex = (colorIndex + 1 + Math.floor(Math.random() * 3)) % colors.length;
        const c = colors[colorIndex];
        
        // Add slight variation
        const variation = 20;
        return [
            Math.min(255, Math.max(0, c.r + (Math.random() - 0.5) * variation)) / 255,
            Math.min(255, Math.max(0, c.g + (Math.random() - 0.5) * variation)) / 255,
            Math.min(255, Math.max(0, c.b + (Math.random() - 0.5) * variation)) / 255
        ];
    }

    function HSVtoRGB(h, s, v) {
        let r, g, b;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }

        return [r, g, b];
    }

    let lastTime = Date.now();
    
    function update() {
        const now = Date.now();
        const dt = Math.min((now - lastTime) / 1000, 0.016);
        lastTime = now;

        resizeCanvas();
        
        if (!gl) {
            requestAnimationFrame(update);
            return;
        }

        gl.disable(gl.BLEND);
        gl.viewport(0, 0, velocity.width, velocity.height);

        // Curl
        gl.useProgram(curlProgram.program);
        gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
        blit(curl.fbo);

        // Vorticity
        gl.useProgram(vorticityProgram.program);
        gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
        gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
        gl.uniform1f(vorticityProgram.uniforms.dt, dt);
        blit(velocity.write.fbo);
        velocity.swap();

        // Divergence
        gl.useProgram(divergenceProgram.program);
        gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
        blit(divergence.fbo);

        // Clear pressure
        gl.useProgram(clearProgram.program);
        gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
        gl.uniform1f(clearProgram.uniforms.value, 0.8);
        blit(pressure.write.fbo);
        pressure.swap();

        // Pressure iterations
        gl.useProgram(pressureProgram.program);
        gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
        for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
            gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
            blit(pressure.write.fbo);
            pressure.swap();
        }

        // Gradient subtract
        gl.useProgram(gradientSubtractProgram.program);
        gl.uniform2f(gradientSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(gradientSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
        gl.uniform1i(gradientSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
        blit(velocity.write.fbo);
        velocity.swap();

        // Advect velocity
        gl.viewport(0, 0, velocity.width, velocity.height);
        gl.useProgram(advectionProgram.program);
        gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(advectionProgram.uniforms.uSource, velocity.read.attach(0));
        gl.uniform1f(advectionProgram.uniforms.dt, dt);
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
        blit(velocity.write.fbo);
        velocity.swap();

        // Advect dye
        gl.viewport(0, 0, dye.width, dye.height);
        gl.uniform2f(advectionProgram.uniforms.texelSize, dye.texelSizeX, dye.texelSizeY);
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
        blit(dye.write.fbo);
        dye.swap();

        // Handle pointer input - always create splats when moving
        for (let i = 0; i < pointers.length; i++) {
            const p = pointers[i];
            if (p.moved) {
                p.moved = false;
                // Change color periodically
                if (now - lastColorTime > 100) {
                    p.color = generateColor();
                    lastColorTime = now;
                }
                splat(p.texcoordX, p.texcoordY, p.deltaX, p.deltaY, p.color);
            }
        }

        // Random splats for ambient movement
        if (Math.random() < 0.03) {
            const color = generateColor();
            const x = Math.random();
            const y = Math.random();
            const dx = 1000 * (Math.random() - 0.5);
            const dy = 1000 * (Math.random() - 0.5);
            splat(x, y, dx * 0.001, dy * 0.001, color);
        }

        // Render to screen
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(displayProgram.program);
        gl.uniform1i(displayProgram.uniforms.uTexture, dye.read.attach(0));
        gl.uniform1f(displayProgram.uniforms.uBrightness, 1.2);
        blit(null);

        requestAnimationFrame(update);
    }

    function splat(x, y, dx, dy, color) {
        gl.viewport(0, 0, velocity.width, velocity.height);
        gl.useProgram(splatProgram.program);
        gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
        gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
        gl.uniform2f(splatProgram.uniforms.point, x, y);
        gl.uniform3f(splatProgram.uniforms.color, dx * config.SPLAT_FORCE, dy * config.SPLAT_FORCE, 0);
        gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100.0));
        blit(velocity.write.fbo);
        velocity.swap();

        gl.viewport(0, 0, dye.width, dye.height);
        gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
        gl.uniform3f(splatProgram.uniforms.color, color[0], color[1], color[2]);
        blit(dye.write.fbo);
        dye.swap();
    }

    function correctRadius(radius) {
        const aspectRatio = canvas.width / canvas.height;
        return aspectRatio > 1 ? radius * aspectRatio : radius;
    }

    function blit(destination) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, destination);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    // Initialize eyes
    function initEyes() {
        const eyesContainer = document.createElement('div');
        eyesContainer.id = 'sentient-eyes';
        eyesContainer.innerHTML = `
            <div class="eye left-eye">
                <div class="pupil">
                    <div class="glint"></div>
                </div>
            </div>
            <div class="eye right-eye">
                <div class="pupil">
                    <div class="glint"></div>
                </div>
            </div>
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
                transition: opacity 0.5s ease;
            }
            #sentient-eyes.visible {
                opacity: 1;
            }
            .eye {
                width: 80px;
                height: 80px;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 
                    0 4px 20px rgba(0,0,0,0.1),
                    inset 0 -3px 10px rgba(0,0,0,0.05);
                position: relative;
                animation: eyeFloat 3s ease-in-out infinite;
            }
            .left-eye {
                animation-delay: 0s;
            }
            .right-eye {
                animation-delay: 0.3s;
            }
            @keyframes eyeFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }
            .pupil {
                width: 40px;
                height: 40px;
                background: radial-gradient(circle at 30% 30%, #4a4a4a, #1a1a1a);
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
                top: 6px;
                left: 6px;
            }
            @keyframes blink {
                0%, 45%, 55%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(0.05); }
            }
            .eye.blinking {
                animation: blink 0.15s ease-in-out;
            }
            [data-theme="dark"] .eye {
                background: #e2e8f0;
                box-shadow: 
                    0 4px 20px rgba(0,0,0,0.3),
                    inset 0 -3px 10px rgba(0,0,0,0.1);
            }
            [data-theme="dark"] .pupil {
                background: radial-gradient(circle at 30% 30%, #2a2a2a, #0a0a0a);
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(eyesContainer);
        
        // Eye tracking
        const leftPupil = eyesContainer.querySelector('.left-eye .pupil');
        const rightPupil = eyesContainer.querySelector('.right-eye .pupil');
        const leftEye = eyesContainer.querySelector('.left-eye');
        const rightEye = eyesContainer.querySelector('.right-eye');
        
        document.addEventListener('mousemove', (e) => {
            const eyesCenterX = window.innerWidth / 2;
            const eyesCenterY = window.innerHeight / 2;
            
            const dx = e.clientX - eyesCenterX;
            const dy = e.clientY - eyesCenterY;
            
            const maxOffset = 15;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const clampedDistance = Math.min(distance, 300);
            const ratio = clampedDistance / 300;
            
            const offsetX = (dx / distance) * maxOffset * ratio || 0;
            const offsetY = (dy / distance) * maxOffset * ratio || 0;
            
            leftPupil.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            rightPupil.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        });
        
        // Random blinking
        function blink() {
            leftEye.classList.add('blinking');
            rightEye.classList.add('blinking');
            setTimeout(() => {
                leftEye.classList.remove('blinking');
                rightEye.classList.remove('blinking');
            }, 150);
        }
        
        function scheduleNextBlink() {
            const delay = 2000 + Math.random() * 4000;
            setTimeout(() => {
                blink();
                scheduleNextBlink();
            }, delay);
        }
        
        scheduleNextBlink();
        
        // Show eyes after a short delay
        setTimeout(() => {
            eyesContainer.classList.add('visible');
        }, 500);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const fluidOk = initFluid();
            initEyes();
            
            // Remove old gradient blobs if fluid is working
            if (fluidOk) {
                const oldGradient = document.querySelector('.mouse-gradient');
                if (oldGradient) {
                    oldGradient.style.display = 'none';
                }
            }
        });
    } else {
        const fluidOk = initFluid();
        initEyes();
        
        if (fluidOk) {
            const oldGradient = document.querySelector('.mouse-gradient');
            if (oldGradient) {
                oldGradient.style.display = 'none';
            }
        }
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        if (gl) {
            resizeCanvas();
            initFramebuffers();
        }
    });
})();


    let canvas, gl, ext;
    let pointers = [];
    let splatStack = [];

    // WebGL programs
    let baseVertexShader, copyProgram, clearProgram, colorProgram, backgroundProgram;
    let displayProgram, splatProgram, advectionProgram, divergenceProgram;
    let curlProgram, vorticityProgram, pressureProgram, gradientSubtractProgram;

    // Framebuffers
    let dye, velocity, divergence, curl, pressure;

    // Initialize fluid simulation
    function initFluid() {
        canvas = document.getElementById('fluid-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'fluid-canvas';
            canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
            document.body.insertBefore(canvas, document.body.firstChild);
        }

        resizeCanvas();

        const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };

        gl = canvas.getContext('webgl2', params);
        if (!gl) {
            gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
        }

        if (!gl) {
            console.log('WebGL not supported, using CSS fallback');
            return false;
        }

        ext = {
            formatRGBA: { internalFormat: gl.RGBA, format: gl.RGBA },
            formatRG: { internalFormat: gl.RGBA, format: gl.RGBA },
            formatR: { internalFormat: gl.RGBA, format: gl.RGBA },
            halfFloatTexType: gl.UNSIGNED_BYTE,
            supportLinearFiltering: gl.getExtension('OES_texture_float_linear')
        };

        if (gl.getExtension('OES_texture_float')) {
            ext.halfFloatTexType = gl.FLOAT;
        }

        initFramebuffers();
        initPrograms();

        // Add pointer for mouse tracking
        pointers.push({ id: -1, texcoordX: 0, texcoordY: 0, prevTexcoordX: 0, prevTexcoordY: 0, deltaX: 0, deltaY: 0, down: false, moved: false, color: [0, 0, 0] });

        // Event listeners
        canvas.style.pointerEvents = 'auto';
        
        document.addEventListener('mousemove', (e) => {
            const pointer = pointers[0];
            const posX = e.clientX / window.innerWidth;
            const posY = 1.0 - e.clientY / window.innerHeight;
            updatePointerMoveData(pointer, posX, posY);
        });

        document.addEventListener('mousedown', () => {
            pointers[0].down = true;
            pointers[0].color = generateColor();
        });

        document.addEventListener('mouseup', () => {
            pointers[0].down = false;
        });

        // Start animation loop
        update();
        return true;
    }

    function resizeCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }
    }

    function initPrograms() {
        // Simplified shader programs for fluid simulation
        const baseVertexShaderSource = `
            attribute vec2 aPosition;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;
            uniform vec2 texelSize;

            void main () {
                vUv = aPosition * 0.5 + 0.5;
                vL = vUv - vec2(texelSize.x, 0.0);
                vR = vUv + vec2(texelSize.x, 0.0);
                vT = vUv + vec2(0.0, texelSize.y);
                vB = vUv - vec2(0.0, texelSize.y);
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `;

        const copyShaderSource = `
            precision mediump float;
            uniform sampler2D uTexture;
            varying vec2 vUv;
            void main () {
                gl_FragColor = texture2D(uTexture, vUv);
            }
        `;

        const clearShaderSource = `
            precision mediump float;
            uniform sampler2D uTexture;
            uniform float value;
            varying vec2 vUv;
            void main () {
                gl_FragColor = value * texture2D(uTexture, vUv);
            }
        `;

        const splatShaderSource = `
            precision highp float;
            uniform sampler2D uTarget;
            uniform float aspectRatio;
            uniform vec3 color;
            uniform vec2 point;
            uniform float radius;
            varying vec2 vUv;

            void main () {
                vec2 p = vUv - point.xy;
                p.x *= aspectRatio;
                vec3 splat = exp(-dot(p, p) / radius) * color;
                vec3 base = texture2D(uTarget, vUv).xyz;
                gl_FragColor = vec4(base + splat, 1.0);
            }
        `;

        const advectionShaderSource = `
            precision highp float;
            uniform sampler2D uVelocity;
            uniform sampler2D uSource;
            uniform vec2 texelSize;
            uniform float dt;
            uniform float dissipation;
            varying vec2 vUv;

            void main () {
                vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                gl_FragColor = dissipation * texture2D(uSource, coord);
            }
        `;

        const divergenceShaderSource = `
            precision mediump float;
            uniform sampler2D uVelocity;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;

            void main () {
                float L = texture2D(uVelocity, vL).x;
                float R = texture2D(uVelocity, vR).x;
                float T = texture2D(uVelocity, vT).y;
                float B = texture2D(uVelocity, vB).y;
                float div = 0.5 * (R - L + T - B);
                gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
            }
        `;

        const curlShaderSource = `
            precision mediump float;
            uniform sampler2D uVelocity;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;

            void main () {
                float L = texture2D(uVelocity, vL).y;
                float R = texture2D(uVelocity, vR).y;
                float T = texture2D(uVelocity, vT).x;
                float B = texture2D(uVelocity, vB).x;
                float vorticity = R - L - T + B;
                gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
            }
        `;

        const vorticityShaderSource = `
            precision highp float;
            uniform sampler2D uVelocity;
            uniform sampler2D uCurl;
            uniform float curl;
            uniform float dt;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;

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
                gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
            }
        `;

        const pressureShaderSource = `
            precision mediump float;
            uniform sampler2D uPressure;
            uniform sampler2D uDivergence;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;

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
        `;

        const gradientSubtractShaderSource = `
            precision mediump float;
            uniform sampler2D uPressure;
            uniform sampler2D uVelocity;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;

            void main () {
                float L = texture2D(uPressure, vL).x;
                float R = texture2D(uPressure, vR).x;
                float T = texture2D(uPressure, vT).x;
                float B = texture2D(uPressure, vB).x;
                vec2 velocity = texture2D(uVelocity, vUv).xy;
                velocity.xy -= vec2(R - L, T - B);
                gl_FragColor = vec4(velocity, 0.0, 1.0);
            }
        `;

        const displayShaderSource = `
            precision highp float;
            uniform sampler2D uTexture;
            varying vec2 vUv;

            void main () {
                vec3 c = texture2D(uTexture, vUv).rgb;
                float a = max(c.r, max(c.g, c.b));
                gl_FragColor = vec4(c, a * 0.8);
            }
        `;

        baseVertexShader = compileShader(gl.VERTEX_SHADER, baseVertexShaderSource);
        copyProgram = createProgram(copyShaderSource);
        clearProgram = createProgram(clearShaderSource);
        splatProgram = createProgram(splatShaderSource);
        advectionProgram = createProgram(advectionShaderSource);
        divergenceProgram = createProgram(divergenceShaderSource);
        curlProgram = createProgram(curlShaderSource);
        vorticityProgram = createProgram(vorticityShaderSource);
        pressureProgram = createProgram(pressureShaderSource);
        gradientSubtractProgram = createProgram(gradientSubtractShaderSource);
        displayProgram = createProgram(displayShaderSource);

        // Create vertex buffer
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

    function createProgram(fragmentSource) {
        const program = gl.createProgram();
        gl.attachShader(program, baseVertexShader);
        gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentSource));
        gl.linkProgram(program);

        return {
            program,
            uniforms: getUniforms(program)
        };
    }

    function getUniforms(program) {
        const uniforms = {};
        const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            const uniformName = gl.getActiveUniform(program, i).name;
            uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
        }
        return uniforms;
    }

    function initFramebuffers() {
        const simRes = getResolution(config.SIM_RESOLUTION);
        const dyeRes = getResolution(config.DYE_RESOLUTION);

        dye = createDoubleFBO(dyeRes.width, dyeRes.height, ext.formatRGBA.internalFormat, ext.formatRGBA.format, ext.halfFloatTexType, gl.LINEAR);
        velocity = createDoubleFBO(simRes.width, simRes.height, ext.formatRG.internalFormat, ext.formatRG.format, ext.halfFloatTexType, gl.LINEAR);
        divergence = createFBO(simRes.width, simRes.height, ext.formatR.internalFormat, ext.formatR.format, ext.halfFloatTexType, gl.NEAREST);
        curl = createFBO(simRes.width, simRes.height, ext.formatR.internalFormat, ext.formatR.format, ext.halfFloatTexType, gl.NEAREST);
        pressure = createDoubleFBO(simRes.width, simRes.height, ext.formatR.internalFormat, ext.formatR.format, ext.halfFloatTexType, gl.NEAREST);
    }

    function getResolution(resolution) {
        let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
        if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
        const min = Math.round(resolution);
        const max = Math.round(resolution * aspectRatio);
        return gl.drawingBufferWidth > gl.drawingBufferHeight ? { width: max, height: min } : { width: min, height: max };
    }

    function createFBO(w, h, internalFormat, format, type, filter) {
        gl.activeTexture(gl.TEXTURE0);
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

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

    function createDoubleFBO(w, h, internalFormat, format, type, filter) {
        let fbo1 = createFBO(w, h, internalFormat, format, type, filter);
        let fbo2 = createFBO(w, h, internalFormat, format, type, filter);

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
                const temp = fbo1;
                fbo1 = fbo2;
                fbo2 = temp;
            }
        };
    }

    function updatePointerMoveData(pointer, posX, posY) {
        pointer.prevTexcoordX = pointer.texcoordX;
        pointer.prevTexcoordY = pointer.texcoordY;
        pointer.texcoordX = posX;
        pointer.texcoordY = posY;
        pointer.deltaX = correctDeltaX(posX - pointer.prevTexcoordX);
        pointer.deltaY = correctDeltaY(posY - pointer.prevTexcoordY);
        pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    }

    function correctDeltaX(delta) {
        const aspectRatio = canvas.width / canvas.height;
        return aspectRatio < 1 ? delta * aspectRatio : delta;
    }

    function correctDeltaY(delta) {
        const aspectRatio = canvas.width / canvas.height;
        return aspectRatio > 1 ? delta / aspectRatio : delta;
    }

    function generateColor() {
        const c = colors[Math.floor(Math.random() * colors.length)];
        return [c.r / 255, c.g / 255, c.b / 255];
    }

    function update() {
        resizeCanvas();
        const dt = Math.min(1 / 60, 0.016);
        
        if (!gl) {
            requestAnimationFrame(update);
            return;
        }

        gl.disable(gl.BLEND);
        gl.viewport(0, 0, velocity.width, velocity.height);

        // Curl
        gl.useProgram(curlProgram.program);
        gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
        blit(curl.fbo);

        // Vorticity
        gl.useProgram(vorticityProgram.program);
        gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
        gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
        gl.uniform1f(vorticityProgram.uniforms.dt, dt);
        blit(velocity.write.fbo);
        velocity.swap();

        // Divergence
        gl.useProgram(divergenceProgram.program);
        gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
        blit(divergence.fbo);

        // Clear pressure
        gl.useProgram(clearProgram.program);
        gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
        gl.uniform1f(clearProgram.uniforms.value, 0.8);
        blit(pressure.write.fbo);
        pressure.swap();

        // Pressure iterations
        gl.useProgram(pressureProgram.program);
        gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
        for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
            gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
            blit(pressure.write.fbo);
            pressure.swap();
        }

        // Gradient subtract
        gl.useProgram(gradientSubtractProgram.program);
        gl.uniform2f(gradientSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(gradientSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
        gl.uniform1i(gradientSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
        blit(velocity.write.fbo);
        velocity.swap();

        // Advect velocity
        gl.viewport(0, 0, velocity.width, velocity.height);
        gl.useProgram(advectionProgram.program);
        gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(advectionProgram.uniforms.uSource, velocity.read.attach(0));
        gl.uniform1f(advectionProgram.uniforms.dt, dt);
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
        blit(velocity.write.fbo);
        velocity.swap();

        // Advect dye
        gl.viewport(0, 0, dye.width, dye.height);
        gl.uniform2f(advectionProgram.uniforms.texelSize, dye.texelSizeX, dye.texelSizeY);
        gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
        gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
        gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
        blit(dye.write.fbo);
        dye.swap();

        // Handle pointer input
        for (let i = 0; i < pointers.length; i++) {
            const p = pointers[i];
            if (p.moved) {
                p.moved = false;
                splat(p.texcoordX, p.texcoordY, p.deltaX, p.deltaY, p.color);
            }
        }

        // Random splats
        if (Math.random() < 0.01) {
            const color = generateColor();
            const x = Math.random();
            const y = Math.random();
            const dx = (Math.random() - 0.5) * 0.01;
            const dy = (Math.random() - 0.5) * 0.01;
            splat(x, y, dx, dy, color);
        }

        // Render to screen
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(displayProgram.program);
        gl.uniform1i(displayProgram.uniforms.uTexture, dye.read.attach(0));
        blit(null);

        requestAnimationFrame(update);
    }

    function splat(x, y, dx, dy, color) {
        gl.viewport(0, 0, velocity.width, velocity.height);
        gl.useProgram(splatProgram.program);
        gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
        gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
        gl.uniform2f(splatProgram.uniforms.point, x, y);
        gl.uniform3f(splatProgram.uniforms.color, dx * config.SPLAT_FORCE, dy * config.SPLAT_FORCE, 0);
        gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100.0));
        blit(velocity.write.fbo);
        velocity.swap();

        gl.viewport(0, 0, dye.width, dye.height);
        gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
        gl.uniform3f(splatProgram.uniforms.color, color[0], color[1], color[2]);
        blit(dye.write.fbo);
        dye.swap();
    }

    function correctRadius(radius) {
        const aspectRatio = canvas.width / canvas.height;
        return aspectRatio > 1 ? radius * aspectRatio : radius;
    }

    function blit(destination) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, destination);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    // Initialize eyes
    function initEyes() {
        const eyesContainer = document.createElement('div');
        eyesContainer.id = 'sentient-eyes';
        eyesContainer.innerHTML = `
            <div class="eye left-eye">
                <div class="pupil">
                    <div class="glint"></div>
                </div>
            </div>
            <div class="eye right-eye">
                <div class="pupil">
                    <div class="glint"></div>
                </div>
            </div>
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
                transition: opacity 0.5s ease;
            }
            #sentient-eyes.visible {
                opacity: 1;
            }
            .eye {
                width: 80px;
                height: 80px;
                background: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 
                    0 4px 20px rgba(0,0,0,0.1),
                    inset 0 -3px 10px rgba(0,0,0,0.05);
                position: relative;
                animation: eyeFloat 3s ease-in-out infinite;
            }
            .left-eye {
                animation-delay: 0s;
            }
            .right-eye {
                animation-delay: 0.3s;
            }
            @keyframes eyeFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
            }
            .pupil {
                width: 40px;
                height: 40px;
                background: radial-gradient(circle at 30% 30%, #4a4a4a, #1a1a1a);
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
                top: 6px;
                left: 6px;
            }
            @keyframes blink {
                0%, 45%, 55%, 100% { transform: scaleY(1); }
                50% { transform: scaleY(0.05); }
            }
            .eye.blinking {
                animation: blink 0.15s ease-in-out;
            }
            [data-theme="dark"] .eye {
                background: #e2e8f0;
                box-shadow: 
                    0 4px 20px rgba(0,0,0,0.3),
                    inset 0 -3px 10px rgba(0,0,0,0.1);
            }
            [data-theme="dark"] .pupil {
                background: radial-gradient(circle at 30% 30%, #2a2a2a, #0a0a0a);
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(eyesContainer);
        
        // Eye tracking
        const leftPupil = eyesContainer.querySelector('.left-eye .pupil');
        const rightPupil = eyesContainer.querySelector('.right-eye .pupil');
        const leftEye = eyesContainer.querySelector('.left-eye');
        const rightEye = eyesContainer.querySelector('.right-eye');
        
        document.addEventListener('mousemove', (e) => {
            const eyesCenterX = window.innerWidth / 2;
            const eyesCenterY = window.innerHeight / 2;
            
            const dx = e.clientX - eyesCenterX;
            const dy = e.clientY - eyesCenterY;
            
            const maxOffset = 15;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const clampedDistance = Math.min(distance, 300);
            const ratio = clampedDistance / 300;
            
            const offsetX = (dx / distance) * maxOffset * ratio || 0;
            const offsetY = (dy / distance) * maxOffset * ratio || 0;
            
            leftPupil.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
            rightPupil.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        });
        
        // Random blinking
        function blink() {
            leftEye.classList.add('blinking');
            rightEye.classList.add('blinking');
            setTimeout(() => {
                leftEye.classList.remove('blinking');
                rightEye.classList.remove('blinking');
            }, 150);
        }
        
        function scheduleNextBlink() {
            const delay = 2000 + Math.random() * 4000;
            setTimeout(() => {
                blink();
                scheduleNextBlink();
            }, delay);
        }
        
        scheduleNextBlink();
        
        // Show eyes after a short delay
        setTimeout(() => {
            eyesContainer.classList.add('visible');
        }, 500);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const fluidOk = initFluid();
            initEyes();
            
            // Remove old gradient blobs if fluid is working
            if (fluidOk) {
                const oldGradient = document.querySelector('.mouse-gradient');
                if (oldGradient) {
                    oldGradient.style.display = 'none';
                }
            }
        });
    } else {
        const fluidOk = initFluid();
        initEyes();
        
        if (fluidOk) {
            const oldGradient = document.querySelector('.mouse-gradient');
            if (oldGradient) {
                oldGradient.style.display = 'none';
            }
        }
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        if (gl) {
            resizeCanvas();
            initFramebuffers();
        }
    });
})();

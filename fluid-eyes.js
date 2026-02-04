// Bright Swirling Fluid Simulation - Localized around mouse
// Beautiful colorful effect that follows cursor

(function() {
    'use strict';

    class FluidSimulation {
        constructor() {
            this.canvas = null;
            this.gl = null;
            this.programs = {};
            this.framebuffers = {};
            this.config = {
                SIM_RESOLUTION: 128,
                DYE_RESOLUTION: 512,
                DENSITY_DISSIPATION: 0.97,
                VELOCITY_DISSIPATION: 0.98,
                PRESSURE_ITERATIONS: 20,
                CURL: 35,
                SPLAT_RADIUS: 0.003,
                SPLAT_FORCE: 6000
            };
            this.pointer = { x: 0.5, y: 0.5, dx: 0, dy: 0, moved: false };
            
            // Bright vibrant colors (like image 2)
            this.lightColors = [
                [1.0, 0.45, 0.55],  // Bright pink/coral
                [1.0, 0.55, 0.65],  // Salmon pink
                [0.95, 0.6, 0.5],   // Peach
                [0.4, 0.75, 0.95],  // Sky blue
                [0.45, 0.85, 0.9],  // Cyan
                [0.5, 0.9, 0.7],    // Mint/teal
                [0.55, 0.9, 0.55],  // Light green
                [0.85, 0.7, 0.95],  // Lavender
            ];
            
            // Even brighter for dark mode
            this.darkColors = [
                [1.0, 0.4, 0.6],    // Hot pink
                [1.0, 0.5, 0.4],    // Coral
                [0.3, 0.8, 1.0],    // Bright cyan
                [0.4, 0.9, 0.8],    // Turquoise
                [0.5, 1.0, 0.5],    // Bright green
                [0.9, 0.6, 1.0],    // Bright purple
                [1.0, 0.8, 0.3],    // Golden yellow
                [1.0, 0.6, 0.8],    // Pink
            ];
            
            this.colorIndex = 0;
            this.isDarkMode = false;
        }

        get splatColors() {
            return this.isDarkMode ? this.darkColors : this.lightColors;
        }

        checkDarkMode() {
            this.isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        }

        init() {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'fluid-canvas';
            this.canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
            document.body.insertBefore(this.canvas, document.body.firstChild);

            const gl = this.canvas.getContext('webgl', { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false });
            if (!gl) return false;
            this.gl = gl;

            gl.getExtension('OES_texture_float');
            gl.getExtension('OES_texture_float_linear');

            this.checkDarkMode();
            this.resize();
            this.initShaders();
            this.initFramebuffers();
            this.setupEvents();
            
            this.render();
            return true;
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        initShaders() {
            const gl = this.gl;

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

            // Display with brightness boost
            const displayFrag = `
                precision highp float;
                varying vec2 vUv;
                uniform sampler2D uTexture;
                uniform float uBrightness;
                void main() {
                    vec3 c = texture2D(uTexture, vUv).rgb;
                    // Boost saturation and brightness
                    c *= uBrightness;
                    c = pow(c, vec3(0.85));
                    float a = max(c.r, max(c.g, c.b));
                    a = smoothstep(0.0, 0.15, a);
                    gl_FragColor = vec4(c, a);
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
                    vec3 splat = exp(-dot(p, p) / radius) * color;
                    vec3 base = texture2D(uTarget, vUv).rgb;
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
                    gl_FragColor = dissipation * texture2D(uSource, coord);
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

            const gradSubtractFrag = `
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

            this.programs.display = this.createProgram(baseVert, displayFrag);
            this.programs.splat = this.createProgram(baseVert, splatFrag);
            this.programs.advection = this.createProgram(baseVert, advectionFrag);
            this.programs.divergence = this.createProgram(baseVert, divergenceFrag);
            this.programs.curl = this.createProgram(baseVert, curlFrag);
            this.programs.vorticity = this.createProgram(baseVert, vorticityFrag);
            this.programs.pressure = this.createProgram(baseVert, pressureFrag);
            this.programs.gradSubtract = this.createProgram(baseVert, gradSubtractFrag);
            this.programs.clear = this.createProgram(baseVert, clearFrag);

            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(0);
        }

        createProgram(vertSrc, fragSrc) {
            const gl = this.gl;
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
            const count = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < count; i++) {
                const name = gl.getActiveUniform(prog, i).name;
                uniforms[name] = gl.getUniformLocation(prog, name);
            }
            return { program: prog, uniforms };
        }

        initFramebuffers() {
            const gl = this.gl;
            const simW = this.config.SIM_RESOLUTION;
            const simH = this.config.SIM_RESOLUTION;
            const dyeW = this.config.DYE_RESOLUTION;
            const dyeH = this.config.DYE_RESOLUTION;

            this.velocity = this.createDoubleFBO(simW, simH);
            this.dye = this.createDoubleFBO(dyeW, dyeH);
            this.divergence = this.createFBO(simW, simH);
            this.curl = this.createFBO(simW, simH);
            this.pressure = this.createDoubleFBO(simW, simH);
        }

        createFBO(w, h) {
            const gl = this.gl;
            const tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.FLOAT, null);

            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

            return {
                fbo, texture: tex, width: w, height: h,
                texelSizeX: 1 / w, texelSizeY: 1 / h,
                attach: (id) => { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; }
            };
        }

        createDoubleFBO(w, h) {
            let fbo1 = this.createFBO(w, h);
            let fbo2 = this.createFBO(w, h);
            return {
                width: w, height: h,
                texelSizeX: 1 / w, texelSizeY: 1 / h,
                get read() { return fbo1; },
                get write() { return fbo2; },
                swap() { [fbo1, fbo2] = [fbo2, fbo1]; }
            };
        }

        setupEvents() {
            document.addEventListener('mousemove', (e) => {
                const x = e.clientX / window.innerWidth;
                const y = 1.0 - e.clientY / window.innerHeight;
                this.pointer.dx = (x - this.pointer.x) * 8;
                this.pointer.dy = (y - this.pointer.y) * 8;
                this.pointer.x = x;
                this.pointer.y = y;
                this.pointer.moved = Math.abs(this.pointer.dx) > 0.0001 || Math.abs(this.pointer.dy) > 0.0001;
            });

            // Touch support
            document.addEventListener('touchmove', (e) => {
                const touch = e.touches[0];
                const x = touch.clientX / window.innerWidth;
                const y = 1.0 - touch.clientY / window.innerHeight;
                this.pointer.dx = (x - this.pointer.x) * 8;
                this.pointer.dy = (y - this.pointer.y) * 8;
                this.pointer.x = x;
                this.pointer.y = y;
                this.pointer.moved = true;
            }, { passive: true });

            window.addEventListener('resize', () => {
                this.resize();
                this.initFramebuffers();
            });

            // Watch for theme changes
            const observer = new MutationObserver(() => this.checkDarkMode());
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        }

        splat(x, y, dx, dy, color) {
            const gl = this.gl;
            const prog = this.programs.splat;
            const intensity = this.isDarkMode ? 1.0 : 0.8;

            gl.viewport(0, 0, this.velocity.width, this.velocity.height);
            gl.useProgram(prog.program);
            gl.uniform1i(prog.uniforms.uTarget, this.velocity.read.attach(0));
            gl.uniform1f(prog.uniforms.aspectRatio, this.canvas.width / this.canvas.height);
            gl.uniform2f(prog.uniforms.point, x, y);
            gl.uniform3f(prog.uniforms.color, dx * this.config.SPLAT_FORCE, dy * this.config.SPLAT_FORCE, 0);
            gl.uniform1f(prog.uniforms.radius, this.config.SPLAT_RADIUS);
            this.blit(this.velocity.write.fbo);
            this.velocity.swap();

            gl.viewport(0, 0, this.dye.width, this.dye.height);
            gl.uniform1i(prog.uniforms.uTarget, this.dye.read.attach(0));
            gl.uniform3f(prog.uniforms.color, color[0] * intensity, color[1] * intensity, color[2] * intensity);
            this.blit(this.dye.write.fbo);
            this.dye.swap();
        }

        blit(target) {
            const gl = this.gl;
            gl.bindFramebuffer(gl.FRAMEBUFFER, target);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        }

        render() {
            const gl = this.gl;
            const dt = 0.016;

            this.checkDarkMode();

            // Create splats when mouse moves
            if (this.pointer.moved) {
                this.pointer.moved = false;
                // Multiple colors per movement for rich effect
                for (let i = 0; i < 3; i++) {
                    const color = this.splatColors[(this.colorIndex + i) % this.splatColors.length];
                    const offsetX = (Math.random() - 0.5) * 0.01;
                    const offsetY = (Math.random() - 0.5) * 0.01;
                    this.splat(
                        this.pointer.x + offsetX,
                        this.pointer.y + offsetY,
                        this.pointer.dx * (0.8 + Math.random() * 0.4),
                        this.pointer.dy * (0.8 + Math.random() * 0.4),
                        color
                    );
                }
                this.colorIndex = (this.colorIndex + 1) % this.splatColors.length;
            }

            // Simulation steps
            gl.viewport(0, 0, this.velocity.width, this.velocity.height);

            // Curl
            gl.useProgram(this.programs.curl.program);
            gl.uniform2f(this.programs.curl.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
            gl.uniform1i(this.programs.curl.uniforms.uVelocity, this.velocity.read.attach(0));
            this.blit(this.curl.fbo);

            // Vorticity
            gl.useProgram(this.programs.vorticity.program);
            gl.uniform2f(this.programs.vorticity.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
            gl.uniform1i(this.programs.vorticity.uniforms.uVelocity, this.velocity.read.attach(0));
            gl.uniform1i(this.programs.vorticity.uniforms.uCurl, this.curl.attach(1));
            gl.uniform1f(this.programs.vorticity.uniforms.curl, this.config.CURL);
            gl.uniform1f(this.programs.vorticity.uniforms.dt, dt);
            this.blit(this.velocity.write.fbo);
            this.velocity.swap();

            // Divergence
            gl.useProgram(this.programs.divergence.program);
            gl.uniform2f(this.programs.divergence.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
            gl.uniform1i(this.programs.divergence.uniforms.uVelocity, this.velocity.read.attach(0));
            this.blit(this.divergence.fbo);

            // Clear pressure
            gl.useProgram(this.programs.clear.program);
            gl.uniform1i(this.programs.clear.uniforms.uTexture, this.pressure.read.attach(0));
            gl.uniform1f(this.programs.clear.uniforms.value, 0.8);
            this.blit(this.pressure.write.fbo);
            this.pressure.swap();

            // Pressure solve
            gl.useProgram(this.programs.pressure.program);
            gl.uniform2f(this.programs.pressure.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
            gl.uniform1i(this.programs.pressure.uniforms.uDivergence, this.divergence.attach(0));
            for (let i = 0; i < this.config.PRESSURE_ITERATIONS; i++) {
                gl.uniform1i(this.programs.pressure.uniforms.uPressure, this.pressure.read.attach(1));
                this.blit(this.pressure.write.fbo);
                this.pressure.swap();
            }

            // Gradient subtract
            gl.useProgram(this.programs.gradSubtract.program);
            gl.uniform2f(this.programs.gradSubtract.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
            gl.uniform1i(this.programs.gradSubtract.uniforms.uPressure, this.pressure.read.attach(0));
            gl.uniform1i(this.programs.gradSubtract.uniforms.uVelocity, this.velocity.read.attach(1));
            this.blit(this.velocity.write.fbo);
            this.velocity.swap();

            // Advect velocity
            gl.useProgram(this.programs.advection.program);
            gl.uniform2f(this.programs.advection.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
            gl.uniform1i(this.programs.advection.uniforms.uVelocity, this.velocity.read.attach(0));
            gl.uniform1i(this.programs.advection.uniforms.uSource, this.velocity.read.attach(0));
            gl.uniform1f(this.programs.advection.uniforms.dt, dt);
            gl.uniform1f(this.programs.advection.uniforms.dissipation, this.config.VELOCITY_DISSIPATION);
            this.blit(this.velocity.write.fbo);
            this.velocity.swap();

            // Advect dye
            gl.viewport(0, 0, this.dye.width, this.dye.height);
            gl.uniform2f(this.programs.advection.uniforms.texelSize, this.dye.texelSizeX, this.dye.texelSizeY);
            gl.uniform1i(this.programs.advection.uniforms.uVelocity, this.velocity.read.attach(0));
            gl.uniform1i(this.programs.advection.uniforms.uSource, this.dye.read.attach(1));
            gl.uniform1f(this.programs.advection.uniforms.dissipation, this.config.DENSITY_DISSIPATION);
            this.blit(this.dye.write.fbo);
            this.dye.swap();

            // Display
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(this.programs.display.program);
            gl.uniform1i(this.programs.display.uniforms.uTexture, this.dye.read.attach(0));
            gl.uniform1f(this.programs.display.uniforms.uBrightness, this.isDarkMode ? 1.8 : 1.5);
            this.blit(null);

            requestAnimationFrame(() => this.render());
        }
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
                box-shadow: 0 6px 24px rgba(0,0,0,0.1), inset 0 -3px 8px rgba(0,0,0,0.05);
                animation: eyeFloat 4s ease-in-out infinite;
                transition: background 0.3s, box-shadow 0.3s;
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
                background: radial-gradient(circle at 35% 35%, #f0f0f0, #d0d0d0);
                box-shadow: 0 6px 24px rgba(0,0,0,0.4), inset 0 -3px 8px rgba(0,0,0,0.1);
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
            setTimeout(() => { blink(); scheduleBlink(); }, 2500 + Math.random() * 4000);
        }
        scheduleBlink();

        setTimeout(() => container.classList.add('visible'), 400);
    }

    // Initialize
    function start() {
        const fluid = new FluidSimulation();
        const success = fluid.init();
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

// Fluid Marble Gradient Effect
// Organic, flowing pastel colors like ink in water

(function() {
    'use strict';

    let canvas, gl, programs = {};
    let velocity, density, divergenceFB, pressureFB;
    let pointer = { x: 0.5, y: 0.5, dx: 0, dy: 0, moved: false };
    let lastPointer = { x: 0.5, y: 0.5 };
    let colorIdx = 0;
    let simWidth, simHeight, dyeWidth, dyeHeight;

    // Soft pastel colors - milky, luminous (like Image 1)
    const lightColors = [
        { r: 1.0, g: 0.7, b: 0.8 },   // Soft Pink
        { r: 1.0, g: 0.8, b: 0.7 },   // Peach
        { r: 1.0, g: 0.95, b: 0.7 },  // Cream Yellow
        { r: 0.7, g: 1.0, b: 0.8 },   // Mint Green
        { r: 0.7, g: 0.9, b: 1.0 },   // Sky Blue
        { r: 0.85, g: 0.75, b: 1.0 }, // Lavender
        { r: 1.0, g: 0.75, b: 0.9 },  // Rose Pink
        { r: 0.75, g: 0.95, b: 0.95 },// Aqua
    ];

    const darkColors = [
        { r: 1.0, g: 0.5, b: 0.7 },   // Pink
        { r: 1.0, g: 0.6, b: 0.5 },   // Coral
        { r: 1.0, g: 0.9, b: 0.4 },   // Yellow
        { r: 0.5, g: 1.0, b: 0.7 },   // Green
        { r: 0.5, g: 0.8, b: 1.0 },   // Blue
        { r: 0.8, g: 0.6, b: 1.0 },   // Purple
        { r: 1.0, g: 0.6, b: 0.85 },  // Magenta
        { r: 0.6, g: 0.95, b: 0.9 },  // Cyan
    ];

    function isDark() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    function getColor() {
        const colors = isDark() ? darkColors : lightColors;
        const c = colors[colorIdx % colors.length];
        colorIdx++;
        return c;
    }

    function init() {
        // Hide old gradient
        const old = document.querySelector('.mouse-gradient');
        if (old) old.style.display = 'none';

        canvas = document.createElement('canvas');
        canvas.id = 'fluid-canvas';
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;';
        document.body.appendChild(canvas);

        gl = canvas.getContext('webgl', { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false });
        if (!gl) {
            console.warn('WebGL not supported');
            return false;
        }

        const floatExt = gl.getExtension('OES_texture_float');
        gl.getExtension('OES_texture_float_linear');

        if (!floatExt) {
            console.warn('Float textures not supported');
            return false;
        }

        resize();
        initPrograms();
        initFramebuffers();
        setupEvents();

        requestAnimationFrame(update);
        console.log('Fluid effect initialized!');
        return true;
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        simWidth = 128;
        simHeight = 128;
        dyeWidth = 1024;
        dyeHeight = 1024;
    }

    function compileShader(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(s));
        }
        return s;
    }

    function createProgram(vs, fs) {
        const p = gl.createProgram();
        gl.attachShader(p, vs);
        gl.attachShader(p, fs);
        gl.linkProgram(p);
        
        const uniforms = {};
        const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < n; i++) {
            const name = gl.getActiveUniform(p, i).name;
            uniforms[name] = gl.getUniformLocation(p, name);
        }
        return { program: p, uniforms };
    }

    function initPrograms() {
        const vs = compileShader(gl.VERTEX_SHADER, `
            attribute vec2 a_position;
            varying vec2 v_uv;
            varying vec2 v_L, v_R, v_T, v_B;
            uniform vec2 u_texel;
            void main() {
                v_uv = a_position * 0.5 + 0.5;
                v_L = v_uv - vec2(u_texel.x, 0.0);
                v_R = v_uv + vec2(u_texel.x, 0.0);
                v_T = v_uv + vec2(0.0, u_texel.y);
                v_B = v_uv - vec2(0.0, u_texel.y);
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `);

        programs.splat = createProgram(vs, compileShader(gl.FRAGMENT_SHADER, `
            precision highp float;
            varying vec2 v_uv;
            uniform sampler2D u_target;
            uniform vec3 u_color;
            uniform vec2 u_point;
            uniform float u_radius;
            uniform float u_aspect;
            void main() {
                vec2 p = v_uv - u_point;
                p.x *= u_aspect;
                float d = exp(-dot(p,p) / u_radius);
                vec3 base = texture2D(u_target, v_uv).rgb;
                gl_FragColor = vec4(base + u_color * d, 1.0);
            }
        `));

        programs.advection = createProgram(vs, compileShader(gl.FRAGMENT_SHADER, `
            precision highp float;
            varying vec2 v_uv;
            uniform sampler2D u_velocity;
            uniform sampler2D u_source;
            uniform vec2 u_texel;
            uniform float u_dt;
            uniform float u_dissipation;
            void main() {
                vec2 coord = v_uv - u_dt * texture2D(u_velocity, v_uv).xy * u_texel;
                gl_FragColor = u_dissipation * texture2D(u_source, coord);
            }
        `));

        programs.divergence = createProgram(vs, compileShader(gl.FRAGMENT_SHADER, `
            precision highp float;
            varying vec2 v_L, v_R, v_T, v_B;
            uniform sampler2D u_velocity;
            void main() {
                float L = texture2D(u_velocity, v_L).x;
                float R = texture2D(u_velocity, v_R).x;
                float T = texture2D(u_velocity, v_T).y;
                float B = texture2D(u_velocity, v_B).y;
                gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
            }
        `));

        programs.pressure = createProgram(vs, compileShader(gl.FRAGMENT_SHADER, `
            precision highp float;
            varying vec2 v_uv, v_L, v_R, v_T, v_B;
            uniform sampler2D u_pressure;
            uniform sampler2D u_divergence;
            void main() {
                float L = texture2D(u_pressure, v_L).x;
                float R = texture2D(u_pressure, v_R).x;
                float T = texture2D(u_pressure, v_T).x;
                float B = texture2D(u_pressure, v_B).x;
                float div = texture2D(u_divergence, v_uv).x;
                gl_FragColor = vec4((L + R + T + B - div) * 0.25, 0.0, 0.0, 1.0);
            }
        `));

        programs.gradient = createProgram(vs, compileShader(gl.FRAGMENT_SHADER, `
            precision highp float;
            varying vec2 v_uv, v_L, v_R, v_T, v_B;
            uniform sampler2D u_pressure;
            uniform sampler2D u_velocity;
            void main() {
                float L = texture2D(u_pressure, v_L).x;
                float R = texture2D(u_pressure, v_R).x;
                float T = texture2D(u_pressure, v_T).x;
                float B = texture2D(u_pressure, v_B).x;
                vec2 v = texture2D(u_velocity, v_uv).xy - vec2(R - L, T - B);
                gl_FragColor = vec4(v, 0.0, 1.0);
            }
        `));

        programs.curl = createProgram(vs, compileShader(gl.FRAGMENT_SHADER, `
            precision highp float;
            varying vec2 v_L, v_R, v_T, v_B;
            uniform sampler2D u_velocity;
            void main() {
                float L = texture2D(u_velocity, v_L).y;
                float R = texture2D(u_velocity, v_R).y;
                float T = texture2D(u_velocity, v_T).x;
                float B = texture2D(u_velocity, v_B).x;
                gl_FragColor = vec4(R - L - T + B, 0.0, 0.0, 1.0);
            }
        `));

        programs.vorticity = createProgram(vs, compileShader(gl.FRAGMENT_SHADER, `
            precision highp float;
            varying vec2 v_uv, v_L, v_R, v_T, v_B;
            uniform sampler2D u_velocity;
            uniform sampler2D u_curl;
            uniform float u_curl_strength;
            uniform float u_dt;
            void main() {
                float L = texture2D(u_curl, v_L).x;
                float R = texture2D(u_curl, v_R).x;
                float T = texture2D(u_curl, v_T).x;
                float B = texture2D(u_curl, v_B).x;
                float C = texture2D(u_curl, v_uv).x;
                vec2 f = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
                f /= length(f) + 0.0001;
                f *= u_curl_strength * C;
                f.y *= -1.0;
                vec2 v = texture2D(u_velocity, v_uv).xy + f * u_dt;
                gl_FragColor = vec4(v, 0.0, 1.0);
            }
        `));

        programs.clear = createProgram(vs, compileShader(gl.FRAGMENT_SHADER, `
            precision highp float;
            varying vec2 v_uv;
            uniform sampler2D u_texture;
            uniform float u_value;
            void main() {
                gl_FragColor = u_value * texture2D(u_texture, v_uv);
            }
        `));

        programs.display = createProgram(vs, compileShader(gl.FRAGMENT_SHADER, `
            precision highp float;
            varying vec2 v_uv;
            uniform sampler2D u_texture;
            void main() {
                vec3 c = texture2D(u_texture, v_uv).rgb;
                c = pow(c * 1.1, vec3(0.95));
                float a = max(c.r, max(c.g, c.b));
                a = smoothstep(0.0, 0.08, a);
                gl_FragColor = vec4(c, a * 0.95);
            }
        `));

        // Vertex buffer
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, -1,1, 1,1, 1,-1]), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
    }

    function createFBO(w, h) {
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
            fbo, tex, w, h,
            attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; }
        };
    }

    function createDoubleFBO(w, h) {
        let a = createFBO(w, h), b = createFBO(w, h);
        return {
            w, h,
            get read() { return a; },
            get write() { return b; },
            swap() { [a, b] = [b, a]; }
        };
    }

    function initFramebuffers() {
        velocity = createDoubleFBO(simWidth, simHeight);
        density = createDoubleFBO(dyeWidth, dyeHeight);
        divergenceFB = createFBO(simWidth, simHeight);
        pressureFB = createDoubleFBO(simWidth, simHeight);
        programs.curlFB = createFBO(simWidth, simHeight);
    }

    function setupEvents() {
        document.addEventListener('mousemove', e => {
            pointer.x = e.clientX / canvas.width;
            pointer.y = 1.0 - e.clientY / canvas.height;
            pointer.moved = true;
        });

        document.addEventListener('touchmove', e => {
            e.preventDefault();
            const t = e.touches[0];
            pointer.x = t.clientX / canvas.width;
            pointer.y = 1.0 - t.clientY / canvas.height;
            pointer.moved = true;
        }, { passive: false });

        window.addEventListener('resize', () => {
            resize();
            initFramebuffers();
        });
    }

    function blit(target) {
        if (target) {
            gl.viewport(0, 0, target.w, target.h);
            gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        } else {
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    function splat(x, y, dx, dy, color) {
        gl.useProgram(programs.splat.program);
        gl.uniform1i(programs.splat.uniforms.u_target, velocity.read.attach(0));
        gl.uniform2f(programs.splat.uniforms.u_texel, 1/simWidth, 1/simHeight);
        gl.uniform2f(programs.splat.uniforms.u_point, x, y);
        gl.uniform3f(programs.splat.uniforms.u_color, dx * 5000, dy * 5000, 0);
        gl.uniform1f(programs.splat.uniforms.u_radius, 0.0003);
        gl.uniform1f(programs.splat.uniforms.u_aspect, canvas.width / canvas.height);
        blit(velocity.write);
        velocity.swap();

        gl.uniform1i(programs.splat.uniforms.u_target, density.read.attach(0));
        gl.uniform2f(programs.splat.uniforms.u_texel, 1/dyeWidth, 1/dyeHeight);
        gl.uniform3f(programs.splat.uniforms.u_color, color.r * 0.5, color.g * 0.5, color.b * 0.5);
        gl.uniform1f(programs.splat.uniforms.u_radius, 0.0004);
        blit(density.write);
        density.swap();
    }

    function update() {
        const dt = 0.016;

        if (pointer.moved) {
            pointer.moved = false;
            const dx = pointer.x - lastPointer.x;
            const dy = pointer.y - lastPointer.y;
            lastPointer.x = pointer.x;
            lastPointer.y = pointer.y;

            if (Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001) {
                const c = getColor();
                splat(pointer.x, pointer.y, dx, dy, c);
            }
        }

        // Curl
        gl.useProgram(programs.curl.program);
        gl.uniform2f(programs.curl.uniforms.u_texel, 1/simWidth, 1/simHeight);
        gl.uniform1i(programs.curl.uniforms.u_velocity, velocity.read.attach(0));
        blit(programs.curlFB);

        // Vorticity
        gl.useProgram(programs.vorticity.program);
        gl.uniform2f(programs.vorticity.uniforms.u_texel, 1/simWidth, 1/simHeight);
        gl.uniform1i(programs.vorticity.uniforms.u_velocity, velocity.read.attach(0));
        gl.uniform1i(programs.vorticity.uniforms.u_curl, programs.curlFB.attach(1));
        gl.uniform1f(programs.vorticity.uniforms.u_curl_strength, 35);
        gl.uniform1f(programs.vorticity.uniforms.u_dt, dt);
        blit(velocity.write);
        velocity.swap();

        // Divergence
        gl.useProgram(programs.divergence.program);
        gl.uniform2f(programs.divergence.uniforms.u_texel, 1/simWidth, 1/simHeight);
        gl.uniform1i(programs.divergence.uniforms.u_velocity, velocity.read.attach(0));
        blit(divergenceFB);

        // Clear pressure
        gl.useProgram(programs.clear.program);
        gl.uniform1i(programs.clear.uniforms.u_texture, pressureFB.read.attach(0));
        gl.uniform1f(programs.clear.uniforms.u_value, 0.8);
        gl.uniform2f(programs.clear.uniforms.u_texel, 1/simWidth, 1/simHeight);
        blit(pressureFB.write);
        pressureFB.swap();

        // Pressure solve
        gl.useProgram(programs.pressure.program);
        gl.uniform2f(programs.pressure.uniforms.u_texel, 1/simWidth, 1/simHeight);
        gl.uniform1i(programs.pressure.uniforms.u_divergence, divergenceFB.attach(0));
        for (let i = 0; i < 20; i++) {
            gl.uniform1i(programs.pressure.uniforms.u_pressure, pressureFB.read.attach(1));
            blit(pressureFB.write);
            pressureFB.swap();
        }

        // Gradient subtract
        gl.useProgram(programs.gradient.program);
        gl.uniform2f(programs.gradient.uniforms.u_texel, 1/simWidth, 1/simHeight);
        gl.uniform1i(programs.gradient.uniforms.u_pressure, pressureFB.read.attach(0));
        gl.uniform1i(programs.gradient.uniforms.u_velocity, velocity.read.attach(1));
        blit(velocity.write);
        velocity.swap();

        // Advect velocity
        gl.useProgram(programs.advection.program);
        gl.uniform2f(programs.advection.uniforms.u_texel, 1/simWidth, 1/simHeight);
        gl.uniform1i(programs.advection.uniforms.u_velocity, velocity.read.attach(0));
        gl.uniform1i(programs.advection.uniforms.u_source, velocity.read.attach(0));
        gl.uniform1f(programs.advection.uniforms.u_dt, dt);
        gl.uniform1f(programs.advection.uniforms.u_dissipation, 0.99);
        blit(velocity.write);
        velocity.swap();

        // Advect density
        gl.uniform2f(programs.advection.uniforms.u_texel, 1/dyeWidth, 1/dyeHeight);
        gl.uniform1i(programs.advection.uniforms.u_velocity, velocity.read.attach(0));
        gl.uniform1i(programs.advection.uniforms.u_source, density.read.attach(1));
        gl.uniform1f(programs.advection.uniforms.u_dissipation, 0.995);
        blit(density.write);
        density.swap();

        // Display
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(programs.display.program);
        gl.uniform2f(programs.display.uniforms.u_texel, 1/canvas.width, 1/canvas.height);
        gl.uniform1i(programs.display.uniforms.u_texture, density.read.attach(0));
        blit(null);
        gl.disable(gl.BLEND);

        requestAnimationFrame(update);
    }

    // Eyes for role pages only
    function initEyes() {
        const container = document.createElement('div');
        container.id = 'sentient-eyes';
        container.innerHTML = `
            <div class="eye left-eye"><div class="pupil"><div class="glint"></div></div></div>
            <div class="eye right-eye"><div class="pupil"><div class="glint"></div></div></div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            #sentient-eyes { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); display:flex; gap:30px; z-index:5; pointer-events:none; opacity:0; transition:opacity 0.8s; }
            #sentient-eyes.visible { opacity:1; }
            .eye { width:80px; height:80px; background:radial-gradient(circle at 35% 35%, #fff, #f5f5f5); border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 24px rgba(0,0,0,0.1); animation:eyeFloat 4s ease-in-out infinite; }
            .left-eye { animation-delay:0s; } .right-eye { animation-delay:0.4s; }
            @keyframes eyeFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
            .pupil { width:40px; height:40px; background:radial-gradient(circle at 35% 35%, #3a3a3a, #111); border-radius:50%; position:relative; transition:transform 0.1s; }
            .glint { position:absolute; width:12px; height:12px; background:white; border-radius:50%; top:7px; left:7px; }
            .eye.blink { animation:blink 0.15s; }
            @keyframes blink { 0%,100% { transform:scaleY(1); } 50% { transform:scaleY(0.1); } }
            [data-theme="dark"] .eye { background:radial-gradient(circle at 35% 35%, #f0f0f0, #d0d0d0); }
            [data-theme="dark"] .pupil { background:radial-gradient(circle at 35% 35%, #1a1a1a, #000); }
        `;
        document.head.appendChild(style);
        document.body.appendChild(container);

        const lp = container.querySelector('.left-eye .pupil');
        const rp = container.querySelector('.right-eye .pupil');
        const le = container.querySelector('.left-eye');
        const re = container.querySelector('.right-eye');
        let tx=0, ty=0, cx=0, cy=0;

        document.addEventListener('mousemove', e => {
            const dx = e.clientX - innerWidth/2, dy = e.clientY - innerHeight/2;
            const d = Math.sqrt(dx*dx+dy*dy)||1, r = Math.min(d/300,1);
            tx = (dx/d)*15*r; ty = (dy/d)*15*r;
        });

        (function anim() {
            cx += (tx-cx)*0.12; cy += (ty-cy)*0.12;
            lp.style.transform = rp.style.transform = `translate(${cx}px,${cy}px)`;
            requestAnimationFrame(anim);
        })();

        function blink() {
            le.classList.add('blink'); re.classList.add('blink');
            setTimeout(() => { le.classList.remove('blink'); re.classList.remove('blink'); }, 150);
            setTimeout(blink, 2500 + Math.random()*4000);
        }
        setTimeout(blink, 2000);
        setTimeout(() => container.classList.add('visible'), 400);
    }

    // Start
    function start() {
        const ok = init();
        const isIndex = location.pathname.endsWith('index.html') || location.pathname === '/' || location.pathname.endsWith('/');
        if (!isIndex && ok) initEyes();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();

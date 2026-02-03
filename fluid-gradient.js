
// fluid-gradient.js
// Pure JS WebGL Fluid Header Background Injector (Three.js)
// Drops into page via <script src="fluid-gradient.js"></script>

(function () {
  if (window.__fluidGradientLoaded) return;
  window.__fluidGradientLoaded = true;

  function loadThree(cb) {
    if (window.THREE) return cb();
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/three@0.160/build/three.min.js";
    s.onload = cb;
    document.head.appendChild(s);
  }

  loadThree(init);

  function init() {
    const container =
      document.querySelector(".hero-background") || document.body;

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    container.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf6f5f3, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const mouse = new THREE.Vector2(0.5, 0.5);

    window.addEventListener("mousemove", e => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = 1 - e.clientY / window.innerHeight;
    });

    const uniforms = {
      time: { value: 0 },
      resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight)
      },
      mouse: { value: mouse }
    };

    const material = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      uniforms,
      vertexShader: `
        void main(){
          gl_Position = vec4(position,1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform vec2 resolution;
        uniform float time;
        uniform vec2 mouse;

        float hash(vec2 p){
          return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);
        }

        float noise(vec2 p){
          vec2 i=floor(p);
          vec2 f=fract(p);
          vec2 u=f*f*(3.0-2.0*f);
          return mix(
            mix(hash(i),hash(i+vec2(1.,0.)),u.x),
            mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);
        }

        vec3 palette(float t){
          vec3 mint=vec3(0.6,1.0,0.85);
          vec3 cyan=vec3(0.4,0.9,1.0);
          vec3 cobalt=vec3(0.2,0.4,1.0);
          vec3 magenta=vec3(1.0,0.3,0.8);
          vec3 coral=vec3(1.0,0.6,0.5);

          t=fract(t);
          if(t<.25) return mix(mint,cyan,t*4.);
          if(t<.5) return mix(cyan,cobalt,(t-.25)*4.);
          if(t<.75) return mix(cobalt,magenta,(t-.5)*4.);
          return mix(magenta,coral,(t-.75)*4.);
        }

        void main(){
          vec2 uv = gl_FragCoord.xy/resolution.xy;
          vec2 p = uv*2.-1.;
          p.x*=resolution.x/resolution.y;

          float n = noise(p*2.5 + time*0.05);
          float swirl = noise(p*1.5 + vec2(time*0.04));

          vec2 m = mouse*2.-1.;
          float d = length(p-m);
          float ripple = exp(-d*12.)*0.9;

          float t = n + swirl*0.6 + ripple;

          vec3 col = palette(t*0.6 + time*0.05);

          float alpha = smoothstep(1.3,0.0,length(p))*0.9;

          gl_FragColor = vec4(col*1.25,alpha);
        }
      `
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    function resize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
    }

    window.addEventListener("resize", resize);
    resize();

    function animate() {
      uniforms.time.value += 0.012;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();
  }
})();

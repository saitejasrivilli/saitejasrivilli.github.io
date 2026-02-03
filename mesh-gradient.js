(function () {

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.domElement.style.position = "fixed";
  renderer.domElement.style.inset = "0";
  renderer.domElement.style.zIndex = "0";
  renderer.domElement.style.pointerEvents = "none";
  renderer.domElement.style.filter = "blur(40px)";

  document.body.prepend(renderer.domElement);

  const uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position,1.0);
      }
    `,
    fragmentShader: `
      precision highp float;

      uniform float uTime;
      uniform vec2 uMouse;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv;

        uv += (uMouse - 0.5) * 0.3;

        float t = uTime * 0.15;

        float n =
          sin((uv.x+t)*3.0) +
          sin((uv.y-t)*4.0) +
          sin((uv.x+uv.y+t)*2.0);

        n *= 0.25;

        vec3 pink = vec3(1.0,0.6,0.75);
        vec3 orange = vec3(1.0,0.75,0.45);
        vec3 yellow = vec3(1.0,0.9,0.6);

        float m1 = smoothstep(-0.3,0.6,uv.x+n);
        float m2 = smoothstep(-0.2,0.8,uv.y-n);

        vec3 col = mix(pink,orange,m1);
        col = mix(col,yellow,m2);

        gl_FragColor = vec4(col,1.0);
      }
    `
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2,2), material);
  scene.add(mesh);

  let mouseTarget = new THREE.Vector2(.5,.5);
  let mouseCurrent = new THREE.Vector2(.5,.5);

  window.addEventListener("mousemove", e => {
    mouseTarget.x = e.clientX / innerWidth;
    mouseTarget.y = 1 - e.clientY / innerHeight;
  });

  function animate(t){
    requestAnimationFrame(animate);

    mouseCurrent.lerp(mouseTarget,0.05);
    uniforms.uMouse.value.copy(mouseCurrent);
    uniforms.uTime.value = t * 0.001;

    renderer.render(scene,camera);
  }

  animate(0);

  window.addEventListener("resize",()=>{
    renderer.setSize(innerWidth,innerHeight);
  });

})();

if (typeof window === "undefined") return;

document.addEventListener("DOMContentLoaded", () => {

(function () {
  if (window.__fluidGradientLoaded) return;
  window.__fluidGradientLoaded = true;

  function load(src, cb){
    const s=document.createElement("script");
    s.src=src; s.onload=cb; document.head.appendChild(s);
  }

  function loadAll(cb){
    if(!window.THREE){
      load("https://cdn.jsdelivr.net/npm/three@0.160/build/three.min.js",()=>loadAll(cb));
      return;
    }
    if(!window.gsap){
      load("https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js",()=>loadAll(cb));
      return;
    }
    cb();
  }

  loadAll(init);

  function init(){

    // FULLSCREEN FIXED CANVAS (behind everything)
    const canvas=document.createElement("canvas");
    canvas.style.cssText=`
      position:fixed;
      inset:0;
      width:100vw;
      height:100vh;
      pointer-events:none;
      z-index:-1;
    `;
    document.body.prepend(canvas);

    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.setClearColor(0xf7f6f3,1);

    const scene=new THREE.Scene();
    const camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);

    const mouse={x:.5,y:.5,tx:.5,ty:.5};

    function setTarget(x,y){
      mouse.tx=x; mouse.ty=y;
      gsap.to(mouse,{x:mouse.tx,y:mouse.ty,duration:.6,ease:"power3.out"});
    }

    addEventListener("mousemove",e=>{
      setTarget(e.clientX/innerWidth,1-e.clientY/inners);
    });

    addEventListener("touchmove",e=>{
      const t=e.touches[0];
      setTarget(t.clientX/innerWidth,1-t.clientY/innerHeight);
    },{passive:true});

    const uniforms={
      time:{value:0},
      resolution:{value:new THREE.Vector2(innerWidth,innerHeight)},
      mouse:{value:new THREE.Vector2(.5,.5)}
    };

    const material=new THREE.ShaderMaterial({
      transparent:true,
      blending:THREE.AdditiveBlending,
      uniforms,
      vertexShader:`void main(){gl_Position=vec4(position,1.);}`,
      fragmentShader:`
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform vec2 mouse;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
 vec2 i=floor(p); vec2 f=fract(p);
 vec2 u=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),
            mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}

vec3 palette(float t){
 vec3 mint=vec3(.55,1.,.85);
 vec3 cyan=vec3(.35,.95,1.);
 vec3 cobalt=vec3(.25,.45,1.);
 vec3 magenta=vec3(1.,.35,.85);
 vec3 coral=vec3(1.,.65,.55);
 t=fract(t);
 if(t<.25) return mix(mint,cyan,t*4.);
 if(t<.5) return mix(cyan,cobalt,(t-.25)*4.);
 if(t<.75) return mix(cobalt,magenta,(t-.5)*4.);
 return mix(magenta,coral,(t-.75)*4.);
}

void main(){
 vec2 uv=gl_FragCoord.xy/resolution.xy;
 vec2 p=uv*2.-1.; p.x*=resolution.x/resolution.y;

 float n=noise(p*3.+time*.03);
 float swirl=noise(p*1.8+vec2(time*.02));

 // curl distortion
 p+=vec2(-p.y,p.x)*swirl*.15;

 vec2 m=mouse*2.-1.;
 float d=length(p-m);
 float splat=exp(-d*22.)*1.7;

 float t=n+swirl*.8+splat;
 vec3 col=palette(t*.7+time*.05);

 float alpha=smoothstep(.42,0.,length(p))*.85;

 gl_FragColor=vec4(col*1.7,alpha);
}`
    });

    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));

    function resize(){
      renderer.setSize(innerWidth,innerHeight);
      uniforms.resolution.value.set(innerWidth,innerHeight);
    }
    addEventListener("resize",resize); resize();

    function loop(){
      uniforms.time.value+=.008;
      uniforms.mouse.value.set(mouse.x,mouse.y);
      renderer.render(scene,camera);
      requestAnimationFrame(loop);
    }
    loop();
  }
})();
});

// motion.js
const lenis = new Lenis({ lerp: 0.08 });

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

gsap.registerPlugin(ScrollTrigger);

gsap.utils.toArray('.section, .project-item, .hero').forEach(el => {
  gsap.from(el, {
    y: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 80%'
    }
  });
});

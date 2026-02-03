<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Backend SDE | Sai Teja Srivillibhutturu</title>

<script src="theme.js"></script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

<style>
:root{--bg-primary:#ffffff;--bg-secondary:#f8f9fa;--text-primary:#1a1a2e;--text-secondary:#6b7280;--accent:#6366f1;--border-color:#e5e7eb;--card-shadow:0 4px 12px rgba(0,0,0,.05)}
[data-theme="dark"]{--bg-primary:#0f172a;--bg-secondary:#1e293b;--text-primary:#f1f5f9;--text-secondary:#94a3b8;--border-color:#334155;--card-shadow:0 4px 12px rgba(0,0,0,.3)}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,-apple-system,sans-serif;background:var(--bg-primary);color:var(--text-primary);line-height:1.7;overflow-x:hidden}

canvas{opacity:.85}

.container{max-width:900px;margin:0 auto;padding:0 2rem;position:relative;z-index:1}
.theme-toggle{position:fixed;top:1.5rem;right:2rem;z-index:1000;width:45px;height:45px;border-radius:50%;border:2px solid var(--border-color);background:var(--bg-primary);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.2rem}

nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:1rem 2rem;background:var(--bg-primary);backdrop-filter:blur(10px);border-bottom:1px solid var(--border-color)}
.nav-content{max-width:900px;margin:0 auto;display:flex;justify-content:space-between}

.hero{padding:8rem 0 4rem;text-align:center}
.section{padding:4rem 0;border-top:1px solid var(--border-color)}

.projects-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem}
.project-item{padding:1.5rem;border:1px solid var(--border-color);border-radius:16px;background:rgba(248,249,250,.6);backdrop-filter:blur(10px)}

.chat-widget{position:fixed;bottom:2rem;right:2rem;z-index:1000}

footer{text-align:center;padding:2rem;border-top:1px solid var(--border-color)}
</style>
</head>

<body>

<button class="theme-toggle" onclick="toggleTheme()">🌙</button>

<nav>
<div class="nav-content">
<a href="index.html">Back</a>
<span>Backend SDE</span>
</div>
</nav>

<section class="hero">
<div class="container">
<h1>Distributed Systems & High-Performance APIs</h1>
<p>Building scalable backend services and high-throughput pipelines.</p>
</div>
</section>

<section class="section">
<div class="container">
<h2>Backend Projects</h2>
<div id="projects-container"></div>
</div>
</section>

<footer>
<p>© 2026 Sai Teja Srivillibhutturu</p>
</footer>

<script>
const projects=[
{repo:'DistributedKVStore',title:'Distributed Key-Value Store'},
{repo:'vllm-throughput-benchmark',title:'High-Throughput Benchmarking'},
{repo:'RAG-Application',title:'Backend API Service'}
];

async function fetchRepo(name){
const r=await fetch(`https://api.github.com/repos/saitejasrivilli/${name}`);
return r.ok?await r.json():null;
}

async function loadProjects(){
const c=document.getElementById("projects-container");
const data=await Promise.all(projects.map(p=>fetchRepo(p.repo)));
c.innerHTML='<div class="projects-grid">'+data.map((d,i)=>`
<div class="project-item">
<h3>${projects[i].title}</h3>
<p>${d?.description||''}</p>
<a href="${d?.html_url}" target="_blank">Code</a>
</div>`).join('')+'</div>';
}

document.addEventListener("DOMContentLoaded",loadProjects);
</script>

<!-- Mesh Gradient -->
<script src="https://unpkg.com/three@0.158.0/build/three.min.js"></script>
<script src="mesh-gradient.js"></script>

</body>
</html>

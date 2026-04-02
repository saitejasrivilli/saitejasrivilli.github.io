/**
 * INTERACTIVE PROJECT EXPLORER
 * Shows projects dynamically with filtering, searching, and detailed views
 */

console.log('🔧 Portfolio features loading...');

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

function initAll() {
  console.log('✅ Initializing interactive features...');
  initProjectExplorer();
}

// ============================================
// PROJECT EXPLORER - INTERACTIVE UI
// ============================================

function initProjectExplorer() {
  console.log('🔍 Initializing project explorer...');

  // Create explorer widget
  const explorer = document.createElement('div');
  explorer.id = 'project-explorer';
  explorer.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 400px;
    max-height: 700px;
    background: white;
    border: 2px solid #2563eb;
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(37, 99, 235, 0.2);
    display: flex;
    flex-direction: column;
    z-index: 99999;
    font-family: Arial, sans-serif;
    transition: all 0.3s ease;
  `;

  explorer.innerHTML = `
    <!-- Header -->
    <div style="padding: 1.25rem; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; border-radius: 14px 14px 0 0; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 1.5rem;">🚀</span>
        <div>
          <div style="font-weight: bold; font-size: 1.1rem;">My Projects</div>
          <div style="font-size: 0.8rem; opacity: 0.9;">Click to explore</div>
        </div>
      </div>
      <button onclick="toggleExplorer()" style="background: rgba(255,255,255,0.2); border: none; color: white; cursor: pointer; font-size: 1.25rem; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">✕</button>
    </div>

    <!-- Search & Filter -->
    <div style="padding: 1rem; border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
      <input type="text" id="proj-search" placeholder="Search projects..." style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 8px; font-family: Arial; font-size: 0.9rem;">
      
      <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap;">
        <button class="filter-btn active" onclick="filterProjects('all')" style="padding: 0.4rem 0.8rem; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 500;">All</button>
        <button class="filter-btn" onclick="filterProjects('deep')" style="padding: 0.4rem 0.8rem; background: #f0f0f0; color: #333; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">Deep Learning</button>
        <button class="filter-btn" onclick="filterProjects('llm')" style="padding: 0.4rem 0.8rem; background: #f0f0f0; color: #333; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">LLM/GenAI</button>
      </div>
    </div>

    <!-- Projects List -->
    <div id="projects-list" style="flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
      <div style="text-align: center; padding: 2rem 1rem; color: #999;">Loading projects...</div>
    </div>

    <!-- Footer -->
    <div style="padding: 1rem; border-top: 1px solid #e5e7eb; background: #f9fafb; text-align: center;">
      <a href="#projects" style="color: #2563eb; text-decoration: none; font-weight: 500; font-size: 0.9rem;">View all projects →</a>
    </div>
  `;

  document.body.appendChild(explorer);

  // Load projects from page
  loadProjects();

  // Setup search
  document.getElementById('proj-search').addEventListener('input', (e) => {
    filterProjectsList(e.target.value);
  });

  console.log('✅ Project explorer ready');
}

function loadProjects() {
  const projectsList = document.getElementById('projects-list');
  const projects = [];

  // Extract projects from page
  document.querySelectorAll('.project-item').forEach(item => {
    const title = item.querySelector('.project-title')?.textContent || 'Untitled';
    const desc = item.querySelector('.project-description')?.textContent || '';
    const impact = item.querySelector('.project-impact')?.textContent || 'Project';
    const tags = Array.from(item.querySelectorAll('.tech-tag')).map(t => t.textContent);
    const links = Array.from(item.querySelectorAll('.project-link'));
    
    let githubUrl = '';
    let liveUrl = '';
    
    links.forEach(link => {
      if (link.classList.contains('code')) {
        githubUrl = link.href;
      } else if (link.classList.contains('demo')) {
        liveUrl = link.href;
      }
    });

    projects.push({
      title,
      desc: desc.substring(0, 100) + '...',
      impact,
      tags,
      github: githubUrl,
      live: liveUrl,
      impactType: impact.toLowerCase().replace(' / ', '')
    });
  });

  // Store globally
  window.allProjects = projects;

  // Display first 4
  displayProjects(projects.slice(0, 4));
}

function displayProjects(projects) {
  const list = document.getElementById('projects-list');
  
  if (projects.length === 0) {
    list.innerHTML = '<div style="text-align: center; padding: 2rem; color: #999;">No projects found</div>';
    return;
  }

  list.innerHTML = projects.map((p, i) => `
    <div class="project-card" style="
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border-left: 4px solid #2563eb;
    " onmouseover="this.style.boxShadow='0 8px 16px rgba(37,99,235,0.15)'" onmouseout="this.style.boxShadow='none'" onclick="expandProject(${i})">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
        <h4 style="margin: 0; font-size: 0.95rem; color: #1a1a2e; font-weight: 600; flex: 1;">${p.title}</h4>
        <span style="background: #e3f2fd; color: #2563eb; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.7rem; font-weight: 500; white-space: nowrap; margin-left: 0.5rem;">${p.impact}</span>
      </div>
      
      <p style="margin: 0.5rem 0; font-size: 0.8rem; color: #666; line-height: 1.4;">${p.desc}</p>
      
      <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.75rem;">
        ${p.tags.slice(0, 3).map(tag => `<span style="background: #2563eb; color: white; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.7rem;">${tag}</span>`).join('')}
        ${p.tags.length > 3 ? `<span style="background: #f0f0f0; color: #666; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.7rem;">+${p.tags.length - 3}</span>` : ''}
      </div>
      
      <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
        ${p.github ? `<a href="${p.github}" target="_blank" style="font-size: 0.8rem; color: #2563eb; text-decoration: none; font-weight: 500;">🔗 Code</a>` : ''}
        ${p.live ? `<a href="${p.live}" target="_blank" style="font-size: 0.8rem; color: #10b981; text-decoration: none; font-weight: 500;">🚀 Live</a>` : ''}
      </div>
    </div>
  `).join('');
}

function filterProjects(type) {
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.style.background = btn.style.background === 'rgb(37, 99, 235)' ? '#f0f0f0' : '#f0f0f0';
    btn.style.color = '#333';
  });
  event.target.style.background = '#2563eb';
  event.target.style.color = 'white';

  // Filter and display
  let filtered = window.allProjects;
  if (type === 'deep') {
    filtered = window.allProjects.filter(p => p.impact.includes('Deep'));
  } else if (type === 'llm') {
    filtered = window.allProjects.filter(p => p.impact.includes('LLM') || p.impact.includes('GenAI'));
  }

  displayProjects(filtered);
}

function filterProjectsList(query) {
  const filtered = window.allProjects.filter(p => 
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.desc.toLowerCase().includes(query.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  displayProjects(filtered);
}

function expandProject(index) {
  const p = window.allProjects[index];
  const allTags = p.tags.join(', ');
  
  alert(`${p.title}\n\n${p.desc}\n\nTech: ${allTags}`);
}

function toggleExplorer() {
  const explorer = document.getElementById('project-explorer');
  explorer.style.display = explorer.style.display === 'none' ? 'flex' : 'none';
}

// Add close on outside click
document.addEventListener('click', (e) => {
  const explorer = document.getElementById('project-explorer');
  if (!explorer.contains(e.target) && e.target.id !== 'project-explorer') {
    // Keep open - optional to remove this line if you want click-to-close
  }
});

console.log('✅ Portfolio features loaded!');

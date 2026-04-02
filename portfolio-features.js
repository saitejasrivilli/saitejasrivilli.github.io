console.log('=== PORTFOLIO FEATURES DIAGNOSTIC ===');
console.log('Script loaded at:', new Date().toISOString());
console.log('Page title:', document.title);
console.log('DOM ready:', document.readyState);

// Wait for DOM if needed
function start() {
  console.log('✅ Starting initialization...');
  
  // Check if projects exist on page
  const projectElements = document.querySelectorAll('.project-item');
  console.log('Found', projectElements.length, 'projects on page');
  
  if (projectElements.length === 0) {
    console.error('❌ No projects found! Looking for .project-item elements');
    console.log('Available elements:', document.querySelectorAll('*').length);
    return;
  }
  
  // Create the explorer widget
  console.log('🚀 Creating project explorer widget...');
  createExplorer();
  console.log('✅ Explorer created!');
}

function createExplorer() {
  // Create container
  const container = document.createElement('div');
  container.id = 'project-explorer-widget';
  
  // Inline all styles
  const styles = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 420px;
    max-height: 700px;
    background: white;
    border: 3px solid #2563eb;
    border-radius: 16px;
    box-shadow: 0 15px 50px rgba(0,0,0,0.3);
    display: flex;
    flex-direction: column;
    z-index: 99999;
    font-family: Arial, sans-serif;
    overflow: hidden;
  `;
  
  container.style.cssText = styles;
  
  // HTML content
  container.innerHTML = `
    <div style="padding: 1.5rem; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1;">
        <span style="font-size: 2rem;">🚀</span>
        <div>
          <div style="font-weight: bold; font-size: 1.1rem;">My Projects</div>
          <div style="font-size: 0.75rem; opacity: 0.9;">Interactive Explorer</div>
        </div>
      </div>
      <button id="close-explorer" style="background: rgba(255,255,255,0.3); border: none; color: white; cursor: pointer; font-size: 1.25rem; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; hover: {background: rgba(255,255,255,0.5)}">✕</button>
    </div>
    
    <div style="padding: 1rem; border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
      <input type="text" id="search-projects" placeholder="🔍 Search projects..." style="width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 8px; font-size: 0.9rem; font-family: Arial;">
      
      <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap;">
        <button class="filter-btn" data-filter="all" style="padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 500;">All</button>
        <button class="filter-btn" data-filter="learning" style="padding: 0.5rem 1rem; background: #e5e7eb; color: #333; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">Deep Learning</button>
        <button class="filter-btn" data-filter="genai" style="padding: 0.5rem 1rem; background: #e5e7eb; color: #333; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">LLM/GenAI</button>
      </div>
    </div>
    
    <div id="projects-container" style="flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 1rem; background: white;">
      <div style="text-align: center; padding: 2rem; color: #999; font-size: 0.9rem;">Loading projects...</div>
    </div>
    
    <div style="padding: 1rem; border-top: 1px solid #e5e7eb; background: #f9fafb; text-align: center;">
      <a href="#projects" style="color: #2563eb; text-decoration: none; font-weight: 600; font-size: 0.9rem;">👉 View All Projects</a>
    </div>
  `;
  
  document.body.appendChild(container);
  console.log('✅ Container added to DOM');
  
  // Load projects
  loadAndDisplayProjects();
  
  // Setup event listeners
  document.getElementById('close-explorer').addEventListener('click', () => {
    container.style.display = 'none';
    console.log('🔒 Explorer closed');
  });
  
  document.getElementById('search-projects').addEventListener('input', (e) => {
    filterProjects(e.target.value);
  });
  
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.style.background = '#e5e7eb';
        b.style.color = '#333';
      });
      this.style.background = '#2563eb';
      this.style.color = 'white';
      filterProjects(this.dataset.filter);
    });
  });
}

function loadAndDisplayProjects() {
  console.log('📂 Loading projects from page...');
  
  const projects = [];
  let projectCount = 0;
  
  document.querySelectorAll('.project-item').forEach((item, index) => {
    projectCount++;
    
    // Extract data
    const titleEl = item.querySelector('.project-title');
    const descEl = item.querySelector('.project-description');
    const impactEl = item.querySelector('.project-impact');
    const techEls = item.querySelectorAll('.tech-tag');
    
    const project = {
      id: index,
      title: titleEl ? titleEl.textContent.trim() : `Project ${index + 1}`,
      description: descEl ? descEl.textContent.trim().substring(0, 80) + '...' : 'No description',
      impact: impactEl ? impactEl.textContent.trim() : 'Project',
      technologies: Array.from(techEls).map(el => el.textContent.trim()),
      element: item
    };
    
    projects.push(project);
    console.log(`  📌 ${project.title} (${project.technologies.length} techs)`);
  });
  
  console.log(`✅ Loaded ${projectCount} projects`);
  window.allProjects = projects;
  
  displayProjects(projects);
}

function displayProjects(projects) {
  const container = document.getElementById('projects-container');
  
  if (projects.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #999;">No projects found</div>';
    return;
  }
  
  container.innerHTML = projects.map((p, idx) => `
    <div style="
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #2563eb;
      border-radius: 8px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    " onmouseover="this.style.boxShadow='0 4px 12px rgba(37,99,235,0.15)'" onmouseout="this.style.boxShadow='none'">
      <div style="display: flex; justify-content: space-between; align-items: start; gap: 0.75rem; margin-bottom: 0.5rem;">
        <h4 style="margin: 0; font-size: 0.95rem; color: #1a1a2e; font-weight: 600; flex: 1;">${p.title}</h4>
        <span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600; white-space: nowrap;">${p.impact}</span>
      </div>
      
      <p style="margin: 0.5rem 0; font-size: 0.8rem; color: #666; line-height: 1.4;">${p.description}</p>
      
      <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.75rem;">
        ${p.technologies.slice(0, 3).map(t => `
          <span style="background: #2563eb; color: white; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.7rem; font-weight: 500;">${t}</span>
        `).join('')}
        ${p.technologies.length > 3 ? `<span style="background: #f0f0f0; color: #666; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.7rem;">+${p.technologies.length - 3}</span>` : ''}
      </div>
    </div>
  `).join('');
  
  console.log(`✅ Displayed ${projects.length} projects`);
}

function filterProjects(filterType) {
  console.log('Filtering by:', filterType);
  
  if (filterType === 'all' || filterType === '') {
    displayProjects(window.allProjects);
    return;
  }
  
  const filtered = window.allProjects.filter(p => {
    const impact = p.impact.toLowerCase();
    if (filterType === 'learning') {
      return impact.includes('deep');
    } else if (filterType === 'genai') {
      return impact.includes('llm') || impact.includes('genai');
    }
    return true;
  });
  
  displayProjects(filtered);
}

// Start when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}

console.log('✅ Portfolio features script fully loaded!');

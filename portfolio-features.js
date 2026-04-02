/**
 * INTERACTIVE PROJECT FLOW EXPLORER
 * Shows projects dynamically with visual flow and category buttons
 */

console.log('🚀 Portfolio features loading...');

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFeatures);
} else {
  initFeatures();
}

function initFeatures() {
  console.log('✅ Initializing interactive features...');
  createProjectFlow();
}

// ============================================
// PROJECT FLOW EXPLORER - VISUAL & INTERACTIVE
// ============================================

function createProjectFlow() {
  console.log('🎯 Creating project flow explorer...');

  // Create container
  const container = document.createElement('div');
  container.id = 'project-flow-container';
  container.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 500px;
    max-height: 650px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    display: flex;
    flex-direction: column;
    z-index: 99999;
    font-family: Arial, sans-serif;
    overflow: hidden;
    border: 2px solid #f0f0f0;
  `;

  // Header with gradient
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 1.5rem;
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  header.innerHTML = `
    <div>
      <h3 style="margin: 0; font-size: 1.3rem; font-weight: 700;">🚀 My Projects</h3>
      <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; opacity: 0.8;">Explore my work</p>
    </div>
    <button id="close-flow" style="
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      cursor: pointer;
      font-size: 1.5rem;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">✕</button>
  `;

  // Content area - will show selected projects
  const content = document.createElement('div');
  content.id = 'project-content';
  content.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    background: #fafafa;
    min-height: 250px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  `;
  content.innerHTML = `
    <div style="text-align: center; padding: 2rem 0; color: #999;">
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏳</div>
      <div style="font-size: 0.9rem;">Fetching projects...</div>
    </div>
  `;

  // Button container at bottom
  const buttons = document.createElement('div');
  buttons.style.cssText = `
    padding: 1.5rem;
    background: white;
    border-top: 1px solid #e5e7eb;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  `;
  buttons.innerHTML = `
    <button class="flow-btn" data-category="all" onclick="filterProjectFlow('all')" style="
      padding: 0.75rem 1.5rem;
      background: #1a202c;
      color: white;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s;
    ">
      😊 About Me
    </button>
    <button class="flow-btn" data-category="projects" onclick="filterProjectFlow('projects')" style="
      padding: 0.75rem 1.5rem;
      background: #f0f0f0;
      color: #333;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s;
    ">
      💼 Projects
    </button>
    <button class="flow-btn" data-category="skills" onclick="filterProjectFlow('skills')" style="
      padding: 0.75rem 1.5rem;
      background: #f0f0f0;
      color: #333;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s;
    ">
      🛠️ Skills
    </button>
    <button class="flow-btn" data-category="experience" onclick="filterProjectFlow('experience')" style="
      padding: 0.75rem 1.5rem;
      background: #f0f0f0;
      color: #333;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s;
    ">
      🎯 Experience
    </button>
    <button class="flow-btn" data-category="contact" onclick="filterProjectFlow('contact')" style="
      padding: 0.75rem 1.5rem;
      background: #f0f0f0;
      color: #333;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s;
    ">
      📞 Contact
    </button>
  `;

  container.appendChild(header);
  container.appendChild(content);
  container.appendChild(buttons);
  document.body.appendChild(container);

  // Close button
  document.getElementById('close-flow').addEventListener('click', () => {
    container.style.display = 'none';
  });

  // Load projects
  loadProjects();
  
  // Show all by default
  setTimeout(() => filterProjectFlow('all'), 500);

  console.log('✅ Project flow created!');
}

function loadProjects() {
  const projects = [];
  
  document.querySelectorAll('.project-item').forEach((item, index) => {
    const title = item.querySelector('.project-title')?.textContent || '';
    const desc = item.querySelector('.project-description')?.textContent || '';
    const impact = item.querySelector('.project-impact')?.textContent || '';
    const techs = Array.from(item.querySelectorAll('.tech-tag')).map(t => t.textContent);
    
    projects.push({
      id: index,
      title: title.trim(),
      desc: desc.trim().substring(0, 150) + '...',
      impact: impact.trim().toLowerCase(),
      techs: techs
    });
  });

  window.allProjects = projects;
  console.log('✅ Loaded', projects.length, 'projects');
}

function filterProjectFlow(category) {
  console.log('🔍 Showing:', category);
  
  // Update button styles
  document.querySelectorAll('.flow-btn').forEach(btn => {
    btn.style.background = '#f0f0f0';
    btn.style.color = '#333';
  });
  event.target.style.background = '#1a202c';
  event.target.style.color = 'white';

  const content = document.getElementById('project-content');
  let html = '';

  if (category === 'all') {
    html = `
      <div style="text-align: center; margin-bottom: 1rem;">
        <div style="font-size: 3rem; margin-bottom: 0.75rem;">👨‍💻</div>
        <h3 style="margin: 0; font-size: 1.2rem; color: #1a1a2e;">Sai Teja Srivillibhutturu</h3>
        <p style="margin: 0.5rem 0; color: #666; font-size: 0.9rem;">AI Solutions Engineer specializing in Deep Learning & LLMs</p>
        <p style="margin: 0.5rem 0; color: #999; font-size: 0.85rem;">MS CS from UT Arlington (GPA 4.0) • Published Researcher • 4 Years Industry Experience</p>
      </div>
      <div style="background: white; padding: 1rem; border-radius: 12px; border-left: 4px solid #2563eb;">
        <p style="margin: 0; color: #666; line-height: 1.6; font-size: 0.9rem;">I optimize ML systems for speed, memory, and cost. My work focuses on CUDA kernels, FlashAttention, quantization, and building production-grade inference infrastructure.</p>
      </div>
    `;
  } else if (category === 'projects') {
    html = `<div style="display: flex; flex-direction: column; gap: 1rem;">`;
    window.allProjects.forEach(p => {
      html += `
        <div style="
          background: white;
          padding: 1rem;
          border-radius: 12px;
          border-left: 4px solid #2563eb;
          cursor: pointer;
          transition: all 0.3s;
        " onmouseover="this.style.boxShadow='0 4px 12px rgba(37,99,235,0.15)'" onmouseout="this.style.boxShadow='none'">
          <h4 style="margin: 0 0 0.5rem 0; font-size: 0.95rem; color: #1a1a2e; font-weight: 600;">${p.title}</h4>
          <p style="margin: 0 0 0.75rem 0; font-size: 0.8rem; color: #666; line-height: 1.4;">${p.desc}</p>
          <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            ${p.techs.slice(0, 4).map(t => `<span style="background: #2563eb; color: white; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.7rem;">${t}</span>`).join('')}
            ${p.techs.length > 4 ? `<span style="background: #f0f0f0; color: #666; padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.7rem;">+${p.techs.length - 4}</span>` : ''}
          </div>
        </div>
      `;
    });
    html += `</div>`;
  } else if (category === 'skills') {
    html = `
      <div style="background: white; padding: 1.25rem; border-radius: 12px; border-left: 4px solid #2563eb;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <h4 style="margin: 0 0 0.5rem 0; font-size: 0.85rem; font-weight: 600; color: #1a1a2e;">🤖 AI/ML</h4>
            <div style="font-size: 0.8rem; color: #666; line-height: 1.6;">PyTorch • TensorFlow • CUDA • LLMs • LoRA/PEFT • RAG</div>
          </div>
          <div>
            <h4 style="margin: 0 0 0.5rem 0; font-size: 0.85rem; font-weight: 600; color: #1a1a2e;">🔧 Infrastructure</h4>
            <div style="font-size: 0.8rem; color: #666; line-height: 1.6;">Kubernetes • Docker • FastAPI • AWS • PostgreSQL</div>
          </div>
          <div>
            <h4 style="margin: 0 0 0.5rem 0; font-size: 0.85rem; font-weight: 600; color: #1a1a2e;">💻 Languages</h4>
            <div style="font-size: 0.8rem; color: #666; line-height: 1.6;">Python • C++ • Java • Go</div>
          </div>
          <div>
            <h4 style="margin: 0 0 0.5rem 0; font-size: 0.85rem; font-weight: 600; color: #1a1a2e;">📚 Specializations</h4>
            <div style="font-size: 0.8rem; color: #666; line-height: 1.6;">GPU Optimization • LLM Inference • Fine-tuning</div>
          </div>
        </div>
      </div>
    `;
  } else if (category === 'experience') {
    html = `
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="background: white; padding: 1rem; border-radius: 12px; border-left: 4px solid #10b981;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1a1a2e; font-weight: 600;">🏥 Qure.ai - AI Solutions Engineer</h4>
          <p style="margin: 0; font-size: 0.8rem; color: #666;">Mar 2026 - Present • LLM for clinical automation, EPIC/FHIR integrations</p>
        </div>
        <div style="background: white; padding: 1rem; border-radius: 12px; border-left: 4px solid #10b981;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1a1a2e; font-weight: 600;">📊 UTA - Graduate Research Assistant</h4>
          <p style="margin: 0; font-size: 0.8rem; color: #666;">Jun 2025 - Present • TopGPT project, IEEE ICC 2026 publication</p>
        </div>
        <div style="background: white; padding: 1rem; border-radius: 12px; border-left: 4px solid #10b981;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1a1a2e; font-weight: 600;">🏥 DentalScan/ReplyQuickAI - ML Engineer</h4>
          <p style="margin: 0; font-size: 0.8rem; color: #666;">Dec 2025 - Feb 2026 • Computer vision pipelines, AWS SageMaker</p>
        </div>
        <div style="background: white; padding: 1rem; border-radius: 12px; border-left: 4px solid #10b981;">
          <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1a1a2e; font-weight: 600;">💼 TCS - Senior Software Engineer</h4>
          <p style="margin: 0; font-size: 0.8rem; color: #666;">Jun 2019 - May 2023 • Java backend, microservices, 4 years</p>
        </div>
      </div>
    `;
  } else if (category === 'contact') {
    html = `
      <div style="background: white; padding: 1.5rem; border-radius: 12px; border-left: 4px solid #f59e0b; text-align: center;">
        <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #1a1a2e;">Let's Connect! 🤝</h3>
        <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9rem;">
          <a href="mailto:saiteja.srivllibhutturu@gmail.com" style="color: #2563eb; text-decoration: none; font-weight: 500;">📧 saiteja.srivllibhutturu@gmail.com</a>
          <a href="https://linkedin.com/in/saitejasrivillibhutturu" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 500;">💼 LinkedIn</a>
          <a href="https://github.com/saitejasrivilli" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 500;">💻 GitHub</a>
          <a href="https://scholar.google.com/citations?user=StKZohYAAAAJ" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 500;">📚 Google Scholar</a>
        </div>
        <p style="margin: 1rem 0 0 0; font-size: 0.8rem; color: #666;">Open to ML Engineering, LLM/GenAI, and Backend roles!</p>
      </div>
    `;
  }

  content.innerHTML = html;
}

console.log('✅ Portfolio features loaded!');

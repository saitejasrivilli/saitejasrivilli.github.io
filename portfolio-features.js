/**
 * CLAUDE-STYLE PORTFOLIO EXPLORER
 * Inserted right below hero section with profile details
 */

console.log('🎨 Claude-style Portfolio UI Loading...');

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolioUI);
} else {
  initPortfolioUI();
}

function initPortfolioUI() {
  console.log('✅ Initializing Claude-style UI...');
  
  // Find the hero section (look for profile buttons area)
  let insertPoint = document.querySelector('[class*="button"]') || 
                    document.querySelector('a[href*="resume"]') ||
                    document.querySelector('.button-group');
  
  if (!insertPoint) {
    // Fallback: find first section after hero
    const sections = document.querySelectorAll('section');
    insertPoint = sections[1] || document.body;
  }

  // Get parent and insert after
  if (insertPoint && insertPoint.parentElement) {
    insertPoint = insertPoint.closest('section') || insertPoint.parentElement;
  }

  // Create the explorer container
  const container = document.createElement('div');
  container.id = 'claude-portfolio-explorer';
  container.style.cssText = `
    width: 100%;
    background: white;
    padding: 4rem 2rem;
    margin: 2rem 0 0 0;
  `;

  container.innerHTML = `
    <div style="max-width: 1200px; margin: 0 auto;">
      
      <!-- Title -->
      <div style="text-align: center; margin-bottom: 2rem;">
        <h2 style="margin: 0 0 0.5rem 0; color: #1a1a2e; font-size: 1.8rem; font-weight: 700;">Explore My Work</h2>
        <p style="margin: 0; color: #666; font-size: 1rem;">Search or click below to discover my projects, skills, and experience</p>
      </div>

      <!-- Response Area -->
      <div id="explorer-response" style="
        min-height: 280px;
        margin-bottom: 2rem;
        padding: 2.5rem;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        border: 2px solid #e5e7eb;
        border-radius: 16px;
        color: #1a1a2e;
      ">
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">👋</div>
          <div style="font-size: 1.2rem; margin-bottom: 0.75rem; font-weight: 600; color: #1a1a2e;">Welcome!</div>
          <div style="font-size: 0.95rem; color: #666; margin-bottom: 1.5rem;">Click a button below or type in the search box to explore my portfolio</div>
          
          <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center;">
            <button onclick="explorePortfolio('projects')" style="padding: 0.75rem 1.75rem; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.95rem; transition: all 0.3s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">💼 Projects</button>
            <button onclick="explorePortfolio('skills')" style="padding: 0.75rem 1.75rem; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.95rem; transition: all 0.3s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">🛠️ Skills</button>
            <button onclick="explorePortfolio('experience')" style="padding: 0.75rem 1.75rem; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.95rem; transition: all 0.3s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">🎯 Experience</button>
            <button onclick="explorePortfolio('research')" style="padding: 0.75rem 1.75rem; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.95rem; transition: all 0.3s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">📚 Research</button>
          </div>
        </div>
      </div>

      <!-- Search Input Area (Claude-style) -->
      <div style="
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.25rem;
        display: flex;
        gap: 1rem;
        align-items: flex-end;
      ">
        <input 
          id="explorer-input" 
          type="text" 
          placeholder="Ask me about my projects, skills, experience, research..." 
          onkeypress="handleKeyPress(event)"
          style="
            flex: 1;
            background: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 1rem;
            color: #1a1a2e;
            font-size: 0.95rem;
            font-family: Arial, sans-serif;
            outline: none;
            transition: border-color 0.3s;
          "
          onfocus="this.style.borderColor='#2563eb'; this.style.background='#ffffff'"
          onblur="this.style.borderColor='#ddd'; this.style.background='#f8f9fa'"
        />
        <button 
          onclick="handleSearch()" 
          style="
            background: #ea580c;
            color: white;
            border: none;
            border-radius: 8px;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 1.3rem;
            transition: all 0.3s;
          "
          onmouseover="this.style.background='#dc2626'"
          onmouseout="this.style.background='#ea580c'"
        >
          ↑
        </button>
      </div>
    </div>
  `;

  // Insert right after hero section
  if (insertPoint && insertPoint.nextSibling) {
    insertPoint.parentElement.insertBefore(container, insertPoint.nextSibling);
  } else if (insertPoint) {
    insertPoint.parentElement.appendChild(container);
  } else {
    document.body.appendChild(container);
  }

  console.log('✅ Claude-style UI inserted!');
}

// Portfolio knowledge base
const portfolioKB = {
  projects: {
    title: "💼 My Projects",
    content: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
        <div style="background: #f0f4ff; border: 1px solid #d0deff; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 0.5rem 0; color: #2563eb; font-size: 1rem;">🔧 CUDA Attention Kernel</h3>
          <p style="margin: 0.5rem 0 0 0; color: #333; font-size: 0.9rem; line-height: 1.6;">Custom CUDA C++ attention kernel with pybind11 PyTorch binding. 5.64x faster than PyTorch. AWS Inferentia deployment achieving 3.7x speedup.</p>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <span style="background: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">CUDA C++</span>
            <span style="background: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">PyTorch</span>
            <span style="background: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">AWS</span>
          </div>
        </div>
        
        <div style="background: #f0f4ff; border: 1px solid #d0deff; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 0.5rem 0; color: #2563eb; font-size: 1rem;">🤖 LLM Fine-Tuning</h3>
          <p style="margin: 0.5rem 0 0 0; color: #333; font-size: 0.9rem; line-height: 1.6;">Qwen2.5-7B fine-tuning with LoRA on UltraFeedback. 17% training loss reduction in 30 min on T4 GPU. 0.855 BERTScore.</p>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <span style="background: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">LoRA</span>
            <span style="background: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">QLoRA</span>
            <span style="background: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">TRL</span>
          </div>
        </div>
        
        <div style="background: #f0f4ff; border: 1px solid #d0deff; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 0.5rem 0; color: #2563eb; font-size: 1rem;">⚡ Attention Optimization</h3>
          <p style="margin: 0.5rem 0 0 0; color: #333; font-size: 0.9rem; line-height: 1.6;">FlashAttention-2 benchmarking on NVIDIA L4. 12.3x throughput improvement, 99.7% memory reduction vs vanilla.</p>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <span style="background: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">FlashAttention</span>
            <span style="background: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">ONNX</span>
            <span style="background: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">TensorRT</span>
          </div>
        </div>
        
        <div style="background: #f0f4ff; border: 1px solid #d0deff; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 0.5rem 0; color: #2563eb; font-size: 1rem;">🧠 AI Agent System</h3>
          <p style="margin: 0.5rem 0 0 0; color: #333; font-size: 0.9rem; line-height: 1.6;">Chain-of-Thought, Tree-of-Thoughts, ReAct. Real-time web search via Tavily. ChromaDB vector memory.</p>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <span style="background: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">Groq</span>
            <span style="background: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">RAG</span>
            <span style="background: #2563eb; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">Agents</span>
          </div>
        </div>
      </div>
    `
  },

  skills: {
    title: "🛠️ Technical Skills",
    content: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
        <div style="background: #f0f4ff; border: 1px solid #d0deff; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 1rem 0; color: #2563eb; font-size: 1rem;">🤖 AI/ML</h3>
          <p style="margin: 0; color: #333; line-height: 1.8; font-size: 0.9rem;">PyTorch • TensorFlow • CUDA • LLMs • LoRA/PEFT • QLoRA • RAG • Quantization</p>
        </div>
        
        <div style="background: #f0f4ff; border: 1px solid #d0deff; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 1rem 0; color: #2563eb; font-size: 1rem;">🔧 Infrastructure</h3>
          <p style="margin: 0; color: #333; line-height: 1.8; font-size: 0.9rem;">Kubernetes • Docker • FastAPI • AWS (S3, EC2, SageMaker) • PostgreSQL • Redis</p>
        </div>
        
        <div style="background: #f0f4ff; border: 1px solid #d0deff; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 1rem 0; color: #2563eb; font-size: 1rem;">💻 Languages</h3>
          <p style="margin: 0; color: #333; line-height: 1.8; font-size: 0.9rem;">Python • C++ • Java • Go • SQL</p>
        </div>
        
        <div style="background: #f0f4ff; border: 1px solid #d0deff; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 1rem 0; color: #2563eb; font-size: 1rem;">📚 Specializations</h3>
          <p style="margin: 0; color: #333; line-height: 1.8; font-size: 0.9rem;">GPU Optimization • LLM Inference • Model Compression • Computer Vision</p>
        </div>
      </div>
    `
  },

  experience: {
    title: "🎯 Work Experience",
    content: `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="background: #f0f9f4; border: 1px solid #d0f0e0; border-left: 4px solid #10b981; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 0.25rem 0; color: #10b981; font-size: 1rem; font-weight: 600;">🏥 Qure.ai - AI Solutions Engineer</h3>
          <p style="margin: 0; color: #666; font-size: 0.85rem;">Mar 2026 - Present</p>
          <p style="margin: 0.75rem 0 0 0; color: #333; line-height: 1.6; font-size: 0.9rem;">LLM configuration for clinical automation. EPIC/FHIR integrations with hospital systems. Real-time inference deployment across 6+ health systems.</p>
        </div>
        
        <div style="background: #f0f9f4; border: 1px solid #d0f0e0; border-left: 4px solid #10b981; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 0.25rem 0; color: #10b981; font-size: 1rem; font-weight: 600;">📊 UTA - Graduate Research Assistant</h3>
          <p style="margin: 0; color: #666; font-size: 0.85rem;">Jun 2025 - Present</p>
          <p style="margin: 0.75rem 0 0 0; color: #333; line-height: 1.6; font-size: 0.9rem;">TopGPT: Full-stack LLM with RAG on 1000+ papers. CTMap: LLM-enabled 6G path planning (IEEE ICC 2026). Real-time Sionna integration.</p>
        </div>
        
        <div style="background: #f0f9f4; border: 1px solid #d0f0e0; border-left: 4px solid #10b981; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 0.25rem 0; color: #10b981; font-size: 1rem; font-weight: 600;">🏥 DentalScan - ML Engineer</h3>
          <p style="margin: 0; color: #666; font-size: 0.85rem;">Dec 2025 - Feb 2026</p>
          <p style="margin: 0.75rem 0 0 0; color: #333; line-height: 1.6; font-size: 0.9rem;">Computer vision pipelines for dental images (6+ categories). CNN on 50K+ labeled dataset. Automated AWS SageMaker retraining.</p>
        </div>
        
        <div style="background: #f0f9f4; border: 1px solid #d0f0e0; border-left: 4px solid #10b981; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 0.25rem 0; color: #10b981; font-size: 1rem; font-weight: 600;">💼 TCS - Senior Software Engineer</h3>
          <p style="margin: 0; color: #666; font-size: 0.85rem;">Jun 2019 - May 2023 (4 years)</p>
          <p style="margin: 0.75rem 0 0 0; color: #333; line-height: 1.6; font-size: 0.9rem;">Java-based microservices handling millions of records. Owned system design for 10+ enterprise clients. 40% latency reduction.</p>
        </div>
      </div>
    `
  },

  research: {
    title: "📚 Research & Publications",
    content: `
      <div style="background: #f0f4ff; border: 1px solid #d0deff; border-radius: 12px; padding: 2rem;">
        <div style="background: #fff8e6; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 1.5rem;">
          <h4 style="margin: 0 0 0.5rem 0; color: #f59e0b; font-size: 1rem; font-weight: 600;">📝 IEEE ICC 2026</h4>
          <p style="margin: 0 0 0.5rem 0; color: #333; font-weight: 500; font-size: 0.95rem;">CTMap: LLM-Enabled Connectivity-Aware Path Planning for mmWave 6G Networks</p>
          <p style="margin: 0; color: #666; font-size: 0.9rem; line-height: 1.6;">Fine-tuned LLMs on Dijkstra paths from OpenStreetMap. 6G wireless simulation with Sionna. 12.3× throughput, 4× memory reduction.</p>
          <p style="margin: 0.75rem 0 0 0; color: #2563eb; font-size: 0.9rem;">
            <a href="https://arxiv.org/html/2601.00110v1" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 500;">📄 arXiv</a> • 
            <a href="https://scholar.google.com/citations?user=StKZohYAAAAJ" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 500;">📚 Scholar</a>
          </p>
        </div>
        
        <div style="color: #333;">
          <p style="margin: 0.5rem 0; font-size: 0.95rem;"><strong style="color: #2563eb;">In Progress:</strong> Multi-Agent RL for Congestion Pricing</p>
          <p style="margin: 0.5rem 0; font-size: 0.95rem;"><strong style="color: #2563eb;">In Progress:</strong> Cross-Encoder Enhanced RAG for Telecom</p>
        </div>
      </div>
    `
  }
};

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    handleSearch();
  }
}

function handleSearch() {
  const input = document.getElementById('explorer-input');
  const query = input.value.trim().toLowerCase();
  
  if (!query) return;
  
  explorePortfolio(detectCategory(query));
  input.value = '';
  input.focus();
}

function detectCategory(query) {
  if (query.includes('project') || query.includes('build') || query.includes('work')) return 'projects';
  if (query.includes('skill') || query.includes('tech') || query.includes('stack')) return 'skills';
  if (query.includes('experience') || query.includes('job') || query.includes('work') || query.includes('company')) return 'experience';
  if (query.includes('research') || query.includes('paper') || query.includes('publication') || query.includes('ieee')) return 'research';
  return 'projects';
}

function explorePortfolio(category) {
  const response = document.getElementById('explorer-response');
  const data = portfolioKB[category];
  
  if (!data) return;
  
  response.style.opacity = '0.8';
  
  setTimeout(() => {
    response.innerHTML = `
      <h2 style="margin: 0 0 1.5rem 0; color: #1a1a2e; font-size: 1.4rem;">${data.title}</h2>
      ${data.content}
    `;
    response.style.opacity = '1';
  }, 150);
  
  response.style.transition = 'opacity 0.2s ease';
}

console.log('✅ Claude-style portfolio UI fully loaded!');

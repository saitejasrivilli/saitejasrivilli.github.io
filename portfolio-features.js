/**
 * CLAUDE-STYLE PORTFOLIO EXPLORER
 * Search/input interface like Claude.ai
 * Shows relevant portfolio info based on what user asks
 */

console.log('🎨 Portfolio Explorer Loading...');

// Wait for page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolioUI);
} else {
  initPortfolioUI();
}

function initPortfolioUI() {
  console.log('✅ Initializing Claude-style UI...');
  
  // Find or create container (place before footer or at end of content)
  let container = document.getElementById('portfolio-explorer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'portfolio-explorer';
    document.body.appendChild(container);
  }
  
  container.innerHTML = `
    <div style="width: 100%; background: #0f172a; padding: 3rem 2rem; border-top: 1px solid #1e293b;">
      <div style="max-width: 1200px; margin: 0 auto;">
        
        <!-- Response Area -->
        <div id="explorer-response" style="
          min-height: 200px;
          margin-bottom: 2rem;
          padding: 2rem;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid #334155;
          border-radius: 12px;
          color: #e2e8f0;
        ">
          <div style="text-align: center; padding: 2rem; color: #94a3b8;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">👋</div>
            <div style="font-size: 1.1rem; margin-bottom: 0.5rem;">Welcome to My Portfolio</div>
            <div style="font-size: 0.9rem; color: #64748b;">Ask about my projects, skills, experience, or anything else!</div>
            <div style="margin-top: 1.5rem; display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center;">
              <button onclick="explorePortfolio('projects')" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">💼 Projects</button>
              <button onclick="explorePortfolio('skills')" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">🛠️ Skills</button>
              <button onclick="explorePortfolio('experience')" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">🎯 Experience</button>
              <button onclick="explorePortfolio('research')" style="padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">📚 Research</button>
            </div>
          </div>
        </div>

        <!-- Input Area (Claude-style) -->
        <div style="
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          gap: 0.75rem;
          align-items: flex-end;
        ">
          <input 
            id="explorer-input" 
            type="text" 
            placeholder="Ask me about my projects, skills, experience, research, or anything else..." 
            onkeypress="handleKeyPress(event)"
            style="
              flex: 1;
              background: #0f172a;
              border: 1px solid #334155;
              border-radius: 8px;
              padding: 0.75rem 1rem;
              color: #e2e8f0;
              font-size: 0.95rem;
              font-family: Arial, sans-serif;
              outline: none;
              transition: border-color 0.3s;
            "
            onfocus="this.style.borderColor='#3b82f6'"
            onblur="this.style.borderColor='#334155'"
          />
          <button 
            onclick="handleSearch()" 
            style="
              background: #ea580c;
              color: white;
              border: none;
              border-radius: 8px;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              font-size: 1.2rem;
              transition: all 0.3s;
            "
            onmouseover="this.style.background='#dc2626'"
            onmouseout="this.style.background='#ea580c'"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  `;
  
  console.log('✅ Claude-style UI created!');
}

// Portfolio knowledge base
const portfolioKB = {
  projects: {
    title: "💼 My Projects",
    content: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 0.5rem 0; color: #60a5fa; font-size: 1.1rem;">🔧 CUDA Attention Kernel + AWS Neuron</h3>
          <p style="margin: 0; color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">Custom CUDA C++ attention with pybind11 PyTorch binding. 5.64x faster than PyTorch at N=32. GPT-2 on AWS Inferentia achieving 3.7x speedup (45ms→12ms).</p>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <span style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">CUDA C++</span>
            <span style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">PyTorch</span>
            <span style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">AWS</span>
          </div>
        </div>
        
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 0.5rem 0; color: #60a5fa; font-size: 1.1rem;">🤖 LLM Fine-Tuning: Qwen-7B</h3>
          <p style="margin: 0; color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">Supervised fine-tuning with LoRA (r=8, alpha=16) on UltraFeedback. 17% training loss reduction in 30 min on T4 GPU. 0.855 BERTScore.</p>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <span style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">LoRA</span>
            <span style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">QLoRA</span>
            <span style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">TRL</span>
          </div>
        </div>
        
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 0.5rem 0; color: #60a5fa; font-size: 1.1rem;">⚡ Attention Optimization Suite</h3>
          <p style="margin: 0; color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">Benchmarking framework on NVIDIA L4. FlashAttention-2: 12.3x throughput improvement, 99.7% memory reduction vs vanilla attention.</p>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <span style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">FlashAttention-2</span>
            <span style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">ONNX</span>
            <span style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">TensorRT</span>
          </div>
        </div>
        
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 0.5rem 0; color: #60a5fa; font-size: 1.1rem;">🧠 Advanced AI Agent System</h3>
          <p style="margin: 0; color: #cbd5e1; font-size: 0.9rem; line-height: 1.6;">Multi-strategy reasoning: Chain-of-Thought, Tree-of-Thoughts, ReAct. Real-time web search via Tavily. ChromaDB vector memory. Multi-agent collaboration.</p>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <span style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">Groq</span>
            <span style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">RAG</span>
            <span style="background: #3b82f6; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">Agents</span>
          </div>
        </div>
      </div>
    `
  },

  skills: {
    title: "🛠️ Technical Skills",
    content: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 1rem 0; color: #60a5fa; font-size: 1rem;">🤖 AI/ML</h3>
          <p style="margin: 0; color: #cbd5e1; line-height: 1.8; font-size: 0.95rem;">PyTorch • TensorFlow • CUDA • LLMs • LoRA/PEFT • QLoRA • RAG • Quantization • Fine-tuning</p>
        </div>
        
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 1rem 0; color: #60a5fa; font-size: 1rem;">🔧 Infrastructure</h3>
          <p style="margin: 0; color: #cbd5e1; line-height: 1.8; font-size: 0.95rem;">Kubernetes • Docker • FastAPI • AWS (S3, EC2, SageMaker) • PostgreSQL • Redis • Airflow</p>
        </div>
        
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 1rem 0; color: #60a5fa; font-size: 1rem;">💻 Languages</h3>
          <p style="margin: 0; color: #cbd5e1; line-height: 1.8; font-size: 0.95rem;">Python • C++ • Java • Go • SQL</p>
        </div>
        
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem;">
          <h3 style="margin: 0 0 1rem 0; color: #60a5fa; font-size: 1rem;">📚 Specializations</h3>
          <p style="margin: 0; color: #cbd5e1; line-height: 1.8; font-size: 0.95rem;">GPU Optimization • LLM Inference • Model Compression • Computer Vision • Distributed Systems</p>
        </div>
      </div>
    `
  },

  experience: {
    title: "🎯 Work Experience",
    content: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem; border-left: 4px solid #10b981;">
          <h3 style="margin: 0 0 0.5rem 0; color: #10b981; font-size: 1.1rem;">🏥 Qure.ai - AI Solutions Engineer</h3>
          <p style="margin: 0; color: #94a3b8; font-size: 0.9rem;">Mar 2026 - Present</p>
          <p style="margin: 0.75rem 0 0 0; color: #cbd5e1; line-height: 1.6;">LLM configuration for clinical protocol automation. EPIC/FHIR integrations with hospital systems (Mount Sinai, Medstar). Real-time inference deployment across 6+ health systems.</p>
        </div>
        
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem; border-left: 4px solid #10b981;">
          <h3 style="margin: 0 0 0.5rem 0; color: #10b981; font-size: 1.1rem;">📊 UTA - Graduate Research Assistant</h3>
          <p style="margin: 0; color: #94a3b8; font-size: 0.9rem;">Jun 2025 - Present</p>
          <p style="margin: 0.75rem 0 0 0; color: #cbd5e1; line-height: 1.6;">TopGPT project: Full-stack LLM application with RAG on 1000+ research papers. CTMap: LLM-enabled 6G path planning (IEEE ICC 2026 publication). Fine-tuning on Dijkstra-generated paths with real-time Sionna integration.</p>
        </div>
        
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem; border-left: 4px solid #10b981;">
          <h3 style="margin: 0 0 0.5rem 0; color: #10b981; font-size: 1.1rem;">🏥 DentalScan/ReplyQuickAI - ML Engineer</h3>
          <p style="margin: 0; color: #94a3b8; font-size: 0.9rem;">Dec 2025 - Feb 2026</p>
          <p style="margin: 0.75rem 0 0 0; color: #cbd5e1; line-height: 1.6;">Computer vision pipelines for intra-oral image analysis (6+ clinical categories). CNN models on 50K+ labeled dental dataset. Automated retraining on AWS SageMaker with MLflow.</p>
        </div>
        
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem; border-left: 4px solid #10b981;">
          <h3 style="margin: 0 0 0.5rem 0; color: #10b981; font-size: 1.1rem;">💼 TCS - Senior Software Engineer</h3>
          <p style="margin: 0; color: #94a3b8; font-size: 0.9rem;">Jun 2019 - May 2023 (4 years)</p>
          <p style="margin: 0.75rem 0 0 0; color: #cbd5e1; line-height: 1.6;">Java-based distributed data processing microservices handling millions of records daily. Owned system design for 10+ enterprise clients. 40% latency reduction through service refactoring.</p>
        </div>
      </div>
    `
  },

  research: {
    title: "📚 Research & Publications",
    content: `
      <div style="background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 2rem;">
        <h3 style="margin: 0 0 1.5rem 0; color: #60a5fa; font-size: 1.2rem;">📝 Published Research</h3>
        
        <div style="background: #0f172a; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #f59e0b;">
          <h4 style="margin: 0 0 0.5rem 0; color: #fbbf24; font-size: 1.05rem;">IEEE ICC 2026</h4>
          <p style="margin: 0 0 0.5rem 0; color: #cbd5e1; font-weight: 500;">CTMap: LLM-Enabled Connectivity-Aware Path Planning for mmWave 6G Networks</p>
          <p style="margin: 0; color: #94a3b8; font-size: 0.9rem;">Fine-tuned LLMs on Dijkstra-generated paths from OpenStreetMap. Real-time 6G wireless simulation with Sionna. Achieved 12.3× throughput and 4× memory reduction.</p>
          <p style="margin: 0.75rem 0 0 0; color: #60a5fa; font-size: 0.9rem;">
            <a href="https://arxiv.org/html/2601.00110v1" target="_blank" style="color: #60a5fa; text-decoration: none; font-weight: 500;">📄 arXiv</a> • 
            <a href="https://scholar.google.com/citations?user=StKZohYAAAAJ" target="_blank" style="color: #60a5fa; text-decoration: none; font-weight: 500;">📚 Google Scholar</a>
          </p>
        </div>
        
        <div style="color: #cbd5e1; line-height: 1.8;">
          <p style="margin: 0.5rem 0;"><strong style="color: #60a5fa;">In Progress:</strong> Equity-Aware Congestion Pricing with Multi-Agent RL</p>
          <p style="margin: 0.5rem 0;"><strong style="color: #60a5fa;">In Progress:</strong> TopGPT - Cross-Encoder Enhanced RAG for Telecom</p>
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
}

function detectCategory(query) {
  if (query.includes('project') || query.includes('build') || query.includes('work')) return 'projects';
  if (query.includes('skill') || query.includes('tech') || query.includes('stack')) return 'skills';
  if (query.includes('experience') || query.includes('job') || query.includes('intern') || query.includes('company')) return 'experience';
  if (query.includes('research') || query.includes('paper') || query.includes('publication') || query.includes('ieee')) return 'research';
  return 'projects';
}

function explorePortfolio(category) {
  const response = document.getElementById('explorer-response');
  const data = portfolioKB[category];
  
  if (!data) return;
  
  response.style.opacity = '0.7';
  
  setTimeout(() => {
    response.innerHTML = `
      <div>
        <h2 style="margin: 0 0 1.5rem 0; color: #60a5fa; font-size: 1.5rem;">${data.title}</h2>
        ${data.content}
      </div>
    `;
    response.style.opacity = '1';
  }, 200);
  
  response.style.transition = 'opacity 0.2s ease';
}

console.log('✅ Claude-style portfolio UI loaded!');

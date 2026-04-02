/**
 * FULLY DYNAMIC PORTFOLIO EXPLORER - FIXED VERSION
 * Clean, simple, works perfectly
 */

console.log('🎨 Dynamic Portfolio Explorer Starting...');

// Wait for DOM
function initWhenReady() {
  console.log('✅ Initializing...');
  
  // Find insertion point
  let insertPoint = document.querySelector('section') || document.body;
  
  // Create main container
  const container = document.createElement('div');
  container.id = 'dynamic-explorer';
  container.style.cssText = `
    width: 100%;
    background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
    padding: 3rem 2rem;
    margin: 2rem 0 0 0;
  `;

  // Inner wrapper
  const inner = document.createElement('div');
  inner.style.cssText = `
    max-width: 900px;
    margin: 0 auto;
  `;

  // Response area
  const response = document.createElement('div');
  response.id = 'response-area';
  response.style.cssText = `
    min-height: 300px;
    margin-bottom: 2rem;
    padding: 3rem 2rem;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 16px;
    color: #1a1a2e;
    position: relative;
    overflow: hidden;
  `;

  response.innerHTML = `
    <div style="text-align: center; padding: 2rem 1rem; color: #999;">
      <div style="font-size: 2.5rem; margin-bottom: 1rem;">👋</div>
      <div style="font-size: 1.2rem; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Welcome to my portfolio</div>
      <div style="font-size: 0.95rem;">Ask me about my projects, skills, experience, research, or contact...</div>
    </div>
  `;

  // Input area
  const inputArea = document.createElement('div');
  inputArea.style.cssText = `
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 14px;
    padding: 1.25rem;
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  `;

  const input = document.createElement('input');
  input.id = 'query-input';
  input.type = 'text';
  input.placeholder = 'Ask me about my projects, skills, experience, research...';
  input.style.cssText = `
    flex: 1;
    background: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 1rem;
    color: #1a1a2e;
    font-size: 0.95rem;
    font-family: Arial, sans-serif;
    outline: none;
  `;

  input.addEventListener('focus', function() {
    this.style.borderColor = '#2563eb';
    this.style.background = '#ffffff';
    this.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
  });

  input.addEventListener('blur', function() {
    this.style.borderColor = '#ddd';
    this.style.background = '#f8f9fa';
    this.style.boxShadow = 'none';
  });

  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  });

  const button = document.createElement('button');
  button.innerHTML = '↑';
  button.style.cssText = `
    background: #ea580c;
    color: white;
    border: none;
    border-radius: 10px;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.3rem;
    transition: all 0.3s;
    flex-shrink: 0;
  `;

  button.addEventListener('click', handleSearch);
  button.addEventListener('mouseover', function() {
    this.style.background = '#dc2626';
    this.style.transform = 'scale(1.05)';
  });
  button.addEventListener('mouseout', function() {
    this.style.background = '#ea580c';
    this.style.transform = 'scale(1)';
  });

  inputArea.appendChild(input);
  inputArea.appendChild(button);

  inner.appendChild(response);
  inner.appendChild(inputArea);
  container.appendChild(inner);

  // Insert after first section
  if (insertPoint && insertPoint.nextSibling) {
    insertPoint.parentElement.insertBefore(container, insertPoint.nextSibling);
  } else if (insertPoint) {
    insertPoint.parentElement.appendChild(container);
  }

  console.log('✅ Explorer UI created!');
}

// Portfolio data
const portfolioData = {
  projects: {
    keywords: ['project', 'build', 'created', 'developed', 'work', 'cuda', 'llm', 'qwen', 'attention', 'agent'],
    title: "💼 My Projects",
    render: () => {
      const items = [
        {
          name: "CUDA Attention Kernel + AWS Neuron",
          desc: "Custom CUDA C++ scaled-dot-product attention with pybind11 PyTorch binding. 5.64x faster than PyTorch at N=32. GPT-2 on AWS Inferentia achieving 3.7x speedup.",
          tech: ["CUDA C++", "PyTorch", "AWS Inferentia", "pybind11", "FastAPI"],
          impact: "5.64x faster"
        },
        {
          name: "Production LLM Fine-Tuning: Qwen-7B",
          desc: "Supervised fine-tuning with LoRA (r=8, alpha=16) on UltraFeedback. 17% loss reduction in 30 min on T4 GPU. 0.855 BERTScore.",
          tech: ["PyTorch", "LoRA/PEFT", "QLoRA", "TRL", "HuggingFace"],
          impact: "17% loss reduction"
        },
        {
          name: "Attention Optimization Suite",
          desc: "FlashAttention-2 benchmarking on NVIDIA L4. 12.3x throughput (573K→6.03M tok/s) and 99.7% memory reduction vs vanilla.",
          tech: ["PyTorch", "FlashAttention-2", "xFormers", "ONNX Runtime", "CUDA"],
          impact: "12.3x throughput"
        },
        {
          name: "Advanced AI Agent System",
          desc: "Chain-of-Thought, Tree-of-Thoughts, ReAct with real-time Tavily search. ChromaDB vector memory. Multi-agent collaboration.",
          tech: ["Python", "Groq", "Tavily", "ChromaDB", "Gradio"],
          impact: "Multi-agent"
        }
      ];
      
      let html = `<h2 style="margin: 0 0 2rem 0; color: #2563eb; font-size: 1.4rem;">${portfolioData.projects.title}</h2>`;
      html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">`;
      
      items.forEach(item => {
        html += `
          <div style="
            background: linear-gradient(135deg, #f0f4ff 0%, #f8f9fa 100%);
            border: 2px solid #d0deff;
            border-radius: 12px;
            padding: 1.75rem;
            transition: all 0.3s;
            cursor: pointer;
          " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(37,99,235,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
              <h3 style="margin: 0; color: #2563eb; font-size: 1.05rem; flex: 1;">${item.name}</h3>
              <span style="background: #2563eb; color: white; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; margin-left: 0.5rem;">${item.impact}</span>
            </div>
            <p style="margin: 0.75rem 0 0 0; color: #333; font-size: 0.9rem; line-height: 1.6;">${item.desc}</p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1.25rem;">
              ${item.tech.map(t => `<span style="background: #2563eb; color: white; padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">${t}</span>`).join('')}
            </div>
          </div>
        `;
      });
      
      html += `</div>`;
      return html;
    }
  },

  skills: {
    keywords: ['skill', 'tech', 'technology', 'stack', 'know', 'experienced', 'language', 'tool'],
    title: "🛠️ Technical Skills",
    render: () => {
      const categories = [
        { name: "🤖 AI/ML", items: ["PyTorch", "TensorFlow", "CUDA", "LLMs", "LoRA/PEFT", "QLoRA", "RAG", "Quantization", "Fine-tuning", "FlashAttention"] },
        { name: "🔧 Infrastructure", items: ["Kubernetes", "Docker", "FastAPI", "AWS (S3, EC2, SageMaker)", "PostgreSQL", "Redis", "Airflow", "MLflow", "Spark"] },
        { name: "💻 Languages", items: ["Python", "C++", "Java", "Go", "SQL"] },
        { name: "📚 Specializations", items: ["GPU Optimization", "LLM Inference", "Model Compression", "Computer Vision", "Distributed Systems"] }
      ];
      
      let html = `<h2 style="margin: 0 0 2rem 0; color: #2563eb; font-size: 1.4rem;">${portfolioData.skills.title}</h2>`;
      html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">`;
      
      categories.forEach(cat => {
        html += `
          <div style="background: linear-gradient(135deg, #f0f4ff 0%, #f8f9fa 100%); border: 2px solid #d0deff; border-radius: 12px; padding: 1.75rem;">
            <h3 style="margin: 0 0 1rem 0; color: #2563eb; font-size: 1rem;">${cat.name}</h3>
            <p style="margin: 0; color: #333; line-height: 1.8; font-size: 0.9rem;">${cat.items.join(' • ')}</p>
          </div>
        `;
      });
      
      html += `</div>`;
      return html;
    }
  },

  experience: {
    keywords: ['experience', 'work', 'job', 'intern', 'company', 'role', 'worked', 'qure', 'uta', 'tcs', 'dental'],
    title: "🎯 Work Experience",
    render: () => {
      const jobs = [
        { company: "Qure.ai", role: "AI Solutions Engineer", period: "Mar 2026 - Present", desc: "Clinical LLM workflows, EPIC/FHIR integration, real-time inference on 6+ health systems.", highlight: "🏥 Healthcare" },
        { company: "UTA", role: "Graduate Research Assistant", period: "Jun 2025 - Present", desc: "TopGPT: LLM + RAG on 1000+ papers. CTMap: IEEE ICC 2026 publication on 6G path planning.", highlight: "📊 Research" },
        { company: "DentalScan/ReplyQuickAI", role: "ML Engineer", period: "Dec 2025 - Feb 2026", desc: "Computer vision for dental images (6+ categories), CNN on 50K+ dataset, AWS SageMaker retraining.", highlight: "🏥 Healthcare ML" },
        { company: "TCS", role: "Senior Software Engineer", period: "Jun 2019 - May 2023 (4 years)", desc: "Java microservices handling millions of records, system design for 10+ enterprise clients, 40% latency reduction.", highlight: "💼 Backend" }
      ];
      
      let html = `<h2 style="margin: 0 0 2rem 0; color: #2563eb; font-size: 1.4rem;">${portfolioData.experience.title}</h2>`;
      html += `<div style="display: flex; flex-direction: column; gap: 1.25rem;">`;
      
      jobs.forEach(job => {
        html += `
          <div style="background: linear-gradient(135deg, #f0f9f4 0%, #f0faf8 100%); border: 2px solid #d0f0e0; border-left: 5px solid #10b981; border-radius: 12px; padding: 1.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
              <h3 style="margin: 0; color: #10b981; font-size: 1.05rem;">${job.company}</h3>
              <span style="background: #10b981; color: white; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">${job.highlight}</span>
            </div>
            <p style="margin: 0; color: #333; font-weight: 500; font-size: 0.95rem;">${job.role}</p>
            <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.85rem;">${job.period}</p>
            <p style="margin: 1rem 0 0 0; color: #333; font-size: 0.9rem; line-height: 1.6;">${job.desc}</p>
          </div>
        `;
      });
      
      html += `</div>`;
      return html;
    }
  },

  research: {
    keywords: ['research', 'paper', 'publication', 'ieee', 'scholar', 'published'],
    title: "📚 Research & Publications",
    render: () => {
      let html = `<h2 style="margin: 0 0 2rem 0; color: #2563eb; font-size: 1.4rem;">${portfolioData.research.title}</h2>`;
      html += `
        <div style="background: linear-gradient(135deg, #fef8e6 0%, #fff9ed 100%); border: 2px solid #fdd835; border-radius: 12px; padding: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
            <h3 style="margin: 0; color: #f59e0b; font-size: 1.1rem;">CTMap: LLM-Enabled 6G Path Planning</h3>
            <span style="background: #f59e0b; color: white; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">🏆 IEEE ICC 2026</span>
          </div>
          <p style="margin: 1rem 0 0 0; color: #333; font-size: 0.9rem; line-height: 1.6;">Fine-tuned LLMs on Dijkstra paths from OpenStreetMap. Applied to Sionna 6G wireless simulation. 12.3× throughput, 4× memory reduction.</p>
          <div style="margin-top: 1.25rem; display: flex; gap: 1rem;">
            <a href="https://arxiv.org/html/2601.00110v1" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 500; font-size: 0.9rem;">📄 arXiv</a>
            <a href="https://scholar.google.com/citations?user=StKZohYAAAAJ" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 500; font-size: 0.9rem;">📚 Scholar</a>
          </div>
        </div>
      `;
      return html;
    }
  },

  contact: {
    keywords: ['contact', 'reach', 'email', 'linkedin', 'github', 'connect'],
    title: "📞 Contact & Links",
    render: () => {
      const links = [
        { icon: "📧", type: "Email", value: "saiteja.srivllibhutturu@gmail.com", url: "mailto:saiteja.srivllibhutturu@gmail.com" },
        { icon: "💼", type: "LinkedIn", value: "saitejasrivillibhutturu", url: "https://linkedin.com/in/saitejasrivillibhutturu" },
        { icon: "💻", type: "GitHub", value: "saitejasrivilli", url: "https://github.com/saitejasrivilli" },
        { icon: "📚", type: "Scholar", value: "Publications", url: "https://scholar.google.com/citations?user=StKZohYAAAAJ" }
      ];
      
      let html = `<h2 style="margin: 0 0 2rem 0; color: #2563eb; font-size: 1.4rem;">${portfolioData.contact.title}</h2>`;
      html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">`;
      
      links.forEach(link => {
        html += `
          <a href="${link.url}" target="_blank" style="
            background: linear-gradient(135deg, #f0f4ff 0%, #f8f9fa 100%);
            border: 2px solid #d0deff;
            border-radius: 12px;
            padding: 1.75rem;
            text-decoration: none;
            transition: all 0.3s;
            display: block;
          " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(37,99,235,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            <div style="font-size: 1.5rem; margin-bottom: 0.75rem;">${link.icon}</div>
            <div style="color: #2563eb; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.5rem;">${link.type}</div>
            <div style="color: #333; font-size: 0.9rem;">${link.value}</div>
          </a>
        `;
      });
      
      html += `</div>`;
      return html;
    }
  }
};

function showLoading() {
  const response = document.getElementById('response-area');
  response.innerHTML = `
    <div style="text-align: center; padding: 3rem 1rem;">
      <div style="margin-bottom: 2rem;">
        <div style="width: 60px; height: 60px; margin: 0 auto 1.5rem; background: linear-gradient(45deg, #2563eb, #3b82f6); border-radius: 12px; animation: bounce 1.4s infinite;"></div>
        <style>
          @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #2563eb; margin: 0 4px; animation: dot 1.4s infinite; }
          .dot:nth-child(2) { animation-delay: 0.2s; }
          .dot:nth-child(3) { animation-delay: 0.4s; }
          @keyframes dot {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
            30% { transform: translateY(-10px); opacity: 1; }
          }
        </style>
      </div>
      <div style="font-size: 1.1rem; color: #333; margin-bottom: 0.5rem; font-weight: 500;">Fetching content...</div>
      <div><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
    </div>
  `;
}

function detectCategory(query) {
  for (const [key, data] of Object.entries(portfolioData)) {
    if (data.keywords.some(kw => query.includes(kw))) {
      return key;
    }
  }
  return 'projects';
}

function handleSearch() {
  const input = document.getElementById('query-input');
  const query = input.value.trim().toLowerCase();
  
  console.log('Query:', query);
  
  if (!query) return;
  
  const category = detectCategory(query);
  console.log('Category detected:', category);
  
  showLoading();
  
  setTimeout(() => {
    const response = document.getElementById('response-area');
    response.innerHTML = portfolioData[category].render();
    response.style.opacity = '0';
    response.style.transition = 'opacity 0.3s';
    setTimeout(() => response.style.opacity = '1', 10);
  }, 1500);
  
  input.value = '';
}

// Start when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWhenReady);
} else {
  initWhenReady();
}

console.log('✅ Portfolio explorer loaded!');

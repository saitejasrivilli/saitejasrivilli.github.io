/**
 * ULTIMATE AGENTIC PORTFOLIO EXPLORER
 * - Animated data fetching with step-by-step progress
 * - Staggered card reveal animation
 * - 3D flip card hover effects
 * - Interactive timeline for experience
 * - Dynamic skill cloud
 * - Ultra-professional, very agentic feel
 */

console.log('🚀 ULTIMATE Portfolio Explorer Loading...');

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolioUI);
} else {
  initPortfolioUI();
}

function initPortfolioUI() {
  console.log('✅ Initializing ultimate explorer...');
  
  let insertPoint = document.querySelector('section') || document.body;
  
  const container = document.createElement('div');
  container.id = 'ultimate-explorer';
  container.style.cssText = `
    width: 100%;
    background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
    padding: 3rem 2rem;
    margin: 2rem 0 0 0;
  `;

  const inner = document.createElement('div');
  inner.style.cssText = `max-width: 1000px; margin: 0 auto;`;

  const response = document.createElement('div');
  response.id = 'response-area';
  response.style.cssText = `
    min-height: 350px;
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
    transition: all 0.3s;
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
    if (e.key === 'Enter') handleSearch();
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

  if (insertPoint && insertPoint.nextSibling) {
    insertPoint.parentElement.insertBefore(container, insertPoint.nextSibling);
  } else if (insertPoint) {
    insertPoint.parentElement.appendChild(container);
  }

  console.log('✅ Ultimate explorer UI created!');
}

// Animated loading steps
function showAnimatedLoading(category) {
  const response = document.getElementById('response-area');
  const steps = [
    { emoji: '🔍', text: 'Searching portfolio...' },
    { emoji: '📦', text: `Found ${getCategoryItemCount(category)} results` },
    { emoji: '⚙️', text: 'Processing metadata...' },
    { emoji: '📊', text: 'Building visualization...' },
    { emoji: '✅', text: 'Ready!' }
  ];

  let html = '<div style="text-align: center; padding: 2rem;">';
  
  steps.forEach((step, i) => {
    html += `
      <div class="step-${i}" style="
        margin: 0.75rem 0;
        font-size: 1rem;
        color: #666;
        opacity: 0;
        animation: fadeInStep 0.4s ease forwards;
        animation-delay: ${i * 0.3}s;
      ">
        <span style="font-size: 1.25rem; margin-right: 0.5rem;">${step.emoji}</span>
        ${step.text}
      </div>
    `;
  });

  html += `
    <style>
      @keyframes fadeInStep {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  </div>`;

  response.innerHTML = html;
}

function getCategoryItemCount(category) {
  const counts = { projects: 4, skills: 4, experience: 4, research: 1, contact: 4 };
  return counts[category] || 4;
}

// Staggered card reveal
function createProjectCards(items) {
  let html = `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">`;
  
  items.forEach((item, i) => {
    html += `
      <div class="flip-card-${i}" style="
        perspective: 1000px;
        opacity: 0;
        animation: slideUp 0.5s ease forwards;
        animation-delay: ${1800 + i * 150}ms;
      ">
        <div style="
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        " onmouseover="this.style.transform='rotateY(180deg)'" onmouseout="this.style.transform='rotateY(0deg)'">
          
          <!-- Front -->
          <div style="
            position: absolute;
            width: 100%;
            background: linear-gradient(135deg, #f0f4ff 0%, #f8f9fa 100%);
            border: 2px solid #d0deff;
            border-radius: 12px;
            padding: 1.75rem;
            backface-visibility: hidden;
          ">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
              <h3 style="margin: 0; color: #2563eb; font-size: 1.05rem; flex: 1;">${item.name}</h3>
              <span style="background: #2563eb; color: white; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; margin-left: 0.5rem;">${item.impact}</span>
            </div>
            <p style="margin: 0.75rem 0 0 0; color: #666; font-size: 0.85rem; line-height: 1.5;">Click to see details →</p>
          </div>
          
          <!-- Back -->
          <div style="
            position: absolute;
            width: 100%;
            background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
            border: 2px solid #2563eb;
            border-radius: 12px;
            padding: 1.75rem;
            backface-visibility: hidden;
            transform: rotateY(180deg);
          ">
            <p style="margin: 0; color: #333; font-size: 0.9rem; line-height: 1.6;">${item.desc}</p>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1.25rem;">
              ${item.tech.slice(0, 3).map(t => `<span style="background: #2563eb; color: white; padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">${t}</span>`).join('')}
              ${item.tech.length > 3 ? `<span style="background: #f0f0f0; color: #666; padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.8rem;">+${item.tech.length - 3}</span>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  html += `</div>`;
  return html;
}

// Interactive timeline
function createExperienceTimeline(items) {
  let html = `<div style="position: relative; padding: 2rem 0;">`;
  
  items.forEach((item, i) => {
    const isActive = i === 0;
    html += `
      <div class="timeline-${i}" style="
        display: flex;
        margin-bottom: 2rem;
        opacity: 0;
        animation: slideUp 0.5s ease forwards;
        animation-delay: ${1800 + i * 150}ms;
      ">
        <!-- Timeline dot -->
        <div style="
          position: relative;
          width: 40px;
          display: flex;
          justify-content: center;
          padding-top: 5px;
        ">
          <div style="
            width: 16px;
            height: 16px;
            background: ${isActive ? '#10b981' : '#d0f0e0'};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 3px ${isActive ? '#d0f0e0' : '#e5e7eb'};
            transition: all 0.3s;
            cursor: pointer;
          " onmouseover="this.style.transform='scale(1.5)'; this.style.background='#10b981'" onmouseout="this.style.transform='scale(1)'; this.style.background='${isActive ? '#10b981' : '#d0f0e0'}'"></div>
        </div>
        
        <!-- Timeline line -->
        <div style="
          position: absolute;
          left: 20px;
          top: 40px;
          bottom: -30px;
          width: 2px;
          background: linear-gradient(180deg, #10b981 0%, #d0f0e0 100%);
          ${i === items.length - 1 ? 'display: none;' : ''}
        "></div>
        
        <!-- Content -->
        <div style="
          margin-left: 2rem;
          background: linear-gradient(135deg, #f0f9f4 0%, #f0faf8 100%);
          border: 2px solid #d0f0e0;
          border-left: 5px solid #10b981;
          border-radius: 12px;
          padding: 1.5rem;
          flex: 1;
          cursor: pointer;
          transition: all 0.3s;
        " onmouseover="this.style.boxShadow='0 8px 24px rgba(16, 185, 129, 0.15)'; this.style.transform='translateX(10px)'" onmouseout="this.style.boxShadow='none'; this.style.transform='translateX(0)'">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
            <h3 style="margin: 0; color: #10b981; font-size: 1.05rem; font-weight: 600;">${item.company}</h3>
            <span style="background: #10b981; color: white; padding: 0.3rem 0.75rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">${item.highlight}</span>
          </div>
          <p style="margin: 0; color: #333; font-weight: 500; font-size: 0.95rem;">${item.role}</p>
          <p style="margin: 0.4rem 0 0 0; color: #10b981; font-size: 0.85rem; font-weight: 500;">${item.period}</p>
          <p style="margin: 0.75rem 0 0 0; color: #333; font-size: 0.9rem; line-height: 1.5;">${item.desc}</p>
        </div>
      </div>
    `;
  });
  
  html += `</div>`;
  return html;
}

// Dynamic skill cloud
function createSkillCloud(categories) {
  let html = `<div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; padding: 2rem 0;">`;
  
  const allSkills = [];
  categories.forEach(cat => {
    cat.items.forEach(skill => allSkills.push(skill));
  });
  
  // Shuffle and assign random sizes
  allSkills.sort(() => Math.random() - 0.5).slice(0, 20).forEach((skill, i) => {
    const sizes = ['0.85rem', '0.95rem', '1.1rem', '1.25rem', '1.05rem'];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const colors = ['#2563eb', '#3b82f6', '#1e40af', '#1d4ed8'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    html += `
      <div class="skill-${i}" style="
        background: ${color};
        color: white;
        padding: 0.6rem 1.2rem;
        border-radius: 20px;
        font-size: ${size};
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s;
        opacity: 0;
        animation: slideUp 0.5s ease forwards;
        animation-delay: ${1800 + i * 80}ms;
      " onmouseover="this.style.transform='scale(1.2)'; this.style.background='#ea580c'" onmouseout="this.style.transform='scale(1)'; this.style.background='${color}'">
        ${skill}
      </div>
    `;
  });
  
  html += `</div>`;
  return html;
}

// Portfolio data
const portfolioData = {
  projects: {
    keywords: ['project', 'build', 'created', 'developed', 'cuda', 'llm', 'qwen', 'attention', 'agent'],
    title: "💼 My Projects",
    items: [
      {
        name: "CUDA Attention Kernel + AWS Neuron",
        desc: "Custom CUDA C++ scaled-dot-product attention with pybind11 PyTorch binding. 5.64x faster than PyTorch at N=32. GPT-2 on AWS Inferentia achieving 3.7x speedup (45ms→12ms, 1,800→6,700 tokens/sec). Deployed as FastAPI REST endpoint.",
        tech: ["CUDA C++", "PyTorch", "AWS Inferentia", "pybind11", "FastAPI", "HuggingFace Spaces"],
        impact: "5.64x faster"
      },
      {
        name: "Production LLM Fine-Tuning: Qwen-7B",
        desc: "Supervised fine-tuning with LoRA (r=8, alpha=16) on UltraFeedback. Training only 0.5% parameters (35M of 7B) with QLoRA 4-bit quantization and FP16 mixed precision. 17% loss reduction (1.412→1.176) in 30 min on T4 GPU. 0.855 BERTScore.",
        tech: ["PyTorch", "LoRA/PEFT", "QLoRA", "TRL", "HuggingFace", "Transformers"],
        impact: "17% loss reduction"
      },
      {
        name: "Attention Optimization Suite",
        desc: "Benchmarking framework on NVIDIA L4. FlashAttention-2 achieves 12.3x throughput improvement (573K→6.03M tok/s) and 99.7% memory reduction (12,582MB→38MB) vs vanilla attention. Includes batch auto-tuner and ONNX/TensorRT exports.",
        tech: ["PyTorch", "FlashAttention-2", "xFormers", "ONNX Runtime", "TensorRT", "CUDA"],
        impact: "12.3x throughput"
      },
      {
        name: "Advanced AI Agent System",
        desc: "Multi-strategy reasoning: Chain-of-Thought with self-consistency voting (3 paths), Tree-of-Thoughts (beam=3, depth=3), ReAct with real-time Tavily web search, Multi-agent collaboration. Auto-classifier routes queries optimally. Rate-limited 10/min.",
        tech: ["Python", "Groq", "Tavily", "ChromaDB", "Gradio", "OpenAI Gym"],
        impact: "Multi-agent"
      }
    ]
  },

  skills: {
    keywords: ['skill', 'tech', 'technology', 'stack', 'know', 'experienced', 'language'],
    title: "🛠️ Technical Skills",
    categories: [
      { name: "🤖 AI/ML", items: ["PyTorch", "TensorFlow", "CUDA", "LLMs", "LoRA/PEFT", "QLoRA", "RAG", "Quantization", "Fine-tuning", "FlashAttention", "vLLM"] },
      { name: "🔧 Infrastructure", items: ["Kubernetes", "Docker", "FastAPI", "AWS (S3, EC2, SageMaker)", "PostgreSQL", "Redis", "Airflow", "MLflow", "Spark"] },
      { name: "💻 Languages", items: ["Python", "C++", "Java", "Go", "SQL"] },
      { name: "📚 Specializations", items: ["GPU Optimization", "LLM Inference", "Model Compression", "Computer Vision", "Distributed Systems"] }
    ]
  },

  experience: {
    keywords: ['experience', 'work', 'job', 'intern', 'company', 'role', 'worked', 'qure', 'uta', 'tcs'],
    title: "🎯 Work Experience",
    items: [
      { company: "Qure.ai", role: "AI Solutions Engineer", period: "Mar 2026 - Present", desc: "Configured LLMs for protocol-specific clinical workflows. Orchestrating radiologist report parsing & EMR extraction across EPIC/FHIR systems (Medstar, Mount Sinai). Real-time inference on 6+ health systems.", highlight: "🏥 Current" },
      { company: "UTA", role: "Graduate Research Assistant", period: "Jun 2025 - Present", desc: "TopGPT: Full-stack LLM + RAG on 1000+ research papers. CTMap: LLM-enabled 6G path planning for mmWave networks (IEEE ICC 2026). Fine-tuning LLMs on Dijkstra paths with Sionna integration.", highlight: "📊 Research" },
      { company: "DentalScan/ReplyQuickAI", role: "ML Engineer", period: "Dec 2025 - Feb 2026", desc: "Computer vision pipelines for intra-oral image analysis (6+ clinical categories). CNN on 50K+ labeled dataset. Automated AWS SageMaker retraining incorporating dentist-corrected labels.", highlight: "🏥 Healthcare" },
      { company: "TCS", role: "Senior Software Engineer", period: "Jun 2019 - May 2023 (4 years)", desc: "Java-based distributed microservices handling millions of records daily. Owned system design for 10+ enterprise financial clients. 40% latency reduction through service refactoring.", highlight: "💼 Backend" }
    ]
  },

  research: {
    keywords: ['research', 'paper', 'publication', 'ieee', 'scholar', 'published'],
    title: "📚 Research & Publications",
    render: () => {
      return `
        <div class="research-item" style="
          opacity: 0;
          animation: slideUp 0.5s ease forwards;
          animation-delay: 1800ms;
        ">
          <div style="background: linear-gradient(135deg, #fef8e6 0%, #fff9ed 100%); border: 2px solid #fdd835; border-radius: 12px; padding: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
              <h3 style="margin: 0; color: #f59e0b; font-size: 1.1rem;">CTMap: LLM-Enabled Connectivity-Aware Path Planning</h3>
              <span style="background: #f59e0b; color: white; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; white-space: nowrap;">🏆 IEEE ICC 2026</span>
            </div>
            <p style="margin: 0; color: #666; font-weight: 500; font-size: 0.9rem;">LLM-enabled path planning for mmWave 6G networks</p>
            <p style="margin: 1rem 0 0 0; color: #333; font-size: 0.9rem; line-height: 1.6;">Fine-tuned LLMs on Dijkstra-generated paths from OpenStreetMap. Applied to Sionna 6G wireless simulation. Achieves 12.3× throughput and 4× memory reduction.</p>
            <div style="margin-top: 1.25rem; display: flex; gap: 1rem;">
              <a href="https://arxiv.org/html/2601.00110v1" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 500; font-size: 0.9rem;">📄 arXiv</a>
              <a href="https://scholar.google.com/citations?user=StKZohYAAAAJ" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 500; font-size: 0.9rem;">📚 Scholar</a>
            </div>
          </div>
        </div>
      `;
    }
  },

  contact: {
    keywords: ['contact', 'reach', 'email', 'linkedin', 'github', 'connect'],
    title: "📞 Contact & Links",
    items: [
      { icon: "📧", type: "Email", value: "saiteja.srivllibhutturu@gmail.com", url: "mailto:saiteja.srivllibhutturu@gmail.com" },
      { icon: "💼", type: "LinkedIn", value: "saitejasrivillibhutturu", url: "https://linkedin.com/in/saitejasrivillibhutturu" },
      { icon: "💻", type: "GitHub", value: "saitejasrivilli", url: "https://github.com/saitejasrivilli" },
      { icon: "📚", type: "Scholar", value: "Publications", url: "https://scholar.google.com/citations?user=StKZohYAAAAJ" }
    ],
    render: function() {
      let html = `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem;">`;
      
      this.items.forEach((item, i) => {
        html += `
          <a href="${item.url}" target="_blank" class="contact-${i}" style="
            background: linear-gradient(135deg, #f0f4ff 0%, #f8f9fa 100%);
            border: 2px solid #d0deff;
            border-radius: 12px;
            padding: 1.75rem;
            text-decoration: none;
            transition: all 0.3s;
            display: block;
            text-align: center;
            opacity: 0;
            animation: slideUp 0.5s ease forwards;
            animation-delay: ${1800 + i * 150}ms;
          " onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='0 12px 24px rgba(37,99,235,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            <div style="font-size: 2rem; margin-bottom: 0.75rem;">${item.icon}</div>
            <div style="color: #2563eb; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.5rem;">${item.type}</div>
            <div style="color: #333; font-size: 0.85rem; word-break: break-all;">${item.value}</div>
          </a>
        `;
      });
      
      html += `</div>`;
      return html;
    }
  }
};

function detectCategory(query) {
  for (const [key, data] of Object.entries(portfolioData)) {
    if (data.keywords && data.keywords.some(kw => query.includes(kw))) {
      return key;
    }
  }
  return 'projects';
}

function handleSearch() {
  const input = document.getElementById('query-input');
  const query = input.value.trim().toLowerCase();
  
  if (!query) return;
  
  const category = detectCategory(query);
  console.log('Query:', query, 'Category:', category);
  
  showAnimatedLoading(category);
  
  setTimeout(() => {
    displayResults(category);
    input.value = '';
  }, 2000);
}

function displayResults(category) {
  const response = document.getElementById('response-area');
  const data = portfolioData[category];
  
  if (!data) return;
  
  let html = `<style>
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>`;
  
  html += `<h2 style="margin: 0 0 2rem 0; color: #2563eb; font-size: 1.4rem; animation: slideUp 0.5s ease;">${data.title}</h2>`;
  
  if (category === 'projects') {
    html += createProjectCards(data.items);
  } else if (category === 'skills') {
    html += `<div style="margin-bottom: 1.5rem;">`;
    data.categories.forEach((cat, i) => {
      html += `
        <div class="skill-category-${i}" style="
          background: linear-gradient(135deg, #f0f4ff 0%, #f8f9fa 100%);
          border: 2px solid #d0deff;
          border-radius: 12px;
          padding: 1.75rem;
          margin-bottom: 1.25rem;
          opacity: 0;
          animation: slideUp 0.5s ease forwards;
          animation-delay: ${1800 + i * 200}ms;
        ">
          <h3 style="margin: 0 0 1rem 0; color: #2563eb; font-size: 1.05rem;">${cat.name}</h3>
          <p style="margin: 0; color: #333; line-height: 1.8; font-size: 0.9rem;">${cat.items.join(' • ')}</p>
        </div>
      `;
    });
    html += `</div>`;
    html += createSkillCloud(data.categories);
  } else if (category === 'experience') {
    html += createExperienceTimeline(data.items);
  } else if (category === 'research') {
    html += data.render();
  } else if (category === 'contact') {
    html += data.render();
  }
  
  response.innerHTML = html;
  response.style.opacity = '0';
  response.style.transition = 'opacity 0.3s';
  setTimeout(() => response.style.opacity = '1', 10);
}

console.log('✅ ULTIMATE portfolio explorer fully loaded!');

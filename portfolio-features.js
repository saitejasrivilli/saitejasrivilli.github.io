/**
 * FULLY DYNAMIC PORTFOLIO EXPLORER
 * Search → Smart detection → Beautiful loading animation → Results
 */

console.log('🎨 Dynamic Portfolio Explorer Loading...');

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolioUI);
} else {
  initPortfolioUI();
}

function initPortfolioUI() {
  console.log('✅ Initializing dynamic explorer...');
  
  // Find insertion point - after hero section
  let insertPoint = document.querySelector('[class*="button"]') || 
                    document.querySelector('a[href*="resume"]') ||
                    document.querySelector('section');

  if (insertPoint && insertPoint.parentElement) {
    insertPoint = insertPoint.closest('section') || insertPoint.parentElement;
  }

  // Create container
  const container = document.createElement('div');
  container.id = 'dynamic-explorer';
  container.style.cssText = `
    width: 100%;
    background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
    padding: 3rem 2rem;
    margin: 2rem 0 0 0;
  `;

  container.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto;">
      
      <!-- Response Area -->
      <div id="response-area" style="
        min-height: 300px;
        margin-bottom: 2rem;
        padding: 3rem 2rem;
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 16px;
        color: #1a1a2e;
        position: relative;
        overflow: hidden;
      ">
        <div style="text-align: center; padding: 3rem 1rem; color: #999;">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">👋</div>
          <div style="font-size: 1.2rem; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Welcome to my portfolio</div>
          <div style="font-size: 0.95rem;">Ask me anything about my projects, skills, experience, research, or contact info...</div>
        </div>
      </div>

      <!-- Input Area (Clean) -->
      <div style="
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 14px;
        padding: 1.25rem;
        display: flex;
        gap: 1rem;
        align-items: flex-end;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      ">
        <input 
          id="query-input" 
          type="text" 
          placeholder="Ask me about my projects, skills, experience, research, or anything else..." 
          onkeypress="handleKeyPress(event)"
          style="
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
          "
          onfocus="this.style.borderColor='#2563eb'; this.style.background='#ffffff'; this.style.boxShadow='0 0 0 3px rgba(37, 99, 235, 0.1)'"
          onblur="this.style.borderColor='#ddd'; this.style.background='#f8f9fa'; this.style.boxShadow='none'"
        />
        <button 
          onclick="handleSearch()" 
          style="
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
          "
          onmouseover="this.style.background='#dc2626'; this.style.transform='scale(1.05)'"
          onmouseout="this.style.background='#ea580c'; this.style.transform='scale(1)'"
        >
          ↑
        </button>
      </div>
    </div>
  `;

  if (insertPoint && insertPoint.nextSibling) {
    insertPoint.parentElement.insertBefore(container, insertPoint.nextSibling);
  } else if (insertPoint) {
    insertPoint.parentElement.appendChild(container);
  } else {
    document.body.appendChild(container);
  }

  console.log('✅ Dynamic explorer UI created!');
}

// Portfolio data
const portfolioData = {
  projects: {
    keywords: ['project', 'build', 'created', 'developed', 'work'],
    title: "💼 My Projects",
    items: [
      {
        name: "CUDA Attention Kernel + AWS Neuron",
        category: "Deep Learning",
        desc: "Custom CUDA C++ scaled-dot-product attention with pybind11 PyTorch binding. 5.64x faster than PyTorch at N=32. GPT-2 on AWS Inferentia achieving 3.7x speedup (45ms→12ms, 1,800→6,700 tokens/sec).",
        tech: ["CUDA C++", "PyTorch", "AWS Inferentia", "pybind11", "FastAPI"],
        impact: "5.64x faster"
      },
      {
        name: "Production LLM Fine-Tuning: Qwen-7B",
        category: "LLM/GenAI",
        desc: "Supervised fine-tuning with LoRA (r=8, alpha=16) on UltraFeedback. Training only 0.5% parameters (35M of 7B) with QLoRA 4-bit quantization. 17% loss reduction in 30 min on T4 GPU. 0.855 BERTScore.",
        tech: ["PyTorch", "LoRA/PEFT", "QLoRA", "TRL", "HuggingFace"],
        impact: "17% loss reduction"
      },
      {
        name: "Attention Mechanism Optimization Suite",
        category: "Deep Learning",
        desc: "Benchmarking framework on NVIDIA L4. FlashAttention-2 achieves 12.3x throughput (573K→6.03M tok/s) and 99.7% memory reduction (12,582MB→38MB) vs vanilla. Includes batch auto-tuner and ONNX/TensorRT exports.",
        tech: ["PyTorch", "FlashAttention-2", "xFormers", "ONNX Runtime", "CUDA"],
        impact: "12.3x throughput"
      },
      {
        name: "Advanced AI Agent System",
        category: "GenAI",
        desc: "Multi-strategy reasoning: Chain-of-Thought with self-consistency voting (3 paths), Tree-of-Thoughts (beam=3, depth=3), ReAct with real-time Tavily web search, Multi-agent collaboration. LLM auto-classifier. Rate-limited 10/min, 100/day.",
        tech: ["Python", "Groq", "Tavily", "ChromaDB", "Gradio"],
        impact: "Multi-agent reasoning"
      }
    ]
  },

  skills: {
    keywords: ['skill', 'tech', 'technology', 'stack', 'know', 'experienced'],
    title: "🛠️ Technical Skills",
    items: [
      {
        category: "🤖 AI/ML",
        items: ["PyTorch", "TensorFlow", "CUDA", "LLMs", "LoRA/PEFT", "QLoRA", "RAG", "Quantization", "Fine-tuning", "FlashAttention"]
      },
      {
        category: "🔧 Infrastructure",
        items: ["Kubernetes", "Docker", "FastAPI", "AWS (S3, EC2, SageMaker)", "PostgreSQL", "Redis", "Airflow", "MLflow", "Spark"]
      },
      {
        category: "💻 Languages",
        items: ["Python", "C++", "Java", "Go", "SQL"]
      },
      {
        category: "📚 Specializations",
        items: ["GPU Optimization", "LLM Inference", "Model Compression", "Computer Vision", "Distributed Systems"]
      }
    ]
  },

  experience: {
    keywords: ['experience', 'work', 'job', 'intern', 'company', 'role', 'worked'],
    title: "🎯 Work Experience",
    items: [
      {
        company: "Qure.ai",
        role: "AI Solutions Engineer",
        period: "Mar 2026 - Present",
        desc: "Configured LLMs for protocol-specific clinical workflows. Orchestrating radiologist report parsing and EMR data extraction across EPIC/FHIR-integrated hospital systems (Medstar, Mount Sinai, UFL). Real-time inference on 6+ health systems.",
        highlight: "🏥 Healthcare AI"
      },
      {
        company: "University of Texas at Arlington",
        role: "Graduate Research Assistant",
        period: "Jun 2025 - Present",
        desc: "TopGPT: Full-stack LLM with RAG over 1,000+ research papers in Pinecone. CTMap: LLM-enabled 6G path planning for mmWave networks (IEEE ICC 2026). Fine-tuning LLMs on Dijkstra paths with real-time Sionna integration.",
        highlight: "📊 Research"
      },
      {
        company: "DentalScan/ReplyQuickAI",
        role: "Machine Learning Engineer",
        period: "Dec 2025 - Feb 2026",
        desc: "Built computer vision pipelines for intra-oral image analysis (6+ clinical categories). CNN on 50K+ labeled dataset. Automated retraining on AWS SageMaker incorporating dentist-corrected labels.",
        highlight: "🏥 Healthcare ML"
      },
      {
        company: "Tata Consultancy Services (TCS)",
        role: "Senior Software Engineer",
        period: "Jun 2019 - May 2023 (4 years)",
        desc: "Designed Java-based distributed microservices handling millions of records daily. Owned system design for 10+ enterprise financial clients. Reduced processing latency by 40% through service refactoring.",
        highlight: "💼 Backend"
      }
    ]
  },

  research: {
    keywords: ['research', 'paper', 'publication', 'ieee', 'scholar', 'published'],
    title: "📚 Research & Publications",
    items: [
      {
        title: "CTMap: LLM-Enabled Connectivity-Aware Path Planning for mmWave 6G Networks",
        venue: "IEEE ICC 2026",
        desc: "Fine-tuned LLMs on Dijkstra-generated coordinate paths from OpenStreetMap. Applied to Sionna 6G wireless network simulation outputs. Achieves 12.3× throughput improvement and 4× memory reduction.",
        links: {
          arxiv: "https://arxiv.org/html/2601.00110v1",
          scholar: "https://scholar.google.com/citations?user=StKZohYAAAAJ"
        },
        highlight: "🏆 IEEE Publication"
      }
    ]
  },

  contact: {
    keywords: ['contact', 'reach', 'email', 'linkedin', 'github', 'connect', 'link', 'website'],
    title: "📞 Contact & Links",
    items: [
      {
        type: "Email",
        value: "saiteja.srivllibhutturu@gmail.com",
        link: "mailto:saiteja.srivllibhutturu@gmail.com",
        icon: "📧"
      },
      {
        type: "LinkedIn",
        value: "saitejasrivillibhutturu",
        link: "https://linkedin.com/in/saitejasrivillibhutturu",
        icon: "💼"
      },
      {
        type: "GitHub",
        value: "saitejasrivilli",
        link: "https://github.com/saitejasrivilli",
        icon: "💻"
      },
      {
        type: "Google Scholar",
        value: "StKZohYAAAAJ",
        link: "https://scholar.google.com/citations?user=StKZohYAAAAJ",
        icon: "📚"
      }
    ]
  }
};

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    handleSearch();
  }
}

function handleSearch() {
  const input = document.getElementById('query-input');
  const query = input.value.trim().toLowerCase();
  
  if (!query) return;
  
  // Detect category
  const category = detectCategory(query);
  
  // Show loading animation
  showLoading();
  
  // Fetch and display results
  setTimeout(() => {
    displayResults(category, query);
    input.value = '';
  }, 1500);
}

function detectCategory(query) {
  for (const [key, data] of Object.entries(portfolioData)) {
    if (data.keywords && data.keywords.some(kw => query.includes(kw))) {
      return key;
    }
  }
  return 'projects'; // Default
}

function showLoading() {
  const response = document.getElementById('response-area');
  
  response.innerHTML = `
    <div style="text-align: center; padding: 3rem 1rem;">
      <div style="margin-bottom: 2rem;">
        <div style="
          width: 60px;
          height: 60px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(45deg, #2563eb, #3b82f6);
          border-radius: 12px;
          position: relative;
          animation: loading-bounce 1.4s infinite;
        "></div>
        <style>
          @keyframes loading-bounce {
            0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.6; }
            50% { transform: scale(1.1) rotate(10deg); opacity: 1; }
          }
          @keyframes loading-dot {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
            30% { transform: translateY(-10px); opacity: 1; }
          }
          .loading-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #2563eb;
            margin: 0 4px;
            animation: loading-dot 1.4s infinite;
          }
          .loading-dot:nth-child(2) { animation-delay: 0.2s; }
          .loading-dot:nth-child(3) { animation-delay: 0.4s; }
        </style>
      </div>
      <div style="font-size: 1.1rem; color: #333; margin-bottom: 0.5rem; font-weight: 500;">
        Fetching content...
      </div>
      <div>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
      </div>
    </div>
  `;
}

function displayResults(category, query) {
  const response = document.getElementById('response-area');
  const data = portfolioData[category];
  
  if (!data) return;
  
  let html = `<h2 style="margin: 0 0 2rem 0; color: #2563eb; font-size: 1.4rem;">${data.title}</h2>`;
  
  if (category === 'projects') {
    html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">`;
    data.items.forEach(item => {
      html += `
        <div style="
          background: linear-gradient(135deg, #f0f4ff 0%, #f8f9fa 100%);
          border: 2px solid #d0deff;
          border-radius: 12px;
          padding: 1.75rem;
          transition: all 0.3s;
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
  } 
  else if (category === 'skills') {
    html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">`;
    data.items.forEach(skill => {
      html += `
        <div style="background: linear-gradient(135deg, #f0f4ff 0%, #f8f9fa 100%); border: 2px solid #d0deff; border-radius: 12px; padding: 1.75rem;">
          <h3 style="margin: 0 0 1rem 0; color: #2563eb; font-size: 1rem;">${skill.category}</h3>
          <p style="margin: 0; color: #333; line-height: 1.8; font-size: 0.9rem;">${skill.items.join(' • ')}</p>
        </div>
      `;
    });
    html += `</div>`;
  }
  else if (category === 'experience') {
    html += `<div style="display: flex; flex-direction: column; gap: 1.25rem;">`;
    data.items.forEach(exp => {
      html += `
        <div style="background: linear-gradient(135deg, #f0f9f4 0%, #f0faf8 100%); border: 2px solid #d0f0e0; border-left: 5px solid #10b981; border-radius: 12px; padding: 1.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
            <h3 style="margin: 0; color: #10b981; font-size: 1.05rem;">${exp.company}</h3>
            <span style="background: #10b981; color: white; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">${exp.highlight}</span>
          </div>
          <p style="margin: 0; color: #333; font-weight: 500; font-size: 0.95rem;">${exp.role}</p>
          <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.85rem;">${exp.period}</p>
          <p style="margin: 1rem 0 0 0; color: #333; font-size: 0.9rem; line-height: 1.6;">${exp.desc}</p>
        </div>
      `;
    });
    html += `</div>`;
  }
  else if (category === 'research') {
    html += `<div style="display: flex; flex-direction: column; gap: 1.5rem;">`;
    data.items.forEach(res => {
      html += `
        <div style="background: linear-gradient(135deg, #fef8e6 0%, #fff9ed 100%); border: 2px solid #fdd835; border-radius: 12px; padding: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
            <h3 style="margin: 0; color: #f59e0b; font-size: 1.1rem;">${res.title}</h3>
            <span style="background: #f59e0b; color: white; padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">${res.highlight}</span>
          </div>
          <p style="margin: 0; color: #666; font-weight: 500; font-size: 0.9rem;">${res.venue}</p>
          <p style="margin: 1rem 0 0 0; color: #333; font-size: 0.9rem; line-height: 1.6;">${res.desc}</p>
          <div style="margin-top: 1.25rem; display: flex; gap: 1rem;">
            <a href="${res.links.arxiv}" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 500; font-size: 0.9rem;">📄 arXiv</a>
            <a href="${res.links.scholar}" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 500; font-size: 0.9rem;">📚 Scholar</a>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  }
  else if (category === 'contact') {
    html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">`;
    data.items.forEach(item => {
      html += `
        <a href="${item.link}" target="_blank" style="
          background: linear-gradient(135deg, #f0f4ff 0%, #f8f9fa 100%);
          border: 2px solid #d0deff;
          border-radius: 12px;
          padding: 1.75rem;
          text-decoration: none;
          transition: all 0.3s;
          display: block;
        " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 24px rgba(37,99,235,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
          <div style="font-size: 1.5rem; margin-bottom: 0.75rem;">${item.icon}</div>
          <div style="color: #2563eb; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.5rem;">${item.type}</div>
          <div style="color: #333; font-size: 0.9rem;">${item.value}</div>
        </a>
      `;
    });
    html += `</div>`;
  }
  
  response.innerHTML = html;
  
  // Fade in animation
  response.style.opacity = '0';
  response.style.transition = 'opacity 0.3s ease';
  setTimeout(() => response.style.opacity = '1', 10);
}

console.log('✅ Dynamic portfolio explorer fully loaded!');

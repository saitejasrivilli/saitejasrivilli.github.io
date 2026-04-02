// FRESH START - GUARANTEED TO WORK
console.log('🔥 PORTFOLIO FEATURES STARTING...');

// Create widget immediately - no waiting
const widget = document.createElement('div');
widget.id = 'sai-widget';
widget.style.cssText = `
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 480px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  z-index: 99999;
  font-family: Arial, sans-serif;
  border: 1px solid #e5e7eb;
`;

widget.innerHTML = `
  <div style="padding: 1.5rem; background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%); color: white; border-radius: 16px 16px 0 0; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <h3 style="margin: 0; font-size: 1.3rem;">🚀 My Projects</h3>
      <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; opacity: 0.8;">Click below to explore</p>
    </div>
    <button onclick="document.getElementById('sai-widget').style.display='none'" style="background: rgba(255,255,255,0.2); border: none; color: white; cursor: pointer; font-size: 1.5rem; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">✕</button>
  </div>

  <div id="sai-content" style="padding: 2rem; min-height: 200px; background: #fafafa;">
    <div style="text-align: center; padding: 1rem; color: #999;">
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">👨‍💻</div>
      <h3 style="margin: 0; color: #1a1a2e; font-size: 1.2rem;">Sai Teja Srivillibhutturu</h3>
      <p style="margin: 0.5rem 0; color: #666; font-size: 0.9rem;">AI Solutions Engineer specializing in Deep Learning & LLMs</p>
      <p style="margin: 0.5rem 0; color: #999; font-size: 0.85rem;">MS CS from UT Arlington (GPA 4.0) • Published Researcher</p>
    </div>
  </div>

  <div style="padding: 1.5rem; background: white; border-top: 1px solid #e5e7eb; border-radius: 0 0 16px 16px; display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center;">
    <button onclick="showContent('about')" style="padding: 0.75rem 1.5rem; background: #1a202c; color: white; border: none; border-radius: 25px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.3s;">😊 About</button>
    <button onclick="showContent('projects')" style="padding: 0.75rem 1.5rem; background: #f0f0f0; color: #333; border: none; border-radius: 25px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.3s;">💼 Projects</button>
    <button onclick="showContent('skills')" style="padding: 0.75rem 1.5rem; background: #f0f0f0; color: #333; border: none; border-radius: 25px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.3s;">🛠️ Skills</button>
    <button onclick="showContent('experience')" style="padding: 0.75rem 1.5rem; background: #f0f0f0; color: #333; border: none; border-radius: 25px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.3s;">🎯 Work</button>
    <button onclick="showContent('contact')" style="padding: 0.75rem 1.5rem; background: #f0f0f0; color: #333; border: none; border-radius: 25px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.3s;">📞 Contact</button>
  </div>
`;

// Add widget to page immediately
document.body.appendChild(widget);
console.log('✅ Widget added to page');

// Content data
const content = {
  about: `
    <div style="text-align: center;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">👨‍💻</div>
      <h3 style="margin: 0 0 0.5rem 0; font-size: 1.2rem; color: #1a1a2e;">Sai Teja Srivillibhutturu</h3>
      <p style="margin: 0.5rem 0; color: #666; font-size: 0.9rem;">AI Solutions Engineer</p>
      <p style="margin: 0.5rem 0; color: #999; font-size: 0.85rem;">Specializing in Deep Learning & LLMs</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 1rem 0;">
      <p style="margin: 0; color: #666; font-size: 0.9rem; line-height: 1.6;">
        MS CS from UT Arlington (GPA 4.0)<br>
        Published Researcher (IEEE ICC 2026)<br>
        4+ Years Industry Experience<br><br>
        I optimize ML systems for speed, memory, and cost. My work focuses on CUDA kernels, FlashAttention, and production-grade inference.
      </p>
    </div>
  `,
  
  projects: `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div style="background: white; padding: 1rem; border-radius: 12px; border-left: 4px solid #2563eb;">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 0.95rem; color: #1a1a2e; font-weight: 600;">🔧 CUDA Attention Kernel + AWS Neuron</h4>
        <p style="margin: 0; font-size: 0.8rem; color: #666;">5.64x faster than PyTorch • AWS Inferentia deployment</p>
      </div>
      <div style="background: white; padding: 1rem; border-radius: 12px; border-left: 4px solid #2563eb;">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 0.95rem; color: #1a1a2e; font-weight: 600;">🤖 LLM Fine-Tuning: Qwen-7B</h4>
        <p style="margin: 0; font-size: 0.8rem; color: #666;">LoRA • QLoRA • 17% loss reduction on T4 GPU</p>
      </div>
      <div style="background: white; padding: 1rem; border-radius: 12px; border-left: 4px solid #2563eb;">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 0.95rem; color: #1a1a2e; font-weight: 600;">⚡ Attention Optimization Suite</h4>
        <p style="margin: 0; font-size: 0.8rem; color: #666;">FlashAttention-2 • 12.3x throughput improvement</p>
      </div>
      <div style="background: white; padding: 1rem; border-radius: 12px; border-left: 4px solid #2563eb;">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 0.95rem; color: #1a1a2e; font-weight: 600;">🧠 Advanced AI Agent System</h4>
        <p style="margin: 0; font-size: 0.8rem; color: #666;">CoT • ToT • ReAct • Multi-agent collaboration</p>
      </div>
    </div>
  `,
  
  skills: `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
      <div style="background: white; padding: 1rem; border-radius: 12px;">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; font-weight: 600; color: #1a1a2e;">🤖 AI/ML</h4>
        <div style="font-size: 0.8rem; color: #666; line-height: 1.6;">PyTorch • CUDA • LLMs • LoRA • RAG • Quantization</div>
      </div>
      <div style="background: white; padding: 1rem; border-radius: 12px;">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; font-weight: 600; color: #1a1a2e;">🔧 Infrastructure</h4>
        <div style="font-size: 0.8rem; color: #666; line-height: 1.6;">Kubernetes • Docker • FastAPI • AWS</div>
      </div>
      <div style="background: white; padding: 1rem; border-radius: 12px;">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; font-weight: 600; color: #1a1a2e;">💻 Languages</h4>
        <div style="font-size: 0.8rem; color: #666; line-height: 1.6;">Python • C++ • Java • Go</div>
      </div>
      <div style="background: white; padding: 1rem; border-radius: 12px;">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; font-weight: 600; color: #1a1a2e;">📚 Specialties</h4>
        <div style="font-size: 0.8rem; color: #666; line-height: 1.6;">GPU Optimization • LLM Inference • Fine-tuning</div>
      </div>
    </div>
  `,
  
  experience: `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div style="background: white; padding: 1rem; border-radius: 12px; border-left: 4px solid #10b981;">
        <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1a1a2e; font-weight: 600;">🏥 Qure.ai</h4>
        <p style="margin: 0; font-size: 0.8rem; color: #666;">AI Solutions Engineer • Mar 2026 - Present</p>
        <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #999;">LLM for clinical automation, EPIC/FHIR</p>
      </div>
      <div style="background: white; padding: 1rem; border-radius: 12px; border-left: 4px solid #10b981;">
        <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1a1a2e; font-weight: 600;">📊 UTA</h4>
        <p style="margin: 0; font-size: 0.8rem; color: #666;">Graduate Research Assistant • Jun 2025 - Present</p>
        <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #999;">TopGPT, IEEE ICC 2026 publication</p>
      </div>
      <div style="background: white; padding: 1rem; border-radius: 12px; border-left: 4px solid #10b981;">
        <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1a1a2e; font-weight: 600;">🏥 DentalScan</h4>
        <p style="margin: 0; font-size: 0.8rem; color: #666;">ML Engineer Intern • Dec 2025 - Feb 2026</p>
        <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #999;">Computer vision, AWS SageMaker</p>
      </div>
      <div style="background: white; padding: 1rem; border-radius: 12px; border-left: 4px solid #10b981;">
        <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #1a1a2e; font-weight: 600;">💼 TCS</h4>
        <p style="margin: 0; font-size: 0.8rem; color: #666;">Senior Software Engineer • Jun 2019 - May 2023</p>
        <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #999;">Java backend, microservices</p>
      </div>
    </div>
  `,
  
  contact: `
    <div style="text-align: center;">
      <h3 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #1a1a2e;">Let's Connect! 🤝</h3>
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <a href="mailto:saiteja.srivllibhutturu@gmail.com" style="padding: 0.75rem 1rem; background: white; color: #2563eb; text-decoration: none; border-radius: 8px; border: 1px solid #e5e7eb; font-weight: 500; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.boxShadow='0 2px 8px rgba(37,99,235,0.2)'" onmouseout="this.style.boxShadow='none'">📧 Email</a>
        <a href="https://linkedin.com/in/saitejasrivillibhutturu" target="_blank" style="padding: 0.75rem 1rem; background: white; color: #2563eb; text-decoration: none; border-radius: 8px; border: 1px solid #e5e7eb; font-weight: 500; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.boxShadow='0 2px 8px rgba(37,99,235,0.2)'" onmouseout="this.style.boxShadow='none'">💼 LinkedIn</a>
        <a href="https://github.com/saitejasrivilli" target="_blank" style="padding: 0.75rem 1rem; background: white; color: #2563eb; text-decoration: none; border-radius: 8px; border: 1px solid #e5e7eb; font-weight: 500; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.boxShadow='0 2px 8px rgba(37,99,235,0.2)'" onmouseout="this.style.boxShadow='none'">💻 GitHub</a>
        <a href="https://scholar.google.com/citations?user=StKZohYAAAAJ" target="_blank" style="padding: 0.75rem 1rem; background: white; color: #2563eb; text-decoration: none; border-radius: 8px; border: 1px solid #e5e7eb; font-weight: 500; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.boxShadow='0 2px 8px rgba(37,99,235,0.2)'" onmouseout="this.style.boxShadow='none'">📚 Scholar</a>
      </div>
    </div>
  `
};

// Show content function
function showContent(type) {
  console.log('Showing:', type);
  const contentDiv = document.getElementById('sai-content');
  contentDiv.style.opacity = '0';
  
  setTimeout(() => {
    contentDiv.innerHTML = content[type];
    contentDiv.style.opacity = '1';
  }, 150);
  
  contentDiv.style.transition = 'opacity 0.2s ease';
}

console.log('✅ WIDGET FULLY LOADED!');

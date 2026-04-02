// SIMPLE CHATBOT - GUARANTEED TO WORK
console.log('🤖 Portfolio features loading...');

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

function initAll() {
  console.log('✅ DOM ready - initializing features');
  initSkillMatcher();
  initChatbot();
}

// ============================================
// FEATURE 1: SKILL-PROJECT MATCHER
// ============================================

function initSkillMatcher() {
  console.log('🔗 Initializing skill matcher...');
  
  const skillProjectMap = {
    'CUDA C++': ['cuda-neuron-attention', 'attention-optimization'],
    'PyTorch': ['cuda-neuron-attention', 'LLM_FineTuning_SFT_Production', 'attention-optimization', 'ai-agent'],
    'AWS Inferentia': ['cuda-neuron-attention'],
    'LoRA / PEFT': ['LLM_FineTuning_SFT_Production'],
    'QLoRA': ['LLM_FineTuning_SFT_Production'],
    'TRL': ['LLM_FineTuning_SFT_Production'],
    'HuggingFace': ['LLM_FineTuning_SFT_Production', 'ai-agent'],
    'FlashAttention-2': ['attention-optimization'],
    'Python': ['ai-agent'],
  };

  // Add click listeners to tech tags
  document.querySelectorAll('.tech-tag').forEach(tag => {
    tag.style.cursor = 'pointer';
    tag.addEventListener('click', function(e) {
      e.stopPropagation();
      const skill = this.textContent.trim();
      highlightProjects(skill, skillProjectMap);
    });
  });

  // Reset on outside click
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.tech-tag')) {
      resetProjects();
    }
  });

  console.log('✅ Skill matcher ready');
}

function highlightProjects(skill, map) {
  const matching = map[skill] || [];
  
  document.querySelectorAll('.project-item').forEach(item => {
    let isMatch = false;
    matching.forEach(repo => {
      if (item.innerHTML.includes(repo)) {
        isMatch = true;
      }
    });
    
    item.style.opacity = isMatch ? '1' : '0.4';
  });
}

function resetProjects() {
  document.querySelectorAll('.project-item').forEach(item => {
    item.style.opacity = '1';
  });
}

// ============================================
// FEATURE 2: SIMPLE CHATBOT
// ============================================

function initChatbot() {
  console.log('💬 Initializing chatbot...');

  // Create button
  const btn = document.createElement('div');
  btn.id = 'chat-btn';
  btn.innerHTML = '💬';
  btn.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 80px;
    height: 80px;
    background: #2563eb;
    color: white;
    border: 4px solid white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    cursor: pointer;
    z-index: 99999;
    box-shadow: 0 8px 24px rgba(37, 99, 235, 0.9);
    transition: all 0.3s;
  `;

  btn.onmouseover = () => {
    btn.style.transform = 'scale(1.15)';
  };

  btn.onmouseout = () => {
    btn.style.transform = 'scale(1)';
  };

  // Create window
  const win = document.createElement('div');
  win.id = 'chat-win';
  win.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 420px;
    height: 600px;
    background: white;
    border: 2px solid #ddd;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    display: none;
    flex-direction: column;
    z-index: 99999;
    font-family: Arial, sans-serif;
  `;

  win.innerHTML = `
    <div style="padding: 1rem; background: #2563eb; color: white; display: flex; justify-content: space-between; align-items: center; border-radius: 10px 10px 0 0;">
      <strong>💬 Ask Me Anything</strong>
      <div style="cursor: pointer; font-size: 1.5rem;" onclick="document.getElementById('chat-win').style.display='none'; document.getElementById('chat-btn').style.display='flex';">✕</div>
    </div>
    <div id="msgs" style="flex: 1; overflow-y: auto; padding: 1rem; background: #f9f9f9; display: flex; flex-direction: column; gap: 0.75rem;">
      <div style="background: #e3f2fd; padding: 0.75rem 1rem; border-radius: 8px; color: #1a1a2e; max-width: 90%;">
        👋 Hi! Ask me about projects, skills, or experience!
      </div>
    </div>
    <div style="padding: 1rem; display: flex; gap: 0.5rem; border-top: 1px solid #ddd;">
      <input id="inp" type="text" placeholder="Type question..." style="flex: 1; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-family: Arial;">
      <button onclick="sendChat()" style="background: #2563eb; color: white; border: none; padding: 0.75rem 1rem; border-radius: 6px; cursor: pointer; font-weight: bold;">Send</button>
    </div>
  `;

  btn.onclick = () => {
    win.style.display = 'flex';
    btn.style.display = 'none';
    document.getElementById('inp').focus();
  };

  document.body.appendChild(btn);
  document.body.appendChild(win);

  // Allow Enter key
  document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && document.getElementById('inp') === document.activeElement) {
      sendChat();
    }
  });

  console.log('✅ Chatbot ready');
}

function sendChat() {
  const inp = document.getElementById('inp');
  const msgs = document.getElementById('msgs');
  const q = inp.value.toLowerCase();

  if (!q.trim()) return;

  // Add user message
  const umsg = document.createElement('div');
  umsg.style.cssText = 'background: #2563eb; color: white; padding: 0.75rem 1rem; border-radius: 8px; max-width: 90%; align-self: flex-end; word-wrap: break-word;';
  umsg.textContent = inp.value;
  msgs.appendChild(umsg);
  inp.value = '';

  // Get response
  let resp = 'I\'m an AI Solutions Engineer specializing in Deep Learning & LLMs.';
  if (q.includes('project')) resp = 'I\'ve built CUDA Attention Kernel, LLM Fine-tuning (Qwen-7B), Attention Optimization, and AI Agent System. All use PyTorch and GPU optimization.';
  if (q.includes('skill')) resp = 'Python, PyTorch, CUDA, C++, Deep Learning, LLMs, LoRA, FastAPI, Kubernetes, AWS, HuggingFace, and more!';
  if (q.includes('experience')) resp = 'AI Solutions Engineer at Qure.ai, GRA at UTA (TopGPT), ML Engineer at DentalScan, Senior SWE at TCS.';
  if (q.includes('education')) resp = 'MS Computer Science from UT Arlington (GPA 4.0, May 2025), B.Tech from Andhra University.';
  if (q.includes('research')) resp = 'IEEE ICC 2026 Publication: CTMap - LLM-Enabled Path Planning for mmWave 6G Networks.';
  if (q.includes('contact')) resp = 'Email: saiteja.srivllibhutturu@gmail.com, LinkedIn: saitejasrivillibhutturu, GitHub: saitejasrivilli';
  if (q.includes('hi') || q.includes('hello')) resp = '👋 Hello! How can I help?';

  // Add bot response
  setTimeout(() => {
    const bmsg = document.createElement('div');
    bmsg.style.cssText = 'background: #e3f2fd; color: #1a1a2e; padding: 0.75rem 1rem; border-radius: 8px; max-width: 90%; word-wrap: break-word;';
    bmsg.textContent = resp;
    msgs.appendChild(bmsg);
    msgs.scrollTop = msgs.scrollHeight;
  }, 300);

  msgs.scrollTop = msgs.scrollHeight;
}

console.log('✅ Portfolio features loaded!');

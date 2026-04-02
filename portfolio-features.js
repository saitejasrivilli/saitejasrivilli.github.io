/**
 * FEATURE 1: SKILL-PROJECT MATCHER
 * Click a skill tag to highlight all projects that use it
 */

const skillProjectMap = {
  'CUDA C++': ['cuda-neuron-attention', 'attention-optimization'],
  'PyTorch': ['cuda-neuron-attention', 'LLM_FineTuning_SFT_Production', 'attention-optimization', 'ai-agent'],
  'AWS Inferentia': ['cuda-neuron-attention'],
  'pybind11': ['cuda-neuron-attention'],
  'FastAPI': ['cuda-neuron-attention'],
  'LoRA / PEFT': ['LLM_FineTuning_SFT_Production'],
  'QLoRA': ['LLM_FineTuning_SFT_Production'],
  'TRL': ['LLM_FineTuning_SFT_Production'],
  'HuggingFace': ['LLM_FineTuning_SFT_Production', 'ai-agent'],
  'FlashAttention-2': ['attention-optimization'],
  'xFormers': ['attention-optimization'],
  'ONNX Runtime': ['attention-optimization'],
  'CUDA': ['attention-optimization'],
  'Python': ['ai-agent'],
  'Groq': ['ai-agent'],
  'Tavily': ['ai-agent'],
  'ChromaDB': ['ai-agent'],
  'Gradio': ['ai-agent'],
};

function initializeSkillMatcher() {
  document.addEventListener('DOMContentLoaded', function() {
    // Add click listeners to tech tags
    document.querySelectorAll('.tech-tag').forEach(tag => {
      tag.style.cursor = 'pointer';
      tag.addEventListener('click', function(e) {
        e.stopPropagation();
        const skill = this.textContent.trim();
        highlightProjectsBySkill(skill);
        addSkillIndicator(skill);
      });
    });

    // Click outside to reset
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.tech-tag') && !e.target.closest('.skill-indicator')) {
        resetHighlight();
      }
    });
  });
}

function highlightProjectsBySkill(skill) {
  // Reset previous highlights
  document.querySelectorAll('.project-item').forEach(item => {
    item.classList.remove('highlighted', 'dimmed');
  });
  document.querySelectorAll('.tech-tag').forEach(tag => {
    tag.classList.remove('active-skill');
  });

  // Highlight matching projects
  const matchingRepos = skillProjectMap[skill] || [];
  document.querySelectorAll('.project-item').forEach(item => {
    let isMatch = false;
    const links = item.querySelectorAll('a[href*="github.com"]');
    links.forEach(link => {
      const href = link.href;
      matchingRepos.forEach(repo => {
        if (href.includes(repo)) isMatch = true;
      });
    });

    if (isMatch) {
      item.classList.add('highlighted');
      item.style.borderLeft = '4px solid var(--accent)';
      item.style.paddingLeft = 'calc(1rem + 4px)';
    } else {
      item.classList.add('dimmed');
    }
  });

  // Highlight active skill tags
  document.querySelectorAll('.tech-tag').forEach(tag => {
    if (tag.textContent.trim() === skill) {
      tag.classList.add('active-skill');
    }
  });
}

function resetHighlight() {
  document.querySelectorAll('.project-item').forEach(item => {
    item.classList.remove('highlighted', 'dimmed');
    item.style.borderLeft = '';
    item.style.paddingLeft = '';
  });
  document.querySelectorAll('.tech-tag').forEach(tag => {
    tag.classList.remove('active-skill');
  });
  removeSkillIndicator();
}

function addSkillIndicator(skill) {
  let indicator = document.getElementById('skill-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'skill-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 5rem;
      right: 2rem;
      z-index: 999;
      background: var(--accent);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(indicator);
  }
  indicator.textContent = `🔍 Showing ${skillProjectMap[skill].length} project(s) using ${skill}`;
  indicator.style.display = 'block';
}

function removeSkillIndicator() {
  const indicator = document.getElementById('skill-indicator');
  if (indicator) {
    indicator.style.display = 'none';
  }
}

// Add styles for skill matcher
const skillMatcherStyles = `
  .tech-tag {
    transition: all 0.2s ease;
  }
  
  .tech-tag:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  }
  
  .tech-tag.active-skill {
    background: var(--accent) !important;
    color: white !important;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  }
  
  .project-item {
    transition: all 0.3s ease;
  }
  
  .project-item.highlighted {
    background: var(--hover-bg);
    border: 1px solid var(--accent);
    box-shadow: 0 0 20px rgba(37, 99, 235, 0.2);
  }
  
  .project-item.dimmed {
    opacity: 0.4;
    filter: grayscale(50%);
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = skillMatcherStyles;
document.head.appendChild(styleSheet);

initializeSkillMatcher();


/**
 * FEATURE 3: SIMPLE PATTERN-BASED AI CHATBOT
 * Works with inline styles - NO CSS DEPENDENCIES
 */

// Create the chatbot button immediately
const chatButton = document.createElement('button');
chatButton.id = 'chatbot-button-simple';
chatButton.innerHTML = '💬';
chatButton.style.cssText = `
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #2563eb;
  color: white;
  font-size: 2.5rem;
  border: 4px solid white;
  cursor: pointer;
  z-index: 99999;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
`;

chatButton.onmouseover = () => {
  chatButton.style.transform = 'scale(1.2)';
  chatButton.style.boxShadow = '0 12px 32px rgba(37, 99, 235, 1)';
};

chatButton.onmouseout = () => {
  chatButton.style.transform = 'scale(1)';
  chatButton.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.9)';
};

chatButton.onclick = () => {
  if (chatWindow.style.display === 'flex') {
    chatWindow.style.display = 'none';
    chatButton.style.display = 'flex';
  } else {
    chatWindow.style.display = 'flex';
    chatButton.style.display = 'none';
  }
};

// Create the chat window
const chatWindow = document.createElement('div');
chatWindow.id = 'chatbot-window-simple';
chatWindow.style.cssText = `
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 420px;
  height: 600px;
  background: white;
  border: 2px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: none;
  flex-direction: column;
  z-index: 99999;
  font-family: Arial, sans-serif;
`;

chatWindow.innerHTML = `
  <div style="padding: 1rem; border-bottom: 2px solid #ddd; background: #2563eb; color: white; border-radius: 10px 10px 0 0; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-weight: bold; font-size: 1.1rem;">💬 Ask Me Anything</span>
    <button id="close-btn" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">✕</button>
  </div>
  <div id="chat-messages-simple" style="flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; background: #f9f9f9;">
    <div style="background: #e3f2fd; padding: 0.75rem 1rem; border-radius: 8px; max-width: 90%; color: #1a1a2e;">
      👋 Hi! Ask me about my projects, skills, experience, or anything else!
    </div>
  </div>
  <div style="padding: 1rem; border-top: 1px solid #ddd; display: flex; gap: 0.5rem;">
    <input type="text" id="chat-input-simple" placeholder="Type your question..." style="flex: 1; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-family: Arial; font-size: 0.9rem;">
    <button id="send-btn-simple" style="background: #2563eb; color: white; border: none; padding: 0.75rem 1rem; border-radius: 6px; cursor: pointer; font-weight: bold;">Send</button>
  </div>
`;

document.body.appendChild(chatButton);
document.body.appendChild(chatWindow);

// Close button handler
document.getElementById('close-btn').onclick = () => {
  chatWindow.style.display = 'none';
  chatButton.style.display = 'flex';
};

// Knowledge base
const knowledge = {
  projects: "I've built: CUDA Attention Kernel, LLM Fine-Tuning (Qwen-7B), Attention Optimization Suite, Advanced AI Agent System. All use PyTorch, GPU optimization, and production-grade deployment.",
  
  skills: "Deep Learning (PyTorch, TensorFlow), LLMs (LoRA, QLoRA, Hugging Face), GPU Optimization (CUDA, TensorRT), Infrastructure (Kubernetes, Docker, FastAPI), AWS (S3, EC2, SageMaker), Languages: Python, C++, Java, Go",
  
  experience: "AI Solutions Engineer Intern at Qure.ai (current) - LLM for clinical automation. GRA at UTA - TopGPT project. ML Engineer at DentalScan/ReplyQuickAI - CV/AWS. Senior SWE at TCS - Java backend/infrastructure.",
  
  education: "MS Computer Science from UT Arlington (GPA 4.0, May 2025). B.Tech Computer Science from Andhra University.",
  
  research: "IEEE ICC 2026 Publication: CTMap - LLM-Enabled Connectivity-Aware Path Planning for mmWave 6G Networks. arXiv:2601.00110. Achieved 12.3× throughput and 4× memory reduction.",
  
  contact: "Email: saiteja.srivllibhutturu@gmail.com. LinkedIn: linkedin.com/in/saitejasrivillibhutturu. GitHub: github.com/saitejasrivilli",
  
  default: "I'm an AI Solutions Engineer specializing in Deep Learning and LLMs. Ask me about projects, skills, experience, education, research, or contact info!"
};

// Chat handler
function handleChat() {
  const input = document.getElementById('chat-input-simple');
  const messagesDiv = document.getElementById('chat-messages-simple');
  const question = input.value.trim().toLowerCase();
  
  if (!question) return;
  
  // Add user message
  const userMsg = document.createElement('div');
  userMsg.style.cssText = 'background: #2563eb; color: white; padding: 0.75rem 1rem; border-radius: 8px; max-width: 90%; align-self: flex-end; word-wrap: break-word;';
  userMsg.textContent = input.value;
  messagesDiv.appendChild(userMsg);
  
  input.value = '';
  
  // Get response
  let response = knowledge.default;
  if (question.includes('project')) response = knowledge.projects;
  else if (question.includes('skill') || question.includes('tech')) response = knowledge.skills;
  else if (question.includes('experience') || question.includes('work')) response = knowledge.experience;
  else if (question.includes('education') || question.includes('degree')) response = knowledge.education;
  else if (question.includes('research') || question.includes('paper')) response = knowledge.research;
  else if (question.includes('contact') || question.includes('email') || question.includes('hire')) response = knowledge.contact;
  else if (question.includes('hello') || question.includes('hi')) response = "👋 Hello! How can I help?";
  
  // Add bot response
  setTimeout(() => {
    const botMsg = document.createElement('div');
    botMsg.style.cssText = 'background: #e3f2fd; color: #1a1a2e; padding: 0.75rem 1rem; border-radius: 8px; max-width: 90%; word-wrap: break-word;';
    botMsg.textContent = response;
    messagesDiv.appendChild(botMsg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, 300);
  
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Send button handler
document.getElementById('send-btn-simple').onclick = handleChat;

// Enter key handler
document.getElementById('chat-input-simple').onkeypress = (e) => {
  if (e.key === 'Enter') handleChat();
};

console.log('✅ Chatbot loaded and visible!');
console.log('✅ Skill matcher loaded!');

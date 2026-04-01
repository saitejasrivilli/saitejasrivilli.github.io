/**
 * FEATURE 1: SKILL-PROJECT MATCHER
 * Click a skill to highlight all projects that use it
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

const projectTechMap = {
  'cuda-neuron-attention': ['CUDA C++', 'PyTorch', 'AWS Inferentia', 'pybind11', 'FastAPI'],
  'LLM_FineTuning_SFT_Production': ['PyTorch', 'LoRA / PEFT', 'QLoRA', 'TRL', 'HuggingFace'],
  'attention-optimization': ['PyTorch', 'FlashAttention-2', 'xFormers', 'ONNX Runtime', 'CUDA'],
  'ai-agent': ['Python', 'Groq', 'Tavily', 'ChromaDB', 'Gradio', 'HuggingFace'],
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
      // Draw connection line effect
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

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = skillMatcherStyles;
document.head.appendChild(styleSheet);

initializeSkillMatcher();


/**
 * FEATURE 2: GITHUB ACTIVITY STREAM
 * Fetch and display real-time GitHub activity
 */

const GITHUB_USERNAME = 'saitejasrivilli';

async function initializeGitHubActivity() {
  try {
    // Fetch recent repos
    const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=10`);
    const repos = await reposResponse.json();

    // Fetch GitHub stats
    const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
    const userData = await userResponse.json();

    // Create activity display
    createActivityDisplay(repos, userData);
  } catch (error) {
    console.error('Failed to fetch GitHub data:', error);
  }
}

function createActivityDisplay(repos, userData) {
  // Add activity section after projects if it doesn't exist
  let activitySection = document.getElementById('github-activity-section');
  
  if (!activitySection) {
    const projectsSection = document.getElementById('projects');
    activitySection = document.createElement('div');
    activitySection.id = 'github-activity-section';
    activitySection.className = 'section';
    activitySection.innerHTML = `
      <div class="container">
        <h2 class="section-title">GitHub Activity</h2>
        <div style="max-width: 900px; margin: 0 auto;">
          <div class="activity-stats">
            <div class="stat-card">
              <div class="stat-number">${userData.public_repos}</div>
              <div class="stat-label">Public Repos</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${userData.followers}</div>
              <div class="stat-label">Followers</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${userData.following}</div>
              <div class="stat-label">Following</div>
            </div>
          </div>
          <div class="recent-activity" id="activity-feed"></div>
        </div>
      </div>
    `;
    projectsSection.parentNode.insertBefore(activitySection, projectsSection.nextSibling);
  }

  // Populate activity feed
  const feedContainer = document.getElementById('activity-feed');
  feedContainer.innerHTML = '';

  repos.slice(0, 5).forEach(repo => {
    const updatedDate = new Date(repo.updated_at);
    const now = new Date();
    const diffHours = Math.floor((now - updatedDate) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    let timeAgo = '';
    if (diffHours < 1) timeAgo = 'Just now';
    else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
    else if (diffDays < 7) timeAgo = `${diffDays}d ago`;
    else timeAgo = updatedDate.toLocaleDateString();

    const card = document.createElement('div');
    card.className = 'activity-card';
    card.innerHTML = `
      <div class="activity-header">
        <h3 class="activity-repo">${repo.name}</h3>
        <span class="activity-time">⏰ ${timeAgo}</span>
      </div>
      <p class="activity-description">${repo.description || 'No description'}</p>
      <div class="activity-meta">
        <span class="activity-lang">💻 ${repo.language || 'N/A'}</span>
        <span class="activity-stars">⭐ ${repo.stargazers_count}</span>
        <a href="${repo.html_url}" target="_blank" class="activity-link">View on GitHub →</a>
      </div>
    `;
    feedContainer.appendChild(card);
  });
}

// GitHub Activity Styles
const githubActivityStyles = `
  .activity-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 3rem;
  }
  
  .stat-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
    transition: all 0.3s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--card-shadow);
  }
  
  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent);
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .recent-activity {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .activity-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem;
    transition: all 0.3s ease;
  }
  
  .activity-card:hover {
    border-color: var(--accent);
    box-shadow: 0 0 15px rgba(37, 99, 235, 0.15);
  }
  
  .activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  
  .activity-repo {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .activity-time {
    font-size: 0.8rem;
    color: var(--text-secondary);
    background: var(--bg-secondary);
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
  }
  
  .activity-description {
    color: var(--text-secondary);
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }
  
  .activity-meta {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
  }
  
  .activity-lang,
  .activity-stars {
    font-size: 0.85rem;
    color: var(--text-secondary);
  }
  
  .activity-link {
    margin-left: auto;
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .activity-link:hover {
    gap: 0.5rem;
  }
`;

const ghStyleSheet = document.createElement('style');
ghStyleSheet.textContent = githubActivityStyles;
document.head.appendChild(ghStyleSheet);

initializeGitHubActivity();


/**
 * FEATURE 3: PATTERN-BASED AI CHATBOT
 * No API needed - works offline with pattern matching
 * Similar to the LLM GenAI page implementation
 */

class PatternAIChatbot {
  constructor() {
    this.conversationHistory = [];
    this.isOpen = false;
    this.aiKnowledge = this.initializeKnowledge();
    this.createWidget();
    this.addStyles();
  }

  initializeKnowledge() {
    return {
      projects: "I've built several cool projects:<br><br>⚡ <strong>CUDA Attention Kernel + AWS Neuron</strong> - 5.64x faster than PyTorch, deployed on AWS Inferentia<br>📚 <strong>Production LLM Fine-Tuning</strong> - Qwen-7B SFT with LoRA, achieved 17% training loss reduction<br>🎯 <strong>Attention Optimization Suite</strong> - FlashAttention-2 benchmarks showing 12.3x throughput improvement<br>🤖 <strong>Advanced AI Agent System</strong> - Multi-strategy reasoning (CoT, ToT, ReAct) with web search<br><br>Check the Featured Projects section for more details!",
      
      skills: "My tech stack includes:<br><br>🔷 <strong>Deep Learning:</strong> PyTorch, TensorFlow, CUDA, FlashAttention-2<br>🔷 <strong>LLMs & GenAI:</strong> Hugging Face, LoRA, QLoRA, vLLM, LangChain<br>🔷 <strong>GPU Optimization:</strong> CUDA C++, AWS Inferentia, TensorRT, ONNX<br>🔷 <strong>Infrastructure:</strong> Kubernetes, Docker, FastAPI, AWS<br>🔷 <strong>Languages:</strong> Python, C++, Java, Go<br>🔷 <strong>Tools:</strong> Git, MLflow, Weights & Biases, Gradio",
      
      experience: "My experience:<br><br>🎓 <strong>AI Solutions Engineer Intern @ Qure.ai</strong> (Mar 2026-Present)<br>→ LLM configuration for clinical protocol automation<br>→ EPIC/FHIR integrations with Mount Sinai & Medstar<br>→ Pipeline orchestration redesign<br><br>📊 <strong>Graduate Research Assistant @ UTA</strong> (Jun 2025-Present)<br>→ TopGPT project - Full-stack LLM/RAG platform<br><br>💼 <strong>ML Engineer Intern @ DentalScan/ReplyQuickAI</strong> (Dec 2025-Feb 2026)<br>→ CNN-based CV pipelines on dental images<br>→ AWS (S3, EC2, SageMaker) & MLflow workflows<br><br>🏢 <strong>Senior Software Engineer @ TCS</strong> (Jun 2019-May 2023)<br>→ Java-based backend systems & infrastructure",
      
      education: "My education:<br><br>🎓 <strong>MS Computer Science</strong> - UT Arlington (May 2025)<br>→ GPA: 4.0/4.0 (Perfect!)<br>→ Specialization in Deep Learning & LLMs<br>→ IEEE ICC 2026 Publication: CTMap<br><br>🎓 <strong>B.Tech Computer Science</strong> - Andhra University<br>→ Strong foundation in algorithms & systems",
      
      research: "My research work:<br><br>📝 <strong>IEEE ICC 2026 Publication</strong><br>→ Title: CTMap - LLM-Enabled Connectivity-Aware Path Planning for mmWave 6G Networks<br>→ arXiv: 2601.00110<br>→ Fine-tuned LLMs on Dijkstra-generated paths from OpenStreetMap<br>→ Achieved 12.3× throughput and 4× memory reduction<br><br>📊 <strong>In Progress:</strong> Equity-Aware Congestion Pricing with Multi-Agent RL<br>📊 <strong>In Progress:</strong> TopGPT - Cross-Encoder Enhanced RAG for Telecom",
      
      resume: "Quick highlights:<br><br>💼 <strong>Current Roles:</strong><br>→ AI Solutions Engineer @ Qure.ai<br>→ GRA @ UT Arlington<br><br>🎓 <strong>Education:</strong><br>→ MS CS @ UT Arlington (GPA 4.0, May 2025)<br>→ B.Tech @ Andhra University<br><br>🏆 <strong>Key Skills:</strong><br>→ Deep Learning, LLMs, GPU Optimization<br>→ CUDA, PyTorch, FastAPI, Kubernetes, AWS<br><br>📝 <strong>Publication:</strong><br>→ IEEE ICC 2026 - CTMap paper<br><br>💡 <strong>Interests:</strong> Chess, Sudoku, Constraint-based reasoning, LLM inference optimization",
      
      contact: "Let's connect! 📬<br><br>📧 <strong>Email:</strong> saiteja.srivllibhutturu@gmail.com<br>💼 <strong>LinkedIn:</strong> linkedin.com/in/saitejasrivillibhutturu<br>💻 <strong>GitHub:</strong> github.com/saitejasrivilli<br>📄 <strong>Google Scholar:</strong> scholar.google.com/citations?user=StKZohYAAAAJ<br><br>I'm open to ML Engineering, LLM Engineer, and Applied Scientist roles!",
      
      default: "👋 Hi! I'm Sai Teja, an AI Solutions Engineer specializing in Deep Learning & LLMs.<br><br>Ask me about:<br>• <strong>projects</strong> - My work<br>• <strong>skills</strong> - Tech stack<br>• <strong>experience</strong> - Work history<br>• <strong>education</strong> - Background<br>• <strong>research</strong> - Publications<br>• <strong>resume</strong> - Quick overview<br>• <strong>contact</strong> - How to reach me"
    };
  }

  createWidget() {
    // Create chatbot button
    const chatButton = document.createElement('button');
    chatButton.id = 'chatbot-button';
    chatButton.innerHTML = '💬';
    chatButton.title = 'Chat with me';
    chatButton.addEventListener('click', () => this.toggleChat());
    document.body.appendChild(chatButton);

    // Create chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chatbot-window';
    chatWindow.innerHTML = `
      <div class="chat-header">
        <div class="chat-title">💬 Ask Me Anything</div>
        <button id="chat-close" class="chat-close">✕</button>
      </div>
      <div id="chat-messages" class="chat-messages"></div>
      <div class="chat-input-area">
        <input 
          type="text" 
          id="chat-input" 
          placeholder="Ask about projects, skills, experience..." 
          class="chat-input"
        >
        <button id="chat-send" class="chat-send">Send</button>
      </div>
      <div class="chat-footer">Instant responses • No API needed</div>
    `;
    document.body.appendChild(chatWindow);

    // Event listeners
    document.getElementById('chat-close').addEventListener('click', () => this.toggleChat());
    document.getElementById('chat-send').addEventListener('click', () => this.sendMessage());
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Show welcome message
    this.addMessage('assistant', '👋 Hi! Ask me about my projects, skills, experience, research, or how to contact me!');
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const chatWindow = document.getElementById('chatbot-window');
    const chatButton = document.getElementById('chatbot-button');
    
    if (this.isOpen) {
      chatWindow.classList.add('open');
      chatButton.style.display = 'none';
      document.getElementById('chat-input').focus();
    } else {
      chatWindow.classList.remove('open');
      chatButton.style.display = 'flex';
    }
  }

  sendMessage() {
    const input = document.getElementById('chat-input');
    const userMessage = input.value.trim();
    
    if (!userMessage) return;

    // Add user message
    this.addMessage('user', userMessage);
    input.value = '';

    // Show typing indicator
    this.addMessage('assistant', '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>');

    // Process after short delay
    setTimeout(() => {
      this.removeTypingIndicator();
      const response = this.getResponse(userMessage);
      this.addMessage('assistant', response);
    }, 800);
  }

  getResponse(query) {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('project') || lowerQuery.includes('build') || lowerQuery.includes('built') || lowerQuery.includes('work')) {
      return this.aiKnowledge.projects;
    } else if (lowerQuery.includes('skill') || lowerQuery.includes('tech') || lowerQuery.includes('stack') || lowerQuery.includes('tool') || lowerQuery.includes('framework')) {
      return this.aiKnowledge.skills;
    } else if (lowerQuery.includes('experience') || lowerQuery.includes('job') || lowerQuery.includes('intern') || lowerQuery.includes('company') || lowerQuery.includes('work')) {
      return this.aiKnowledge.experience;
    } else if (lowerQuery.includes('education') || lowerQuery.includes('degree') || lowerQuery.includes('university') || lowerQuery.includes('gpa') || lowerQuery.includes('study')) {
      return this.aiKnowledge.education;
    } else if (lowerQuery.includes('research') || lowerQuery.includes('paper') || lowerQuery.includes('publication') || lowerQuery.includes('ieee') || lowerQuery.includes('icc')) {
      return this.aiKnowledge.research;
    } else if (lowerQuery.includes('resume') || lowerQuery.includes('cv') || lowerQuery.includes('background') || lowerQuery.includes('overview') || lowerQuery.includes('summary') || lowerQuery.includes('about')) {
      return this.aiKnowledge.resume;
    } else if (lowerQuery.includes('contact') || lowerQuery.includes('email') || lowerQuery.includes('hire') || lowerQuery.includes('reach') || lowerQuery.includes('connect') || lowerQuery.includes('linkedin')) {
      return this.aiKnowledge.contact;
    } else if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey') || lowerQuery.includes('hey')) {
      return "👋 Hello! I'm Sai Teja's assistant. Ask me about <strong>projects</strong>, <strong>skills</strong>, <strong>experience</strong>, <strong>research</strong>, or <strong>contact</strong>!";
    } else if (lowerQuery.includes('gpu') || lowerQuery.includes('cuda') || lowerQuery.includes('optimization') || lowerQuery.includes('performance')) {
      return this.aiKnowledge.skills;
    } else if (lowerQuery.includes('llm') || lowerQuery.includes('genai') || lowerQuery.includes('ai') || lowerQuery.includes('model')) {
      return this.aiKnowledge.projects;
    } else {
      return this.aiKnowledge.default;
    }
  }

  addMessage(role, content) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message chat-${role}`;
    messageDiv.innerHTML = content;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  removeTypingIndicator() {
    const messages = document.getElementById('chat-messages');
    const lastMessage = messages.lastChild;
    if (lastMessage && lastMessage.querySelector('.typing-indicator')) {
      messages.removeChild(lastMessage);
    }
  }

  addStyles() {
    const styles = `
      #chatbot-button {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 2px solid var(--accent);
        background: var(--accent);
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        transition: all 0.3s ease;
      }

      #chatbot-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.6);
      }

      #chatbot-window {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 400px;
        height: 600px;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transform: translateY(20px);
        transition: all 0.3s ease;
      }

      #chatbot-window.open {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0);
      }

      .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
        background: var(--bg-secondary);
        border-radius: 12px 12px 0 0;
      }

      .chat-title {
        font-weight: 600;
        color: var(--text-primary);
      }

      .chat-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 1.25rem;
        cursor: pointer;
        transition: color 0.2s;
      }

      .chat-close:hover {
        color: var(--text-primary);
      }

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .chat-message {
        padding: 0.75rem 1rem;
        border-radius: 8px;
        max-width: 90%;
        word-wrap: break-word;
        animation: slideUp 0.3s ease;
        line-height: 1.5;
      }

      .chat-user {
        background: var(--accent);
        color: white;
        align-self: flex-end;
        border-radius: 8px 0 8px 8px;
      }

      .chat-assistant {
        background: var(--bg-secondary);
        color: var(--text-primary);
        align-self: flex-start;
        border-radius: 0 8px 8px 8px;
      }

      .typing-indicator {
        display: flex;
        gap: 4px;
        align-items: center;
      }

      .typing-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--text-secondary);
        animation: typing 1.4s infinite;
      }

      .typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }

      .typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0%, 60%, 100% { opacity: 0.5; transform: translateY(0); }
        30% { opacity: 1; transform: translateY(-10px); }
      }

      .chat-input-area {
        display: flex;
        gap: 0.5rem;
        padding: 1rem;
        border-top: 1px solid var(--border-color);
      }

      .chat-input {
        flex: 1;
        border: 1px solid var(--border-color);
        border-radius: 6px;
        padding: 0.75rem;
        background: var(--bg-primary);
        color: var(--text-primary);
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s;
      }

      .chat-input:focus {
        border-color: var(--accent);
      }

      .chat-send {
        background: var(--accent);
        color: white;
        border: none;
        border-radius: 6px;
        padding: 0.75rem 1rem;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
      }

      .chat-send:hover {
        opacity: 0.9;
      }

      .chat-footer {
        padding: 0.5rem 1rem;
        font-size: 0.75rem;
        color: var(--text-secondary);
        text-align: center;
        border-top: 1px solid var(--border-color);
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 600px) {
        #chatbot-window {
          width: calc(100vw - 2rem);
          height: 70vh;
          bottom: 1rem;
          right: 1rem;
        }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
}

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', function() {
  new PatternAIChatbot();
});

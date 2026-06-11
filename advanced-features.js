// Advanced Portfolio Features
// Contact CTA, Skills Chart, Stack Explainers, GitHub Activity Feed

class AdvancedPortfolio {
  constructor() {
    this.init();
  }

  init() {
    this.addContactCTA();
    this.addSkillsChart();
    this.addStackExplainers();
    this.addGitHubActivityFeed();
  }

  // ============ 1. CONTACT CTA ============
  addContactCTA() {
    // Floating button
    const floatingBtn = document.createElement('div');
    floatingBtn.innerHTML = `
      <a href="mailto:saiteja.srivillibhutturu@gmail.com" class="floating-contact-btn" style="
        position: fixed;
        bottom: 2rem;
        left: 2rem;
        background: linear-gradient(135deg, var(--accent) 0%, #06b6d4 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 50px;
        text-decoration: none;
        font-weight: 600;
        z-index: 99;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.95rem;
      ">
        <span>✉️</span>
        <span>Email Me</span>
      </a>
    `;
    document.body.appendChild(floatingBtn);

    const btn = floatingBtn.querySelector('a');
    btn.addEventListener('mouseover', () => {
      btn.style.transform = 'scale(1.1)';
      btn.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)';
    });
    btn.addEventListener('mouseout', () => {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
    });

    // Sticky header CTA
    const header = document.createElement('div');
    header.innerHTML = `
      <div class="sticky-header-cta" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: rgba(var(--bg-primary-rgb), 0.95);
        backdrop-filter: blur(10px);
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--border-color);
        display: none;
        align-items: center;
        justify-content: space-between;
        z-index: 98;
      ">
        <span style="font-size: 0.9rem; color: var(--text-secondary);">Looking for an ML Engineer?</span>
        <a href="mailto:saiteja.srivillibhutturu@gmail.com" style="
          background: var(--accent);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s ease;
        ">Get in Touch</a>
      </div>
    `;
    document.body.insertBefore(header.firstElementChild, document.body.firstChild);

    // Show sticky header on scroll down
    const stickyHeader = document.querySelector('.sticky-header-cta');
    let lastScrollY = 0;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300 && window.scrollY > lastScrollY) {
        stickyHeader.style.display = 'flex';
      } else if (window.scrollY < 300) {
        stickyHeader.style.display = 'none';
      }
      lastScrollY = window.scrollY;
    });
  }

  // ============ 2. SKILLS CHART ============
  addSkillsChart() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    const skillsHTML = `
      <div class="skills-chart-container" style="margin-top: 2rem; padding: 2rem; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid var(--border-color); max-width: 600px;">
        <h3 style="margin-bottom: 1.5rem; font-size: 1.1rem; color: var(--accent); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Expertise Breakdown</h3>
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          ${[
            { area: 'GPU Optimization', pct: 90, color: '#0ea5e9' },
            { area: 'LLM Systems', pct: 85, color: '#f59e0b' },
            { area: 'Production ML', pct: 80, color: '#10b981' },
            { area: 'Healthcare AI', pct: 75, color: '#ec4899' },
            { area: 'Research', pct: 70, color: '#06b6d4' }
          ].map(skill => `
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="font-size: 0.9rem; color: var(--text-primary); font-weight: 600;">${skill.area}</span>
                <span style="font-size: 0.85rem; color: var(--text-secondary);">${skill.pct}%</span>
              </div>
              <div style="background: rgba(255,255,255,0.05); border-radius: 4px; height: 8px; overflow: hidden;">
                <div style="
                  height: 100%;
                  width: ${skill.pct}%;
                  background: ${skill.color};
                  border-radius: 4px;
                  transition: width 0.6s ease;
                  animation: fillBar 0.8s ease forwards;
                " data-percent="${skill.pct}"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <style>
        @keyframes fillBar {
          from { width: 0; }
          to { width: var(--percent); }
        }
      </style>
    `;

    const metricsSection = heroSection.querySelector('.hero-metrics');
    if (metricsSection) {
      metricsSection.insertAdjacentHTML('afterend', skillsHTML);
    }
  }

  // ============ 3. STACK EXPLAINERS ============
  addStackExplainers() {
    const stackExplainers = {
      'Triton': 'Language-agnostic GPU kernels. Easier than CUDA, faster than cuBLAS.',
      'CUDA': 'Direct GPU control. Max performance for custom kernels.',
      'PyTorch': 'Flexibility + ecosystem. Standard for ML research & production.',
      'vLLM': 'LLM inference optimization. PagedAttention cuts memory 4×.',
      'SGLang': 'Fast LLM inference engine. RadixAttention + speculative decoding.',
      'AWS Inferentia': 'Custom silicon. 5× cheaper than GPU for known workloads.',
      'LoRA': 'Finetune 0.1% of params. Fast training, parameter-efficient.',
      'QLoRA': 'LoRA + 4-bit quantization. Train on T4 with minimal memory loss.',
      'PEFT': 'Parameter-Efficient Fine-Tuning. Unified API for LoRA, prefix, adapters.',
      'FlashAttention-2': 'IO-aware attention. 12× faster, 99% less memory vs vanilla.',
      'xFormers': 'Modular transformers. Mix-and-match attention variants.',
      'TRL': 'Transformer Reinforcement Learning. SFT, DPO, GRPO end-to-end.',
      'HuggingFace': 'Model hub + ecosystem. Standard for sharing & loading models.',
      'ONNX': 'Cross-platform model format. Deploy anywhere without framework lock-in.',
      'AWS SageMaker': 'Managed ML pipelines. Automated retraining + monitoring.',
      'Pinecone': 'Vector DB for RAG. No setup, scales to billions of vectors.',
      'ChromaDB': 'Local vector store. Lightweight for prototypes & fine-grained control.',
      'Tavily': 'Web search API for agents. Real-time info for LLM reasoning.',
      'Gradio': 'Quick UI for ML models. Share demos in seconds, no frontend skills needed.',
      'Groq': 'Low-latency LLM inference. 500+ tok/sec on consumer hardware.',
      'FastAPI': 'Async Python web framework. Fast, type-safe, auto-docs.',
      'Sionna': '6G wireless simulator. Ray-tracing for digital twins.',
      'OpenStreetMap': 'Free map data. GPS coords + path planning for mobility systems.',
      'Dijkstra': 'Shortest path algorithm. Guaranteed optimal, used for baseline comparisons.'
    };

    document.querySelectorAll('.tech-tag').forEach(tag => {
      const tech = tag.textContent.trim();
      if (stackExplainers[tech]) {
        tag.style.cursor = 'help';
        tag.title = stackExplainers[tech];
        tag.addEventListener('mouseover', (e) => {
          const tooltip = document.createElement('div');
          tooltip.className = 'stack-tooltip';
          tooltip.textContent = stackExplainers[tech];
          tooltip.style.cssText = `
            position: absolute;
            background: var(--bg-secondary);
            border: 1px solid var(--accent);
            border-radius: 6px;
            padding: 0.75rem;
            font-size: 0.8rem;
            max-width: 200px;
            z-index: 1000;
            color: var(--text-secondary);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            pointer-events: none;
            line-height: 1.5;
          `;
          document.body.appendChild(tooltip);

          const rect = tag.getBoundingClientRect();
          tooltip.style.left = (rect.left - tooltip.offsetWidth / 2 + rect.width / 2) + 'px';
          tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';

          tag.addEventListener('mouseout', () => tooltip.remove(), { once: true });
        });
      }
    });
  }

  // ============ 4. GITHUB ACTIVITY FEED ============
  addGitHubActivityFeed() {
    const container = document.querySelector('#projects .container');
    if (!container) return;

    const feedHTML = `
      <div class="github-activity-feed" style="margin-top: 3rem; padding: 2rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px;">
        <h3 style="margin-bottom: 1.5rem; font-size: 1rem; color: var(--accent); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Recent Activity</h3>
        <div id="activity-feed-content" style="display: flex; flex-direction: column; gap: 1rem;">
          <p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Loading GitHub activity...</p>
        </div>
      </div>
    `;

    const cloudsection = container.querySelector('.tech-skill-cloud');
    if (cloudsection) {
      cloudsection.insertAdjacentHTML('afterend', feedHTML);
    } else {
      container.insertAdjacentHTML('beforeend', feedHTML);
    }

    // Fetch GitHub activity
    this.fetchGitHubActivity();
  }

  async fetchGitHubActivity() {
    try {
      const response = await fetch('https://api.github.com/users/saitejasrivilli/events/public?per_page=10');
      if (!response.ok) throw new Error('GitHub API failed');

      const events = await response.json();
      const feedContent = document.getElementById('activity-feed-content');
      if (!feedContent) return;

      // Filter and deduplicate
      const seen = new Set();
      const filtered = events.filter(e => {
        if (e.type === 'PushEvent' || e.type === 'PullRequestEvent' || e.type === 'CreateEvent') {
          const key = `${e.type}:${e.repo.name}`;
          if (!seen.has(key)) {
            seen.add(key);
            return true;
          }
        }
        return false;
      }).slice(0, 5);

      if (filtered.length === 0) {
        feedContent.innerHTML = '<p style="color: var(--text-secondary);">No recent public activity</p>';
        return;
      }

      feedContent.innerHTML = filtered.map(e => {
        const time = new Date(e.created_at);
        const date = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        let action = '';

        if (e.type === 'PushEvent') {
          const commits = e.payload.commits.length;
          action = `Pushed ${commits} commit${commits > 1 ? 's' : ''} to`;
        } else if (e.type === 'PullRequestEvent') {
          action = `${e.payload.action === 'opened' ? 'Opened' : 'Updated'} PR on`;
        } else if (e.type === 'CreateEvent') {
          action = `Created ${e.payload.ref_type} on`;
        }

        return `
          <div style="
            display: flex;
            gap: 1rem;
            padding: 1rem;
            background: rgba(255,255,255,0.03);
            border-radius: 6px;
            border-left: 3px solid var(--accent);
          ">
            <span style="
              font-size: 2rem;
              min-width: 40px;
              text-align: center;
            ">
              ${e.type === 'PushEvent' ? '📌' : e.type === 'PullRequestEvent' ? '🔀' : '✨'}
            </span>
            <div style="flex: 1;">
              <p style="margin: 0; font-size: 0.9rem; color: var(--text-primary);">
                <strong>${action}</strong>
                <a href="${e.repo.html_url}" target="_blank" rel="noopener" style="color: var(--accent); text-decoration: none;">
                  ${e.repo.name}
                </a>
              </p>
              <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; color: var(--text-secondary);">${date}</p>
            </div>
          </div>
        `;
      }).join('');
    } catch (err) {
      console.warn('GitHub activity fetch failed:', err);
      const feedContent = document.getElementById('activity-feed-content');
      if (feedContent) {
        feedContent.innerHTML = '<p style="color: var(--text-secondary);">Activity feed unavailable</p>';
      }
    }
  }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new AdvancedPortfolio();
});

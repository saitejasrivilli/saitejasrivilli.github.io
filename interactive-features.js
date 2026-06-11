// Interactive Portfolio Features
// Includes: project filtering, tech copy, timeline expand, skill cloud, comparison view

class PortfolioInteractive {
  constructor() {
    this.projects = [];
    this.selectedTechs = new Set();
    this.selectedImpacts = new Set();
    this.comparisonMode = false;
    this.selectedProjects = new Set();
    this.init();
  }

  init() {
    this.extractProjects();
    this.addFilterUI();
    this.addTechCopyButtons();
    this.addTimelineExpand();
    this.buildTechCloud();
    this.addComparisonUI();
  }

  // ============ 1. PROJECT FILTERING ============
  extractProjects() {
    const items = document.querySelectorAll('.project-item');
    items.forEach((item, idx) => {
      const title = item.querySelector('.project-title')?.textContent || '';
      const impact = item.querySelector('.project-impact')?.textContent || '';
      const techs = Array.from(item.querySelectorAll('.tech-tag')).map(t => t.textContent.trim());
      this.projects.push({ element: item, id: idx, title, impact, techs });
    });
  }

  addFilterUI() {
    const container = document.querySelector('#projects .container');
    if (!container) return;

    // Extract unique techs and impacts
    const allTechs = new Set();
    const allImpacts = new Set();
    this.projects.forEach(p => {
      p.techs.forEach(t => allTechs.add(t));
      if (p.impact) allImpacts.add(p.impact);
    });

    // Build filter UI
    const filterHTML = `
      <div class="interactive-filter" style="margin-bottom: 2rem; padding: 1.5rem; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid var(--border-color);">
        <div style="margin-bottom: 1.5rem;">
          <h4 style="margin-bottom: 0.75rem; font-size: 0.95rem; color: var(--accent); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Filter by Tech Stack</h4>
          <div class="tech-filter" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${Array.from(allTechs).sort().map(tech => `
              <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; transition: all 0.2s ease; font-size: 0.85rem;">
                <input type="checkbox" class="tech-filter-checkbox" value="${tech}" style="cursor: pointer;">
                <span>${tech}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div>
          <h4 style="margin-bottom: 0.75rem; font-size: 0.95rem; color: var(--accent); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Filter by Impact</h4>
          <div class="impact-filter" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
            ${Array.from(allImpacts).sort().map(impact => `
              <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; transition: all 0.2s ease; font-size: 0.85rem;">
                <input type="checkbox" class="impact-filter-checkbox" value="${impact}" style="cursor: pointer;">
                <span>${impact}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div style="margin-top: 1rem; text-align: right;">
          <button class="filter-clear-btn" style="padding: 0.5rem 1rem; background: transparent; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; font-size: 0.85rem; color: var(--text-secondary); transition: all 0.2s ease;">Clear All</button>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('afterbegin', filterHTML);

    // Attach event listeners
    document.querySelectorAll('.tech-filter-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.applyFilters());
    });
    document.querySelectorAll('.impact-filter-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', () => this.applyFilters());
    });
    document.querySelector('.filter-clear-btn').addEventListener('click', () => {
      document.querySelectorAll('.tech-filter-checkbox, .impact-filter-checkbox').forEach(c => c.checked = false);
      this.applyFilters();
    });
  }

  applyFilters() {
    this.selectedTechs.clear();
    this.selectedImpacts.clear();

    document.querySelectorAll('.tech-filter-checkbox:checked').forEach(c => {
      this.selectedTechs.add(c.value);
    });
    document.querySelectorAll('.impact-filter-checkbox:checked').forEach(c => {
      this.selectedImpacts.add(c.value);
    });

    this.projects.forEach(p => {
      const matchTech = this.selectedTechs.size === 0 || p.techs.some(t => this.selectedTechs.has(t));
      const matchImpact = this.selectedImpacts.size === 0 || this.selectedImpacts.has(p.impact);
      p.element.style.display = (matchTech && matchImpact) ? '' : 'none';
    });
  }

  // ============ 2. COPY TECH STACK ============
  addTechCopyButtons() {
    document.querySelectorAll('.project-tech').forEach(techContainer => {
      const tags = techContainer.textContent;
      const copyBtn = document.createElement('button');
      copyBtn.innerHTML = '📋 Copy Stack';
      copyBtn.className = 'copy-tech-btn';
      copyBtn.style.cssText = `
        display: block;
        margin-top: 0.75rem;
        padding: 0.4rem 0.8rem;
        background: rgba(255,255,255,0.05);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s ease;
        color: var(--text-secondary);
      `;
      copyBtn.addEventListener('mouseover', () => {
        copyBtn.style.background = 'var(--accent)';
        copyBtn.style.color = 'white';
        copyBtn.style.borderColor = 'var(--accent)';
      });
      copyBtn.addEventListener('mouseout', () => {
        copyBtn.style.background = 'rgba(255,255,255,0.05)';
        copyBtn.style.color = 'var(--text-secondary)';
        copyBtn.style.borderColor = 'var(--border-color)';
      });
      copyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const stackText = Array.from(techContainer.querySelectorAll('.tech-tag')).map(t => t.textContent.trim()).join(', ');
        navigator.clipboard.writeText(stackText).then(() => {
          copyBtn.textContent = '✓ Copied!';
          setTimeout(() => { copyBtn.textContent = '📋 Copy Stack'; }, 2000);
        });
      });
      techContainer.appendChild(copyBtn);
    });
  }

  // ============ 3. TIMELINE EXPAND ============
  addTimelineExpand() {
    document.querySelectorAll('.timeline-item').forEach(item => {
      const description = item.querySelector('.timeline-description');
      if (!description) return;

      // Hide full description, show truncated
      const fullText = description.textContent;
      const truncated = fullText.substring(0, 120) + '...';
      const isLong = fullText.length > 120;

      if (isLong) {
        description.dataset.fullText = fullText;
        description.dataset.truncated = truncated;
        description.textContent = truncated;

        // Make clickable
        description.style.cursor = 'pointer';
        description.style.color = 'var(--accent)';
        description.style.textDecoration = 'underline';

        description.addEventListener('click', () => {
          const isExpanded = description.dataset.expanded === 'true';
          description.textContent = isExpanded ? truncated : fullText;
          description.dataset.expanded = !isExpanded;
        });
      }
    });
  }

  // ============ 4. TECH SKILL CLOUD ============
  buildTechCloud() {
    const container = document.querySelector('#projects .container');
    if (!container) return;

    // Count tech frequency
    const techCount = {};
    this.projects.forEach(p => {
      p.techs.forEach(t => {
        techCount[t] = (techCount[t] || 0) + 1;
      });
    });

    const techs = Object.entries(techCount).sort((a, b) => b[1] - a[1]);
    const maxCount = Math.max(...techs.map(t => t[1]));

    // Build cloud HTML
    const cloudHTML = `
      <div class="tech-skill-cloud" style="margin: 2rem 0; padding: 2rem; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid var(--border-color); text-align: center;">
        <h4 style="margin-bottom: 1.5rem; font-size: 0.95rem; color: var(--accent); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Tech Stack Overview</h4>
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; align-items: center;">
          ${techs.map(([tech, count]) => {
            const size = 0.9 + (count / maxCount) * 0.6; // 0.9 to 1.5em
            const opacity = 0.6 + (count / maxCount) * 0.4; // 0.6 to 1
            return `<span class="cloud-tech" style="
              font-size: ${size}rem;
              opacity: ${opacity};
              transition: all 0.3s ease;
              cursor: pointer;
              color: var(--accent);
              font-weight: 600;
              padding: 0.5rem 1rem;
              border-radius: 6px;
              border: 1px solid rgba(255,255,255,0.1);
            " title="${count} projects" data-tech="${tech}">${tech}</span>`;
          }).join('')}
        </div>
      </div>
    `;

    const filterSection = container.querySelector('.interactive-filter');
    if (filterSection) {
      filterSection.insertAdjacentHTML('afterend', cloudHTML);
    }

    // Cloud interactions
    document.querySelectorAll('.cloud-tech').forEach(tag => {
      tag.addEventListener('mouseover', () => {
        document.querySelectorAll('.cloud-tech').forEach(t => {
          t.style.opacity = t === tag ? '1' : '0.3';
        });
      });
      tag.addEventListener('mouseout', () => {
        document.querySelectorAll('.cloud-tech').forEach(t => {
          const tech = t.dataset.tech;
          const count = techCount[tech];
          t.style.opacity = (0.6 + (count / maxCount) * 0.4).toString();
        });
      });
      tag.addEventListener('click', () => {
        // Auto-filter by this tech
        document.querySelectorAll('.tech-filter-checkbox').forEach(c => {
          c.checked = c.value === tag.dataset.tech;
        });
        this.applyFilters();
        tag.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  // ============ 5. COMPARISON VIEW ============
  addComparisonUI() {
    // Add checkbox to each project
    document.querySelectorAll('.project-item').forEach((item, idx) => {
      const header = item.querySelector('.project-header');
      if (!header) return;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'compare-checkbox';
      checkbox.dataset.projectId = idx;
      checkbox.style.cssText = 'cursor: pointer; width: 20px; height: 20px;';
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.selectedProjects.add(idx);
        } else {
          this.selectedProjects.delete(idx);
        }
        this.updateComparisonButton();
      });

      const label = document.createElement('label');
      label.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-right: 1rem;';
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode('Compare'));
      header.insertBefore(label, header.firstChild);
    });

    // Comparison button
    const container = document.querySelector('#projects .container');
    const compareBtn = document.createElement('button');
    compareBtn.id = 'compare-btn';
    compareBtn.textContent = '⚖️ Compare (0)';
    compareBtn.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      background: var(--accent);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      z-index: 100;
      display: none;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      transition: all 0.2s ease;
    `;
    compareBtn.addEventListener('mouseover', () => {
      compareBtn.style.transform = 'scale(1.05)';
    });
    compareBtn.addEventListener('mouseout', () => {
      compareBtn.style.transform = 'scale(1)';
    });
    compareBtn.addEventListener('click', () => this.showComparisonModal());
    document.body.appendChild(compareBtn);
  }

  updateComparisonButton() {
    const btn = document.getElementById('compare-btn');
    if (!btn) return;
    btn.textContent = `⚖️ Compare (${this.selectedProjects.size})`;
    btn.style.display = this.selectedProjects.size > 0 ? 'block' : 'none';
  }

  showComparisonModal() {
    if (this.selectedProjects.size === 0) return;

    const selected = Array.from(this.selectedProjects).map(idx => this.projects[idx]);
    const modalHTML = `
      <div class="comparison-modal" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        overflow-y: auto;
      ">
        <div style="
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 2rem;
          max-width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2 style="color: var(--text-primary); font-size: 1.5rem; margin: 0;">Project Comparison</h2>
            <button class="modal-close" style="
              background: none;
              border: none;
              font-size: 1.5rem;
              cursor: pointer;
              color: var(--text-secondary);
            ">×</button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(${Math.min(selected.length, 3)}, 1fr); gap: 1.5rem; overflow-x: auto;">
            ${selected.map(p => `
              <div style="
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 1.5rem;
                background: rgba(255,255,255,0.02);
              ">
                <h3 style="color: var(--accent); margin: 0 0 1rem 0; font-size: 1rem;">${p.title}</h3>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0.5rem 0;">
                  <strong>Impact:</strong> ${p.impact}
                </p>
                <div style="margin-top: 1rem;">
                  <p style="color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.5rem 0; font-weight: 600;">Tech Stack:</p>
                  <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
                    ${p.techs.map(t => `<span style="
                      background: rgba(14, 165, 233, 0.1);
                      color: var(--accent);
                      padding: 0.2rem 0.5rem;
                      border-radius: 4px;
                      font-size: 0.75rem;
                      font-weight: 600;
                    ">${t}</span>`).join('')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    const modal = document.createElement('div');
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);

    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove();
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new PortfolioInteractive();
});

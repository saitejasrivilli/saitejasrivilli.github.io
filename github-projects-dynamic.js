// Dynamic GitHub Projects Fetcher
// Caches for 1 hour. Non-blocking (loads in background, falls back to static data).

class GitHubProjectsFetcher {
  constructor(username = 'saitejasrivilli') {
    this.username = username;
    this.cacheKey = `gh_projects_${username}`;
    this.cacheTTL = 60 * 60 * 1000; // 1 hour
    this.api = 'https://api.github.com/graphql';
    this.token = this.getToken(); // Optional: GitHub token from localStorage for higher rate limits
  }

  getToken() {
    // Users can set token in localStorage for 5k req/hr vs 60 req/hr
    return localStorage.getItem('github_token') || null;
  }

  async fetch() {
    // Check cache first
    const cached = this.getCache();
    if (cached) return cached;

    try {
      const data = await this.queryGitHub();
      this.setCache(data);
      return data;
    } catch (err) {
      console.warn('GitHub fetch failed, using fallback:', err.message);
      return this.getFallback();
    }
  }

  async queryGitHub() {
    // GraphQL: top 15 repos by recent update, exclude forks, private, archived
    const query = `
      query($userName:String!) {
        user(login: $userName) {
          repositories(first: 15, orderBy: {field: UPDATED_AT, direction: DESC}, affiliations: [OWNER], isFork: false, isLocked: false) {
            nodes {
              name
              description
              url
              updatedAt
              pushedAt
              stargazerCount
              forkCount
              primaryLanguage { name }
              topics(first: 5) { nodes { name } }
              isArchived
            }
          }
        }
      }
    `;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) headers['Authorization'] = `bearer ${this.token}`;

    const response = await fetch(this.api, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables: { userName: this.username }
      })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();
    if (json.errors) throw new Error(json.errors[0].message);

    return json.data.user.repositories.nodes
      .filter(repo => !repo.isArchived)
      .map(repo => ({
        name: repo.name,
        description: repo.description || '',
        url: repo.url,
        stars: repo.stargazerCount,
        forks: repo.forkCount,
        language: repo.primaryLanguage?.name || '',
        topics: repo.topics.nodes.map(t => t.name),
        updated: new Date(repo.updatedAt),
        pushed: new Date(repo.pushedAt)
      }));
  }

  getCache() {
    const stored = localStorage.getItem(this.cacheKey);
    if (!stored) return null;

    const { data, timestamp } = JSON.parse(stored);
    if (Date.now() - timestamp > this.cacheTTL) {
      localStorage.removeItem(this.cacheKey);
      return null;
    }
    return data;
  }

  setCache(data) {
    localStorage.setItem(this.cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }

  getFallback() {
    // Return empty — let page use static featured projects
    return [];
  }

  // Inject into "View All" link with metadata
  static formatReposGrid(repos) {
    if (!repos || repos.length === 0) return '';

    return repos.map(repo => `
      <div class="project-card-compact">
        <h4><a href="${repo.url}" target="_blank" rel="noopener">${repo.name}</a></h4>
        <p class="desc">${repo.description.substring(0, 120)}${repo.description.length > 120 ? '...' : ''}</p>
        <div class="meta">
          <span class="stars">⭐ ${repo.stars}</span>
          <span class="lang">${repo.language}</span>
          <span class="updated">${repo.updated.toLocaleDateString()}</span>
        </div>
        <div class="topics">${repo.topics.map(t => `<span class="topic">${t}</span>`).join('')}</div>
      </div>
    `).join('');
  }
}

// Auto-init on page load (non-blocking)
document.addEventListener('DOMContentLoaded', async () => {
  const fetcher = new GitHubProjectsFetcher('saitejasrivilli');

  // Load in background, update "View All" section if element exists
  fetcher.fetch().then(repos => {
    const container = document.getElementById('all-repos-grid');
    if (container && repos.length > 0) {
      container.innerHTML = GitHubProjectsFetcher.formatReposGrid(repos);
      // Add refresh button
      const refreshBtn = document.createElement('button');
      refreshBtn.className = 'refresh-repos-btn';
      refreshBtn.textContent = '🔄 Refresh';
      refreshBtn.onclick = () => {
        localStorage.removeItem(`gh_projects_saitejasrivilli`);
        location.reload();
      };
      container.parentElement.appendChild(refreshBtn);
    }
  });
});

// Public GitHub repository list. No visitor token or account setup is required.
class GitHubProjectsFetcher {
  constructor(username = 'saitejasrivilli') {
    this.username = username;
    this.cacheKey = `gh_projects_v2_${username}`;
    this.cacheTTL = 3600000;
    this.api = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&type=owner`;
    this.fallback = [
      { name: 'metal-inference-server', description: 'Continuous-batching LLM inference server for Apple Silicon with streaming, paged KV cache, and observability.', url: 'https://github.com/saitejasrivilli/metal-inference-server', language: 'Python', topics: ['LLM inference', 'Metal', 'MPS'] },
      { name: 'LLMBoost', description: 'MLIR compiler pass for fusing RMSNorm and Linear operations in LLM inference.', url: 'https://github.com/saitejasrivilli/LLMBoost', language: 'C++', topics: ['MLIR', 'CUDA', 'compiler'] },
      { name: 'flash-attn-from-scratch', description: 'Triton FlashAttention, int8 GEMM, and fused CUDA kernels with benchmark artifacts.', url: 'https://github.com/saitejasrivilli/flash-attn-from-scratch', language: 'Python', topics: ['Triton', 'CUDA', 'GPU'] },
      { name: 'distributed-training-models', description: 'PyTorch DDP/FSDP, mixed precision, and pipeline-parallel training benchmarks.', url: 'https://github.com/saitejasrivilli/distributed-training-models', language: 'Python', topics: ['PyTorch', 'DDP', 'FSDP'] },
      { name: 'search-engine-rs', description: 'Rust search engine with tokenization, inverted index, BM25, sharding, and query benchmarks.', url: 'https://github.com/saitejasrivilli/search-engine-rs', language: 'Rust', topics: ['BM25', 'search', 'Rust'] },
      { name: 'ledgerdb', description: 'Go distributed commit log and document store with Raft, MVCC, and fault-injection tests.', url: 'https://github.com/saitejasrivilli/ledgerdb', language: 'Go', topics: ['Raft', 'MVCC', 'distributed systems'] }
    ];
  }

  storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (_) { return null; }
  }
  storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (_) {}
  }
  storageRemove(key) {
    try { window.localStorage.removeItem(key); } catch (_) {}
  }

  getCache() {
    const raw = this.storageGet(this.cacheKey);
    if (!raw) return null;
    try {
      const cached = JSON.parse(raw);
      if (Array.isArray(cached.data) && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data.map(repo => ({
          ...repo,
          updated: repo.updated ? new Date(repo.updated) : null
        }));
      }
    } catch (_) {}
    this.storageRemove(this.cacheKey);
    return null;
  }

  async fetch() {
    const cached = this.getCache();
    if (cached) return cached;
    try {
      const response = await window.fetch(this.api, { headers: { Accept: 'application/vnd.github+json' } });
      if (!response.ok) throw new Error(`GitHub API HTTP ${response.status}`);
      const repos = await response.json();
      if (!Array.isArray(repos)) throw new Error('Unexpected repository response');
      const items = repos
        .filter(repo => !repo.fork && !repo.archived && !repo.private)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 15)
        .map(repo => ({
          name: repo.name,
          description: repo.description || 'Public repository',
          url: repo.html_url,
          stars: Number.isFinite(repo.stargazers_count) ? repo.stargazers_count : null,
          language: repo.language || 'Repository',
          topics: Array.isArray(repo.topics) ? repo.topics.slice(0, 5) : [],
          updated: repo.updated_at ? new Date(repo.updated_at) : null
        }));
      const data = items.length ? items : this.fallback;
      this.storageSet(this.cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
      return data;
    } catch (error) {
      console.warn('GitHub list unavailable; using curated projects.', error);
      return this.fallback;
    }
  }

  render(repos, container) {
    container.replaceChildren();
    repos.forEach(repo => {
      const card = document.createElement('article');
      card.className = 'project-card-compact';
      const heading = document.createElement('h4');
      const link = document.createElement('a');
      link.href = repo.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = repo.name;
      heading.appendChild(link);
      card.appendChild(heading);

      const description = document.createElement('p');
      description.className = 'desc';
      const summary = String(repo.description || 'Public repository');
      description.textContent = summary.length > 160 ? summary.slice(0, 157) + '…' : summary;
      card.appendChild(description);

      const meta = document.createElement('div');
      meta.className = 'meta';
      if (Number.isFinite(repo.stars)) {
        const stars = document.createElement('span');
        stars.className = 'stars';
        stars.textContent = `★ ${repo.stars}`;
        meta.appendChild(stars);
      }
      const language = document.createElement('span');
      language.className = 'lang';
      language.textContent = repo.language || 'Repository';
      meta.appendChild(language);
      if (repo.updated instanceof Date && !Number.isNaN(repo.updated.valueOf())) {
        const updated = document.createElement('span');
        updated.className = 'updated';
        updated.textContent = `Updated ${repo.updated.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`;
        meta.appendChild(updated);
      }
      card.appendChild(meta);

      if (Array.isArray(repo.topics) && repo.topics.length) {
        const topics = document.createElement('div');
        topics.className = 'topics';
        repo.topics.slice(0, 5).forEach(topic => {
          const tag = document.createElement('span');
          tag.className = 'topic';
          tag.textContent = topic;
          topics.appendChild(tag);
        });
        card.appendChild(topics);
      }
      container.appendChild(card);
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('all-repos-grid');
  if (!container) return;
  const fetcher = new GitHubProjectsFetcher();
  const load = async () => {
    const repos = await fetcher.fetch();
    fetcher.render(repos, container);
  };
  await load();
  const wrapper = container.parentElement;
  if (wrapper && !wrapper.querySelector('.refresh-repos-btn')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'refresh-repos-btn';
    button.textContent = 'Refresh repository list';
    button.addEventListener('click', async () => {
      fetcher.storageRemove(fetcher.cacheKey);
      await load();
    });
    wrapper.appendChild(button);
  }
});

#!/usr/bin/env python3
"""
Portfolio Auto-Updater
- Updates index.html with TOP 5 latest projects (sorted by update date)
- Updates role-specific pages with ONLY relevant projects
"""

import os
import re
import requests
from datetime import datetime

# Configuration
GITHUB_USERNAME = os.environ.get("GITHUB_USERNAME", "saitejasrivilli")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
PORTFOLIO_ROOT = os.environ.get("PORTFOLIO_ROOT", ".")

# Repos to exclude
EXCLUDE_REPOS = [
    "saitejasrivilli.github.io",
    "saitejasrivilli",
    ".github"
]

# Role-specific classification rules
ROLE_CATEGORIES = {
    "DeepLearning.html": {
        "keywords": ["deep-learning", "neural", "pytorch", "tensorflow", "cnn", "rnn", 
                     "transformer", "attention", "cuda", "gpu", "optimization", "flashattention",
                     "quantization", "vision", "computer-vision", "image"],
        "name_patterns": ["attention", "neural", "deep", "cnn", "vision", "gpu", "quantization",
                          "optimization", "mistral", "transformer"],
        "languages": ["Jupyter Notebook"],
        "description_keywords": ["deep learning", "neural network", "gpu", "cuda", "attention",
                                  "quantization", "optimization", "vision", "image"]
    },
    "LLMGenAI.html": {
        "keywords": ["llm", "genai", "generative-ai", "langchain", "rag", "agent", "chatbot",
                     "gpt", "llama", "mistral", "fine-tuning", "lora", "qlora", "vllm", 
                     "huggingface", "transformers", "prompt", "openai"],
        "name_patterns": ["llm", "agent", "rag", "lora", "genai", "chat", "vllm", "gpt",
                          "assistant", "langchain"],
        "languages": [],
        "description_keywords": ["llm", "language model", "rag", "agent", "chatbot", "gpt",
                                  "fine-tuning", "lora", "generative"]
    },
    "MLEngineer.html": {
        "keywords": ["machine-learning", "ml", "mlops", "sklearn", "scikit-learn", "xgboost",
                     "classification", "regression", "clustering", "mlflow", "prediction",
                     "recommender", "recommendation", "churn", "sentiment", "analysis"],
        "name_patterns": ["ml", "predict", "classifier", "recommender", "churn", "sentiment",
                          "analysis", "ab-test", "abtesting"],
        "languages": [],
        "description_keywords": ["machine learning", "prediction", "classification", "recommender",
                                  "sentiment", "churn", "a/b test", "collaborative filtering"]
    },
    "BackendSDE.html": {
        "keywords": ["backend", "api", "microservices", "distributed", "database", "sql",
                     "redis", "kafka", "grpc", "rest", "server", "systems", "scheduling"],
        "name_patterns": ["backend", "api", "server", "distributed", "kv", "service", "grpc",
                          "scheduling", "job"],
        "languages": ["Go", "Java", "Rust"],
        "description_keywords": ["backend", "distributed", "api", "microservice", "server",
                                  "database", "scheduling"]
    },
    "CloudData.html": {
        "keywords": ["cloud", "aws", "gcp", "azure", "docker", "kubernetes", "terraform",
                     "data-engineering", "spark", "hadoop", "etl", "data-pipeline", "airflow",
                     "sagemaker"],
        "name_patterns": ["cloud", "aws", "data-", "etl", "pipeline", "infra", "docker"],
        "languages": [],
        "description_keywords": ["aws", "cloud", "docker", "data pipeline", "sagemaker",
                                  "deployment", "infrastructure"]
    },
    "Research.html": {
        "keywords": ["research", "paper", "arxiv", "ieee", "publication", "wireless", 
                     "6g", "network", "academic", "survey"],
        "name_patterns": ["research", "paper", "thesis", "survey"],
        "languages": ["TeX", "LaTeX"],
        "description_keywords": ["research", "paper", "ieee", "publication", "academic"]
    }
}

# Project HTML template
PROJECT_TEMPLATE = '''
            <a href="{url}" class="project-item" target="_blank">
                <div class="project-header"><h3 class="project-title">{name}</h3><span class="project-impact">{category}</span></div>
                <p class="project-description">{description}</p>
                <div class="project-tech">{tech_tags}</div>
            </a>'''


def fetch_repos():
    """Fetch all public repos from GitHub."""
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    
    repos = []
    page = 1
    
    while True:
        url = f"https://api.github.com/users/{GITHUB_USERNAME}/repos?per_page=100&page={page}&sort=updated&direction=desc"
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            print(f"Error fetching repos: {response.status_code}")
            break
            
        data = response.json()
        if not data:
            break
            
        repos.extend(data)
        page += 1
    
    return repos


def get_repo_topics(repo_name):
    """Fetch topics for a specific repo."""
    headers = {"Accept": "application/vnd.github.mercy-preview+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    
    url = f"https://api.github.com/repos/{GITHUB_USERNAME}/{repo_name}/topics"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json().get("names", [])
    return []


def classify_repo_for_role(repo, role_file):
    """Check if a repo belongs to a specific role category."""
    criteria = ROLE_CATEGORIES.get(role_file, {})
    if not criteria:
        return False
    
    repo_name = repo["name"].lower()
    description = (repo.get("description") or "").lower()
    language = repo.get("language") or ""
    topics = get_repo_topics(repo["name"])
    
    score = 0
    
    # Check keywords in topics
    for keyword in criteria.get("keywords", []):
        if keyword.lower() in topics:
            score += 3
    
    # Check name patterns
    for pattern in criteria.get("name_patterns", []):
        if pattern.lower() in repo_name:
            score += 2
    
    # Check language
    if language in criteria.get("languages", []):
        score += 2
    
    # Check description keywords
    for keyword in criteria.get("description_keywords", []):
        if keyword.lower() in description:
            score += 2
    
    return score >= 2  # Threshold for inclusion


def get_category_label(repo):
    """Determine a display category label."""
    language = repo.get("language") or ""
    description = (repo.get("description") or "").lower()
    name = repo["name"].lower()
    
    # Check patterns
    if any(x in name or x in description for x in ["attention", "gpu", "cuda", "quantization", "optimization"]):
        return "Deep Learning"
    if any(x in name or x in description for x in ["llm", "rag", "agent", "lora", "vllm"]):
        return "GenAI"
    if any(x in name or x in description for x in ["sentiment", "recommender", "churn", "predict"]):
        return "ML"
    if any(x in name for x in ["distributed", "backend", "scheduling"]):
        return "Backend"
    if any(x in name or x in description for x in ["aws", "cloud", "docker"]):
        return "Cloud"
    if any(x in name for x in ["research", "paper"]):
        return "Research"
    
    if language:
        return language
    return "Project"


def format_repo_name(name):
    """Convert repo-name to readable title."""
    # Special cases
    special_names = {
        "abtesting": "A/B Testing",
        "sentimentanalysis": "Sentiment Analysis",
        "distributedkvstore": "Distributed KV Store",
        "computervision": "Computer Vision",
        "telecomchurnpredictor": "Telecom Churn Predictor",
        "advancedllmagent": "Advanced LLM Agent",
        "datasciencemasters": "Data Science Masters",
        "telugugpt": "Telugu GPT",
        "jobschedulingalgoscompa": "Job Scheduling Algorithms",
        "ai-agent": "AI Agent",
        "multi-lora-rag-assistant": "Multi-LoRA RAG Assistant",
        "gpu-optimization-mistral": "GPU Optimization for Mistral",
        "vllm-throughput-benchmark": "vLLM Throughput Benchmark",
        "llm-long-context-stress-test": "LLM Long Context Stress Test",
        "offline-rag-assistant": "Offline RAG Assistant",
        "ai-video-analysis-system": "AI Video Analysis System",
        "amazon-recommender-system": "Amazon Recommender System",
        "youtube-transcript-query-tool": "YouTube Transcript Query Tool",
        "buyer-seller-mt": "Buyer-Seller Machine Translation",
        "quantization-speculative-decoding-benchmark": "Quantization & Speculative Decoding Benchmark"
    }
    
    lower_name = name.lower().replace("-", "").replace("_", "")
    if lower_name in special_names:
        return special_names[lower_name]
    
    # Check with hyphens
    if name.lower() in special_names:
        return special_names[name.lower()]
    
    # Default: replace hyphens/underscores with spaces and title case
    return name.replace("-", " ").replace("_", " ").title()


def generate_tech_tags(repo):
    """Generate HTML tech tags."""
    tags = []
    
    if repo.get("language"):
        tags.append(repo["language"])
    
    topics = get_repo_topics(repo["name"])
    for topic in topics[:4]:
        formatted = topic.replace("-", " ").title()
        if formatted not in tags:
            tags.append(formatted)
    
    return "".join([f'<span class="tech-tag">{tag}</span>' for tag in tags[:5]])


def generate_project_html(repo):
    """Generate HTML for a project."""
    description = repo.get("description") or f"A {get_category_label(repo).lower()} project."
    
    return PROJECT_TEMPLATE.format(
        url=repo["html_url"],
        name=format_repo_name(repo["name"]),
        category=get_category_label(repo),
        description=description,
        tech_tags=generate_tech_tags(repo)
    )


def update_html_file(file_path, repos, file_type="index"):
    """Update an HTML file with projects."""
    if not os.path.exists(file_path):
        print(f"⚠️  File not found: {file_path}")
        return False
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Find projects section - try multiple patterns
    patterns = [
        r'(<section[^>]*id="projects"[^>]*>.*?<h2[^>]*class="section-title"[^>]*>.*?</h2>)(.*?)(</div>\s*</section>)',
        r'(<section[^>]*id="projects"[^>]*>.*?Featured Projects.*?</h2>)(.*?)(</div>\s*</section>)',
        r'(<section[^>]*id="projects"[^>]*>.*?Projects.*?</h2>)(.*?)(</div>\s*</section>)'
    ]
    
    match = None
    for pattern in patterns:
        match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
        if match:
            break
    
    if not match:
        print(f"⚠️  Could not find projects section in {file_path}")
        return False
    
    # Generate projects HTML
    projects_html = "\n".join([generate_project_html(repo) for repo in repos])
    
    # Replace content
    new_content = content[:match.end(1)] + "\n" + projects_html + "\n        " + content[match.start(3):]
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print(f"✅ Updated {os.path.basename(file_path)} with {len(repos)} projects")
    return True


def main():
    print(f"🔍 Fetching repos for {GITHUB_USERNAME}...")
    repos = fetch_repos()
    print(f"📦 Found {len(repos)} total repositories")
    
    # Filter repos
    repos = [r for r in repos if not r.get("fork")]
    repos = [r for r in repos if r["name"] not in EXCLUDE_REPOS]
    repos = [r for r in repos if r.get("description")]
    
    # Sort by updated_at (newest first)
    repos.sort(key=lambda r: r.get("updated_at", ""), reverse=True)
    
    print(f"✨ Processing {len(repos)} eligible repositories\n")
    
    # Update index.html with TOP 5 latest projects only
    print("📝 Updating index.html (top 5 latest projects)...")
    index_path = os.path.join(PORTFOLIO_ROOT, "index.html")
    top_5_repos = repos[:5]  # Already sorted by date, take first 5
    update_html_file(index_path, top_5_repos)
    
    # Update each role-specific page
    print("\n📝 Updating role-specific pages...")
    for role_file in ROLE_CATEGORIES.keys():
        role_path = os.path.join(PORTFOLIO_ROOT, role_file)
        
        # Filter repos for this role
        role_repos = [r for r in repos if classify_repo_for_role(r, role_file)]
        
        if role_repos:
            update_html_file(role_path, role_repos, file_type="role")
        else:
            print(f"⚠️  No matching projects for {role_file}")
    
    print("\n🎉 Portfolio update complete!")
    
    # Summary
    print("\n📊 Summary:")
    print(f"   index.html: {len(top_5_repos)} projects (top 5 latest)")
    for role_file in ROLE_CATEGORIES.keys():
        role_repos = [r for r in repos if classify_repo_for_role(r, role_file)]
        print(f"   {role_file}: {len(role_repos)} projects")


if __name__ == "__main__":
    main()

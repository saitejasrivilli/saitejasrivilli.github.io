#!/usr/bin/env python3
"""
Portfolio Auto-Updater (Simplified)
Fetches all GitHub repos and updates index.html, sorted by last updated date (newest first).
"""

import os
import re
import requests
from datetime import datetime

# Configuration
GITHUB_USERNAME = os.environ.get("GITHUB_USERNAME", "saitejasrivilli")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
PORTFOLIO_ROOT = os.environ.get("PORTFOLIO_ROOT", ".")

# Repos to exclude (like the portfolio repo itself)
EXCLUDE_REPOS = [
    "saitejasrivilli.github.io",
    ".github"
]

# Project HTML template (matches your existing style)
PROJECT_TEMPLATE = '''
            <a href="{url}" class="project-item" target="_blank">
                <div class="project-header"><h3 class="project-title">{name}</h3><span class="project-impact">{category}</span></div>
                <p class="project-description">{description}</p>
                <div class="project-tech">{tech_tags}</div>
            </a>'''


def fetch_repos():
    """Fetch all public repos from GitHub, sorted by updated date."""
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


def get_category_label(repo):
    """Determine a category label based on repo language/topics."""
    language = repo.get("language") or ""
    topics = get_repo_topics(repo["name"])
    name = repo["name"].lower()
    
    # Check for specific patterns
    if any(t in topics for t in ["deep-learning", "pytorch", "tensorflow", "cuda", "gpu"]):
        return "Deep Learning"
    if any(t in topics for t in ["llm", "langchain", "rag", "agent", "genai"]):
        return "GenAI"
    if any(t in topics for t in ["machine-learning", "ml", "sklearn", "mlops"]):
        return "ML"
    if language in ["Go", "Java", "Rust"] or any(t in topics for t in ["backend", "distributed", "api"]):
        return "Backend"
    if any(t in topics for t in ["aws", "cloud", "docker", "kubernetes"]):
        return "Cloud"
    if any(t in topics for t in ["research", "paper", "ieee"]):
        return "Research"
    
    # Fallback to language or generic
    if language:
        return language
    return "Project"


def format_repo_name(name):
    """Convert repo-name to Title Case display name."""
    return name.replace("-", " ").replace("_", " ").title()


def generate_tech_tags(repo):
    """Generate HTML tech tags from repo language and topics."""
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
    """Generate HTML for a single project."""
    description = repo.get("description") or f"A {get_category_label(repo).lower()} project."
    
    return PROJECT_TEMPLATE.format(
        url=repo["html_url"],
        name=format_repo_name(repo["name"]),
        category=get_category_label(repo),
        description=description,
        tech_tags=generate_tech_tags(repo)
    )


def update_index_html(repos):
    """Update index.html with all projects."""
    index_path = os.path.join(PORTFOLIO_ROOT, "index.html")
    
    if not os.path.exists(index_path):
        print(f"Error: {index_path} not found!")
        return False
    
    with open(index_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Find the projects section
    # Pattern: from <section...id="projects"> to </section>
    pattern = r'(<section[^>]*id="projects"[^>]*>.*?<h2[^>]*class="section-title"[^>]*>.*?</h2>)(.*?)(</div>\s*</section>)'
    
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        # Try alternative pattern
        pattern = r'(<section[^>]*id="projects"[^>]*>.*?Featured Projects.*?</h2>)(.*?)(</div>\s*</section>)'
        match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print("Error: Could not find projects section in index.html")
        return False
    
    # Generate new projects HTML
    projects_html = "\n".join([generate_project_html(repo) for repo in repos])
    
    # Replace the projects section content
    new_content = content[:match.end(1)] + "\n" + projects_html + "\n        " + content[match.start(3):]
    
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print(f"✅ Updated index.html with {len(repos)} projects")
    return True


def main():
    print(f"🔍 Fetching repos for {GITHUB_USERNAME}...")
    repos = fetch_repos()
    print(f"📦 Found {len(repos)} total repositories")
    
    # Filter repos
    repos = [r for r in repos if not r.get("fork")]  # Exclude forks
    repos = [r for r in repos if r["name"] not in EXCLUDE_REPOS]  # Exclude specific repos
    repos = [r for r in repos if r.get("description")]  # Only repos with descriptions
    
    print(f"✨ Processing {len(repos)} eligible repositories")
    
    # Sort by updated_at (newest first) - already sorted from API, but ensure it
    repos.sort(key=lambda r: r.get("updated_at", ""), reverse=True)
    
    # Print the order
    print("\n📋 Projects (sorted by last updated):")
    for i, repo in enumerate(repos, 1):
        updated = repo.get("updated_at", "")[:10]
        print(f"   {i}. {repo['name']} (updated: {updated})")
    
    # Update index.html
    print("\n📝 Updating index.html...")
    success = update_index_html(repos)
    
    if success:
        print("\n🎉 Portfolio updated successfully!")
    else:
        print("\n❌ Failed to update portfolio")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())

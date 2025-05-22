import requests
import json
from flask import Flask, render_template, request, send_file, Response
import math
import csv
import io

app = Flask(__name__, static_folder='static')

def get_github_repos(username):
    try:
        url = f"https://api.github.com/users/{username}/repos"
        response = requests.get(url)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        repos = response.json()
        return repos
    except requests.exceptions.RequestException as e:
        print(f"Error fetching repositories: {e}")
        return []

def get_github_user(username):
    try:
        url = f"https://api.github.com/users/{username}"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching user: {e}")
        return None

@app.route("/", methods=["GET", "POST"])
def index():
    repos = []
    username = ""
    user_url = ""
    user_data = None
    page = int(request.args.get("page", 1))
    per_page = 10
    total_pages = 1
    sort = request.args.get("sort", "")
    stats = None
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        sort = request.form.get("sort", "")
        if username:
            repos = get_github_repos(username)
            user_url = f"https://github.com/{username}?tab=repositories"
            user_data = get_github_user(username)
    elif request.method == "GET":
        username = request.args.get("username", "").strip()
        if username:
            repos = get_github_repos(username)
            user_url = f"https://github.com/{username}?tab=repositories"
            user_data = get_github_user(username)
    # Ordenar repositorios
    if sort == "name":
        repos = sorted(repos, key=lambda r: r.get("name", "").lower())
    elif sort == "stars":
        repos = sorted(repos, key=lambda r: r.get("stargazers_count", 0), reverse=True)
    elif sort == "created":
        repos = sorted(repos, key=lambda r: r.get("created_at", ""), reverse=True)
    total_pages = math.ceil(len(repos) / per_page) if repos else 1
    # Estadísticas rápidas
    if user_data:
        total_repos = user_data.get("public_repos", 0)
        followers = user_data.get("followers", 0)
        following = user_data.get("following", 0)
        total_stars = sum(r.get("stargazers_count", 0) for r in repos)
        stats = {
            "total_repos": total_repos,
            "followers": followers,
            "following": following,
            "total_stars": total_stars
        }
    # Paginación
    start = (page - 1) * per_page
    end = start + per_page
    repos_paginated = repos[start:end]
    return render_template(
        "index.html",
        repos=repos_paginated,
        username=username,
        user_url=user_url,
        page=page,
        total_pages=total_pages,
        user_data=user_data,
        sort=sort,
        stats=stats
    )

@app.route("/download_csv")
def download_csv():
    username = request.args.get("username", "").strip()
    sort = request.args.get("sort", "")
    if not username:
        return "No username provided", 400
    repos = get_github_repos(username)
    # Ordenar repositorios igual que en la vista principal
    if sort == "name":
        repos = sorted(repos, key=lambda r: r.get("name", "").lower())
    elif sort == "stars":
        repos = sorted(repos, key=lambda r: r.get("stargazers_count", 0), reverse=True)
    elif sort == "created":
        repos = sorted(repos, key=lambda r: r.get("created_at", ""), reverse=True)
    # Crear CSV en memoria
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Nombre", "Descripción", "URL"])
    for repo in repos:
        writer.writerow([
            repo.get("name", ""),
            repo.get("description", ""),
            repo.get("html_url", "")
        ])
    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={username}_repos.csv"
        }
    )

if __name__ == "__main__":
    app.run(debug=True)

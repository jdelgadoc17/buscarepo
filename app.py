from flask import Flask, render_template, request
import json
import subprocess

app = Flask(__name__, static_folder='static')

def get_github_repos(username):
    try:
        command = [
            "C:\\Program Files\\nodejs\\npx.cmd",
            "-y",
            "@modelcontextprotocol/cli",
            "call",
            "github.com/modelcontextprotocol/servers/tree/main/src/github",
            "search_repositories",
            '{"query": f"user:{username}"}'
        ]
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        output = result.stdout.strip()
        try:
            data = json.loads(output)
            # Ajusta aquí si la estructura es diferente
            if "items" in data:
                return data["items"]
            elif isinstance(data, list):
                return data
            else:
                print(f"Estructura inesperada: {data}")
                return []
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}, output: {output}")
            return []
    except subprocess.CalledProcessError as e:
        print(f"Error ejecutando el comando: {e}\nSalida de error: {e.stderr}")
        return []

@app.route("/", methods=["GET", "POST"])
def index():
    repos = []
    username = ""
    user_url = ""
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        if username:
            repos = get_github_repos(username)
            user_url = f"https://github.com/{username}?tab=repositories"
    return render_template("index.html", repos=repos, username=username, user_url=user_url)

if __name__ == "__main__":
    app.run(debug=True)

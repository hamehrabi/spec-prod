# `.gitignore` — blueprint

> Writes: `.gitignore`
> Comment: `#`

A **wrapper blueprint**. The artifact it produces is not Markdown, and this plugin ships
Markdown only (ADR-002, FF-009) — so the blueprint is Markdown that *carries* the file rather
than being it. The fill procedure writes the fenced block below to the declared path.

**Write this before `.env.example`, always** (REQ-NF-002). The ignore rule has to exist
before the file that invites someone to copy it, or the first copy is the one that gets
committed.

This is the **generated workspace's** ignore file. The developer's own `.gitignore` at their
repository root is never touched, and no rule ignoring the workspace folder is ever added —
the workspace is meant to be committed (REQ-F-035).

```gitignore
# Secrets — never commit real values
.env
.env.local
.env.*.local
*.pem
*.key
secrets/

# Dependencies and build output
node_modules/
venv/
.venv/
__pycache__/
dist/
build/
coverage/

# OS and editor
.DS_Store
Thumbs.db
desktop.ini
.idea/
.vscode/
*.swp
*.log
```

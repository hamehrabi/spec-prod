# `.env.example` — blueprint

> Writes: `.env.example`
> Comment: `#`

A **wrapper blueprint** — see `gitignore.md` for why the content sits in a fenced block.

**Never written before `.gitignore`** (REQ-NF-002). Placeholders only: every value here is an
example, and a real credential in this file is a real credential in version control.

If the project genuinely has no environment variables, say so **in the file** rather than
shipping an empty one — an empty `.env.example` reads as an oversight, and a stated *none, by
design* reads as a decision.

```dotenv
# Environment variable template
#
# RULES
# - Placeholders only. Never commit real credentials, tokens, or keys.
# - Every value here must also appear in the environment-config specification with
#   its purpose, an example value, and a security note.
# - Values marked SECRET must never be printed in logs or error messages.
#
# If this project has no environment variables, replace this file's body with a
# short statement saying so and why — not an empty file.

# APP_ENV=development
# DATABASE_URL=postgres://user:password@localhost:5432/dbname   # SECRET
```

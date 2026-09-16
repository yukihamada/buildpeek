# BuildPeek self-review — real Docker image, 2026-09-16

BuildPeek was run against its own example image, built for real with Docker 29.3.1.

## What was reviewed

An example app was built from `examples/deploy.Dockerfile` (a two-stage Node → nginx build
containing four deliberate mistakes). Then three real inputs were fed to the scanner:

| Input | Source | Records | High | Review |
|---|---|---|---|---|
| Dockerfile | `examples/deploy.Dockerfile` | 14 | 3 | 1 |
| Image history | `docker history --no-trunc --format '{{.CreatedBy}}'` | 23 | 1 | 2 |
| Image config | `docker inspect` (JSON) | 6 | 0 | 0 |

## Dockerfile findings (4)

| Line | Rule | What it caught |
|---|---|---|
| 4 | BP001 | `ARG NPM_TOKEN` — secret-like build argument |
| 6 | BP007 | `npm config set //registry.npmjs.org/:_authToken=...` — auth written to a config file |
| 9 | BP006 | `COPY . .` — whole build context copied |
| 14 | BP005 | `COPY .env /app/.env` — sensitive file into a layer |

**Docker's own linter agrees on line 4.** The build printed:

```
1 warning found (use docker --debug to expand):
 - SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data (ARG "NPM_TOKEN") (line 4)
```

So BP001 is a true positive independently confirmed by Docker itself.

## Image history findings (3)

- **line 3, BP005 (high)** — `COPY .env /app/.env`. True positive. The file is in the image
  even though a later instruction could remove it.
- **line 5 and line 17, BP008 (review)** — `set -x` in the **nginx base image's** own build
  steps, not in this Dockerfile. **These are false positives.**

## Honest assessment

**True positives: 5** (4 in the Dockerfile, 1 in history).
**False positives: 2** — both BP008, both from `set -x` inside the upstream nginx image.

The false positives are not harmless noise. A tool that flags a base image you cannot change
trains people to ignore it. Two concrete options, not yet implemented:

1. Lower BP008 to fire only when a secret variable or mounted secret is present, not on bare
   `set -x`. This would drop both false positives here and keep the rule's real value.
2. Keep the rule but distinguish "your instruction" from "inherited base-image instruction",
   which requires parsing stage boundaries.

**`docker inspect` found nothing (0 findings, 6 records).** This is expected and worth
knowing: `docker inspect` gives environment config but not build history. BuildPeek's own UI
says this, and this run confirms the warning is real — reviewing only `docker inspect` output
would have missed the `.env` copy entirely.

## What this does not show

- One synthetic image, built on this machine. Not a recall/precision measurement.
- No secret was real; `NPM_TOKEN` was a dummy value and no registry was contacted.
- Filesystem layers were not scanned. BuildPeek only reads the text it is given.

## Reproduce

```sh
cd examples
NPM_TOKEN_DUMMY=not-a-real-token docker build -f deploy.Dockerfile \
  --secret id=NPM_TOKEN,env=NPM_TOKEN_DUMMY -t buildpeek-example:latest .
docker history --no-trunc --format '{{.CreatedBy}}' buildpeek-example:latest
# paste into https://yukihamada.github.io/buildpeek/
```

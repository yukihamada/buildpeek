# BuildPeek

**See the secrets your Docker build might leave behind.**

A free, local-first browser tool for reviewing Dockerfiles, image history and image-config JSON. Eight explainable heuristic rules flag secret-like arguments, environment variables, credential formats, authenticated URLs, sensitive file copies, whole-context copies, persisted authentication and potentially revealing logs.

English and Japanese. No account. No runtime dependencies. No input uploads or credential validation.

## Run locally

Requires Node.js 22+.

```sh
npm test
npm run build
npm run preview
```

Open http://127.0.0.1:8942. Choose **Try a risky build** for a synthetic example, or paste your own Dockerfile.

To review a local image's build history, run this yourself, substituting an image you own:

```sh
docker history --no-trunc --format '{{.CreatedBy}}' YOUR_IMAGE
```

Paste its output into BuildPeek. Image config JSON containing `history[].created_by` or `config.Env` / `Config.Env` is also supported. `docker inspect` normally supplies environment configuration but **not** build history; review history separately.

## The eight rules

| ID | What it looks for | Severity |
|---|---|---|
| BP001 | Secret-like `ARG` name | High |
| BP002 | Secret-like `ENV` assignment | High |
| BP003 | Credential-shaped literal (GitHub, AWS, OpenAI, Slack, private keys) | High |
| BP004 | Authentication embedded in a URL | High |
| BP005 | Sensitive file named in `COPY` / `ADD` | High |
| BP006 | Whole build context copied (`COPY .` / `ADD .`) | Review |
| BP007 | Authentication written to a config file | High |
| BP008 | Secret possibly printed or shell tracing enabled | Review |

That is the whole detector. If a pattern is not in this table, BuildPeek does not look for it.

## Offline build

`npm run build` also produces `dist/buildpeek-offline.html`: a single file that runs from
`file://` with no server and no network. Save it and open it with the network unplugged. Use
it when you would rather not paste anything into a hosted page at all.

## Scope and data handling

- Input is processed in a Web Worker and is not uploaded or saved by the app.
- The static host receives ordinary page/asset requests and may maintain normal hosting logs. Input text is not part of those requests.
- No analytics, cookies or browser storage are used by this app.
- Reports contain fixed rule metadata and numeric positions, not matched values, source text or file names. Summary cards contain aggregate counts only.
- Eight heuristic rules are not comprehensive secret detection. False positives and false negatives are possible. No findings does not mean an image is safe.
- No tarball extraction, filesystem-layer scanning, registry access, live credential verification, `.dockerignore` analysis or automatic remediation.
- This is a pre-flight review, not a CI gate and not a CLI. There is no exit code.
- A rule match counts as a finding. Multiple rules may flag the same instruction.
- Input limit: 2 MiB. Findings displayed: first 500, with an explicit truncation notice.
- The hosted page ships `connect-src 'none'` in its CSP, so the browser blocks outbound calls at the policy level. Verify it yourself in DevTools rather than trusting this file.

Use the review alongside your regular image, source and secret-scanning workflows. Review Docker's [build secrets documentation](https://docs.docker.com/build/building/secrets/).

## Browser verification

With the local preview running, and Python Playwright + Chromium/WebKit installed:

```sh
python3 tools/browser_check.py
```

This checks both languages, three viewport sizes, sample results, local file import, report/card downloads, invalid input, stale-result invalidation, cleared state, script injection and absence of external page requests. Evidence is written to `artifacts/` (not committed).

## Release

`.github/workflows/pages.yml` tests, builds and publishes the allowlisted `dist/` files through GitHub Actions. Repository creation and public deployment require the owner's approval. No deployment has happened merely by cloning or building this project.

Built by Yuki Hamada with GPT‑6 Astra through Sente. The running app uses deterministic rules, not AI inference.

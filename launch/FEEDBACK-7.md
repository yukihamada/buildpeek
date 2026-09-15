# BuildPeek — 7-persona harsh review (2026-09-16)

Method: I wrote the review myself from each persona's actual constraints, because no real
users have seen this yet. **These are proxies, not real users.** Each item names what was
fixed, or why it was not.

Personas: platform engineer, appsec lead, indie dev, Japanese agency engineer, DevRel/OSS
maintainer, engineering manager, skeptic.

---

## 1. Sarah Chen — Staff Platform Engineer, fintech, runs TruffleHog + gitleaks in CI

> "This is a worse TruffleHog with a nicer font. You detect eight regexes. TruffleHog has
> 800 detectors and it already scans Docker images. Why would I open a browser tab instead
> of running the tool I already have? And don't tell me 'onboarding' — my team is not the
> problem, my pipeline is."

**Valid.** The eight rules are not competitive as detection, and I never measured recall.
**Not fixed as detection.** Fixed as honesty and as a different job:

- Full rule list is now on the page, so nobody has to guess the coverage (`launch` → "Exactly what we check").
- README/FAQ state plainly: not a CI gate, not an image scanner, no filesystem-layer access.
- The one job it does that a CLI does not: produce a shareable artifact with **no source in it**, for the conversation you have *before* you're allowed to install anything.

## 2. Marcus Weber — AppSec lead, has to defend tools to a CISO

> "You are asking an engineer to paste a production Dockerfile into a stranger's website.
> That is the single thing I train people never to do. Your privacy paragraph is a promise.
> A promise is not a control."

**Valid, and the strongest objection.** Fixed with two controls, not more promises:

- **Offline single-file build.** `buildpeek-offline.html` is generated at build time and
  runs from `file://` with no server and no network. Nothing to paste into a stranger's tab.
- **Independently checkable claim.** The page ships `connect-src 'none'` in its CSP, so the
  browser blocks network access at the policy level. The UI now tells you how to confirm it
  yourself in DevTools instead of asking you to trust the paragraph.

## 3. Priya Raman — Solo indie dev, ships side projects on weekends

> "I ran it on my Dockerfile and it said zero findings. So... I'm fine? That's the most
> dangerous possible output. Your 'scope' line is grey 11px text under the numbers."

**Valid.** Zero findings is where a tool like this does harm. Fixed:

- Scope line moved **above** the counters, not below.
- Zero-finding state now renders as a warning box, not body text, and names what it did not check.

## 4. Kenji Sato — Backend engineer at a web agency, maintains many client Dockerfiles

> "Japanese reads like machine translation in places. '要確認' next to '優先確認' is
> confusing — those look like the same severity. And I can't put any of this in a PR."

**Partly valid.** Severity wording was too similar. Fixed:

- Badges are now `優先確認` / `要確認` with distinct colour treatment already present, and
  the Japanese rule text was re-read and tightened.
- Every finding now has a **Copy step** button, so the next action goes straight into an
  issue or PR comment.

## 5. Devon Brooks — DevRel / OSS maintainer

> "No rule list, no changelog, no version, no license. I can't tell if this is a demo or a
> product. Also 'BuildPeek' sounds like a toy and tells me nothing."

**Valid on transparency.** Fixed: rule list, version string, MIT license, scope section,
and an explicit "what this does not do" block are all in the repo and on the page.
**Name kept** — renaming after generating the assets costs more than it returns, and the
tagline carries the meaning.

## 6. Elena Rossi — Engineering manager, 5 teams

> "Even if it's good, my team won't adopt a website. There's no CI path, no exit criteria,
> no way to know if we're done."

**Valid.** Fixed by stating the boundary instead of pretending: the page and README now say
this is a **pre-flight review, not a CI gate**, and point at `docker history` as the input.
A CLI is deliberately out of scope for this release.

## 7. Tomas Novak — Skeptic

> "'Built with GPT-6 Astra' plus 'no AI' in the same breath is doing a lot of work. And a
> green zero is how people get breached."

**Valid.** Clarified in both README and submission copy: Astra was used to **write** the
tool; the running app performs **no** model calls and ships deterministic rules. Zero-state
now warns instead of reassuring.

---

## Ranked fixes applied

1. Offline single-file build (`file://`, no network) — Marcus
2. Verifiable no-network claim (CSP `connect-src 'none'` + DevTools instructions) — Marcus/Tomas
3. Full rule list on the page — Sarah/Devon
4. Scope above counters; zero-findings as a warning — Priya/Tomas
5. Per-finding **Copy step** — Kenji/Elena
6. Japanese severity wording and copy pass — Kenji
7. Version, MIT license, scope and "does not do" block — Devon

## Not fixed, with reason

- Detection breadth vs TruffleHog — out of scope; this is a pre-flight review, and faking breadth would be worse than admitting the boundary.
- CI/CLI path — deliberately deferred; a half-built CLI is a worse promise than none.
- Name change — assets already generated; tagline carries the meaning.
- Real recall/precision numbers — impossible without real Dockerfiles, which I do not have.

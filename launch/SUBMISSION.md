# Product Hunt submission — SUBMITTED 2026-09-16

Status: **scheduled for September 18, 2026, 12:01am PT (04:01pm JST)**, entered in the GPT-6 Astra Challenge.
Live page: https://www.producthunt.com/products/buildpeek — shows "Upvoting is disabled until the launch is live."

## Product

**Name:** BuildPeek

**Tagline:** Find Docker build-secret risks, without uploading your code

**Description:** Review Dockerfiles and image history for secret-like patterns locally in your browser. Get clear next steps, export an input-free report, and share a summary card. Free, no account. Built with GPT-6 Astra; no runtime AI calls.

**Website:** https://github.com/yukihamada/buildpeek (submission URL — `github.io` was rejected by PH's URL validator; the app itself is at https://yukihamada.github.io/buildpeek/)

**Pricing:** Free · **Open source:** yes · **Maker:** Yuki Hamada (@yukihamada)

**Launch tags:** Developer Tools, Security, Privacy — the form also auto-tagged GitHub from the repo URL.

**Shoutouts:** none added (optional; the form offers a product picker rather than free text).

**Images:** thumbnail 240×240, two gallery images 1270×760, all from the live UI.

## GPT-6 Astra Challenge answer (submitted)

> Astra let me argue with the product before writing it. I pushed back on the first three ideas and it kept the critique instead of defending them, which is how I landed on the narrow scope: eight explainable rules rather than a vague "AI security scan". It also wrote the harsh review I did not want to write myself — the objection that pasting a Dockerfile into a stranger's website is exactly what we train people never to do. That produced the offline single-file build that runs from file:// with no network. Astra wrote the tool; the shipped app makes no model calls and ships deterministic rules, because a reviewer should be able to read every rule it applies.

Referral source: Product Hunt Site.

## Maker first comment (submitted)

Hi Product Hunt, I'm Yuki.

A recent discussion about credentials left in Docker build history made me stop and look at what a build can remember. Removing a file later doesn't necessarily remove it from an earlier layer. A secret mount also doesn't help if the command saves the secret into a config file.

I built BuildPeek with GPT-6 Astra through Sente to make these patterns easier to spot before shipping.

Paste a Dockerfile, Docker history, or image-config JSON. Eight local rules highlight patterns to review and explain the next step. Nothing you paste is uploaded to a model or server. The running app makes no AI calls.

The Markdown report leaves out source text, file names and matched values. The share card only contains counts. It's free, with no account, in English and Japanese.

This is a small heuristic review, not a full image scanner or a security certification. It does not inspect filesystem layers or check whether credentials work, and it can miss things.

Try the synthetic example first. What build pattern should the next rule explain? Please share a sanitized example or rule ID, not a real secret.

## Publication approval scope

Owner approved and completed on 2026-09-16:
1. ✅ BuildPeek name and public static application.
2. ✅ Public `yukihamada/buildpeek` repository, GitHub Pages deployment, verified in two browsers.
3. ✅ Product Hunt submission scheduled for September 18 via the GPT-6 Astra Challenge flow.
4. ✅ Two X posts published (launch announcement + scheduled-on-PH follow-up).

## Notes discovered during submission

- PH rejected `https://yukihamada.github.io/buildpeek/` and `yukihamada.github.io/buildpeek/` as invalid. `github.com/yukihamada/buildpeek` was accepted.
- The account's draft slot was occupied by an older **Sente** draft. Entering a new URL created a *separate* new draft, so the Sente draft was **not** overwritten or deleted. A backup of its fields was still taken at `SENTE-DRAFT-BACKUP.md`.
- The submission URL field is locked once a draft is created; it cannot be edited later.
- "Security" is not in the default tag list but is reachable by typing into the tag field.
- Contest entry requires answering a 1000-char question before the date can be confirmed.

## Remaining after launch day

- Reply to comments; collect sanitized false-positive/missed-pattern examples.
- Measure at +1h/+6h/+24h with `xapi metrics` and the PH page counts. No recurring jobs installed.

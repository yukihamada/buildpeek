# Product Hunt submission — approval draft

## Product

**Name:** BuildPeek

**Tagline:** Find Docker build-secret risks, without uploading your code

**Description:** Review Dockerfiles and image history for secret-like patterns locally in your browser. Get clear next steps, export an input-free report, and share a summary card. Free, no account. Built with GPT-6 Astra; no runtime AI calls.

**Website, proposed (not yet live):** https://yukihamada.github.io/buildpeek/

**Pricing:** Free

**Topics:** Developer Tools / Security / Privacy (confirm available labels in live form)

**Maker:** current logged-in Yuki Hamada personal account; confirm actual account shown by submission form.

**Target date:** September 18, 2026, 12:01 AM America/Los_Angeles = 16:01 JST. Contest acceptance unverified until submission.

**Shoutouts:** OpenAI; Sente if the correct product is selectable. Do not select the unrelated product named Sente. Do not claim use of tools not actually used.

**Images:**
- `artifacts/ph-thumbnail.png` (240×240)
- `artifacts/ph-gallery-1.png` (1270×760, live landing UI)
- `artifacts/ph-gallery-2.png` (1270×760, live sample review)
- `artifacts/demo.mp4` (local demo for X / review; PH requires a supported public YouTube URL, not a local file)

## Maker first comment

Hi Product Hunt, I'm Yuki.

A recent discussion about credentials left in Docker build history made me stop and look at what a build can remember. Removing a file later doesn't necessarily remove it from an earlier layer. A secret mount also doesn't help if the command saves the secret into a config file.

I built BuildPeek with GPT-6 Astra through Sente to make these patterns easier to spot before shipping.

Paste a Dockerfile, Docker history, or image-config JSON. Eight local rules highlight patterns to review and explain the next step. Nothing you paste is uploaded to a model or server. The running app makes no AI calls.

The Markdown report leaves out source text, file names and matched values. The share card only contains counts. It's free, with no account, in English and Japanese.

This is a small heuristic review, not a full image scanner or a security certification. It does not inspect filesystem layers or check whether credentials work, and it can miss things.

Try the synthetic example first. What build pattern should the next rule explain? Please share a sanitized example or rule ID, not a real secret.

## Publication approval scope

Owner approval requested for:
1. BuildPeek name and the public static application.
2. Create public `yukihamada/buildpeek` repository; commit/push this project's code and publish allowlisted web assets using GitHub Actions / GitHub Pages.
3. Publish the above PH fields, images and maker comment, using the contest flow and September 18 schedule if the live form permits participation.
4. Publish the X launch copy in `OUTREACH.md`, replacing only the product/PH URL placeholders with verified URLs. Organic posting only; no paid advertising or bulk outreach.

If the contest rejects scheduling or significant copy/form changes are required, report the exact blocker instead of silently selecting another day.

# agents.md

Internal operating manual for AI agents working on the company website (not the Smart Indie domain). This site contains product pages (tools), documentation, licenses, support, and game showcases.

## 1) Scope and boundaries

- This file governs work on the **company website only**.
- **Smart Indie is on a separate domain**. Do not assume Smart Indie-specific positioning, offers, pricing, or CTAs apply here unless explicitly provided in the page content or source docs.
- Never invent product features, pricing, guarantees, metrics, testimonials, legal claims, or roadmap items. If info is missing, leave a TODO and request the missing source.

## 2) Primary objectives

1. **Brand and clarity**: simple, unambiguous pages that communicate what each tool/game is and who it is for.
2. **SEO and indexing**: pages must be structured for search and human scanning.
3. **Sell tools well**: benefit-forward copy with clear next action, without hype or unverifiable claims.

## 3) Design consistency

- Always follow the **website design document** (separate source of truth).
- Before editing UI, locate and review the design document and existing components/patterns used on the site.
- Do not introduce new visual systems, spacing scales, typography rules, or component styles unless the design document explicitly allows it.

## 4) Page requirements (non-negotiable)

For every page you create or modify:

- Add a **relevant, specific `<title>`** (unique per page).
- Include a **meta description** tailored to the page intent.
- Use a single clear **H1** that matches the page topic.
- Use semantic headings (H2/H3) for section structure.
- Ensure content is readable and skimmable: short paragraphs, bullets where appropriate, concrete labels.

## 5) Code standards (non-negotiable)

### Maintainability
- Prioritize **changeable and expandable** code:
  - modular structure
  - small reusable components
  - clear naming
  - minimal coupling
  - predictable file organization

### Separation of concerns
- Always separate **HTML, CSS, and JS**.
- **No inline scripts** and **no inline styles**, including `style=""` and `<script>...</script>` blocks.
- Put CSS in dedicated stylesheet files and JS in dedicated script/module files.

### Implementation discipline
- Reuse existing site patterns and utilities instead of reinventing them.
- Avoid cleverness. Prefer straightforward implementations with low maintenance cost.
- Add comments only where they reduce future ambiguity (not narrating obvious code).

## 6) SEO and indexing standards

- Each indexable page should have:
  - unique title tag
  - meta description
  - clean URL path that reflects the content
- Use internal links to connect:
  - tool homepage ↔ docs ↔ support ↔ license
  - game showcase ↔ store links (if provided) ↔ press kit (if provided)
- Do not add keywords unnaturally. Write for humans first, then ensure terminology matches what users actually search for (use the terms already present in existing docs/pages).

## 7) Product page structure (tools)

When building or revising a tool page, default to:

- What it is (1–2 sentences)
- Who it is for
- Key benefits (bulleted, concrete outcomes)
- Core features (only those explicitly documented)
- Docs link
- Support link
- License link
- Clear next action (download, docs, demo, contact), based on what the site supports

## 8) Documentation and support pages

- Prefer:
  - prerequisites
  - installation/setup
  - quick start
  - common tasks
  - troubleshooting
  - FAQ (only if sourced from real support issues)
- Do not fabricate error messages or solutions. Only document what is confirmed by the codebase, existing docs, or verified issues.

## 9) Licenses and legal pages

- Never paraphrase legal terms in a way that changes meaning.
- If a license is referenced, link to the canonical license text in the repo/site and keep formatting intact.
- If license terms are unknown or missing, do not guess. Add a TODO and request the source license file or policy.

## 10) QA checklist before shipping changes

- Valid page title and meta description present
- One H1, logical heading hierarchy
- No inline styles, no inline scripts
- CSS/JS separated into dedicated files
- Consistent with the website design document
- Links work (docs/support/license)
- No unverifiable claims, no invented details
- Mobile readability checked (layout, spacing, headings)
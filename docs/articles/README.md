# Articles Maintenance

This folder documents the conventions for the `/articles/` section on the company website.

## Content source rules

- Every article must be tied to exactly one tool.
- Claims must come from first-party product pages, docs, README files, technical guides, or repository implementation.
- If a feature or limitation is not documented in the repo, do not add it to an article.

## Metadata source

- Shared metadata lives in `assets/js/site/catalog.js` under `articleCategories`, `author`, and `articles`.
- Keep these fields populated for every article entry:
  - `slug`
  - `path`
  - `toolKey`
  - `toolName`
  - `category`
  - `title`
  - `description`
  - `publishDate`
  - `updatedDate`
  - `readTime`
  - `heroImage`
  - `author`
  - `primaryCtaLabel`
  - `primaryCtaHref`
  - `relatedLinks`

## Slug and route rules

- Hub page: `/articles/`
- Article detail route: `/articles/<tool-slug>/<article-slug>/`
- Use lowercase ASCII slugs with hyphens.
- Keep tool names exact in visible copy even if the folder name is shorter, for example `compliance` maps to `Third-Party Notices & Credits`.

## CTA rules

- Every article needs a primary CTA panel after the second main section.
- Every article ends with a lighter CTA row linking back to the tool homepage and documentation.
- Use the store as the primary CTA only for high-intent implementation or purchase-ready topics.

## Indexing checklist

- Unique `<title>` and meta description
- Canonical URL
- One H1
- `Article` and `BreadcrumbList` JSON-LD
- Article listed on `/articles/`
- Tool homepage links back to the article
- URL added to `sitemap.xml`
- Hero image and author image coverage added to `image-sitemap.xml` where relevant

## Author image note

- The current author slot uses `assets/images/authors/kevin-ahlgren-bjorvand.jpg`.
- If the portrait is replaced later, keep the same path or update `catalog.js` and all article markup together.

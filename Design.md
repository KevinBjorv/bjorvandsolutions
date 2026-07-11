# Website Design Notes (v1.0)

## Goal
A premium, technical, dark-first website for Bjorvand Solutions that helps Unity developers quickly find tools, games, documentation, support, and training.

## Style DNA
- Near-black and navy form the foundation. Bjorvand red is the primary company accent.
- Orange is reserved for Smart Indie links, buttons, and sections.
- Real product icons, screenshots, and game art carry the visual hierarchy.
- Surfaces use restrained borders, small-to-medium radii, quiet shadows, and minimal blur.
- Layouts are dense enough to scan without oversized empty areas or repetitive card walls.

## Typography and spacing
- Use a local system sans-serif stack to avoid render-blocking font requests.
- Display headings are compact and technical, with readable line height and limited line length.
- The shared token scale controls spacing, radii, colors, shadows, and motion.

## Motion
- Motion clarifies state through short fades, small lifts, active indicators, and subtle pointer response.
- Content is visible by default. Animation is an enhancement and must never gate access to content.
- Respect `prefers-reduced-motion` and keep transforms GPU-friendly.

## Components and consistency
- Reuse the shared header, footer, buttons, badges, cards, form controls, tool identities, and icon rules.
- Lucide provides interface icons. Product and platform identities use their real local assets.
- Copy stays factual, short, and outcome-focused.
- Focus, hover, active, loading, success, and error states remain clearly distinguishable.

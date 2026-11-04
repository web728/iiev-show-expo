# Brand guidelines (extracted from the official EV Stylescape)

Only what the one-page Stylescape actually specifies, plus implementation decisions clearly marked as such.

## From the Stylescape
- **Typeface:** Montserrat (font family). Self-hosted via `next/font` (no runtime Google requests); badge PDFs/OG images embed Montserrat from `@fontsource/montserrat`.
- **Palette:** Green `#1D8043` · Yellow `#F9C900` · Navy `#001433` · Blue `#0068AF`.
- **Gradient:** `#0068AF → #16893F`.
- **Iconography:** "Minimal & Stroke fill" — circular stroke icons.
- **Motifs (visual):** diagonal green chevron stripes, broad yellow arcs, white diagonal stripes on navy, thin line-art skylines/charging scenes.

## Implementation tokens (`src/app/globals.css`)
- Neutrals tinted to navy: ink `#001433`, ink-soft `#33435C`, muted `#5B6A80`, line `#DDE3EC`, mist `#F3F6FA`.
- Radii: cards 16px, buttons pill. Shadows navy-tinted. Motion: `cubic-bezier(.22,1,.36,1)`, 160/320 ms; disabled under `prefers-reduced-motion`.
- Icons: 24px grid, 1.75 stroke, round caps (`src/components/ui/icons.tsx`).
- Focus ring: 3px brand yellow.

## Logos
- Files in `public/brand/` are the supplied originals. `*-trimmed.png` versions only remove transparent padding (lossless crop) — no redraw, recolour or distortion.
- The IIEV and Futurex logos contain black lettering; on navy surfaces they sit on a white plate.
- Clear-space and minimum-size rules are **not** specified in the Stylescape and are not invented. Current minimum on screen: 48px height (header, mobile).

## Accessibility of colour
- Body text uses navy/ink-soft on white (AAA). Yellow is used as a background with navy text, never as text on white.
- White on green `#1D8043` buttons ≈ 5.0:1 (passes AA for normal text).

## Prohibited (per spec)
Purple SaaS gradients, heavy black overlays, neon, floating blobs, glassmorphism, distracting animation, stretched photos, stock photos presented as IIEV event photography.

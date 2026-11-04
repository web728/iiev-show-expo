# Asset manifest

## Brand
| Asset | Source / owner | Permission | Notes |
|---|---|---|---|
| IIEV 9th edition logo (`public/brand/iiev-9th-edition-logo*.png`) | Organiser (supplied PNG) | Supplied for this build; formal usage approval pending (C3) | Trimmed losslessly, never recoloured |
| Futurex logo (`public/brand/futurex-logo.png`) | Organiser | As above | On white plate over dark surfaces |
| Battery / Solar show logos (`public/brand/concurrent/`) | Organiser | 2027 co-location TBC (A4) | Concurrent Events page only |

## Event photography — 8th edition, 2–4 Oct 2026 (`public/media/2026/*.webp`)
- **Source:** organiser's Google Drive "8th IIEV 2026 – 2nd to 4th Oct 2026 – PUNE" (Conference + Expo folders, ~2,800 photos), shared by the organiser for website use on 12 Oct 2026.
- **Selection:** 59 photographs chosen from contact sheets (expo floor, vehicles, arrival, inauguration, registration, B2B meetings, conference, exhibitor recognition).
- **Processing:** full-resolution originals → auto-rotated, EXIF/GPS stripped, ≤2400 px, WebP q78 (≈140–550 KB each).
- **Catalogue:** `src/content/media.ts` (alt text, caption, group) + `src/content/media-2026.json` (dimensions, Drive file id, original path for traceability).
- **Photographer credit:** shown as "IIEV Show / Futurex" — replace with photographer name if the organiser wants named credit.
- **People in photos:** event photography of a public business event; honour any removal request promptly (Admin can unpublish the album via CMS or remove files).

## Video (`public/media/video/`)
| File | Source | Processing |
|---|---|---|
| `iiev-2026-hero.mp4` (+ poster) | 10 raw expo clips (MTS) from Drive, Expo days 1–3 | 2.4 s each, dip-to-black transitions, 1280×720 H.264, muted, 24 s, 2.9 MB |
| `testimonial-c1418/c1420/c1421/c1423/c1440/c1441.mp4` (+ posters) | Exhibitor testimonial MP4s, Expo Day 2 / TESTIMONIALS | 720p H.264 + AAC mono 96 kbps, 2–7 MB each |
Testimonials are labelled by the stand where they were recorded (River, Youhonk, Binder, Evonzaa, Hyundai dealership, Kinetic). **Speaker names and designations are not shown** until the organiser supplies them. 17 further testimonials are available in Drive.

## AI illustrations — sector pages (`public/media/sectors/*.webp`)
- Generated with **Magnific AI** (organiser's paid account) on 12 Oct 2026, 4 options per sector, best one chosen. 1344×752, WebP, 50–100 KB.
- Prompted to match the Stylescape (dark navy, green & yellow rim light, no text or logos).
- **Labelled on the site as AI-generated illustrations** and never presented as event photography.

## Generated
OG image (logo + dates on brand gradient) and favicon are generated in code.

## Still needed from organiser
Photographer credit preference; speaker/exhibitor names for testimonials; 2027 exhibitor/partner logos; brochure, floor plan, manual PDFs.

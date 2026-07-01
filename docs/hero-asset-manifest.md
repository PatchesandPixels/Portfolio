# Hero Asset Manifest — TEMPORARY PLACEHOLDERS

Every file in `assets/hero/` is a **temporary placeholder SVG** created to
evaluate composition, scale, animation timing, and responsiveness. Replace
each with final artwork by swapping the file path in the `HERO_ASSETS`
config at the top of `hero.js` (or by overwriting the file with the same
name). **No animation logic references file names or dimensions** — any
aspect ratio close to the placeholder will work.

General rules for final assets:
- Transparent background required for all cutouts (PNG/WebP/AVIF/SVG).
- Keep perspective consistent: slightly top-down "desk" angle, soft single
  light source from upper-left.
- Recommended max dimension ~2× the rendered size listed below.

| Placeholder | Final asset | Rendered size (desktop) | Format | Notes |
|---|---|---|---|---|
| `shoes/shoe-left-placeholder.svg` | left hiking boot cutout | ~74px wide | WebP/PNG, transparent | Left/right must be separate files, matched lighting |
| `shoes/shoe-right-placeholder.svg` | right hiking boot cutout | ~74px wide | WebP/PNG | Mirrors left boot |
| `shoes/footprint-left/right-placeholder.svg` | muddy boot prints | ~26px wide | SVG preferred | Drawn at ~55% opacity by CSS |
| `fishing/rod-placeholder.svg` | fishing rod + reel | 110–170px wide | SVG/PNG | Line + fish are separate; rod tip anchor at ~14% from left, 72% down |
| `fishing/fish-body-placeholder.svg` | fish cutout | 64–100px wide | PNG/WebP | Tail rotates via CSS `transform-origin: 85% 50%` — keep tail on the right |
| `cat/cat-peek-placeholder.svg` | cat head/shoulders peeking | ~110px wide | PNG/WebP | Slides up from bottom edge |
| `cat/cat-paw-placeholder.svg` | cat paw | ~30px wide | PNG/WebP | Separate movable part, swats upward |
| `notebook/notebook-cover-placeholder.svg` | notebook cover | 86–130px wide | PNG/WebP | Must be separate from pages — hinges open on left edge |
| `notebook/notebook-pages-placeholder.svg` | open pages with sketches | same size as cover | PNG/WebP | Notes text is real HTML overlaid; keep page area calm |
| `lamp/lamp-placeholder.svg` | sculptural desk lamp | 64–100px wide | PNG/WebP | Glow is pure CSS, no glow image needed |
| `folder/folder-front-placeholder.svg` | bright digital folder | 80–120px wide | SVG/PNG | File cards are real HTML text |
| `camera/camera-placeholder.svg` | camera cutout | 80–120px wide | PNG/WebP | Flash is CSS |
| `camera/photo-01..03-placeholder.svg` | 3+ polaroid photos | 84px wide, 5:6 ratio | WebP | Develop effect is a CSS filter animation |
| `vinyl/turntable-placeholder.svg` | turntable base | 110–170px wide | PNG/WebP | Three separate parts required |
| `vinyl/record-placeholder.svg` | record disc | ~58% of base width, square | PNG/WebP | Rotates around center — keep perfectly centered |
| `vinyl/tonearm-placeholder.svg` | tonearm | ~38% of base width | PNG/WebP | Pivots at upper-right (84%/16%) |
| `aquarium/tank-placeholder.svg` | glass fish tank (empty interior) | ~146px wide | PNG/WebP | **Interior must be empty/transparent** — fish, plants & bubbles are layered DOM inside `.tank-water` (clip region at 8%/8% inset, top 13% / bottom 14%). Glass front semi-transparent |
| `aquarium/fish-placeholder.svg` | small tank fish (head right) | ~30% of tank width | PNG/WebP | 2–3 instances swim & flip via CSS `scaleX`; keep head on the right at rest |
| `aquarium/water-plant-placeholder.svg` | aquatic plant / seaweed | ~22% of tank width | SVG/PNG | Sways from `transform-origin: bottom center` |
| `plants/pot-placeholder.svg` | potted plant base | 74–116px wide | PNG/WebP | Used for both desk plant & shelf plant; grown leaves are separate |
| `plants/leaf-placeholder.svg` | single leaf (grows on tap) | ~30px wide | SVG/PNG | Origin bottom-center; capped at 3, auto-resets after 6s |
| `mascot/mascot-placeholder.svg` | original Pixels & Patches mascot | ~96px wide | PNG/WebP/SVG | Soft stitched patchwork creature with sprout. **Do not use copyrighted characters.** Speech bubble is real HTML |
| `furniture/desk-placeholder.svg` | warm wood desk | ~340px wide | PNG/WebP/SVG | Decorative; holds lamp/tank/notebook/camera. Crops at floor |
| `furniture/shelf-placeholder.svg` | open shelving / cabinet | ~220px wide | PNG/WebP/SVG | Decorative; holds vinyl/folder/plant/mascot |
| `furniture/rug-placeholder.svg` | foreground rug (ellipse) | ~480px wide | PNG/WebP/SVG | Decorative ground anchor; sits lowest in the heavy group |

### Studio architecture notes
- Objects mount into one of three **depth groups** (`light` / `medium` / `heavy`)
  via the `group` field in `HERO_ASSETS`. The group carries the GSAP
  scroll-exit transform; each object carries its own drag-translate,
  entrance-scale and pointer-parallax — they never share a transform property.
- The page-level vertical grid (body `#gridCanvas`) is shared with the rest of
  the homepage and is **not** redrawn for the hero.
- GSAP + ScrollTrigger load from CDN in `index.html`; `hero.js` degrades to a
  static, fully-interactive room if they fail to load or under
  `prefers-reduced-motion`.

Positions, z-index, mobile/tablet visibility, depth group, and accessible
labels all live in `HERO_ASSETS` in `hero.js`.

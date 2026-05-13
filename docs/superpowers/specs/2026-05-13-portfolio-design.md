# Andy Nguyen — Pixel and Patches Portfolio
**Spec Date:** 2026-05-13  
**Stack:** Plain HTML · CSS · Vanilla JS  
**Source of Truth:** Figma file `WcE3N6TzuuqXhdlNoYl9XV`, node `118:1301`

---

## 1. Project Overview

A static personal portfolio website for Andy Nguyen, product designer based in Seattle, WA. Brand name: **Pixel and Patches**. Four HTML pages: Home, case study pages (Tersus, CURE Quick Quote, CURE Scan License, CURE My Account Portal). Flat multi-file architecture — no build step, deployable to GitHub Pages or Netlify.

---

## 2. Design Tokens (Exact from Figma)

### Colors
```
--bg:            #fcf7f4   /* page background */
--text-primary:  #1a1612   /* headings, primary text */
--text-body:     #4a3f36   /* body copy */
--text-muted:    #7a6f63   /* labels, pill text, timestamps */
--border:        #d8cdb8   /* card borders, dividers */
--border-light:  #d9d9d9   /* outer cluster border */
--accent-blue:   #1353be   /* kickers, links, nav active, CTA button */
--accent-orange: #f49e4f   /* headline period only */
--white:         #ffffff
```

### Typography
All fonts available from Google Fonts.

| Role | Font | Weight | Size | Notes |
|------|------|--------|------|-------|
| Display headline | Fraunces | SemiBold | 64px | `letter-spacing: -0.64px`, `font-variation-settings: 'SOFT' 0, 'WONK' 1` |
| Card title (featured) | Fraunces | Regular | 40px | `letter-spacing: -0.4px`, same variation |
| Card title (small) | Fraunces | Regular | 24px | `letter-spacing: -0.24px`, same variation |
| Nav links | Fraunces | Regular | 16px | `letter-spacing: -0.16px`, same variation |
| Kicker labels | Inter | SemiBold | 16px | e.g. "UX/UI DESIGN", "SELECTED WORK", "CURE AUTO INSURANCE" |
| Body copy | Inter | Regular | 16px | `line-height: 1.5` |
| Links ("View Case Study →") | Inter | SemiBold | 14px | `letter-spacing: -0.28px`, color: `--accent-blue` |
| Pill/tag text | JetBrains Mono | Regular | 11px | `letter-spacing: 1.1px` |

### Spacing & Layout
- Content max-width: `1328px`
- Page padding: `45px` top, `150px` left/right
- Section gap: `80px`
- Card internal padding: `32px` horizontal, `16px` vertical
- Gap between CURE cards: `16px`
- Gap between CURE cluster label and cards: `16px`

---

## 3. File Structure

```
/
├── index.html                  # Home / Landing page
├── tersus.html                 # Tersus case study
├── cure-quick-quote.html       # CURE NJ Quick Quote case study
├── cure-scan-license.html      # CURE Scan License case study
├── cure-my-account.html        # CURE My Account Portal case study
├── styles.css                  # Shared stylesheet (all tokens + components)
├── scripts.js                  # Shared JS (nav active state, smooth scroll)
└── assets/
    ├── logo.png                # Pixels and Patches logo (from Figma)
    ├── hero-tersus-web.png     # Hero: Tersus web screenshot (from Figma)
    ├── hero-mobile-home.png    # Hero: mobile phone mockup (from Figma)
    ├── hero-auto-quote.png     # Hero: CURE phone mockup (from Figma)
    ├── tersus-card-bg.png      # Tersus featured card background texture
    ├── tersus-card-screens.png # Tersus featured card screenshot overlay
    ├── cure-quick-quote.png    # CURE Quick Quote card thumbnail
    ├── cure-scan-license.png   # CURE Scan License card thumbnail
    ├── cure-my-account.png     # CURE My Account card thumbnail
    ├── about-cat.png           # Cat illustration (About Andy card)
    └── contact-laptop.png      # Laptop illustration (Let's Work Together card)
```

> **Note on assets:** Image URLs from Figma expire in 7 days. Assets must be downloaded and saved to `/assets/` before starting implementation. URLs are listed in Section 8.

---

## 4. Page: Home (`index.html`)

### 4.1 Navigation
- Logo (`assets/logo.png`) left, 102×102px
- Nav links right: Work · Playground · About · Contact
- Playground links to `href="#"` (page not yet built); About and Contact link to their respective pages when built
- Font: Fraunces Regular 16px, `letter-spacing: -0.16px`
- Active state (Work on homepage): 4px solid `#1353be` bar below link, 24px gap
- Horizontal rule below nav: 1px `#d8cdb8`

### 4.2 Hero Section
- Left column: 
  - Kicker: "UX/UI DESIGN" — Inter SemiBold 16px, `#1353be`
  - Headline: "Human-centered product design, with a playful edge." — Fraunces SemiBold 64px, `#1a1612`. The period is `#f49e4f`.
  - Body: 3-line bio — Inter Regular 16px, `#4a3f36`, line-height 1.5
- Right column: `position: relative` container, flex 1. Three product screenshots are `position: absolute` inside it:
  - `hero-tersus-web.png` — 596×367px, rounded-10px, box-shadow `4px 4px 4px rgba(0,0,0,0.1)`
  - `hero-mobile-home.png` — 107×271px, rounded-10px, same shadow, left of main screenshot
  - `hero-auto-quote.png` — 138×287px, rounded-10px, box-shadow `0 4px 4px rgba(0,0,0,0.25)`, right edge

### 4.3 Selected Work Header
- Left: "SELECTED WORK" (Inter SemiBold 16px, `#1353be`) + 24px horizontal line
- Right: "View all case studies ➜" (Inter SemiBold 14px, `#1353be`)

### 4.4 Tersus Featured Card
- Full-width, border `1px #d8cdb8`, border-radius `8px`
- Left half (681px): padding 32px/16px
  - Label: "TERSUS" — Inter Regular 16px, `#4a3f36`
  - Title: "Designing a simpler marketplace for home cleaning services" — Fraunces Regular 40px, `#1a1612`, tracking -0.4px
  - Body: description text — Inter Regular 16px, `#4a3f36`
  - Pills: UX RESEARCH · PRODUCT DESIGN · DESIGN SYSTEM · 2023–2024 (JetBrains Mono 11px, border `#d8cdb8`, border-radius 100px)
  - Link: "View Case Studies ➜" — Inter SemiBold 14px, `#1353be`
- Right half (647px): `tersus-card-bg.png` + `tersus-card-screens.png` layered, rounded-tr-8px rounded-br-8px

### 4.5 CURE Auto Insurance Cluster
- Container: border `1px #d9d9d9`, border-radius `8px`, padding `28px`
- Label: "CURE AUTO INSURANCE" — Inter Regular 16px, `#7a6f63`
- Three equal cards (`412px` wide each), gap `16px`, each:
  - Top: 257px image thumbnail (`cure-quick-quote.png` / `cure-scan-license.png` / `cure-my-account.png`), border-radius top corners 8px
  - Divider: 1px `#d8cdb8` border-top
  - Body (padding 32px/16px): title (Fraunces 40px) + description (Inter 16px) + pills row + "View Case Study ➜" link
  - Total card height: 530px
  - Card titles: "Quick Quote", "Scan to Insure", "My Account Portal"

### 4.6 Bottom Cards Row
Two cards side by side in a bordered container (border `1px #d8cdb8`, border-radius 8px):

**About Andy card (left, 664px wide):**
- Border-right `1px #d8cdb8`
- Heading: "About Andy" — Fraunces Regular 24px
- Body text: 8+ years bio — Inter Regular 16px, `#4a3f36`, width 380px
- Link: "More about me ➜" — Inter SemiBold 14px, `#1353be`
- Illustration: `about-cat.png` — 185×199px, right side of card

**Let's Work Together card (right, flex remaining):**
- Heading: "Let's Work Together" — Fraunces Regular 24px
- Body: contact prompt — Inter Regular 16px, `#4a3f36`
- CTA button: "Let's Chat" + icon — bg `#1353be`, white text, Inter Regular 14px, padding 12px/18px, no border-radius (square corners in Figma)
- Illustration: `contact-laptop.png` — right side, 270px height

---

## 5. Page: Case Study Template

All four case studies share this template. Accent color varies:
- Tersus: teal `#0f6e56`
- CURE (all three): `#1353be` accent (matching homepage CURE card styling)

### 5.1 Structure
1. **Nav** — same as homepage, "Work" active state
2. **Breadcrumb** — "← Work" link back to index.html
3. **Hero** — full-width sand background, two flat device mockup placeholders side by side
   - `[PLACEHOLDER: case study hero screenshots]`
   - Below: spaced-caps kicker, large Fraunces title with period, 1–2 sentence summary, pill tags
4. **Body sections** — alternating full-width image placeholders and text sections
   - Section headings: Fraunces Regular 40px
   - Body: Inter Regular 16px, `#4a3f36`, max-width ~680px
   - Sections: Context · Problem / The Challenge · Research · Design Decisions · Outcome · Reflection
5. **Next case study** — link to the next case study at bottom

### 5.2 Content Source
Each case study's text content lives in the markdown files:
- `tersus-case-study.md`
- `cure-nj-quick-quote.md`
- `cure-scan-license.md`
- `cure-my-account-portal.md`

All image slots are labeled placeholders matching the "Visual Assets Needed" sections in each markdown file.

---

## 6. Shared Components (styles.css)

### CSS Custom Properties
All design tokens defined as CSS variables on `:root`.

### Components
- `.nav` — sticky, flex, space-between
- `.nav-link` — Fraunces 16px, `.nav-link.active` adds 4px blue underline
- `.kicker` — Inter SemiBold 16px, `#1353be`
- `.pill` — JetBrains Mono 11px, border `#d8cdb8`, border-radius 100px, padding 5px 10px
- `.featured-card` — horizontal flex, full-width, bordered
- `.cure-card` — vertical flex, fixed height 530px, bordered
- `.case-study-placeholder` — sand background `#ede8dd`, labeled rectangle with dashed border
- `.btn-primary` — bg `#1353be`, white text, Inter Regular 14px, padding 12px 18px

---

## 7. scripts.js

Minimal JavaScript:
- Mark active nav link based on current page filename
- Smooth scroll for any `#` anchor links
- No dependencies, no frameworks

---

## 8. Figma Asset URLs (download within 7 days)

```
Logo:                https://www.figma.com/api/mcp/asset/f1beadb7-c661-451d-b2a2-bf777701b890
Tersus card bg:      https://www.figma.com/api/mcp/asset/0f970ed8-4e9f-4ac0-baeb-fc1469091ce2
Tersus card screens: https://www.figma.com/api/mcp/asset/cba27a00-a322-458d-83f6-25cd76516e4e
CURE Quick Quote:    https://www.figma.com/api/mcp/asset/90b7def1-9faf-4dd7-98f5-f71762e8619a
CURE Scan License:   https://www.figma.com/api/mcp/asset/4a0130ea-4472-4e9f-81b4-386cb09ef79c
CURE My Account:     https://www.figma.com/api/mcp/asset/2a0dd9e3-5e9c-4f85-81e7-3b78ee018e9c
About cat illus:     https://www.figma.com/api/mcp/asset/3eea9338-ff50-494e-bfa7-1373e6051cd5
Contact illus:       https://www.figma.com/api/mcp/asset/dc571b21-fb4c-4099-a856-3f8acec72715
Hero mobile phone:   https://www.figma.com/api/mcp/asset/a52d639a-7f80-4d02-aec8-426ff73244ef
Hero CURE phone:     https://www.figma.com/api/mcp/asset/19d92c36-e1b3-414f-aa8b-dd1d9b2b08b7
Hero Tersus web:     https://www.figma.com/api/mcp/asset/1f13028b-c015-43bf-b59d-8447d960db0b
```

---

## 9. Out of Scope

- The "Playground" page (nav link present but page not yet designed)
- CMS or dynamic content
- Contact form backend (mailto: link only)
- Dark mode
- Mobile-responsive breakpoints (desktop-first for now; can be added later)

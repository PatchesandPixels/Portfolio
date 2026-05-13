# Portfolio — Pixel and Patches Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 5-page static portfolio site for Andy Nguyen (Pixel and Patches) matching the Figma design exactly — homepage + 4 case study pages.

**Architecture:** Flat multi-file HTML/CSS/JS. One shared `styles.css` (all tokens + components), one `scripts.js` (nav active state, smooth scroll), five HTML pages. Assets pre-downloaded from Figma into `/assets/`. No build step, no dependencies, deployable to any static host.

**Tech Stack:** HTML5 · CSS3 (custom properties) · Vanilla JS · Google Fonts (Fraunces, Inter, JetBrains Mono)

**Spec:** `docs/superpowers/specs/2026-05-13-portfolio-design.md`

---

## File Map

| File | Responsibility |
|------|---------------|
| `assets/` | All images downloaded from Figma (11 files) |
| `styles.css` | CSS custom properties, reset, all reusable component classes |
| `scripts.js` | Active nav link, smooth scroll |
| `index.html` | Homepage: nav, hero, Tersus featured card, CURE cluster, bottom cards |
| `tersus.html` | Tersus case study: nav, breadcrumb, hero placeholder, body sections |
| `cure-quick-quote.html` | CURE Quick Quote case study |
| `cure-scan-license.html` | CURE Scan License case study |
| `cure-my-account.html` | CURE My Account Portal case study |

---

## Task 1: Download Figma Assets

**Files:**
- Create: `assets/` directory with 11 image files

- [ ] **Step 1: Create the assets directory**

```bash
mkdir -p "/Users/andynguyen/Desktop/Andys files/Claude/Portfolio Mockup/assets"
```

- [ ] **Step 2: Download all 11 assets from Figma**

Run each curl command (these URLs expire in 7 days from 2026-05-13):

```bash
cd "/Users/andynguyen/Desktop/Andys files/Claude/Portfolio Mockup/assets"

curl -L "https://www.figma.com/api/mcp/asset/f1beadb7-c661-451d-b2a2-bf777701b890" -o logo.png
curl -L "https://www.figma.com/api/mcp/asset/0f970ed8-4e9f-4ac0-baeb-fc1469091ce2" -o tersus-card-bg.png
curl -L "https://www.figma.com/api/mcp/asset/cba27a00-a322-458d-83f6-25cd76516e4e" -o tersus-card-screens.png
curl -L "https://www.figma.com/api/mcp/asset/90b7def1-9faf-4dd7-98f5-f71762e8619a" -o cure-quick-quote.png
curl -L "https://www.figma.com/api/mcp/asset/4a0130ea-4472-4e9f-81b4-386cb09ef79c" -o cure-scan-license.png
curl -L "https://www.figma.com/api/mcp/asset/2a0dd9e3-5e9c-4f85-81e7-3b78ee018e9c" -o cure-my-account.png
curl -L "https://www.figma.com/api/mcp/asset/3eea9338-ff50-494e-bfa7-1373e6051cd5" -o about-cat.png
curl -L "https://www.figma.com/api/mcp/asset/dc571b21-fb4c-4099-a856-3f8acec72715" -o contact-laptop.png
curl -L "https://www.figma.com/api/mcp/asset/a52d639a-7f80-4d02-aec8-426ff73244ef" -o hero-mobile-home.png
curl -L "https://www.figma.com/api/mcp/asset/19d92c36-e1b3-414f-aa8b-dd1d9b2b08b7" -o hero-auto-quote.png
curl -L "https://www.figma.com/api/mcp/asset/1f13028b-c015-43bf-b59d-8447d960db0b" -o hero-tersus-web.png
```

- [ ] **Step 3: Verify all 11 files downloaded and are non-empty**

```bash
ls -lh "/Users/andynguyen/Desktop/Andys files/Claude/Portfolio Mockup/assets/"
```

Expected: 11 files, each larger than 1KB. If any file is 0 bytes or missing, re-run its curl command.

- [ ] **Step 4: Commit**

```bash
cd "/Users/andynguyen/Desktop/Andys files/Claude/Portfolio Mockup"
git init  # if not already a git repo
git add assets/
git commit -m "feat: add all Figma image assets"
```

---

## Task 2: styles.css — Design Tokens + Reset

**Files:**
- Create: `styles.css`

- [ ] **Step 1: Create styles.css with CSS custom properties and reset**

```css
/* ─── DESIGN TOKENS ─────────────────────────────────────────── */
:root {
  --bg:            #fcf7f4;
  --text-primary:  #1a1612;
  --text-body:     #4a3f36;
  --text-muted:    #7a6f63;
  --border:        #d8cdb8;
  --border-light:  #d9d9d9;
  --accent-blue:   #1353be;
  --accent-orange: #f49e4f;
  --white:         #ffffff;

  --font-display: 'Fraunces', serif;
  --font-body:    'Inter', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
  --font-variation: 'SOFT' 0, 'WONK' 1;

  --max-width: 1328px;
  --page-padding: 150px;
  --section-gap: 80px;
}

/* ─── RESET ─────────────────────────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--bg);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

img {
  display: block;
  max-width: 100%;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
}

/* ─── PAGE WRAPPER ───────────────────────────────────────────── */
.page-wrapper {
  max-width: calc(var(--max-width) + var(--page-padding) * 2);
  margin: 0 auto;
  padding: 0 var(--page-padding);
}
```

- [ ] **Step 2: Verify tokens compile (open any browser, no errors expected yet — just confirms valid CSS)**

Create a temp `test.html` to verify no parse errors:

```html
<!DOCTYPE html>
<html><head><link rel="stylesheet" href="styles.css"></head>
<body style="background:var(--bg)">OK</body></html>
```

Open `test.html` in a browser. Body should be cream `#fcf7f4`. Delete `test.html` after confirming.

- [ ] **Step 3: Commit**

```bash
git add styles.css
git commit -m "feat: add CSS design tokens and reset"
```

---

## Task 3: styles.css — Shared Component Classes

**Files:**
- Modify: `styles.css` (append)

- [ ] **Step 1: Append navigation styles**

```css
/* ─── NAVIGATION ─────────────────────────────────────────────── */
.nav {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-top: 45px;
  padding-bottom: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg);
}

.nav-logo {
  width: 102px;
  height: 102px;
  flex-shrink: 0;
}

.nav-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.nav-links {
  display: flex;
  gap: 64px;
  list-style: none;
  padding-bottom: 0;
}

.nav-link {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 16px;
  letter-spacing: -0.16px;
  font-variation-settings: var(--font-variation);
  color: var(--text-primary);
  white-space: nowrap;
}

.nav-link .nav-underline {
  display: none;
  height: 4px;
  width: 100%;
  background: var(--accent-blue);
}

.nav-link.active .nav-underline {
  display: block;
}

.nav-rule {
  height: 1px;
  background: var(--border);
  margin-top: 0;
}
```

- [ ] **Step 2: Append typography utility classes**

```css
/* ─── TYPOGRAPHY UTILITIES ───────────────────────────────────── */
.display-heading {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 64px;
  line-height: 1.08;
  letter-spacing: -0.64px;
  font-variation-settings: var(--font-variation);
  color: var(--text-primary);
}

.display-heading .accent-period {
  color: var(--accent-orange);
}

.card-title-lg {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 40px;
  line-height: 1.08;
  letter-spacing: -0.4px;
  font-variation-settings: var(--font-variation);
  color: var(--text-primary);
}

.card-title-sm {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 24px;
  line-height: 1.08;
  letter-spacing: -0.24px;
  font-variation-settings: var(--font-variation);
  color: var(--text-primary);
}

.kicker {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 16px;
  line-height: 1.5;
  color: var(--accent-blue);
}

.body-text {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-body);
}

.link-arrow {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: -0.28px;
  color: var(--accent-blue);
  white-space: nowrap;
  line-height: 1.42;
}

.link-arrow:hover {
  opacity: 0.75;
}
```

- [ ] **Step 3: Append pill / tag styles**

```css
/* ─── PILLS ──────────────────────────────────────────────────── */
.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.pill {
  font-family: var(--font-mono);
  font-weight: 400;
  font-size: 11px;
  letter-spacing: 1.1px;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 100px;
  padding: 5px 10px;
  white-space: nowrap;
}
```

- [ ] **Step 4: Append button + section header styles**

```css
/* ─── BUTTON ─────────────────────────────────────────────────── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: var(--accent-blue);
  color: var(--white);
  font-family: var(--font-body);
  font-weight: 400;
  font-size: 14px;
  letter-spacing: -0.28px;
  line-height: 1.42;
  padding: 12px 18px;
  border-radius: 0;
  white-space: nowrap;
}

.btn-primary:hover {
  opacity: 0.9;
}

/* ─── SECTION HEADER ─────────────────────────────────────────── */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.section-header-rule {
  width: 24px;
  height: 1px;
  background: var(--border);
  flex-shrink: 0;
}
```

- [ ] **Step 5: Append card component styles**

```css
/* ─── FEATURED CARD (horizontal) ────────────────────────────── */
.featured-card {
  display: flex;
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.featured-card-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  justify-content: center;
  padding: 16px 32px;
  flex-shrink: 0;
}

.featured-card-body-inner {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.featured-card-image {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.featured-card-image img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ─── CURE CLUSTER ───────────────────────────────────────────── */
.cure-cluster {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 28px;
  width: 100%;
}

.cure-cluster-label {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: 16px;
  color: var(--text-muted);
  line-height: normal;
}

.cure-cards-row {
  display: flex;
  gap: 16px;
  align-items: stretch;
}

/* ─── CURE CARD (vertical) ───────────────────────────────────── */
.cure-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  flex: 1;
  height: 530px;
}

.cure-card-thumbnail {
  height: 257px;
  flex-shrink: 0;
  overflow: hidden;
}

.cure-card-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cure-card-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 32px;
  border-top: 1px solid var(--border);
  flex: 1;
  min-height: 0;
}

.cure-card-body-inner {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ─── BOTTOM CARDS ROW ───────────────────────────────────────── */
.bottom-cards {
  display: flex;
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.bottom-card {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 16px 32px;
  flex: 1;
}

.bottom-card:first-child {
  border-right: 1px solid var(--border);
  flex: 0 0 664px;
}

.bottom-card-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.bottom-card-text {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bottom-card-illustration {
  flex-shrink: 0;
  margin-left: auto;
}

/* ─── MAIN LAYOUT ────────────────────────────────────────────── */
.main-content {
  display: flex;
  flex-direction: column;
  gap: var(--section-gap);
  padding-top: var(--section-gap);
  padding-bottom: 120px;
}
```

- [ ] **Step 6: Append case study page styles**

```css
/* ─── CASE STUDY ─────────────────────────────────────────────── */
.breadcrumb {
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: -0.28px;
  color: var(--accent-blue);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 48px;
}

.breadcrumb:hover {
  opacity: 0.75;
}

.cs-hero {
  background: #ede8dd;
  border-radius: 8px;
  padding: 64px;
  margin-bottom: 80px;
}

.cs-hero-images {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 48px;
}

.cs-placeholder {
  background: rgba(42, 37, 32, 0.06);
  border: 2px dashed var(--border);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 1px;
  color: var(--text-muted);
  text-align: center;
  padding: 16px;
}

.cs-meta {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.cs-title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 56px;
  line-height: 1.08;
  letter-spacing: -0.56px;
  font-variation-settings: var(--font-variation);
  color: var(--text-primary);
}

.cs-title .accent-period {
  color: var(--accent-orange);
}

.cs-summary {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-body);
}

.cs-body {
  display: flex;
  flex-direction: column;
  gap: 80px;
  padding-bottom: 120px;
}

.cs-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 720px;
}

.cs-section-heading {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 40px;
  line-height: 1.08;
  letter-spacing: -0.4px;
  font-variation-settings: var(--font-variation);
  color: var(--text-primary);
}

.cs-image-full {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: #ede8dd;
}

.cs-next {
  border-top: 1px solid var(--border);
  padding-top: 48px;
  display: flex;
  justify-content: flex-end;
}
```

- [ ] **Step 7: Commit**

```bash
git add styles.css
git commit -m "feat: add all shared component styles"
```

---

## Task 4: scripts.js

**Files:**
- Create: `scripts.js`

- [ ] **Step 1: Create scripts.js**

```js
// ─── Active nav link ──────────────────────────────────────────
(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const map = {
    'index.html':            'work',
    '':                      'work',
    'tersus.html':           'work',
    'cure-quick-quote.html': 'work',
    'cure-scan-license.html':'work',
    'cure-my-account.html':  'work',
  };
  const active = map[page];
  if (active) {
    const link = document.querySelector(`.nav-link[data-page="${active}"]`);
    if (link) link.classList.add('active');
  }
})();
```

- [ ] **Step 2: Commit**

```bash
git add scripts.js
git commit -m "feat: add nav active state script"
```

---

## Task 5: Google Fonts link block

**Note:** All HTML pages share this `<head>` block. Write it once here; copy it into each page as they're created.

- [ ] **Step 1: Confirm the Google Fonts URL to use**

The font import string for all three fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Inter:wght@400;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
```

This loads Fraunces as a variable font (needed for `font-variation-settings`), Inter at 400 and 600, and JetBrains Mono at 400.

---

## Task 6: index.html — Nav + Hero

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create index.html with doctype, head, nav, and hero**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Andy Nguyen — Product Designer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Inter:wght@400;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="page-wrapper">

    <!-- NAV -->
    <nav class="nav">
      <a href="index.html" class="nav-logo">
        <img src="assets/logo.png" alt="Pixel and Patches">
      </a>
      <ul class="nav-links">
        <li><a href="index.html" class="nav-link" data-page="work">
          Work
          <span class="nav-underline"></span>
        </a></li>
        <li><a href="#" class="nav-link" data-page="playground">
          Playground
          <span class="nav-underline"></span>
        </a></li>
        <li><a href="#" class="nav-link" data-page="about">
          About
          <span class="nav-underline"></span>
        </a></li>
        <li><a href="#" class="nav-link" data-page="contact">
          Contact
          <span class="nav-underline"></span>
        </a></li>
      </ul>
    </nav>
    <div class="nav-rule"></div>

    <!-- MAIN CONTENT -->
    <main class="main-content">

      <!-- HERO -->
      <div style="display:flex; align-items:flex-start; gap:40px; min-height:380px;">
        <!-- Left column -->
        <div style="display:flex; flex-direction:column; gap:16px; padding:16px 0; flex-shrink:0; max-width:480px;">
          <p class="kicker">UX/UI DESIGN</p>
          <h1 class="display-heading">
            Human-centered<br>
            product design,<br>
            with a playful edge<span class="accent-period">.</span>
          </h1>
          <p class="body-text">
            Hi, I'm Andy - a UX/UI designer who helps teams turn<br>
            complex problems into clear, intuitive experiences.<br>
            I care about craft, strategy, and the details that make<br>
            products feel effortless.
          </p>
        </div>
        <!-- Right column: overlapping screenshots -->
        <div style="position:relative; flex:1; min-height:380px;">
          <img
            src="assets/hero-mobile-home.png"
            alt="Tersus mobile app"
            style="position:absolute; left:0; top:54px; width:107px; height:271px; border-radius:10px; box-shadow:4px 4px 4px rgba(0,0,0,0.1); object-fit:cover;">
          <img
            src="assets/hero-tersus-web.png"
            alt="Tersus web app"
            style="position:absolute; left:75px; top:0; width:596px; height:367px; border-radius:10px; box-shadow:4px 4px 4px rgba(0,0,0,0.1); object-fit:cover;">
          <img
            src="assets/hero-auto-quote.png"
            alt="CURE auto quote"
            style="position:absolute; right:0; top:47px; width:138px; height:287px; border-radius:10px; box-shadow:0 4px 4px rgba(0,0,0,0.25); object-fit:cover;">
        </div>
      </div>

    </main>
  </div>
  <script src="scripts.js"></script>
</body>
</html>
```

- [ ] **Step 2: Open index.html in browser and verify**

Open `index.html` directly in a browser (file:// URL is fine). Check:
- Cream background (`#fcf7f4`)
- Logo appears top-left
- Nav links right-aligned in Fraunces font
- "Work" nav link has a blue underline bar (active state from scripts.js)
- Headline renders large and bold in Fraunces with an orange period
- Three overlapping product screenshots appear on the right side of the hero

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add homepage nav and hero section"
```

---

## Task 7: index.html — Selected Work + Tersus Featured Card

**Files:**
- Modify: `index.html` (add inside `<main>` after the hero div)

- [ ] **Step 1: Add Selected Work header + Tersus featured card inside `<main>`, after the hero div**

```html
      <!-- SELECTED WORK HEADER + TERSUS -->
      <div style="display:flex; flex-direction:column; gap:24px;">

        <!-- Section header -->
        <div class="section-header">
          <div class="section-header-left">
            <span class="kicker">SELECTED WORK</span>
            <div class="section-header-rule"></div>
          </div>
          <a href="tersus.html" class="link-arrow">
            View all case studies <span>➜</span>
          </a>
        </div>

        <!-- Tersus featured card -->
        <div class="featured-card">
          <!-- Left: text body -->
          <div class="featured-card-body" style="width:681px;">
            <div class="featured-card-body-inner">
              <p class="body-text">TERSUS</p>
              <h2 class="card-title-lg">Designing a simpler marketplace for home cleaning services</h2>
              <p class="body-text">Enhancing the booking experience with clearer flows, thoughtful UX decisions, and end-to-end product design that reduced friction for both customers and cleaners.</p>
              <div class="pill-row">
                <span class="pill">UX RESEARCH</span>
                <span class="pill">PRODUCT DESIGN</span>
                <span class="pill">DESIGN SYSTEM</span>
                <span class="pill">2023–2024</span>
              </div>
            </div>
            <a href="tersus.html" class="link-arrow">View Case Studies <span>➜</span></a>
          </div>
          <!-- Right: screenshot image -->
          <div class="featured-card-image" style="min-height:380px;">
            <img src="assets/tersus-card-bg.png" alt="" style="object-fit:cover;">
            <img src="assets/tersus-card-screens.png" alt="Tersus product screens" style="object-fit:contain; z-index:1;">
          </div>
        </div>

      </div>
```

- [ ] **Step 2: Open index.html in browser and verify**

Check:
- "SELECTED WORK" kicker + short horizontal line appear left, "View all case studies ➜" appears right
- Tersus card spans full width, left half has text/pills, right half has product screenshot
- Card has a light tan border and rounded corners

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add Selected Work header and Tersus featured card"
```

---

## Task 8: index.html — CURE Cluster + Bottom Cards

**Files:**
- Modify: `index.html` (add inside `<main>` after Tersus section)

- [ ] **Step 1: Add CURE Auto Insurance cluster inside `<main>`**

```html
      <!-- CURE AUTO INSURANCE CLUSTER -->
      <div class="cure-cluster">
        <p class="cure-cluster-label">CURE AUTO INSURANCE</p>
        <div class="cure-cards-row">

          <!-- Quick Quote -->
          <div class="cure-card">
            <div class="cure-card-thumbnail">
              <img src="assets/cure-quick-quote.png" alt="CURE Quick Quote">
            </div>
            <div class="cure-card-body">
              <div class="cure-card-body-inner">
                <h3 class="card-title-lg">Quick Quote</h3>
                <p class="body-text">Redesigned the quote experience to reduce user friction, improve form clarity, and help customers move through the insurance signup process with more confidence.</p>
                <div class="pill-row">
                  <span class="pill">UX RESEARCH</span>
                  <span class="pill">PRODUCT DESIGN</span>
                  <span class="pill">DESIGN SYSTEM</span>
                </div>
              </div>
              <a href="cure-quick-quote.html" class="link-arrow">View Case Study <span>➜</span></a>
            </div>
          </div>

          <!-- Scan to Insure -->
          <div class="cure-card">
            <div class="cure-card-thumbnail">
              <img src="assets/cure-scan-license.png" alt="CURE Scan to Insure">
            </div>
            <div class="cure-card-body">
              <div class="cure-card-body-inner">
                <h3 class="card-title-lg">Scan to Insure</h3>
                <p class="body-text">Created a mobile-first quote experience that reduced manual entry by pre-filling customer details from a scanned driver's license.</p>
                <div class="pill-row">
                  <span class="pill">UX RESEARCH</span>
                  <span class="pill">PRODUCT DESIGN</span>
                  <span class="pill">DESIGN SYSTEM</span>
                </div>
              </div>
              <a href="cure-scan-license.html" class="link-arrow">View Case Study <span>➜</span></a>
            </div>
          </div>

          <!-- My Account Portal -->
          <div class="cure-card">
            <div class="cure-card-thumbnail">
              <img src="assets/cure-my-account.png" alt="CURE My Account Portal">
            </div>
            <div class="cure-card-body">
              <div class="cure-card-body-inner">
                <h3 class="card-title-lg">My Account Portal</h3>
                <p class="body-text">Redesigned the account portal to help customers access policy details, manage account tasks, and navigate important insurance information with less confusion.</p>
                <div class="pill-row">
                  <span class="pill">UX RESEARCH</span>
                  <span class="pill">PRODUCT DESIGN</span>
                  <span class="pill">DESIGN SYSTEM</span>
                </div>
              </div>
              <a href="cure-my-account.html" class="link-arrow">View Case Study <span>➜</span></a>
            </div>
          </div>

        </div>
      </div>
```

- [ ] **Step 2: Add bottom cards row inside `<main>` after CURE cluster**

```html
      <!-- BOTTOM CARDS: About + Contact -->
      <div class="bottom-cards">

        <!-- About Andy -->
        <div class="bottom-card">
          <div class="bottom-card-content">
            <div class="bottom-card-text">
              <h3 class="card-title-sm">About Andy</h3>
              <p class="body-text" style="max-width:380px;">I'm a product designer with 8+ years of experience partnering with founders and cross-functional teams. My approach blends research, clarity, and craft to design experiences that are useful, usable, and a little delightful.</p>
            </div>
            <a href="#" class="link-arrow">More about me <span>➜</span></a>
          </div>
          <div class="bottom-card-illustration">
            <img src="assets/about-cat.png" alt="Illustrated cat" style="width:185px; height:199px; object-fit:contain;">
          </div>
        </div>

        <!-- Let's Work Together -->
        <div class="bottom-card">
          <div class="bottom-card-content">
            <div class="bottom-card-text">
              <h3 class="card-title-sm">Let's Work Together</h3>
              <p class="body-text">I'm always open to new opportunities and interesting problems. Whether you have a project in mind or just want to say hello, I'd love to hear from you.</p>
            </div>
            <a href="mailto:nguyenlandy@gmail.com" class="btn-primary">
              Let's Chat
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 13L13 3M13 3H6M13 3V10" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
          <div class="bottom-card-illustration">
            <img src="assets/contact-laptop.png" alt="Illustrated laptop" style="height:270px; object-fit:contain;">
          </div>
        </div>

      </div>
```

- [ ] **Step 3: Close `</main>` and `</div class="page-wrapper">` properly**

Ensure the HTML structure ends with:
```html
    </main>
  </div><!-- end .page-wrapper -->
  <script src="scripts.js"></script>
</body>
</html>
```

- [ ] **Step 4: Open index.html in browser and verify full homepage**

Check:
- Three CURE cards in a row inside the cluster container with light gray outer border
- Each CURE card has a screenshot top half and text/pills/link bottom half
- Bottom row: About Andy card (left, with cat illustration) + Let's Work Together card (right, with laptop illustration and blue CTA button)
- "Let's Chat" button is blue with square corners and a diagonal arrow icon
- All links point to correct files

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: add CURE cluster and bottom cards — homepage complete"
```

---

## Task 9: tersus.html — Case Study Page

**Files:**
- Create: `tersus.html`

Content sourced from: `tersus-case-study.md`

- [ ] **Step 1: Create tersus.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tersus — Andy Nguyen</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Inter:wght@400;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="page-wrapper">

    <!-- NAV -->
    <nav class="nav">
      <a href="index.html" class="nav-logo">
        <img src="assets/logo.png" alt="Pixel and Patches">
      </a>
      <ul class="nav-links">
        <li><a href="index.html" class="nav-link" data-page="work">Work<span class="nav-underline"></span></a></li>
        <li><a href="#" class="nav-link" data-page="playground">Playground<span class="nav-underline"></span></a></li>
        <li><a href="#" class="nav-link" data-page="about">About<span class="nav-underline"></span></a></li>
        <li><a href="#" class="nav-link" data-page="contact">Contact<span class="nav-underline"></span></a></li>
      </ul>
    </nav>
    <div class="nav-rule"></div>

    <main style="padding-top:64px; padding-bottom:120px;">

      <!-- BREADCRUMB -->
      <a href="index.html" class="breadcrumb">← Work</a>

      <!-- HERO -->
      <div class="cs-hero">
        <div class="cs-hero-images">
          <div class="cs-placeholder" style="width:340px; height:260px;">
            [PLACEHOLDER: Tersus Final Quote Screen — customer side]
          </div>
          <div class="cs-placeholder" style="width:340px; height:260px;">
            [PLACEHOLDER: Tersus Current Job Screen — cleaner side]
          </div>
        </div>
        <div class="cs-meta">
          <p class="kicker">MOBILE APP & WEB · SOLE PRODUCT DESIGNER</p>
          <h1 class="cs-title">Tersus<span class="accent-period">.</span></h1>
          <p class="cs-summary">Two completely different users. One design system. I was the sole designer across the full product — both sides, mobile and web, from the first wireframe to developer handoff.</p>
          <div class="pill-row" style="justify-content:center;">
            <span class="pill">MOBILE APP & WEB</span>
            <span class="pill">SOLE PRODUCT DESIGNER</span>
            <span class="pill">~1 YEAR</span>
          </div>
        </div>
      </div>

      <!-- BODY -->
      <div class="cs-body">

        <!-- Context -->
        <div class="cs-section">
          <h2 class="cs-section-heading">Context</h2>
          <p class="body-text">Most cleaning services make you hand over your phone number before you see a price. Tersus was built to change that — instant, self-serve booking for customers, and a reliable job management experience for the cleaners doing the work.</p>
        </div>

        <!-- Full-width image placeholder -->
        <div class="cs-image-full">
          <div class="cs-placeholder" style="height:400px;">[PLACEHOLDER: Full Flow Mosaic — zoomed-out Figma canvas showing screens from both sides side by side]</div>
        </div>

        <!-- The Challenge -->
        <div class="cs-section">
          <h2 class="cs-section-heading">The Challenge</h2>
          <p class="body-text">Two completely different users. One design system.</p>
          <p class="body-text"><strong>Customers</strong> needed to see a real price upfront, configure their service, and confirm a booking in minutes — no contact forms, no waiting for a callback.</p>
          <p class="body-text"><strong>Cleaners</strong> needed a dependable system for finding jobs nearby, understanding what a job involves before accepting, managing an active cleaning, and getting paid without friction.</p>
          <p class="body-text">Every design decision had to work for both. Midway through the project, scope expanded to include a full web product — requiring the mobile-first design system to scale to desktop without being rebuilt from scratch.</p>
        </div>

        <!-- Research -->
        <div class="cs-section">
          <h2 class="cs-section-heading">Research</h2>
          <p class="body-text">Five rounds of usability testing. 30+ participants. Both sides of the platform tested across mobile and web. Testing ran on a rolling cycle — each phase fed directly back into the product while development continued forward.</p>
        </div>

        <!-- Full-width image placeholder -->
        <div class="cs-image-full">
          <div class="cs-placeholder" style="height:300px;">[PLACEHOLDER: Research Table — Phase 1–5 with participant counts]</div>
        </div>

        <!-- Design Decisions -->
        <div class="cs-section">
          <h2 class="cs-section-heading">Design Decisions</h2>
          <h3 style="font-family:var(--font-display); font-variation-settings:var(--font-variation); font-size:24px; letter-spacing:-0.24px; margin-bottom:12px;">Bringing Pricing to the Surface</h3>
          <p class="body-text">Pricing was surfaced earlier and made transparent throughout the configuration steps — individual room prices, base costs, and premium service prices shown as users built their booking. By the time they reached the Final Quote screen, the total wasn't a surprise. It was a confirmation of decisions they'd already made.</p>
        </div>

        <!-- Decision 1 image -->
        <div class="cs-image-full">
          <div class="cs-placeholder" style="height:360px;">[PLACEHOLDER: Final Quote screen showing itemized pricing breakdown + Single_Unit_Flow.mov embed]</div>
        </div>

        <div class="cs-section">
          <h3 style="font-family:var(--font-display); font-variation-settings:var(--font-variation); font-size:24px; letter-spacing:-0.24px; margin-bottom:12px;">Building a Guide for the Actual Clean</h3>
          <p class="body-text">A service checklist and progress timer were added to the active job screen — not in the original scope, identified entirely through research. Cleaners could track rooms as they went, see elapsed time, access pre-job customer instructions, and reach a support link directly from the job.</p>
        </div>

        <!-- Decision 2 image -->
        <div class="cs-image-full">
          <div class="cs-placeholder" style="height:360px;">[PLACEHOLDER: Current Job screen — timer, checklist, customer info card + Cleaner_Flow.mov embed]</div>
        </div>

        <div class="cs-section">
          <h3 style="font-family:var(--font-display); font-variation-settings:var(--font-variation); font-size:24px; letter-spacing:-0.24px; margin-bottom:12px;">Giving Cleaners Control Over Their Work Area</h3>
          <p class="body-text">A dedicated Cleaning Area screen was added — not in the original scope, identified through research. Cleaners could set a preferred location by address or by drawing a radius directly on the map. A custom radius slider gave precise control over distance.</p>
        </div>

        <!-- Decision 3 image -->
        <div class="cs-image-full">
          <div class="cs-placeholder" style="height:360px;">[PLACEHOLDER: Cleaning Area screen — map with teal radius circle, custom radius slider]</div>
        </div>

        <!-- Outcome -->
        <div class="cs-section">
          <h2 class="cs-section-heading">Outcome</h2>
          <p class="body-text">One designer. Two platforms. Two completely different users. Roughly a year from first wireframe to developer handoff.</p>
          <ul style="padding-left:20px; display:flex; flex-direction:column; gap:8px;" class="body-text">
            <li>Customer and cleaner experiences designed in full — mobile app and web, both sides, simultaneously</li>
            <li>8+ screens added to scope mid-build, driven entirely by research findings</li>
            <li>Rolling handoff to developers across the full year — annotated Figma files, interaction notes, and component specs updated continuously</li>
            <li>Critical issues surfaced through structured pre-launch testing before reaching real users</li>
          </ul>
        </div>

        <!-- Reflection -->
        <div class="cs-section">
          <h2 class="cs-section-heading">Reflection</h2>
          <p class="body-text">Tersus was my first real UX/UI project. I didn't know about design systems at the beginning — I jumped straight into designing screens. The component library came later, assembled from work that was already done rather than built as a foundation from the start. If I were doing this again, I'd slow down the first two weeks significantly and build the system before touching a single screen.</p>
          <p class="body-text">Most of all, this project taught me how to learn on the job at speed. The things I'd do differently aren't failures — they're exactly what this project gave me.</p>
        </div>

        <!-- Next case study -->
        <div class="cs-next">
          <a href="cure-quick-quote.html" class="link-arrow">Next: NJ Quick Quote <span>➜</span></a>
        </div>

      </div>
    </main>
  </div>
  <script src="scripts.js"></script>
</body>
</html>
```

- [ ] **Step 2: Open tersus.html in browser and verify**

Check:
- Nav appears with "Work" underlined
- "← Work" breadcrumb links back to index.html
- Hero section has sand background (`#ede8dd`), two placeholder boxes, centered kicker/title/summary/pills
- Body sections alternate between text (max-width 720px) and full-width placeholder images
- Orange period on "Tersus."
- "Next: NJ Quick Quote ➜" appears bottom right

- [ ] **Step 3: Commit**

```bash
git add tersus.html
git commit -m "feat: add Tersus case study page"
```

---

## Task 10: cure-quick-quote.html — Case Study Page

**Files:**
- Create: `cure-quick-quote.html`

Content sourced from: `cure-nj-quick-quote.md`

- [ ] **Step 1: Create cure-quick-quote.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NJ Quick Quote — Andy Nguyen</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Inter:wght@400;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="page-wrapper">

    <nav class="nav">
      <a href="index.html" class="nav-logo"><img src="assets/logo.png" alt="Pixel and Patches"></a>
      <ul class="nav-links">
        <li><a href="index.html" class="nav-link" data-page="work">Work<span class="nav-underline"></span></a></li>
        <li><a href="#" class="nav-link" data-page="playground">Playground<span class="nav-underline"></span></a></li>
        <li><a href="#" class="nav-link" data-page="about">About<span class="nav-underline"></span></a></li>
        <li><a href="#" class="nav-link" data-page="contact">Contact<span class="nav-underline"></span></a></li>
      </ul>
    </nav>
    <div class="nav-rule"></div>

    <main style="padding-top:64px; padding-bottom:120px;">

      <a href="index.html" class="breadcrumb">← Work</a>

      <div class="cs-hero">
        <div class="cs-hero-images">
          <div class="cs-placeholder" style="width:340px; height:260px;">[PLACEHOLDER: Old Quick Quote flow screenshot]</div>
          <div class="cs-placeholder" style="width:340px; height:260px;">[PLACEHOLDER: New Quick Quote flow screenshot]</div>
        </div>
        <div class="cs-meta">
          <p class="kicker">WEB APP · SHIPPED · CURE AUTO INSURANCE</p>
          <h1 class="cs-title">NJ Quick Quote<span class="accent-period">.</span></h1>
          <p class="cs-summary">Redesigning CURE's primary customer acquisition flow from the ground up — 20 screens down to 10, built for production.</p>
          <div class="pill-row" style="justify-content:center;">
            <span class="pill">WEB APP</span>
            <span class="pill">SHIPPED</span>
            <span class="pill">DESIGN SPRINT</span>
          </div>
        </div>
      </div>

      <div class="cs-body">

        <div class="cs-section">
          <h2 class="cs-section-heading">Context</h2>
          <p class="body-text">CURE Auto Insurance's Quick Quote flow is the primary entry point for new customers seeking an auto insurance quote in New Jersey. It's one of the most business-critical pages in their digital product — if users drop off here, they never become customers.</p>
        </div>

        <div class="cs-image-full">
          <div class="cs-placeholder" style="height:400px;">[PLACEHOLDER: Full Flow Mosaic — all 10 screens in sequence]</div>
        </div>

        <div class="cs-section">
          <h2 class="cs-section-heading">The Problem</h2>
          <p class="body-text">The original Quick Quote flow had accumulated 20 screens of manual data entry. Users were asked for the same information multiple times across different screens. Dense legal warnings appeared mid-flow with no visual separation. The flow ended by telling users to call a phone number.</p>
        </div>

        <div class="cs-image-full">
          <div class="cs-placeholder" style="height:360px;">[PLACEHOLDER: Before/After — old dense flow vs new clean flow]</div>
        </div>

        <div class="cs-section">
          <h2 class="cs-section-heading">Design Decisions</h2>
          <h3 style="font-family:var(--font-display); font-variation-settings:var(--font-variation); font-size:24px; letter-spacing:-0.24px; margin-bottom:12px;">Consolidating Coverage Adjustment</h3>
          <p class="body-text">Rather than requiring users to navigate to separate pages for vehicle coverage and policy coverage, both are surfaced in a single scrollable view. Each coverage line shows pricing clearly. Users can adjust without losing context of the full picture. This single design decision eliminates significant back-and-forth from the original experience.</p>
        </div>

        <div class="cs-image-full">
          <div class="cs-placeholder" style="height:400px;">[PLACEHOLDER: Adjust Your Coverages screen — annotated two-column layout]</div>
        </div>

        <div class="cs-section">
          <h2 class="cs-section-heading">Component System</h2>
          <p class="body-text">Because this project required a fully functional prototype for CEO and stakeholder review, I built a comprehensive component library using Figma's boolean and variable features. Every dropdown, toggle, selection state, and interactive element was a live component with real behavior.</p>
        </div>

        <div class="cs-image-full">
          <div class="cs-placeholder" style="height:300px;">[PLACEHOLDER: Boolean components GIF — dropdowns opening, selections changing, toggles switching]</div>
        </div>

        <div class="cs-section">
          <h2 class="cs-section-heading">Outcome</h2>
          <p class="body-text">The redesigned Quick Quote flow was presented to CURE's leadership and CEO. It was approved and pushed to production, where it has been in active development for approximately a year.</p>
          <ul style="padding-left:20px; display:flex; flex-direction:column; gap:8px;" class="body-text">
            <li>Pushed to production — the strongest measure of stakeholder confidence</li>
            <li>Coverage adjustment consolidated into a single screen</li>
            <li>Full prototype fidelity secured leadership buy-in without ambiguity</li>
            <li>Component library built to support future iterations and developer handoff</li>
          </ul>
        </div>

        <div class="cs-section">
          <h2 class="cs-section-heading">Reflection</h2>
          <p class="body-text">This project taught me that working within constraints is a design skill in itself. The challenge wasn't just making things look better — it was making things work better while keeping the experience familiar enough that users and stakeholders both felt comfortable moving forward.</p>
        </div>

        <div class="cs-next">
          <a href="cure-scan-license.html" class="link-arrow">Next: Scan to Insure <span>➜</span></a>
        </div>

      </div>
    </main>
  </div>
  <script src="scripts.js"></script>
</body>
</html>
```

- [ ] **Step 2: Open cure-quick-quote.html in browser and verify**

Same checks as Tersus: nav active, breadcrumb, hero, sections, next link.

- [ ] **Step 3: Commit**

```bash
git add cure-quick-quote.html
git commit -m "feat: add CURE NJ Quick Quote case study page"
```

---

## Task 11: cure-scan-license.html — Case Study Page

**Files:**
- Create: `cure-scan-license.html`

Content sourced from: `cure-scan-license.md`

- [ ] **Step 1: Create cure-scan-license.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scan to Insure — Andy Nguyen</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Inter:wght@400;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="page-wrapper">

    <nav class="nav">
      <a href="index.html" class="nav-logo"><img src="assets/logo.png" alt="Pixel and Patches"></a>
      <ul class="nav-links">
        <li><a href="index.html" class="nav-link" data-page="work">Work<span class="nav-underline"></span></a></li>
        <li><a href="#" class="nav-link" data-page="playground">Playground<span class="nav-underline"></span></a></li>
        <li><a href="#" class="nav-link" data-page="about">About<span class="nav-underline"></span></a></li>
        <li><a href="#" class="nav-link" data-page="contact">Contact<span class="nav-underline"></span></a></li>
      </ul>
    </nav>
    <div class="nav-rule"></div>

    <main style="padding-top:64px; padding-bottom:120px;">

      <a href="index.html" class="breadcrumb">← Work</a>

      <div class="cs-hero">
        <div class="cs-hero-images">
          <div class="cs-placeholder" style="width:220px; height:380px;">[PLACEHOLDER: Scan prompt screen — mobile]</div>
          <div class="cs-placeholder" style="width:220px; height:380px;">[PLACEHOLDER: Pre-populated fields confirmation screen — mobile]</div>
          <div class="cs-placeholder" style="width:220px; height:380px;">[PLACEHOLDER: Error/correction state — mobile]</div>
        </div>
        <div class="cs-meta">
          <p class="kicker">MOBILE & WEB · 2-WEEK SPRINT · CURE AUTO INSURANCE</p>
          <h1 class="cs-title">Scan to Insure<span class="accent-period">.</span></h1>
          <p class="cs-summary">A 2-week design sprint that cut the CURE quote flow from 20 screens to 6 by letting customers scan their driver's license instead of typing.</p>
          <div class="pill-row" style="justify-content:center;">
            <span class="pill">MOBILE & WEB</span>
            <span class="pill">2-WEEK SPRINT</span>
            <span class="pill">IN DEVELOPMENT</span>
          </div>
        </div>
      </div>

      <div class="cs-body">

        <div class="cs-section">
          <h2 class="cs-section-heading">Context</h2>
          <p class="body-text">CURE was investing in Driver's License Scan technology as a differentiator. But a new feature dropped into an old, broken flow wouldn't deliver its full value. The experience around it needed to be rebuilt to match the ambition of the feature itself.</p>
        </div>

        <div class="cs-image-full">
          <div class="cs-placeholder" style="height:200px;">[PLACEHOLDER: 20 → 6 stat displayed as large visual element]</div>
        </div>

        <div class="cs-section">
          <h2 class="cs-section-heading">The Problem</h2>
          <p class="body-text">The existing Quick Quote flow had accumulated over 20 screens of manual data entry. Users were required to input every piece of personal information by hand, spread across a fragmented, outdated interface. The information entry phase was the highest point of user drop-off in the entire funnel.</p>
        </div>

        <div class="cs-section">
          <h2 class="cs-section-heading">Design Process</h2>
          <h3 style="font-family:var(--font-display); font-variation-settings:var(--font-variation); font-size:24px; letter-spacing:-0.24px; margin-bottom:12px;">Consolidation Strategy</h3>
          <p class="body-text">The Driver's License Scan was the key unlock. By pulling the following fields automatically from a scanned license, we eliminated entire sections of manual input: First Name, Middle Initial, Last Name, Gender, Date of Birth, Address & Zip Code, Driver's License Number & Status.</p>
        </div>

        <div class="cs-image-full">
          <div class="cs-placeholder" style="height:400px;">[PLACEHOLDER: Consolidated Drivers/Vehicles/Coverage screen — annotated hero shot]</div>
        </div>

        <div class="cs-section">
          <h2 class="cs-section-heading">Outcome</h2>
          <p class="body-text">By the end of the design sprint, the Quick Quote flow went from over 20 screens to approximately 6 — a reduction of roughly 70%. The redesigned flow was presented to CURE's leadership and received immediate stakeholder approval.</p>
          <ul style="padding-left:20px; display:flex; flex-direction:column; gap:8px;" class="body-text">
            <li>Eliminated manual entry for all fields obtainable via Driver's License Scan</li>
            <li>Consolidated Drivers, Vehicles, and Coverage onto a single screen</li>
            <li>Modernized the quote summary page with clear hierarchy and interactive dropdowns</li>
            <li>Designed within a 2-week sprint</li>
          </ul>
        </div>

        <div class="cs-section">
          <h2 class="cs-section-heading">Reflection</h2>
          <p class="body-text">This project reinforced something I believe strongly: the best UX work often happens within constraints, not in spite of them. Being pushed back toward CURE's visual language didn't limit the design — it forced me to find improvements that were structural and behavioral, not just aesthetic.</p>
        </div>

        <div class="cs-next">
          <a href="cure-my-account.html" class="link-arrow">Next: My Account Portal <span>➜</span></a>
        </div>

      </div>
    </main>
  </div>
  <script src="scripts.js"></script>
</body>
</html>
```

- [ ] **Step 2: Open cure-scan-license.html in browser and verify**

- [ ] **Step 3: Commit**

```bash
git add cure-scan-license.html
git commit -m "feat: add CURE Scan to Insure case study page"
```

---

## Task 12: cure-my-account.html — Case Study Page

**Files:**
- Create: `cure-my-account.html`

Content sourced from: `cure-my-account-portal.md`

- [ ] **Step 1: Create cure-my-account.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Account Portal — Andy Nguyen</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Inter:wght@400;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="page-wrapper">

    <nav class="nav">
      <a href="index.html" class="nav-logo"><img src="assets/logo.png" alt="Pixel and Patches"></a>
      <ul class="nav-links">
        <li><a href="index.html" class="nav-link" data-page="work">Work<span class="nav-underline"></span></a></li>
        <li><a href="#" class="nav-link" data-page="playground">Playground<span class="nav-underline"></span></a></li>
        <li><a href="#" class="nav-link" data-page="about">About<span class="nav-underline"></span></a></li>
        <li><a href="#" class="nav-link" data-page="contact">Contact<span class="nav-underline"></span></a></li>
      </ul>
    </nav>
    <div class="nav-rule"></div>

    <main style="padding-top:64px; padding-bottom:120px;">

      <a href="index.html" class="breadcrumb">← Work</a>

      <div class="cs-hero">
        <div class="cs-hero-images">
          <div class="cs-placeholder" style="width:460px; height:280px;">[PLACEHOLDER: Full Canvas Overview — all screens across both breakpoints]</div>
          <div class="cs-placeholder" style="width:220px; height:280px;">[PLACEHOLDER: Mobile breakpoint — Home screen]</div>
        </div>
        <div class="cs-meta">
          <p class="kicker">DESKTOP & MOBILE · 11 SECTIONS · CURE AUTO INSURANCE</p>
          <h1 class="cs-title">My Account Portal<span class="accent-period">.</span></h1>
          <p class="cs-summary">Full redesign of CURE's policyholder portal across 11 sections and two breakpoints — the first version with true mobile parity.</p>
          <div class="pill-row" style="justify-content:center;">
            <span class="pill">DESKTOP & MOBILE</span>
            <span class="pill">11 SECTIONS</span>
            <span class="pill">DESIGN SYSTEM</span>
          </div>
        </div>
      </div>

      <div class="cs-body">

        <div class="cs-section">
          <h2 class="cs-section-heading">Context</h2>
          <p class="body-text">CURE's existing My Account portal had all three of the classic problems: the experience was costing them money and trust. Navigation was a raw bullet-point list with no visual hierarchy, no icons, no priority. The entire portal had zero mobile design — not responsive, undesigned.</p>
        </div>

        <div class="cs-image-full">
          <div class="cs-placeholder" style="height:400px;">[PLACEHOLDER: Before/After — Home dashboard transformation]</div>
        </div>

        <div class="cs-section">
          <h2 class="cs-section-heading">The Challenge</h2>
          <p class="body-text">Scope and scale. Designing 11 distinct portal sections across two breakpoints required constant context-switching and an obsessive attention to consistency. A sidebar nav that works well on desktop becomes a bottom sheet or hamburger menu on mobile. Form layouts that fit neatly in a two-column desktop grid need to be rethought as single-column stacks on mobile.</p>
        </div>

        <div class="cs-image-full">
          <div class="cs-placeholder" style="height:400px;">[PLACEHOLDER: Desktop vs. Mobile side-by-side — Home, Claims, Vehicle Management]</div>
        </div>

        <div class="cs-section">
          <h2 class="cs-section-heading">Design Decisions</h2>
          <h3 style="font-family:var(--font-display); font-variation-settings:var(--font-variation); font-size:24px; letter-spacing:-0.24px; margin-bottom:12px;">Home Screen Hierarchy</h3>
          <p class="body-text">The most important screen in the portal — it's what every user sees first, every time. The redesign focused on surfacing the most critical information immediately: policy status, upcoming payment, quick links to the most-used sections. The hierarchy was rebuilt from the ground up so users can orient themselves instantly rather than hunting for what they need.</p>
        </div>

        <div class="cs-image-full">
          <div class="cs-placeholder" style="height:400px;">[PLACEHOLDER: Home Screen — annotated hero shot showing hierarchy decisions]</div>
        </div>

        <div class="cs-section">
          <h3 style="font-family:var(--font-display); font-variation-settings:var(--font-variation); font-size:24px; letter-spacing:-0.24px; margin-bottom:12px;">Claims Flow</h3>
          <p class="body-text">The highest-stakes flow in the portal. When a user is filing a claim, they're often stressed and need clarity above all else. The redesigned claims flow is structured, step-by-step, and designed to reduce cognitive load at a moment when users have none to spare.</p>
        </div>

        <div class="cs-image-full">
          <div class="cs-placeholder" style="height:360px;">[PLACEHOLDER: Submit a Claim — step sequence across 6 screens]</div>
        </div>

        <div class="cs-section">
          <h2 class="cs-section-heading">Design System</h2>
          <p class="body-text">Across a project of this scope, consistency isn't accidental — it's engineered. I maintained a shared component library throughout the redesign, ensuring that buttons, form fields, navigation elements, cards, and status indicators behaved consistently across all 11 sections and both breakpoints.</p>
        </div>

        <div class="cs-image-full">
          <div class="cs-placeholder" style="height:300px;">[PLACEHOLDER: Component Library — buttons, form fields, cards, navigation elements]</div>
        </div>

        <div class="cs-section">
          <h2 class="cs-section-heading">Outcome</h2>
          <ul style="padding-left:20px; display:flex; flex-direction:column; gap:8px;" class="body-text">
            <li>Full portal redesigned across desktop and mobile — 11 sections, two breakpoints</li>
            <li>Navigation clarity improved through a rebuilt Home screen hierarchy</li>
            <li>Mobile parity achieved — every flow fully designed for mobile users for the first time</li>
            <li>Self-service flows streamlined for vehicle management and claims submission</li>
            <li>Consistent component system maintained throughout, supporting clean developer handoff</li>
          </ul>
        </div>

        <div class="cs-section">
          <h2 class="cs-section-heading">Reflection</h2>
          <p class="body-text">This project taught me what it means to design at scale as a solo designer. Staying organized — through a disciplined component library, a clear file structure, and a consistent naming system — wasn't just good practice. It was what made the project possible.</p>
        </div>

        <div class="cs-next">
          <a href="index.html" class="link-arrow">← Back to all work <span></span></a>
        </div>

      </div>
    </main>
  </div>
  <script src="scripts.js"></script>
</body>
</html>
```

- [ ] **Step 2: Open cure-my-account.html in browser and verify**

- [ ] **Step 3: Commit**

```bash
git add cure-my-account.html
git commit -m "feat: add CURE My Account Portal case study page"
```

---

## Task 13: Final Link Check + Polish

**Files:**
- Verify all links across all 5 HTML files

- [ ] **Step 1: Check all internal links work**

Open each page and click every link. Expected routing:
- All "← Work" breadcrumbs → `index.html` ✓
- "View Case Studies" on index → `tersus.html` ✓
- "View Case Study" Quick Quote → `cure-quick-quote.html` ✓
- "View Case Study" Scan → `cure-scan-license.html` ✓
- "View Case Study" My Account → `cure-my-account.html` ✓
- Tersus "Next" → `cure-quick-quote.html` ✓
- Quick Quote "Next" → `cure-scan-license.html` ✓
- Scan License "Next" → `cure-my-account.html` ✓
- My Account "Back to all work" → `index.html` ✓
- "Let's Chat" → opens mailto client ✓

- [ ] **Step 2: Verify fonts load correctly on all pages**

On each page, the headline must use Fraunces (a distinctive high-contrast serif). If it falls back to a generic serif, the Google Fonts link didn't load. Check network tab for font load errors.

- [ ] **Step 3: Fix any spacing or alignment issues found**

Common things to check:
- Hero right column screenshots don't overflow the page on narrow viewports
- CURE cards are all equal height (530px fixed)
- Bottom cards are vertically centered (flexbox align-items:center)

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: portfolio complete — 5 pages, all links verified"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Nav with logo, 4 links, active state → Tasks 6, 9, 10, 11, 12
- [x] Hero with kicker, Fraunces headline, orange period, bio, 3 overlapping screenshots → Task 6
- [x] Selected Work header + Tersus featured card → Task 7
- [x] CURE cluster with 3 cards → Task 8
- [x] Bottom cards (About + Contact) → Task 8
- [x] All 4 case study pages with nav, breadcrumb, hero, body sections, next link → Tasks 9–12
- [x] All design tokens (colors, fonts, spacing) in CSS → Tasks 2–3
- [x] All Figma assets downloaded → Task 1
- [x] scripts.js active nav → Task 4
- [x] Orange period on all case study titles → Tasks 9–12
- [x] Placeholder boxes in case studies labeled per "Visual Assets Needed" sections → Tasks 9–12

**No placeholder steps** — every task has actual file content or commands.

**Type consistency** — `.link-arrow`, `.card-title-lg`, `.card-title-sm`, `.kicker`, `.pill`, `.btn-primary`, `.cs-section-heading`, `.cs-title`, `.body-text` used consistently across all tasks.

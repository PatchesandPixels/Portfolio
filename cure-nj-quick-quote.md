# CURE — NJ Quick Quote Redesign Case Study

**Role:** Sole UX/UI Designer
**Timeline:** Design Sprint | Pushed to Production
**Tools:** Figma, Component Libraries, Interactive Prototyping
**Company:** CURE Auto Insurance

---

## Overview

CURE Auto Insurance's Quick Quote flow is the primary entry point for new customers seeking an auto insurance quote in New Jersey. It's one of the most business-critical pages in their digital product — if users drop off here, they never become customers.

I was brought in to redesign this flow from the ground up. The goal was to modernize the visual style, simplify the experience, and make the process of getting a quote feel fast and intuitive. The redesign also needed to accommodate a newly introduced Driver's License Scan feature as an optional accelerated path through the flow.

This case study focuses on the redesign of the core quote flow — the experience every user goes through, with or without the scan feature.

---

## The Business Case

Quote abandonment is the biggest revenue leak in insurance. When a potential customer starts a quote and doesn't finish, that's a lost policy. A confusing, visually dated experience is one of the leading causes of mid-funnel drop-off. For a direct-to-consumer insurer like CURE, every percentage point of improvement in quote completion directly impacts revenue.

First impressions set trust. Insurance is a trust product — customers are deciding whether to hand over personal information and eventually money. If the first thing they see is a cluttered, dated interface, it signals that the company behind it might be equally outdated. A modern, clean quote experience communicates competence before a single word is read.

The mobile gap was costing customers. A significant portion of users starting quotes are on their phones. An experience designed for desktop-first, years-old browsers wasn't meeting them where they were — and mobile users have even less patience for friction than desktop users.

The Quick Quote is the gateway to everything. No quote means no policy. No policy means no My Account, no renewals, no upsells. Improving the quote experience wasn't a nice-to-have — it was the top of the entire customer funnel.

---

## The Problem

The original Quick Quote flow had accumulated **20 screens** of manual data entry — and it showed. Users were asked for the same information multiple times across different screens. Dense legal warnings appeared mid-flow with no visual separation from the rest of the content. Medical condition checkboxes sat directly below vehicle details. A "Driver Assignment" screen appeared twice. The flow ended by telling users to call a phone number.

Here's what the old flow actually looked like screen by screen:

- **Start Quote** — Email, confirm email, zip code. Three fields, full screen.
- **Basic Information** — Policy date + one dropdown. Full screen.
- **Select Quote Type** — Two option cards, both appearing selected simultaneously. Unclear state.
- **Coverage Selection** — A full-page wall of legal text including a paragraph-long bodily injury liability warning, mid-flow.
- **Applicant Information** — Name, full address, housing status, two phone number fields, email. One dense screen.
- **Driver Details** — DOB in 3 separate dropdowns, marital status, gender, license status, occupation, credit score range. All one screen.
- **Driving Record** — Two yes/no questions. Full screen.
- **Drivers & Household Members** — Almost empty screen with a wall of instructional copy.
- **Add Vehicles** — Two buttons. Full screen for a binary choice.
- **Vehicle Information** — Vehicle details mixed with parking questions, ownership type, and a roadside assistance bullet list.
- **Driver Assignment** — One question, one dropdown. Full screen.
- **Summary** — Quote shown with no coverage context. "IT'S SIMPLE TO JOIN!" headline.
- **Basic Info (legal)** — Five dense fraud and criminal history yes/no questions. Reads like a courtroom document.
- **Applicant Information (again)** — Same name and address fields from earlier re-entered.
- **Customary Drivers** — License number + medical condition checkboxes (Seizure Disorders, Narcolepsy, Syncope, Blindness) on the same screen as driver details.
- **Vehicle Details (again)** — More vehicle questions separate from the earlier vehicle screen.
- **Driver Assignment (again)** — Second appearance of the same screen.
- **Thanks for Your Application** — Flow ends by telling the user to call the office.

This wasn't just a visual problem. The structure itself was broken — redundant screens, information scattered across disconnected steps, and no sense of progress or momentum. For a product whose only job is to convert curious visitors into customers, the experience was actively working against the business.

---

## Goals

- Modernize the visual design while staying within CURE's established brand language
- Reduce friction at every step of the quote flow
- Simplify the coverage adjustment experience so users could review and modify their options without bouncing between screens
- Build a fully functional prototype for stakeholder and CEO presentation, complete with working components
- Design for production — every screen needed to be dev-ready

---

## Constraints & Challenges

The creative challenge here was familiar but real: CURE's leadership wanted improvement, not reinvention. My early explorations pushed the visual design further toward a contemporary aesthetic — more whitespace, bolder typographic hierarchy, a cleaner overall palette. Stakeholder feedback brought me back toward the brand. The look needed to stay close to what users already knew.

Rather than fighting that constraint, I redirected my energy toward the structural and interaction layer — the things users *feel* but don't consciously see. How many decisions does a user have to make per screen? How clearly does the interface communicate what comes next? How much information can be consolidated without creating confusion?

This also happened to be my first project using **boolean logic and variables** inside Figma components. Because the team needed a fully functional prototype for leadership review — not just static mockups — every interactive element had to actually work. Dropdowns, toggles, selections, state changes. Building that level of fidelity pushed my component-building skills significantly.

---

## The Redesigned Flow

The new Quick Quote flow runs across 10 screens, each designed to handle one clear job:

**Start Your Quote** — A clean entry point that collects only what's necessary to begin. Users can proceed manually or take the faster path via Driver's License Scan.

**Scan Your Driver's License** — An optional accelerated entry that pre-populates personal information automatically.

**Privacy Policy & Terms and Conditions** — Required legal screens, designed to feel transparent rather than like a wall of fine print.

**Select Quote Type** — Users choose between Liability Coverage Quote and Custom Quote. Multiple states are designed: default, selected, and expanded — all built as live components in the prototype.

**Add Your Vehicles** — A streamlined vehicle entry screen supporting both VIN lookup and manual Make/Model/Year input.

**Add Drivers and Household Members** — A consolidated screen for adding all drivers in the household at once, reducing the back-and-forth of the original flow.

**Driver Assignment** — Clean assignment of drivers to specific vehicles, with clear visual pairing.

**Quote Summary** — Pricing surfaced prominently and immediately. Users see their starting quote before making any coverage decisions, which anchors the experience and reduces anxiety.

**Adjust Your Coverages** — The screen I'm most proud of. Rather than requiring users to navigate to separate pages for vehicle coverage and policy coverage, both are surfaced in a single scrollable view. Each coverage line shows pricing clearly. Users can adjust without losing context of the full picture. This single design decision eliminates significant back-and-forth from the original experience.

---

## Component System & Prototype Fidelity

Because this project required a fully functional prototype for CEO and stakeholder review, I built a comprehensive component library using Figma's boolean and variable features — a first for me on this project.

This meant every dropdown, toggle, selection state, and interactive element was a live component with real behavior. The prototype didn't just look like the final product — it *felt* like it. Leadership could click through the entire quote flow and experience the speed and clarity of the redesigned experience firsthand.

This level of prototype fidelity was critical to getting buy-in. Static mockups can be misread as "just a painting." A working prototype made the UX improvements undeniable.

---

## Outcome

The redesigned Quick Quote flow was presented to CURE's leadership and CEO. It was approved and has since been **pushed to production**, where it has been in active development for approximately a year.

Key wins:

- **Pushed to production** — the strongest measure of stakeholder confidence
- **Coverage adjustment consolidated** into a single screen, eliminating multi-page navigation
- **Full prototype fidelity** secured leadership buy-in without ambiguity
- **On-brand modernization** — improved experience without disrupting visual trust
- **Component library built** to support future iterations and developer handoff

---

## Reflection

This project taught me that working within constraints is a design skill in itself. The challenge wasn't just making things look better — it was making things *work* better while keeping the experience familiar enough that users and stakeholders both felt comfortable moving forward.

Building a fully interactive prototype using booleans and variables for the first time pushed my Figma skills into new territory. It also reinforced something I now bring to every project: when the stakes are high, the prototype has to be as close to real as possible. That's what gets things approved and built.

---

## Visual Assets Needed

1. **Before/After Screenshots** — 2–3 side-by-side comparisons. Focus on the quote summary and coverage screens where the visual difference is most dramatic.
2. **Boolean Components** — Record a short screen capture or GIF in Figma showing dropdowns opening, selections changing state, toggles switching. Even 10–15 seconds is enough.
3. **Coverage Adjustment Screen — Hero Shot** — Full-width. Annotate the two-column layout to call out the UX decision of consolidating vehicle + policy coverage into one view.
4. **Full Flow Mosaic** — All 10 screens in sequence as a strong opener. Establishes scope at a glance.
5. **Prototype Embed** — Embed the Figma prototype so viewers can click through the full flow.
6. **Production Screenshots** — Once the dev build is live, grab real production screenshots to replace or supplement the Figma mockups.

# CURE — Scan License Project Case Study

**Role:** Sole UX/UI Designer
**Timeline:** 2 Weeks (Design) | Development In Progress
**Tools:** Figma, High-Fidelity Prototyping, Design Systems
**Company:** CURE Auto Insurance

---

## Overview

CURE Auto Insurance is a direct-to-consumer auto insurance provider. As part of an ongoing effort to modernize their customer experience, I was brought in to redesign the Quick Quote flow — the primary entry point for new customers seeking an insurance quote.

The centerpiece of this redesign was a new **Driver's License Scan feature**: a capability that allowed users to automatically capture their personal information by scanning their license, rather than typing it manually. My job was to design an experience that made this feature feel fast, intuitive, and trustworthy — while significantly reducing the number of steps it took to reach a quote.

---

## The Business Case

Completion rates were suffering. Every extra screen in a quote flow is a drop-off opportunity. Insurance customers are comparison shopping — if CURE's process takes longer than a competitor's, they leave. A 20-screen manual entry flow in an era of autofill and smart forms was a measurable conversion problem.

Support volume was elevated. When customers get frustrated mid-flow, they call. Every call into CURE's support team to help someone complete a quote is an operational cost that a better experience eliminates.

Competitive pressure. Insurtech competitors like Lemonade, Root, and Clearcover had raised the bar on digital-first quote experiences. A legacy form flow wasn't just inconvenient — it was making CURE look dated compared to newer entrants in the market.

The scan feature needed a home. CURE was investing in Driver's License Scan technology as a differentiator. But a new feature dropped into an old, broken flow wouldn't deliver its full value. The experience around it needed to be rebuilt to match the ambition of the feature itself.

---

## The Problem

The existing Quick Quote flow had accumulated over **20 screens** of manual data entry. Users were required to input every piece of personal information by hand — name, date of birth, address, license number, vehicle details — spread across a fragmented, outdated interface.

The result was a slow, cognitively exhausting process that created drop-off before users ever reached a quote. The flow felt like filling out a form at a DMV, not signing up for a modern digital product.

CURE's Customer Experience team had already validated the problem through internal research before I joined the project. Their findings confirmed what the data suggested: **the information entry phase was the highest point of user drop-off in the entire funnel.** The directive was clear — reduce the number of screens, reduce friction, and modernize the experience.

---

## Goals

- Reduce the number of screens in the quote flow to lower cognitive load and increase completion rates
- Integrate the Driver's License Scan feature seamlessly into the flow so it felt like a natural shortcut, not a gimmick
- Consolidate fragmented inputs into logical, single-screen groupings
- Modernize the visual design while respecting CURE's established brand identity

---

## Constraints & Challenges

This project had a clear creative tension at its center: **modernize without alienating.**

CURE's leadership was supportive of improvement but protective of their brand's visual language. My early explorations pushed the design too far in a contemporary direction — cleaner layouts, bolder typography choices, more whitespace — and stakeholder feedback brought me back to center. They wanted the product to feel improved, not unrecognizable.

This constraint turned out to be a useful guardrail. Rather than chasing visual novelty, I focused my energy on structural improvements: how information was grouped, how many decisions a user had to make per screen, and how clearly the interface communicated progress and next steps. The visual surface stayed familiar. The underlying experience got a complete overhaul.

Additionally, the scan feature itself was powered by a third-party API — meaning my design work focused entirely on the **before and after states**: how we primed users to use the feature, what fields it populated, and how we handled confirmation and correction.

---

## Design Process

### Mapping the Existing Flow

I started by auditing the existing 20-screen flow and identifying which screens were truly necessary versus which existed due to legacy structure or technical debt. Many screens were single-field inputs that could be collapsed without any loss of clarity.

### Consolidation Strategy

The Driver's License Scan was the key unlock. By pulling the following fields automatically from a scanned license, we eliminated entire sections of manual input:

- First Name, Middle Initial, Last Name
- Gender
- Date of Birth
- Address & Zip Code
- Driver's License Number & Status

The remaining fields — Phone Number, Marital Status, Email, and Vehicle information (VIN or Make/Model/Year) — were grouped logically into a streamlined set of remaining inputs.

The most significant structural decision was consolidating **Drivers, Vehicles, and Policy Coverage into a single screen.** Previously, users had to navigate back and forth between separate sections to make changes. By placing all three on one screen, users could review and adjust their full quote setup in one place — reducing both the number of taps and the mental overhead of managing multiple views.

### The Quote Page Redesign

The old quote summary page was a wall of undifferentiated text — dense, flat, and hard to parse. I redesigned it with a clear visual hierarchy: pricing surfaced prominently, coverage details organized into scannable sections, and dropdown menus replacing raw text fields for any editable options. The goal was to make the quote feel like a product, not a printout.

### Iteration & Stakeholder Feedback

Early prototypes were flagged as too far outside CURE's visual identity. I recalibrated — keeping the structural changes intact while dialing back the visual departure. This balance between **evolution and familiarity** became the north star for every subsequent design decision.

---

## The Result: 20 Screens → 6

By the end of the design sprint, the Quick Quote flow went from over **20 screens to approximately 6** — a reduction of roughly 70%. Users no longer needed to manually enter their core personal information, and all quote-related decisions were consolidated into a single, scannable view.

The redesigned flow was presented to CURE's leadership and **received immediate stakeholder approval.** The project was greenlit for development.

Key improvements delivered:

- **Eliminated manual entry** for all fields obtainable via Driver's License Scan
- **Consolidated Drivers, Vehicles, and Coverage** onto a single screen
- **Modernized the quote summary page** with clear hierarchy and interactive dropdowns
- **Maintained visual continuity** with CURE's brand, ensuring user trust was preserved
- **Designed within a 2-week sprint**, demonstrating the ability to move fast within constraints

---

## Reflection

This project reinforced something I believe strongly: **the best UX work often happens within constraints, not in spite of them.** Being pushed back toward CURE's visual language didn't limit the design — it forced me to find improvements that were structural and behavioral, not just aesthetic. The end result was something that genuinely served users better without requiring them to learn a new product.

If I were to continue iterating, I'd want to explore how the scan feature could be made more prominent earlier in the flow — potentially surfacing it as the primary entry point rather than an option — and run usability testing to measure actual completion rate improvements post-launch.

---

## Visual Assets Needed

1. **Before/After Screenshots** — Pick the 3–4 most dramatic comparisons. The consolidated Drivers/Vehicles/Coverage screen vs. the old fragmented screens will be the most powerful side-by-side.
2. **The 20 → 6 Stat** — Display as a large visual element. This is the kind of stat recruiters screenshot.
3. **Scan Feature UX States** — Prompt screen, confirmation screen with pre-populated fields, error/correction state. Label as "UX design around a third-party API integration."
4. **Consolidated Screen — Hero Shot** — Full-width treatment with annotation explaining *why* you consolidated them.
5. **Quote Summary Page — Before/After** — Old wall of text vs. redesigned hierarchy.
6. **Figma Prototype Embed** — Let viewers experience the flow themselves.
7. **Dev Feedback & Metrics** — Add once development progresses.

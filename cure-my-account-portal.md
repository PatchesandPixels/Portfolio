# CURE — My Account Portal Redesign Case Study

**Role:** Sole UX/UI Designer
**Scope:** Desktop & Mobile
**Tools:** Figma, Component Libraries, High-Fidelity Prototyping
**Company:** CURE Auto Insurance

---

## Overview

CURE Auto Insurance's My Account portal is the primary destination for existing policyholders. It's where customers manage everything about their relationship with CURE — their bills, their vehicles, their ID cards, their claims. For a company whose business depends on customer retention, the portal isn't just a feature. It's the product.

I was brought in as the sole designer to redesign the My Account portal across both desktop and mobile breakpoints. The scope covered 11 distinct sections of the portal: Login, Home, ID Cards, Payment History, Policy Documents, Submit a Request, Add Vehicle, Replace Vehicle, Remove Vehicle, and Submit a Claim.

---

## The Problem

Insurance companies redesign customer portals for the same fundamental reasons: the old experience is costing them money and trust.

CURE's existing My Account portal had all three of the classic problems — and the screenshots tell the story clearly.

**The Home dashboard** was split into two cramped columns inside a thin-bordered box floating on a white page: "Billing & Payment Center" on the left, "Manage My Policy" on the right. Navigation was a raw bullet-point list — ID Cards, View Payment History, View Bill/Declaration Pages, Report a Claim, Add/Replace/Remove Vehicle — with no visual hierarchy, no icons, no priority. A cartoon mascot character appeared in the bottom corner. Users had no sense of what was most important or what to do first.

**Payment History** was a plain three-column table — Processed Date, Transaction, Amount Paid — with no status indicators, no visual treatment, nothing scannable. The "Current Bill" panel next to it was a block of instructional text. Both sections competed equally for attention.

**Policy ID Cards** — one of the most time-sensitive actions a user can take — was a centered table showing Year, Make, Model, and a Download/Print link. No prominence, no speed, no consideration for mobile.

**Vehicle management** (Add, Replace, Remove) each opened as a near-empty screen with a few form fields. Add Vehicle was just a date picker and a VIN field. Replace and Remove were radio button lists. None of the three flows gave any visual confirmation that you were in the right place or what would happen next.

**Submit a Claim** had a 6-step progress bar at the top — Getting Started, Driver, Vehicle, Loss, Additional Info, Confirm — which was actually the most structured thing in the entire portal. But the form fields themselves were densely packed with no breathing room, and the overall experience felt like filling out a government form under stress.

**The entire portal had zero mobile design.** Not responsive — undesigned. Users accessing their policy from a phone were getting a shrunken desktop layout.

The Customer Experience team initiated the redesign with a clear directive: modernize, clarify, and build it properly for both desktop and mobile.

---

## Goals

- Modernize the visual design while staying within CURE's established brand identity
- Improve navigation clarity so users can find what they need without friction
- Enable true mobile parity — every flow fully designed for mobile breakpoints
- Streamline self-service flows for high-frequency tasks like vehicle management and claims
- Improve information hierarchy on the Home screen so users understand their policy at a glance

---

## Constraints & Challenges

**Scope and scale.** This was the largest single project I took on at CURE. Designing 11 distinct portal sections across two breakpoints — desktop and mobile — required constant context-switching and an obsessive attention to consistency. Every component, every pattern, every interaction had to work cohesively across the full system.

**Breakpoint juggling.** Designing for both desktop and mobile simultaneously is not just about resizing layouts. Information hierarchy, navigation patterns, and interaction models all behave differently across breakpoints. A sidebar nav that works well on desktop becomes a bottom sheet or hamburger menu on mobile. Form layouts that fit neatly in a two-column desktop grid need to be rethought as single-column stacks on mobile. Managing this without losing visual consistency was the central design challenge.

**Brand continuity.** As with the other CURE projects, the redesign had to feel like an evolution, not a departure. The visual language — CURE's navy and orange palette, their typography, their illustration style — had to be retained throughout. This kept the focus on structural and interaction improvements rather than visual reinvention.

---

## The Redesign — Section by Section

**Login** — The entry point to the portal. Redesigned to feel clean and modern while maintaining the familiar CURE brand. Clear error states, straightforward credential entry, and a welcoming visual tone that sets the right expectations before users enter their account.

**Home Dashboard** — The most important screen in the portal — it's what every user sees first, every time. The redesign focused on surfacing the most critical information immediately: policy status, upcoming payment, quick links to the most-used sections. Navigation was restructured to be scannable and predictable. The hierarchy was rebuilt from the ground up so users can orient themselves instantly rather than hunting for what they need.

**ID Cards** — One of the highest-frequency use cases in any insurance portal. Users need their ID card fast — often at a traffic stop or when registering a vehicle. The redesigned ID Cards section surfaces the card prominently, makes it easy to download or share, and eliminates the multi-step navigation of the old experience.

**Payment History** — Redesigned with a clear, scannable table layout. Payments are organized chronologically with clear status indicators. Users can understand their billing history at a glance without needing to interpret dense, undifferentiated data.

**Policy Documents** — A clean document library replacing a cluttered, hard-to-parse document list. Documents are clearly labeled and easy to locate, download, or request.

**Submit a Request** — A structured form flow that gives users a clear, guided way to submit requests to CURE without needing to call. Designed with clear labels, logical grouping of fields, and confirmation states that reassure users their request was received.

**Vehicle Management — Add, Replace, Remove** — Three distinct flows, each handling a specific vehicle management task. Designed with particular care for mobile — vehicle management is a task users frequently need to complete on the go. Each flow is streamlined to the minimum necessary steps, with clear confirmation states and error handling throughout.

**Submit a Claim** — The highest-stakes flow in the portal. When a user is filing a claim, they're often stressed and need clarity above all else. The redesigned claims flow is structured, step-by-step, and designed to reduce cognitive load at a moment when users have none to spare. Clear progress indicators, logical field grouping, and reassuring confirmation screens guide users through the process.

---

## Design System

Across a project of this scope, consistency isn't accidental — it's engineered. I maintained a shared component library throughout the redesign, ensuring that buttons, form fields, navigation elements, cards, and status indicators behaved consistently across all 11 sections and both breakpoints.

This component-first approach also benefited the development team. With a clean, organized Figma file and consistent component usage, handoff was clear and the implementation process was significantly smoother.

---

## Outcome

The My Account portal redesign represents the most comprehensive design project I completed at CURE. Across 11 portal sections and two breakpoints, every customer-facing screen was rebuilt with clarity, consistency, and usability as the guiding principles.

Key outcomes:

- **Full portal redesigned** across desktop and mobile — 11 sections, two breakpoints
- **Navigation clarity improved** through a rebuilt Home screen hierarchy
- **Mobile parity achieved** — every flow fully designed for mobile users for the first time
- **Self-service flows streamlined** for vehicle management and claims submission
- **Consistent component system** maintained throughout, supporting clean developer handoff

---

## Reflection

This project taught me what it means to design at scale as a solo designer. With 11 sections across two breakpoints, the risk of inconsistency is real and constant. Staying organized — through a disciplined component library, a clear file structure, and a consistent naming system — wasn't just good practice. It was what made the project possible.

I also learned that the most impactful design decisions on a project like this aren't always the most visible ones. Restructuring the Home screen navigation so users can find what they need in two taps instead of five isn't flashy. But for someone trying to pull up their ID card at a traffic stop, it's everything.

---

## Visual Assets Needed

1. **Before/After Screenshots** — Prioritize: Home dashboard (biggest visual transformation), Payment History (table layout transformation), ID Cards (accessibility and speed improvement).
2. **Full Canvas Overview Shot** — Zoomed-out Figma canvas showing all screens across both breakpoints. Use as a hero image near the top of the case study.
3. **Desktop vs. Mobile Side-by-Side** — Pick 2–3 key screens (Home, Claims, Vehicle Management) and show both breakpoints together.
4. **Home Screen — Hero Shot** — Full-width with annotations on hierarchy decisions — what you surfaced, what you deprioritized, and why.
5. **Claims Flow — Step Sequence** — Show Submit a Claim as a step-by-step sequence of screens.
6. **Vehicle Management Flow** — Show Add/Replace/Remove as a connected set demonstrating systematic thinking.
7. **Component Library Screenshot** — Buttons, form fields, cards, and navigation elements. Keep it clean and annotated.
8. **Figma Prototype Embed** — Prioritize the mobile flow since mobile parity is a key win of this project.

# Tersus — UX/UI Case Study

**Role:** Sole Product Designer
**Timeline:** ~1 Year
**Platform:** Mobile App & Web
**Tools:** Figma, Figma Dev Mode, Jira, Slack

---

Most cleaning services make you hand over your phone number before you see a price. Tersus was built to change that — instant, self-serve booking for customers, and a reliable job management experience for the cleaners doing the work. I was the sole designer across the full product: both sides, mobile and web, from the first wireframe to developer handoff.

---

## The Challenge

Two completely different users. One design system.

**Customers** needed to see a real price upfront, configure their service, and confirm a booking in minutes — no contact forms, no waiting for a callback.

**Cleaners** needed a dependable system for finding jobs nearby, understanding what a job involves before accepting, managing an active cleaning, and getting paid without friction.

Every design decision had to work for both. Midway through the project, scope expanded to include a full web product — requiring the mobile-first design system to scale to desktop without being rebuilt from scratch.

---

## Research

Five rounds of usability testing. 30+ participants. Both sides of the platform tested across mobile and web.

Testing ran on a rolling cycle — each phase fed directly back into the product while development continued forward.

| Phase | Focus | Participants |
|-------|-------|-------------|
| 1 | Customer booking flow (mobile) | 16 |
| 2 | Customer dashboard (web) | 17 |
| 3 & 4 | Cleaner onboarding & job management (web) | 15 |
| 5 | Full mobile app — both sides, pre-launch | 9 |

---

## What Research Revealed

**Pricing was invisible until it was too late.**
Customers reached the quote screen having no idea what they'd pay. Several disengaged before booking. Pricing needed to surface earlier — building confidence through the flow rather than surprising at the end.

**Cleaners had no guidance once they arrived at a job.**
The app went quiet the moment a cleaner started working. No checklist, no timer, no access to customer instructions. Cleaners wanted what Airbnb gives hosts — the right details before they showed up.

**The onboarding didn't feel trustworthy.**
One illustration in the cleaner sign-up flow was flagged by multiple testers as making the app feel untrustworthy. On a platform where cleaners share banking and personal information, that's a conversion problem — not just a visual one.

**Account management created unexpected friction.**
Editing a profile name required also updating an address — they were unnecessarily coupled. Users expected two separate, independent actions.

**The job list wasn't discoverable.**
Cleaners in Phase 5 scrolled the map without realising they could pull up a job list. A core navigation pattern was invisible to first-time users.

**Social sign-in was buried.**
On the cleaner web sign-up, SSO options sat at the bottom of the screen. Most users never saw them — defaulting to email and adding unnecessary friction.

---

## Design Decisions

### Bringing Pricing to the Surface

*The problem:* The client's instinct was to keep pricing hidden until the end of the booking flow — the concern being that showing cost too early would cause users to drop off before they understood what they were getting. Research told a different story. Users who hit a surprise total at checkout without any context for how it was calculated lost trust in the product. Several disengaged entirely. The problem wasn't the price — it was the opacity.

*What changed:* Pricing was surfaced earlier and made transparent throughout the configuration steps — individual room prices, base costs, and premium service prices shown as users built their booking. By the time they reached the Final Quote screen, the total wasn't a surprise. It was a confirmation of decisions they'd already made.

One tester put it plainly: *"The website is very transparent."* That trust signal was the goal — and the data made the case to the client.

---

### Building a Guide for the Actual Clean

*The problem:* Once a cleaner accepted a job and arrived at the property, the app had nothing for them. No checklist, no timer, no way to see what the customer expected or how to reach support.

*What changed:* A service checklist and progress timer were added to the active job screen — not in the original scope, identified entirely through research. Cleaners could track rooms as they went, see elapsed time, access pre-job customer instructions, and reach a support link directly from the job. It gave structure to the work itself, not just the process of finding it.

---

### Giving Cleaners Control Over Their Work Area

*The problem:* Cleaners had no way to define where they wanted to work. The job feed showed everything available regardless of distance or location — creating friction for cleaners who only wanted jobs in their neighbourhood, and reducing match quality for customers.

*What changed:* A dedicated Cleaning Area screen was added — not in the original scope, identified through research. Cleaners could set a preferred location by address or by drawing a radius directly on the map. A custom radius slider gave precise control over distance. The result was a job feed that felt relevant, and customers matched to cleaners who were genuinely available nearby. It was one of the most positively received additions in later testing rounds.

---

### Additional Design Changes

**Customer Booking — scope additions driven by research**
- **ASAP Cleaning** — Dedicated same-day booking path added after users needed urgent scheduling the standard calendar couldn't support
- **Cleaning Details screen** — Added so customers could tell cleaners where to park, how to enter, and whether they'd be home. Without it, cleaners arrived without context
- **Calendar redesign** — Rebuilt to support one-time, recurring, and multiple specific dates with clear visual distinction between each mode
- **Window counting by room** — Changed from a single total to per-room counting after testing showed the original approach didn't match how users thought about their space
- **Booking confirmation redesign** — Simplified to be immediately scannable: service, date, price, and next steps

**Customer Dashboard**
- Decoupled name and address editing after multiple testers flagged the connection as confusing
- Added empty states for users with no active jobs
- Added save confirmation to profile changes
- Improved payment method management — add, view, and remove cards without digging through settings

**Cleaner Job Discovery**
- Job list redesigned as a persistent bottom sheet so it was always visible without a hidden gesture to find it
- Job filters added to map view — narrow by job type without leaving the geographic view
- ASAP job application flow added with timing and distance more prominent than standard listings
- Cleaning area screen added — not in original scope. Cleaners get geographic control over their jobs; customers see cleaners who are genuinely available nearby. One of the most positively received additions in later testing

---

## Outcome

One designer. Two platforms. Two completely different users. Roughly a year from first wireframe to developer handoff.

- Customer and cleaner experiences designed in full — mobile app and web, both sides, simultaneously
- 8+ screens added to scope mid-build, driven entirely by research findings — features that weren't in the original brief and wouldn't exist without usability testing
- Rolling handoff to developers across the full year — annotated Figma files, interaction notes, and component specs updated continuously as the product evolved
- Critical issues surfaced through structured pre-launch testing before reaching real users

---

## Reflection

Tersus was my first real UX/UI project, and looking back, that shows in how it started. I didn't know about design systems at the beginning — I jumped straight into designing screens because the project was moving fast and there was pressure to keep up with development. The component library came later, assembled from work that was already done rather than built as a foundation from the start. If I were doing this again, I'd slow down the first two weeks significantly and build the system before touching a single screen. That upfront investment would have saved far more time than it cost.

The process was also largely waterfall — designs were handed off to development, and when problems surfaced after build, the work came back upstream for revision. On a project this size, with two sides of a platform running simultaneously, that created real pressure. Features that had already been built needed rework, and new design decisions had ripple effects I didn't always anticipate. It taught me how much more effective a closer, more iterative collaboration with engineering is compared to a clean handoff model.

Most of all, this project taught me how to learn on the job at speed. I grew significantly as a designer across this year — in systems thinking, in how to run and apply research, and in how to make decisions with incomplete information under a deadline. The things I'd do differently aren't failures — they're exactly what this project gave me.

---

## Visual Assets Needed

1. **Header** — Split hero: Final Quote screen (customer) on the left, Current Job screen (cleaner) on the right. Label: *"Two users. One platform."* Crop the "Give Feedback" tab from both edges before exporting.
2. **Design Decision 1** — Final Quote screen showing itemized pricing breakdown. Embed `Single_Unit_Flow.mov` below the screen. Label: *"Customer side — booking a clean from start to confirmation."*
3. **Design Decision 2** — Current Job screen (timer, checklist, customer info card). Embed `Cleaner_Flow.mov` below the screen. Label: *"Cleaner side — finding, starting, and completing a job."*
4. **Design Decision 3** — Cleaning Area screen (map with teal radius circle, custom radius slider).
5. **Research Table** — The Phase 1–5 table is a strong visual anchor near the top of the case study.
6. **Full Flow Mosaic** — Zoomed-out Figma canvas showing screens from both sides side by side to establish scope.

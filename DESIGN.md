# DESIGN

This document is the authoritative source of truth for the site's design, writing, navigation, and interaction rules. No UI or copy change is ready for merge until it satisfies this document.

## Core Principle
- Clarity beats cleverness.
- Simplicity beats feature count.
- Direct paths beat layered navigation.
- One clear idea beats repeated explanation.
- Every page, section, card, label, and control must earn its space.

## Writing
- Write for a reader who is intelligent, busy, and impatient.
- The standard is Feynman clarity, Einstein-level explanatory precision, Hemingway simplicity, and Caesar's concision.
- Reading is a favor. Spend that attention carefully.
- If a heading already states the idea, the sentence below it must add new information instead of mirroring the same phrasing.
- Prefer concrete nouns and verbs over setup language.
- Cut filler such as `it gives you`, `the problem is about`, `you need to`, `take this branch when`, or any other wording that delays the point.
- One sentence should carry one idea.
- Prefer short paragraphs and short bullets.
- Do not force short supporting copy into narrow measures when the layout has room. Artificial wrapping wastes space and attention.
- Match the user's mental model. Use the language the interface already shows instead of exposing internal taxonomy or implementation vocabulary.
- Explain only what helps the user decide, understand, or act.

## Navigation
- The homepage should lead directly to real destinations.
- Do not insert intermediary pages that only funnel the user to another page.
- Redirects are acceptable for backward compatibility. They are not acceptable as visible waypoints in the user journey.
- Navigation must not repeat context already visible in the page header, side panel, or primary content.
- Breadcrumbs are optional. Use them only when they remove ambiguity.
- Tabs are acceptable only when they reduce overload and each tab contains meaningfully different content.
- Side panels are acceptable only when they keep the main artifact in view and reduce context switching.

## Visual Language
- Keep the interface monochrome, high-contrast, and restrained.
- Use borders and spacing as the main structural tools.
- Monospace typography is part of the site's identity. Respect it.
- Boxes are for grouping and scanning, not decoration.
- Let summaries and descriptions use the available horizontal space unless the container itself requires wrapping.
- Global navigation should prefer icon-only actions. Add text only when the icon alone would hide critical meaning.
- Gradients, motion, badges, and helper text must be rare and purposeful.
- New surfaces must look native to the existing theme on first load.

## Information Architecture
- Start with the primary artifact: table, diagram, article, or code.
- Secondary explanation must support the main task, not delay it.
- Keep related information together when comparison matters.
- Remove duplicate facts across headers, panels, cards, and body copy.
- A page that adds no new information, no new comparison, and no new choice should not exist.

## Components
- Every component needs one clear job.
- Every label must describe what the user actually sees or does.
- Cards, chips, metrics, breadcrumbs, tabs, and helper text must justify their existence.
- If removing a component makes the page clearer, remove it.
- If a component repeats the same fact in multiple places, collapse it to one place.
- If a panel or section exists only because the implementation made it easy, delete it.

## Flow And Interaction
- Use the fewest steps that still preserve understanding.
- Keep the user's place stable whenever possible.
- Show the right amount of context near the task instead of pushing the user to a separate screen.
- Use interaction to reveal meaning, not to hide basic information behind unnecessary clicks.
- When the interface presents a decision path, use the exact user-facing questions and outcomes, not internal node names.

## Implementation Discipline
- Stay Jekyll-first. Prefer layouts, includes, Liquid, front matter, and `_data`.
- Extend an existing pattern before inventing a new one.
- Reuse the site's current spacing, border, card, and panel language before adding new primitives.
- Design and copy are part of the product, not polish to add later.

## Merge Bar
- Is the destination direct?
- Is any information repeated?
- Does every page add value?
- Does every component have intent?
- Does the copy say something new after the heading?
- Does the result feel simpler than what it replaced?

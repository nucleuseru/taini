# Design System Strategy: The Cinematic Alchemist

## 1. Overview & Creative North Star

The North Star for this design system is **"The Cinematic Alchemist."**

In the world of AI filmmaking, we are moving away from the "lab-grown" or "robotic" aesthetic. Instead, we embrace the prestige of the editing room and the luxury of the private screening. This design system treats the user interface not as a tool, but as a high-end editorial canvas.

We break the "SaaS Template" look by utilizing **intentional asymmetry** and **tonal depth**. Rather than rigid grids, we use breathing room (negative space) and overlapping elements to create a sense of movement and narrative flow. This system is designed to feel like a premium digital concierge for creators—sophisticated, quiet, and profoundly intentional.

---

## 2. Colors: Tonal Depth & Luminous Accents

This system utilizes a "Deep Onyx" foundation paired with "Liquid Gold" accents. We rely on light physics rather than structural lines to define our space.

### The "No-Line" Rule

**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off content. Boundaries must be defined solely through background color shifts or subtle tonal transitions.

- _Implementation:_ To separate a sidebar from a main feed, place a `surface-container-low` section against a `surface` background. The change in hex value is the border.

### Surface Hierarchy & Nesting

Treat the UI as a series of physical layers—like stacked sheets of obsidian glass.

- **Base Level:** `surface` (#131313) for the main application background.
- **Submerged Level:** `surface-container-lowest` (#0e0e0e) for "sunken" areas like code editors or secondary sidebars.
- **Elevated Level:** `surface-container-high` (#2a2a2a) for interactive modules or floating panels.

### The "Glass & Gradient" Rule

To evoke a sense of professional polish, we use semi-transparent surfaces with a `backdrop-filter: blur(20px)`.

- **Signature Textures:** For primary CTAs and Hero moments, do not use flat colors. Apply a subtle linear gradient from `primary` (#efcb61) to `primary-container` (#d2af48) at a 135-degree angle. This mimics the way light hits precious metals.

---

## 3. Typography: The Editorial Voice

Our typography is the backbone of the "Professional SaaS" identity, balancing the technical precision of **Inter** with the cinematic character of **Manrope**.

- **Display & Headlines (Manrope):** These are our "title cards." Use `display-lg` (3.5rem) with tighter letter-spacing (-0.02em) to create an authoritative, editorial feel. Manrope’s geometric yet warm curves suggest both AI precision and human creativity.
- **Body & Labels (Inter):** For functional data and long-form reading, Inter provides maximum legibility. Use `body-md` (0.875rem) for the majority of the interface to keep the aesthetic "light" and professional.
- **Hierarchy Note:** High-end design thrives on contrast. Pair a massive `display-md` headline with a tiny, uppercase `label-md` (tracked out +10%) to create a sophisticated, "magazine" layout style.

---

## 4. Elevation & Depth: Tonal Layering

We achieve hierarchy through **Tonal Layering** rather than traditional drop shadows.

- **The Layering Principle:** Place a `surface-container-low` card on a `surface` background. For an even deeper "nest," place a `surface-container-lowest` element inside that card. This creates a natural, soft lift.
- **Ambient Shadows:** If a "floating" effect is required (e.g., a context menu), use an extra-diffused shadow: `box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4)`. The shadow color should never be pure black, but rather a tinted version of `surface-container-lowest`.
- **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline-variant` (#4d4635) at 20% opacity. **Never use 100% opaque high-contrast borders.**
- **Glassmorphism:** Use `surface_variant` (#353534) at 60% opacity with a blur effect to create "floating glass" panels that feel integrated into the dark environment.

---

## 5. Components: Refined Primitives

### Buttons

- **Primary:** A "Liquid Gold" gradient (Primary to Primary-Container). Use `roundness-sm` (0.125rem) for a sharp, professional look. Text should be `on-primary` (#3d2f00).
- **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
- **Tertiary:** Ghost style. Text only in `primary`, becoming slightly more opaque on hover.

### Cards & Lists

- **Rule:** Forbid the use of divider lines.
- **Strategy:** Use 24px or 32px of vertical white space to separate list items. For cards, use a subtle background shift to `surface-container-low`.

### Input Fields

- **Style:** Minimalist underline or "sunken" box using `surface-container-lowest`.
- **Focus State:** A 1px "Ghost Border" using `primary` at 40% opacity. Avoid heavy glows.

### Specialized Components for Taini

- **The Filmstrip Timeline:** Use `surface-container-lowest` for the track background. Active clips should use a `secondary` fill with a `primary` gold leading edge (2px) to indicate playhead position.
- **AI Progress Luminescence:** Instead of a standard progress bar, use a blurring "Gold Pulse" that travels across the top of a container using the `primary` token.

---

## 6. Do's and Don'ts

### Do

- **Do** use asymmetrical layouts where the left margin is wider than the right to create an editorial feel.
- **Do** use `primary_fixed_dim` for text links within body copy to keep them legible but integrated.
- **Do** embrace negative space; if a screen feels crowded, remove a container, don't shrink the text.

### Don't

- **Don't** use pure white (#FFFFFF). Always use `on-surface` (#e5e2e1) to prevent eye strain in the dark theme.
- **Don't** use standard 4px or 8px "soft" rounded corners. Stick to the sharp `sm` (0.125rem) or `md` (0.375rem) to maintain a "professional tool" vibe.
- **Don't** use shadows to define every card. Rely on background color shifts (Tonal Layering) first.

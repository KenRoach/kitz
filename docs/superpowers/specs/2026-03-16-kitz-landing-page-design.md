# KitZ Landing Page — Design Spec

**Date:** 2026-03-16
**Status:** Approved
**Approach:** B — "Meet Kitz" (Persona-Led)

## Overview

Single-file HTML landing page for KitZ, targeting global SMB owners. Introduces Kitz as an AI business assistant with three surfaces: WhatsApp, Workspace (browser), and Brain (terminal CLI). Warm copy, premium visual design following the workspace.kitz.services branding.

## Audience

Global small business owners — bakeries, salons, shops, restaurants, mechanics, pharmacies. Non-technical. English-first with language toggle to Spanish and Portuguese.

## Brand Source of Truth

The workspace app (RenewFlow at workspace.kitz.services) defines the visual language:

### Colors

| Token | Light | Dark |
|-------|-------|------|
| bg | `#F6F7FA` | `#0B0F1A` |
| sidebar | `#FFFFFF` | `#0F1422` |
| card | `#FFFFFF` | `#151B2E` |
| cardHover | `#F0F2F8` | `#1A2240` |
| border | `#E2E6EF` | `#1E2745` |
| accent (green) | `#00B894` | `#00D4AA` |
| accentDim | `#00B89412` | `#00D4AA16` |
| accentGlow | `#00B89444` | `#00D4AA44` |
| purple | `#8B5CF6` | `#A78BFA` |
| purpleDim | `#8B5CF614` | `#A78BFA16` |
| blue | `#4A6CF7` | `#5B8DEF` |
| text | `#1A1F36` | `#E8ECF4` |
| textMid | `#6B7794` | `#8B95AD` |
| textDim | `#B0B8CC` | `#4A5578` |

### Typography

| Role | Font | Weights |
|------|------|---------|
| Body / Display | DM Sans | 400, 500, 600, 700 |
| Code / Mono | JetBrains Mono | 400, 500, 600 |

### Spacing & Radius

| Token | Value |
|-------|-------|
| Border radius (default) | 8px |
| Border radius (card) | 12px |
| Border radius (prominent) | 16px |
| Card padding | 20px |
| Section padding | 6rem 5% (desktop), 4rem 5% (mobile) |

### Design Language

- Dark-first landing page (matches workspace login gradient `#0B0F1A -> #1A1F36`)
- Green (`#00B894` / `#00D4AA`) is primary accent and CTA color
- Purple (`#8B5CF6` / `#A78BFA`) is secondary — used for avatars, user identity elements
- Rounded corners throughout (8px-16px)
- Subtle shadows, not sharp edges
- No film grain overlay (that's Academy, not workspace)

## Page Structure

### Section 1: Nav

- **Position:** Fixed, glassmorphism (`backdrop-filter: blur(24px)`, semi-transparent bg)
- **Left:** "KitZ" logo — DM Sans 700, small green gradient badge ("K" in 30x30 rounded square, border-radius 8px)
- **Center-right:** Nav links — Features, WhatsApp, Workspace, Brain (12px, 600 weight, uppercase, 0.1em letter-spacing, textMid color, green on hover)
- **Far right:** Language toggle (EN / ES / PT) + "Get Started" green CTA button (8px radius, `#00B894` bg, white text)
- **Mobile:** Hamburger menu. Logo and language toggle stay visible. Nav links drop down.
- **Border bottom:** `1px solid #1E2745`

### Section 2: Hero

- **Background:** Dark gradient `linear-gradient(135deg, #0B0F1A 0%, #1A1F36 100%)`
- **Layout:** Centered, min-height 100vh, vertically centered content
- **Badge:** Inline mono text — "v0.1 — Open Source" — green accent border, `#00D4AA16` bg, 8px radius
- **Headline:** "Meet Kitz. Your AI business assistant." — DM Sans 700, clamp(2.5rem, 7vw, 4rem), `#E8ECF4`
- **Subheadline:** "Manage sales, expenses, inventory, and clients — from WhatsApp, your browser, or your terminal." — 1.1rem, `#8B95AD`
- **CTAs (3 buttons, row, centered):**
  1. "Try on WhatsApp" — green filled `#00B894`, white text, 8px radius
  2. "Open Workspace" — outline, border `#2D3154`, white text, 8px radius
  3. "Install the Brain" — outline, same style, small terminal icon
- **Background effect:** Subtle radial green glow behind headline (`radial-gradient(circle, rgba(0,184,148,0.06), transparent 70%)`)
- **Mobile:** Buttons stack vertically, full width, 48px min height

### Section 3: WhatsApp Surface

- **Layout:** Two columns — text left, chat mockup right
- **Section label:** `// whatsapp` — JetBrains Mono, 0.7rem, 600, uppercase, green `#00D4AA`
- **Headline:** "Your business in your pocket" — DM Sans 700, clamp(1.8rem, 4vw, 2.5rem)
- **Body:** "Send Kitz a message like you'd talk to an employee. 'Vendí 5 empanadas a $1.50' — and it's tracked. Sales, expenses, inventory, customer follow-ups. All from the chat you already use every day." — 1rem, `#8B95AD`
- **CTA:** "Try on WhatsApp →" — green text link, points to `https://wa.me/50760001234?text=Hola%20Kitz`
- **Chat mockup:**
  - Container: `#151B2E` bg, `#1E2745` border, 12px radius, max-width 380px
  - Header: `#1A2240` bg, green "K" avatar (gradient badge), "Kitz" name, "online" green status
  - Messages (onboarding flow from flow.ts):
    - User: "Hola"
    - Kitz: "¡Hola! 👋 Soy Kitz, tu asistente personal de negocios. ¿Qué tipo de negocio tienes?"
    - User: "Panadería"
    - Kitz: "¡Genial! 🏪 ¿Cómo se llama tu negocio?"
  - User messages: dark green-tint bg `#1a3a2a`, aligned right
  - Bot messages: `#1A2240` bg, aligned left, green for bold/accent text
  - Timestamps: `#4A5578`, 0.65rem, right-aligned
- **Mobile:** Stacks vertically, text first, mockup below full width

### Section 4: Workspace Surface

- **Layout:** Two columns — mockup left, text right (FLIPPED from Section 3)
- **Section label:** `// workspace` — same mono green style
- **Headline:** "The full picture, in your browser"
- **Body:** "Dashboard with real-time metrics. Weekly reports. Inventory alerts. Customer management. Invoice generation. Everything Kitz tracks on WhatsApp, visualized and organized in one place."
- **CTA:** "Open Workspace →" — green text link, points to `https://workspace.kitz.services`
- **Dashboard mockup:**
  - Container: 12px radius, `#151B2E` bg, `#1E2745` border
  - Left edge: sidebar hint (narrow, `#0F1422`, with 3-4 icon placeholders)
  - Main area: row of 3 MetricCards:
    - "Sales" — $580.00 — ▲ 12% (green)
    - "Expenses" — $320.00 — ▼ 8% (green, as decrease is good)
    - "Profit" — $260.00 — ▲ 23% (green)
  - MetricCard style: 28px bold value, 11px uppercase label, icon container 34x34 with `${color}12` bg, 9px radius
  - Below metrics: small pipeline/alert bar indicator
  - Colors: `#00D4AA` accent, `#A78BFA` purple for secondary elements
- **Mobile:** Stacks vertically, text first, mockup below

### Section 5: Brain / Terminal Surface

- **Layout:** Two columns — text left, terminal mockup right
- **Section label:** `// kitz brain` — same mono green style
- **Headline:** "AI in your terminal"
- **Body:** "Install the Kitz brain locally. Query your business data, generate reports, run insights — all from the command line. Built for power users who live in the terminal."
- **CTA:** "Install →" — green text link
- **Terminal mockup:**
  - Container: 12px radius, `#0B0F1A` bg (deepest dark), `#1E2745` border
  - Title bar: three dots (red `#FF4D6A`, yellow `#FFB020`, green `#00D4AA`) + "kitz-brain" label in `#4A5578`
  - Content in JetBrains Mono, 0.82rem:
    ```
    $ npm install -g kitz
    ✓ kitz brain installed

    $ kitz insights
    📊 Weekly Report — La Panadería Rosa
    ─────────────────────────────
    Sales:    $580.00  ▲ 12%
    Expenses: $320.00  ▼  8%
    Profit:   $260.00  ▲ 23%

    💡 Tip: Your flour costs dropped — lock in
       this supplier price with a bulk order.
    ```
  - `$` commands: green `#00D4AA`
  - Output: `#E8ECF4`
  - Dimmed text: `#8B95AD`
  - Success marks (✓): green `#00D4AA`
- **Mobile:** Stacks vertically, text first, terminal below

### Section 6: Benefits Grid

- **Background:** Same dark section bg
- **Section label:** `// why kitz` — mono green
- **Headline:** "Built for how you actually work"
- **Layout:** 3 columns, 2 rows (6 cards total), gap 1.5rem
- **Card style:** `#151B2E` bg, `#1E2745` border, 12px radius, 20px padding
- **Cards:**

| Icon | Title | Description |
|------|-------|-------------|
| 🤖 | Multi-LLM | Powered by Anthropic, OpenAI, and Google AI. Kitz picks the best model for each task. |
| 🌎 | Multilingual | Spanish, English, Portuguese. Kitz speaks your language. |
| 📱 | WhatsApp-native | No app to download. Works where your customers already are. |
| 🔒 | Your data, your control | Self-host or cloud. Open source. Nothing leaves without your say. |
| ⚡ | Real-time insights | AI-generated weekly reports, daily summaries, inventory alerts. |
| 🔌 | Open source | MIT licensed. Extend it, fork it, make it yours. |

- **Card title:** DM Sans 700, 1.1rem, `#E8ECF4`
- **Card body:** 0.9rem, `#8B95AD`
- **Icon:** 1.8rem, block, margin-bottom 1rem
- **Mobile:** Single column stack, cards full width

### Section 7: Get Started / CTA

- **Background:** Elevated card bg `#151B2E` for the full section to differentiate
- **Layout:** Centered content
- **Headline:** "Ready to meet your new business assistant?" — DM Sans 700, centered
- **Subheadline:** "Pick how you want to start." — `#8B95AD`, centered
- **Three cards side by side:**

| Icon | Title | Description | CTA |
|------|-------|-------------|-----|
| 💬 | WhatsApp | "Send a message, start in 30 seconds" | "Try on WhatsApp" — green filled |
| 🖥️ | Workspace | "Full dashboard, sign up free" | "Open Workspace" — outline |
| ⌨️ | Brain | `npm install -g kitz` in mono | "View on GitHub" — outline |

- **Card style:** `#1A2240` bg (slightly lighter than section), `#1E2745` border, 12px radius, 20px padding, centered text
- **CTA buttons:** Same styles as hero buttons, full card width, 48px min height
- **Subtle green radial glow** behind the section
- **Mobile:** Cards stack vertically, full width

### Section 8: Footer

- **Background:** `#0B0F1A`
- **Border top:** `1px solid #1E2745`
- **Layout:** Three columns desktop, stacks on mobile
- **Left:** "KitZ" logo with green badge. Below: "AI business assistant — open source." in `#4A5578`
- **Middle:** Two link groups:
  - Product: WhatsApp, Workspace, GitHub
  - Community: Issues, Academy, Docs
  - Link style: 0.8rem, `#4A5578`, green on hover
- **Right:** Language toggle (EN / ES / PT)
- **Bottom bar:** Centered, full width: `© 2026 KitZ — Open Source · MIT License` — 0.75rem, `#4A5578`
- **No:** social media, newsletter, tracking, cookies

## Language Toggle

- Default: English
- Toggle switches all visible text to Spanish or Portuguese
- Implemented via minimal vanilla JS: a `data-lang` attribute on `<html>`, with `[data-lang="es"] .en { display:none } [data-lang="es"] .es { display:inline }` pattern
- Each translatable text element has three spans: `.en`, `.es`, `.pt` — only the active language shows
- Toggle is a simple 3-button pill group in the nav and footer

## Responsive Behavior

### Desktop (>768px)
- Two-column layouts for surface sections (alternating)
- Three-column grids for benefits and CTA cards
- Nav links visible, hamburger hidden
- Mockups max-width 380px (chat), 480px (dashboard), 420px (terminal)

### Mobile (<=768px)
- Single column everything
- Surface sections: text first, mockup below, full width
- Buttons: full width, 48px min height, stacked vertically
- Nav: hamburger menu, logo + language toggle visible
- Body text: minimum 16px
- Section padding: 4rem 5%

### Small mobile (<=480px)
- Headlines scale down via clamp()
- Card padding reduces to 16px
- Mockup font sizes reduce slightly

## Technical Constraints

- Single HTML file, zero dependencies beyond Google Fonts
- Google Fonts: DM Sans (400,500,600,700) + JetBrains Mono (400,500,600)
- No external images — all mockups are CSS/HTML
- No JavaScript frameworks
- No tracking, analytics, or cookies
- Minimal vanilla JS for: language toggle, mobile hamburger
- Total file size target: under 100KB
- Valid HTML5, no unclosed tags

## Links

- WhatsApp: `https://wa.me/50760001234?text=Hola%20Kitz` (placeholder number)
- Workspace: `https://workspace.kitz.services`
- GitHub: `https://github.com/KenRoach/kitz`
- GitHub Issues: `https://github.com/KenRoach/kitz/issues`
- Academy: `https://kenroach.github.io/kitz/`

## Deployment

1. Source: `/kitz-landing.html`
2. Copy to `static_dist/index.html` (production serve)
3. Copy to `index.html` (GitHub Pages)
4. Commit: `feat: KitZ(OS) landing page v2 — brand-aligned, SMB-first`

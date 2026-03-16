# KitZ Landing Page v2 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-file HTML landing page for KitZ targeting global SMB owners, with three product surfaces (WhatsApp, Workspace, Brain) and EN/ES/PT language toggle.

**Architecture:** Single HTML file with inline CSS and minimal vanilla JS. Eight sections following the "Meet Kitz" persona-led narrative. Workspace branding (green accent `#00B894`/`#00D4AA`, purple secondary `#8B5CF6`/`#A78BFA`, DM Sans + JetBrains Mono, dark theme, rounded corners). Language toggle via `data-lang` attribute on `<html>`.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Google Fonts (DM Sans, JetBrains Mono)

**Spec:** `docs/superpowers/specs/2026-03-16-kitz-landing-page-design.md`

---

## File Structure

| File | Purpose |
|------|---------|
| `kitz-landing.html` | Source landing page (single file, all CSS/JS inline) |
| `static_dist/index.html` | Production copy (deployed) |
| `index.html` | GitHub Pages copy |

All three files are identical — `kitz-landing.html` is the source of truth, copied to the other two locations on deploy.

---

## Chunk 1: Foundation — HTML skeleton, CSS variables, nav, hero

### Task 1: HTML head and CSS custom properties

**Files:**
- Create: `kitz-landing.html`

- [ ] **Step 1: Create the HTML file with head, meta tags, and CSS variables**

Write the `<!DOCTYPE html>` through closing `</style>` tag. Include:
- All meta tags (viewport, description, OG, Twitter Card, JSON-LD)
- Inline SVG favicon as data URI (green rounded square with white "K")
- Google Fonts import: `DM Sans:wght@400;500;600;700` + `JetBrains Mono:wght@400;500;600`
- CSS reset (`*`, `html`, `body`, `::selection`, `a`)
- CSS custom properties matching workspace dark tokens:
  ```
  --bg-deep: #0B0F1A
  --bg-main: #0F1422
  --bg-card: #151B2E
  --bg-card-hover: #1A2240
  --bg-elevated: #1A1F36
  --border: #1E2745
  --accent: #00D4AA
  --accent-solid: #00B894
  --accent-dim: rgba(0,212,170,0.09)
  --accent-glow: rgba(0,212,170,0.27)
  --purple: #A78BFA
  --purple-dim: rgba(167,139,250,0.09)
  --blue: #5B8DEF
  --danger: #FF4D6A
  --warn: #FFB020
  --text: #E8ECF4
  --text-mid: #8B95AD
  --text-dim: #4A5578
  --font: 'DM Sans', 'Segoe UI', system-ui, sans-serif
  --mono: 'JetBrains Mono', 'Fira Code', monospace
  --radius: 8px
  --radius-card: 12px
  --radius-lg: 16px
  ```
- `html { scroll-behavior: smooth; }`
- `body { background: var(--bg-deep); color: var(--text); font-family: var(--font); line-height: 1.6; overflow-x: hidden; }`

- [ ] **Step 2: Verify the file opens in browser**

Run: `open kitz-landing.html`
Expected: Dark blank page, no errors in console.

### Task 2: Language toggle CSS infrastructure

**Files:**
- Modify: `kitz-landing.html`

- [ ] **Step 1: Add language display rules to CSS**

```css
/* Language toggle — only active lang visible */
[data-lang="en"] .es, [data-lang="en"] .pt { display: none !important; }
[data-lang="es"] .en, [data-lang="es"] .pt { display: none !important; }
[data-lang="pt"] .en, [data-lang="pt"] .es { display: none !important; }
/* Block-level translated elements */
h1 .en, h1 .es, h1 .pt,
h2 .en, h2 .es, h2 .pt,
p .en, p .es, p .pt { display: block; }
[data-lang="en"] h1 .es, [data-lang="en"] h1 .pt,
[data-lang="en"] h2 .es, [data-lang="en"] h2 .pt,
[data-lang="en"] p .es, [data-lang="en"] p .pt { display: none !important; }
/* (same pattern for es, pt) */
```

Set `<html lang="en" data-lang="en">` as default.

### Task 3: Navigation bar

**Files:**
- Modify: `kitz-landing.html`

- [ ] **Step 1: Add nav CSS**

Glassmorphism fixed nav:
- `position: fixed; top: 0; left: 0; right: 0; z-index: 999;`
- `background: rgba(11,15,26,0.85); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);`
- `border-bottom: 1px solid var(--border);`
- `padding: 0.8rem 5%;`
- Flex layout: logo left, nav links center-right, lang toggle + CTA far right
- Logo: "K" badge (30x30, green gradient bg `linear-gradient(135deg, #00B894, #00A88A)`, white "K" text, 8px radius) + "KitZ" in DM Sans 700
- Nav links: 0.75rem, 600, uppercase, 0.1em letter-spacing, `var(--text-mid)`, green on hover
- Language toggle: 3-button pill group, `var(--bg-card)` bg, 8px radius, active pill gets `var(--accent-dim)` bg + green text
- "Get Started" CTA: `var(--accent-solid)` bg, white text, 8px radius, `transition: all 0.2s ease`
- Hamburger: hidden on desktop, visible <=768px

- [ ] **Step 2: Add nav HTML**

```html
<nav>
  <div class="logo">
    <div class="logo-badge">K</div>
    <span>KitZ</span>
  </div>
  <ul class="nav-links">
    <li><a href="#whatsapp">...</a></li>
    <li><a href="#workspace">...</a></li>
    <li><a href="#brain">...</a></li>
    <li><a href="#features">...</a></li>
  </ul>
  <div class="nav-right">
    <div class="lang-toggle">
      <button class="lang-btn active" data-lang="en">EN</button>
      <button class="lang-btn" data-lang="es">ES</button>
      <button class="lang-btn" data-lang="pt">PT</button>
    </div>
    <a class="btn-green" href="#get-started">Get Started</a>
  </div>
  <button class="hamburger" aria-label="Menu">
    <span></span><span></span><span></span>
  </button>
</nav>
```

- [ ] **Step 3: Add nav responsive CSS**

Mobile (<=768px):
- `.nav-links { display: none; }` / `.nav-links.show { display: flex; flex-direction: column; position: absolute; top: 100%; ... }`
- `.hamburger { display: block; }` on mobile, `display: none` on desktop
- Language toggle stays visible

- [ ] **Step 4: Verify nav in browser**

Open file, check: logo renders, links visible on desktop, hamburger on narrow window.

### Task 4: Hero section

**Files:**
- Modify: `kitz-landing.html`

- [ ] **Step 1: Add hero CSS**

- `min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center;`
- `background: linear-gradient(135deg, #0B0F1A 0%, #1A1F36 100%);`
- `padding-top: 5rem;` (clear fixed nav)
- Badge: mono font, `var(--accent-dim)` bg, `1px solid rgba(0,212,170,0.15)`, 8px radius
- Headline: DM Sans 700, `clamp(2.5rem, 7vw, 4rem)`, `var(--text)`
- Subheadline: 1.1rem, `var(--text-mid)`, max-width 560px, centered
- Button row: flex, gap 1rem, centered, wrap
- `.btn-green`: `var(--accent-solid)` bg, white, 8px radius, `padding: 0.7rem 1.8rem`, hover darkens to `#00A88A` + shadow
- `.btn-outline`: transparent bg, `1px solid var(--border)`, white text, 8px radius, hover border goes green
- Radial green glow: `position: absolute; width: 500px; height: 500px; radial-gradient(circle, rgba(0,184,148,0.06), transparent 70%);`
- Mobile: buttons stack, full width, 48px min-height

- [ ] **Step 2: Add hero HTML with trilingual text**

```html
<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-inner">
    <div class="hero-badge mono">v0.1 — Open Source</div>
    <h1>
      <span class="en">Meet Kitz. Your AI business assistant.</span>
      <span class="es">Conoce a Kitz. Tu asistente de negocios con IA.</span>
      <span class="pt">Conhe&ccedil;a o Kitz. Seu assistente de neg&oacute;cios com IA.</span>
    </h1>
    <p>
      <span class="en">Manage sales, expenses, inventory, and clients — from WhatsApp, your browser, or your terminal.</span>
      <span class="es">Maneja ventas, gastos, inventario y clientes — desde WhatsApp, tu navegador o tu terminal.</span>
      <span class="pt">Gerencie vendas, despesas, estoque e clientes — pelo WhatsApp, navegador ou terminal.</span>
    </p>
    <div class="hero-buttons">
      <a class="btn-green" href="https://wa.me/50760001234?text=Hola%20Kitz">
        <span class="en">Try on WhatsApp</span>
        <span class="es">Probar en WhatsApp</span>
        <span class="pt">Testar no WhatsApp</span>
      </a>
      <a class="btn-outline" href="https://workspace.kitz.services">
        <span class="en">Open Workspace</span>
        <span class="es">Abrir Workspace</span>
        <span class="pt">Abrir Workspace</span>
      </a>
      <a class="btn-outline" href="https://github.com/KenRoach/kitz">
        <span class="en">Install the Brain</span>
        <span class="es">Instalar el Brain</span>
        <span class="pt">Instalar o Brain</span>
      </a>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Verify hero in browser**

Check: gradient bg, centered text, three buttons, badge, glow effect. Resize to mobile — buttons should stack.

- [ ] **Step 4: Commit foundation**

```bash
git add kitz-landing.html
git commit -m "feat: landing page v2 — foundation, nav, hero"
```

---

## Chunk 2: Three product surfaces

### Task 5: Shared surface section CSS

**Files:**
- Modify: `kitz-landing.html`

- [ ] **Step 1: Add two-column surface layout CSS**

```css
.surface { padding: 6rem 5%; }
.surface-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  max-width: 1100px;
  margin: 0 auto;
}
.surface-layout.flip { direction: rtl; }
.surface-layout.flip > * { direction: ltr; }
.surface-text {}
.section-label {
  font-family: var(--mono);
  font-size: 0.7rem; font-weight: 600;
  letter-spacing: 0.15em; text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 1rem;
}
.section-title {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: 1rem;
}
.section-body {
  color: var(--text-mid);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}
.link-arrow {
  color: var(--accent);
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}
.link-arrow:hover { opacity: 0.8; }
```

Mobile (<=768px):
```css
.surface-layout { grid-template-columns: 1fr; gap: 2rem; }
.surface-layout.flip { direction: ltr; }
```

### Task 6: WhatsApp surface section

**Files:**
- Modify: `kitz-landing.html`

- [ ] **Step 1: Add chat mockup CSS**

```css
.chat-window {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  overflow: hidden;
  max-width: 380px;
}
.chat-header {
  background: var(--bg-card-hover);
  padding: 0.8rem 1rem;
  display: flex; align-items: center; gap: 0.6rem;
  border-bottom: 1px solid var(--border);
}
.chat-avatar {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, #00B894, #00A88A);
  border-radius: var(--radius);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.8rem; color: white;
}
.chat-name { font-weight: 700; font-size: 0.85rem; }
.chat-status { font-size: 0.7rem; color: var(--accent); }
.chat-body {
  padding: 1rem;
  display: flex; flex-direction: column; gap: 0.6rem;
}
.msg {
  max-width: 85%;
  padding: 0.6rem 0.9rem;
  font-size: 0.82rem;
  line-height: 1.45;
  border-radius: var(--radius);
}
.msg-user {
  background: rgba(0,184,148,0.1);
  border: 1px solid rgba(0,184,148,0.15);
  align-self: flex-end;
}
.msg-bot {
  background: var(--bg-card-hover);
  border: 1px solid var(--border);
  align-self: flex-start;
}
.msg-bot strong { color: var(--accent); }
.msg-time {
  font-size: 0.6rem;
  color: var(--text-dim);
  margin-top: 0.2rem;
  text-align: right;
}
```

- [ ] **Step 2: Add WhatsApp section HTML with trilingual text**

Section id `whatsapp`. Left: text (section label `// whatsapp`, headline "Your business in your pocket", body about messaging Kitz, CTA link to WhatsApp). Right: chat mockup with onboarding conversation (Hola → business type → name). All text spans have `.en`, `.es`, `.pt` variants. Chat messages stay in Spanish (they're the demo).

- [ ] **Step 3: Verify in browser**

Check: two-column layout, chat mockup looks like a real chat, messages aligned correctly. Mobile: stacks.

### Task 7: Workspace surface section

**Files:**
- Modify: `kitz-landing.html`

- [ ] **Step 1: Add dashboard mockup CSS**

```css
.dash-window {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  overflow: hidden;
  max-width: 480px;
}
.dash-sidebar {
  width: 48px;
  background: var(--bg-main);
  border-right: 1px solid var(--border);
  padding: 0.8rem 0;
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
}
.dash-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--text-dim);
}
.dash-dot.active { background: var(--accent); box-shadow: 0 0 6px rgba(0,212,170,0.4); }
.dash-main { padding: 1rem; flex: 1; }
.dash-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}
.metric-card {
  background: var(--bg-card-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.8rem;
}
.metric-icon {
  width: 28px; height: 28px;
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}
.metric-value {
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
}
.metric-label {
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-mid);
}
.metric-trend {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--accent);
}
```

- [ ] **Step 2: Add workspace section HTML**

Section id `workspace`. Uses `.surface-layout.flip` for flipped column order. Left: dashboard mockup with sidebar + 3 metric cards (Sales $580 ▲12%, Expenses $320 ▼8%, Profit $260 ▲23%). Right: text (section label `// workspace`, headline "The full picture, in your browser", body, CTA to workspace.kitz.services). Trilingual text.

- [ ] **Step 3: Verify in browser**

Check: flipped layout (mockup left, text right), metrics render, sidebar hint. Mobile: text first, mockup below.

### Task 8: Brain / Terminal surface section

**Files:**
- Modify: `kitz-landing.html`

- [ ] **Step 1: Add terminal mockup CSS**

```css
.term-window {
  background: var(--bg-deep);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  overflow: hidden;
  max-width: 420px;
}
.term-bar {
  background: var(--bg-card);
  padding: 0.6rem 1rem;
  display: flex; align-items: center; gap: 0.5rem;
  border-bottom: 1px solid var(--border);
}
.term-dot {
  width: 10px; height: 10px; border-radius: 50%;
}
.term-title {
  font-family: var(--mono);
  font-size: 0.7rem;
  color: var(--text-dim);
  margin-left: auto;
}
.term-body {
  padding: 1.2rem;
  font-family: var(--mono);
  font-size: 0.78rem;
  line-height: 1.7;
  color: var(--text);
}
.term-body .cmd { color: var(--accent); }
.term-body .dim { color: var(--text-mid); }
.term-body .ok { color: var(--accent); }
```

- [ ] **Step 2: Add brain section HTML**

Section id `brain`. Normal layout (text left, terminal right). Terminal shows: `$ npm install -g kitz`, success message, `$ kitz insights`, weekly report output with sales/expenses/profit and a tip. All terminal content stays English (it's code). Surrounding text is trilingual.

- [ ] **Step 3: Verify in browser**

Check: terminal dots (red/yellow/green), mono font, green commands. Mobile: stacks.

- [ ] **Step 4: Commit three surfaces**

```bash
git add kitz-landing.html
git commit -m "feat: landing page v2 — three product surfaces"
```

---

## Chunk 3: Benefits, CTA, footer, JS, deploy

### Task 9: Benefits grid

**Files:**
- Modify: `kitz-landing.html`

- [ ] **Step 1: Add benefits grid CSS**

3-column grid, gap 1.5rem. Card style: `var(--bg-card)` bg, `var(--border)` border, `var(--radius-card)` radius, 20px padding. Icon 1.8rem, title DM Sans 700 1.1rem, body 0.9rem `var(--text-mid)`. Mobile: single column.

- [ ] **Step 2: Add benefits HTML**

Section id `features`. Section label `// why kitz`, headline "Built for how you actually work". Six cards — Multi-LLM, Multilingual, WhatsApp-native, Your data your control, Real-time insights, Open source. Trilingual titles and descriptions.

- [ ] **Step 3: Verify in browser**

Check: 3-column grid on desktop, single column mobile. Cards look consistent.

### Task 10: Get Started CTA section

**Files:**
- Modify: `kitz-landing.html`

- [ ] **Step 1: Add CTA section CSS**

Full section background `var(--bg-card)`. Three cards side by side, `var(--bg-card-hover)` bg, centered text. Green radial glow behind. CTA buttons full card width, 48px min-height.

- [ ] **Step 2: Add CTA HTML**

Section id `get-started`. Headline "Ready to meet your new business assistant?", subheadline "Pick how you want to start." Three cards: WhatsApp (green filled CTA), Workspace (outline CTA), Brain (outline CTA with `npm install -g kitz` in mono). Trilingual.

- [ ] **Step 3: Verify in browser**

### Task 11: Footer

**Files:**
- Modify: `kitz-landing.html`

- [ ] **Step 1: Add footer CSS**

Three columns, border-top, dark bg. Links use `var(--text-mid)` (NOT textDim for accessibility). Mobile: stacks centered.

- [ ] **Step 2: Add footer HTML**

Logo + tagline left, link groups middle (Product: WhatsApp, Workspace, GitHub / Community: Issues, Academy, Docs), language toggle right. Bottom bar: `© 2026 KitZ — Open Source · MIT License`. Trilingual tagline.

- [ ] **Step 3: Verify in browser**

### Task 12: JavaScript — language toggle and hamburger

**Files:**
- Modify: `kitz-landing.html`

- [ ] **Step 1: Add vanilla JS before closing `</body>`**

```html
<script>
// Language toggle
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.lang;
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // Sync footer toggle too
    document.querySelectorAll(`.lang-btn[data-lang="${lang}"]`).forEach(b => b.classList.add('active'));
  });
});

// Hamburger menu
document.querySelector('.hamburger').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('show');
});

// Close menu on link click
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.remove('show');
  });
});
</script>
```

- [ ] **Step 2: Test language toggle**

Click ES — all English text hides, Spanish shows. Click PT — Portuguese shows. Click EN — back to English. Verify headline, subheadline, buttons, section text all switch.

- [ ] **Step 3: Test hamburger**

Resize to mobile. Click hamburger — menu drops down. Click a link — menu closes, scrolls to section.

- [ ] **Step 4: Commit benefits, CTA, footer, JS**

```bash
git add kitz-landing.html
git commit -m "feat: landing page v2 — benefits, CTA, footer, language toggle"
```

### Task 13: Accessibility pass

**Files:**
- Modify: `kitz-landing.html`

- [ ] **Step 1: Add skip-to-content link**

```html
<a class="skip-link" href="#main-content">Skip to content</a>
```

CSS: visually hidden, visible on `:focus`.

- [ ] **Step 2: Add aria attributes**

- `aria-label="Menu"` on hamburger
- `aria-label="Language"` on lang toggle container
- `role="img" aria-label="..."` on decorative mockups
- `id="main-content"` on hero section

- [ ] **Step 3: Add focus-visible styles**

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

- [ ] **Step 4: Verify footer link contrast**

Ensure footer links use `var(--text-mid)` (`#8B95AD`), not `var(--text-dim)`.

- [ ] **Step 5: Commit**

```bash
git add kitz-landing.html
git commit -m "feat: landing page v2 — accessibility pass"
```

### Task 14: Mobile QA and polish

**Files:**
- Modify: `kitz-landing.html`

- [ ] **Step 1: Check all responsive breakpoints**

Resize browser to 375px (iPhone SE). Verify:
- No horizontal overflow
- Body text >= 16px
- All buttons >= 48px touch target
- Mockups don't overflow container
- Language toggle usable on small screens

- [ ] **Step 2: Fix any overflow or sizing issues found**

- [ ] **Step 3: Verify file size**

Run: `wc -c kitz-landing.html`
Expected: under 100,000 bytes

- [ ] **Step 4: Validate HTML**

Check no unclosed tags, proper nesting, valid attributes.

- [ ] **Step 5: Commit**

```bash
git add kitz-landing.html
git commit -m "fix: landing page v2 — mobile QA polish"
```

### Task 15: Deploy

**Files:**
- Modify: `static_dist/index.html`
- Modify: `index.html`

- [ ] **Step 1: Copy to deployment locations**

```bash
cp kitz-landing.html static_dist/index.html
cp kitz-landing.html index.html
```

- [ ] **Step 2: Final commit**

```bash
git add kitz-landing.html static_dist/index.html index.html
git commit -m "feat: KitZ(OS) landing page v2 — brand-aligned, SMB-first"
```

- [ ] **Step 3: Push**

```bash
git push origin main
```

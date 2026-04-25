# Affirm Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Affirm Chrome extension with 10 rich themes (6 dark, 4 light), DM Serif Display font for quotes, two sound engine bug fixes, auto-rotation setting, and ~80 rewritten affirmations.

**Architecture:** Four files change — `affirmations.js` (content only), `newtab.css` (10 theme variable blocks + swatch styles + rotation styles), `newtab.html` (font URL, default theme, 10 swatches, rotation UI), and `newtab.js` (sound fixes, theme-aware pill colors, rotation logic). No new files created. No build step — files are served directly by the extension runtime.

**Tech Stack:** Vanilla JS, CSS custom properties, Web Audio API, Chrome Extension Manifest V3, localStorage.

---

## File Map

| File | What changes |
|---|---|
| `affirmations.js` | Full replacement — ~80 new affirmations in 4 voices |
| `newtab.css` | 10 `[data-theme]` blocks, updated `--font-serif`, swatch preview classes, rotation CSS, `--btn-bg`/`--btn-text` per theme, `--modal-overlay` per theme |
| `newtab.html` | Google Fonts URL (DM Serif Display), `data-theme="ocean"` default, 10 theme swatches, auto-rotate drawer section |
| `newtab.js` | `stopSound()` race fix, tone gain fix, `DARK_THEMES` set, `CATEGORY_COLORS` theme-aware logic, `THEMES` array, `getData()` defaults, `setRotation()`, `applyRotation()`, `init()` wiring |

---

## Task 1: Fix Sound Bugs

**Files:**
- Modify: `newtab.js` (lines 178–222)

### Bug 1 — Rain stops immediately

The `stopSound()` function captures `nodesChain` by reference in its closure. When `applySound()` calls `stopSound()` then immediately `startSound()`, the new sound nodes are pushed into `nodesChain` before the 900ms timeout fires — so the timeout stops the new nodes, not the old ones.

- [ ] **Step 1: Replace `stopSound()` with the snapshot fix**

In `newtab.js`, replace the current `stopSound` function (lines 178–181):

```js
function stopSound() {
  if (gainNode) gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.4);
  setTimeout(() => { nodesChain.forEach(n => { try { n.stop?.(); n.disconnect(); } catch {} }); nodesChain = []; }, 900);
}
```

With:

```js
function stopSound() {
  const chainToStop = [...nodesChain];   // snapshot — don't capture by reference
  nodesChain = [];
  if (gainNode) gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.4);
  setTimeout(() => {
    chainToStop.forEach(n => { try { n.stop?.(); n.disconnect(); } catch {} });
  }, 900);
}
```

### Bug 2 — Soft tone inaudible

Individual oscillator gains are `0.01 / (i+1)` — values of 0.01, 0.005, 0.003. These are inaudible through the 0.2 master gain ramp.

- [ ] **Step 2: Fix oscillator gain in `startSound`**

In `newtab.js` inside the `type === "tone"` block (line 217), change:

```js
g.gain.value = 0.01 / (i + 1);
```

To:

```js
g.gain.value = 0.4 / (i + 1);
```

- [ ] **Step 3: Verify sound fixes manually**

Open the extension. In settings drawer → Sound → select **Rain**. The sound should play continuously without cutting out. Switch to **Soft tone** — it should now be clearly audible. Switch to **None** — sound stops with a fade.

- [ ] **Step 4: Commit**

```bash
git add affirmation-newtab/newtab.js
git commit -m "fix: sound engine — rain race condition + soft tone gain

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Rewrite Affirmations

**Files:**
- Modify: `affirmations.js` (full replacement of `AFFIRMATIONS` array)

80 affirmations across 4 voices (Poetic, Commanding, Philosophical, Gentle & Real) and 9 categories. Same `{ text, category }` shape — no structural changes.

- [ ] **Step 1: Replace `AFFIRMATIONS` array in `affirmations.js`**

Replace the entire contents of `affirmations.js` with:

```js
const AFFIRMATIONS = [
  // ── Confidence ────────────────────────────────────────────────────
  { text: "Stop waiting to feel ready. Begin.", category: "Confidence" },
  { text: "The mountain does not apologize for its height. Neither should you.", category: "Confidence" },
  { text: "Some people wait for the wind. You are learning to be the wind.", category: "Confidence" },
  { text: "Confidence is not certainty. It is choosing to move without it.", category: "Confidence" },
  { text: "The only thing standing between you and the goal is the next action.", category: "Confidence" },
  { text: "One decision. Right now. Forward.", category: "Confidence" },
  { text: "You have survived every hard day so far. You will survive this one too.", category: "Confidence" },
  { text: "Your instincts are sharper than your doubts. Trust them.", category: "Confidence" },
  { text: "You do not have to roar to be powerful. Quiet strength builds empires.", category: "Confidence" },

  // ── Growth ────────────────────────────────────────────────────────
  { text: "Even rivers carve canyons — not by force, but by persistence.", category: "Growth" },
  { text: "Be the version of yourself you keep promising.", category: "Growth" },
  { text: "Progress is not linear. Doubt it, and you will miss the exponential.", category: "Growth" },
  { text: "Every expert you admire was once a beginner who refused to be embarrassed by the gap.", category: "Growth" },
  { text: "You don't have to have it all figured out. You just have to take one step.", category: "Growth" },
  { text: "The life you want is on the other side of the discomfort you keep avoiding.", category: "Growth" },
  { text: "You cannot pour from an empty vessel — but you also cannot fill one that refuses to open.", category: "Growth" },
  { text: "Small acts done daily are the architecture of extraordinary lives.", category: "Growth" },
  { text: "Grow at the pace your roots require. What is deep takes time.", category: "Growth" },

  // ── Self-Worth ────────────────────────────────────────────────────
  { text: "You are not a rough draft. You are the final version, still being written.", category: "Self-Worth" },
  { text: "You are allowed to want things. Wanting is not weakness.", category: "Self-Worth" },
  { text: "Being a work in progress does not mean being broken.", category: "Self-Worth" },
  { text: "Quit shrinking to fit spaces you've outgrown.", category: "Self-Worth" },
  { text: "You are already enough. Becoming more is a bonus, not a requirement.", category: "Self-Worth" },
  { text: "Ask for help. Asking is strength, not surrender.", category: "Self-Worth" },
  { text: "You are allowed to change your mind, your path, your plan.", category: "Self-Worth" },
  { text: "You do not need to earn rest. You are not a machine.", category: "Self-Worth" },
  { text: "Your worth does not fluctuate with your productivity.", category: "Self-Worth" },

  // ── Resilience ────────────────────────────────────────────────────
  { text: "Let the fire in you outlast every storm that tries to drown it.", category: "Resilience" },
  { text: "You bloom in the places others said were too dark to grow.", category: "Resilience" },
  { text: "Hard is not the same as impossible.", category: "Resilience" },
  { text: "Your excuses cannot outlast your ability.", category: "Resilience" },
  { text: "Every version of you that ever doubted itself was still brave enough to keep going.", category: "Resilience" },
  { text: "What you call a setback, the future may call a foundation.", category: "Resilience" },
  { text: "Not every day will feel like progress. Some days, surviving is the work.", category: "Resilience" },
  { text: "You don't have to be fearless. You just have to move one inch past the fear.", category: "Resilience" },
  { text: "The bend in the road is not the end of the road — unless you refuse to turn.", category: "Resilience" },

  // ── Focus ─────────────────────────────────────────────────────────
  { text: "Do the work. Everything else is noise.", category: "Focus" },
  { text: "Think less. Move more. Trust more.", category: "Focus" },
  { text: "You know what to do. Now do it.", category: "Focus" },
  { text: "The quietest rooms often hold the loudest thinking.", category: "Focus" },
  { text: "Time does not run out. Priorities do.", category: "Focus" },
  { text: "One task. Full presence. That is enough.", category: "Focus" },
  { text: "Discipline is just choosing the version of you that shows up.", category: "Focus" },
  { text: "What you repeat becomes who you are. Repeat intentionally.", category: "Focus" },
  { text: "The task in front of you is the whole world right now. Nothing else exists.", category: "Focus" },

  // ── Peace ─────────────────────────────────────────────────────────
  { text: "You are the lighthouse in your own storm.", category: "Peace" },
  { text: "To rest is not to fall behind. It is to remember why you are running.", category: "Peace" },
  { text: "It's okay to be tired. Rest is not giving up.", category: "Peace" },
  { text: "Your pace is not your problem. Comparison is.", category: "Peace" },
  { text: "You are not behind. You are on a different road, headed somewhere real.", category: "Peace" },
  { text: "Still water runs deep. So do you.", category: "Peace" },
  { text: "The world keeps moving whether you panic or breathe. Choose breath.", category: "Peace" },
  { text: "Let go of what was supposed to happen and meet what is.", category: "Peace" },
  { text: "Peace is not the absence of noise. It is the decision not to be moved by it.", category: "Peace" },

  // ── Vision ────────────────────────────────────────────────────────
  { text: "You were not built to shrink. You were built to expand into every room you enter.", category: "Vision" },
  { text: "Carry your dreams the way the ocean carries ships — with everything you have.", category: "Vision" },
  { text: "Most regrets are not about what you tried. They are about what you didn't.", category: "Vision" },
  { text: "The seeds you plant in silence will flower when the world least expects it.", category: "Vision" },
  { text: "The life you are building is bigger than the day you are having.", category: "Vision" },
  { text: "Where you are going requires a version of you that does not exist yet. Build them.", category: "Vision" },
  { text: "Stop editing your ambition to fit other people's imagination.", category: "Vision" },
  { text: "The future belongs to those who work for it before it arrives.", category: "Vision" },
  { text: "You are not waiting for your life to begin. It already has. Steer.", category: "Vision" },

  // ── Purpose ───────────────────────────────────────────────────────
  { text: "Get up. The world is waiting for what only you can give.", category: "Purpose" },
  { text: "Today is not a rehearsal. Show up.", category: "Purpose" },
  { text: "Your life is a canvas and every choice is a brushstroke. Make it deliberate.", category: "Purpose" },
  { text: "It is enough to do a little good today, even if it goes unseen.", category: "Purpose" },
  { text: "You were made to contribute something only you can contribute.", category: "Purpose" },
  { text: "Work like it matters. Because it does.", category: "Purpose" },
  { text: "The world does not need a copy of someone else. It needs the unedited you.", category: "Purpose" },
  { text: "Meaning is not found. It is made, decision by decision.", category: "Purpose" },

  // ── Abundance ─────────────────────────────────────────────────────
  { text: "You are not in competition with anyone. You are in collaboration with your potential.", category: "Abundance" },
  { text: "What flows through open hands always exceeds what is hoarded in fists.", category: "Abundance" },
  { text: "There is enough room at the top for everyone who climbs with integrity.", category: "Abundance" },
  { text: "Generosity is a form of power. Use it freely.", category: "Abundance" },
  { text: "Your success is not borrowed from someone else's share.", category: "Abundance" },
  { text: "Abundance begins the moment you stop believing there is not enough.", category: "Abundance" },
  { text: "Give first. The return has never failed those who lead with open hands.", category: "Abundance" },
  { text: "You attract what you believe you deserve. Start deserving more.", category: "Abundance" },
  { text: "Celebrate others fiercely. Joy shared multiplies.", category: "Abundance" },
];
```

- [ ] **Step 2: Verify in browser**

Reload the extension. Click the refresh button several times and confirm affirmations cycle through the new text. Open Settings → Manage affirmations — the list should show the new affirmations.

- [ ] **Step 3: Commit**

```bash
git add affirmation-newtab/affirmations.js
git commit -m "content: rewrite 80 affirmations across 4 voices and 9 categories

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Theme CSS

**Files:**
- Modify: `newtab.css`

Adds 10 `[data-theme]` blocks with full CSS custom property sets, updates the font variable, replaces swatch preview colours, adds auto-rotate CSS, and sets theme-aware button and modal variables.

- [ ] **Step 1: Replace `:root` font variable**

In `newtab.css`, change line 13:

```css
--font-serif:   'Playfair Display', 'Newsreader', Georgia, serif;
```

To:

```css
--font-serif:   'DM Serif Display', Georgia, serif;
```

- [ ] **Step 2: Add default theme variables and `--modal-overlay` + `--btn-bg` / `--btn-text` to `:root`**

Add these lines to the `:root` block (after `--ease-out`):

```css
--accent:        #111111;
--accent-bg:     #F0F0F0;
--modal-overlay: rgba(251,251,250,0.88);
--btn-bg:        #111111;
--btn-text:      #FFFFFF;
```

- [ ] **Step 3: Replace all `[data-theme]` blocks**

Remove the existing 5 light theme blocks (lines 19–23) and replace with all 10 new theme definitions:

```css
/* ── Dark themes ── */
[data-theme="ocean"] {
  --bg:            linear-gradient(160deg, #0F2027 0%, #203A43 50%, #2C5364 100%);
  --bg2:           rgba(255,255,255,0.08);
  --surface:       rgba(255,255,255,0.06);
  --border:        rgba(91,184,196,0.18);
  --text:          #B8E3E9;
  --text-2:        rgba(184,227,233,0.55);
  --text-3:        rgba(184,227,233,0.3);
  --accent:        #5BB8C4;
  --accent-bg:     rgba(91,184,196,0.15);
  --modal-overlay: rgba(9,18,25,0.92);
  --btn-bg:        #5BB8C4;
  --btn-text:      #0F2027;
}
[data-theme="forest"] {
  --bg:            linear-gradient(150deg, #0A1F0F 0%, #1A3A20 60%, #243D28 100%);
  --bg2:           rgba(255,255,255,0.07);
  --surface:       rgba(255,255,255,0.05);
  --border:        rgba(125,200,116,0.18);
  --text:          #A8D4A0;
  --text-2:        rgba(168,212,160,0.55);
  --text-3:        rgba(168,212,160,0.3);
  --accent:        #7DC874;
  --accent-bg:     rgba(125,200,116,0.15);
  --modal-overlay: rgba(8,20,10,0.92);
  --btn-bg:        #7DC874;
  --btn-text:      #0A1F0F;
}
[data-theme="cosmic"] {
  --bg:            linear-gradient(150deg, #0D0820 0%, #1A1040 60%, #241858 100%);
  --bg2:           rgba(255,255,255,0.07);
  --surface:       rgba(255,255,255,0.06);
  --border:        rgba(155,127,224,0.18);
  --text:          #C4B0F0;
  --text-2:        rgba(196,176,240,0.55);
  --text-3:        rgba(196,176,240,0.3);
  --accent:        #9B7FE0;
  --accent-bg:     rgba(155,127,224,0.15);
  --modal-overlay: rgba(8,5,20,0.92);
  --btn-bg:        #9B7FE0;
  --btn-text:      #0D0820;
}
[data-theme="ember"] {
  --bg:            linear-gradient(150deg, #1A0E00 0%, #2E1A00 50%, #3D2200 100%);
  --bg2:           rgba(255,255,255,0.07);
  --surface:       rgba(255,255,255,0.05);
  --border:        rgba(212,147,42,0.18);
  --text:          #E8C08A;
  --text-2:        rgba(232,192,138,0.55);
  --text-3:        rgba(232,192,138,0.3);
  --accent:        #D4932A;
  --accent-bg:     rgba(212,147,42,0.15);
  --modal-overlay: rgba(18,10,0,0.92);
  --btn-bg:        #D4932A;
  --btn-text:      #1A0E00;
}
[data-theme="roseNoir"] {
  --bg:            linear-gradient(150deg, #1F0A10 0%, #3A1520 50%, #4A1E2A 100%);
  --bg2:           rgba(255,255,255,0.07);
  --surface:       rgba(255,255,255,0.05);
  --border:        rgba(212,96,128,0.18);
  --text:          #E8A0B0;
  --text-2:        rgba(232,160,176,0.55);
  --text-3:        rgba(232,160,176,0.3);
  --accent:        #D46080;
  --accent-bg:     rgba(212,96,128,0.15);
  --modal-overlay: rgba(20,5,10,0.92);
  --btn-bg:        #D46080;
  --btn-text:      #1F0A10;
}
[data-theme="charcoal"] {
  --bg:            linear-gradient(150deg, #0D0D0D 0%, #1A1A1A 60%, #222222 100%);
  --bg2:           rgba(255,255,255,0.07);
  --surface:       rgba(255,255,255,0.05);
  --border:        rgba(184,168,136,0.18);
  --text:          #E8E0D4;
  --text-2:        rgba(232,224,212,0.55);
  --text-3:        rgba(232,224,212,0.3);
  --accent:        #B8A888;
  --accent-bg:     rgba(184,168,136,0.15);
  --modal-overlay: rgba(8,8,8,0.92);
  --btn-bg:        #B8A888;
  --btn-text:      #0D0D0D;
}

/* ── Light themes ── */
[data-theme="parchment"] {
  --bg:            #FDF9F0;
  --bg2:           #FAF4E0;
  --surface:       #FFFFFF;
  --border:        #E8DFC8;
  --text:          #2C1810;
  --text-2:        #7A6548;
  --text-3:        #B0A080;
  --accent:        #956400;
  --accent-bg:     #FBF3DB;
  --modal-overlay: rgba(253,249,240,0.88);
  --btn-bg:        #2C1810;
  --btn-text:      #FFFFFF;
}
[data-theme="lavender"] {
  --bg:            #F5F0FB;
  --bg2:           #EDE5F8;
  --surface:       #FFFFFF;
  --border:        #DDD5F0;
  --text:          #1E1030;
  --text-2:        #6B5888;
  --text-3:        #A090C0;
  --accent:        #7B5EA7;
  --accent-bg:     #EDE5F8;
  --modal-overlay: rgba(245,240,251,0.88);
  --btn-bg:        #1E1030;
  --btn-text:      #FFFFFF;
}
[data-theme="golden"] {
  --bg:            #FEF3E8;
  --bg2:           #FDECD8;
  --surface:       #FFFFFF;
  --border:        #F0D8B8;
  --text:          #2A1800;
  --text-2:        #7A5030;
  --text-3:        #B08060;
  --accent:        #C4702A;
  --accent-bg:     #FDECD8;
  --modal-overlay: rgba(254,243,232,0.88);
  --btn-bg:        #2A1800;
  --btn-text:      #FFFFFF;
}
[data-theme="steel"] {
  --bg:            #EFF3F8;
  --bg2:           #E4EAF5;
  --surface:       #FFFFFF;
  --border:        #D0DCE8;
  --text:          #1A2535;
  --text-2:        #4A6080;
  --text-3:        #8098B0;
  --accent:        #3A6EA8;
  --accent-bg:     #E1EEF8;
  --modal-overlay: rgba(239,243,248,0.88);
  --btn-bg:        #1A2535;
  --btn-text:      #FFFFFF;
}
```

- [ ] **Step 4: Update modal overlay to use CSS variable**

In `newtab.css`, find the `.modal` rule (around line 427) and change:

```css
background: rgba(251,251,250,0.85);
```

To:

```css
background: var(--modal-overlay);
```

- [ ] **Step 5: Update `.btn-primary` to use CSS variables**

Find the `.btn-primary` rule and change:

```css
.btn-primary { background: #111111; color: #FFFFFF; }
```

To:

```css
.btn-primary { background: var(--btn-bg); color: var(--btn-text); }
```

- [ ] **Step 6: Replace swatch preview classes**

Remove the 6 old preview classes (`.midnight-preview` through `.slate-preview`) and replace with:

```css
.ocean-preview    { background: linear-gradient(135deg, #0F2027, #2C5364); }
.forest-preview   { background: linear-gradient(135deg, #0A1F0F, #243D28); }
.cosmic-preview   { background: linear-gradient(135deg, #0D0820, #241858); }
.ember-preview    { background: linear-gradient(135deg, #1A0E00, #3D2200); }
.roseNoir-preview { background: linear-gradient(135deg, #1F0A10, #4A1E2A); }
.charcoal-preview { background: linear-gradient(135deg, #0D0D0D, #222222); }
.parchment-preview{ background: #FDF9F0; }
.lavender-preview { background: #F5F0FB; }
.golden-preview   { background: #FEF3E8; }
.steel-preview    { background: #EFF3F8; }
```

- [ ] **Step 7: Update theme grid to 5 columns**

Change `.theme-grid`:

```css
.theme-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}
```

- [ ] **Step 8: Add auto-rotate CSS**

After the `.sound-opt` rules, add:

```css
/* Auto-rotate options */
.rotate-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.rotate-opt {
  flex: 1 1 calc(50% - 3px);
  padding: 8px 6px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: none;
  color: var(--text-2);
  font-size: 12px;
  font-family: var(--font-sans);
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
  text-align: center;
}
.rotate-opt:hover  { border-color: #B0ADA8; color: var(--text); }
.rotate-opt.active { border-color: var(--text); color: var(--text); background: var(--bg2); }

.custom-rotate-row {
  display: flex;
  gap: 8px;
  margin-top: 6px;
  align-items: center;
}
.custom-rotate-row.hidden { display: none; }
.custom-rotate-row .habit-input { flex: 1; }
.custom-rotate-row .btn-primary { white-space: nowrap; padding: 9px 14px; }
```

- [ ] **Step 9: Verify CSS in browser**

Open extension on a new tab. The UI should look visually identical to before (still on default theme). No broken styles.

- [ ] **Step 10: Commit**

```bash
git add affirmation-newtab/newtab.css
git commit -m "style: 10 theme CSS variables, DM Serif Display, rotation UI styles

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Update HTML

**Files:**
- Modify: `newtab.html`

- [ ] **Step 1: Replace Google Fonts URL**

In `newtab.html`, find the Fonts `<link>` tag (line 9) and replace:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=Playfair+Display:ital@0;1&display=swap" rel="stylesheet" />
```

With:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
```

- [ ] **Step 2: Update default theme attribute**

Change line 2:

```html
<html lang="en" data-theme="midnight">
```

To:

```html
<html lang="en" data-theme="ocean">
```

- [ ] **Step 3: Replace theme swatches**

Find the `<div class="theme-grid">` block (lines 50–76) and replace it entirely with:

```html
<div class="theme-grid">
  <button class="theme-swatch active" data-theme="ocean" title="Ocean Depth">
    <span class="swatch-preview ocean-preview"></span>
    <span class="swatch-name">Ocean</span>
  </button>
  <button class="theme-swatch" data-theme="forest" title="Midnight Forest">
    <span class="swatch-preview forest-preview"></span>
    <span class="swatch-name">Forest</span>
  </button>
  <button class="theme-swatch" data-theme="cosmic" title="Cosmic Night">
    <span class="swatch-preview cosmic-preview"></span>
    <span class="swatch-name">Cosmic</span>
  </button>
  <button class="theme-swatch" data-theme="ember" title="Ember">
    <span class="swatch-preview ember-preview"></span>
    <span class="swatch-name">Ember</span>
  </button>
  <button class="theme-swatch" data-theme="roseNoir" title="Rose Noir">
    <span class="swatch-preview roseNoir-preview"></span>
    <span class="swatch-name">Rose</span>
  </button>
  <button class="theme-swatch" data-theme="charcoal" title="Charcoal">
    <span class="swatch-preview charcoal-preview"></span>
    <span class="swatch-name">Charcoal</span>
  </button>
  <button class="theme-swatch" data-theme="parchment" title="Warm Parchment">
    <span class="swatch-preview parchment-preview"></span>
    <span class="swatch-name">Parchment</span>
  </button>
  <button class="theme-swatch" data-theme="lavender" title="Lavender Morning">
    <span class="swatch-preview lavender-preview"></span>
    <span class="swatch-name">Lavender</span>
  </button>
  <button class="theme-swatch" data-theme="golden" title="Golden Hour">
    <span class="swatch-preview golden-preview"></span>
    <span class="swatch-name">Golden</span>
  </button>
  <button class="theme-swatch" data-theme="steel" title="Steel Blue">
    <span class="swatch-preview steel-preview"></span>
    <span class="swatch-name">Steel</span>
  </button>
</div>
```

- [ ] **Step 4: Add auto-rotate section to settings drawer**

Find the Sound `<div class="drawer-section">` block (the one with `<div class="sound-options">`). After its closing `</div>`, insert the auto-rotate section — it goes between Sound and Affirmations:

```html
<div class="drawer-section">
  <div class="drawer-label">Auto-rotate</div>
  <div class="rotate-options">
    <button class="rotate-opt active" data-rotate="0">Off</button>
    <button class="rotate-opt" data-rotate="300000">5 min</button>
    <button class="rotate-opt" data-rotate="600000">10 min</button>
    <button class="rotate-opt" data-rotate="1800000">30 min</button>
    <button class="rotate-opt" data-rotate="custom">Custom</button>
  </div>
  <div id="custom-rotate-row" class="custom-rotate-row hidden">
    <input id="custom-rotate-input" class="habit-input" type="number" min="1" max="120"
      placeholder="Minutes (1–120)" />
    <button id="custom-rotate-btn" class="btn-primary">Set</button>
  </div>
</div>
```

- [ ] **Step 5: Verify HTML in browser**

Reload the extension. The new tab should open on the **Ocean Depth** dark teal gradient by default. The settings drawer should show 10 theme swatches in 2 rows of 5, and an Auto-rotate section below Sound.

- [ ] **Step 6: Commit**

```bash
git add affirmation-newtab/newtab.html
git commit -m "feat: 10 theme swatches, auto-rotate drawer section, DM Serif Display font

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Update JS — Themes

**Files:**
- Modify: `newtab.js`

Updates the `THEMES` constant, default theme in `getData()`, adds `DARK_THEMES` set, and makes category pill colours theme-aware.

- [ ] **Step 1: Update `THEMES` constant**

Change line 4:

```js
const THEMES = ["midnight","chalk","cream","blush","sage","slate"];
```

To:

```js
const THEMES = ["ocean","forest","cosmic","ember","roseNoir","charcoal","parchment","lavender","golden","steel"];
```

- [ ] **Step 2: Add `DARK_THEMES` set after `THEMES`**

After the `THEMES` line, add:

```js
const DARK_THEMES = new Set(["ocean","forest","cosmic","ember","roseNoir","charcoal"]);
```

- [ ] **Step 3: Update `getData()` default theme**

In `getData()`, change:

```js
theme: d.theme ?? "midnight",
```

To:

```js
theme: d.theme ?? "ocean",
```

Also update the catch fallback on the same function — the last return object has `theme: "midnight"`, change it to `"ocean"`:

```js
} catch { return { habits: DEFAULT_HABITS, checks: {}, streak: 0, lastActiveDay: null, affirmationOffset: 0, theme: "ocean", sound: "none", customAffirmations: [], deletedBuiltinIdx: [] }; }
```

- [ ] **Step 4: Update `CATEGORY_COLORS` for light themes and add a helper**

The existing `CATEGORY_COLORS` is used for light themes. For dark themes, pills use the theme accent. Add a helper function after the `CATEGORY_COLORS` declaration:

```js
function getPillStyle(category, theme) {
  if (DARK_THEMES.has(theme)) {
    return { bg: 'var(--accent-bg)', text: 'var(--accent)' };
  }
  return CATEGORY_COLORS[category] || CATEGORY_COLORS["Custom"];
}
```

- [ ] **Step 5: Update `renderAffirmation` to use `getPillStyle`**

In `renderAffirmation(data)`, replace:

```js
const col = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Custom"];
pill.style.background = col.bg;
pill.style.color      = col.text;
```

With:

```js
const col = getPillStyle(item.category, data.theme);
pill.style.background = col.bg;
pill.style.color      = col.text;
```

- [ ] **Step 6: Update `renderAffirmList` to use `getPillStyle`**

In `renderAffirmList(data)`, inside the `AFFIRMATIONS.forEach` block, replace:

```js
const col = CATEGORY_COLORS[item.category] || CATEGORY_COLORS["Custom"];
```

With:

```js
const col = getPillStyle(item.category, data.theme);
```

Also update the custom affirmations section in `renderAffirmList` — the hardcoded custom pill style already uses neutral values so leave it as-is.

- [ ] **Step 7: Verify theme switching**

Open extension → Settings → click each dark theme swatch. Confirm:
- Background gradient changes
- Category pill colour uses the theme accent (not the old pastel)
- Clock, affirmation text, habits all readable

Click each light theme swatch. Confirm category pills show category-specific pastels.

- [ ] **Step 8: Commit**

```bash
git add affirmation-newtab/newtab.js
git commit -m "feat: theme-aware pill colours, DARK_THEMES set, default ocean theme

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Auto-Rotation JS

**Files:**
- Modify: `newtab.js`

Adds rotation state to storage, `setRotation()` function, and wires up all three triggers (settings, refresh button reset, visibilitychange).

- [ ] **Step 1: Add `rotation` field to `getData()`**

In `getData()`, add to the returned object:

```js
rotation: d.rotation ?? 0,
```

Also add `rotation: 0` to the catch fallback return.

- [ ] **Step 2: Add rotation module variables**

After the sound variables (`let audioCtx = null, gainNode = null, nodesChain = [];`), add:

```js
const ROTATION_PRESETS = [0, 300000, 600000, 1800000];
let rotationInterval = null;
```

- [ ] **Step 3: Add `setRotation()` function**

After the `applySound()` function, add:

```js
function setRotation(ms) {
  clearInterval(rotationInterval);
  rotationInterval = null;

  if (ms > 0) {
    rotationInterval = setInterval(() => {
      const d = getData();
      d.affirmationOffset = (d.affirmationOffset || 0) + 1;
      saveData(d);
      animateAffirmation(d);
    }, ms);
  }

  const isCustom = ms > 0 && !ROTATION_PRESETS.includes(ms);
  document.querySelectorAll('.rotate-opt').forEach(btn => {
    const val = btn.dataset.rotate;
    const active = val === 'custom'
      ? isCustom
      : parseInt(val) === ms;
    btn.classList.toggle('active', active);
  });

  const customRow = document.getElementById('custom-rotate-row');
  if (customRow) {
    customRow.classList.toggle('hidden', !isCustom);
    if (isCustom) {
      document.getElementById('custom-rotate-input').value = Math.round(ms / 60000);
    }
  }
}
```

- [ ] **Step 4: Wire rotation into `init()`**

Inside `init()`, after the `renderStreak(data)` call, add the rotation initialisation:

```js
// Restore rotation
setRotation(data.rotation || 0);
```

- [ ] **Step 5: Wire rotation preset buttons**

Inside `init()`, after the sound-options event listeners block, add:

```js
// Auto-rotate preset buttons
document.querySelectorAll('.rotate-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.dataset.rotate;
    if (val === 'custom') {
      // Just reveal the input — don't set interval yet
      document.getElementById('custom-rotate-row').classList.remove('hidden');
      document.getElementById('custom-rotate-input').focus();
      document.querySelectorAll('.rotate-opt').forEach(b =>
        b.classList.toggle('active', b.dataset.rotate === 'custom'));
      return;
    }
    const ms = parseInt(val);
    const d  = getData();
    d.rotation = ms;
    saveData(d);
    setRotation(ms);
  });
});

// Custom interval Set button
document.getElementById('custom-rotate-btn')?.addEventListener('click', () => {
  const mins = parseInt(document.getElementById('custom-rotate-input').value, 10);
  if (!mins || mins < 1 || mins > 120) return;
  const ms = mins * 60000;
  const d  = getData();
  d.rotation = ms;
  saveData(d);
  setRotation(ms);
});
```

- [ ] **Step 6: Reset rotation interval on manual refresh**

Find the existing `refresh-btn` click listener in `init()`:

```js
document.getElementById("refresh-btn").addEventListener("click", () => {
  const data = getData();
  data.affirmationOffset = (data.affirmationOffset || 0) + 1;
  saveData(data); animateAffirmation(data);
});
```

Replace with:

```js
document.getElementById("refresh-btn").addEventListener("click", () => {
  const data = getData();
  data.affirmationOffset = (data.affirmationOffset || 0) + 1;
  saveData(data);
  animateAffirmation(data);
  // Reset rotation timer so it counts from now
  if (data.rotation > 0) setRotation(data.rotation);
});
```

- [ ] **Step 7: Reset rotation on tab visibility**

At the end of `init()`, before the closing `}`, add:

```js
// Reset rotation when tab becomes visible again
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    const d = getData();
    if ((d.rotation || 0) > 0) setRotation(d.rotation);
  }
});
```

- [ ] **Step 8: Verify auto-rotation**

Open extension → Settings → Auto-rotate → select **5 min**. Close settings. Within 5 minutes (or test with a shorter interval via Custom → set to 1 minute) the affirmation should fade to the next one automatically. Manually refreshing should reset the timer.

- [ ] **Step 9: Commit**

```bash
git add affirmation-newtab/newtab.js
git commit -m "feat: auto-rotation with presets, custom interval, and visibility reset

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Final Verification Checklist

- [ ] Open extension on a new tab → Ocean Depth gradient background loads by default
- [ ] Affirmation text renders in DM Serif Display italic
- [ ] Click through 5+ affirmations — all new, no old ones visible
- [ ] Settings → Theme → click all 10 swatches, verify gradient/background changes correctly
- [ ] Settings → Sound → Rain plays continuously, doesn't stop in first second
- [ ] Settings → Sound → Soft tone is clearly audible
- [ ] Settings → Auto-rotate → set to 1 min (Custom), affirmation changes automatically
- [ ] Dark themes show accent-coloured category pills; light themes show category-specific pastels
- [ ] Habit editor modal opens and reads correctly on dark themes
- [ ] Manage affirmations modal opens and reads correctly on dark themes
- [ ] Reload tab — theme and rotation preference persists from localStorage

---

## Spec Coverage Check

| Spec section | Tasks |
|---|---|
| 10 themes (6 dark, 4 light) | Task 3, 4, 5 |
| DM Serif Display font | Task 3, 4 |
| Sound fix — rain race condition | Task 1 |
| Sound fix — soft tone gain | Task 1 |
| Auto-rotation UI + behaviour | Task 4, 6 |
| 80 affirmations in 4 voices | Task 2 |
| Default theme = ocean | Task 4, 5 |
| Modal overlay adapts to dark themes | Task 3 |
| btn-primary adapts to dark themes | Task 3 |

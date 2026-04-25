# Affirm Redesign — Design Spec
**Date:** 2026-04-25
**Project:** affirmation-newtab (Chrome Extension)

---

## Overview

A focused upgrade to the Affirm new tab Chrome extension covering four areas: visual redesign (10 themes, new font, new default), two sound engine bug fixes, a new affirmation auto-rotation setting, and a full rewrite of ~80 affirmations in four distinct voices.

---

## 1. Themes

10 themes total. Ocean Depth replaces Bone/Midnight as the default. The settings drawer theme grid expands from 6 to 10 swatches.

### Dark themes (6)

| Key | Name | Background | Accent / text color |
|---|---|---|---|
| `ocean` | Ocean Depth ★ default | `linear-gradient(160deg, #0F2027, #203A43, #2C5364)` | `#5BB8C4` / `#B8E3E9` |
| `forest` | Midnight Forest | `linear-gradient(150deg, #0A1F0F, #1A3A20, #243D28)` | `#7DC874` / `#A8D4A0` |
| `cosmic` | Cosmic Night | `linear-gradient(150deg, #0D0820, #1A1040, #241858)` | `#9B7FE0` / `#C4B0F0` |
| `ember` | Ember | `linear-gradient(150deg, #1A0E00, #2E1A00, #3D2200)` | `#D4932A` / `#E8C08A` |
| `roseNoir` | Rose Noir | `linear-gradient(150deg, #1F0A10, #3A1520, #4A1E2A)` | `#D46080` / `#E8A0B0` |
| `charcoal` | Charcoal | `linear-gradient(150deg, #0D0D0D, #1A1A1A, #222222)` | `#B8A888` / `#E8E0D4` |

### Light themes (4)

| Key | Name | Background | Accent color |
|---|---|---|---|
| `parchment` | Warm Parchment | `#FDF9F0` | `#956400` (amber) |
| `lavender` | Lavender Morning | `#F5F0FB` | `#7B5EA7` (soft purple) |
| `golden` | Golden Hour | `#FEF3E8` | `#C4702A` (peach/amber) |
| `steel` | Steel Blue | `#EFF3F8` | `#3A6EA8` (cool slate) |

### CSS implementation

- Each theme defined via `[data-theme="KEY"]` custom property block on `:root` or `html`
- Properties: `--bg`, `--surface`, `--border`, `--text`, `--text-2`, `--accent`, `--accent-bg`
- `data-theme` attribute set on `<html>` element
- Default: `data-theme="ocean"` in `newtab.html`
- Persisted to `localStorage` key `affirm_theme`

### Settings drawer

- Theme grid expands to 10 swatches (2 rows of 5, or responsive wrap)
- Each swatch shows theme name below the color preview circle
- Active swatch gets a teal ring indicator

---

## 2. Typography

**Affirmation quote text only** (`blockquote#affirmation`):
- Font: `DM Serif Display`, italic
- Google Fonts URL: `https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap`
- Replace existing `Playfair Display` import and CSS reference

**Clock, UI, habits, buttons, labels** — unchanged (`Helvetica Neue`, `-apple-system`, system sans-serif).

---

## 3. Sound Engine Bug Fixes

### Bug 1 — Rain / brown noise stops immediately

**Root cause:** `stopSound()` captures `nodesChain` by reference in a closure. When `applySound()` calls `stopSound()` then immediately `startSound()`, new nodes are pushed into `nodesChain`. The 900ms timeout from the prior `stopSound()` call then stops the newly created nodes, not the old ones.

**Fix — `newtab.js`, `stopSound()` function:**
```js
function stopSound() {
  const chainToStop = [...nodesChain]; // snapshot before timeout
  nodesChain = [];
  if (gainNode) gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.4);
  setTimeout(() => {
    chainToStop.forEach(n => { try { n.stop?.(); n.disconnect(); } catch {} });
  }, 900);
}
```

### Bug 2 — Soft tone inaudible

**Root cause:** Individual oscillator gain nodes set to `0.01 / (i + 1)` (values: 0.01, 0.005, 0.003) — inaudible even with a master gain of 0.2.

**Fix — `newtab.js`, `startSound("tone")` block:**
```js
g.gain.value = 0.4 / (i + 1);  // was: 0.01 / (i + 1)
```
This produces values of 0.4, 0.2, 0.13 — clearly audible through the 0.2 master gain fade-in.

---

## 4. Affirmation Auto-Rotation

A new setting allowing affirmations to cycle automatically on a timer.

### UI — Settings drawer

New section below Sound:
```
Label: "Auto-rotate"
Options: Off | 5 min | 10 min | 30 min | Custom
```
- Renders as button-group (same style as the Sound options row)
- "Custom" option reveals a small number input (minutes, 1–120)
- Persisted to `localStorage` key `affirm_rotation` (value: `0` for off, or interval in ms)

### Behaviour

- Uses `setInterval` — interval starts when a rotation value is set
- On tick: calls the same `showAffirmation(next)` function used by the refresh button, with the same CSS fade transition (`opacity` → 0 → swap text → opacity → 1)
- Interval resets on:
  - Manual refresh (refresh button click)
  - Tab becoming visible again (`document.addEventListener('visibilitychange')`)
- Interval cleared on `Off` selection
- No rotation when `Off` (default)

### Storage schema addition

```
localStorage key: affirm_rotation
Value: integer (ms) — 0 = off, 300000 = 5min, 600000 = 10min, 1800000 = 30min
```

---

## 5. Affirmations Rewrite

~80 affirmations replacing the current 65. Same data structure: `{ text: string, category: string }` in `affirmations.js`.

### Four voices, mixed throughout

| Voice | Tone | Example |
|---|---|---|
| Poetic | Lyrical, metaphor-rich, spoken-word energy | "You were not built to shrink. You were built to expand into every room you enter." |
| Commanding | Short, direct, no softening — coach energy | "Get up. The world is waiting for what only you can give." |
| Philosophical | Reflective, makes you pause and think | "Every version of you that ever doubted itself was still brave enough to keep going." |
| Gentle & Real | Honest, human, no toxic positivity | "You don't have to be fearless. You just have to move one inch past the fear." |

### Categories (unchanged — 9 total)

`Confidence`, `Growth`, `Self-Worth`, `Resilience`, `Focus`, `Peace`, `Vision`, `Purpose`, `Abundance`

Target distribution: ~8–10 affirmations per category, all four voices represented in each category.

---

## 6. Files Changed

| File | Change |
|---|---|
| `newtab.html` | Update Google Fonts URL (add DM Serif Display, remove Playfair Display). Update default `data-theme` to `ocean`. Expand theme grid to 10 swatches. Add auto-rotate section to settings drawer. |
| `newtab.css` | Add 10 theme CSS variable blocks. Update `--font-serif` reference to DM Serif Display. Expand theme swatch grid styles. Add auto-rotate button row styles. |
| `newtab.js` | Fix `stopSound()` race condition. Fix tone oscillator gain. Add rotation localStorage save/load. Add `setInterval` rotation logic. Update `CATEGORY_COLORS` for new theme accent colors. |
| `affirmations.js` | Replace all 65 affirmations with ~80 new ones across 4 voices. |

---

## Out of Scope

- No changes to habits logic or streak tracking
- No changes to affirmation manager modal (custom/deleted affirmations)
- No changes to manifest.json or extension permissions
- No build tooling — files served directly as before

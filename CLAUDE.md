# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**LuraBio** (lurabio.com) — B2B laboratory reagent supplier platform.
SRE priority: zero-bypass compliance gate, documented audit trails.

Stack: WordPress 6.5 + WooCommerce 8.x (Blocks-ready), PHP 8.1, MySQL, AWS S3, Cloudflare, Playwright.

The plugin ships to `wp-content/plugins/tamrix-compliance/` on the WordPress VPS. This repo is the source; deployment is manual copy or CI push.

## Commands

```bash
# Install Playwright test dependencies
npm install

# Run compliance gate tests (requires WP env at TEST_BASE_URL)
npm test
TEST_BASE_URL=https://staging.lurabio.com TEST_PRODUCT_ID=42 npm test

# Run tests headed (useful for debugging WooCommerce checkout flow)
npm run test:headed

# Run a single spec file
npx playwright test tests/compliance.spec.ts

# Run a single test by name
npx playwright test -g "blocks order placement when checkbox is unchecked"

# Open last HTML test report
npm run test:report
```

No build step. PHP files are served directly by WordPress.

## Plugin Architecture

The plugin is intentionally flat — no classes, no namespaces. All functions are prefixed `tamrix_`. Adding classes or namespaces would be a breaking change to the hook registration pattern.

```
tamrix-compliance/
├── tamrix-compliance.php       # Bootstrap only: defines TAMRIX_DIR, requires the two includes
├── includes/
│   ├── checkout-gate.php       # All compliance logic: render → validate → save → admin display
│   └── product-schema.php      # Technical Reagent meta box + register_post_meta for REST/DB
└── assets/
    ├── js/checkout-gate.js     # Visual feedback only — NOT a security gate
    └── css/admin.css           # Order admin status colours (.tamrix-status-agreed/not-confirmed)
```

**The compliance gate has two layers that must stay in sync:**

1. `checkout-gate.php` — shortcode checkout (`woocommerce_checkout_process`)
2. Blocks checkout hook `woocommerce_store_api_checkout_update_order_from_request` — **not yet implemented** (documented in checkout-gate.php line 46–47)
3. REST API filter `woocommerce_rest_pre_insert_shop_order_object` — **not yet implemented** (see bypass analysis below)

If you implement either of the missing hooks, the gate logic must be identical across all three paths.

## Compliance Gate — Critical Invariants

**The JS (`checkout-gate.js`) is cosmetic only.** It adds a CSS error class on click. It must never call `preventDefault()` or block form submission. The server is the sole authoritative gate.

**Order meta audit trail** — every order must carry:
- `_tamrix_compliance_agreed` → `'1'` (string, not bool) or absent
- `_tamrix_compliance_agreed_at` → `current_time('mysql')` timestamp
- `_tamrix_compliance_source` → `'rest_api'` or `'admin_rest_api'` when not set via checkout (once REST hook is implemented)

**Known bypass vectors (not yet mitigated):**

| Vector | Risk | Fix needed |
|---|---|---|
| WooCommerce Blocks checkout | Medium — meta not saved | Add `woocommerce_store_api_checkout_update_order_from_request` |
| REST API `POST /wp-json/wc/v3/orders` | High — gate bypassed entirely | Add `woocommerce_rest_pre_insert_shop_order_object` filter (conditional: block external callers without `tamrix_research_use_only: true`; flag admin callers) |
| Admin backend order creation | Low — internal ops | Current "Not confirmed" flag in admin is sufficient |

## Product Schema

Three meta keys on `product` post type, all registered via `register_post_meta()` for REST API and future DB optimisation compatibility:

| Meta key | REST type | Stored as |
|---|---|---|
| `_tamrix_molecular_weight` | `number` | `float` via `max(0.0, (float) $v)` |
| `_tamrix_purity` | `string` | sanitized text |
| `_tamrix_storage` | `string` | sanitized text |

`register_post_meta()` first arg must be `''` (empty string), not `'post'`, when using `object_subtype`.

## Playwright Tests

Tests live in `tests/compliance.spec.ts`. They require a running WooCommerce environment — they do not mock WordPress.

`TEST_BASE_URL` defaults to `http://localhost:8888` (wp-env default).
`TEST_PRODUCT_ID` defaults to `1` — set this to a real published product ID.

Tests cover: checkbox visibility, label text, server-side block when unchecked, no false-positive error when checked, accessibility (label association), DOM position (checkbox above submit button).

**The "allows order when checked" test does not assert order completion** — it only asserts the compliance error is absent. Payment gateway behaviour in test environments varies; don't assert the order-received page.

## Brand & Copy

Brand string in PHP: `LuraBio` — used in checkout label, error messages, and admin order display.
Domain: lurabio.com. All user-facing strings updated. Function prefixes (`tamrix_`) and meta keys (`_tamrix_*`) are internal identifiers — do not rename them without a database migration plan.

Text domain for i18n: `tamrix`. The `Text Domain` plugin header is missing — add it before any translated string ships.

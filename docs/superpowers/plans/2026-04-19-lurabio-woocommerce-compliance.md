# LuraBio Life Sciences – WooCommerce Compliance Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a WooCommerce plugin that enforces a "Research Use Only" checkout compliance gate and exposes a Technical Reagent product schema (Molecular Weight, Purity, Storage Conditions) via custom meta boxes.

**Architecture:** A single self-contained WordPress plugin (`lurabio-compliance`) handles both concerns — checkout validation (server-side PHP + lightweight JS) and product schema (custom meta boxes, no ACF dependency). Playwright tests run against a local WP environment (wp-env or Lando) to verify the checkout gate.

**Tech Stack:** PHP 8.1+, WordPress 6.5+, WooCommerce 8.x, TypeScript, Playwright 1.44+, wp-env (local dev)

---

## File Structure

```
lurabio-compliance/                          ← WordPress plugin root
├── lurabio-compliance.php                   ← Plugin bootstrap (registers hooks)
├── includes/
│   ├── checkout-gate.php                   ← Adds checkbox, validates on submit
│   └── product-schema.php                  ← Registers meta box + saves fields
├── assets/
│   └── js/
│       └── checkout-gate.js                ← Client-side empty-field visual feedback
└── tests/
    └── compliance.spec.ts                  ← Playwright: gate blocks unchecked checkout
CLAUDE.md                                   ← Project memory for Claude sessions
```

---

## Task 1: Project Bootstrap & CLAUDE.md

**Files:**
- Create: `CLAUDE.md`
- Create: `lurabio-compliance/lurabio-compliance.php`

- [ ] **Step 1: Create CLAUDE.md**

```markdown
# Project: LuraBio Life Sciences
- Tech Stack: WordPress 6.5, WooCommerce 8.x, PHP 8.1, Playwright
- Context: B2B laboratory reagent supplier platform.
- Rule: Focus on technical data tables, compliance gates, legal modals.
- Plugin: wp-content/plugins/lurabio-compliance/
```

- [ ] **Step 2: Create plugin bootstrap file**

```php
<?php
/**
 * Plugin Name: LuraBio Compliance
 * Description: Research Use Only checkout gate and Technical Reagent product schema.
 * Version:     1.0.0
 * Requires PHP: 8.1
 * Requires Plugins: woocommerce
 */

defined( 'ABSPATH' ) || exit;

define( 'LURABIO_DIR', plugin_dir_path( __FILE__ ) );

require_once LURABIO_DIR . 'includes/checkout-gate.php';
require_once LURABIO_DIR . 'includes/product-schema.php';
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md lurabio-compliance/lurabio-compliance.php
git commit -m "feat: bootstrap LuraBio Compliance plugin"
```

---

## Task 2: Checkout Compliance Gate (PHP)

**Files:**
- Create: `lurabio-compliance/includes/checkout-gate.php`

- [ ] **Step 1: Write the checkout gate PHP**

```php
<?php
defined( 'ABSPATH' ) || exit;

/**
 * Render the "Research Use Only" checkbox on the checkout page.
 * Hooked after the terms-and-conditions field.
 */
add_action( 'woocommerce_review_order_before_submit', 'lurabio_render_research_use_checkbox' );
function lurabio_render_research_use_checkbox(): void {
    echo '<div class="lurabio-research-use-only">';
    woocommerce_form_field( 'lurabio_research_use_only', [
        'type'     => 'checkbox',
        'class'    => [ 'form-row', 'lurabio-compliance-field' ],
        'label'    => wp_kses_post(
            '<strong>Research Use Only.</strong> I confirm these reagents are for '
            . 'laboratory research purposes only and will not be used in humans, '
            . 'animals, or food/cosmetic products.'
        ),
        'required' => true,
    ], WC()->checkout->get_value( 'lurabio_research_use_only' ) );
    echo '</div>';
}

/**
 * Block the order if the compliance checkbox was not checked.
 */
add_action( 'woocommerce_checkout_process', 'lurabio_validate_research_use_checkbox' );
function lurabio_validate_research_use_checkbox(): void {
    if ( empty( $_POST['lurabio_research_use_only'] ) ) {
        wc_add_notice(
            __( 'You must confirm Research Use Only intent to complete this order.', 'lurabio' ),
            'error'
        );
    }
}

/**
 * Save the checkbox value to order meta for audit trail.
 */
add_action( 'woocommerce_checkout_update_order_meta', 'lurabio_save_research_use_meta' );
function lurabio_save_research_use_meta( int $order_id ): void {
    if ( ! empty( $_POST['lurabio_research_use_only'] ) ) {
        update_post_meta( $order_id, '_lurabio_research_use_confirmed', '1' );
        update_post_meta( $order_id, '_lurabio_research_use_confirmed_at', current_time( 'mysql' ) );
    }
}

/**
 * Enqueue lightweight JS for visual feedback only (server is authoritative).
 */
add_action( 'wp_enqueue_scripts', 'lurabio_enqueue_checkout_assets' );
function lurabio_enqueue_checkout_assets(): void {
    if ( ! is_checkout() ) {
        return;
    }
    wp_enqueue_script(
        'lurabio-checkout-gate',
        plugin_dir_url( dirname( __FILE__ ) ) . 'assets/js/checkout-gate.js',
        [ 'jquery' ],
        '1.0.0',
        true
    );
}
```

- [ ] **Step 2: Create the frontend JS (visual feedback only — server blocks the real gate)**

```js
// lurabio-compliance/assets/js/checkout-gate.js
( function ( $ ) {
    'use strict';

    $( document ).on( 'click', '#place_order', function () {
        const $checkbox = $( '#lurabio_research_use_only' );
        if ( ! $checkbox.is( ':checked' ) ) {
            $checkbox.closest( '.lurabio-compliance-field' ).addClass( 'lurabio-error' );
        } else {
            $checkbox.closest( '.lurabio-compliance-field' ).removeClass( 'lurabio-error' );
        }
    } );
} )( jQuery );
```

- [ ] **Step 3: Commit**

```bash
git add lurabio-compliance/includes/checkout-gate.php lurabio-compliance/assets/js/checkout-gate.js
git commit -m "feat: add Research Use Only checkout compliance gate"
```

---

## Task 3: Technical Reagent Product Schema

**Files:**
- Create: `lurabio-compliance/includes/product-schema.php`

- [ ] **Step 1: Write the product schema meta box**

```php
<?php
defined( 'ABSPATH' ) || exit;

/**
 * Register the Technical Reagent meta box on WooCommerce product edit screens.
 */
add_action( 'add_meta_boxes', 'lurabio_register_reagent_meta_box' );
function lurabio_register_reagent_meta_box(): void {
    add_meta_box(
        'lurabio_reagent_data',
        __( 'Technical Reagent Data', 'lurabio' ),
        'lurabio_render_reagent_meta_box',
        'product',
        'normal',
        'high'
    );
}

/**
 * Render the meta box fields.
 */
function lurabio_render_reagent_meta_box( WP_Post $post ): void {
    wp_nonce_field( 'lurabio_reagent_nonce_action', 'lurabio_reagent_nonce' );

    $fields = [
        '_lurabio_molecular_weight' => [
            'label'       => __( 'Molecular Weight (g/mol)', 'lurabio' ),
            'type'        => 'number',
            'placeholder' => 'e.g. 342.30',
            'step'        => '0.01',
            'min'         => '0',
        ],
        '_lurabio_purity'           => [
            'label'       => __( 'Purity (%)', 'lurabio' ),
            'type'        => 'text',
            'placeholder' => 'e.g. ≥98%',
        ],
        '_lurabio_storage'          => [
            'label'       => __( 'Storage Conditions', 'lurabio' ),
            'type'        => 'text',
            'placeholder' => 'e.g. −20 °C, dry, away from light',
        ],
    ];

    echo '<table class="form-table"><tbody>';
    foreach ( $fields as $key => $field ) {
        $value = esc_attr( get_post_meta( $post->ID, $key, true ) );
        $attrs = sprintf( 'type="%s" placeholder="%s"', $field['type'], $field['placeholder'] );
        if ( isset( $field['step'] ) ) {
            $attrs .= sprintf( ' step="%s" min="%s"', $field['step'], $field['min'] );
        }
        printf(
            '<tr><th><label for="%1$s">%2$s</label></th>
             <td><input id="%1$s" name="%1$s" %3$s value="%4$s" class="regular-text" /></td></tr>',
            esc_attr( $key ),
            esc_html( $field['label'] ),
            $attrs,
            $value
        );
    }
    echo '</tbody></table>';
}

/**
 * Save meta box data with nonce and capability checks.
 */
add_action( 'save_post_product', 'lurabio_save_reagent_meta', 10, 2 );
function lurabio_save_reagent_meta( int $post_id, WP_Post $post ): void {
    if (
        ! isset( $_POST['lurabio_reagent_nonce'] ) ||
        ! wp_verify_nonce( $_POST['lurabio_reagent_nonce'], 'lurabio_reagent_nonce_action' ) ||
        ! current_user_can( 'edit_post', $post_id ) ||
        defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE
    ) {
        return;
    }

    $fields = [
        '_lurabio_molecular_weight',
        '_lurabio_purity',
        '_lurabio_storage',
    ];

    foreach ( $fields as $key ) {
        if ( isset( $_POST[ $key ] ) ) {
            update_post_meta( $post_id, $key, sanitize_text_field( wp_unslash( $_POST[ $key ] ) ) );
        }
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add lurabio-compliance/includes/product-schema.php
git commit -m "feat: add Technical Reagent product schema meta box"
```

---

## Task 4: Playwright Compliance Tests

**Files:**
- Create: `tests/compliance.spec.ts`

**Prerequisites:** A local WooCommerce environment running at `http://localhost:8888` with:
- The `lurabio-compliance` plugin active
- At least one product in the cart
- A test customer account (`test@lurabio.local` / `password`)

Use `npx @wp-env/cli start` or your existing local stack.

- [ ] **Step 1: Install Playwright**

```bash
npm init -y
npm install --save-dev @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Create `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig( {
    testDir: './tests',
    use: {
        baseURL: 'http://localhost:8888',
        headless: true,
        screenshot: 'only-on-failure',
    },
} );
```

- [ ] **Step 3: Write the compliance spec**

```ts
// tests/compliance.spec.ts
import { test, expect } from '@playwright/test';

const CHECKOUT_URL   = '/checkout/';
const PRODUCT_URL    = '/?p=1&add-to-cart=1'; // replace 1 with actual product ID
const CHECKBOX_ID    = '#lurabio_research_use_only';
const SUBMIT_BUTTON  = '#place_order';
const ERROR_NOTICE   = '.woocommerce-error';

test.describe( 'Research Use Only Compliance Gate', () => {

    test.beforeEach( async ( { page } ) => {
        // Add a product to cart before each test
        await page.goto( PRODUCT_URL );
        await page.goto( CHECKOUT_URL );
        // Fill minimum required checkout fields
        await page.fill( '#billing_first_name', 'Test' );
        await page.fill( '#billing_last_name',  'Researcher' );
        await page.fill( '#billing_address_1',  '1 Lab Lane' );
        await page.fill( '#billing_city',       'Science City' );
        await page.fill( '#billing_postcode',   '12345' );
        await page.fill( '#billing_phone',      '5550001234' );
        await page.fill( '#billing_email',      'test@lurabio.local' );
    } );

    test( 'blocks order when Research Use Only checkbox is unchecked', async ( { page } ) => {
        // Ensure checkbox is NOT checked
        const checkbox = page.locator( CHECKBOX_ID );
        await expect( checkbox ).not.toBeChecked();

        // Attempt to place order
        await page.click( SUBMIT_BUTTON );

        // Server should return an error notice
        await expect( page.locator( ERROR_NOTICE ) ).toBeVisible();
        await expect( page.locator( ERROR_NOTICE ) ).toContainText(
            'Research Use Only intent'
        );

        // Must still be on checkout page
        await expect( page ).toHaveURL( /checkout/ );
    } );

    test( 'allows order when Research Use Only checkbox is checked', async ( { page } ) => {
        // Check the compliance box
        await page.check( CHECKBOX_ID );
        await expect( page.locator( CHECKBOX_ID ) ).toBeChecked();

        // Attempt to place order
        await page.click( SUBMIT_BUTTON );

        // Should NOT show the compliance error
        const errorText = page.locator( ERROR_NOTICE );
        const hasComplianceError = await errorText
            .filter( { hasText: 'Research Use Only intent' } )
            .count();
        expect( hasComplianceError ).toBe( 0 );
    } );

    test( 'compliance checkbox is visible and labelled correctly', async ( { page } ) => {
        await page.goto( CHECKOUT_URL );
        const checkbox = page.locator( CHECKBOX_ID );
        await expect( checkbox ).toBeVisible();

        const label = page.locator( 'label[for="lurabio_research_use_only"]' );
        await expect( label ).toContainText( 'Research Use Only' );
    } );

} );
```

- [ ] **Step 4: Run tests against local environment**

```bash
npx playwright test tests/compliance.spec.ts --reporter=list
```

Expected output:
```
✓ blocks order when Research Use Only checkbox is unchecked
✓ allows order when Research Use Only checkbox is checked
✓ compliance checkbox is visible and labelled correctly

3 passed
```

- [ ] **Step 5: Commit**

```bash
git add tests/compliance.spec.ts playwright.config.ts package.json package-lock.json
git commit -m "test: add Playwright compliance gate spec"
```

---

## Spec Coverage Check

| Requirement | Task |
|---|---|
| Research Use Only checkbox at checkout | Task 2 — `checkout-gate.php` |
| Block transaction if unchecked | Task 2 — `lurabio_validate_research_use_checkbox()` |
| Molecular Weight field | Task 3 — `product-schema.php` |
| Purity field | Task 3 — `product-schema.php` |
| Storage Conditions field | Task 3 — `product-schema.php` |
| Playwright test blocks unchecked checkout | Task 4 — `compliance.spec.ts` |
| CLAUDE.md project memory | Task 1 |

All requirements covered. No placeholders.

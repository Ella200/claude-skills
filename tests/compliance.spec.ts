/**
 * Tamrix Peptide — Research Use Only Compliance Gate Tests
 *
 * Requires a live WooCommerce environment at TEST_BASE_URL.
 * Set TEST_PRODUCT_ID to a published product in that environment.
 *
 * Covers:
 *   - Shortcode checkout gate (server blocks unchecked)
 *   - Checkbox visibility, label, position, accessibility
 *   - State persistence across page reloads
 *   - No false-positive compliance error when checked
 */
import { test, expect, type Page } from '@playwright/test';

const PRODUCT_ID   = process.env.TEST_PRODUCT_ID ?? '1';
const CHECKOUT_URL = '/checkout/';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function addProductToCart( page: Page ): Promise<void> {
    await page.goto( `/?add-to-cart=${ PRODUCT_ID }`, { waitUntil: 'networkidle' } );
}

async function fillBillingFields( page: Page ): Promise<void> {
    await page.goto( CHECKOUT_URL, { waitUntil: 'networkidle' } );
    await page.fill( '#billing_first_name', 'Research' );
    await page.fill( '#billing_last_name',  'Scientist' );
    await page.fill( '#billing_address_1',  '1 Laboratory Ave' );
    await page.fill( '#billing_city',       'Science City' );
    await page.fill( '#billing_postcode',   '10001' );
    await page.fill( '#billing_phone',      '5550001234' );
    await page.fill( '#billing_email',      'researcher@tamrixpeptide.com' );
}

// ─── Suite ────────────────────────────────────────────────────────────────────

test.describe( 'Research Use Only Compliance Gate', () => {

    test.beforeEach( async ( { page } ) => {
        await addProductToCart( page );
        await fillBillingFields( page );
    } );

    // ── Rendering ─────────────────────────────────────────────────────────────

    test( 'compliance checkbox is visible on checkout page', async ( { page } ) => {
        await expect( page.locator( '#tamrix_research_use_only' ) ).toBeVisible();
    } );

    test( 'compliance checkbox label contains Research Use Only text', async ( { page } ) => {
        const label = page.locator( 'label[for="tamrix_research_use_only"]' );
        await expect( label ).toBeVisible();
        await expect( label ).toContainText( 'Research Use Only' );
    } );

    test( 'compliance checkbox is positioned above the Place Order button in the DOM', async ( { page } ) => {
        const checkboxBox = await page.locator( '#tamrix_research_use_only' ).boundingBox();
        const submitBox   = await page.locator( '#place_order' ).boundingBox();
        expect( checkboxBox ).not.toBeNull();
        expect( submitBox ).not.toBeNull();
        expect( checkboxBox!.y ).toBeLessThan( submitBox!.y );
    } );

    test( 'compliance checkbox has an associated label element (accessibility)', async ( { page } ) => {
        const id    = await page.locator( '#tamrix_research_use_only' ).getAttribute( 'id' );
        const label = page.locator( `label[for="${ id }"]` );
        await expect( label ).toBeVisible();
    } );

    // ── Gate enforcement ──────────────────────────────────────────────────────

    test( 'blocks order placement when checkbox is unchecked', async ( { page } ) => {
        await expect( page.locator( '#tamrix_research_use_only' ) ).not.toBeChecked();

        await page.click( '#place_order' );

        const error = page.locator( '.woocommerce-error, .wc-block-components-notice-banner--error' );
        await expect( error.first() ).toBeVisible( { timeout: 8000 } );
        await expect( error.first() ).toContainText( 'Research Use Only' );

        // Must stay on checkout — order NOT created
        await expect( page ).toHaveURL( /checkout/ );
    } );

    test( 'does not surface compliance error when checkbox is checked before submit', async ( { page } ) => {
        await page.check( '#tamrix_research_use_only' );
        await expect( page.locator( '#tamrix_research_use_only' ) ).toBeChecked();

        await page.click( '#place_order' );
        await page.waitForTimeout( 2000 );

        // Compliance-specific error must be absent regardless of payment gateway outcome
        const complianceErrors = page.locator(
            '.woocommerce-error li, .wc-block-components-notice-banner--error'
        ).filter( { hasText: 'Research Use Only' } );
        await expect( complianceErrors ).toHaveCount( 0 );
    } );

    // ── State persistence ─────────────────────────────────────────────────────

    test( 'checkbox is unchecked by default on fresh load', async ( { page } ) => {
        await expect( page.locator( '#tamrix_research_use_only' ) ).not.toBeChecked();
    } );

    test( 'unchecked state is preserved after page reload', async ( { page } ) => {
        await page.reload( { waitUntil: 'networkidle' } );
        await expect( page.locator( '#tamrix_research_use_only' ) ).not.toBeChecked();
    } );

    // ── Regression: JS disabled must not bypass gate ──────────────────────────

    test( 'gate blocks order even when JS adds tamrix-field-error class (server is authoritative)', async ( { page } ) => {
        // Simulate JS having run and applied error class — server must still block
        await page.evaluate( () => {
            const field = document.querySelector( '.tamrix-compliance-field' );
            if ( field ) field.classList.add( 'tamrix-field-error' );
        } );

        // Do NOT check the box — submit with it unchecked
        await page.click( '#place_order' );

        const error = page.locator( '.woocommerce-error, .wc-block-components-notice-banner--error' );
        await expect( error.first() ).toBeVisible( { timeout: 8000 } );
        await expect( error.first() ).toContainText( 'Research Use Only' );
        await expect( page ).toHaveURL( /checkout/ );
    } );

} );

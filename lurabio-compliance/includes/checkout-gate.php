<?php
defined( 'ABSPATH' ) || exit;

/**
 * Render the Research Use Only compliance checkbox before the Place Order button.
 */
add_action( 'woocommerce_review_order_before_submit', 'lurabio_render_compliance_checkbox' );
function lurabio_render_compliance_checkbox(): void {
    $label = wp_kses(
        '<strong>LuraBio Research Use Only Agreement.</strong> '
        . 'I confirm that all products purchased from LuraBio are intended solely '
        . 'for laboratory research purposes. These reagents are not for use in humans, '
        . 'animals, food, cosmetics, or any in vivo applications.',
        [ 'strong' => [] ]
    );

    echo '<div class="lurabio-compliance-wrap">';
    woocommerce_form_field( 'lurabio_research_use_only', [
        'type'     => 'checkbox',
        'class'    => [ 'form-row', 'lurabio-compliance-field' ],
        'label'    => $label,
        'required' => true,
    ], WC()->checkout->get_value( 'lurabio_research_use_only' ) );
    echo '</div>';
}

/**
 * Server-side validation — block the order if the checkbox was not checked.
 */
add_action( 'woocommerce_checkout_process', 'lurabio_validate_compliance_checkbox' );
function lurabio_validate_compliance_checkbox(): void {
    if ( empty( $_POST['lurabio_research_use_only'] ) ) {
        wc_add_notice(
            __(
                'You must agree to the LuraBio Research Use Only terms before placing your order.',
                'lurabio'
            ),
            'error'
        );
    }
}

/**
 * Save compliance status to order meta for audit trail.
 */
// Note: this hook does not fire on the WooCommerce Blocks checkout.
// For Blocks compatibility, implement woocommerce_store_api_checkout_update_order_from_request.
add_action( 'woocommerce_checkout_update_order_meta', 'lurabio_save_compliance_meta' );
function lurabio_save_compliance_meta( int $order_id ): void {
    if ( ! empty( $_POST['lurabio_research_use_only'] ) ) {
        update_post_meta( $order_id, '_lurabio_compliance_agreed', '1' );
        update_post_meta( $order_id, '_lurabio_compliance_agreed_at', current_time( 'mysql' ) );
    }
}

/**
 * Display compliance status in the WooCommerce admin order detail panel.
 */
add_action( 'woocommerce_admin_order_data_after_billing_address', 'lurabio_display_compliance_in_admin' );
function lurabio_display_compliance_in_admin( WC_Order $order ): void {
    $agreed    = get_post_meta( $order->get_id(), '_lurabio_compliance_agreed', true );
    $agreed_at = get_post_meta( $order->get_id(), '_lurabio_compliance_agreed_at', true );

    echo '<p><strong>' . esc_html__( 'LuraBio Research Use Only:', 'lurabio' ) . '</strong> ';

    if ( '1' === $agreed ) {
        echo '<span class="lurabio-status-agreed">'
            . esc_html__( 'Agreed', 'lurabio' )
            . '</span>';
        if ( $agreed_at ) {
            echo ' <em>(' . esc_html( $agreed_at ) . ')</em>';
        }
    } else {
        echo '<span class="lurabio-status-not-confirmed">'
            . esc_html__( 'Not confirmed', 'lurabio' )
            . '</span>';
        $note = get_post_meta( $order->get_id(), '_lurabio_compliance_note', true );
        if ( $note ) {
            echo ' <em style="color:#6c757d;font-size:0.85em;">(' . esc_html( $note ) . ')</em>';
        }
    }

    echo '</p>';
}

/**
 * Enqueue lightweight JS for visual feedback on the checkout page only.
 * The server is the authoritative validation gate.
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

/**
 * Enqueue admin CSS for compliance status display in order detail screens.
 */
add_action( 'admin_enqueue_scripts', 'lurabio_enqueue_admin_assets' );
function lurabio_enqueue_admin_assets( string $hook ): void {
    // Legacy CPT-based orders (WC < 7.1 or HPOS disabled)
    $screen     = get_current_screen();
    $is_legacy  = in_array( $hook, [ 'post.php', 'post-new.php' ], true )
                  && $screen
                  && 'shop_order' === $screen->post_type;

    // High-Performance Order Storage screen (WC 7.1+ with HPOS enabled)
    $is_hpos    = 'woocommerce_page_wc-orders' === $hook;

    if ( ! $is_legacy && ! $is_hpos ) {
        return;
    }

    wp_enqueue_style(
        'lurabio-admin',
        plugin_dir_url( dirname( __FILE__ ) ) . 'assets/css/admin.css',
        [],
        '1.0.0'
    );
}

/**
 * P1: Blocks checkout compliance gate (Store API path).
 *
 * Fires for orders placed via the WooCommerce Blocks checkout.
 * Throws RouteException (HTTP 422) if agreement param is absent.
 * Saves compliance meta identical to the shortcode path.
 */
add_action(
    'woocommerce_store_api_checkout_update_order_from_request',
    'lurabio_blocks_checkout_compliance',
    10,
    2
);
function lurabio_blocks_checkout_compliance( \WC_Order $order, \WP_REST_Request $request ): void {
    $agreed = (bool) $request->get_param( 'lurabio_research_use_only' );

    if ( ! $agreed ) {
        throw new \Automattic\WooCommerce\StoreApi\Exceptions\RouteException(
            'lurabio_compliance_required',
            __( 'You must agree to the LuraBio Research Use Only terms before placing your order.', 'lurabio' ),
            422
        );
    }

    $order->update_meta_data( '_lurabio_compliance_agreed',    '1' );
    $order->update_meta_data( '_lurabio_compliance_agreed_at', current_time( 'mysql' ) );
    $order->update_meta_data( '_lurabio_compliance_source',    'blocks_checkout' );
}

/**
 * P2: REST API compliance gate — caller-aware.
 *
 * Admin/shop-manager callers: flagged with source metadata, order allowed.
 * The flag surfaces in the order admin as "Not confirmed" (existing display logic).
 * Ops staff creating manual orders are accountable by role; blocking them
 * would break ERP integrations and WP-CLI workflows.
 *
 * External callers (consumer key / application password, non-admin):
 * HARD BLOCK (HTTP 403) unless `lurabio_research_use_only: true` is in the
 * request body — the external system is responsible for presenting the
 * agreement to the buyer before calling this endpoint.
 *
 * @param WC_Order        $order   The order object being created.
 * @param WP_REST_Request $request The originating REST request.
 * @return WC_Order|\WP_Error
 */
add_filter(
    'woocommerce_rest_pre_insert_shop_order_object',
    'lurabio_rest_api_compliance',
    10,
    2
);
function lurabio_rest_api_compliance( \WC_Order $order, \WP_REST_Request $request ): \WC_Order|\WP_Error {
    // Role allowlist: capability checks avoided because marketplace plugins (Dokan, WCFM, WC Vendors)
    // can grant edit_shop_orders to vendor roles, which would silently bypass the hard block.
    $user              = wp_get_current_user();
    $trusted_roles     = [ 'administrator', 'shop_manager' ];
    $caller_is_trusted = ! empty( array_intersect( $trusted_roles, (array) $user->roles ) );
    $agreed            = (bool) $request->get_param( 'lurabio_research_use_only' );

    if ( $caller_is_trusted ) {
        // Internal ops path: flag source, do not block.
        // "_lurabio_compliance_agreed" intentionally left absent so the admin
        // order view shows "Not confirmed" — prompting manual follow-up.
        $order->update_meta_data( '_lurabio_compliance_source', 'admin_rest_api' );
        $order->update_meta_data( '_lurabio_compliance_note',
            'Order created via admin REST API. Research Use Only agreement not captured at order level.'
        );
        return $order;
    }

    if ( ! $agreed ) {
        // External caller without agreement param — hard block.
        return new \WP_Error(
            'lurabio_compliance_required',
            __(
                'LuraBio API orders require lurabio_research_use_only: true in the request body. '
                . 'The external system must present the Research Use Only agreement to the buyer before submitting.',
                'lurabio'
            ),
            [ 'status' => 403 ]
        );
    }

    // External caller confirmed agreement.
    $order->update_meta_data( '_lurabio_compliance_agreed',    '1' );
    $order->update_meta_data( '_lurabio_compliance_agreed_at', current_time( 'mysql' ) );
    $order->update_meta_data( '_lurabio_compliance_source',    'rest_api' );

    return $order;
}

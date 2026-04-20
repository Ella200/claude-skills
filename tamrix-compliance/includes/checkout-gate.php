<?php
defined( 'ABSPATH' ) || exit;

/**
 * Render the Research Use Only compliance checkbox before the Place Order button.
 */
add_action( 'woocommerce_review_order_before_submit', 'tamrix_render_compliance_checkbox' );
function tamrix_render_compliance_checkbox(): void {
    $label = wp_kses(
        '<strong>TamrixLab Research Use Only Agreement.</strong> '
        . 'I confirm that all products purchased from TamrixLab are intended solely '
        . 'for laboratory research purposes. These reagents are not for use in humans, '
        . 'animals, food, cosmetics, or any in vivo applications.',
        [ 'strong' => [] ]
    );

    echo '<div class="tamrix-compliance-wrap">';
    woocommerce_form_field( 'tamrix_research_use_only', [
        'type'     => 'checkbox',
        'class'    => [ 'form-row', 'tamrix-compliance-field' ],
        'label'    => $label,
        'required' => true,
    ], WC()->checkout->get_value( 'tamrix_research_use_only' ) );
    echo '</div>';
}

/**
 * Server-side validation — block the order if the checkbox was not checked.
 */
add_action( 'woocommerce_checkout_process', 'tamrix_validate_compliance_checkbox' );
function tamrix_validate_compliance_checkbox(): void {
    if ( empty( $_POST['tamrix_research_use_only'] ) ) {
        wc_add_notice(
            __(
                'You must agree to the TamrixLab Research Use Only terms before placing your order.',
                'tamrix'
            ),
            'error'
        );
    }
}

/**
 * Save compliance status to order meta for audit trail.
 */
add_action( 'woocommerce_checkout_update_order_meta', 'tamrix_save_compliance_meta' );
function tamrix_save_compliance_meta( int $order_id ): void {
    if ( ! empty( $_POST['tamrix_research_use_only'] ) ) {
        update_post_meta( $order_id, '_tamrix_compliance_agreed', '1' );
        update_post_meta( $order_id, '_tamrix_compliance_agreed_at', current_time( 'mysql' ) );
    }
}

/**
 * Display compliance status in the WooCommerce admin order detail panel.
 */
add_action( 'woocommerce_admin_order_data_after_billing_address', 'tamrix_display_compliance_in_admin' );
function tamrix_display_compliance_in_admin( WC_Order $order ): void {
    $agreed    = get_post_meta( $order->get_id(), '_tamrix_compliance_agreed', true );
    $agreed_at = get_post_meta( $order->get_id(), '_tamrix_compliance_agreed_at', true );

    echo '<p><strong>' . esc_html__( 'TamrixLab Research Use Only:', 'tamrix' ) . '</strong> ';

    if ( '1' === $agreed ) {
        echo '<span style="color:#28a745;">'
            . esc_html__( 'Agreed', 'tamrix' )
            . '</span>';
        if ( $agreed_at ) {
            echo ' <em>(' . esc_html( $agreed_at ) . ')</em>';
        }
    } else {
        echo '<span style="color:#dc3545;">'
            . esc_html__( 'Not confirmed', 'tamrix' )
            . '</span>';
    }

    echo '</p>';
}

/**
 * Enqueue lightweight JS for visual feedback on the checkout page only.
 * The server is the authoritative validation gate.
 */
add_action( 'wp_enqueue_scripts', 'tamrix_enqueue_checkout_assets' );
function tamrix_enqueue_checkout_assets(): void {
    if ( ! is_checkout() ) {
        return;
    }
    wp_enqueue_script(
        'tamrix-checkout-gate',
        plugin_dir_url( dirname( __FILE__ ) ) . 'assets/js/checkout-gate.js',
        [ 'jquery' ],
        '1.0.0',
        true
    );
}

<?php
defined( 'ABSPATH' ) || exit;

/**
 * Register meta keys for REST API and future database optimization compatibility.
 */
add_action( 'init', 'tamrix_register_reagent_meta' );
function tamrix_register_reagent_meta(): void {
    $shared = [
        'object_subtype' => 'product',
        'type'           => 'string',
        'single'         => true,
        'show_in_rest'   => true,
        'auth_callback'  => fn() => current_user_can( 'edit_posts' ),
    ];

    register_post_meta( '', '_tamrix_molecular_weight', array_merge( $shared, [
        'type'              => 'number',
        'description'       => 'Molecular weight of the reagent in g/mol.',
        'sanitize_callback' => fn( $v ) => sanitize_text_field( (string) $v ),
    ] ) );

    register_post_meta( '', '_tamrix_purity', array_merge( $shared, [
        'description'       => 'Purity percentage of the reagent.',
        'sanitize_callback' => 'sanitize_text_field',
    ] ) );

    register_post_meta( '', '_tamrix_storage', array_merge( $shared, [
        'description'       => 'Recommended storage conditions for the reagent.',
        'sanitize_callback' => 'sanitize_text_field',
    ] ) );
}

/**
 * Register the Technical Reagent meta box on WooCommerce product edit screens.
 */
add_action( 'add_meta_boxes', 'tamrix_register_reagent_meta_box' );
function tamrix_register_reagent_meta_box(): void {
    add_meta_box(
        'tamrix_reagent_data',
        __( 'Technical Reagent Data', 'tamrix' ),
        'tamrix_render_reagent_meta_box',
        'product',
        'normal',
        'high'
    );
}

/**
 * Render the meta box fields.
 */
function tamrix_render_reagent_meta_box( WP_Post $post ): void {
    wp_nonce_field( 'tamrix_reagent_nonce_action', 'tamrix_reagent_nonce' );

    $fields = [
        '_tamrix_molecular_weight' => [
            'label'       => __( 'Molecular Weight (g/mol)', 'tamrix' ),
            'type'        => 'number',
            'placeholder' => 'e.g. 342.30',
            'step'        => '0.01',
            'min'         => '0',
        ],
        '_tamrix_purity'           => [
            'label'       => __( 'Purity (%)', 'tamrix' ),
            'type'        => 'text',
            'placeholder' => 'e.g. ≥98%',
        ],
        '_tamrix_storage'          => [
            'label'       => __( 'Storage Conditions', 'tamrix' ),
            'type'        => 'text',
            'placeholder' => 'e.g. −20 °C, dry, away from light',
        ],
    ];

    echo '<table class="form-table"><tbody>';
    foreach ( $fields as $key => $field ) {
        $value = esc_attr( get_post_meta( $post->ID, $key, true ) );
        $attrs = sprintf( 'type="%s" placeholder="%s"', esc_attr( $field['type'] ), esc_attr( $field['placeholder'] ) );
        if ( isset( $field['step'] ) ) {
            $attrs .= sprintf( ' step="%s" min="%s"', esc_attr( $field['step'] ), esc_attr( $field['min'] ) );
        }
        printf(
            '<tr>
                <th scope="row"><label for="%1$s">%2$s</label></th>
                <td><input id="%1$s" name="%1$s" %3$s value="%4$s" class="regular-text" /></td>
            </tr>',
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
add_action( 'save_post_product', 'tamrix_save_reagent_meta', 10, 2 );
function tamrix_save_reagent_meta( int $post_id, WP_Post $post ): void {
    if (
        ! isset( $_POST['tamrix_reagent_nonce'] ) ||
        ! wp_verify_nonce( $_POST['tamrix_reagent_nonce'], 'tamrix_reagent_nonce_action' ) ||
        ! current_user_can( 'edit_post', $post_id ) ||
        ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE )
    ) {
        return;
    }

    $fields = [
        '_tamrix_molecular_weight',
        '_tamrix_purity',
        '_tamrix_storage',
    ];

    foreach ( $fields as $key ) {
        if ( isset( $_POST[ $key ] ) ) {
            update_post_meta( $post_id, $key, sanitize_text_field( wp_unslash( $_POST[ $key ] ) ) );
        }
    }
}

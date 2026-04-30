<?php
defined( 'ABSPATH' ) || exit;

/**
 * Canonical research category → pastel hex map.
 * Used by the catalog grid, product cards, and the filter pills.
 */
function lurabio_category_colors(): array {
    return [
        'metabolic'     => '#F2D5C8',
        'tissue-repair' => '#D4E2CF',
        'dermal'        => '#E0D5EB',
        'neuro'         => '#D0E0EC',
        'endocrine'     => '#F5ECD5',
        'immunology'    => '#F0D5D5',
    ];
}

/**
 * Human-readable labels for the research categories.
 */
function lurabio_category_labels(): array {
    return [
        'metabolic'     => 'Metabolic',
        'tissue-repair' => 'Tissue Repair',
        'dermal'        => 'Dermal / Cellular',
        'neuro'         => 'Neurocognitive',
        'endocrine'     => 'Endocrine',
        'immunology'    => 'Immunology',
    ];
}

/**
 * Register all peptide meta keys for REST API and database compatibility.
 */
add_action( 'init', 'lurabio_register_peptide_meta' );
function lurabio_register_peptide_meta(): void {
    $shared = [
        'object_subtype' => 'product',
        'type'           => 'string',
        'single'         => true,
        'show_in_rest'   => true,
        'auth_callback'  => fn() => current_user_can( 'edit_posts' ),
    ];

    register_post_meta( '', '_lurabio_cas_number', array_merge( $shared, [
        'description'       => 'CAS registry number (e.g. 75921-69-6).',
        'sanitize_callback' => 'sanitize_text_field',
    ] ) );

    register_post_meta( '', '_lurabio_molecular_formula', array_merge( $shared, [
        'description'       => 'Molecular formula (e.g. C₁₄H₁₈N₄O₃).',
        'sanitize_callback' => 'sanitize_text_field',
    ] ) );

    register_post_meta( '', '_lurabio_molecular_weight', array_merge( $shared, [
        'type'              => 'number',
        'description'       => 'Molecular weight of the peptide in g/mol.',
        'sanitize_callback' => fn( $v ) => max( 0.0, (float) $v ),
    ] ) );

    register_post_meta( '', '_lurabio_purity', array_merge( $shared, [
        'description'       => 'Purity percentage (e.g. ≥99%).',
        'sanitize_callback' => 'sanitize_text_field',
    ] ) );

    register_post_meta( '', '_lurabio_storage', array_merge( $shared, [
        'description'       => 'Recommended storage conditions.',
        'sanitize_callback' => 'sanitize_text_field',
    ] ) );

    register_post_meta( '', '_lurabio_research_category', array_merge( $shared, [
        'description'       => 'Research category slug (metabolic, tissue-repair, dermal, neuro, endocrine, immunology).',
        'sanitize_callback' => fn( $v ) => array_key_exists( $v, lurabio_category_colors() ) ? $v : '',
    ] ) );

    register_post_meta( '', '_lurabio_sequence', array_merge( $shared, [
        'description'       => 'Amino-acid sequence string.',
        'sanitize_callback' => 'sanitize_text_field',
    ] ) );
}

/**
 * Register the Technical Peptide meta box.
 */
add_action( 'add_meta_boxes', 'lurabio_register_peptide_meta_box' );
function lurabio_register_peptide_meta_box(): void {
    add_meta_box(
        'lurabio_peptide_data',
        __( 'Technical Peptide Data', 'lurabio' ),
        'lurabio_render_peptide_meta_box',
        'product',
        'normal',
        'high'
    );
}

/**
 * Render the meta box.
 */
function lurabio_render_peptide_meta_box( WP_Post $post ): void {
    wp_nonce_field( 'lurabio_peptide_nonce_action', 'lurabio_peptide_nonce' );

    $text_fields = [
        '_lurabio_cas_number'        => [ 'label' => 'CAS Number',            'placeholder' => 'e.g. 75921-69-6' ],
        '_lurabio_molecular_formula' => [ 'label' => 'Molecular Formula',     'placeholder' => 'e.g. C₁₄H₁₈N₄O₃' ],
        '_lurabio_purity'            => [ 'label' => 'Purity (%)',             'placeholder' => 'e.g. ≥99%' ],
        '_lurabio_storage'           => [ 'label' => 'Storage Conditions',    'placeholder' => 'e.g. −20 °C, dry, away from light' ],
        '_lurabio_sequence'          => [ 'label' => 'Amino-Acid Sequence',   'placeholder' => 'e.g. Aib-His-D-Phe-Arg-Trp-Gly-OH' ],
    ];

    echo '<table class="form-table"><tbody>';

    // Molecular weight (number field)
    $mw = esc_attr( get_post_meta( $post->ID, '_lurabio_molecular_weight', true ) );
    printf(
        '<tr><th scope="row"><label for="_lurabio_molecular_weight">%s</label></th>
         <td><input id="_lurabio_molecular_weight" name="_lurabio_molecular_weight"
             type="number" step="0.01" min="0" placeholder="e.g. 342.30"
             value="%s" class="regular-text" /></td></tr>',
        esc_html__( 'Molecular Weight (g/mol)', 'lurabio' ),
        $mw
    );

    // Text fields
    foreach ( $text_fields as $key => $field ) {
        $value = esc_attr( get_post_meta( $post->ID, $key, true ) );
        printf(
            '<tr><th scope="row"><label for="%1$s">%2$s</label></th>
             <td><input id="%1$s" name="%1$s" type="text"
                 placeholder="%3$s" value="%4$s" class="regular-text" /></td></tr>',
            esc_attr( $key ),
            esc_html__( $field['label'], 'lurabio' ),
            esc_attr( $field['placeholder'] ),
            $value
        );
    }

    // Research category select
    $current_cat = get_post_meta( $post->ID, '_lurabio_research_category', true );
    echo '<tr><th scope="row"><label for="_lurabio_research_category">' . esc_html__( 'Research Category', 'lurabio' ) . '</label></th><td>';
    echo '<select id="_lurabio_research_category" name="_lurabio_research_category" class="regular-text">';
    echo '<option value="">' . esc_html__( '— Select category —', 'lurabio' ) . '</option>';
    foreach ( lurabio_category_labels() as $slug => $label ) {
        printf(
            '<option value="%s"%s>%s</option>',
            esc_attr( $slug ),
            selected( $current_cat, $slug, false ),
            esc_html( $label )
        );
    }
    echo '</select></td></tr>';

    echo '</tbody></table>';
}

/**
 * Save all peptide meta with nonce + capability checks.
 */
add_action( 'save_post_product', 'lurabio_save_peptide_meta', 10, 2 );
function lurabio_save_peptide_meta( int $post_id, WP_Post $post ): void {
    if (
        ! isset( $_POST['lurabio_peptide_nonce'] ) ||
        ! wp_verify_nonce( $_POST['lurabio_peptide_nonce'], 'lurabio_peptide_nonce_action' ) ||
        ! current_user_can( 'edit_post', $post_id ) ||
        ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE )
    ) {
        return;
    }

    $text_keys = [
        '_lurabio_cas_number',
        '_lurabio_molecular_formula',
        '_lurabio_purity',
        '_lurabio_storage',
        '_lurabio_sequence',
        '_lurabio_research_category',
    ];

    foreach ( $text_keys as $key ) {
        if ( isset( $_POST[ $key ] ) ) {
            update_post_meta( $post_id, $key, sanitize_text_field( wp_unslash( $_POST[ $key ] ) ) );
        }
    }

    // Molecular weight: cast to float
    if ( isset( $_POST['_lurabio_molecular_weight'] ) ) {
        update_post_meta( $post_id, '_lurabio_molecular_weight',
            max( 0.0, (float) $_POST['_lurabio_molecular_weight'] )
        );
    }
}

<?php
defined( 'ABSPATH' ) || exit;

/**
 * Enqueue parent + child styles, catalog JS.
 */
add_action( 'wp_enqueue_scripts', 'lurabio_child_enqueue' );
function lurabio_child_enqueue(): void {
    wp_enqueue_style( 'kadence-parent', get_template_directory_uri() . '/style.css' );
    wp_enqueue_style(
        'lurabio-child',
        get_stylesheet_directory_uri() . '/style.css',
        [ 'kadence-parent' ],
        '1.0.0'
    );
    wp_enqueue_style(
        'lurabio-catalog',
        get_stylesheet_directory_uri() . '/assets/css/catalog.css',
        [ 'lurabio-child' ],
        '1.0.0'
    );
    wp_enqueue_style(
        'lurabio-clinical',
        get_stylesheet_directory_uri() . '/assets/css/clinical.css',
        [ 'lurabio-child' ],
        '1.0.0'
    );

    if ( is_shop() || is_product_category() ) {
        wp_enqueue_script(
            'lurabio-catalog-filter',
            get_stylesheet_directory_uri() . '/assets/js/catalog-filter.js',
            [],
            '1.0.0',
            true
        );
    }
}

/**
 * Register nav menus.
 */
add_action( 'after_setup_theme', 'lurabio_child_menus' );
function lurabio_child_menus(): void {
    register_nav_menus( [
        'lurabio-primary'      => __( 'LuraBio Primary Nav', 'lurabio-child' ),
        'lurabio-header-right' => __( 'LuraBio Header Right (Login / Cart)', 'lurabio-child' ),
    ] );
}

/**
 * Inject the LuraBio header bar above Kadence's header.
 * Falls back gracefully if menus are not assigned.
 */
add_action( 'wp_body_open', 'lurabio_render_header_bar' );
function lurabio_render_header_bar(): void {
    ?>
    <div class="lurabio-header-bar" role="banner">
        <div class="lurabio-header-inner">
            <a class="lurabio-logo" href="<?php echo esc_url( home_url( '/' ) ); ?>">
                <span class="lurabio-logo-text">LuraBio</span>
            </a>

            <nav class="lurabio-primary-nav" aria-label="<?php esc_attr_e( 'Primary navigation', 'lurabio-child' ); ?>">
                <?php
                wp_nav_menu( [
                    'theme_location'  => 'lurabio-primary',
                    'container'       => false,
                    'menu_class'      => 'lurabio-nav-list',
                    'fallback_cb'     => 'lurabio_fallback_nav',
                    'depth'           => 1,
                ] );
                ?>
            </nav>

            <div class="lurabio-header-actions">
                <?php if ( function_exists( 'wc_get_cart_url' ) ) : ?>
                    <a class="lurabio-cart-link" href="<?php echo esc_url( wc_get_cart_url() ); ?>" aria-label="<?php esc_attr_e( 'Cart', 'lurabio-child' ); ?>">
                        <span class="lurabio-cart-icon" aria-hidden="true">&#128722;</span>
                        <span class="lurabio-cart-count"><?php echo esc_html( WC()->cart ? WC()->cart->get_cart_contents_count() : 0 ); ?></span>
                    </a>
                <?php endif; ?>

                <?php if ( is_user_logged_in() ) : ?>
                    <a class="lurabio-account-link" href="<?php echo esc_url( wc_get_account_endpoint_url( 'dashboard' ) ); ?>">
                        <?php esc_html_e( 'Account', 'lurabio-child' ); ?>
                    </a>
                <?php else : ?>
                    <a class="lurabio-account-link" href="<?php echo esc_url( wc_get_page_permalink( 'myaccount' ) ); ?>">
                        <?php esc_html_e( 'Login', 'lurabio-child' ); ?>
                    </a>
                <?php endif; ?>

                <a class="lurabio-contact-email" href="mailto:research@lurabio.com" aria-label="<?php esc_attr_e( 'Email us', 'lurabio-child' ); ?>">
                    &#128231;
                </a>
            </div>
        </div>
    </div>
    <?php
}

/**
 * Fallback nav when no menu is assigned — renders hardcoded links.
 */
function lurabio_fallback_nav(): void {
    $links = [
        home_url( '/' )               => 'Home',
        home_url( '/products/' )      => 'Products',
        home_url( '/research/' )      => 'Research',
        home_url( '/partner-program/' ) => 'Partner Program',
        home_url( '/contact/' )       => 'Contact Us',
    ];
    echo '<ul class="lurabio-nav-list">';
    foreach ( $links as $url => $label ) {
        printf(
            '<li><a href="%s">%s</a></li>',
            esc_url( $url ),
            esc_html( $label )
        );
    }
    echo '</ul>';
}

/**
 * WooCommerce cart fragment — keeps header cart count in sync after AJAX add-to-cart.
 */
add_filter( 'woocommerce_add_to_cart_fragments', 'lurabio_cart_count_fragment' );
function lurabio_cart_count_fragment( array $fragments ): array {
    $count = WC()->cart->get_cart_contents_count();
    $fragments['.lurabio-cart-count'] = sprintf(
        '<span class="lurabio-cart-count">%s</span>',
        esc_html( $count )
    );
    return $fragments;
}

/**
 * Remove the default Kadence/WC page title on shop — we render our own.
 */
add_filter( 'woocommerce_show_page_title', '__return_false' );

/**
 * Disable WooCommerce's default breadcrumbs on shop and product pages.
 */
add_action( 'init', function () {
    remove_action( 'woocommerce_before_main_content', 'woocommerce_breadcrumb', 20 );
} );

<?php
/**
 * LuraBio Catalog — archive-product.php
 * Overrides woocommerce/archive-product.php
 */
defined( 'ABSPATH' ) || exit;

get_header();

$colors = lurabio_category_colors();
$labels = lurabio_category_labels();

// Fetch ALL published products in one query — filter client-side via JS
$products = wc_get_products( [
    'status'  => 'publish',
    'limit'   => -1,
    'orderby' => 'menu_order',
    'order'   => 'ASC',
] );
?>

<main class="lurabio-catalog-page">
    <div class="lurabio-catalog-inner">

        <header class="lurabio-catalog-header">
            <h1 class="lurabio-catalog-title">Research Catalog</h1>
            <p class="lurabio-catalog-subtitle">
                Precision-grade peptides for advanced research applications.
                For research use only — not for human or veterinary use.
            </p>
        </header>

        <!-- Category filter pills -->
        <div class="lurabio-filter-pills" role="group" aria-label="<?php esc_attr_e( 'Filter by research category', 'lurabio-child' ); ?>">
            <button class="lurabio-pill lurabio-pill--all" data-filter="" aria-pressed="true">
                All
            </button>
            <?php foreach ( $labels as $slug => $label ) :
                $hex = $colors[ $slug ] ?? '#E8E4DF';
            ?>
            <button class="lurabio-pill" data-filter="<?php echo esc_attr( $slug ); ?>" aria-pressed="false">
                <span class="lurabio-pill-swatch" style="background:<?php echo esc_attr( $hex ); ?>;"></span>
                <?php echo esc_html( $label ); ?>
            </button>
            <?php endforeach; ?>
        </div>

        <!-- Product grid -->
        <div class="lurabio-product-grid">

            <?php if ( $products ) :
                foreach ( $products as $product ) :
                    // Set global $product for WC template functions
                    $GLOBALS['product'] = $product;
                    $post_id = $product->get_id();

                    $category     = get_post_meta( $post_id, '_lurabio_research_category', true );
                    $purity       = get_post_meta( $post_id, '_lurabio_purity', true ) ?: '≥99%';
                    $sequence     = get_post_meta( $post_id, '_lurabio_sequence', true );
                    $bg_color     = $colors[ $category ] ?? '#F5F2EE';
                    $cat_label    = $labels[ $category ] ?? '';
                    $product_url  = get_permalink( $post_id );
                    $price_html   = $product->get_price_html();
                    $from_price   = wc_price( $product->get_price() );
                    $has_image    = $product->get_image_id();
            ?>

            <article class="lurabio-card"
                     data-category="<?php echo esc_attr( $category ); ?>"
                     data-hidden="false">

                <!-- Pastel-tinted image area -->
                <a href="<?php echo esc_url( $product_url ); ?>"
                   class="lurabio-card-image-wrap <?php echo $has_image ? '' : 'no-image'; ?>"
                   style="background-color:<?php echo esc_attr( $bg_color ); ?>;"
                   tabindex="-1" aria-hidden="true">
                    <?php if ( $has_image ) : ?>
                        <?php echo $product->get_image( 'woocommerce_thumbnail' ); ?>
                    <?php endif; ?>
                </a>

                <div class="lurabio-card-body">
                    <?php if ( $cat_label ) : ?>
                    <span class="lurabio-card-category"><?php echo esc_html( $cat_label ); ?></span>
                    <?php endif; ?>

                    <a class="lurabio-card-title" href="<?php echo esc_url( $product_url ); ?>">
                        <?php echo esc_html( $product->get_name() ); ?>
                    </a>

                    <?php if ( $sequence ) : ?>
                    <p class="lurabio-card-sequence" title="<?php echo esc_attr( $sequence ); ?>">
                        <?php echo esc_html( $sequence ); ?>
                    </p>
                    <?php endif; ?>
                </div>

                <footer class="lurabio-card-footer">
                    <div>
                        <div class="lurabio-card-price">
                            <?php if ( $product->is_type( 'variable' ) ) : ?>
                                <?php esc_html_e( 'From', 'lurabio-child' ); ?> <?php echo wc_price( $product->get_variation_price() ); ?>
                            <?php else : ?>
                                <?php echo wp_kses_post( $price_html ); ?>
                            <?php endif; ?>
                        </div>
                        <span class="lurabio-purity-badge">
                            <span class="lurabio-purity-dot" aria-hidden="true"></span>
                            <?php echo esc_html( $purity ); ?> Purity
                        </span>
                    </div>

                    <a class="lurabio-card-cta" href="<?php echo esc_url( $product_url ); ?>">
                        <?php esc_html_e( 'View Details', 'lurabio-child' ); ?> &#8594;
                    </a>
                </footer>

            </article>

            <?php
                endforeach;
            else : ?>

            <div class="lurabio-no-results">
                <?php esc_html_e( 'No products found.', 'lurabio-child' ); ?>
            </div>

            <?php endif; ?>

            <!-- No-results message for JS filter -->
            <p class="lurabio-no-results" hidden>
                <?php esc_html_e( 'No products in this category.', 'lurabio-child' ); ?>
            </p>

        </div><!-- .lurabio-product-grid -->

    </div><!-- .lurabio-catalog-inner -->
</main>

<?php get_footer(); ?>

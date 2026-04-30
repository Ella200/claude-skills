<?php
/**
 * LuraBio Clinical Data Sheet — single-product.php
 * Overrides woocommerce/single-product.php
 */
defined( 'ABSPATH' ) || exit;

get_header();

while ( have_posts() ) :
    the_post();

    global $product;

    $post_id  = get_the_ID();
    $colors   = lurabio_category_colors();
    $labels   = lurabio_category_labels();

    $cas       = get_post_meta( $post_id, '_lurabio_cas_number', true );
    $formula   = get_post_meta( $post_id, '_lurabio_molecular_formula', true );
    $mw        = get_post_meta( $post_id, '_lurabio_molecular_weight', true );
    $purity    = get_post_meta( $post_id, '_lurabio_purity', true ) ?: '≥99%';
    $storage   = get_post_meta( $post_id, '_lurabio_storage', true );
    $sequence  = get_post_meta( $post_id, '_lurabio_sequence', true );
    $category  = get_post_meta( $post_id, '_lurabio_research_category', true );

    $bg_color  = $colors[ $category ] ?? '#F5F2EE';
    $cat_label = $labels[ $category ] ?? '';
?>

<main class="lurabio-pdp" itemscope itemtype="https://schema.org/Product">

    <div class="lurabio-pdp-inner">

        <!-- Breadcrumb -->
        <nav class="lurabio-breadcrumb" aria-label="<?php esc_attr_e( 'Breadcrumb', 'lurabio-child' ); ?>">
            <a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Home', 'lurabio-child' ); ?></a>
            <span aria-hidden="true">/</span>
            <a href="<?php echo esc_url( wc_get_page_permalink( 'shop' ) ); ?>"><?php esc_html_e( 'Products', 'lurabio-child' ); ?></a>
            <span aria-hidden="true">/</span>
            <span><?php the_title(); ?></span>
        </nav>

        <!-- Top two-column section -->
        <div class="lurabio-pdp-top">

            <!-- Left: Product image -->
            <div class="lurabio-pdp-image-wrap"
                 style="background-color:<?php echo esc_attr( $bg_color ); ?>;">
                <?php
                if ( $product->get_image_id() ) {
                    echo $product->get_image( 'woocommerce_single' );
                } else {
                    echo '<span style="font-size:.6875rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(0,0,0,.2);">LuraBio</span>';
                }
                ?>
            </div>

            <!-- Right: Info panel -->
            <div class="lurabio-pdp-info" itemprop="name" content="<?php the_title_attribute(); ?>">

                <?php if ( $cat_label ) : ?>
                <span class="lurabio-pdp-category-tag"><?php echo esc_html( $cat_label ); ?></span>
                <?php endif; ?>

                <h1 class="lurabio-pdp-title"><?php the_title(); ?></h1>

                <?php if ( $sequence ) : ?>
                <p class="lurabio-pdp-sequence"><?php echo esc_html( $sequence ); ?></p>
                <?php endif; ?>

                <div class="lurabio-pdp-purity-row">
                    <span class="lurabio-pdp-purity-badge" itemprop="additionalProperty">
                        <span class="lurabio-purity-dot" aria-hidden="true"></span>
                        <?php echo esc_html( $purity ); ?> Purity
                    </span>
                    <?php if ( $cas ) : ?>
                    <span style="font-size:.75rem;color:#9B9B93;">CAS <?php echo esc_html( $cas ); ?></span>
                    <?php endif; ?>
                </div>

                <hr class="lurabio-pdp-divider">

                <div class="lurabio-pdp-price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                    <meta itemprop="priceCurrency" content="USD">
                    <?php echo wp_kses_post( $product->get_price_html() ); ?>
                </div>

                <!-- WooCommerce Add to Cart form -->
                <div class="lurabio-pdp-purchase">
                    <?php woocommerce_template_single_add_to_cart(); ?>
                </div>

                <p style="font-size:.6875rem;color:#9B9B93;margin:0;">
                    <?php esc_html_e( 'For research use only. Not for human or veterinary use.', 'lurabio-child' ); ?>
                </p>

            </div><!-- .lurabio-pdp-info -->

        </div><!-- .lurabio-pdp-top -->


        <!-- ★ 4-Column Technical Data Grid (Clinical Data Sheet) -->
        <section class="lurabio-tech-section" aria-label="<?php esc_attr_e( 'Technical specifications', 'lurabio-child' ); ?>">
            <p class="lurabio-tech-section-label"><?php esc_html_e( 'Technical Specifications', 'lurabio-child' ); ?></p>

            <div class="lurabio-tech-grid" role="table">
                <div class="lurabio-tech-cell" role="cell">
                    <div class="lurabio-tech-cell-label"><?php esc_html_e( 'CAS Number', 'lurabio-child' ); ?></div>
                    <div class="lurabio-tech-cell-value"><?php echo esc_html( $cas ?: '—' ); ?></div>
                </div>

                <div class="lurabio-tech-cell" role="cell">
                    <div class="lurabio-tech-cell-label"><?php esc_html_e( 'Molecular Formula', 'lurabio-child' ); ?></div>
                    <div class="lurabio-tech-cell-value"><?php echo esc_html( $formula ?: '—' ); ?></div>
                </div>

                <div class="lurabio-tech-cell" role="cell">
                    <div class="lurabio-tech-cell-label"><?php esc_html_e( 'Molecular Weight', 'lurabio-child' ); ?></div>
                    <div class="lurabio-tech-cell-value">
                        <?php echo $mw ? esc_html( number_format( (float) $mw, 2 ) ) . ' g/mol' : '—'; ?>
                    </div>
                </div>

                <div class="lurabio-tech-cell" role="cell">
                    <div class="lurabio-tech-cell-label"><?php esc_html_e( 'Purity', 'lurabio-child' ); ?></div>
                    <div class="lurabio-tech-cell-value"><?php echo esc_html( $purity ); ?></div>
                </div>
            </div>
        </section>


        <!-- Product description -->
        <?php if ( $product->get_description() ) : ?>
        <section class="lurabio-pdp-description">
            <h2><?php esc_html_e( 'Research Notes', 'lurabio-child' ); ?></h2>
            <?php echo wp_kses_post( $product->get_description() ); ?>
        </section>
        <?php endif; ?>


        <!-- Storage callout -->
        <?php if ( $storage ) : ?>
        <div class="lurabio-storage-callout" role="note">
            <span class="lurabio-storage-callout__icon" aria-hidden="true">&#10052;</span>
            <div class="lurabio-storage-callout__text">
                <strong><?php esc_html_e( 'Storage & Handling', 'lurabio-child' ); ?></strong>
                <p><?php echo esc_html( $storage ); ?></p>
            </div>
        </div>
        <?php endif; ?>


        <!-- Related products -->
        <?php
        $related_ids = wc_get_related_products( $post_id, 3 );
        if ( $related_ids ) :
            $related_products = array_map( 'wc_get_product', $related_ids );
        ?>
        <section class="lurabio-related-section">
            <h2><?php esc_html_e( 'Related Peptides', 'lurabio-child' ); ?></h2>
            <div class="lurabio-product-grid" style="grid-template-columns:repeat(3,1fr);">
                <?php foreach ( $related_products as $rp ) :
                    if ( ! $rp ) continue;
                    $rcat    = get_post_meta( $rp->get_id(), '_lurabio_research_category', true );
                    $rbg     = $colors[ $rcat ] ?? '#F5F2EE';
                    $rpurity = get_post_meta( $rp->get_id(), '_lurabio_purity', true ) ?: '≥99%';
                ?>
                <article class="lurabio-card">
                    <a href="<?php echo esc_url( get_permalink( $rp->get_id() ) ); ?>"
                       class="lurabio-card-image-wrap <?php echo $rp->get_image_id() ? '' : 'no-image'; ?>"
                       style="background-color:<?php echo esc_attr( $rbg ); ?>;" tabindex="-1" aria-hidden="true">
                        <?php if ( $rp->get_image_id() ) echo $rp->get_image( 'woocommerce_thumbnail' ); ?>
                    </a>
                    <div class="lurabio-card-body">
                        <a class="lurabio-card-title" href="<?php echo esc_url( get_permalink( $rp->get_id() ) ); ?>">
                            <?php echo esc_html( $rp->get_name() ); ?>
                        </a>
                    </div>
                    <footer class="lurabio-card-footer">
                        <span class="lurabio-purity-badge">
                            <span class="lurabio-purity-dot" aria-hidden="true"></span>
                            <?php echo esc_html( $rpurity ); ?>
                        </span>
                        <a class="lurabio-card-cta" href="<?php echo esc_url( get_permalink( $rp->get_id() ) ); ?>">
                            <?php esc_html_e( 'View', 'lurabio-child' ); ?> &#8594;
                        </a>
                    </footer>
                </article>
                <?php endforeach; ?>
            </div>
        </section>
        <?php endif; ?>

    </div><!-- .lurabio-pdp-inner -->

</main>

<?php
endwhile;
get_footer();
?>

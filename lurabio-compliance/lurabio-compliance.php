<?php
/**
 * Plugin Name: LuraBio Compliance
 * Description: Research Use Only checkout gate and Technical Peptide product schema.
 * Version:     1.0.0
 * Requires PHP: 8.1
 * Requires Plugins: woocommerce
 */

defined( 'ABSPATH' ) || exit;

define( 'LURABIO_DIR', plugin_dir_path( __FILE__ ) );

require_once LURABIO_DIR . 'includes/checkout-gate.php';
require_once LURABIO_DIR . 'includes/product-schema.php';

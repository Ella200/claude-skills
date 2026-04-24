/* global jQuery */
( function ( $ ) {
    'use strict';

    $( document.body ).on( 'click', '#place_order', function () {
        var $checkbox = $( '#lurabio_research_use_only' );
        if ( ! $checkbox.is( ':checked' ) ) {
            $checkbox.closest( '.lurabio-compliance-field' ).addClass( 'lurabio-field-error' );
        } else {
            $checkbox.closest( '.lurabio-compliance-field' ).removeClass( 'lurabio-field-error' );
        }
    } );
} )( jQuery );

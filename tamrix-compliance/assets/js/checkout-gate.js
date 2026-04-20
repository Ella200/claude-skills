/* global jQuery */
( function ( $ ) {
    'use strict';

    $( document.body ).on( 'click', '#place_order', function () {
        var $checkbox = $( '#tamrix_research_use_only' );
        if ( ! $checkbox.is( ':checked' ) ) {
            $checkbox.closest( '.tamrix-compliance-field' ).addClass( 'tamrix-field-error' );
        } else {
            $checkbox.closest( '.tamrix-compliance-field' ).removeClass( 'tamrix-field-error' );
        }
    } );
} )( jQuery );

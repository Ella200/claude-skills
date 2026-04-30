/**
 * LuraBio catalog filter — client-side, zero dependencies.
 * Filters .lurabio-card elements by data-category attribute.
 */
(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const pills = document.querySelectorAll('.lurabio-pill');
        const cards = document.querySelectorAll('.lurabio-card');
        const noResults = document.querySelector('.lurabio-no-results');

        if (!pills.length || !cards.length) return;

        pills.forEach(function (pill) {
            pill.addEventListener('click', function () {
                const target = this.dataset.filter; // '' = all

                // Update pill states
                pills.forEach(function (p) {
                    p.setAttribute('aria-pressed', p === pill ? 'true' : 'false');
                });

                // Show / hide cards
                var visible = 0;
                cards.forEach(function (card) {
                    var match = !target || card.dataset.category === target;
                    card.dataset.hidden = match ? 'false' : 'true';
                    if (match) visible++;
                });

                if (noResults) {
                    noResults.hidden = visible > 0;
                }

                // Push state to URL for shareability
                var url = new URL(window.location.href);
                if (target) {
                    url.searchParams.set('lurabio_cat', target);
                } else {
                    url.searchParams.delete('lurabio_cat');
                }
                history.replaceState(null, '', url.toString());
            });
        });

        // Restore filter from URL on load
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('lurabio_cat');
        if (initial) {
            var activePill = document.querySelector('.lurabio-pill[data-filter="' + initial + '"]');
            if (activePill) activePill.click();
        }
    });
}());

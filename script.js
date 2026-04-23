(function () {
    'use strict';

    var nav = document.getElementById('siteNav');
    var navToggle = document.getElementById('navToggle');
    var mainNav = document.getElementById('mainNav');

    if (nav) {
        function onScroll() {
            if (window.scrollY > 4) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            var open = mainNav.classList.toggle('open');
            navToggle.classList.toggle('open', open);
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        mainNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                mainNav.classList.remove('open');
                navToggle.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    var yearEl = document.getElementById('year');
    if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

    var FORM_ENDPOINT = 'https://carlbomsdata-form-submission.anvil.app/_/api/contact';
    var form = document.getElementById('contactForm');
    var status = document.getElementById('formStatus');
    var submitBtn = document.getElementById('submitBtn');

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            var data = new FormData(form);
            var payload = {
                namn: (data.get('namn') || '').trim(),
                email: (data.get('email') || '').trim(),
                foretag: (data.get('foretag') || '').trim(),
                meddelande: (data.get('meddelande') || '').trim(),
                website: (data.get('website') || '').trim()
            };

            if (!payload.namn || !payload.email || !payload.meddelande) {
                status.textContent = 'Fyll i namn, e-post och meddelande.';
                status.className = 'form-status';
                return;
            }

            status.textContent = 'Skickar…';
            status.className = 'form-status';
            submitBtn.disabled = true;

            try {
                var res = await fetch(FORM_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                var result = await res.json();
                if (res.ok && result.ok) {
                    form.reset();
                    status.textContent = 'Tack! Jag hör av mig inom kort.';
                    status.className = 'form-status success';
                } else {
                    status.textContent = result.error || 'Något gick fel. Prova mejla hello@carlbomsdata.se istället.';
                    status.className = 'form-status';
                }
            } catch (err) {
                status.textContent = 'Kunde inte nå servern. Prova mejla hello@carlbomsdata.se istället.';
                status.className = 'form-status';
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
})();

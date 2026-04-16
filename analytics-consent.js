/**
 * Pippy analytics consent loader.
 *
 * Non-EU visitors: Clarity loads immediately, no banner.
 * EU/EEA/UK visitors: banner appears, Clarity only loads on Accept.
 *
 * EU detection uses browser timezone (good enough for GDPR "reasonable
 * effort", no paid IP API needed). Choice persists in localStorage
 * under key "pippy_cookie_consent".
 */
(function () {
  var CLARITY_ID = 'wcd0ifq7kl';
  var CONSENT_KEY = 'pippy_cookie_consent';

  // Regex matches EU member states + EEA (Iceland, Liechtenstein, Norway)
  // + UK + Switzerland (covered by similar regimes). Intentionally broad.
  var EU_TZ = new RegExp('^(Europe\\/(Amsterdam|Andorra|Athens|Belgrade|Berlin|Bratislava|Brussels|Bucharest|Budapest|Busingen|Chisinau|Copenhagen|Dublin|Gibraltar|Guernsey|Helsinki|Isle_of_Man|Jersey|Kirov|Lisbon|Ljubljana|London|Luxembourg|Madrid|Malta|Mariehamn|Monaco|Nicosia|Oslo|Paris|Podgorica|Prague|Reykjavik|Riga|Rome|San_Marino|Sarajevo|Skopje|Sofia|Stockholm|Tallinn|Tirane|Vaduz|Vatican|Vienna|Vilnius|Warsaw|Zagreb|Zurich)|Atlantic\\/(Azores|Canary|Faroe|Madeira|Reykjavik))$');

  function loadClarity() {
    if (window.clarity) return;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  function isEU() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      return EU_TZ.test(tz);
    } catch (e) { return false; }
  }

  function readConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function writeConsent(val) {
    try { localStorage.setItem(CONSENT_KEY, val); } catch (e) {}
  }

  function injectBannerStyles() {
    if (document.getElementById('cb-styles')) return;
    var style = document.createElement('style');
    style.id = 'cb-styles';
    style.textContent = [
      '#cookie-banner{position:fixed;bottom:20px;left:20px;right:20px;max-width:640px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 20px 60px -10px rgba(47,71,110,.25),0 0 0 1px rgba(0,0,0,.05);padding:20px 24px;z-index:9999;font-family:"Plus Jakarta Sans",system-ui,-apple-system,sans-serif;animation:cbSlide .4s ease}',
      '@keyframes cbSlide{from{transform:translateY(120%);opacity:0}to{transform:translateY(0);opacity:1}}',
      '#cookie-banner .cb-inner{display:flex;gap:20px;align-items:center;justify-content:space-between;flex-wrap:wrap}',
      '#cookie-banner .cb-text{font-size:.92rem;line-height:1.5;color:#374151;flex:1;min-width:220px}',
      '#cookie-banner .cb-text strong{color:#111;font-weight:700}',
      '#cookie-banner .cb-text a{color:#7A9DB0;font-weight:600;text-decoration:underline}',
      '#cookie-banner .cb-buttons{display:flex;gap:8px;flex-shrink:0}',
      '#cookie-banner button{padding:10px 22px;border-radius:40px;font-weight:700;font-size:.9rem;cursor:pointer;border:none;font-family:inherit;transition:opacity .15s,background .15s}',
      '#cookie-banner .cb-decline{background:#f3f4f6;color:#374151}',
      '#cookie-banner .cb-decline:hover{background:#e5e7eb}',
      '#cookie-banner .cb-accept{background:#7A9DB0;color:#fff;box-shadow:0 4px 12px rgba(122,157,176,.35)}',
      '#cookie-banner .cb-accept:hover{opacity:.92}',
      '@media (max-width:520px){#cookie-banner{bottom:12px;left:12px;right:12px;padding:18px 20px}#cookie-banner .cb-buttons{width:100%}#cookie-banner button{flex:1}}'
    ].join('');
    document.head.appendChild(style);
  }

  function showBanner() {
    injectBannerStyles();
    var banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<div class="cb-inner">' +
        '<div class="cb-text">' +
          '<strong>We use optional cookies.</strong> We use Microsoft Clarity on this marketing site to see where visitors click and scroll. Decline and it never loads. ' +
          '<a href="/privacy.html">Privacy policy</a>.' +
        '</div>' +
        '<div class="cb-buttons">' +
          '<button class="cb-decline" type="button">Decline</button>' +
          '<button class="cb-accept" type="button">Accept</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    banner.querySelector('.cb-accept').addEventListener('click', function () {
      writeConsent('accepted');
      banner.remove();
      loadClarity();
    });
    banner.querySelector('.cb-decline').addEventListener('click', function () {
      writeConsent('declined');
      banner.remove();
    });
  }

  function init() {
    // Non-EU: load immediately, no banner.
    if (!isEU()) {
      loadClarity();
      return;
    }
    // EU: honor prior choice, else show banner.
    var prior = readConsent();
    if (prior === 'accepted') { loadClarity(); return; }
    if (prior === 'declined') { return; }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }

  init();
})();

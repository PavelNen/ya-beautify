/* ============================================================
   Ya Beautify — content.js
   Updated for Yandex DOM structure as of April 2026.
   ============================================================ */

(function yaBeautify() {
  'use strict';

  /* Force-hide via inline style (survives any CSS specificity war) */
  var HIDE = [
    /* old DOM */
    '.theader__personal-item_favs',
    '.theader__personal-item_mail',
    '.theader__personal-left > div:first-child',
    '.content__bottom',
    '.reasoning-section',
    /* new DOM */
    '.headline__personal-item_favs',
    '.headline__personal-item_mail',
    '.plus-link',
    '.body__content_feed_yes',
    '.body__feed-wrapper',
  ];

  function hide(el) {
    if (el) el.style.setProperty('display', 'none', 'important');
  }

  function applyHide() {
    HIDE.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(hide);
    });
  }

  /* Theme handled entirely via CSS (mix-blend-mode + backdrop-filter) */

  /* ── Informers: move to body root + pin to bottom ─────────── */

  function moveInformers() {
    var informers = document.querySelector('div.informers, aside.informers3');
    if (!informers) return;

    if (informers.parentElement !== document.body) {
      document.body.appendChild(informers);
    }

    /* Position pinned via CSS; only visibility needs JS override */
    informers.style.setProperty('display',     'flex',       'important');
    informers.style.setProperty('visibility',  'visible',    'important');
  }

  /* ── Logo ─────────────────────────────────────────────────── */

  function injectLogo() {
    if (document.getElementById('yab-logo')) return;
    var form = document.querySelector('form.mini-suggest');
    if (!form) return;

    /* Hide blank spacer div immediately before the form */
    var prev = form.previousElementSibling;
    if (prev && prev.tagName === 'DIV' && !prev.id && !prev.className) {
      hide(prev);
    }

    /* Hide Yandex's own standalone logo (div > img or div > svg) */
    var el = prev ? prev.previousElementSibling : null;
    while (el) {
      var cls = el.className || '';
      if (
        (el.tagName === 'DIV' || el.tagName === 'A') &&
        (el.querySelector('img, svg') || el.textContent.trim().length < 40) &&
        !cls.includes('theader') &&
        !cls.includes('headline') &&
        !cls.includes('informer') &&
        !cls.includes('suggest') &&
        !el.id
      ) {
        hide(el);
        break;
      }
      el = el.previousElementSibling;
    }

    /* Inject our SVG logo */
    var logo = document.createElement('div');
    logo.id = 'yab-logo';
    var img = document.createElement('img');
    img.src = chrome.runtime.getURL('logo.svg');
    img.alt = 'Яндекс';
    img.draggable = false;
    logo.appendChild(img);
    form.parentElement.insertBefore(logo, form);
  }

  /* ── Services chips ───────────────────────────────────────── */

  var SERVICES = [
    { text: 'Алиса AI',  href: 'https://alice.yandex.ru/?utm_source=yandex&utm_campaign=home_web&utm_medium=interface' },
    { text: 'Квартиры',  href: 'https://yandex.ru/realty/' },
    { text: 'Услуги',    href: 'https://yandex.ru/services' },
    { text: 'Товары',    href: 'https://yandex.ru/products' },
    { text: 'Медицина',  href: 'https://yandex.ru/medicine' },
    { text: 'Бизнес',    href: 'https://business.yandex.ru/' },
  ];

  function injectServices() {
    if (document.getElementById('yab-services')) return;
    var form = document.querySelector('form.mini-suggest');
    if (!form) return;

    var wrap = document.createElement('nav');
    wrap.id = 'yab-services';

    var ul = document.createElement('ul');
    SERVICES.forEach(function(item) {
      var li = document.createElement('li');
      var a  = document.createElement('a');
      a.href        = item.href;
      a.textContent = item.text;
      a.target      = '_blank';
      a.rel         = 'noopener';
      li.appendChild(a);
      ul.appendChild(li);
    });

    wrap.appendChild(ul);
    form.parentElement.insertBefore(wrap, form.nextSibling);
  }

  /* ── Init ─────────────────────────────────────────────────── */

  function run() {
    applyHide();
    moveInformers();
    injectLogo();
    injectServices();
  }

  run();

  var observer = new MutationObserver(run);

  function init() {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(function() { observer.disconnect(); }, 10000);
    }

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

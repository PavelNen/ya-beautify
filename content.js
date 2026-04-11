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

  /* ── Theme detection: read actual body background ────────── */

  function isDarkTheme() {
    var bg = getComputedStyle(document.body).backgroundColor;
    var rgb = bg.match(/\d+/g);
    if (!rgb || rgb.length < 3) return false;
    var lum = parseInt(rgb[0]) * 0.299 + parseInt(rgb[1]) * 0.587 + parseInt(rgb[2]) * 0.114;
    return lum < 128;
  }

  /* ── Informers: move to body root + pin to bottom ─────────── */

  function moveInformers() {
    var informers = document.querySelector('div.informers, aside.informers3');
    if (!informers) return;

    if (informers.parentElement !== document.body) {
      document.body.appendChild(informers);
    }

    var dark = isDarkTheme();
    informers.style.setProperty('display',     'flex',       'important');
    informers.style.setProperty('visibility',  'visible',    'important');
    informers.style.setProperty('position',    'fixed',   'important');
    informers.style.setProperty('bottom',      '0',       'important');
    informers.style.setProperty('left',        '0',       'important');
    informers.style.setProperty('right',       '0',       'important');
    informers.style.setProperty('z-index',     '99999',   'important');
    informers.style.setProperty('background',  dark ? '#1c1c1c' : '#f8f9fa', 'important');
    informers.style.setProperty('border-top',  dark ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(0,0,0,.08)', 'important');
    informers.style.setProperty('padding',     '0 24px',  'important');
    informers.style.setProperty('box-sizing',  'border-box', 'important');
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
    if (isDarkTheme()) {
      img.style.filter = 'invert(1)';
    }
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

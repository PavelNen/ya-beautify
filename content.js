/* ============================================================
   Ya Beautify — content.js
   Updated for Yandex DOM structure as of April 2026.
   ============================================================ */

(function yaBeautify() {
  'use strict';

  /* Force-hide via inline style (survives any CSS specificity war) */
  var HIDE = [
    '.theader__personal-item_favs',
    '.theader__personal-item_mail',
    '.plus-link',
    '.content__bottom',
    '.reasoning-section',
  ];

  function hide(el) {
    if (el) el.style.setProperty('display', 'none', 'important');
  }

  function applyHide() {
    HIDE.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(hide);
    });
  }

  /* ── Informers: move to body root + pin to bottom ─────────── */

  function moveInformers() {
    var informers = document.querySelector('div.informers');
    if (!informers) return;

    if (informers.parentElement !== document.body) {
      document.body.appendChild(informers);
    }

    informers.style.setProperty('position', 'fixed',   'important');
    informers.style.setProperty('bottom',   '0',        'important');
    informers.style.setProperty('left',     '0',        'important');
    informers.style.setProperty('right',    '0',        'important');
    informers.style.setProperty('z-index',  '9999',     'important');
    informers.style.setProperty('background', '#f8f9fa','important');
    informers.style.setProperty('border-top','1px solid #e4e4e4','important');
    informers.style.setProperty('padding',  '0 24px',  'important');
    informers.style.setProperty('box-sizing','border-box','important');
  }

  /* ── Logo ─────────────────────────────────────────────────── */

  function injectLogo() {
    if (document.getElementById('yab-logo')) return;
    var form = document.querySelector('form.mini-suggest');
    if (!form) return;

    /* Hide Yandex's own standalone logo (div > img before the form) */
    var el = form.previousElementSibling;
    while (el) {
      if (
        el.tagName === 'DIV' &&
        el.querySelector('img') &&
        !el.className.includes('theader') &&
        !el.className.includes('informers') &&
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
    logo.innerHTML =
      '<img src="' + chrome.runtime.getURL('logo.svg') + '"' +
           ' alt="Яндекс" draggable="false">';
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

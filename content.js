/* ============================================================
   Ya Beautify — content.js
   Restructures the Yandex home page to look clean and
   minimalist, like Google's search page.

   Strategy:
   1. Find the main logo and search form in Yandex's DOM.
   2. Build a new full-page layout (#yab-container) containing
      a minimal header, centred logo + search form, and a footer.
   3. Move (not clone) the original logo and search DOM nodes
      into the new layout so their event handlers stay intact.
   4. Mark every original direct body child as hidden.
   5. Use a MutationObserver to retry until Yandex's dynamic
      content has finished loading.
   ============================================================ */

(function yaBeautify() {
  'use strict';

  /* Short prefix used for all our IDs / classes / attributes */
  const P = 'yab';

  /* ── Selector lists (tried in order; first match wins) ──── */
  const SEL = {
    logo: [
      '.home-logo',
      '.logo',
      '#logo',
      '[data-log="logo"]',
    ],
    searchForm: [
      '.search2',
      '[class*="search2_"]',
      '.mini-suggest',
      '[class*="mini-suggest"]',
      'form[action="/search/"]',
      'form[action*="search"]',
    ],
    headerEl: [
      '.home-header',
      '.header2',
      'header',
    ],
    /* Decorative "Я" icon sitting inside the search input */
    yaIcon: [
      '.input__icon',
      '.input__logo',
      '[class*="InputIcon"]',
      '[class*="InputLogo"]',
      '[class*="input-logo"]',
      '[class*="search-logo"]',
      '[class*="search__logo"]',
    ],
    /* Avatar in Yandex's original header */
    avatar: [
      '.user-pic',
      '.avatar',
      '[class*="Avatar"]',
      '[class*="user-pic"]',
      '[class*="UserPic"]',
    ],
    /* Input control (the <input> element itself) */
    inputControl: [
      'input[name="text"]',
      '.input__control',
      'input[type="text"]',
    ],
  };

  /* ── Helpers ─────────────────────────────────────────────── */

  /** Return the first element that matches any selector in the list. */
  function q(selectors, root) {
    root = root || document;
    for (var i = 0; i < selectors.length; i++) {
      try {
        var el = root.querySelector(selectors[i]);
        if (el) return el;
      } catch (e) { /* ignore invalid selectors */ }
    }
    return null;
  }

  /** Hide an element with !important so Yandex's own styles can't override. */
  function hide(el) {
    if (el) el.style.setProperty('display', 'none', 'important');
  }

  /** Hide all matches across a list of selectors. */
  function hideAll(selectors, root) {
    root = root || document;
    for (var i = 0; i < selectors.length; i++) {
      try {
        var els = root.querySelectorAll(selectors[i]);
        for (var j = 0; j < els.length; j++) hide(els[j]);
      } catch (e) { /* ignore */ }
    }
  }

  /* ── Build the minimal top header ──────────────────────────
     Mirrors Google's header: Mail · Images · grid-icon · avatar
  ─────────────────────────────────────────────────────────── */
  function buildHeader(originalHeader) {
    var header = document.createElement('header');
    header.id = P + '-header';

    var right = document.createElement('div');
    right.id = P + '-header-right';

    /* Navigation links */
    var links = [
      { text: 'Почта',     href: 'https://mail.yandex.ru' },
      { text: 'Картинки',  href: 'https://yandex.ru/images/' },
    ];
    links.forEach(function(item) {
      var a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.text;
      a.className = P + '-header-link';
      right.appendChild(a);
    });

    /* Services grid icon */
    var servicesLink = document.createElement('a');
    servicesLink.id = P + '-services-icon';
    servicesLink.href = 'https://yandex.ru/all';
    servicesLink.title = 'Сервисы Яндекса';
    servicesLink.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">' +
        '<rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor"/>' +
        '<rect x="7.5" y="1" width="5" height="5" rx="1" fill="currentColor"/>' +
        '<rect x="14" y="1" width="5" height="5" rx="1" fill="currentColor"/>' +
        '<rect x="1" y="7.5" width="5" height="5" rx="1" fill="currentColor"/>' +
        '<rect x="7.5" y="7.5" width="5" height="5" rx="1" fill="currentColor"/>' +
        '<rect x="14" y="7.5" width="5" height="5" rx="1" fill="currentColor"/>' +
        '<rect x="1" y="14" width="5" height="5" rx="1" fill="currentColor"/>' +
        '<rect x="7.5" y="14" width="5" height="5" rx="1" fill="currentColor"/>' +
        '<rect x="14" y="14" width="5" height="5" rx="1" fill="currentColor"/>' +
      '</svg>';
    right.appendChild(servicesLink);

    /* User avatar — grab the original if it exists */
    if (originalHeader) {
      var avatarEl = q(SEL.avatar, originalHeader);
      if (avatarEl) {
        var avatarWrap = document.createElement('div');
        avatarWrap.id = P + '-avatar';
        avatarWrap.appendChild(avatarEl.cloneNode(true));
        right.appendChild(avatarWrap);
      }
    }

    header.appendChild(right);
    return header;
  }

  /* ── Build the two search buttons ────────────────────────── */
  function buildButtons(searchEl) {
    var wrap = document.createElement('div');
    wrap.id = P + '-buttons';

    /* "Найти в Яндексе" — submits the search form */
    var searchBtn = document.createElement('button');
    searchBtn.className = P + '-btn';
    searchBtn.type = 'button';
    searchBtn.textContent = 'Найти в Яндексе';
    searchBtn.addEventListener('click', function() {
      var form = searchEl.tagName === 'FORM'
        ? searchEl
        : searchEl.querySelector('form');
      if (form) {
        form.submit();
      } else {
        var input = q(SEL.inputControl, searchEl);
        if (input && input.value.trim()) {
          window.location.href =
            'https://yandex.ru/search/?text=' +
            encodeURIComponent(input.value.trim());
        }
      }
    });

    /* "Мне повезёт!" — navigates directly to the search results */
    var luckyBtn = document.createElement('button');
    luckyBtn.className = P + '-btn';
    luckyBtn.type = 'button';
    luckyBtn.textContent = 'Мне повезёт!';
    luckyBtn.addEventListener('click', function() {
      var input = q(SEL.inputControl, searchEl);
      var query = input ? input.value.trim() : '';
      if (query) {
        window.location.href =
          'https://yandex.ru/search/?text=' +
          encodeURIComponent(query);
      }
    });

    wrap.appendChild(searchBtn);
    wrap.appendChild(luckyBtn);
    return wrap;
  }

  /* ── Build the bottom footer ──────────────────────────────── */
  function buildFooter() {
    var footer = document.createElement('footer');
    footer.id = P + '-footer';

    var left = document.createElement('div');
    left.textContent = 'Россия';

    var right = document.createElement('div');
    right.innerHTML =
      '<a href="https://yandex.ru/legal/confidential/">Конфиденциальность</a>' +
      ' · ' +
      '<a href="https://yandex.ru/legal/terms/">Условия</a>';

    footer.appendChild(left);
    footer.appendChild(right);
    return footer;
  }

  /* ── Remove the red "Я" logo from the search input ──────────
     It is typically a decorative element placed as the first
     sibling before the <input> inside the input wrapper.
  ─────────────────────────────────────────────────────────── */
  function removeYaIcon(searchEl) {
    /* Try known class selectors first */
    hideAll(SEL.yaIcon, searchEl);

    /* Fallback: hide every element that comes before the text
       input inside its wrapper and has no interactive children */
    var inputEl = q(SEL.inputControl, searchEl);
    if (!inputEl) return;

    /* Walk up to find the closest wrapper that contains the input
       as a direct child */
    var wrapper = inputEl.parentElement;
    if (!wrapper) return;

    var children = Array.prototype.slice.call(wrapper.children);
    var inputIdx = children.indexOf(inputEl);
    for (var i = 0; i < inputIdx; i++) {
      var child = children[i];
      if (child.tagName !== 'LABEL' && !child.querySelector('input, button, a')) {
        hide(child);
      }
    }
  }

  /* ── Main restructuring function ────────────────────────── */
  function run() {
    /* Already done */
    if (document.getElementById(P + '-container')) return;

    var searchEl = q(SEL.searchForm);
    if (!searchEl) return; /* DOM not ready — observer will retry */

    var logoEl     = q(SEL.logo);
    var headerEl   = q(SEL.headerEl);

    /* ── Build our new full-page layout ── */

    var container = document.createElement('div');
    container.id = P + '-container';

    /* 1. Fixed header */
    container.appendChild(buildHeader(headerEl));

    /* 2. Centred main content */
    var content = document.createElement('main');
    content.id = P + '-content';

    if (logoEl) {
      var logoWrap = document.createElement('div');
      logoWrap.id = P + '-logo';
      logoWrap.appendChild(logoEl); /* moves the node — preserves styles */
      content.appendChild(logoWrap);
    }

    var searchWrap = document.createElement('div');
    searchWrap.id = P + '-search';
    searchWrap.appendChild(searchEl); /* moves the node */
    searchWrap.appendChild(buildButtons(searchEl));
    content.appendChild(searchWrap);

    container.appendChild(content);

    /* 3. Fixed footer */
    container.appendChild(buildFooter());

    /* ── Insert and activate ── */
    document.body.insertBefore(container, document.body.firstChild);
    document.body.classList.add(P + '-active');

    /* Hide every remaining direct body child (except our container
       and non-visual elements like <script>, <style>, <link>) */
    var KEEP_TAGS = { SCRIPT:1, STYLE:1, LINK:1, META:1, NOSCRIPT:1, TEMPLATE:1 };
    Array.prototype.forEach.call(document.body.children, function(child) {
      if (child.id === P + '-container') return;
      if (KEEP_TAGS[child.tagName]) return;
      hide(child);
    });

    /* Remove the red Я icon from the search bar */
    removeYaIcon(searchEl);
  }

  /* ── Initialise with retry via MutationObserver ──────────── */

  var observer = new MutationObserver(function() {
    if (!document.getElementById(P + '-container')) {
      run();
    } else {
      observer.disconnect();
    }
  });

  function init() {
    run();
    if (!document.getElementById(P + '-container') && document.body) {
      /* Observe only direct body children to avoid deep recursion */
      observer.observe(document.body, { childList: true, subtree: false });
    }
    /* Stop trying after 15 s regardless */
    setTimeout(function() { observer.disconnect(); }, 15000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

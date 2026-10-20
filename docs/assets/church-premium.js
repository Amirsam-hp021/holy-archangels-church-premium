/* ==========================================================================
   Holy Archangels Armenian Church — premium motion layer
   WPCode → JavaScript Snippet → Site Wide Header (it waits for the page itself).
   Pairs with church-premium.css.
   ========================================================================== */
(function () {
  'use strict';
  var d = document, html = d.documentElement, w = window;

  // Never run inside the Elementor editor / preview.
  if (/[?&](elementor-preview|elementor_library|preview_id)=/.test(location.search)) return;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) html.classList.add('chp-js');

  function ready(fn) {
    if (d.readyState !== 'loading') fn(); else d.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    if (d.body.classList.contains('elementor-editor-active')) { html.classList.remove('chp-js'); return; }
    try { init(); html.classList.add('chp-live'); }
    catch (e) { html.classList.remove('chp-js'); if (w.console) console.warn('[church-premium]', e); }
  });

  /* ---------- helpers ---------- */
  function $$(sel, root) { return Array.prototype.slice.call((root || d).querySelectorAll(sel)); }
  function css(el) { return w.getComputedStyle(el); }
  function px(v) { return parseFloat(v) || 0; }
  function rgb(v) { var m = (v || '').match(/[\d.]+/g); return m ? m.map(Number) : null; }
  function isLight(v) { var c = rgb(v); return c && (c.length < 4 || c[3] > .6) && c[0] > 235 && c[1] > 235 && c[2] > 235; }
  function isClear(v) { var c = rgb(v); return !c || (c.length === 4 && c[3] < .1); }
  function isPurple(v) { var c = rgb(v); return c && (c.length < 4 || c[3] > .6) && c[2] > c[1] + 25 && c[0] > c[1]; }
  function inside(el, sel) { return !!(el.parentElement && el.parentElement.closest(sel)); }

  var SVG_ORN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0l2.2 9.8L24 12l-9.8 2.2L12 24l-2.2-9.8L0 12l9.8-2.2z"/></svg>';

  function init() {
    var page = $$('[data-elementor-type]').filter(function (r) {
      return !r.closest('#masthead') && !r.closest('#colophon') && !inside(r, '[data-elementor-type]');
    })[0];
    var sections = page ? $$(':scope > .e-con, :scope > .elementor-section', page) : [];

    if (page) {
      tagCards(page);
      tagHeadings(page);
      tagEyebrows(page);
      tagButtons(page);
      tagHero(sections[0]);
      tagBanners(sections);
      addOrnaments(page);
      tagImages(page);
      reveal(page, sections);
    }
    $$('#colophon .elementor-widget-button, #masthead .elementor-widget-button').forEach(function (b) { tagButton(b); });
    header();
    nav();
    chrome();
    loop();
  }

  /* ---------- typography ---------- */
  function tagHeadings(page) {
    $$('.elementor-widget-heading', page).forEach(function (wd) {
      var t = wd.querySelector('.elementor-heading-title');
      if (!t || wd.closest('.chp-card-like')) return;
      var s = px(css(t).fontSize), text = (t.textContent || '').trim();
      if (/^\d/.test(text)) return;                         // times like "10:00 AM" stay in the sans
      if (isLight(css(t).color)) wd.classList.add('chp-on-dark');
      if (s >= 50) wd.classList.add('chp-display', 'chp-display--xl');
      else if (s >= 32) wd.classList.add('chp-display', 'chp-display--lg');
      else if (s >= 26 && text.length < 40) wd.classList.add('chp-display', 'chp-display--md');
    });
  }

  function tagEyebrows(page) {
    $$('.elementor-widget-icon-box', page).forEach(function (wd) {
      var t = wd.querySelector('.elementor-icon-box-title');
      if (t && /satisfy|dancing|great vibes|allura|parisienne/i.test(css(t).fontFamily)) {
        if (isLight(css(t).color)) wd.classList.add('chp-on-dark');
        wd.classList.add('chp-eyebrow');
      }
    });
  }

  /* ---------- buttons ---------- */
  function tagButton(wd) {
    var b = wd.querySelector('.elementor-button');
    if (!b) return;
    var bg = css(b).backgroundColor;
    if (isPurple(bg)) wd.classList.add('chp-btn-solid');
    else if (isLight(bg) || isClear(bg)) wd.classList.add('chp-btn-light');
    if (/learn more|read more|view|discover/i.test(b.textContent || '')) wd.classList.add('chp-btn-arrow');
  }
  function tagButtons(page) { $$('.elementor-widget-button', page).forEach(tagButton); }

  /* ---------- cards ---------- */
  function tagCards(page) {
    // 1. wrappers that draw a coloured top bar around a card (border-top only)
    $$('.e-con.e-child', page).forEach(function (c) {
      var s = css(c), t = px(s.borderTopWidth);
      if (t >= 2 && px(s.borderLeftWidth) === 0 && px(s.borderBottomWidth) === 0 && isPurple(s.borderTopColor) && c.offsetWidth < 900) {
        if (inside(c, '.chp-card')) return;
        c.classList.add('chp-card', 'chp-card-like', 'chp-topline');
        c.style.setProperty('--chp-tl', t + 'px');
      }
    });
    // 2. white, bordered or shadowed boxes (containers and boxed icon-box widgets)
    $$('.e-con.e-child, .elementor-widget-icon-box', page).forEach(function (c) {
      if (c.classList.contains('chp-card') || c.closest('.chp-card')) return;
      var s = css(c);
      if (!isLight(s.backgroundColor)) return;
      var bw = px(s.borderTopWidth) + px(s.borderLeftWidth) + px(s.borderRightWidth) + px(s.borderBottomWidth);
      var radius = px(s.borderTopLeftRadius) + px(s.borderBottomRightRadius);
      if ((bw < 1 && s.boxShadow === 'none') || radius < 4) return;
      if (c.offsetWidth > 900) return;
      if (c.classList.contains('e-con') && !c.querySelector('.elementor-widget')) return;
      c.classList.add('chp-card', 'chp-card-like');
      $$('.chp-card', c).forEach(function (inner) { inner.classList.remove('chp-card', 'chp-topline'); });
    });
  }

  /* ---------- hero ---------- */
  var hero = null;
  function tagHero(sec) {
    if (!sec) return;
    var set = sec.getAttribute('data-settings') || '';
    var s = css(sec);
    var media = /"background_background":"(video|slideshow)"/.test(set) || s.backgroundImage !== 'none';
    if (!media || sec.offsetHeight < 420) return;
    hero = sec;
    sec.classList.add('chp-hero');
    var inner = sec.querySelector(':scope > .e-con-inner') || sec;

    var veil = d.createElement('div');
    veil.className = 'chp-veil';
    veil.setAttribute('aria-hidden', 'true');
    inner.insertBefore(veil, inner.firstChild);

    if (!reduce) {
      var motes = d.createElement('div');
      motes.className = 'chp-motes';
      motes.setAttribute('aria-hidden', 'true');
      var n = w.innerWidth < 768 ? 9 : 18, out = '';
      for (var i = 0; i < n; i++) {
        var size = (2 + Math.random() * 5).toFixed(1);
        out += '<span style="left:' + (Math.random() * 100).toFixed(1) + '%;--s:' + size + 'px;--d:' + (11 + Math.random() * 12).toFixed(1) +
          's;--delay:-' + (Math.random() * 20).toFixed(1) + 's;--x:' + (Math.random() * 80 - 40).toFixed(0) + 'px;--h:' +
          (sec.offsetHeight * (.6 + Math.random() * .5)).toFixed(0) + 'px;--o:' + (.35 + Math.random() * .5).toFixed(2) + '"></span>';
      }
      motes.innerHTML = out;
      inner.insertBefore(motes, veil.nextSibling);
    }

    var cue = d.createElement('button');
    cue.type = 'button';
    cue.className = 'chp-cue';
    cue.setAttribute('aria-label', 'Scroll to content');
    cue.addEventListener('click', function () {
      var next = sec.nextElementSibling;
      if (!next) return;
      var hh = (d.querySelector('#masthead') || {}).offsetHeight || 0;
      var top = next.getBoundingClientRect().top + w.pageYOffset - hh + (headerTopbar || 0);
      w.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
    sec.appendChild(cue);
  }

  /* ---------- banners: photo-background sections ----------
     Elementor lazy-loads section backgrounds, so each section is checked when it nears the viewport.
     If Elementor's own Motion Effects already move the photo, we only add the vignette. */
  var banners = [], pending = [];
  function tagBanners(sections) {
    pending = sections.filter(function (sec) { return sec !== hero; });
    checkBanners();
  }
  function bgUrl(el) { var b = el && css(el).backgroundImage; return b && /url\(/.test(b) ? b : ''; }
  function checkBanners() {
    var vh = w.innerHeight;
    pending = pending.filter(function (sec) {
      var r = sec.getBoundingClientRect();
      if (r.top > vh * 2) return true;                     // not near yet — keep waiting
      var motion = sec.querySelector(':scope > .elementor-motion-effects-container > .elementor-motion-effects-layer');
      var img = bgUrl(sec);
      if (!img && !bgUrl(motion)) {
        // lazy background not applied yet: keep checking while the section is still ahead of us
        return /background_background":"classic"/.test(sec.getAttribute('data-settings') || '') && r.bottom > 0 && !sec.classList.contains('e-lazyloaded');
      }
      sec.classList.add('chp-banner');
      var dark = $$('.elementor-heading-title, .elementor-widget-text-editor', sec).some(function (t) { return isLight(css(t).color); });
      if (dark) sec.classList.add('chp-banner--dark');
      if (img && !motion && !reduce) {
        var layer = d.createElement('div');
        layer.className = 'chp-par';
        layer.setAttribute('aria-hidden', 'true');
        layer.style.backgroundImage = img;
        layer.style.backgroundPosition = css(sec).backgroundPosition;
        sec.insertBefore(layer, sec.firstChild);
        sec.style.setProperty('background-image', 'none', 'important');
        banners.push({ el: sec, layer: layer });
      }
      return false;
    });
  }

  /* ---------- ornaments under centred section titles ---------- */
  function addOrnaments(page) {
    $$('.chp-display--lg', page).forEach(function (wd) {
      if (wd.closest('.chp-hero, .chp-banner, .chp-card')) return;
      var t = wd.querySelector('.elementor-heading-title');
      var align = css(t).textAlign;
      var orn = d.createElement('span');
      orn.className = 'chp-orn' + (align === 'center' ? '' : ' chp-orn--start');
      orn.setAttribute('aria-hidden', 'true');
      orn.innerHTML = '<i></i>' + SVG_ORN + '<i></i>';
      t.parentNode.insertBefore(orn, t.nextSibling);
    });
  }

  /* ---------- feature images: curtain wipe ---------- */
  function tagImages(page) {
    $$('.elementor-widget-image', page).forEach(function (wd) {
      if (wd.closest('.chp-card, .chp-hero') || wd.classList.contains('elementor-absolute')) return;
      var img = wd.querySelector('img');
      if (!img || (img.getBoundingClientRect().width || img.width) < 260) return;
      wd.classList.add('chp-img-wipe');
    });
  }

  /* ---------- scroll reveal ---------- */
  function reveal(page, sections) {
    if (reduce || !('IntersectionObserver' in w)) {
      $$('.elementor-widget, .chp-card', page).forEach(function (el) { el.classList.add('chp-in'); });
      return;
    }
    var vh = w.innerHeight, targets = [];
    sections.forEach(function (sec, i) {
      if (sec === hero) return;
      var preHidden = i > 0;                                // CSS already hides widgets in sections 2+
      $$('.chp-card', sec).forEach(function (card) {
        if (preHidden || card.getBoundingClientRect().top > vh) { card.classList.add('chp-rv'); targets.push(card); }
        else card.classList.add('chp-noreveal');
      });
      $$('.elementor-widget', sec).forEach(function (wd) {
        if (wd.closest('.chp-card')) return;
        if (wd.classList.contains('elementor-absolute') || /_animation/.test(wd.getAttribute('data-settings') || '')) return;
        if (preHidden) { targets.push(wd); return; }
        if (wd.getBoundingClientRect().top > vh) { wd.classList.add('chp-pre'); targets.push(wd); }
        else wd.classList.add('chp-noreveal');
      });
    });

    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return (a.boundingClientRect.top - b.boundingClientRect.top) || (a.boundingClientRect.left - b.boundingClientRect.left); });
      batch.forEach(function (e, k) {
        var el = e.target, delay = Math.min(k, 7) * 90;
        io.unobserve(el);
        if (delay) {
          el.style.transitionDelay = delay + 'ms';
          setTimeout(function () { el.style.transitionDelay = ''; }, delay + 1300);
        }
        el.classList.add('chp-in');
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    targets.forEach(function (t) { io.observe(t); });

    // Anything already scrolled past (e.g. reload mid-page) shows at once.
    setTimeout(function () {
      targets.forEach(function (t) { if (t.getBoundingClientRect().bottom < 0) t.classList.add('chp-in'); });
    }, 300);
  }

  /* ---------- header ---------- */
  var headerTopbar = 0;
  function header() {
    var bar = d.querySelector('#masthead .elementor-element-f48d669');
    var measure = function () {
      headerTopbar = bar && bar.offsetParent !== null ? bar.offsetHeight : 0;
      html.style.setProperty('--chp-topbar-h', headerTopbar + 'px');
    };
    measure();
    w.addEventListener('resize', measure);
  }

  /* ---------- navigation: gliding ink/pill, give-button glow, burger ---------- */
  function nav() {
    $$('#masthead .hfe-nav-menu__layout-horizontal > .hfe-nav-menu').forEach(function (ul) {
      // HFE styles the LAST <li> as its button, so the ink lives on the <nav>, not inside the <ul>
      var box = ul.parentElement;
      var items = $$(':scope > .menu-item', ul).slice(0, -1);
      if (!items.length || !box) return;
      var ink = d.createElement('span'), pill = d.createElement('span');
      ink.className = 'chp-ink'; pill.className = 'chp-pill';
      ink.setAttribute('aria-hidden', 'true'); pill.setAttribute('aria-hidden', 'true');
      box.appendChild(pill); box.appendChild(ink);
      var current = items.filter(function (li) { return /current-menu-(item|ancestor)|current_page_item/.test(li.className); })[0];

      function place(li) {
        var a = li.querySelector('a.hfe-menu-item'); if (!a) return;
        var ur = box.getBoundingClientRect(), ar = a.getBoundingClientRect();
        var tw = ar.width;
        try { var range = d.createRange(); range.selectNodeContents(a); var rr = range.getBoundingClientRect(); if (rr.width) tw = Math.min(ar.width, rr.width); } catch (e) {}
        var inkW = Math.max(18, tw * .7);
        ink.style.setProperty('--w', inkW + 'px');
        ink.style.setProperty('--x', (ar.left - ur.left + (ar.width - inkW) / 2) + 'px');
        ink.style.setProperty('--b', Math.max(2, ur.bottom - ar.bottom + 4) + 'px');
        pill.style.setProperty('--w', ar.width + 'px');
        pill.style.setProperty('--x', (ar.left - ur.left) + 'px');
        pill.style.setProperty('--t', (ar.top - ur.top + ar.height * .12) + 'px');
        pill.style.setProperty('--h', (ar.height * .76) + 'px');
      }
      function rest() {
        box.classList.remove('chp-nav-hover');
        if (current) { place(current); box.classList.add('chp-nav-on'); }
        else box.classList.remove('chp-nav-on');
      }
      items.forEach(function (li) {
        li.addEventListener('mouseenter', function () {
          if (!box.classList.contains('chp-nav-on')) { box.classList.add('chp-nav-jump'); place(li); ul.offsetWidth; box.classList.remove('chp-nav-jump'); }
          place(li);
          box.classList.add('chp-nav-on', 'chp-nav-hover');
        });
        li.addEventListener('focusin', function () { place(li); box.classList.add('chp-nav-on', 'chp-nav-hover'); });
      });
      ul.addEventListener('mouseleave', rest);
      ul.addEventListener('focusout', function (e) { if (!ul.contains(e.relatedTarget)) rest(); });
      // place under the current page once the load-in cascade has settled
      box.classList.add('chp-nav-jump');
      setTimeout(function () { rest(); setTimeout(function () { box.classList.remove('chp-nav-jump'); }, 50); }, 1100);
      w.addEventListener('resize', function () { box.classList.add('chp-nav-jump'); rest(); setTimeout(function () { box.classList.remove('chp-nav-jump'); }, 50); });
      if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { if (!box.classList.contains('chp-nav-hover')) rest(); });

      var give = ul.lastElementChild;
      var ga = give && give.querySelector('a');
      if (ga) {
        var size = function () { give.style.setProperty('--gw', ga.offsetWidth + 'px'); give.style.setProperty('--gh', ga.offsetHeight + 'px'); };
        size(); w.addEventListener('resize', size);
      }
    });

    // mobile toggle: CSS burger that morphs to an X; cascade the items when opened
    $$('#masthead .hfe-nav-menu__toggle').forEach(function (tg) {
      // HFE rewrites the icon's contents on toggle, so the burger sits beside it
      var icon = tg.querySelector('.hfe-nav-menu-icon');
      if (icon && !tg.querySelector('.chp-burger')) {
        var b = d.createElement('span');
        b.className = 'chp-burger';
        b.setAttribute('aria-hidden', 'true');
        b.innerHTML = '<i></i><i></i><i></i>';
        icon.parentNode.insertBefore(b, icon.nextSibling);
        tg.classList.add('chp-has-burger');
      }
      var widget = tg.closest('.elementor-widget');
      var sync = function () { if (widget) widget.classList.toggle('chp-menu-open', tg.getAttribute('aria-expanded') === 'true'); };
      if ('MutationObserver' in w) new MutationObserver(sync).observe(tg, { attributes: true, attributeFilter: ['aria-expanded'] });
    });
  }

  /* ---------- progress bar + back to top ---------- */
  var progress, topBtn;
  function chrome() {
    progress = d.createElement('div');
    progress.className = 'chp-progress';
    progress.setAttribute('aria-hidden', 'true');
    d.body.appendChild(progress);

    topBtn = d.createElement('button');
    topBtn.type = 'button';
    topBtn.className = 'chp-top';
    topBtn.setAttribute('aria-label', 'Back to top');
    topBtn.innerHTML = '<svg viewBox="0 0 50 50" aria-hidden="true"><circle class="chp-ring" cx="25" cy="25" r="23"/><path class="chp-arrow" d="M25 31V19m-6 6 6-6 6 6"/></svg>';
    topBtn.addEventListener('click', function () { w.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
    d.body.appendChild(topBtn);
  }

  /* ---------- one rAF-throttled scroll loop ---------- */
  function loop() {
    var ticking = false;
    function frame() {
      ticking = false;
      var y = w.pageYOffset, vh = w.innerHeight;
      var max = Math.max(1, d.documentElement.scrollHeight - vh);
      var p = Math.min(1, y / max);
      html.style.setProperty('--chp-sp', p.toFixed(4));
      d.body.classList.toggle('chp-scrolled', y > 60);
      if (topBtn) topBtn.classList.toggle('is-on', y > vh * .8);

      if (hero && !reduce) {
        var h = hero.offsetHeight || 1;
        if (y < h * 1.2) hero.style.setProperty('--chp-hero-p', Math.min(1, y / h).toFixed(3));
      }
      if (pending.length) checkBanners();
      if (!reduce) banners.forEach(function (b) {
        var r = b.el.getBoundingClientRect();
        if (r.bottom < -50 || r.top > vh + 50) return;
        var c = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2); // -1 … 1
        b.layer.style.setProperty('--chp-par', (c * r.height * .12).toFixed(1) + 'px');
      });
    }
    function onScroll() { if (!ticking) { ticking = true; w.requestAnimationFrame(frame); } }
    w.addEventListener('scroll', onScroll, { passive: true });
    w.addEventListener('resize', onScroll);
    frame();
  }
})();

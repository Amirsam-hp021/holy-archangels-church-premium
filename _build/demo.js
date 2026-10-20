/* Demo-only helpers for the GitHub Pages preview (not part of the WordPress install). */
(function () {
  var d = document, off = !!window.CHP_OFF;

  // On / off switch
  var bar = d.createElement('button');
  bar.type = 'button';
  bar.setAttribute('aria-label', 'Toggle premium design');
  bar.innerHTML = '<span class="dot"></span><span>Premium design: <b>' + (off ? 'OFF' : 'ON') + '</b></span>';
  var st = d.createElement('style');
  st.textContent =
    '.chp-demo-toggle{position:fixed;left:18px;bottom:18px;z-index:99999;display:flex;align-items:center;gap:10px;padding:11px 18px;border:0;border-radius:999px;' +
    'font:600 13px/1 Poppins,system-ui,sans-serif;letter-spacing:.02em;cursor:pointer;color:#fff;background:linear-gradient(135deg,#7D58A0,#2A1B3A);' +
    'box-shadow:0 14px 30px -12px rgba(42,27,58,.7),0 0 0 1px rgba(230,205,139,.35);transition:transform .3s}' +
    '.chp-demo-toggle:hover{transform:translateY(-2px)}.chp-demo-toggle b{color:#E6CD8B}' +
    '.chp-demo-toggle .dot{width:9px;height:9px;border-radius:50%;background:' + (off ? '#999' : '#E6CD8B') + ';box-shadow:0 0 0 4px rgba(230,205,139,' + (off ? '0' : '.25') + ')}' +
    '.chp-demo-note{position:fixed;left:50%;bottom:80px;transform:translateX(-50%);z-index:99999;padding:12px 20px;border-radius:12px;background:#2A1B3A;color:#fff;' +
    'font:500 14px/1.4 Poppins,system-ui,sans-serif;box-shadow:0 18px 40px -16px rgba(0,0,0,.6)}';
  d.head.appendChild(st);
  bar.className = 'chp-demo-toggle';
  bar.addEventListener('click', function () {
    try { localStorage.setItem('chpOff', off ? '0' : '1'); } catch (e) {}
    location.reload();
  });
  d.body.appendChild(bar);

  // Keep the contact form from sending real messages from the demo
  function note(msg) {
    var n = d.createElement('div');
    n.className = 'chp-demo-note';
    n.textContent = msg;
    d.body.appendChild(n);
    setTimeout(function () { n.remove(); }, 3200);
  }
  d.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.nf-form-cont input[type="submit"], .nf-form-cont button, form input[type="submit"]');
    if (!t) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    note('This is a design preview — the form is disabled here.');
  }, true);
  d.addEventListener('submit', function (e) { e.preventDefault(); e.stopImmediatePropagation(); }, true);
})();

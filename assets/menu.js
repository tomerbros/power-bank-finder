// Slide-out side menu (see assets/menu.css). Any element with data-menu-open opens it.
(function () {
  var body = document.body;
  var drawer = document.getElementById('drawer');
  var scrim = document.getElementById('drawerScrim');
  if (!drawer || !scrim) return;
  var openers = document.querySelectorAll('[data-menu-open]');
  var closeBtn = drawer.querySelector('.drawer-close');
  var lastFocus = null;
  var isOpen = function () { return body.classList.contains('menu-open'); };

  function setOpen(open) {
    body.classList.toggle('menu-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) drawer.removeAttribute('inert'); else drawer.setAttribute('inert', '');
    for (var i = 0; i < openers.length; i++) openers[i].setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      lastFocus = document.activeElement;
      closeBtn.focus();
      try { window.umami && window.umami.track('menu-open'); } catch (e) { /* stats are optional */ }
    } else if (lastFocus && lastFocus.focus) {
      lastFocus.focus();
    }
  }

  for (var i = 0; i < openers.length; i++) openers[i].addEventListener('click', function () { setOpen(true); });
  closeBtn.addEventListener('click', function () { setOpen(false); });
  scrim.addEventListener('click', function () { setOpen(false); });
  drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });

  document.addEventListener('keydown', function (e) {
    if (!isOpen()) return;
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key !== 'Tab') return;               // keep keyboard focus inside the open menu
    var items = Array.prototype.filter.call(drawer.querySelectorAll('a, button, summary'),
      function (el) { return el.offsetParent !== null; });
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // Swipe the menu to the left to close it, like a phone app
  var startX = null, startY = null;
  drawer.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }, { passive: true });
  drawer.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX, dy = e.changedTouches[0].clientY - startY;
    if (dx < -60 && Math.abs(dx) > Math.abs(dy)) setOpen(false);
    startX = null;
  });

  // Highlight the page you're on (and open the Countries list when you're on a country or city page)
  var here = location.pathname;
  var links = drawer.querySelectorAll('nav a');
  for (var j = 0; j < links.length; j++) {
    var href = links[j].getAttribute('href');
    var match = href === here || (href !== '/' && here.indexOf(href) === 0 && links[j].closest('details'));
    if (match) {
      links[j].setAttribute('aria-current', 'page');
      var group = links[j].closest('details');
      if (group) group.open = true;
    }
  }
})();

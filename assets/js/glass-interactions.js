(function () {
	var supportsFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
	var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (!supportsFinePointer || reducedMotion) {
		return;
	}

	function bindGlassSurface(surface) {
		var frame = null;
		var lastEvent = null;

		function updatePosition() {
			if (!lastEvent) {
				frame = null;
				return;
			}

			var rect = surface.getBoundingClientRect();
			var x = ((lastEvent.clientX - rect.left) / rect.width) * 100;
			var y = ((lastEvent.clientY - rect.top) / rect.height) * 100;

			surface.style.setProperty('--mx', Math.max(0, Math.min(100, x)).toFixed(2) + '%');
			surface.style.setProperty('--my', Math.max(0, Math.min(100, y)).toFixed(2) + '%');
			frame = null;
		}

		surface.addEventListener('pointermove', function (event) {
			lastEvent = event;

			if (!frame) {
				frame = window.requestAnimationFrame(updatePosition);
			}
		});

		surface.addEventListener('pointerleave', function () {
			lastEvent = null;
			surface.style.removeProperty('--mx');
			surface.style.removeProperty('--my');
		});
	}

	document.addEventListener('DOMContentLoaded', function () {
		Array.prototype.forEach.call(document.querySelectorAll('[data-glass]'), bindGlassSurface);
	});
})();

/* Click ripple for buttons and nav controls */
(function () {
	var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reducedMotion) {
		return;
	}

	var RIPPLE_SELECTOR = 'a.button, button.button, #nav ul.links a, #nav ul.icons a.icon, #nav ul.icons button';

	function spawnRipple(target, event) {
		var rect = target.getBoundingClientRect();
		if (!rect.width || !rect.height) {
			return;
		}

		var size = Math.max(rect.width, rect.height) * 1.15;
		var clientX = typeof event.clientX === 'number' ? event.clientX : rect.left + rect.width / 2;
		var clientY = typeof event.clientY === 'number' ? event.clientY : rect.top + rect.height / 2;

		var ripple = document.createElement('span');
		ripple.className = 'fx-ripple';
		ripple.style.width = ripple.style.height = size + 'px';
		ripple.style.left = (clientX - rect.left - size / 2) + 'px';
		ripple.style.top = (clientY - rect.top - size / 2) + 'px';

		ripple.addEventListener('animationend', function () {
			if (ripple.parentNode) {
				ripple.parentNode.removeChild(ripple);
			}
		});

		target.appendChild(ripple);
	}

	document.addEventListener('pointerdown', function (event) {
		if (typeof event.button === 'number' && event.button !== 0) {
			return;
		}
		if (!event.target || !event.target.closest) {
			return;
		}
		var target = event.target.closest(RIPPLE_SELECTOR);
		if (!target) {
			return;
		}
		spawnRipple(target, event);
	}, { passive: true });
})();

/* Page-to-page transition: cross-document View Transitions ("sheet drop").
   The browser keeps the current page painted on screen, renders the next page,
   then animates between the two real snapshots (styled in design-v2.css) so the
   incoming page drops in over the old one with no black/blank frame.

   We deliberately do NOT prefetch or prerender. Both make a navigation
   intermittently get served from a speculation cache, and such navigations do
   not reliably run the cross-document view transition — which is exactly why
   the effect "sometimes" fell back to a plain switch. A pure, native navigation
   fires the transition every time; the browser keeps the old page on screen
   while the new one loads, so there is still no black frame.

   This script's only job now is local-dev URLs: on localhost (static dev servers
   like VS Code Live Server) extensionless internal links are rewritten to their
   .html file, since only production (Cloudflare Pages) serves clean URLs. */
(function () {
	var host = window.location.hostname;
	var isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '';

	/* Localhost-only diagnostic: surface when a navigation does NOT run the
	   cross-document view transition, so intermittent fallbacks can be traced.
	   `pageswap` fires on the outgoing page, `pagereveal` on the incoming one;
	   their `viewTransition` is null when the browser declined the transition. */
	if (isLocal) {
		window.addEventListener('pageswap', function (event) {
			try {
				console.log('[pagefx] pageswap — viewTransition:', !!(event && event.viewTransition),
					'| navType:', event && event.activation && event.activation.navigationType);
			} catch (error) {}
		});
		window.addEventListener('pagereveal', function (event) {
			try {
				console.log('[pagefx] pagereveal — viewTransition:', !!(event && event.viewTransition));
			} catch (error) {}
		});
	}

	function isInternalNavigation(anchor) {
		if (!anchor || !anchor.getAttribute) {
			return false;
		}
		var rawHref = anchor.getAttribute('href');
		if (!rawHref || rawHref.charAt(0) === '#') {
			return false;
		}
		if (anchor.target && anchor.target !== '_self') {
			return false;
		}
		if (anchor.hasAttribute('download')) {
			return false;
		}

		var url;
		try {
			url = new URL(anchor.href, window.location.href);
		} catch (error) {
			return false;
		}

		if (url.protocol !== 'http:' && url.protocol !== 'https:') {
			return false;
		}
		if (url.origin !== window.location.origin) {
			return false;
		}
		if (url.pathname === window.location.pathname && url.hash) {
			return false;
		}
		return true;
	}

	function resolveDestination(anchor) {
		var url = new URL(anchor.href, window.location.href);
		if (isLocal) {
			var path = url.pathname;
			if (path !== '/' && path.charAt(path.length - 1) !== '/' && !/\.[a-z0-9]+$/i.test(path)) {
				return url.origin + path + '.html' + url.search + url.hash;
			}
		}
		return url.href;
	}

	/* Only intervene on click for local dev, where extensionless links need the
	   .html suffix. Everywhere else the browser navigates natively, which is what
	   triggers the cross-document view transition. */
	if (isLocal) {
		document.addEventListener('click', function (event) {
			if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
				return;
			}
			if (!event.target || !event.target.closest) {
				return;
			}
			var anchor = event.target.closest('a[href]');
			if (!isInternalNavigation(anchor)) {
				return;
			}
			var destination = resolveDestination(anchor);
			if (destination !== anchor.href) {
				event.preventDefault();
				window.location.href = destination;
			}
		});
	}
})();

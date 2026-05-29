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

/* Silence the benign "Transition was skipped" rejection that browsers emit
   when a cross-document view transition is interrupted mid-navigation. */
(function () {
	window.addEventListener('unhandledrejection', function (event) {
		var reason = event && event.reason;
		var message = (reason && reason.message) || (typeof reason === 'string' ? reason : '');
		if (message && message.indexOf('Transition was skipped') !== -1) {
			event.preventDefault();
		}
	});
})();

/* Page-to-page transition: declarative view transitions when supported,
   otherwise a lightweight opacity fade-out before navigation. */
(function () {
	var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var nativeViewTransitions = !!(window.CSS && CSS.supports && CSS.supports('view-transition-name', 'none'));

	if (reducedMotion || nativeViewTransitions) {
		return;
	}

	var root = document.documentElement;
	root.classList.add('pagefx-js');

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

		event.preventDefault();
		var destination = anchor.href;
		root.classList.add('is-pagefx-leaving');
		window.setTimeout(function () {
			window.location.href = destination;
		}, 230);
	});

	window.addEventListener('pageshow', function () {
		root.classList.remove('is-pagefx-leaving');
	});
})();

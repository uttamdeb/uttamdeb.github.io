/* Behaviour for the two share surfaces, /scan-me and /details.
   Both pages are fully usable without this file: the QR renders in full, the
   contacts are ordinary links, the vCard opens straight from its href, and the
   explore cue is a real link you can click or tab to. */
(function () {
	/* ---- /scan-me: bloom the code outward as it comes into view ---------- */
	function setupScanCard() {
		var frame = document.querySelector('.scan-frame');
		if (!frame) {
			return;
		}

		var card = frame.querySelector('.scan-card');

		/* Only now that the script is running do we let CSS hide the code's
		   starting state — otherwise a scripting failure would leave the page
		   with nothing to scan, which is the one thing it exists to do. */
		document.body.classList.add('qr-anim');

		function play() {
			frame.classList.remove('is-live');
			/* force a reflow so the animations and transitions restart cleanly */
			void frame.offsetWidth;
			frame.classList.add('is-live');
		}

		if (!('IntersectionObserver' in window)) {
			frame.classList.add('is-live');
		} else {
			var observer = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (!entry.isIntersecting) {
						return;
					}
					play();
					observer.disconnect();
				});
			}, { threshold: 0.35 });

			observer.observe(frame);
		}

		if (!card) {
			return;
		}

		/* Replaying on tap is the point: when you hand the screen to someone,
		   the code assembling itself is what makes them look at it. */
		card.addEventListener('click', play);
		card.addEventListener('keydown', function (event) {
			if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
				event.preventDefault();
				play();
			}
		});
	}

	/* ---- /details: share sheet, with a clipboard fallback ---------------- */
	function setupShare() {
		var button = document.querySelector('[data-share]');
		if (!button) {
			return;
		}

		var toast = document.querySelector('[data-toast]');
		var url = button.getAttribute('data-share-url') || window.location.href;
		var title = button.getAttribute('data-share-title') || document.title;
		var timer = null;

		function flash(message) {
			if (!toast) {
				return;
			}
			toast.textContent = message;
			toast.classList.add('is-shown');
			window.clearTimeout(timer);
			timer = window.setTimeout(function () {
				toast.classList.remove('is-shown');
			}, 2400);
		}

		button.addEventListener('click', function () {
			if (navigator.share) {
				/* A cancelled share sheet rejects; that is not an error. */
				navigator.share({ title: title, url: url }).catch(function () {});
				return;
			}

			if (navigator.clipboard && navigator.clipboard.writeText) {
				navigator.clipboard.writeText(url).then(function () {
					flash('Link copied');
				}, function () {
					flash(url);
				});
				return;
			}

			flash(url);
		});
	}

	/* ---- /details: a word after the vCard opens ------------------------- */
	function setupVcard() {
		var link = document.querySelector('[data-vcard]');
		var toast = document.querySelector('[data-toast]');
		if (!link || !toast) {
			return;
		}

		var timer = null;
		link.addEventListener('click', function () {
			/* The browser hands the card to the OS; the last step is theirs. */
			toast.textContent = 'Confirm to add the contact';
			toast.classList.add('is-shown');
			window.clearTimeout(timer);
			timer = window.setTimeout(function () {
				toast.classList.remove('is-shown');
			}, 3600);
		});
	}

	/* ---- /details: scrolling down is what carries you into the site ------
	   The card fits one screen, so there is usually nothing to scroll. We read
	   downward intent instead and let it fill a small meter before navigating,
	   so arriving at the site is something the reader did deliberately rather
	   than something a stray trackpad tick did to them. The cue stays a real
	   link, so clicking it and reaching it by keyboard both still work. */
	function setupExplore() {
		var cue = document.querySelector('[data-explore]');
		if (!cue) {
			return;
		}

		var target = cue.getAttribute('href') || '/';
		var THRESHOLD = 170;   /* px of accumulated downward intent */
		var intent = 0;
		var fired = false;
		var armed = false;
		var decayTimer = null;

		/* Momentum carried over from the previous page shouldn't count. */
		window.setTimeout(function () { armed = true; }, 600);

		function atBottom() {
			var doc = document.documentElement;
			var scrolled = window.pageYOffset || doc.scrollTop || 0;
			return (scrolled + window.innerHeight) >= (doc.scrollHeight - 4);
		}

		function render() {
			cue.style.setProperty('--p', (intent / THRESHOLD).toFixed(3));
		}

		function decay() {
			window.clearTimeout(decayTimer);
			decayTimer = window.setTimeout(function step() {
				if (fired || intent <= 0) {
					return;
				}
				intent = Math.max(0, intent - THRESHOLD * 0.12);
				render();
				decayTimer = window.setTimeout(step, 40);
			}, 260);
		}

		function push(delta) {
			if (fired || !armed || delta <= 0 || !atBottom()) {
				return;
			}

			intent = Math.min(THRESHOLD, intent + delta);
			render();

			if (intent >= THRESHOLD) {
				fired = true;
				window.clearTimeout(decayTimer);
				cue.classList.add('is-triggering');
				window.location.href = target;
				return;
			}

			decay();
		}

		function pull(delta) {
			if (fired || delta <= 0) {
				return;
			}
			intent = Math.max(0, intent - delta);
			render();
		}

		window.addEventListener('wheel', function (event) {
			if (event.deltaY > 0) {
				push(event.deltaY);
			} else {
				pull(-event.deltaY);
			}
		}, { passive: true });

		var touchY = null;
		window.addEventListener('touchstart', function (event) {
			touchY = event.touches.length ? event.touches[0].clientY : null;
		}, { passive: true });

		window.addEventListener('touchmove', function (event) {
			if (touchY === null || !event.touches.length) {
				return;
			}
			var y = event.touches[0].clientY;
			/* finger travelling up = content scrolling down */
			var delta = touchY - y;
			touchY = y;
			if (delta > 0) {
				push(delta);
			} else {
				pull(-delta);
			}
		}, { passive: true });

		window.addEventListener('touchend', function () {
			touchY = null;
			decay();
		}, { passive: true });

		window.addEventListener('keydown', function (event) {
			if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === 'End') {
				push(THRESHOLD * 0.55);
			}
		});
	}

	document.addEventListener('DOMContentLoaded', function () {
		setupScanCard();
		setupShare();
		setupVcard();
		setupExplore();
	});
})();

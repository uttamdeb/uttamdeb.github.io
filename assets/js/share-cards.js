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

	/* ---- /details: open the phone's own add-contact screen ---------------
	   iOS already does the right thing: the markup links straight at a
	   text/x-vcard file with no `download` attribute, so Safari shows its
	   "Add to Contacts" sheet with everything filled in — no file, no detour.

	   Android is the gap. Chrome downloads the .vcf and makes you tap the
	   notification to import it. Chromium browsers do understand `intent://`
	   URLs though, so there we swap the href for an ACTION_INSERT intent, which
	   drops the reader straight into the contact editor with the fields
	   prefilled. It carries no photo — that is the trade for skipping the
	   download — and `browser_fallback_url` sends anything that cannot handle
	   the intent back to the .vcf.

	   The href in the markup is the vCard, so this is purely an upgrade: with
	   no JavaScript, or on any platform we do not special-case, the file link
	   is what runs. */
	var CONTACT = {
		name: 'Uttam Deb',
		phone: '+8801718067555',
		email: 'uttamdeb670@gmail.com',
		company: '10 Minute School',
		job_title: 'Assistant Manager of Business Intelligence and Specialist AI Systems Developer',
		postal: 'Dhaka, Bangladesh',
		notes: 'https://uttamdeb.com'
	};

	function androidIntentUrl(fallbackUrl) {
		var parts = [
			'intent://contact/#Intent',
			'action=android.intent.action.INSERT',
			'type=vnd.android.cursor.dir/contact'
		];

		Object.keys(CONTACT).forEach(function (key) {
			parts.push('S.' + key + '=' + encodeURIComponent(CONTACT[key]));
		});

		parts.push('S.browser_fallback_url=' + encodeURIComponent(fallbackUrl));
		parts.push('end');
		return parts.join(';');
	}

	function prefersAndroidIntent() {
		var ua = navigator.userAgent || '';
		if (!/Android/i.test(ua)) {
			return false;
		}
		/* Firefox for Android has no intent: support and would simply stall. */
		return /Chrome|CriOS|SamsungBrowser|EdgA|OPR/i.test(ua) && !/Firefox|FxiOS/i.test(ua);
	}

	function setupVcard() {
		var link = document.querySelector('[data-vcard]');
		if (!link) {
			return;
		}

		if (prefersAndroidIntent()) {
			link.setAttribute('href', androidIntentUrl(link.href));
			link.setAttribute('data-vcard-mode', 'intent');
		}

		var toast = document.querySelector('[data-toast]');
		if (!toast) {
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

		/* ---- crystals shed while the gesture is held ---------------------- */
		var FLAKE = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='%23fff' stroke-width='2.3' stroke-linecap='round'%3E%3Cpath d='M12 2.5v19M3.8 7.25l16.4 9.5M20.2 7.25l-16.4 9.5'/%3E%3Cpath d='M12 6.1 9.9 4M12 6.1 14.1 4M12 17.9 9.9 20M12 17.9l2.1 2.1'/%3E%3Cpath d='m7.4 9 -2.9-.5M7.4 9l-.5-2.9M16.6 15l2.9.5M16.6 15l.5 2.9'/%3E%3Cpath d='m7.4 15-2.9.5M7.4 15l-.5 2.9M16.6 9l2.9-.5M16.6 9l.5-2.9'/%3E%3C/g%3E%3C/svg%3E\")";
		var TINTS = ['var(--accent)', 'var(--accent-2)', 'var(--warm)'];
		var MAX_FLAKES = 32;
		var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		var layer = null;
		var live = 0;
		var shedAt = 0;

		function flakeLayer() {
			if (!layer) {
				layer = document.createElement('div');
				layer.className = 'explore-flakes';
				document.body.appendChild(layer);
			}
			return layer;
		}

		function shed(count) {
			if (reduced) {
				return;
			}

			var dial = cue.querySelector('.explore-dial') || cue;
			var box = dial.getBoundingClientRect();
			var host = flakeLayer();

			for (var i = 0; i < count && live < MAX_FLAKES; i++) {
				var el = document.createElement('span');
				var size = 8 + Math.random() * 7;
				el.className = 'explore-flake';
				el.style.left = (box.left + box.width * (0.15 + Math.random() * 0.7)) + 'px';
				el.style.top = (box.top + box.height * (0.6 + Math.random() * 0.3)) + 'px';
				el.style.color = TINTS[(Math.random() * TINTS.length) | 0];
				el.style.setProperty('--flake', FLAKE);
				el.style.setProperty('--size', size.toFixed(1) + 'px');
				el.style.setProperty('--dx', ((Math.random() - 0.5) * 104).toFixed(1) + 'px');
				el.style.setProperty('--dy', (52 + Math.random() * 72).toFixed(1) + 'px');
				el.style.setProperty('--rot', ((Math.random() - 0.5) * 300).toFixed(0) + 'deg');
				el.style.setProperty('--dur', (1150 + Math.random() * 900).toFixed(0) + 'ms');
				el.style.setProperty('--peak', (0.68 + Math.random() * 0.32).toFixed(2));

				live++;
				el.addEventListener('animationend', function () {
					live--;
					if (this.parentNode) {
						this.parentNode.removeChild(this);
					}
				});

				host.appendChild(el);
			}
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

			/* Keyed to progress, not to raw delta: browsers scale wheel and touch
			   deltas very differently, and the shed should look the same density
			   whatever device the gesture came from. */
			var pct = intent / THRESHOLD;
			while (pct - shedAt >= 0.04) {
				shedAt += 0.04;
				shed(shedAt > 0.6 ? 2 : 1);
			}

			if (intent >= THRESHOLD) {
				fired = true;
				window.clearTimeout(decayTimer);
				cue.classList.add('is-triggering');
				shed(10);
				/* let the burst register before the page turns over */
				window.setTimeout(function () {
					window.location.href = target;
				}, 130);
				return;
			}

			decay();
		}

		function pull(delta) {
			if (fired || delta <= 0) {
				return;
			}
			intent = Math.max(0, intent - delta);
			shedAt = Math.min(shedAt, intent / THRESHOLD);
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

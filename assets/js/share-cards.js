/* Behaviour for the two share surfaces, /scan-me and /details.
   Both pages are fully usable without this file: the QR renders in full, the
   contact rows are ordinary links, and the vCard is a plain download. */
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

	document.addEventListener('DOMContentLoaded', function () {
		setupScanCard();
		setupShare();
	});
})();

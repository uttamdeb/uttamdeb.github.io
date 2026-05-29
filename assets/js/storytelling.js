(function () {
	var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function revealImmediately(elements) {
		elements.forEach(function (element) {
			element.classList.add('is-visible');
		});
	}

	function observeReveals(elements) {
		if (!('IntersectionObserver' in window) || reducedMotion) {
			revealImmediately(elements);
			return;
		}

		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					observer.unobserve(entry.target);
				}
			});
		}, {
			rootMargin: '0px 0px -12% 0px',
			threshold: 0.16
		});

		elements.forEach(function (element) {
			observer.observe(element);
		});
	}

	function observeChapters(chapters) {
		if (!('IntersectionObserver' in window) || reducedMotion) {
			if (chapters[0]) {
				chapters[0].classList.add('is-current');
			}
			return;
		}

		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					chapters.forEach(function (chapter) {
						chapter.classList.toggle('is-current', chapter === entry.target);
					});
				}
			});
		}, {
			rootMargin: '-32% 0px -45% 0px',
			threshold: 0
		});

		chapters.forEach(function (chapter) {
			observer.observe(chapter);
		});
	}

	function hydrateLazyImages(images) {
		if (!images.length) return;

		function swap(img) {
			var src = img.getAttribute('data-src');
			if (!src) return;
			img.setAttribute('src', src);
			img.removeAttribute('data-src');
		}

		if (!('IntersectionObserver' in window)) {
			images.forEach(swap);
			return;
		}

		var booth = images[0].closest('.serenity-booth') || images[0].parentNode;
		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				images.forEach(function (img, idx) {
					window.setTimeout(function () { swap(img); }, idx * 140);
				});
				observer.disconnect();
			});
		}, { rootMargin: '320px 0px' });

		observer.observe(booth);
	}

	function setupSerenityLightbox() {
		var booth = document.querySelector('.serenity-booth');
		if (!booth) return;

		var front = booth.querySelector('.serenity-card--front');
		var frontImgs = Array.prototype.slice.call(booth.querySelectorAll('.serenity-card--front .serenity-img'));
		var captionLines = Array.prototype.slice.call(booth.querySelectorAll('.serenity-caption-line'));
		if (!front || !frontImgs.length) return;

		var items = frontImgs.map(function (img, i) {
			return {
				src: img.getAttribute('data-src') || img.currentSrc || img.src,
				caption: captionLines[i] ? captionLines[i].textContent.trim() : ''
			};
		});

		var ICON_PREV = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
		var ICON_NEXT = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
		var ICON_CLOSE = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

		var overlay = document.createElement('div');
		overlay.className = 'serenity-lightbox';
		overlay.setAttribute('role', 'dialog');
		overlay.setAttribute('aria-modal', 'true');
		overlay.setAttribute('aria-label', 'Serenity photo viewer');
		overlay.innerHTML =
			'<button type="button" class="serenity-lightbox-close" aria-label="Close viewer">' + ICON_CLOSE + '</button>' +
			'<button type="button" class="serenity-lightbox-btn serenity-lightbox-prev" aria-label="Previous photo">' + ICON_PREV + '</button>' +
			'<button type="button" class="serenity-lightbox-btn serenity-lightbox-next" aria-label="Next photo">' + ICON_NEXT + '</button>' +
			'<figure class="serenity-lightbox-figure">' +
				'<img class="serenity-lightbox-img" alt="" decoding="async" />' +
				'<figcaption class="serenity-lightbox-caption">' +
					'<span class="serenity-lightbox-label"></span>' +
					'<span class="serenity-lightbox-count"></span>' +
				'</figcaption>' +
			'</figure>';
		document.body.appendChild(overlay);

		var imgEl = overlay.querySelector('.serenity-lightbox-img');
		var labelEl = overlay.querySelector('.serenity-lightbox-label');
		var countEl = overlay.querySelector('.serenity-lightbox-count');
		var closeBtn = overlay.querySelector('.serenity-lightbox-close');
		var prevBtn = overlay.querySelector('.serenity-lightbox-prev');
		var nextBtn = overlay.querySelector('.serenity-lightbox-next');

		var current = 0;
		var lastFocus = null;
		var total = items.length;

		function pad(n) { return (n < 10 ? '0' : '') + n; }

		function currentBoothIndex() {
			var best = -1;
			var idx = 0;
			frontImgs.forEach(function (img, i) {
				var opacity = parseFloat(window.getComputedStyle(img).opacity) || 0;
				if (opacity > best) { best = opacity; idx = i; }
			});
			return idx;
		}

		function render() {
			var item = items[current];
			imgEl.classList.add('is-swapping');
			labelEl.textContent = item.caption;
			countEl.textContent = pad(current + 1) + ' / ' + pad(total);

			var loader = new Image();
			loader.onload = loader.onerror = function () {
				imgEl.src = item.src;
				imgEl.alt = item.caption || 'Serenity photograph';
				window.requestAnimationFrame(function () {
					imgEl.classList.remove('is-swapping');
				});
			};
			loader.src = item.src;
		}

		function go(delta) {
			current = (current + delta + total) % total;
			render();
		}

		function open(index) {
			current = ((index % total) + total) % total;
			lastFocus = document.activeElement;
			render();
			document.body.classList.add('serenity-lightbox-open');
			booth.classList.add('is-paused');
			overlay.classList.add('is-open');
			closeBtn.focus();
		}

		function close() {
			overlay.classList.remove('is-open');
			document.body.classList.remove('serenity-lightbox-open');
			booth.classList.remove('is-paused');
			if (lastFocus && lastFocus.focus) {
				lastFocus.focus();
			}
		}

		function isOpen() {
			return overlay.classList.contains('is-open');
		}

		front.setAttribute('role', 'button');
		front.setAttribute('tabindex', '0');
		front.setAttribute('aria-label', 'Open photo viewer');
		front.addEventListener('click', function () { open(currentBoothIndex()); });
		front.addEventListener('keydown', function (event) {
			if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
				event.preventDefault();
				open(currentBoothIndex());
			}
		});

		prevBtn.addEventListener('click', function () { go(-1); });
		nextBtn.addEventListener('click', function () { go(1); });
		closeBtn.addEventListener('click', close);
		overlay.addEventListener('click', function (event) {
			if (event.target === overlay) { close(); }
		});

		document.addEventListener('keydown', function (event) {
			if (!isOpen()) return;
			if (event.key === 'Escape') { close(); }
			else if (event.key === 'ArrowLeft') { go(-1); }
			else if (event.key === 'ArrowRight') { go(1); }
		});

		var touchStartX = 0;
		var touchStartY = 0;
		overlay.addEventListener('touchstart', function (event) {
			var t = event.changedTouches[0];
			touchStartX = t.clientX;
			touchStartY = t.clientY;
		}, { passive: true });
		overlay.addEventListener('touchend', function (event) {
			var t = event.changedTouches[0];
			var dx = t.clientX - touchStartX;
			var dy = t.clientY - touchStartY;
			if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
				go(dx < 0 ? 1 : -1);
			}
		}, { passive: true });
	}

	document.addEventListener('DOMContentLoaded', function () {
		document.body.classList.add('js-reveal');
		observeReveals(Array.prototype.slice.call(document.querySelectorAll('[data-reveal]')));
		observeChapters(Array.prototype.slice.call(document.querySelectorAll('[data-chapter]')));
		hydrateLazyImages(Array.prototype.slice.call(document.querySelectorAll('.serenity-img[data-src]')));
		setupSerenityLightbox();
	});
})();

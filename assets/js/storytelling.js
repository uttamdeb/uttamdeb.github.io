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

	document.addEventListener('DOMContentLoaded', function () {
		document.body.classList.add('js-reveal');
		observeReveals(Array.prototype.slice.call(document.querySelectorAll('[data-reveal]')));
		observeChapters(Array.prototype.slice.call(document.querySelectorAll('[data-chapter]')));
		hydrateLazyImages(Array.prototype.slice.call(document.querySelectorAll('.serenity-img[data-src]')));
	});
})();

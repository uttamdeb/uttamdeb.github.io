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

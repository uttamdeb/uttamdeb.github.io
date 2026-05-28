(function () {
	var storageKey = 'uttam-theme';
	var root = document.documentElement;
	var toggles = [];

	function getStoredTheme() {
		try {
			return localStorage.getItem(storageKey);
		} catch (error) {
			return null;
		}
	}

	function setStoredTheme(theme) {
		try {
			localStorage.setItem(storageKey, theme);
		} catch (error) {
			/* Storage may be blocked in private contexts. */
		}
	}

	function normalizeTheme(theme) {
		return theme === 'light' ? 'light' : 'dark';
	}

	function applyTheme(theme) {
		var normalizedTheme = normalizeTheme(theme);
		root.setAttribute('data-theme', normalizedTheme);

		toggles.forEach(function (toggle) {
			var label = toggle.querySelector('[data-theme-label]');
			var isLight = normalizedTheme === 'light';
			toggle.setAttribute('aria-pressed', String(isLight));
			toggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
			toggle.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';

			if (label) {
				label.textContent = isLight ? 'Light' : 'Dark';
			}
		});
	}

	function toggleTheme() {
		var nextTheme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
		applyTheme(nextTheme);
		setStoredTheme(nextTheme);
	}

	document.addEventListener('DOMContentLoaded', function () {
		toggles = Array.prototype.slice.call(document.querySelectorAll('[data-theme-toggle]'));
		applyTheme(getStoredTheme() || root.getAttribute('data-theme') || 'dark');

		toggles.forEach(function (toggle) {
			toggle.addEventListener('click', toggleTheme);
		});
	});
})();

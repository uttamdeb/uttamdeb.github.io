(function () {
	var greetings = ['Hello', 'হ্যালো', 'नमस्ते', 'مرحبًا', '你好', '¡Hola!', 'Olá'];
	var currentIndex = 0;
	var greetingElement = null;
	var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function setGreeting(text) {
		greetingElement.textContent = text;
	}

	function changeGreeting() {
		greetingElement.classList.remove('is-entering');
		greetingElement.classList.add('is-leaving');

		window.setTimeout(function () {
			currentIndex = (currentIndex + 1) % greetings.length;
			setGreeting(greetings[currentIndex]);
			greetingElement.classList.remove('is-leaving');
			// force reflow so the next animation restarts cleanly
			void greetingElement.offsetWidth;
			greetingElement.classList.add('is-entering');
		}, 460);
	}

	document.addEventListener('DOMContentLoaded', function () {
		greetingElement = document.getElementById('greeting');
		if (!greetingElement) return;

		setGreeting(greetings[currentIndex]);
		greetingElement.classList.add('is-entering');

		if (reducedMotion) return;
		window.setInterval(changeGreeting, 3400);
	});
})();

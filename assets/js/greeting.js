// Gradient Greetings Animation
document.addEventListener('DOMContentLoaded', function() {
	const greetings = ['Hello', 'হ্যালো', 'नमस्ते', 'مرحبًا', '你好', '¡Hola', 'Olá'];
	let currentGreeting = 0;
	const greetingElement = document.getElementById('greeting');
	
	if (!greetingElement) return;

	function changeGreeting() {
		greetingElement.classList.remove('fadeIn');
		greetingElement.classList.add('fadeOut');
	}

	greetingElement.addEventListener('animationend', function(event) {
		if (event.animationName === 'fadeOut') {
			currentGreeting = (currentGreeting + 1) % greetings.length;
			greetingElement.textContent = greetings[currentGreeting];
			greetingElement.classList.remove('fadeOut');
			greetingElement.classList.add('fadeIn');
		}
	});

	setInterval(changeGreeting, 3000); // Change every 3 seconds
});

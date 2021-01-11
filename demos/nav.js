if (isMobile) {
	document.querySelectorAll('a.demo').forEach(function (demo) {
		demo._href = demo.href;
		demo.id = 'd'+~~(Math.random()*1000)
		demo.removeAttribute('href');
		demo.innerHTML += '<div class="wrapper"></div>';
		demo.addEventListener('mousedown', function (e) {
			let hovered = Array.prototype.slice.apply(document.querySelectorAll(':hover'));
			if (hovered.filter(function(h) {
				return h.className == 'wrapper' && h.parentElement.id == demo.id;
			}).length == 1) {
				window.open(demo._href);
				// let w = window.open(demo._href, '_blank');
				// w.focus();
			}
         	return false;	
		});
	});

//	document.querySelectorAll('video').forEach(function (video) {
//		video.remove();
//	});
}
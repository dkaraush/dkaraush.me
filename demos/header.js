var isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
	
(function () {
	var body = document.querySelector('body'), html = document.querySelector('html');

	var headerBg = document.querySelector('header .bg');
	var canvas = headerBg.querySelector('canvas');
	var ctx = canvas.getContext('2d');

	// if (isMobile)
		// canvas.style.filter = 'blur(3px)';

	var W, H;

	function onResize() {
		canvas.width = W = headerBg.clientWidth * scale();
		canvas.height = H = headerBg.clientHeight * scale();
	}
	onResize();
	window.addEventListener('resize', onResize);



	function generateShapeProperties() {
		return {color: randomColor(), rot: (Math.random()*90), vel: Math.random()*2-1, p: ~~(Math.random()*5)+3}
	}

	var objects = Array.from({length: Math.sqrt(canvas.width / scale())*2}, generateShapeProperties);

	var startRadius = Math.max(W, H);

	const pi = Math.PI;
	var speed = 1.015;
	var shapesEnabled = true;
	var start = Date.now(), last = start;
	var s = 1, o = 0;

	function render() {
		requestAnimationFrame(render);
		if (scroll() > headerBg.clientHeight*2) {
			return;
		}

		if (s >= 999999) {
			startRadius *= (s/2);
			s /= (s/2);
		}
		s *= speed;

		var R = Math.min(W, H) * 0.3;

		ctx.strokeStyle = "black";
		for (var i = 0, pr = startRadius; i < objects.length; ++i) {
			if (i%2 == 0) {
				ctx.beginPath();
				ctx.arc(W/2, H/2, pr*s*scale(), 0, Math.PI * 2);
				ctx.fillStyle = objects[i].color;
				ctx.fill();
			} else {
				var p = objects[i].p;
				ctx.beginPath();
				var rot = objects[i].rot/pi;
				for (var j = 0; j < p; ++j)
					ctx[j==0?"moveTo":"lineTo"](W/2 + Math.sin(pi*2/p*(j-0.5) + rot)*pr*s*scale(), H/2 + Math.cos(pi*2/p*(j-0.5)+rot)*pr*s*scale());
				ctx.closePath();
				ctx.fillStyle = objects[i].color;
				ctx.fill();

				pr = (pr * Math.sin(pi/p)) / Math.tan(pi/p);
			}
		}


		ctx.beginPath();
		ctx.arc(W/2, H/2, 5, 0, Math.PI*2);
		ctx.fillStyle = "rgba(128,128,128,0.75)";
		ctx.fill();

		while (startRadius*s*scale() > Math.sqrt((W/2)*(W/2)+(H/2)*(H/2))*1.5) {
			o += 2;
			if (o == objects.length)
				o = 0;
			startRadius = (startRadius * Math.sin(pi/objects[1].p)) / Math.tan(pi/objects[1].p);
			for (var i = 0; i < objects.length-1; i++)
				objects[i] = objects[i+1];
			for (var i = 0; i < objects.length-1; i++)
				objects[i] = objects[i+1];
			objects[objects.length-2] = generateShapeProperties();
			objects[objects.length-1] = generateShapeProperties();
		}

		for (var i = 0; i < objects.length; ++i) {
			objects[i].rot += objects[i].vel/10;
		}
	}
	render();

	function getP(i) {return ~~(((i+1)/2)%5+3)};
	function randomColor() {
		return "#"+_c()+_c()+_c();
	}

	function scroll() {
		return Math.max(body.scrollTop, html.scrollTop);
	}



	function scale() {
		return window.devicePixelRatio/5;
	}

	function _c() {
		var c = (~~(Math.random()*255)).toString(16);
		if (c.length == 1) return "0"+c;
		return c;
	}


})();

var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var W, H;

function onResize() {
	W = window.innerWidth;
	H = window.innerHeight;

	canvas.width = W;
	canvas.height = H;
}
window.addEventListener("resize", onResize);
onResize();

window.RENDER = null;
function cycle() {
	if (typeof RENDER === 'function')
		RENDER();
	requestAnimationFrame(cycle);
}
cycle();
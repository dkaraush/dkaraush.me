let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');

var W, H, M;

function onResize() {
	canvas.width = W = window.innerWidth * window.devicePixelRatio;
	canvas.height = H = window.innerHeight * window.devicePixelRatio;
	M = Math.min(W, H);
}
onResize();
window.addEventListener('resize', onResize);

let vertices = [[-0.0641,-0.46,-0.0785],[-0.0641,0.29,-0.0785],[-0.0467,-0.46,-0.1231],[-0.0467,0.29,-0.1231],[-0.0028,-0.46,-0.1422],[-0.0028,0.29,-0.1422],[0.0417,-0.46,-0.1249],[0.0417,0.29,-0.1249],[0.0609,-0.46,-0.081],[0.0609,0.29,-0.081],[0.0435,-0.46,-0.0365],[0.0435,0.29,-0.0365],[-0.0003,-0.46,-0.0173],[-0.0003,0.29,-0.0173],[-0.0449,-0.46,-0.0347],[-0.0449,0.29,-0.0347],[-0.314,-0.46,-0.0735],[-0.314,0.29,-0.0735],[-0.2966,-0.46,-0.1181],[-0.2966,0.29,-0.1181],[-0.2528,-0.46,-0.1372],[-0.2528,0.29,-0.1372],[-0.2082,-0.46,-0.1199],[-0.2082,0.29,-0.1199],[-0.1891,-0.46,-0.076],[-0.1891,0.29,-0.076],[-0.2065,-0.46,-0.0315],[-0.2065,0.29,-0.0315],[-0.2503,-0.46,-0.0123],[-0.2503,0.29,-0.0123],[-0.2949,-0.46,-0.0297],[-0.2949,0.29,-0.0297],[-0.564,-0.46,-0.0685],[-0.564,0.29,-0.0685],[-0.5466,-0.46,-0.1131],[-0.5466,0.29,-0.1131],[-0.5027,-0.46,-0.1322],[-0.5027,0.29,-0.1322],[-0.4582,-0.46,-0.1149],[-0.4582,0.29,-0.1149],[-0.439,-0.46,-0.071],[-0.439,0.29,-0.071],[-0.4564,-0.46,-0.0265],[-0.4564,0.29,-0.0265],[-0.5002,-0.46,-0.0073],[-0.5002,0.29,-0.0073],[-0.5448,-0.46,-0.0247],[-0.5448,0.29,-0.0247],[0.1859,-0.46,-0.0835],[0.1859,0.29,-0.0835],[0.2033,-0.46,-0.1281],[0.2033,0.29,-0.1281],[0.2471,-0.46,-0.1472],[0.2471,0.29,-0.1472],[0.2917,-0.46,-0.1299],[0.2917,0.29,-0.1299],[0.3108,-0.46,-0.086],[0.3108,0.29,-0.086],[0.2934,-0.46,-0.0415],[0.2934,0.29,-0.0415],[0.2496,-0.46,-0.0223],[0.2496,0.29,-0.0223],[0.205,-0.46,-0.0397],[0.205,0.29,-0.0397],[0.4358,-0.46,-0.0885],[0.4358,0.29,-0.0885],[0.4532,-0.46,-0.1331],[0.4532,0.29,-0.1331],[0.4971,-0.46,-0.1522],[0.4971,0.29,-0.1522],[0.5416,-0.46,-0.1349],[0.5416,0.29,-0.1349],[0.5608,-0.46,-0.091],[0.5608,0.29,-0.091],[0.5434,-0.46,-0.0465],[0.5434,0.29,-0.0465],[0.4996,-0.46,-0.0273],[0.4996,0.29,-0.0273],[0.455,-0.46,-0.0447],[0.455,0.29,-0.0447],[0.6308,-0.585,0.2826],[0.6308,-0.46,0.2826],[-0.619,-0.585,0.3076],[-0.619,-0.46,0.3076],[0.6208,-0.585,-0.2172],[0.6208,-0.46,-0.2172],[-0.629,-0.585,-0.1922],[-0.629,-0.46,-0.1922],[0.6358,0.29,0.5326],[0.6358,0.415,0.5326],[-0.614,0.29,0.5576],[-0.614,0.415,0.5576],[0.6208,0.29,-0.2172],[0.6208,0.415,-0.2172],[-0.629,0.29,-0.1922],[-0.629,0.415,-0.1922],[0.6308,0.29,0.2826],[-0.619,0.29,0.3076],[-0.614,-0.585,0.5576],[-0.614,0.29,0.5576],[0.6358,-0.585,0.5326],[0.6358,0.29,0.5326],[0.3748,0.415,-0.0123],[-0.0001,0.5992,-0.0048],[-0.375,0.415,0.0027],[0.3718,0.415,-0.1623],[-0.0031,0.5992,-0.1548],[-0.378,0.415,-0.1473],[0.2896,0.415,0.4145],[0.2896,0.915,0.4145],[-0.2727,0.415,0.4257],[-0.2727,0.915,0.4257],[0.2846,0.415,0.1646],[0.2846,0.915,0.1646],[-0.2777,0.415,0.1759],[-0.2777,0.915,0.1759]];
let faces = [[0,1,3,2],[2,3,5,4],[4,5,7,6],[6,7,9,8],[8,9,11,10],[10,11,13,12],[12,13,15,14],[14,15,1,0],[16,17,19,18],[18,19,21,20],[20,21,23,22],[22,23,25,24],[24,25,27,26],[26,27,29,28],[28,29,31,30],[30,31,17,16],[32,33,35,34],[34,35,37,36],[36,37,39,38],[38,39,41,40],[40,41,43,42],[42,43,45,44],[44,45,47,46],[46,47,33,32],[48,49,51,50],[50,51,53,52],[52,53,55,54],[54,55,57,56],[56,57,59,58],[58,59,61,60],[60,61,63,62],[62,63,49,48],[64,65,67,66],[66,67,69,68],[68,69,71,70],[70,71,73,72],[72,73,75,74],[74,75,77,76],[76,77,79,78],[78,79,65,64],[82,83,87,86],[86,87,85,84],[84,85,81,80],[87,83,81,85],[90,91,95,94],[94,95,93,92],[92,93,89,88],[96,97,94,92],[95,91,89,93],[81,83,97,96],[100,80,96,101],[98,99,97,82],[102,103,104],[104,103,106,107],[107,106,105],[105,106,103,102],[110,111,115,114],[114,115,113,112],[112,113,109,108],[115,111,109,113]];

let particles = [];
for (let face of faces) {
	if (face.length != 4)
		continue;

	let a = vertices[face[0]],
		b = vertices[face[1]],
		c = vertices[face[2]],
		d = vertices[face[3]];

	let A = dist(a, b);
	let B = dist(b, c);
	let S = A * B;
	if (S > 0.937537) continue;

	let N = S * 1250;
	for (let i = 0; i < N; ++i) {
		let U = Math.random() > 0.5 ? b : d,
			X = E(Math.random()), Y = E(Math.random());
		if (X + Y >= 1) { X = 1 - X; Y = 1 - Y; }
		let v = [
			a[0] + X * (U[0] - a[0]) + Y * (c[0] - a[0]),
			a[1] + X * (U[1] - a[1]) + Y * (c[1] - a[1]),
			a[2] + X * (U[2] - a[2]) + Y * (c[2] - a[2])
		];
		particles.push({v: v, v1: [
			(Math.random()-0.5)*0.1,
			(Math.random()-0.5)*0.1,
			(Math.random()-0.5)*0.1
		], r: (Math.random()*0.75+0.25),
		c: 'rgb('+[Math.random()*255,Math.random()*255,Math.random()*255].join(',')+')'});
	}
}
function E(x) {
	return x;//(x < 0.5 ? 8 * Math.pow(x, 4) : -8 * Math.pow(1 - x, 4) + 1);
}

let debug = false;
window.addEventListener('keyup', function (e) {
	if (e) {
		debug = !debug;
	}
})

let rx = 0, ry = 0;
function render() {
	ctx.clearRect(0,0,W,H);

	ctx.fillStyle = 'rgba(0,0,0,0.1)';
	for (var face of faces) {
		ctx.beginPath();
		for (var i = 0; i < face.length; ++i) {
			let vertex = rotate(vertices[face[i]], rx, ry);
			// console.log(vertex)
			ctx[i == 0 ? 'moveTo' : 'lineTo'](
				W/2 + vertex[0]*(M/2),
				H/2*1.15 - vertex[1]*(M/2)
			);
		}
		ctx.closePath();
		if (debug) {
			ctx.fill();
			ctx.stroke();
		}
	}

	rx = -0.1;
	ry = Math.sin(Date.now() / 1000 * Math.PI * 0.1) * 0.5;
	
	for (var i = 0; i < particles.length; ++i) {
		let P = particles[i];
		let q = Math.sin(Date.now() / 1000 * Math.PI / 3 + i) * (Math.sin(Date.now()/1000)+1);
		ctx.fillStyle = P.c;
		ctx.beginPath();
		let p = rotate([
			P.v[0] + P.v1[0]*q,
			P.v[1] + P.v1[1]*q,
			P.v[2] + P.v1[2]*q
		], rx, ry);
		ctx.arc(
			W/2 + p[0]*(M/2),
			H/2*1.15 - p[1]*(M/2),
			particles[i].r * 4, 0, Math.PI*2
		);
		ctx.fill();
	}

	requestAnimationFrame(render);
}
render();

function dist(a, b) {
	return Math.sqrt(Math.pow(a[0]-b[0], 2) +
					 Math.pow(a[1]-b[1], 2) +
					 Math.pow(a[2]-b[2], 2));
}

function rotate(v, rx, ry) {
	return [
		(v[1]*Math.sin(rx) + v[2]*Math.cos(rx))*Math.sin(ry) + v[0]*Math.cos(ry),
		v[1]*Math.cos(rx) - v[2]*Math.sin(rx),
		(v[1]*Math.sin(rx) + v[2]*Math.cos(rx))*Math.cos(ry)-v[0]*Math.sin(ry)
	];
}
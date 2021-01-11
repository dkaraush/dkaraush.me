Object.getOwnPropertyNames(Math).forEach(function (k) {window[k]=Math[k]});
function range(a, _min, _max) {
	return min(max(a, _min), _max);
}

var canvas = document.querySelector("canvas");
var ctx = canvas.getContext('2d');
// ctx.imageSmoothingEnabled = false;

var W, H;
function onResize() {
	canvas.width = W = window.innerWidth * window.devicePixelRatio;
	canvas.height = H = window.innerHeight * window.devicePixelRatio;
}
onResize();
window.addEventListener('resize', onResize);

function texture(url, color) {
	var t = new Image();
	t.src = url;
	t.defColor = color;
	return t;
}
var walls = [null, texture('1.png', '#FF7F27'), texture('2.png')];
var map = [
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 2, 1, 0, 0, 0, 1],
	[1, 0, 0, 0, 1, 2, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
	[1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 2, 2, 2, 2, 2, 2, 2, 2, 1]
];

const cameraSize = PI / 4;
const planeX = 0, planeY = 0.66;
var player = {
	x: 2,
	y: 2,
	a: 0
};

var INPUT = {};
window.addEventListener('keydown', updateInput);
window.addEventListener('keyup', updateInput);
function updateInput(e) {
	INPUT[e.code] = {
		value: e.type=='keydown',
		t: Date.now()
	}
}
function axisValue(type) {
	var codes = {
		'x': [['KeyD', 'ArrowRight'], ['KeyA', 'ArrowLeft']],
		'y': [['KeyW', 'ArrowUp'], ['KeyS', 'ArrowDown']]
	}
	var V = [null, null];
	for (var i = 0; i < codes[type].length; ++i) {
		for (var k = 0; k < codes[type][i].length; ++k) {
			var I = INPUT[codes[type][i][k]];
			var v = I ? I.value : 0;
			if (V[i%2] == null || V[i%2] < v)
				V[i%2] = v;
		}
	}
	return (V[0]||0) - (V[1]||0);
}
function key(code) {
	if (INPUT[code])
		return !!INPUT[code].value;
	return 0;
}



function render() {
	requestAnimationFrame(render);

	// control
	var rotation = axisValue('x');
	player.a += rotation * (PI / 180 * 2);

	var d = axisValue('y');
	var newX = player.x + cos(player.a) * d * 0.05 * (key("ShiftLeft")*2+1);
	var newY = player.y + sin(player.a) * d * 0.05 * (key("ShiftLeft")*2+1);

	if (!collide(newX, player.y) ||
		!collide(newX, newY))
		player.x = newX;

	if (!collide(player.x, newY) ||
		!collide(newX, newY))
		player.y = newY;

	// rendering
	ctx.fillStyle = '#CFD8DC';
	ctx.fillRect(0, 0, W, H);
	var w = W;
	const planeX = 0, planeY = 0.66;
	for (var i = 0; i < w; ++i) {
		var p = (2*i/w)-1;

		var rayDirX = cos(player.a+cameraSize*p);
		var rayDirY = sin(player.a+cameraSize*p);

		var sideDistX;
		var sideDistY;

		var deltaDistX = abs(1 / rayDirX);
		var deltaDistY = abs(1 / rayDirY);
		var perpWallDist;

		var posX = player.x, posY = player.y;
		var mapX = round(posX-0.5),
			mapY = round(posY-0.5);

		var hit = false;
		var side = false;
		if (rayDirX < 0) {
			stepX = -1;
			sideDistX = (posX - mapX) * deltaDistX;
		} else {
			stepX = 1;
			sideDistX = (mapX + 1.0 - posX) * deltaDistX;
		}

		if (rayDirY < 0) {
			stepY = -1;
			sideDistY = (posY - mapY) * deltaDistY;
		} else {
			stepY = 1;
			sideDistY = (mapY + 1.0 - posY) * deltaDistY;
		}

		while (!hit) {
			if (sideDistX < sideDistY) {
				sideDistX += deltaDistX;
				mapX += stepX;
				side = 0;
			} else {
				sideDistY += deltaDistY;
				mapY += stepY;
				side = 1;
			}

			if (map[mapY][mapX] > 0)
				hit = true;
		}
		if (side == 0) 
			perpWallDist = (mapX - posX + (1 - stepX) / 2) / rayDirX;
		else 
			perpWallDist = (mapY - posY + (1 - stepY) / 2) / rayDirY;

		var wallX;
		if (side == 0) wallX = posY + perpWallDist * rayDirY;
		else           wallX = posX + perpWallDist * rayDirX;
		wallX -= floor((wallX));
		if (side == 1) wallX = 1 - wallX;

		var lineHeight = (H / perpWallDist);
		if (walls[map[mapY][mapX]] instanceof Image) {
			var texture = walls[map[mapY][mapX]];
			ctx.drawImage(texture, wallX*(texture.width-texture.width/w), 0, texture.width / w, texture.height, i/(w)*W, (H-lineHeight)/2, ceil(W/w), lineHeight)
		} else {
			ctx.fillStyle = walls[map[mapY][mapX]];
			ctx.fillRect(i/(w)*W, (H-lineHeight)/2, ceil(W/w), lineHeight);
		}

		if (side == 0) {
			ctx.fillStyle = 'rgba(0,0,0,0.2)';
			ctx.fillRect(round(i/(w)*W), (H-lineHeight)/2, ceil(W/w), lineHeight);
		}

		// // var a = atan2(planeY * p - sin(player.a), planeX * p - cos(player.a));
		// var a = player.a + cameraSize * (i / w - 0.5);


		// var d = -1, m = -1;
		// const step = 0.01;
		// var sx = player.x, sy = player.y,
		// 	vx = cos(a), vy = sin(a);
		// var jx = sx, jy = sy;
		// while (d == -1) {
		// 	jx += vx * step;
		// 	jy += vy * step;
		// 	var x = round(jx-0.5), y = round(jy-0.5);
		// 	if (y < 0 || y >= map.length ||
		// 		x < 0 || x >= map[y].length)
		// 		break;

		// 	if (map[y][x] > 0) {
		// 		d = sqrt(pow(sx-jx,2)+pow(sy-jy,2));
		// 		m = map[y][x];
		// 		break;
		// 	}
		// }
		// // var sx = player.x, sy = player.y,
		// // 	ex = sx + cos(a) * 100, ey = sy + sin(a) * 100,
		// // 	srx = /*round*/(sx/*-0.5*/), sry = /*round*/(sy/*-0.5*/),
		// // 	erx = /*round*/(ex/*-0.5*/), ery = /*round*/(ey/*-0.5*/);
		// // var dx = erx - srx, dy = ery - sry, L = max(abs(dx), abs(dy));
		// // var stepX = dx / L, stepY = dy / L;

		// // var x = sx, y = sy;
		// // for (var j = 0; j < L*2; ++j) {
		// // 	x += stepX;
		// // 	y += stepY;
		// // 	var jx = round(x-0.5), jy = round(y-0.5);

		// // 	if (jy < 0 || jy >= map.length ||
		// // 		jx < 0 || jx >= map[jy].length)
		// // 		break;

		// // 	if (map[jy][jx] > 0) {
		// // 		d = sqrt(pow(sx-jx,2)+pow(sy-jy,2));
		// // 		m = map[jy][jx];
		// // 		break;
		// // 	}

		// // }

		// if (d >= 0) {
		// 	ctx.fillStyle = walls[m];
		// 	var h = range(H / d, 0, H);
		// 	// if (m == 1) {
		// 	// 	ctx.drawImage(texture1, i/w*texture1.width, 0, texture1.width / w, texture1.height, i/w*W, (H-h)/2, ceil(W/w), h)
		// 	// } else
		// 		ctx.fillRect(i/w*W, (H-h)/2, ceil(W/w), h);
		// }
	}

	minimapRender();
}
var minimap = {
	size: 200,
	offset: 20,
	zoom: 3
}
render();

function minimapRender() {
	ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
	ctx.fillRect(minimap.offset, H-minimap.offset-minimap.size, minimap.size, minimap.size);
	ctx.beginPath();
	ctx.moveTo(minimap.offset, H-minimap.offset);
	ctx.lineTo(minimap.size+minimap.offset, H-minimap.offset);
	ctx.lineTo(minimap.size+minimap.offset, H-minimap.size-minimap.offset);
	ctx.lineTo(minimap.offset, H-minimap.size-minimap.offset);
	ctx.lineTo(minimap.offset, H-minimap.offset);
	ctx.save();
	ctx.shadowBlur = 4;
	ctx.shadowOffsetY = 2;
	ctx.shadowColor = 'rgba(0,0,0,0.35)';
	ctx.fill();
	ctx.restore();
	ctx.save();
	ctx.clip();
	ctx.translate((minimap.offset+minimap.size/2), H-(minimap.offset+minimap.size/2));
	ctx.rotate(-player.a-Math.PI*0.5);
	for (var y = 0; y < map.length; y++) {
		for (var x = 0; x < map[y].length; ++x) {
			// ctx.fillStyle = walls[map[y][x]] == null ? 'rgba(0,0,0,0)' : walls[map[y][x]].defColor;
			// ctx.fillRect((x-player.x)*10*minimap.zoom, (y-player.z)*10*minimap.zoom, 10*minimap.zoom, 10*minimap.zoom);

			if (walls[map[y][x]]) {
				ctx.drawImage(walls[map[y][x]], (-x-1+player.x)*10*minimap.zoom, (-y-1+player.y)*10*minimap.zoom, 10*minimap.zoom, 10*minimap.zoom);
			} else {
				ctx.fillStyle = '#CFD8DC';
				ctx.fillRect((-x-1+player.x)*10*minimap.zoom, (-y-1+player.y)*10*minimap.zoom, 10*minimap.zoom, 10*minimap.zoom)
			}
		}
	}
	ctx.rotate(player.a+Math.PI*0.5);
	ctx.beginPath();
	var s = minimap.size/2;
	var d = Math.sqrt(s*s+s*s);
	ctx.moveTo(Math.sin(0-cameraSize)*d, Math.cos(0-cameraSize)*d);
	ctx.lineTo(0, 0);
	ctx.lineTo(Math.sin(0+cameraSize)*d, Math.cos(0+cameraSize)*d);
	ctx.strokeStyle = "darkred"
	ctx.stroke();
	// playeroint(0,0);//(minimap.offset+minimap.size/2), (minimap.offset+minimap.size/2));
	ctx.translate(-(minimap.offset+minimap.size/2), H+(minimap.offset+minimap.size/2));
	ctx.restore();
}

function collide(x, y) {
	x=round(x-0.5), y=round(y-0.5);
	if (y<0||y>=map.length||x<0||x>=map[y].length)
		return false;
	return (map[round(y-0.5)][round(x-0.5)] > 0);
}
function lineline(a,b,c,d,p,q,r,s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
}
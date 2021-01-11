
var map = [
	[1,1,1,2,2,1,1,1,1,1,1,1,1],
	[1,0,0,0,0,0,1,0,0,0,0,3,1],
	[1,0,0,0,0,0,3,0,0,0,0,0,1],
	[2,0,0,0,0,0,0,0,0,0,0,0,1],
	[2,0,0,0,0,0,0,0,0,0,0,1,1],
	[1,0,0,0,0,0,3,0,0,0,0,0,3],
	[1,0,0,0,0,0,1,0,0,0,0,0,2],
	[1,1,3,0,3,1,1,0,0,0,0,0,2],
	[1,0,0,0,0,0,1,0,0,0,0,0,2],
	[1,0,0,0,0,0,3,0,0,0,0,0,3],
	[1,0,0,2,0,0,0,0,0,0,0,1,1],
	[1,0,0,0,0,0,3,0,0,0,0,0,1],
	[1,0,0,0,0,0,1,0,0,0,0,3,1],
	[1,1,1,1,1,1,1,1,1,1,1,1,1]
];
var colors = [
	'#CFD8DC',
	'#FF5722',
	'#03A9F4',
	'#00BCD4'
];
colors[-2] = 'black';
var player = {
	x: map[0].length/4*3,
	z: map.length/2,
	angle: 0,
	_view: Math.PI/180*30
}
var minimap = {
	size: 200,
	offset: 20,
	zoom: 3
}

window.RENDER = function () {
	ctx.fillStyle = colors[0];
	ctx.fillRect(0, 0, W, H);
	for (var x = 0; x < W; ++x) {
		var camX = (x / W * 2 - 1);
		var pangle = player.angle + player._view * camX;
		var step = 0.01;
		var b = -1;
		var cx = player.x;
		var cy = player.z;
		var dist = -1;
		while (b == -1) {
			var fcx = Math.round(cx-0.5);
			var fcy = Math.round(cy-0.5);
			if (fcx < 0 || fcx >= map[0].length ||
				fcy < 0 || fcy >= map.length) {
				b = -2;
				break;
			}
			if (map[fcy][fcx] < 1) {
				cx += Math.sin(pangle) * step;
				cy += Math.cos(pangle) * step;
			} else {
				b = map[fcy][fcx];
				dist = Math.sqrt((player.x-cx)*(player.x-cx) + (player.z-cy)*(player.z-cy));
				break;
			}
		}
		
		// /* DDA */
		// var b = -2;
		// var step;
		// var x1 = player.x, y1 = player.z;
		// var x2 = x1 + Math.sin(pangle)*100, y2 = y1 + Math.cos(pangle)*100;
		// var dx = (x2 - x1);
		// var dy = (y2 - y1);
		// if (Math.abs(dx) >= Math.abs(dy))
		// 	step = Math.abs(dx);
		// else
		// 	step = Math.abs(dy);
		// dx = dx / step;
		// dy = dy / step;
		// var X = x1;
		// var Y = y1;
		// var i = 1;
		// var dist;
		// while (i <= step) {
		// 	var fx = Math.round(X-0.5);
		// 	var fy = Math.round(Y-0.5);
		// 	if (fx < 0 || fx >= map[0].length ||
		// 		fy < 0 || fy >= map.length) {
		// 		b = -2;
		// 		break;
		// 	}
		// 	if (map[fy][fx] > 0) {
		// 		b = map[fy][fx];
		// 		break;
		// 	}
		// 	X += dx;
		// 	Y += dy;
		// 	i++;
		// }
		// dist = Math.sqrt((X-x1)*(X-x1)+(Y-y1)*(Y-y1));
		
		ctx.fillStyle = colors[b];
		var h = (H/dist);
		ctx.fillRect(x, H/2 - h/2, 1, h);		
	}

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
	ctx.rotate(player.angle);
	for (var y = 0; y < map.length; y++) {
		for (var x = 0; x < map[y].length; ++x) {
			ctx.fillStyle = colors[map[y][x]];
			ctx.fillRect((x-player.x)*10*minimap.zoom, (y-player.z)*10*minimap.zoom, 10*minimap.zoom, 10*minimap.zoom);
		}
	}
	ctx.rotate(-player.angle);
	ctx.beginPath();
	var s = minimap.size/2;
	var d = Math.sqrt(s*s+s*s);
	ctx.moveTo(Math.sin(-player._view)*d, Math.cos(-player._view)*d);
	ctx.lineTo(0, 0);
	ctx.lineTo(Math.sin(player._view)*d, Math.cos(player._view)*d);
	ctx.strokeStyle = "darkred"
	ctx.stroke();
	point(0,0);//(minimap.offset+minimap.size/2), (minimap.offset+minimap.size/2));
	ctx.translate(-(minimap.offset+minimap.size/2), H+(minimap.offset+minimap.size/2));
	ctx.restore();

	var keyLeft = INPUT.A || INPUT.ARROWLEFT;
	var keyRight = INPUT.D || INPUT.ARROWRIGHT;
	var keyUp = INPUT.W || INPUT.ARROWUP;
	var keyDown = INPUT.S || INPUT.ARROWDOWN;

	var dX = (!!keyRight-0) - (!!keyLeft-0);
	var dZ = (!!keyUp-0) - (!!keyDown-0);
	player.angle += dX * (Math.PI/180*2);
	var newX = player.x + Math.sin(player.angle) * dZ * 0.02 * (INPUT.SHIFT ? 5 : 1);
	var newZ = player.z + Math.cos(player.angle) * dZ * 0.02 * (INPUT.SHIFT ? 5 : 1);
	var fx = Math.round(player.x-0.5);
	var fz = Math.round(player.z-0.5);
	var fnx = Math.round(newX-0.5);
	var fnz = Math.round(newZ-0.5);
	if (fnx >= 0 && fnx < map[0].length && map[fz][fnx] <= 0)
		player.x = newX;
	if (fnz >= 0 && fnz < map.length    && map[fnz][fx] <= 0)
		player.z = newZ;

}

function point(x, y) {
	ctx.beginPath();
	ctx.arc(x, y, 3, 0, 2*Math.PI);
	ctx.fillStyle='red';
	ctx.fill();
}

var INPUT = {};
window.addEventListener('keydown', function (e) {
	INPUT[e.key.toUpperCase()] = true;
});
window.addEventListener('keyup', function (e) {
	INPUT[e.key.toUpperCase()] = false;
})
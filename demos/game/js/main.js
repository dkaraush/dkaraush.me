const abs = Math.abs, sin = Math.sin, cos = Math.cos;

var canvas = document.querySelector("canvas#main");
var pixelgrid = document.querySelector("div#pixel-grid");
var ctx = canvas.getContext("2d");

var W = canvas.width, 
	H = canvas.height; // width and height

function onResize() {
	var wW = window.innerWidth; // window's width & height
	var wH = window.innerHeight;
	var ra = W / H; // real aspect ratio, which should be
	if (ra * wH <= wW) {
		canvas.style.width = ra * wH + "px";
		canvas.style.height = wH + "px";
		canvas.style.top = "0px";
		canvas.style.left = (wW - (wH*ra)) / 2 + "px";
	} else {
		canvas.style.width =  wW + "px";
		canvas.style.height = wW / ra + "px";
		canvas.style.left = "0px";
		canvas.style.top = (wH - (wW/ra)) / 2 + "px";
	}

	pixelgrid.style.width =  canvas.style.width;
	pixelgrid.style.height = canvas.style.height;
	pixelgrid.style.top =    canvas.style.top;
	pixelgrid.style.left =   canvas.style.left;
	pixelgrid.style.backgroundSize = ((ra * wH <= wW ? ra*wH : wW) / W) + "px";
}
window.addEventListener("resize", onResize);
onResize();

var SPRITES = null;
var INPUT = {};

window.addEventListener("keydown", function (e) {
	INPUT[e.code] = true;
});
window.addEventListener("keyup", function (e) {
	INPUT[e.code] = false;
});

var player = {
	x: ~~(W / 2),
	y: ~~(H / 2),
	index: 0,
	direction: 'down',
	velocity: {x: 0, y: 0}
}

var lastFrame;
function render() {
	if (typeof lastFrame === "undefined") {
		lastFrame = Date.now();
		requestAnimationFrame(render);
		return;
	}
	var deltaK = (1000 / 60) / (Date.now() - lastFrame); // a difference between normal 60fps and current delta time

	ctx.fillStyle = "#FBC02D";
	ctx.fillRect(0, 0, W, H); 
	ctx.drawSprite(SPRITES.level0_back, W/2, H/2);

	if (INPUT.KeyW || INPUT.KeyS)
		player.velocity.y += ((INPUT.KeyS?1:0) - (INPUT.KeyW?1:0)) * 0.3 * deltaK;
	if (INPUT.KeyA || INPUT.KeyD)
		player.velocity.x += ((INPUT.KeyD?1:0) - (INPUT.KeyA?1:0)) * 0.3 * deltaK;

	var newX = player.x + Math.round(player.velocity.x * 1.5);
	var newY = player.y + Math.round(player.velocity.y * 1.5);

	if (!checkCollisions(SPRITES.player_idle_up, {x: newX, y: newY},     SPRITES.level0_back, {x:0,y:0}) ||
		!checkCollisions(SPRITES.player_idle_up, {x: newX, y: player.y}, SPRITES.level0_back, {x:0,y:0}))
		player.x = newX;
	if (!checkCollisions(SPRITES.player_idle_up, {x: newX, 	   y: newY}, SPRITES.level0_back, {x:0,y:0}) ||
		!checkCollisions(SPRITES.player_idle_up, {x: player.x, y: newY}, SPRITES.level0_back, {x:0,y:0}))
		player.y = newY;

	player.velocity.x *= 0.7 * deltaK;
	player.velocity.y *= 0.7 * deltaK;
	if (abs(player.velocity.x) < 0.01)
		player.velocity.x = 0;
	if (abs(player.velocity.y) < 0.01)
		player.velocity.y = 0;

	var playerSpriteName = "player_";
	if (abs(player.velocity.x) > 0.1 || abs(player.velocity.y) > 0.1) {
		playerSpriteName += "move_";
		var max = Math.max(player.velocity.x, player.velocity.y, -player.velocity.x, -player.velocity.y);
		if (max == player.velocity.x)
			player.direction = "right";
		else if (max == -player.velocity.x)
			player.direction = "left";
		else if (max == player.velocity.y)
			player.direction = "down";
		else if (max == -player.velocity.y)
			player.direction = "up";
	} else 
		playerSpriteName += "idle_";
	playerSpriteName += player.direction;

	ctx.drawSprite(SPRITES.player_shadow, player.x, player.y, 1);
	ctx.drawSprite(SPRITES[playerSpriteName], player.x, player.y, Date.now()/60);
	ctx.drawSprite(SPRITES[playerSpriteName], player.x, player.y, Date.now()/60, "silhouetteWhite");

	ctx.drawSprite(SPRITES.level0_front, W/2, H/2);

	ctx.drawSprite(SPRITES[playerSpriteName], player.x, player.y, Date.now()/60, "silhouetteBlack");

	lastFrame = Date.now();
	requestAnimationFrame(render);
} 

loadSprites(function (sprites) {
	SPRITES = sprites;
	render();
});

function checkCollisions(spr1, c1, spr2, c2) {
	var col1 = spr1.colliders || [];
	var col2 = spr2.colliders || [];

	for (var i = 0; i < col1.length; ++i) {
		for (var j = 0; j < col2.length; ++j) {
			if (checkCollision(col1[i], col2[j], {x: c1.x - spr1.pivot.x, y: c1.y - spr1.pivot.y}, c2))
				return true;
		}
	}
	return false;
}

var f = 0;
function checkCollision(A, B, Ap, Bp) {
	var Ax1 = A.x+Ap.x;
	var Ax2 = A.x2+Ap.x;
	var Ay1 = A.y+Ap.y;
	var Ay2 = A.y2+Ap.y;
	var Bx1 = B.x+Bp.x;
	var Bx2 = B.x2+Bp.x;
	var By1 = B.y+Bp.y;
	var By2 = B.y2+Bp.y;
	return (Ax1 < Bx2) && (Ax2 > Bx1) && (Ay1 < By2) && (Ay2 > By1);
}
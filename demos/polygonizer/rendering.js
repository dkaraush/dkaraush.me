function render(canvas, ctx, imageData, settings) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	var W = canvas.width, H = canvas.height;
	var gridSize = settings.size * Math.min(W, H);
	var borderSize = Math.max(W, H) * 0.25;
	var offsetMax = gridSize * settings.move * 0.75;
	var gridW = ~~((W + borderSize * 2) / gridSize) + 2;
	var gridH = ~~((H + borderSize * 2) / gridSize) + 2;

	var points = [];
	for (var i = 0; i < gridH; ++i) {
		if (typeof points[i] === "undefined")
			points[i] = []
		for (var j = 0; j < gridW; ++j) {
			points[i].push(newPoint(j, i, gridSize, offsetMax, borderSize));
		}
	}

	var trianglesCount = (gridW - 1) * (gridH - 1) * 2;
	for (var i = 0; i < trianglesCount; ++i) {
		var j = ~~(i/2);
		var point1 = [j - ~~(j/(gridW-1))*(gridW-1), ~~(j/(gridW-1))];
		var point2 = [point1[0]+(i%2==0?0:1), point1[1]+(i%2==0?1:0)];
		var point3 = [point1[0]+1, point1[1]+1];
		ctx.beginPath();
		ctx.moveTo(getPoint(points, point1)[0], getPoint(points, point1)[1]);
		ctx.lineTo(getPoint(points, point2)[0], getPoint(points, point2)[1]);
		ctx.lineTo(getPoint(points, point3)[0], getPoint(points, point3)[1]);
		ctx.lineTo(getPoint(points, point1)[0], getPoint(points, point1)[1]);
		var color = getMediumColor(points, [point1,point2,point3], W, H, imageData.width, imageData.height, imageData.data);
		ctx.fillStyle = "rgba("+color.join(",")+")"; 
		ctx.fill();
		ctx.strokeStyle = "rgba("+color[0]+","+color[1]+","+color[2]+","+(color[3]*0.75)+")";
		ctx.stroke();
		ctx.closePath();
	}
}

function getPoint(arr, coors) {
	return arr[coors[1]][coors[0]];
}
function newPoint(x, y, gridSize, offsetMax, borderSize) {
	return [x * gridSize + (Math.random()*(offsetMax*2)-offsetMax) - borderSize, 
			y * gridSize + (Math.random()*(offsetMax*2)-offsetMax) - borderSize];
}

function getMediumColor(arr, _points, cw, ch, iw, ih, data) {
	var points = Array.from({length:3}, function(x,i) {
		var _point = getPoint(arr, _points[i]);
		var point = [_point[0], _point[1]];
		point[0] = ~~(point[0] / cw * iw);
		point[1] = ~~(point[1] / ch * ih);
		return point;
	});

	var x1 = Math.min(points[0][0], points[1][0], points[2][0]);
	var y1 = Math.min(points[0][1], points[1][1], points[2][1]);
	var x2 = Math.max(points[0][0], points[1][0], points[2][0]);
	var y2 = Math.max(points[0][1], points[1][1], points[2][1]);
	var color = [0,0,0,0];
	var count = 1;

	for (var x = x1; x < x2; x += 2) {
		for (var y = y1; y < y2; y += 2) {
			if (x >= 0 && y >= 0 && x < iw && y < ih && isInTriangle([x, y], points)) {
				color[0] += data[(x + y * iw) * 4];
				color[1] += data[(x + y * iw) * 4 + 1];
				color[2] += data[(x + y * iw) * 4 + 2];
				color[3] += data[(x + y * iw) * 4 + 3];
				count++;
			}
		}
	}


	return [~~(color[0] / count),  ~~(color[1] / count),
			~~(color[2] / count), (~~(color[3] / count) / 256)]
}

function sign(p1, p2, p3) {
	return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
}
function isInTriangle(point, vs) {
	var b2 = sign(point, vs[1], vs[2]) < 0;
	return ((sign(point, vs[0], vs[1])<0) == b2) && 
		   ((sign(point, vs[2], vs[0])<0) == b2);
}

Object.getOwnPropertyNames(Math).forEach(function(n){window[n]=Math[n]});
window.addEventListener('resize',(function R(){S=window.devicePixelRatio;return R;})())
function range(value, minValue, maxValue) {
	return max(min(value, maxValue), minValue);
}
function d(x,i=1) {
	while (x*.1 > (i*=10));
	return i;
}
function formatValue(v) {
	if ((v=round(v*10)/10) >= 10**6)
		return round(v/(10**4))/100 + 'M';
	if (v >= 10**3)
		return round(v*.01)/10 + 'K';
	return v;
}

const colors = {
	background: [[255,255,255,1],[36,47,62,1]],
	sliderBackground: [[155,185,235,0.1],[19,13,21,0.1]],
	sliderButton: [[195,211,223,0.5],[128, 172, 214, 0.5]],
	mainAxisColor: [[0,0,0,0.1],[255,255,255,0.1]],
	mainAxisTextColor: [[144,149,159,1],[68,85,101,1]]
};
var lastModeChanged = 0;
function color(c,a,T) {
	var t = range(Date.now()-lastModeChanged,0,250)/250;
	if (!night) t = 1 - t;
	var r = Array.from(c[0],function(x,i){return c[0][i]+(c[1][i]-c[0][i])*t});
	if (a)r[3]=a;
	return T?Array.from(r,function(x,i){return i<3?x/255:x}):'rgba('+r.join(',')+')';
}

var values = [];


/* === RENDERING === */
var lastRenderedTime = Date.now();
function update() {
	requestAnimationFrame(update);
	var t = (Date.now() - lastRenderedTime);
	lastRenderedTime = Date.now();

	for (var O of values) {
		renderMain(t, O.mainCtx, O.mainCtx instanceof WebGLRenderingContext ? O.mainCtx : null, O);
		renderLegend(t, O.legendCtx, O);
	
		O.lastL = O.L;
		O.lastR = O.R;

		O.forceRender = false;
	}
}
update();

function renderMain(t, ctx, gl, O) {
	if (!O.forceRender && O.lastMax == O.maxShouldBe &&
		O.lastL == O.L && O.lastR == O.R &&
		O.lastSliderMax == O.sliderMaxShouldBe &&
		objEqual(O.selected, O.alpha)) {
		return;
	}

	var bottomOffset = 20 * S;
	var topOffset = 10 * S;

	var chart = charts[O.id];
	var L = chart.length-1;

	// finding max value of subchart
	var chartMax = 0;
	if (O.lastL == O.L && O.lastR == O.R && objEqual(O.selected, O.alpha)) {
		chartMax = O.maxShouldBe;
	} else {
		for (var i = 0; i < chart.columns.length; ++i) {
			if (O.selected[columnName=chart.columns[i]] != 1)
				continue
			var columnMax = chart.y[columnName].maxFunc(floor(O.L*L), ceil(O.R*L));
			if (columnMax > chartMax)
				chartMax = columnMax;
		}
	}
	// smoothing change of max
	O.maxShouldBe = chartMax;
	if (!O.lastMax)
		O.lastMax = chartMax;
	chartMax = O.lastMax + (chartMax - O.lastMax) * (range(t/75,0.01,1));
	if (min(O.maxShouldBe, chartMax) / max(O.maxShouldBe, chartMax) > 0.999)
		O.lastMax = chartMax = O.maxShouldBe;
	O.lastMax = chartMax;

	var from = O.L * L, to = O.R * L;
	var length = (O.R - O.L) * L;
	var fromI = floor(from);
	var toI = ceil(to);

		
	if (gl) {
		gl.viewport(0,0,O.W,O.H);
		gl.clearColor(0,0,0,0);
  		gl.clear(gl.COLOR_BUFFER_BIT);
	} else {
		ctx.clearRect(0, 0, O.W, O.H);
		ctx.lineWidth = 2 * S;
	}
	
	var graphH = O.lH - bottomOffset - topOffset;
	const rw = 1 / O.W * S, rh = 1 / O.H * S;
	var type = chart.length > 10000;
	for (var i = 0; i < chart.columns.length; ++i) {
		var column = chart.y[columnName=chart.columns[i]];
		var a = O.alpha[columnName]; 
		if (a != O.selected[columnName])
			a = round(range(a + (O.selected[columnName] - a) * 0.51, 0, 1) * 100) / 100;
		O.alpha[columnName] = a;
		if (a == 0)
			continue;

		var vertices = [], lx = null, ly, la = null;
		if (!gl) {
			ctx.beginPath();
			ctx.strokeStyle = chart.colors[columnName].rgba(O.alpha[columnName]);
		}

		function point(i, h, u) {
			if (gl) {
				var x = i/length, y = h/chartMax*(graphH/O.H)+(1-O.lH/O.H)+topOffset/O.H*2;
				if (type)
					vertices.push(x, y);
				else {
					if (lx == null) {lx = x; ly = y; return;}
					var a = atan2(ly-y, lx-x), ap = a+PI/2, am = a-PI/2, cap = cos(ap)*rw, sap = sin(ap)*rh, cam = cos(am)*rw, sam = sin(am)*rh;

					if (la != null)
						vertices.push(lx+cam,ly+sam,lx+cos(la-PI/2)*rw,ly+sin(la-PI/2)*rh,lx+cos(la+PI/2)*rw,ly+sin(la+PI/2)*rh,lx+cos(la+PI/2)*rw,ly+sin(la+PI/2)*rh,lx+cap,ly+sap,lx+cam,ly+sam);	
					la = a;
					vertices.push(x+cap,y+sap,lx+cap,ly+sap,x+cam,y+sam,lx+cam,ly+sam,lx+cap,ly+sap,x+cam,y+sam);
					lx = x, ly = y;
				}
			}
			else
				ctx.lineTo(i/length*O.W, topOffset + (1-h/chartMax)*graphH);
		}
		point(0, lerp(column, from));
		for (var x = fromI; x < toI; ++x)
			point(x - from, column[x]);
		point(length, lerp(column, to));

		function lerp(A, x) {
			return A[floor(x)]+(A[ceil(x)]-A[floor(x)]) * (x-floor(x));
		}

		if (gl)
			glF(gl, type?gl.LINE_STRIP:gl.TRIANGLES, vertices, chart.colors[columnName].floata(O.alpha[columnName]));
		else
			ctx.stroke();
	}

	// slider
	var sChartMax = 0;
	for (var columnName in chart.y) {
		if (O.selected[columnName] != 1)
			continue;
		var _max = chart.y[columnName].max;
		if (_max > sChartMax || sChartMax == -1)
			sChartMax = _max;
	}
	O.sliderMaxShouldBe = sChartMax;
	if (!O.lastSliderMax)
		O.lastSliderMax = sChartMax;
	sChartMax = O.lastSliderMax + (sChartMax - O.lastSliderMax) * (range(t/75,0.01,1));
	if (min(O.sliderMaxShouldBe, sChartMax) / max(O.sliderMaxShouldBe, sChartMax) > 0.99)
		O.lastSliderMax = sChartMax = O.sliderMaxShouldBe;
	O.lastSliderMax = sChartMax;

	ctx.lineWidth = 1;
	for (var columnName in chart.y) {
		var column = chart.y[columnName];
		var vertices = [];
		if (!gl) {
			ctx.strokeStyle = chart.colors[columnName].rgba(O.alpha[columnName]);
			ctx.beginPath();
		}
		for (var x = 0; x < chart.length; ++x) {
			if (gl) {
				vertices.push(x/L, range(column[x] / sChartMax * O.sH / O.H, 0, O.sH/O.H));
			} else
				ctx.lineTo(x/L*O.W, (- column[x] / sChartMax) * O.sH + O.H);
		}
		if (gl) {
			glF(gl, gl.LINE_STRIP, vertices, chart.colors[columnName].floata(O.alpha[columnName]));
		} else
			ctx.stroke();
	}
}

function renderLegend(t, ctx, O) {
	if (!O.forceRender && O.lastMax == O.maxShouldBe &&
		(O.iX && O.iX.length == 0) &&
		(O.iY && O.iY.length == 0) &&
		O.lastL == O.L && O.lastR == O.R && O.lastHover == O.hover &&
		objEqual(O.selected, O.alpha) &&
		Date.now() - lastModeChanged > 250) {
		return;
	}

	var chart = charts[O.id];

	var L = chart.length - 1;
	var from = O.L * L, to = O.R * L;
	var length = (O.R - O.L) * L;
	var fromI = floor(from);
	var toI = ceil(to);

	var chartMax = O.lastMax;
	var bottomOffset = 20 * S;
	var topOffset = 10 * S;

	ctx.clearRect(0,0,O.W,O.lH);
	// axis
	ctx.strokeStyle = color(colors.mainAxisColor);
	ctx.lineWidth = 1;
	ctx.font = (bottomOffset*0.5)+'px Roboto';
	ctx.fillStyle = color(colors.mainAxisTextColor, 1);
	if (O.hover >= 0) {
		ctx.beginPath();
		ctx.moveTo((O.hover-from)/length*O.W, 0);
		ctx.lineTo((O.hover-from)/length*O.W, O.lH-bottomOffset);
		ctx.stroke();
	}
	var u = O.maxShouldBe / 4;
	var yDiff = round(u / d(u)) * d(u);
	var rendered = [];
	if (!O.iY)
		O.iY = [];
	if (O.lastYDiff != yDiff && yDiff > 0 && chartMax > 1 && O.lastYDiff > 0) {
		for (let i = O.lastYDiff; i < chartMax; i += O.lastYDiff) {
			if (i % yDiff != 0) {
				O.iY.push({i: i, v: -1, V: 1});
			}
		}
		for (let i = yDiff; i < chartMax; i += yDiff) {
			if (i % O.lastYDiff != 0) {
				O.iY.push({i: i, v: 1, V: 0});
			}
		}
	}
	O.lastYDiff = yDiff;
	for (var i = 0; chartMax > 1 && i < O.iY.length; ++i) {
		var a = O.iY[i];
		if (a.i % yDiff != 0 && a.v == 1)
			a.v = -1;
		else if (a.i % yDiff == 0 && a.v == -1)
			a.v = 1;
		a.V += a.v * t * 0.005 * 2.5;
		if ((a.V < 0 && a.v < 0) || (a.V > 1 && a.v > 0)) {
			O.iY.splice(i, 1);
			i--;
			continue;
		}
		ctx.strokeStyle = color(colors.mainAxisColor, a.V);
		ctx.fillStyle = color(colors.mainAxisTextColor, a.V);
		yAxis(O.iY[i].i);
	}
	if (chartMax > 1 && yDiff > 0) {
		ctx.strokeStyle = color(colors.mainAxisColor, 0.1);
		ctx.fillStyle = color(colors.mainAxisTextColor, 1);
		for (var y = 0; y < chartMax; y += yDiff)
			yAxis(y);
	}
	function yAxis(v) {
		if (rendered.indexOf(v)>=0)
			return;
		rendered.push(v);
		ctx.beginPath();
		ctx.moveTo(0,  topOffset+(1-y/chartMax)*(O.lH-topOffset-bottomOffset));
		ctx.lineTo(O.W, topOffset+(1-y/chartMax)*(O.lH-topOffset-bottomOffset));
		ctx.stroke();
		ctx.fillText(formatValue(v), 0, topOffset+(1-v/chartMax)*(O.lH-topOffset-bottomOffset)-5*S)
	}

	if (O.hover >= 0) {
		ctx.lineWidth = 2 * S;
		for (var columnName in chart.y) {
			if (!O.selected[columnName])
				continue;
			var column = chart.y[columnName];
			ctx.beginPath();
			ctx.arc((O.hover-from)/length*O.W, topOffset + (1-column[O.hover]/chartMax)*(O.lH-bottomOffset-topOffset), S*5, 0, PI*2);
			ctx.fillStyle = color(colors.background)
			ctx.fill();
			ctx.strokeStyle = chart.colors[columnName].rgba(O.alpha[columnName]);
			ctx.stroke();
		}
	}
	O.lastHover = O.hover;


	ctx.lineWidth = 1;
	// x
	var months = 'JanFebMarAprMayJunJulAugSepOctNovDec';
	const labelsInOneScreen = 6, changeStep = 0.3;
	var u = 1/(round((O.R-O.L)*10)/10);
	var e = round(2**(log2(parseFloat(u.toFixed(2)))));
	var xDiff = round(chart.length / (6*e));
	var start = floor(O.L * (chart.length - 1));
	start = start - (start % xDiff);
	
	if (!O.iX)
		O.iX = [];

	if (typeof O.lastDateStart === 'number' && O.lastDateDiff && 
		(O.lastDateDiff != xDiff)) {
		for (var i = 0; i < 10; ++i) {
			var _xI = O.lastDateStart + O.lastDateDiff*i;
			if ((_xI-start)%xDiff != 0 && _xI < chart.length-1 && _xI > 0) {
				O.iX.push({i: _xI, val: 1, v: -1, dif: xDiff});
			}
		}

		for (var i = 0; i < 10; ++i) {
			var xI = start + xDiff*i;
			if ((xI-O.lastDateStart)%O.lastDateDiff != 0 && xI < chart.length-1 && xI > 0)
				O.iX.push({i: xI, val: 0, v: 1, dif: xDiff});
		}
	}
	O.lastDateStart = start;
	O.lastDateDiff = xDiff;

	var rendered = [];
	for (var i = 0; i < O.iX.length; ++i) {
		var label = O.iX[i];
		if ((label.i) % xDiff != 0 && label.v > 0)
			label.v *= -1;
		if ((label.i) % xDiff == 0 && label.v < 0)
			label.v *= -1;
		label.val += label.v * (abs(xDiff-label.dif)+1) * t * 0.001 * 2.5;
		if (label.val < 0 || label.val > 1) {
			O.iX.splice(i, 1);
			i--;
			continue;
		}
		ctx.fillStyle = color(colors.mainAxisTextColor, label.val);
		drawDateLabel(label.i);		
	}

	ctx.fillStyle = color(colors.mainAxisTextColor, 1);
	for (var i = 0; i < 10; ++i) {
		var xI = start + xDiff*i;
		if (xI == 0 || xI >= chart.length-1 || rendered.indexOf(xI) >= 0)
			continue;
		drawDateLabel(xI, 1);
	}

	function drawDateLabel(i) {
		if (rendered.indexOf(i)>=0)return;
		rendered.push(i);
		var xDate = new Date(chart.x[i]);
		var str = months.substring(z=xDate.getUTCMonth()*3,z+3) + ' ' + xDate.getUTCDate();
		var xP = (i / L);
		var xC = (xP - O.L) / (O.R - O.L) * O.W;
		var textSize = ctx.measureText(str);
		var x = xC-textSize.width/2;
		if (xC > O.lW) return;

		ctx.fillText(str, x, O.lH - bottomOffset/2);
	}

	// y
	
}
function glF(gl, type, v, color) {
	gl.bindBuffer(gl.ARRAY_BUFFER, gl._vb); // Sets which buffer to use for the vertex array.
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STREAM_DRAW);
	gl.vertexAttribPointer(gl._va, 2, gl.FLOAT, false, 0, 0);
	gl.uniform4fv(gl._cu, color);
	gl.drawArrays(type, 0, v.length/2);
}


var wrapper = document.querySelector('#wrapper');

function initChart(heading, id) {
	var chart = charts[id];

	var ID = 'chart-'+id;
	var container = $('div', 'chart', ID);
	var mainContainer = $('div', 'main'), mainCanvas, legendCanvas;
	var sliderContainer = $('div', 'slider'), sliderBg1, sliderBg2, sliderBtn;
	sliderContainer.append(sliderBg1=$('div', 'bg1'), sliderBg2=$('div', 'bg2'), sliderBtn=$('div', 'btn'));
	mainContainer.append(mainCanvas=$('canvas'), legendCanvas=$('canvas'), sliderContainer);

	var selected = makeSelected(charts[id]);
	var O = {
		L: 0.5, R: 1,
		selected: selected,
		W: 0, H: 0, sW: 0, sH: 0,
		id: id,
		alpha: Object.assign({}, selected),
		mainCanvas: mainCanvas,
		mainCtx: initGL(mainCanvas.getContext('webgl')||mainCanvas.getContext('experimental-webgl'))||mainCanvas.getContext('2d'),
		legendCanvas: legendCanvas,
		legendCtx: legendCanvas.getContext('2d'),
		forceRender: false,
		hover: -1
	}
	values[id] = O;

	function onResize() {
		var offset = 8 * S;
		// changing size of subchart's canvas
		mainCanvas.width = O.W = (mainContainer.clientWidth) * S;
		mainCanvas.height = O.H = (mainContainer.clientHeight) * S;
		mainCanvas.style.width = O.W / S + 'px';
		mainCanvas.style.height = O.H / S + 'px';
		// changing size of legend's canvas
		legendCanvas.width = O.W = (mainContainer.clientWidth) * S;
		legendCanvas.height = O.lH = (mainContainer.clientHeight - 60) * S;
		legendCanvas.style.width = O.W / S + 'px';
		legendCanvas.style.height = O.lH / S + 'px';

		O.sH = 48 * S;

		O.forceRender = true;
		sliderUpdate(O);
	}
	window.addEventListener('resize', onResize);

	function makeSelected(chart) {
		var selected = {};
		for (var columnName in chart.y)
			selected[columnName] = 1;
		return selected;
	}

	// === INPUT ===

	// SLIDER
	sliderContainer.addEventListener('touchmove', onSliderMove);

	sliderContainer.addEventListener('mousedown', onSliderStart);
	sliderContainer.addEventListener('touchstart', onSliderStart);

	sliderContainer.addEventListener('touchend', onSliderEnd);
	window.addEventListener('mouseup', onSliderEnd);

	var dragItems = {};
	var offset = null;
	var isMouseDown = false;
	function onSliderStart(e) {
		var rect = sliderContainer.getBoundingClientRect();
		var w = sliderContainer.clientWidth;
		var pressRange, x, xP, I;
		if (e.constructor&&e.constructor.name=='TouchEvent') {
			x = e.changedTouches[0].clientX;
			pressRange = max(e.changedTouches[0].radiusX, 10 * S);
			I = e.changedTouches[0].identifier;
			e.preventDefault();
		} else {
			x = e.clientX;
			pressRange = 10 * S;
			isMouseDown = true;
			I = 'mouse';
		}
		x-=rect.x;
		xP = range(x/w,0,1);

		if (xP*w >= O.L*w - pressRange && xP*w <= O.L*w + pressRange) {
			dragItems[I] = 'from';
		} else if (xP*w >= O.R*w - pressRange && xP*w <= O.R*w + pressRange) { 
			dragItems[I] = 'to';
		} else if (xP*w >= O.L*w && xP*w <= O.R*w) {
			dragItems[I] = 'all';
			offset = xP - O.L;
		} else
			dragItems[I] = null;
	}
	function onSliderMove(e) {
		var sliderBoundingRect = sliderContainer.getBoundingClientRect();
		var w = sliderContainer.clientWidth;
		var x, I;

		if (e.constructor&&e.constructor.name=='TouchEvent') {
			x = range(e.changedTouches[0].clientX - sliderBoundingRect.x - e.changedTouches[0].radiusX*0.75, 0, w);
			I = e.changedTouches[0].identifier;
			e.preventDefault();
		} else {
			if (!isMouseDown)
				return;
			x = e.clientX - sliderBoundingRect.x;
			I = 'mouse'
		}
		var xP = x / w; // percent
		switch (dragItems[I]) {
			case 'from':
				O.L = range(xP, 0, O.R-0.1);
				break;
			case 'to':
				O.R = range(xP, O.L+0.1, 1);
				break;
			case 'all':
				var length = O.R - O.L;
				var from = range(xP - offset, 0, 1-length);
				var to = from + length;
				O.L = from;
				O.R = to;
				break;
		}
		removeHover();
		sliderUpdate(O);
	}
	function onSliderEnd(e) {
		if (e.constructor&&e.constructor.name=='MouseEvent') {
			isMouseDown = false;
		} else {
			dragItems[e.changedTouches[0].identifier] = null;
		}
	}
	function sliderUpdate(O) {
		var w = sliderContainer.clientWidth;	
		sliderBg1.style.right = (1-O.L)*w+'px';
		sliderBg2.style.left = O.R*w+'px';
		sliderBtn.style.left = O.L*w+'px';
		sliderBtn.style.right = (1-O.R)*w+'px';
	}

	var mouseX = 0;
	window.addEventListener('mousemove', function (e) {
		if (isMouseDown && dragItems.mouse)
			onSliderMove(e);
	});

	var hoverElement = null;
	legendCanvas.addEventListener('mousemove', updateHover);
	legendCanvas.addEventListener('touchmove', updateHover);
	legendCanvas.addEventListener('mouseleave', removeHover);
	function updateHover(e) {
		var chart = charts[O.id];
		var length = chart.length-1;
		var boundingRect = mainContainer.getBoundingClientRect();
		var x, y;
		if (e.constructor&&e.constructor.name=='MouseEvent') {
			x = e.clientX;
			y = e.clientY;
		} else if (e.constructor&&e.constructor.name=='TouchEvent') {
			x = e.changedTouches[0].clientX;
			y = 0;
		}
		var p = (x - boundingRect.x) / boundingRect.width;
		var xP = O.L + p * (O.R - O.L);
		var xO = round(xP * length);
		O.hover = xO;

		if (hoverElement == null) {
			hoverElement = $('div', 'hover');
			hoverElement.append($('h1'));
			for (var columnName of Object.keys(chart.y)) {
				var box = $('div', 'box '+columnName);
				var value = $('div', 'value');
				var label = $('div', 'label', null, chart.names[columnName]);
				label.style.color = value.style.color = chart.colors[columnName].rgba(1);
				box.append(value, label);
				hoverElement.append(box);
			}
			container.append(hoverElement);
		}

		for (var columnName of Object.keys(chart.y)) {
			hoverElement.querySelector('.'+columnName+' .value').innerHTML = formatValue(chart.y[columnName][xO]);	
			hoverElement.querySelector('.box.'+columnName).style.display = O.selected[columnName] ? 'inline-block' : 'none';
		}
		hoverElement.querySelector('h1').innerHTML = dateStr(chart.x[xO]);
		var hoverRect = hoverElement.getBoundingClientRect();
		hoverElement.style.left = range((O.hover/(chart.length-1)-O.L)/(O.R-O.L) * container.clientWidth - hoverRect.width/4, 15, container.clientWidth-hoverRect.width-15) + 'px';
		hoverElement.style.top = range(y-boundingRect.y-hoverRect.height, 0, container.clientHeight-hoverRect.height-15) + 'px';
	}
	function removeHover() {
		if (hoverElement) {
			hoverElement.remove();
			hoverElement = null;
		}
		O.hover = -1;
		O.forceRender = true;
	}
	function dateStr(t) {
		var str = (new Date(t)).toDateString();
		return str.slice(0, str.lastIndexOf(' '));
	}

	// CHECKBOXES
	const checkboxTemplate = '<div class="checkbox {CHECKED}" id="{ID}"><div class="box" style="background: {COLOR}; border-color: {COLOR};"><div class="checkmark"><span></span><span></span></div><div class="bg"></div></div><div class="label">{LABEL}</div></div>';
	var checkboxesContainer = $('div', 'checkboxes', null, 
		Array.from(Object.keys(O.selected), function (cname, i) {
			return instance(checkboxTemplate, {
				checked: O.selected[cname] ? 'checked' : '',
				id: 'c'+id+'-'+cname,
				color: chart.colors[cname].rgba(1),
				label: chart.names[cname]
			});
		}).join(''));

	checkboxesContainer.querySelectorAll('.checkbox').forEach(function (checkbox) {
		var columnName = checkbox.id.substring(checkbox.id.indexOf('-')+1, checkbox.id.length);
		var activeRipple = null;
		checkbox.addEventListener('mousedown', createRipple);
		checkbox.addEventListener('mouseup', removeRipple);
		checkbox.addEventListener('touchstart', createRipple);
		checkbox.addEventListener('touchend', removeRipple);
		function onCheckboxClick(e) {
			O.selected[columnName] = 1 - O.selected[columnName];
			checkbox.className = 'checkbox' + (O.selected[columnName] ? ' checked' : '');
			removeHover();
		}
		var touch = false;
		function createRipple(e) {
			var X, Y;
			if (e.constructor&&e.constructor.name=='TouchEvent') {
				e.preventDefault();
				X = e.changedTouches[0].clientX;
				Y = e.changedTouches[0].clientY;
			} else {
				X = e.clientX;
				Y = e.clientY;
			}

			// ripple effect
			var ripple = $('div', 'ripple');
			var rect = checkbox.getBoundingClientRect();
			var y = (Y - rect.y),
				x = (X - rect.x);
			ripple.style.top =  y + 'px';
			ripple.style.left = x + 'px';
			ripple.style.width = ripple.style.height = '0px';
			checkbox.append(ripple);

			var size = sqrt(rect.width ** 2 + rect.height ** 2)*2;
			setTimeout(function () {
				ripple.style.width = ripple.style.height = size+'px';
				ripple.style.top = (y - (size/2)) + 'px';
				ripple.style.left = (x - (size/2)) + 'px';
				ripple.style.opacity = '0.5';
			}, 16);
			activeRipple = ripple;
		}
		function removeRipple(e) {
			if (e.constructor&&e.constructor.name=='TouchEvent')
				e.preventDefault();
			var ripples = checkbox.querySelectorAll('.ripple');
			if (ripples != null) {
				ripples.forEach(function (ripple) {
					ripple.style.opacity = '0';
					setTimeout(function () {
						ripple.remove();
					}, 200)
				})
			}
			onCheckboxClick(e);
		}
	});


	container.append($('h1', 'header', null, chart.title), mainContainer, checkboxesContainer);

	wrapper.append(container);
	onResize();
	sliderUpdate(O);
	setTimeout(function(){sliderUpdate(O)},0);
}
window.start=function() {
	for (var i = 0; i < charts.length; ++i)
		initChart(headings[i], i);
}

window.addEventListener('scroll', function () {
	switcher.className = (html.scrollTop+html.clientHeight) >= (html.scrollHeight-150) ? 'no-shadow' : '';
});
switcher.addEventListener('click', function () {
	night = !night;
	setNight();
});
var night = false;
if (['true','false'].indexOf(localStorage.night)>=0)
	night = localStorage.night == 'true';
function setNight() {
	lastModeChanged = Date.now();
	localStorage.night = night;
	switcher.querySelector('span').innerHTML = night ? 'Day' : 'Night';
	html.className = night ? 'night' : '';
}

function instance(template, parameters) {
	var str = template;
	for (var parameterName in parameters)
		str = str.replace(new RegExp('\\{'+parameterName.toUpperCase()+'\\}', 'g'), parameters[parameterName]);
	return str;
}
function objEqual(a, b) {
	for (var key in a)
		if (b[key] != a[key])
			return false;
	return true;
}

function initGL(G) {
	if (!G) return null;
	G.shaderSource(vertexShader=G.createShader(35633), "precision highp float;\nattribute vec2 V;\nvoid main() {\n\tgl_Position = vec4(V, 0.0, 1.0) * 2.0 - 1.0;\n}\n");
	G.compileShader(vertexShader);
	G.shaderSource(fragmentShader=G.createShader(35632), "precision mediump float;\nuniform vec4 color;\nvoid main() {\n\tgl_FragColor = color;\n}\n");
	G.compileShader(fragmentShader);
	G.attachShader(program=G.createProgram(), vertexShader);
	G.attachShader(program, fragmentShader);
	G.linkProgram(program);
	G.useProgram(program);
	G._cu = G.getUniformLocation(program, 'color');
	G._vb = G.createBuffer();
	G.enableVertexAttribArray(G._va=G.getAttribLocation(program,'V'));
	G.enable(3042);
	G.blendEquation(32774);
	G.blendFuncSeparate(770, 771, 1, 771);
	return G;
}
function $(tag, className, id, html, text) {
	var e = document.createElement(tag);
	if (typeof className === 'string')
		e.className = className;
	if (typeof id === 'string')
		e.id = id;
	if (typeof text === 'string')
		e.innerText = text;
	if (typeof html === 'string') {
		e.innerHTML = html;
	}
	return e;
}
let dataReq = new XMLHttpRequest();
dataReq.open('GET', 'charts_data.json', true);
dataReq.send();
dataReq.onreadystatechange = function () {
	if (this.readyState != 4) return;
	if (this.status == 200) {
		init(this.responseText);
	}
}

let headings = ['Channel #1', 'Channel #2', 'Channel #3', 'Channel #4', 'Followers'];
function generateMaxTree(array) {
	let length = array.length;
	let segTreeLength = (2 * (2 ** (Math.floor(Math.log2(length)) + 1))) - 1;
	let tree = new Array(segTreeLength).fill(null);

	buildTree(0, length-1, 0);
	function buildTree(l, r, p) {
		if (l == r) {
			tree[p] = array[l];
			return;
		}
		let middle = Math.floor((l+r)/2);
		buildTree(l, middle, (2 * p) + 1);
		buildTree(middle+1, r, (2 * p + 2));

		tree[p] = Math.max(tree[2 * p + 1], tree[2 * p + 2]);
	}

	function range(ql, qr, l, r, p) {
		if (ql <= l && qr >= r)
			return tree[p];
		if (ql > r || qr < l)
			return -Infinity;
		let middle = Math.floor((l+r)/2);
		let left = range(ql, qr, l, middle, p * 2 + 1);
		let right = range(ql, qr, middle+1, r, p * 2 + 2);

		return Math.max(left, right);
	}

	return function (l, r) {
		return range(l, r, 0, length-1, 0);
	}
}
function init(data) {
	if (typeof data === 'string' && data.length > 0) {
		data = JSON.parse(data);
	}
	
	window.charts = Array.from(data, function (chart_data, i) {
		var x, y = {}, max = 0, columns = [];
		for (let column of chart_data.columns) {
			switch (chart_data.types[column[0]]) {
				case 'x': 
					x = column.slice(1);
					break;
				case 'line':
					let columnArray = column.slice(1);
					columnArray.maxFunc = generateMaxTree(columnArray);
					columnArray.max = columnArray.maxFunc(0, columnArray.length-1);
					if (columnArray.max > max)
						max = columnArray.max;
					columns.push(column[0]);
					y[column[0]] = columnArray;
				default: 
					break;
			}
		}
		var colors = {};
		for (let column in chart_data.colors)
			colors[column] = extendColor(chart_data.colors[column]);
		return {
			title: headings[i] || 'Chart #'+i,
			length: chart_data.columns[0].length - 1,
			colors: colors,
			names: chart_data.names,
			types: chart_data.types,
			x: x,
			y: y,
			columns: columns,
			max: max
		};
	});

	start();
}
function extendColor(color) {
	let raw =  [parseInt(color.substring(1, 3), 16),
			   parseInt(color.substring(3, 5), 16),
			   parseInt(color.substring(5, 7), 16)];
	return {
		raw: raw,
		rgba: function (a) {return 'rgba('+raw.join(',')+','+a+')';},
		floata: function (a) {return [raw[0]/255, raw[1]/255, raw[2]/255, a]}
	}
}
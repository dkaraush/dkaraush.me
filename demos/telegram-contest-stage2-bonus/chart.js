// polyfills
if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(target, firstSource) {
      if (target === undefined || target === null)
        throw new TypeError('Cannot convert first argument to object');
      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null)
          continue;
        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (desc !== undefined && desc.enumerable)
            to[nextKey] = nextSource[nextKey];
        }
      }
      return to;
    }
  });
}
if (!Array.from) {
  Array.from = (function() {
    var toStr = Object.prototype.toString;
    var isCallable = function(fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };
    return function from(arrayLike/*, mapFn, thisArg */) {
      var C = this;
      var items = Object(arrayLike);
      if (arrayLike == null)
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        if (!isCallable(mapFn))
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        if (arguments.length > 2)
          T = arguments[2];
      }
      var len = toLength(items.length);
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);      
      var k = 0;
      var kValue;
      while (k < len) {
        kValue = items[k];
        A[k] = mapFn ? (typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k)) : kValue;
        k += 1;
      }
      A.length = len;
      return A;
    };
  }());
}

(function () {
	function scale() {
		// if ($isMobile && window.devicePixelRatio >= 1.5)
		// 	return 1;
		return window.devicePixelRatio;
	}

	const D = 24*60*60*1000, PI = Math.PI;
	$isMobile = /Android|webOS|iPhone|iPad|iPod|pocket|psp|kindle|avantgo|blazer|midori|Tablet|Palm|maemo|plucker|phone|BlackBerry|symbian|IEMobile|mobile|ZuneWP7|Windows Phone|Opera Mini/i.test(navigator.userAgent);
	$doc = document;
	$win = window;
	$body = document.body;
	$ = $doc.querySelector.bind($doc);
	$html = $('html');
	$arr = $doc.querySelectorAll.bind($doc);
	$new = function (query, content, elements, type) {
		function removeFirstSymbol(s) {
			return s.substring(1)
		}
		var element = $doc.createElement(query.match(/^(\w+)/)[0]);
		var classes = query.match(/(\.[\w\d-]+)/g),
			ids =		 query.match(/(#[\w\d-]+)/g);
		if (classes)
			element.className = classes.map(removeFirstSymbol).join(' ');
		if (ids)
			element.id = ids.map(removeFirstSymbol).join(' ');
		if (content)
			element['inner'+(type?'HTML':'Text')] = content;
		if (elements) {
			for (var i = 0; i < elements.length; ++i)
				element.appendChild(elements[i])
		}
		return element;
	}
	// Object.getOwnPropertyNames(Math).forEach(function(k){window[k]=Math[k]});
	function range(x, _min, _max) {
		return Math.max(Math.min(x, _max), _min);
	}
	function log2(x) {
		return Math.log(x) / Math.LN2;
	}
	var debugLines = false;
	var colors = {
		'background': [[250,250,250,1],[36,47,62,1]],
		'gridLines': [[24,45,59,0.1],[255,255,255,0.1]],
		'gridText': [[142,142,147,1],[163,177,194,0.6]]
	}
	var lastTimeModeChanged = 0;
	document.addEventListener('darkmode', function (e) {
		lastTimeModeChanged = Date.now();
	})
	function color(name, a, type) {
		var mode = $html.className.split(' ').indexOf('dark') == -1;
		var color = colors[name];
		var t = (range(Date.now() - lastTimeModeChanged, 0, 150) / 150);
		if (mode)
			t = 1 - t;
		t = easeinout(t);
		var raw = Array.from(color[0], function (x, i) {
			return color[0][i] + (color[1][i] - color[0][i]) * t;
		});
		if (typeof a === 'number')
			raw[3] *= a;
		if (type)
			return '#'+Array.from(raw, function (x) {
				var s = (~~x).toString(16);
				if (s.length == 1) return '0'+s;
				return s;
			}).join('');
		else
			return 'rgba('+raw.join(',')+')';
	}
	function easeinout(t) {
		return t<.5 ? 2*t*t : -1+(4-2*t)*t
	}
	const days = "Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(',')
	const fullMonths = "January,February,March,April,May,June,July,August,September,October,November,December".split(',');
	const shortMonths = fullMonths.map(function(x){return x.substring(0,3)});
	function strDate1(t) {
		var d = new Date(t);
		return [d.getUTCDate(), fullMonths[d.getUTCMonth()], d.getUTCFullYear()].join(' ')
	}
	function strDate2(t) {
		var d = new Date(t);
		return [days[d.getUTCDay()]+',',d.getUTCDate(), shortMonths[d.getUTCMonth()], d.getUTCFullYear()].join(' ');
	}
	function formatValue(v) {
		return (~~v+'').replace(/\B(?=(\d{3})+(?!\d))/g, " ");
	}
	function initGL(G) {
		if (!G) return null;
		G.shaderSource(vertexShader=G.createShader(35633), "precision mediump float;\nattribute vec2 V;\nvoid main() {\n\tgl_Position = vec4(V, 0.0, 1.0) * 2.0 - 1.0;\n}\n");
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
	function glF(gl, type, v, color, V) {
		gl.bindBuffer(gl.ARRAY_BUFFER, gl._vb);
		gl.bufferData(gl.ARRAY_BUFFER, v.BYTES_PER_ELEMENT ? v : new Float32Array(v), gl.STREAM_DRAW);
		gl.vertexAttribPointer(gl._va, 2, gl.FLOAT, false, 0, 0);
		if (color)
			gl.uniform4fv(gl._cu, color);
		gl.drawArrays(type, 0, v.length/2);
		if (debugLines && !V && typeof color !== 'undefined')
			glF(gl,gl.LINE_STRIP,v,[1,0,0,color[3]],true);
	}

	
    window.Graph = {
    	__charts: [],
		render: function (container, chart) {
			chart = prepare(chart);
			var selected = {};
			for (var i = 0; i < chart.axes.length; ++i)
				selected[chart.axes[i]] = 1;
			var O = {
				chart: chart,
				id: chart.id,
				selected: selected,
				alpha: Object.assign({}, selected),
				L: 0.5, R: 1,
				forceRender: false,
				first: true,
				hover: -1,
				zoom: {
					value: 0,
					t: 0,
					tStart: 0,
					from: 0,
					chart: null,
					duration: 150,
					loading: false
				}
			};

			O.container = $new('div.chart');
			var zoomOut, zoomOutEl, header = $new('div.chart--header', null, [
				$new('h3.chart--heading', chart.title),
				zoomOutEl = $new('h3.chart--zoom-out', 'Zoom Out'),
				O.dateLabel = $new('h3.chart--date'),
				O.dateLabelZoomed = $new('h3.chart--date-zoomed'),
			]);
			zoomOutEl.addEventListener('click', function () {
				removeHover();
				smallHover(-1);
				if (!O.zoom.value)
					return;
				O.container.className = 'chart';
				O.slider.className = 'chart--slider';
				O.zoom.value = false;
				O.zoom.tStart = Date.now() - (1-Math.abs(O.zoom.value - O.zoom.t)) * O.zoom.duration;
				if (chart.types.y0 != O.zoom.chart.types.y0)
					O.removeCheckboxes();
			});
			var btnarr = [$new('span'), $new('span')];
			if (chart.percentage||chart.types.y0=='bar')
				btnarr.push($new('span.chart--whiteborder'))
			O.content = $new('div.chart--content', null, [
				O.canvas = $new('canvas'), O.canvasLegend = $new('canvas'),
				// $new('div.graph--leftbg'),
				// $new('div.graph--rightbg'),
				O.slider = $new('div.chart--slider', null, [
					O.sliderLeft = $new('span.chart--bg'),
					O.sliderBtn = $new('span.chart--btn', null, btnarr),
					O.sliderRight = $new('span.chart--bg'),
				])
			]);
			O.sliderLeft.style.left = O.sliderRight.style.right = '0';
	
			var options = {alpha: true, stencil: true, preserveDrawingBuffer: true};
			O.legendCtx = O.canvasLegend.getContext('2d', options);
			var shouldUseCanvas = navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ||
								  navigator.userAgent.match(/iPad/i) != null ||
								  !window.WebGLRenderingContext;
			if (shouldUseCanvas) {
				O.ctx = O.canvas.getContext('2d', options);
			} else {
				O.ctx = O.canvas.getContext('webgl', options) || 
						O.canvas.getContext('experimental-webgl', options);
				if (!O.ctx) {
					O.ctx = O.canvas.getContext('2d', options);
					O.gl = null;
				} else {
					O.gl = initGL(O.ctx);
				}
				O.type = !!O.gl;
			}

			function onResize() {
				O.p = 15;
				O.P = O.p * scale();
				var lastW = O.W, lastH = O.H, lastSH = O.sH, lastCH = O.cH;
				O.W = O.content.clientWidth * scale();
				O.H = O.content.clientHeight * scale();
				O.sH = 48 * scale();
				O.cH = O.H - (80 * scale());
				O.sliderRect = O.slider.getBoundingClientRect();
				O.canvasRect = O.canvas.getBoundingClientRect();
				if (lastW != O.W || lastH != O.H || lastSH != O.sH || lastCH != O.cH) {
					O.canvasLegend.width = O.canvas.width = O.W;
					O.canvasLegend.height = O.canvas.height = O.H;
					O.forceRender = true;
				}
				if (O.type)
					O.gl.viewport(0,0,O.W,O.H);
				O.updateSlider();
				O.updateDate();
			}
			$win.addEventListener('resize', onResize);

			var checkboxes;
			if (chart.axes.length > 1) {
				checkboxes = $new('div.chart--checkboxes');
				chart.axes.forEach(function (columnName) {
					var label, bg, checkbox = $new('div.chart--checkbox.chart--checked.chart--'+columnName, null, [
						$new('div.chart--checker', null, [span1=$new('span'), span2=$new('span')]),
						label=$new('span.chart--label', chart.names[columnName])
					]);

					var color = chart.colors[columnName].rgb;
					checkbox.style.backgroundColor = color;
					label.style.color = color;
					checkbox.style.borderColor = color;

					const pressTime = 750;
					var state = false;
					var pressedTime = 0;
					if ($isMobile) {
						checkbox.addEventListener('touchstart', touchStart);
						checkbox.addEventListener('touchend', touchStop);
					} else {
						checkbox.addEventListener('mousedown', touchStart);
						checkbox.addEventListener('mouseup', touchStop);
						checkbox.addEventListener('mouseleave', function () {
							state = false;
						});
					}
					function touchStart() {
						pressedTime = Date.now();
						state = true;
						setTimeout(function () {
							if (state && Date.now() - pressedTime >= pressTime) {
								onLongClick();
								state = false;
							}
						}, pressTime);
					}
					function touchStop() {
						state = false;
						if (Date.now() - pressedTime < pressTime)
							onClick();
					}

					function onClick() {
						var isChecked = checkbox.className.indexOf('chart--not-checked') < 0;
						if (Object.keys(O.selected).filter(function(k){return O.selected[k]}).length == 1 && isChecked) {
							error(checkbox);
							return;
						}
						checkbox.className = 'chart--checkbox chart--'+columnName+' chart--' + (isChecked ? 'not-checked' : 'checked');
						O.selected[columnName] = !isChecked-0;
						if (O.hover >= 0)
							updateHoverElement();
					}
					function onLongClick() {
						for (var a = 0; a < O.chart.axes.length; ++a) {
							var axesName = O.chart.axes[a];
							O.selected[axesName] = axesName == columnName;
							O.container.querySelector('.chart--checkbox.chart--'+axesName).className = 'chart--checkbox chart--'+axesName+' chart--'+(O.selected[axesName] ? 'checked' : 'not-checked');
						}
						if (O.hover >= 0)
							updateHoverElement();	
					}

					checkboxes.appendChild(checkbox);
				});
			}
			O.updateCheckboxes = function (Or, chart) {
				var checkboxes = $new('div.chart--checkboxes');
				checkboxes.style.position = 'absolute';
				checkboxes.style.left = checkboxes.style.right = '0';
				checkboxes.style.bottom = '15px';
				checkboxes.style.opacity = 0;
				checkboxes.style.width = 'initial';
				setTimeout(function () {
					checkboxes.style.opacity = 1;
				}, 20);
				checkboxes.style.zIndex = 9;
				var added = 0;
				Object.keys(Or.selected).forEach(function (columnName) {
					var label, bg, checkbox = $new('div.chart--checkbox'+(Or.selected[columnName]?'.chart--checked':''), null, [
						$new('div.chart--checker', null, [span1=$new('span'), span2=$new('span')]),
						label=$new('span.chart--label', chart.names[columnName])
					]);

					var color = chart.colors[columnName].rgb;
					checkbox.style.backgroundColor = color;
					label.style.color = color;
					checkbox.style.borderColor = color;

					checkbox.addEventListener('click', function () {
						var isChecked = checkbox.className.indexOf('chart--not-checked') < 0;
						if (Object.keys(Or.selected).filter(function(k){return Or.selected[k]}).length == 1 && isChecked) {
							error(checkbox);
							return;
						}
						checkbox.className = 'chart--checkbox chart--' + (isChecked ? 'not-checked' : 'checked');
						Or.selected[columnName] = !isChecked-0;
						if (O.hover >= 0)
							updateHoverElement();
					});

					checkboxes.appendChild(checkbox);
					added++;
					if (added == Object.keys(Or.selected).length) {
						setTimeout(function () {
							O.container.style.paddingBottom = Math.max(0, checkboxes.clientHeight-48+15) + 'px';
						}, 10);
					}
				});
				O.container.appendChild(checkboxes);
			}
			O.removeCheckboxes = function () {
				var D = O.container.querySelectorAll('div.chart--checkboxes');
				if (D != null) {
					D.forEach(function (x) {
						x.style.opacity = '0';
						setTimeout(function () {
							x.remove();
						}, 150);
					})
				}
				O.container.style.paddingBottom = '0px';
			}

			O.content.addEventListener('mouseenter', updateHover);
			O.content.addEventListener('mousemove', updateHover);
			O.content.addEventListener('mouseleave', removeHover);
			O.content.addEventListener('touchstart', updateHover);
			O.content.addEventListener('touchmove', updateHover);
				
			function hasHoverParent(element) {
				while (element != null) {
					if (element.className.split(' ').indexOf('chart--hover') >= 0)
						return true;
					element = element.parentElement;
				}
				return false;
			}

			var sHover = null
			function smallHover(i) {
				if (sHover == null) {
					O.content.appendChild(sHover = $new('div.chart--hover', null, [
						$new('tr.chart--label'),
						$new('tr.chart--value')
					]));
				}

				if (i == -1) {
					sHover.parentElement.removeChild(sHover);
					sHover = null;
					return;
				}

				sHover.querySelector('tr.chart--label').innerText = O.chart.names[O.chart.axes[i]];
				sHover.querySelector('tr.chart--value').innerText = O.zoom.arr[i];
				sHover.querySelector('tr.chart--value').style.color = O.chart.colors[O.chart.axes[i]].rgb;
			}

			var hover = null, hDate;
			function updateHover(e) {
				var x, y;
				if (hover && hover.className.indexOf('loading') >= 0)
					return;
				if ($isMobile && (O.chart.x_on_zoom||O.chart.percentage) && !O.zoom.value && !O.zoom.loading && hasHoverParent(e.target)) {
					e.preventDefault();
					zoom();
					return;
				}
				if (e instanceof MouseEvent) {
					x = e.clientX;
					y = e.clientY;
				} else {
					x = e.changedTouches[0].clientX;
					y = e.changedTouches[0].clientY;
				}
				var chart = O.zoom.chart&&O.zoom.value?O.zoom.chart:O.chart;
				var o = O.zoom.value ? O.zoom : O;
				var bRect = O.canvas.getBoundingClientRect();
				var xP = range((x - 15 - bRect.left) / (bRect.width-30), 0, 1);
				var yP = (y - bRect.top) / bRect.height;
				if (yP > (O.cH)/O.H) {
					O.content.style.cursor = 'default';
					removeHover();
					return;
				}
				O.content.style.cursor = (O.zoom.value||(!O.chart.x_on_zoom&&!O.chart.percentage))?'default':'pointer';

				if (chart.percentage && chart.stacked && O.zoom.value) {
					var A = yP - (O.cH / O.H / 2 + 0.05), B = xP - 0.5;
					var a = Math.atan2(A, B) % (PI*2);
					if (a < 0)
						a+=PI*2;
					var r = Math.sqrt(Math.pow(A, 2) + Math.pow(B, 2));
					if (r < 0.3 && typeof O.zoom.arr !== 'undefined') {
						var p = 0, e = 0, current = null;
						for (var i = 0; i < O.zoom.arr.length; ++i) {
							e = p + O.zoom.arr[i] / O.zoom.sum;
							if (a / (Math.PI*2) > p &&
								a / (Math.PI*2) < e) {
								current = i;
								break;
							}
							p = e;
						}
						O.zoom.c = current;
					} else
						O.zoom.c = -1;
					smallHover(O.zoom.c);
					if (sHover) {
						sHover.style.left = (xP * bRect.width + 20) + 'px';
						sHover.style.top = yP * bRect.height + 'px';
					}
				} else {
					var isBar = chart.types.y0=='bar';
					if (isBar) {
						o.hover = range(Math.round((o.L+(o.R-o.L)*xP)*(chart.length)-0.5), 0, chart.length-1);
					} else {
						if (chart.percentage) {
							o.hover = range(Math.round((o.L+(o.R-o.L)*xP)*(chart.length)), 0, chart.length-1);
						} else
							o.hover = range(Math.round((o.L+(o.R-o.L)*xP)*(chart.length-1)), 0, chart.length-1);
					}
				}
				updateHoverElement(xP);
			}
			function updateHoverElement(xP) {
				var chart = O.zoom.value?O.zoom.chart:O.chart;
				var o = O.zoom.value&&!chart.percentage ? O.zoom : O;
				if (chart.percentage && O.zoom.value)
					return;
				if (hover == null) {
					buildHover();
				}
				var sum = 0;
				for (var i = chart.axes.length-1; i >= 0; --i) {
					var column = hover.querySelector('tr.chart--column.chart--'+chart.axes[i]);
					if (column == null) {
						buildHover();
						column = hover.querySelector('tr.chart--column.chart--'+chart.axes[i])
					}
					var value = column.querySelector('td.chart--value');
					var label = column.querySelector('td.chart--label');
					var percent = column.querySelector('td.chart--percent');
					var b = (O.zoom.value&&O.zoom.chart&&O.zoom.selected&&O.zoom.chart.types.y0!=O.chart.types.y0?O.zoom:O).selected[chart.axes[i]]?'table-row':'none'
					column.style.display = b;

					if (percent)
						percent.style.display = b;
					var v = chart.data[chart.axes[i]][o.hover];
					if (chart.stacked && O.selected[chart.axes[i]])
						sum += v;
					if (percent && chart.percentage && !O.zoom.value)
						percent.innerText = (v / o.sumTree[o.hover] * 100).toFixed(1) + '%';
					value.innerText = formatValue(v);
				}
				if (chart.stacked && !chart.percentage) {
					hover.querySelector('tr.chart--column.chart--all td.chart--value').innerText = formatValue(sum);
				}
				var from = o.L * chart.length, to = o.R * chart.length;
				var X = xP * O.canvasRect.width;
				hover.style.left = range(X + (X < hover.clientWidth ? 30 : -(hover.clientWidth)-30), 15, O.canvasRect.width - hover.clientWidth - 15) + 'px';
				var date = new Date(chart.data.x[o.hover]);
				hDate.innerText = (O.zoom.value ? z(date.getUTCHours()) + ':' + z(date.getUTCMinutes()) + ' ' : '') + strDate2(chart.data.x[o.hover]);
			}
			function buildHover() {
				if (hover) {
					hover.parentElement.removeChild(hover);
					// hover.remove();
				}
				var o = O.zoom.value ? O.zoom : O;
				var chart = O.zoom.value?O.zoom.chart:O.chart;
				hover = $new('div.chart--hover'+(O.zoom.value||(!O.chart.x_on_zoom&&!O.chart.percentage)?'':'.chart--available'));
				var header = hDate=$new('h3', strDate2(chart.data.x[o.hover]));
				hover.appendChild(header);
				var tbody, table = $new('table', null, [tbody=$new('tbody')]);
				hover.appendChild($new('span.chart--icon'));
				hover.appendChild(table);
				for (var i = 0; i < chart.axes.length; ++i) {
					var label = $new('td.chart--label'), value = $new('td.chart--value');
					value.style.color = chart.colors[chart.axes[i]].rgb;
					label.innerText = chart.names[chart.axes[i]];
					var arr = [label, value];
					if (chart.percentage)
						arr.unshift($new('td.chart--percent', '%%%'))
					tbody.appendChild($new('tr.chart--column.chart--'+chart.axes[i], null, arr));
				}
				if (chart.stacked && !chart.percentage) {
					var label = $new('td.chart--label', 'All'), value = $new('td.chart--value');
					label.style.fontWeight = 'bold';
					var arr = [label, value];
					// if (chart.percentage)
					// 	arr.unshift($new('div.chart--pall', ))
					tbody.appendChild($new('tr.chart--column.chart--all', null, arr));
				}
				if (!O.zoom.value&&(O.chart.x_on_zoom||O.chart.percentage)) {
					hover.addEventListener('click', zoom);
				}
				O.content.appendChild(hover);
			}
			function removeHover(e) {
				O.hover = -1;
				O.zoom.hover = -1;
				if (hover) {
					// hover.remove();
					hover.parentElement.removeChild(hover);
					hover = null;
				}
			}
			if (!$isMobile) {
				O.content.addEventListener('click', zoom);
			}
			function zoom() {
				if (O.zoom.value || O.hover < 0)
					return;
				if (!O.chart.percentage && !O.chart.x_on_zoom)
					return;
				O.zoom.loading = true;
				O.zoom.from = O.hover;
				O.container.className = 'chart chart--zoomed';
				var timestamp = chart.data.x[O.zoom.from], d = cutTime(timestamp);
				if (chart.percentage || !chart.x_on_zoom) {
					removeHover();
					O.zoom.loading = false;
					O.zoom.value = true;
					O.zoom.tStart = Date.now() - (1-Math.abs(O.zoom.value - O.zoom.t)) * O.zoom.duration;
					O.zoom.chart = chart;
					O.zoom.F = range(O.zoom.from - 3, 0, O.zoom.chart.length-1);
					O.zoom.T = range(O.zoom.from + 3, 0, O.zoom.chart.length-1);
					O.zoom.L = O.zoom.from;
					O.zoom.R = O.zoom.from;
					O.updateDate();
				} else {
					if (hover)
						hover.className = 'chart--hover chart--loading';
					chart.x_on_zoom(O.zoom.from).then(function onSuccess(zoomedChart) {
						removeHover();
						zoomedChart = prepare(zoomedChart);
						O.zoom.chart = zoomedChart;
						if (O.zoom.chart.stacked)
							O.zoom.sumTree = makeSumTree(O.zoom.chart, O);
						O.zoom.alpha = {};
						O.zoom.selected = {};
						for (var i = 0; i < zoomedChart.axes.length; ++i) {
							O.zoom.alpha[zoomedChart.axes[i]] = 1;
							O.zoom.selected[zoomedChart.axes[i]] = 1;
						}
						var L = 0, R = 0, F, T;
						for (var i = 0; i < zoomedChart.length; ++i) {
							if (cutTime(zoomedChart.data.x[i]) == d) {
								L = i;
								break;
							}
						}
						for (var i = zoomedChart.length-1; i >= 0; --i) {
							if (cutTime(zoomedChart.data.x[i]) == d) {
								R = i;
								break;
							}
						}
						O.zoom.F = O.zoom.T = -1;
						var f = cutTime(zoomedChart.data.x[0]),
							t = cutTime(zoomedChart.data.x[zoomedChart.length-1]), x;
						for (var i = 0; i < chart.length; ++i) {
							x = cutTime(chart.data.x[i]);
							if (x == f && O.zoom.F == -1)
								O.zoom.F = i;
							if (x == t && O.zoom.T == -1)
								O.zoom.T = i;
							if (O.zoom.F!=-1 && O.zoom.T!=-1)
								break;
						}
						if (O.zoom.F == -1)
							O.zoom.F = 0;
						if (O.zoom.T == -1)
							O.zoom.T = chart.length-1;
						O.zoom.L = L / (zoomedChart.length - 1);
						O.zoom.R = R / (zoomedChart.length - 1);

						if (chart.types.y0 != zoomedChart.types.y0) {
							O.slider.className = 'chart--slider chart--hide';
							O.zoom.L=0;
							O.zoom.R=1;
							O.updateCheckboxes(O.zoom, O.zoom.chart);
						}
						O.zoom.loading = false;
						O.zoom.value = true;
						O.updateDate();
						O.zoom.tStart = Date.now() - (1-Math.abs(O.zoom.value - O.zoom.t)) * O.zoom.duration;
					}, function onFail() {
						// TODO
					});
				}
			}
			function cutTime(t) {
				var d = new Date(t);
				return (new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).getTime();
			}

			var isMouseDown = false;
			var mouseX = -1;
		 	O.slider.addEventListener('mousedown', sliderDown);
		 	O.slider.addEventListener('touchstart', sliderDown);
		 	O.slider.addEventListener('touchmove', sliderMove);
		 	O.slider.addEventListener('touchend', sliderUp);
			$body.addEventListener('mousemove', sliderMove);
			$body.addEventListener('mouseup', function (e) {
				isMouseDown = false;
			});

			var touchTypes = {};
			var offset = 0;
		 	function sliderDown(e) {
				var x, radius, type;
				if (e instanceof MouseEvent) {
					isMouseDown = true;
					x = e.clientX;
					type = 'mouse';
					radius = 10 / O.sliderRect.width;
				} else {
					if (e.changedTouches) {
						e.preventDefault();
						for (var i = 0; i < e.changedTouches.length; ++i)
							sliderDown(e.changedTouches[i]);
						return;
					}
					type = e.identifier;
					x = e.clientX;
					radius = Math.max(e.radiusX, 10) / O.sliderRect.width;
				}
				var xP = (x - O.sliderRect.left) / O.sliderRect.width;
				var o = O.zoom.value ? O.zoom : O;

				var l = PR(O.zoom)?PRa(O.zoom,1):o.L;
				var r = PR(O.zoom)?PRa(O.zoom,0):o.R;

				if (xP >= l-radius*0.2 && xP <= l+radius*1.2) {
					touchTypes[type] = 'L';
				} else if (xP >= r-radius*1 && xP <= r+radius*0.3) {
					touchTypes[type] = 'R';
				} else if (xP >= l && xP <= r) {
					touchTypes[type] = 'all';
					offset = xP - l;
				} else
					touchTypes[type] = null;
			}
			function sliderMove(e) {
				var x, type, radius;
				if (e instanceof MouseEvent) {
					if (!isMouseDown)
						return;
					x = e.clientX;
					type = 'mouse';
					radius = 10 / O.sliderRect.width;
				} else {
					if (e.changedTouches) {
						e.preventDefault();
						for (var i = 0; i < e.changedTouches.length; ++i)
							sliderMove(e.changedTouches[i]);
						return;
					}
					type = e.identifier;
					x = e.clientX;
					radius = Math.max(e.radiusX, 10) / O.sliderRect.width;
				}
				var xP = (x - O.sliderRect.left) / O.sliderRect.width;
				var o = O.zoom.value ? O.zoom : O;
				
				var l = PR(O.zoom)?PRa(O.zoom,1):o.L;
				var r = PR(O.zoom)?PRa(O.zoom,0):o.R;
				var minRange = PR(O.zoom)?1/(O.zoom.T - O.zoom.F+1):0.1;
				var nL = null, nR = null;
				if (touchTypes[type] == 'L') {
					nL = range(xP-radius*0.5, 0, r - minRange);
				} else if (touchTypes[type] == 'R') {
					nR = range(xP+radius*0.5, l + minRange, 1);
				} else if (touchTypes[type] == 'all') {
					var L = (r - l);
					nL = range(xP - offset, 0, 1 - L);
					nR = nL + L;
				} else
					return;
				
				if (nL != null) {
					if (PR(O.zoom))
						o.L = range(Math.round(O.zoom.F-0.5 + nL * (O.zoom.T - O.zoom.F+1)+0.5), O.zoom.F, o.R+1);
					else o.L = nL;
				}

				if (nR != null) {
					if (PR(O.zoom))
						o.R = range(Math.round(O.zoom.F-0.5 + nR * (O.zoom.T - O.zoom.F+1)-0.5), o.L, O.zoom.T);
					else o.R = nR;
				}

				O.updateSlider();
				O.updateDate();
				if (O.hover >= 0)
					updateHoverElement();
				removeHover();
			}
			function sliderUp(e) {
				var type;
				if (e instanceof MouseEvent) {
					type = 'mouse';
					isMouseDown = false;
					touchTypes[type] = null;
				}
			}
			O.updateSlider = function (L, R) {
				smallHover(-1);
				var o = O.zoom.value ? O.zoom : O;
				if (typeof L === 'undefined' && typeof R === 'undefined' && 
					chart.percentage && O.zoom.value) {
					L = PRa(O.zoom,1);
					R = PRa(O.zoom,0);
				} else {
					if (typeof L === 'undefined') L = o.L;
					if (typeof R === 'undefined') R = o.R;
				}
				var p = 7.5 / O.slider.clientWidth, l = L+p, r = R-p;
				O.sliderLeft.style.width = l*100 + '%';
				O.sliderRight.style.width = (1-r)*100 + '%';
				O.sliderBtn.style.left = range(l*100, 0, 100) + '%';
				O.sliderBtn.style.width = range((r - l) * 100, 0, 100) + '%';
			}
			O.updateDate = function () {
				var L = chart.data.x[Math.floor(O.L*(chart.length-1))];
				var R = chart.data.x[Math.ceil(O.R*(chart.length-1))];
				O.dateLabel.innerText = strDate1(L) + " - " + strDate1(R);

				if (O.zoom.chart) {
					var zL, zR;
					if (O.zoom.chart.percentage) {
						zL = O.zoom.chart.data.x[O.zoom.L];
						zR = O.zoom.chart.data.x[O.zoom.R];
					} else {
						zL = O.zoom.chart.data.x[Math.round(O.zoom.L*(O.zoom.chart.length-1))];
						zR = O.zoom.chart.data.x[Math.round(O.zoom.R*(O.zoom.chart.length-1))];
					}

					var date1 = strDate2(zL), date2 = strDate2(zR);
					if (date1 == date2 || (O.zoom.chart&&chart.types.y0 != O.zoom.chart.types.y0))
						O.dateLabelZoomed.innerText = date1;
					else 
						O.dateLabelZoomed.innerText = date1 + ' - ' + date2;
				}
			}
			
			O.container.appendChild(header);
			O.container.appendChild(O.content);
			if (checkboxes)
				O.container.appendChild(checkboxes);
			container.appendChild(O.container);
			window.Graph.__charts.push(O);
			onResize();
		}
	}
	function PR(z) {
		return z.value&&z.chart&&z.chart.percentage;
	}
	function PRa(z,b) {
		return range(((b?z.L:z.R)-0.5*(b?1:-1) - (z.F-0.5)) / (z.T - z.F+1), 0, 1);
	}

	var lastTimeRender = Date.now();
	function render() {
		requestAnimationFrame(render);
		
		var t = Date.now() - lastTimeRender;
		var start = Date.now();

		for (var i = 0; i < window.Graph.__charts.length; ++i) {
			var options = window.Graph.__charts[i];
			renderMain(options, t);
			renderLegend(options, t);

			options.lastHover = options.hover;
			options.first = false;
			options.forceRender = false;
			options.lastL = options.L;
			options.lastR = options.R;
			options.zoom.lastL = options.zoom.L;
			options.zoom.lastR = options.zoom.R;
			options.lastHover = options.hover;
			options.zoom.lastHover = options.zoom.hover;
		}
		lastTimeRender = start;
	}
	render();

	function renderMain(O, t) {
		var chart = O.chart;
		var sameSelected = Object.keys(O.selected).filter(function (k) {return O.selected[k] != O.alpha[k]}).length == 0;
		if (O.zoom.value && O.zoom.selected)
			sameSelected = sameSelected && Object.keys(O.zoom.selected).filter(function (k) {return O.zoom.selected[k] != O.zoom.alpha[k]}).length == 0;
		var sliderRender = O.first || O.forceRender || !sameSelected || O.zoom.value != O.zoom.t || (
			!O[1] || O[1].minShouldBe != O[1].lastMin || O[1].maxShouldBe != O[1].lastMax
		) || (O.zoom.chart ? (!O.zoom[1] || O.zoom[1].minShouldBe != O.zoom[1].lastMin || O.zoom[1].maxShouldBe != O.zoom[1].lastMax) : false);
		if (!sliderRender && sameSelected && !O.first && !O.forceRender &&
			O.zoom.value == O.zoom.t &&
			(!O.zoom.value || ( 
				O.zoom.chart && 
				O.zoom.L == O.zoom.lastL && O.zoom.R == O.zoom.lastR && 
				O.zoom[0] && O.zoom[1] &&
				O.zoom[0].minShouldBe == O.zoom[0].lastMin &&
				O.zoom[0].maxShouldBe == O.zoom[0].lastMax &&
				O.zoom[1].minShouldBe == O.zoom[1].lastMin &&
				O.zoom[1].maxShouldBe == O.zoom[1].lastMax &&
				O.zoom.hover == O.zoom.lastHover)) &&
			O.lastL == O.L && O.lastR == O.R &&
			O[1] && O[0] &&
			O[0].minShouldBe == O[0].lastMin &&
			O[0].maxShouldBe == O[0].lastMax &&
			O[1].minShouldBe == O[1].lastMin &&
			O[1].maxShouldBe == O[1].lastMax &&
			(!chart.y_scaled || (typeof O[0].lastS === 'number' && O[0].lastS == O[0].SShouldBe)) &&
			(chart.types.y0=='line'||O.hover == O.lastHover)) {
			return;
		}
		var G = O.gl, C = O.ctx;

		var axes = chart.axes;
		
		var T = (range(t/75,0.01,1));
		var length = chart.length;
		var l = O.L + (O.zoom.L - O.L) * O.zoom.t, r = O.R + (O.zoom.R - O.R) * O.zoom.t
		var fromP = range(O.L * length, 0, length), toP = range(O.R * length, 0, length);
		var from = range(Math.floor(fromP), 0, length);
		var to = range(Math.ceil(toP), 0, length);
		var lengthP = (O.R - O.L) * length;

		// process alpha
		for (var i = 0; i < chart.axes.length; ++i) {
			var axisName = chart.axes[i];
			var alpha = O.alpha[axisName], bool = O.selected[axisName];
			if (alpha == bool)
				continue;
			O.alpha[axisName] = alpha = alpha + (bool - alpha) * T;
			if ((bool && alpha > 0.99) || (!bool && alpha < 0.01))
				O.alpha[axisName] = bool;
		}
		if (O.zoom.value && O.zoom.chart && O.zoom.selected && chart.types.y0 != O.zoom.chart.types.y0) {
			var zaxes = Object.keys(O.zoom.selected);
			for (var i = 0; i < zaxes.length; ++i) {
				var axisName = zaxes[i];
				var alpha = O.zoom.alpha[axisName], bool = O.zoom.selected[axisName];
				if (alpha == bool)
					continue;
				O.zoom.alpha[axisName] = alpha = alpha + (bool - alpha) * T;
				if ((bool && alpha > 0.99) || (!bool && alpha < 0.01))
					O.zoom.alpha[axisName] = bool;
			}
		}
		procentSubchart = processMinMax(O, O, from, to, 0, T, chart);
		if (O.zoom.value != O.zoom.t) {
			O.zoom.t = (range((Date.now() - O.zoom.tStart) / O.zoom.duration, 0, 1));
			if (!O.zoom.value)
				O.zoom.t = 1 - O.zoom.t;
			var zL = O.zoom.L, zR = O.zoom.R;
			if (O.zoom.chart.percentage) {
				zL = PRa(O.zoom, 1);
				zR = PRa(O.zoom, 0);
			}
			if (!O.zoom.chart || chart.types.y0 == O.zoom.chart.types.y0)
				O.updateSlider(O.L + (zL - O.L) * O.zoom.t,
							   O.R + (zR - O.R) * O.zoom.t);
		}

		var procentZoomSubchart;
		if (O.zoom.t && O.zoom.chart) {
			var zFrom = Math.floor(O.zoom.L * O.zoom.chart.length);
			var zTo = Math.ceil(O.zoom.R * O.zoom.chart.length);
			procentZoomSubchart = processMinMax(O.zoom, O.zoom.value && O.zoom.chart && O.zoom.chart.types.y0 != chart.types.y0 ? O.zoom : O, zFrom, zTo, 0, T, O.zoom.chart);
			// O.zoom.lastHover = O.zoom.hover;
		}

		if (!O.type) {
			if (!sliderRender)
				C.clearRect(0, 0, O.W, O.cH)
			else C.clearRect(0, 0, O.W, O.H);
			C.lineCap = 'round';
		} else {
			if (!sliderRender) {
				G.enable(G.SCISSOR_TEST);
				var h = O.cH / O.H;
				G.scissor(0, O.H-O.cH, O.W, O.cH+1);
			}
			G.clearColor(0, 0, 0, 0);
	  		G.clear(G.COLOR_BUFFER_BIT);
	  		if (!sliderRender)
	  			G.disable(G.SCISSOR_TEST);
		}
	 	maskIn(O, true);
		
		if (chart.stacked && chart.percentage) {
			renderStacked(O, chart, fromP, toP, lengthP, true);
		} else {
			var isZoom = (O.zoom.value && O.zoom.chart);
			var zL, zR;
			if (O.zoom.chart) { 
				zL = O.zoom.L * (O.zoom.chart.length);
				zR = O.zoom.R * (O.zoom.chart.length);
			}
			if (chart.types.y0 == 'bar') {
				if (O.zoom.t > 0 && O.zoom.chart && O.zoom.chart.types.y0 == 'bar')
					renderBarChart(O, O.zoom.chart, zL, zR, true, procentZoomSubchart, true);
				else if (O.zoom.t > 0 && O.zoom.chart && O.zoom.chart.types.y0 != chart.types.y0)
					renderChart(O, O.zoom, O.zoom.chart, 0, O.zoom.chart.length-1, true, procentZoomSubchart, null);
				if (O.zoom.t < 1)
					renderBarChart(O, chart, fromP, toP, true, procentSubchart);
			} else {
				if (O.zoom.t < 1)
					renderChart(O, O, chart, fromP, toP, true, procentSubchart, procentZoomSubchart);	
				else 
					renderChart(O, O, O.zoom.chart, zL, zR, true, procentZoomSubchart, null);
			}
		}
		maskOut(O);
		
		//slider
		if (sliderRender) {
			var procentChart = processMinMax(O, O, 0, chart.length, 1, T, chart);
			var procentZoomChart;
			if (O.zoom.t>0 && O.zoom.chart)
				procentZoomChart = processMinMax(O.zoom, O, 0, O.zoom.chart.length, 1, T, O.zoom.chart);

			maskIn(O, false);
			if (chart.stacked && chart.percentage) {
				renderStacked(O, chart, 0, length, length-1, false);
			} else {
				if (chart.types.y0 == 'bar') {
					if (O.zoom.t < 1)
						renderBarChart(O, chart, 0, chart.length-1, false, procentChart, false, O.zoom.chart && chart.types.y0 != O.zoom.chart.types.y0);
					if (O.zoom.chart && O.zoom.t > 0 && chart.types.y0 == O.zoom.chart.types.y0) {
						renderBarChart(O, O.zoom.chart, 0, O.zoom.chart.length-1, false, procentZoomSubchart, true);
					}
				}
				else renderChart(O, O, chart, 0, chart.length-1, false, procentChart, procentZoomChart);

			}
			maskOut(O);
		}
	}
	function makeSumTree(chart, Or, strict) {
		var sumTree = new Array(chart.length);
		for (var i = 0; i < chart.length; ++i)
			sumTree[i] = 0;
		sumTree.selected = (new Array(chart.axes.length));
		for (var a = 0; a < chart.axes.length; ++a)
			sumTree.selected[a] = Or.alpha[chart.axes[a]];
		for (var i = 0; i < chart.length; ++i)
			for (var a = 0; a < chart.axes.length; ++a)
				sumTree[i] += chart.data[chart.axes[a]][i] * Or[strict?'selected':'alpha'][chart.axes[a]];
		sumTree.getMax = generateSegmentTree(sumTree, Math.max, -Infinity);
		return sumTree;
	}
	function processMinMax(O, Or, from, to, b, T, chart) {
		var _max = null, _min = null, S = null;
		if (!O[b])
			O[b] = {};
		if (chart.stacked) {
			if (!O.sumTree || O.sumTree.selected.filter(function (x, i) {
				return Or.alpha[chart.axes[i]] != x;
			}).length > 0)
				O.sumTree = makeSumTree(chart, Or, !chart.percentage);
			_min = 0;
			if (!chart.percentage)
				_max = O.sumTree.getMax(from, to)
			else _max = 1;
		} else {
			var axisMin, axisMax, maxes = new Array(chart.axes.length),
								  mines = new Array(chart.axes.length);
			for (var i = 0; i < chart.axes.length; ++i) {
				if (Or.selected[chart.axes[i]] != 1 && !chart.y_scaled)
					continue;
				if (!b) {
					axisMax = chart.data[chart.axes[i]].getMax(from, to);
					axisMin = chart.data[chart.axes[i]].getMin(from, to);
				} else {
					axisMax = chart.data[chart.axes[i]].max;
					axisMin = chart.data[chart.axes[i]].min;
				}

				if (chart.y_scaled && i == 1) {
					S = maxes[0] / axisMax;

					if (!O[b].lastS)
						O[b].lastS = S;
					O[b].SShouldBe = S;
					S = O[b].lastS + (S - O[b].lastS) * T;
					x = Math.max(S, O[b].SShouldBe);
					n = Math.min(S, O[b].SShouldBe);
					if (x != 0 && n / x > 0.999)
						S = O[b].SShouldBe;
					O[b].lastS = S;

					axisMax *= S;
					axisMin *= S;	
				}

				maxes[i] = axisMax;
				mines[i] = axisMin;

				if (Or.selected[chart.axes[i]] != 1)
					continue;

				if (_max==null || axisMax > _max)
					_max = axisMax;
				if (_min==null || axisMin < _min)
					_min = axisMin;
			}

			var u = (_max - _min) / 5;
			var yDiff = Math.round(u / d(u)) * d(u);
			_min = Math.floor(_min/yDiff)*yDiff;
			_max = Math.ceil(_max/yDiff)*yDiff;
		}

		if (_max==null)
			_max=0;
		if (_min==null)
			_min=0;
		if (chart.types.y0=='bar')
			_min = 0;


		if (chart.axes.length > 20) {
			O[b].lastMax = O[b].maxShouldBe = _max;
		} else {
			O[b].maxShouldBe = _max;
			if (!O[b].lastMax)
				O[b].lastMax = _max;
			_max = O[b].lastMax + (_max - O[b].lastMax) * T;
			x = Math.max(_max, O[b].maxShouldBe);
			n = Math.min(_max, O[b].maxShouldBe);
			if (x != 0 && n / x > 0.999)
				_max = O[b].maxShouldBe;
			O[b].lastMax = _max;
		}

		if (chart.axes.length > 20) {
			O[b].lastMin = O[b].minShouldBe = _min;
		} else {
			O[b].minShouldBe = _min;
			if (!O[b].lastMin)
				O[b].lastMin = _min;
			_min = O[b].lastMin + (_min - O[b].lastMin) * T;
			x = Math.max(_min, O[b].minShouldBe);
			n = Math.min(_min, O[b].minShouldBe);
			if (x != 0 && n / x > 0.999)
				_min = O[b].minShouldBe;
			O[b].lastMin = _min;
		}

		return function (value, i) {
			if (chart.y_scaled && i == 1)
				value *= S;
			return (value - _min) / (_max - _min)
		}
	}
	function cpsign(x, a) {
		return ((x < 0 && a < 0) || (x > 0 && a > 0) ? 1 : -1) * a;
	}
	function maskIn(O, type) {
		var C,G;
		if (O.type) {
	  		(G=O.gl).clearStencil(0);
	  		G.clear(G.STENCIL_BUFFER_BIT);

	    	G.enable(G.STENCIL_TEST);
	    	G.colorMask(false, false, false, false);
	   		G.stencilOp(G.KEEP, G.KEEP, G.REPLACE);
	  		G.stencilFunc(G.ALWAYS, 1, 0xff);
		
			var h, p = O.P / O.W;
			if (type) {
				h = 1 - O.cH / O.H;
				glF(G, G.TRIANGLES, [0, h, 0, !!type, 1-0, h, 0, !!type, 1-0, h, 1-0, !!type]);
			} else {
				var vertices = [];
				h = O.sH / O.H;
				var rx = (5 * scale()) / O.W;
				var ry = (5 * scale()) / O.H;
				function c(x, y, a) {
					for (var n = 5, i = 0; i < n; ++i)
						vertices.push( x+Math.cos(a-PI/4+PI/2*((i)/n))*rx,
									   y+Math.sin(a-PI/4+PI/2*((i)/n))*ry,
									   x+Math.cos(a-PI/4+PI/2*((i+1)/n))*rx,
									   y+Math.sin(a-PI/4+PI/2*((i+1)/n))*ry,
									   x, y)
				}
				vertices.push(p+rx, h, 1-p-rx, h, p+rx, h-ry, p+rx, h-ry, 1-p-rx, h-ry, 1-p-rx, h,
							  p, h-ry, p+rx, h-ry, p, ry, p+rx, h-ry, p+rx, ry, p, ry,
							  p+rx, ry, 1-p-rx, ry, p+rx, 0, p+rx, 0, 1-p-rx, 0, 1-p-rx, ry,
							  1-p, h-ry, 1-p-rx, h-ry, 1-p, ry, 1-p-rx, h-ry, 1-p-rx, ry, 1-p, ry,
							  p+rx, h-ry, 1-p-rx, h-ry, p+rx, ry, 1-p-rx, h-ry, 1-p-rx, ry, p+rx, ry);
				c(p+rx, h-ry, PI-PI/4);
				c(1-p-rx, h-ry, PI/4);
				c(1-p-rx, ry, -PI/4);
				c(p+rx, ry, PI+PI/4);
				if (O.zoom.t != O.zoom.value && O.chart.types.y0 != O.zoom.chart.types.y0) {
					var cx = 0.5, cy = O.sH / O.H / 2, t = 1-O.zoom.t;
					for (var i = 0; i < vertices.length; i+=2) {
						vertices[i] = cx + (vertices[i] - cx) * t;
						vertices[i+1] = cy + (vertices[i+1] - cy) * t;
					}
				}
				// glF(G,G.TRIANGLES,[0,0,1,0,1,1,0,0,0,1,1,1]);
				glF(G, G.TRIANGLES, vertices);
			}
			G.stencilFunc(G.EQUAL, 1, 0xff);
			G.colorMask(true, true, true, true);
			G.stencilOp(G.KEEP, G.KEEP, G.KEEP);
			return;	
		}
		(C=O.ctx).save();
		C.beginPath();
		var r = 5*scale();
		if (!type) {
			function c(x, y, r, a) {
				C.arc(x-cpsign(Math.cos(a), 1)*r, y-cpsign(Math.sin(a), 1)*r, r, a-PI/4, a+PI/4);
			}
			c(O.P, O.H-O.sH, r, PI+PI/4);
			c(O.W-O.P, O.H-O.sH, r, -PI/4);
			c(O.W-O.P, O.H, r, PI/4);
			c(O.P, O.H, r, PI/2+PI/4);
			C.closePath();
		} else {
			C.moveTo(0,0);
			C.lineTo(O.W,0);
			C.lineTo(O.W,O.cH);
			C.lineTo(0,O.cH);
			C.lineTo(0,0);
		}
		C.clip();
	}
	function maskOut(O) {
		if (!O.type)
			O.ctx.restore();
		else O.gl.disable(O.gl.STENCIL_TEST);
	}
	function renderBarChart(O, chart, fromP, toP, isMain, P, isZoomed, hiding) {
		var l = toP - fromP;
		var len = chart.length - 1;
		var _fromP = range(fromP-O.P/O.W*l, 0, len);
		var _toP = range(toP+O.P/O.W*l, 0, len);
		var axes = chart.axes;
		var from = Math.floor(range(_fromP-1,0,len));
		var to = Math.ceil(_toP);
		var r = (1-2*O.P/O.W) / (toP - fromP);
		var sum = new Array(to - from + 1);
		for (var i = 0; i < sum.length; ++i)
			sum[i] = 0;
		
		var H = ((isMain ? O.cH : O.sH)/O.H);
		var _w = (hiding ? 1-O.zoom.t : 1);
		var _h = (hiding ? 1-O.zoom.t : 1);
		var _x = (1-_w)/2, _y = (1-_h)/2;

		var zMinus = 0, zPlus = 0;
		var lengthP = toP - fromP - 1;
		if (!isZoomed && !hiding) {
			zMinus = -(O.zoom.F - fromP) / lengthP;
			zPlus = 1 - (O.zoom.T - fromP) / lengthP;
		}
		var Or = O;
		if (isZoomed) Or = O.zoom;
		for (var i = 0; i < axes.length; ++i) {
			var axisName = axes[i];
			var axisData = chart.data[axisName];
			var vertices;
			if (!O.type)
				O.ctx.fillStyle = chart.colors[axisName].rgb;

			vertices = [];
			var boundaries = Or[!isMain-0];
			for (var j = from; j <= to; ++j) {
				var h = (axisData[j] * O.alpha[axisName] - boundaries.lastMin) / (boundaries.lastMax - boundaries.lastMin);
				var oh = (sum[j-from]) / (boundaries.lastMax);
				var x1 = (j-fromP) * r + O.P/O.W, x2 = x1+r;
				if (O.zoom.t > 0) {
					x1 += (j <= O.zoom.from ? zMinus : zPlus) * O.zoom.t;
					x2 += (j < O.zoom.from ? zMinus : zPlus) * O.zoom.t;
				}
				x1 = x1 * _w + _x;
				x2 = x2 * _w + _x;
				var y1 = oh*(_h)*H+_y*H+(isMain?(O.H-O.cH)/O.H:0), y2 = y1+h*(_h-_y/2)*H;
				if (O.type) {
					var A = [x1, y1, x1, y2, x2, y1, x1, y2, x2, y2, x2, y1];
					if (isMain && Or.hover >= 0 && j == Or.hover)
						glF(O.gl,O.gl.TRIANGLES,A,chart.colors[axisName].floata(isZoomed?O.zoom.t:1-O.zoom.t));
					vertices.push.apply(vertices, A);
				} else {
					O.ctx.fillStyle = chart.colors[axisName].rgba((isMain&&Or.hover>=0?(j==Or.hover?1:0.5):1)*(isZoomed?O.zoom.t:1-O.zoom.t));
					x1 = Math.round(x1*O.W);
					x2 = Math.round(x2*O.W);
					O.ctx.fillRect((x1), (1-y2)*O.H, 
									(x2-x1), (y2-y1)*O.H);
				}

				sum[j-from] += axisData[j] * O.alpha[axisName];
			}
			if (O.type) {
				glF(O.gl, O.gl.TRIANGLES, vertices, chart.colors[axisName].floata((isMain&&Or.hover>=0?0.5:1)*(isZoomed?O.zoom.t:1-O.zoom.t)))
			}
		}
	}
	function renderChart(O, Or, chart, fromP, toP, isMain, P, PZ, hiding) {
		var rw = 1 / 1.25 / O.W * scale(), 
			rh = 1 / 1.25 / O.H * scale();
		var l = toP - fromP;
		var _fromP = range(fromP-O.P/O.W*l, 0, chart.length-1);
		var _toP = range(toP+O.P/O.W*l, 0, chart.length-1);
		var s = (_fromP - fromP) / l, e = (toP - _toP) / l;
		var from = Math.floor(_fromP), to = Math.ceil(_toP);
		var axes = chart.axes;
		var C = O.ctx, G = O.gl;
		var lengthP = toP - fromP - 1;

		var alphaX = 1;
		if (O.zoom.value!=O.zoom.t&&O.zoom.chart&&isMain&&(O.zoom.chart.types.y0!=O.chart.types.y0||O.chart.types.y0=='bar'))
			alphaX = O.zoom.t;
		for (var i = 0; i < axes.length; ++i) {
			var axisName = axes[i];
			if (Or.alpha[axisName] == 0)
				continue;
			var axesData = chart.data[axisName];
			var isLineStrip = axes.length > 25 || axesData.length > 500;
			var vertices, lx = null, ly, la = null;		
			function point(p, h) {
				var x = p * (1 - O.P*2/O.W) + O.P/O.W, 
					y = (1 - h) * (O.cH / O.H);
				if (O.type && (!isMain || isLineStrip)) {
					if (!isMain)
						vertices.push(x, h * (O.sH / O.H));
					else 
						vertices.push(x, 1-y);
				} else if (O.type) {
					y = 1 - y;
					// hardcode for webgl rendering
					// chart is drawn with triangles, not lines, because lineWidth works on not all devices
					if (lx == null) {
						// it is first point, we should wait for another one
						lx = x; ly = y; 
						return;
					}
					var a = Math.atan2(ly-y, lx-x); // angle between last point and current
					var ap = a+PI/2, am = a-PI/2, cap = Math.cos(ap)*rw, sap = Math.sin(ap)*rh, cam = Math.cos(am)*rw, sam = Math.sin(am)*rh;

	// 					if (la != null) // draw triangles between lines to fill space between them
	// 						vertices.push(lx+cam,ly+sam,lx+cos(la-PI/2)*rw,ly+sin(la-PI/2)*rh,lx+cos(la+PI/2)*rw,ly+sin(la+PI/2)*rh,lx+cos(la+PI/2)*rw,ly+sin(la+PI/2)*rh,lx+cap,ly+sap,lx+cam,ly+sam);	
					la = a;

					// drawing line
					vertices.push(x+cap,y+sap,lx+cap,ly+sap,x+cam,y+sam,lx+cam,ly+sam,lx+cap,ly+sap,x+cam,y+sam);
					lx = x, ly = y;
				} else {
					C.lineTo(x*O.W, (isMain?(1-h)*O.cH:(1-h)*O.sH+O.H-O.sH));
				}
			}

			if (O.type) {
				vertices = [];
			} else {
				C.strokeStyle = chart.colors[axisName].rgba(Or.alpha[axisName] * alphaX);
				C.lineWidth = isMain ? 1.5 * scale() : 1;
				C.beginPath();
			}
			var zLen = (O.zoom.T - O.zoom.F);
			var zMinus = 0, zPlus = 0;
			if (!isMain) {
				zMinus = -(O.zoom.F - fromP) / lengthP;
				zPlus = 1 - (O.zoom.T - fromP) / lengthP;
			} else {
				var F = (O.zoom.F-fromP)/lengthP, T = (O.zoom.T-fromP)/lengthP, L = O.zoom.L, R = O.zoom.R;
				zMinus = (-F*L+F*R+L) / (L - R);
				zPlus = (L*(-T)+L+R*T - 1) / (L - R);
			}
			for (var j = from; j <= to; ++j) {
				if (PZ && O.zoom.t >= 0 && O.zoom.chart && j >= O.zoom.F && j <= O.zoom.T) {
					var fp = (O.zoom.F-fromP)/lengthP + zMinus*O.zoom.t;
					var tp = (O.zoom.T-fromP)/lengthP + zPlus*O.zoom.t;
					var s = (j - O.zoom.F) / zLen * O.zoom.chart.length;
					for (var g = s; g < O.zoom.chart.length; ++g) {
						var p = g / (O.zoom.chart.length - 1);
						var x = O.zoom.F + zLen * p;
						var x1 = Math.floor(x);
						var x2 = Math.ceil(x);
						if (x2 == x1)
							x2++;
						var xp = fp + (tp - fp) * p;
						var sy = lerpLineY(x, x1, x2, P(axesData[x1],i), P(axesData[x2],i));
						point(xp, sy + (PZ(O.zoom.chart.data[axisName][g], i) - sy) * O.zoom.t);
					}
					j = O.zoom.T;
				}

				if (j > to)
					break;
				point((j-fromP)/lengthP + (O.zoom.chart&&PZ?(j < O.zoom.from ? zMinus : zPlus) * O.zoom.t:0), P(axesData[j], i));
			}

			function lerp(A, x) {
				return A[Math.floor(x)]+(A[Math.ceil(x)]-A[Math.floor(x)])*(x-Math.floor(x));
			}
			function lerpLineY(x, x1, x2, y1, y2) {
				var t = (x - x1) / (x2 - x1);
				return y1 + (y2 - y1) * t;
			}

			if (O.type) {
				glF(G, isLineStrip||!isMain?G.LINE_STRIP:G.TRIANGLES, vertices, chart.colors[axisName].floata(Or.alpha[axisName] * alphaX));
			} else
				C.stroke();
		}
	}

	function renderStacked(O, chart, fromP, toP, lengthP, isMain) {
		var C = O.ctx, G = O.gl;
		var l = toP - fromP;
		var _fromP = range(fromP-O.P/O.W*l, 0, chart.length-1);
		var _toP = range(toP+O.P/O.W*l, 0, chart.length-1);
		var s = (_fromP - fromP) / l, e = (toP - _toP) / l;
		var from = Math.floor(_fromP-1), to = Math.ceil(_toP);
		var vertices = [];
		var arr = (new Array(to - from + 3))//.fill(0);
		for (var i = 0; i < arr.length; ++i)
			arr[i] = 0;
		var _max = -1;
		lengthP = toP - fromP + 1;
		
		var L = O.L, R = O.R;
		if (O.zoom.value&&O.zoom.chart.percentage) {
			L = (O.zoom.L-0.5 - O.zoom.F) / (O.zoom.T - O.zoom.F);
			R = (O.zoom.R+0.5 - O.zoom.F) / (O.zoom.T - O.zoom.F);
		}
		var zMinus = 0, zPlus = 0;
		if (!isMain) {
			zMinus = -(O.zoom.F - fromP) / lengthP;
			zPlus = 1 - (O.zoom.T - fromP) / lengthP;
		} else {
			var F = (O.zoom.F-fromP)/lengthP, T = (O.zoom.T-fromP)/lengthP;
			zMinus = (-F*L+F*R+L) / (L - R);
			zPlus = (L*(-T)+L+R*T - 1) / (L - R);
		}

		for (var a = 0; a < chart.axes.length; ++a) {
			var axisName = chart.axes[a];
			if (O.alpha[axisName] == 0 || (isMain?1-O.zoom.t:1) == 0)
				continue;

			if (O.type) {
				var h = (isMain?O.cH:O.sH) / O.H, oh = isMain ? 1 - h : 0;
				if (isMain)
					h *= 0.95;
				var j = 0;
				var vertices = [];
				var newarr = (new Array(to - from + 5));
				for (var i = 0; i < newarr.length; ++i)
					newarr[i] = 0;
				for (var i = Math.max(from, 0); i <= to+1; ++i) {
					var j = i;
					if (i < 0 || i > chart.length) continue;
					var kick = false;
					if (i == chart.length) 
						j = chart.length-1;
					newarr[j-from+1] = arr[j-from+1] + chart.data[axisName][j] * O.alpha[axisName];
					if (j-from+1 > 0) {
						var x1 = (i-fromP)/lengthP + (i-1 < O.zoom.F ? zMinus : (i-1 > O.zoom.T ? zPlus : 0)) * O.zoom.t, 
							x2 = (i+1-fromP)/lengthP + (i < O.zoom.F ? zMinus : (i > O.zoom.T ? zPlus : 0)) * O.zoom.t;
						if (i-1 >= O.zoom.F && i-1 <= O.zoom.T)
							x1 += ((i-1-O.zoom.F)/(O.zoom.T-O.zoom.F+1) - x1)*O.zoom.t;
						if (i >= O.zoom.F && i <= O.zoom.T)
							x2 += ((i-O.zoom.F)/(O.zoom.T-O.zoom.F+1) - x2)*O.zoom.t;
						var d1 = arr[j-from]/O.sumTree[j-1], d2 = arr[j-from+1]/O.sumTree[j],
							u1 = newarr[j-from]/O.sumTree[j-1], u2 = newarr[j-from+1]/O.sumTree[j];
						if (j == 0) {
							d1 = d2; u1 = u2;
						} else if (i == chart.length-1) {
							d2 = d1; u2 = u1;
						}
						x1 = x1 * (1 - O.P*2/O.W) + O.P/O.W;
						x2 = x2 * (1 - O.P*2/O.W) + O.P/O.W;
						vertices.push(
							x1, (d1)*h+oh,
							x1, (u1)*h+oh,
							x2, ((d2+(d1-d2)*O.zoom.t))*h+oh,
							x1, (u1)*h+oh,
							x2, ((d2+(d1-d2)*O.zoom.t))*h+oh,
							x2, ((u2+(u1-u2)*O.zoom.t))*h+oh
						);
					}
				}
				arr = newarr;
				glF(G, G.TRIANGLES, vertices, chart.colors[axisName].floata(isMain?1-O.zoom.t:1));
			} else {
				C.beginPath();
				for (var i = to+1; i >= Math.max(from-1, 0); --i) {
					if (i >= chart.length) 
						continue;
					C.lineTo(((i - fromP) / lengthP) * O.W, 
							  (1 - (arr[i - (from-1)]/O.sumTree[i])) * (isMain?O.cH:O.sH) + (!isMain?O.H-O.sH:0) + 2);
				}
				for (var i = Math.max(from-1, 0); i < to+1; ++i) {
					if (i >= chart.length) break;
					arr[i - (from-1)] += (chart.data[axisName][i] * O.alpha[axisName]);
					if (arr[i - (from-1)] > _max)
						_max = arr[i - (from-1)];
					C.lineTo(((i - fromP) / lengthP) * O.W, 
							 (1 - (arr[i - (from-1)]/O.sumTree[i])) * (isMain?O.cH:O.sH) + (!isMain?O.H-O.sH:0));
				}
				C.fillStyle = chart.colors[axisName].rgba(isMain?1-O.zoom.t:1);
				C.fill();
			}
		}
	}
	function renderLegend(O, t) {
		var chart = O.chart;
		if (false && !O.first && !O.forceRender && 
			(lastTimeRender - lastTimeModeChanged) > 150 &&
			O.zoom.t == O.zoom.value &&
			O.zoom.lastT == O.zoom.t &&
			(!O.zoom.value ? (
				O[0].minShouldBe == O[0].lastMin &&
				O[0].maxShouldBe == O[0].lastMax &&
				O[1].minShouldBe == O[1].lastMin &&
				O[1].maxShouldBe == O[1].lastMax &&
				O.iX && O.iX.length == 0) : true) &&
			(chart.percentage && O.zoom.value ? 
				O.zoom.L == O.zoom.lastL && O.zoom.R == O.zoom.lastR &&
				Object.keys(O.selected).filter(function (k) {return O.selected[k] != O.alpha[k]}).length == 0 : true) &&
			(O.zoom.value ? (
				O.zoom[0].minShouldBe == O.zoom[0].lastMin &&
				O.zoom[0].maxShouldBe == O.zoom[0].lastMax &&
				O.zoom[1].minShouldBe == O.zoom[1].lastMin &&
				O.zoom[1].maxShouldBe == O.zoom[1].lastMax &&
				O.zoom.iX && O.zoom.iX.length == 0 && 
				O.iX && O.iX.length == 0 &&
				O.zoom.lastHover == O.zoom.hover &&
				O.zoom.L == O.zoom.lastL && O.zoom.R == O.zoom.lastR) : 1)  &&
			Object.keys(O.selected).filter(function (k) {return O.selected[k] != O.alpha[k]}).length == 0 &&
			(!O.zoom.value ? (O.L == O.lastL && O.R == O.lastR && O.lastHover == O.hover) : 1)) {
			return;
		}
		O.zoom.lastT = O.zoom.t;
		var ctx = O.legendCtx;
		var axes = chart.axes;
		ctx.clearRect(0, 0, O.W, O.H);
		
		if (chart.percentage && O.zoom.t > 0) {
			radialChart(O, t);
		} else {
			if (O.hover >= 0)
				hoverCircles(O, chart, 1-O.zoom.t, O)
			if (O.zoom.hover >= 0)
				hoverCircles(O, O.zoom.chart, O.zoom.t, O.zoom);
			O.zoom.lastHover = O.zoom.hover;
		}

		if (1 - O.zoom.t > 0)
			yAxis(O, O, 1 - O.zoom.t, t)
		if (O.zoom.t > 0)
			yAxis(O, O.zoom, O.zoom.t, t)


		if (O.zoom.t < 1)
			xAxis(O, O, 1 - O.zoom.t, t, false)
		if (!chart.percentage && O.zoom.t > 0)
			xAxis(O, O.zoom, O.zoom.t, t, true)
		
	}
	function d(x) {
		var i = 1;
		if (x<=0)return 1;
		while (x*.1 > (i*=10));
		return i;
	}
	function xAxis(O, o, t, T, isZoom) {
		var ctx = O.legendCtx;
		var chart = o.chart || O.chart;
		var L = chart.length - (chart.types.y0 == 'bar' ? 0 : 1);
		var fromP = o.L * L, toP = o.R * L;
		var l = toP - fromP;
		var _fromP = range(fromP-O.P/O.W*l, 0, L);
		var _toP = range(toP+O.P/O.W*l, 0, L);
		var fromI = Math.floor(_fromP);
		var toI = Math.ceil(_toP);
		
		var g = 10 * scale();
		ctx.font = g + 'px Roboto';

		var u = 1/(Math.round((o.R-o.L)*10)/10);
		var e = Math.round(Math.pow(2,(log2(parseFloat(u.toFixed(2))))));
		var xDiff = Math.round(chart.length / (6*e));
		var start = Math.floor(o.L * (chart.length - 1));
		start = start - (start % xDiff);

		if (!o.iX)
			o.iX = [];
		
		if (typeof o.lastDateStart === 'number' && o.lastDateDiff && 
			(o.lastDateDiff != xDiff)) {
			for (var i = 0; i < 10; ++i) {
				var _xI = o.lastDateStart + o.lastDateDiff*i;
				if ((_xI-start)%xDiff != 0 && _xI < chart.length-1 && _xI > 0) {
					o.iX.push({i: _xI, val: 1, v: -1, dif: xDiff});
				}
			}

			for (var i = 0; i < 10; ++i) {
				var xI = start + xDiff*i;
				if ((xI-o.lastDateStart)%o.lastDateDiff != 0 && xI < chart.length-1 && xI > 0)
					o.iX.push({i: xI, val: 0, v: 1, dif: xDiff});
			}
		}
		o.lastDateStart = start;
		o.lastDateDiff = xDiff;

		var rendered = [];
		for (var i = 0; i < o.iX.length; ++i) {
			var label = o.iX[i];
			if ((label.i) % xDiff != 0 && label.v > 0)
				label.v *= -1;
			if ((label.i) % xDiff == 0 && label.v < 0)
				label.v *= -1;
			label.val += label.v * (Math.abs(xDiff-label.dif)+1) * T * 0.001 * 2.5;
			if (label.val < 0 || label.val > 1) {
				o.iX.splice(i, 1);
				i--;
				continue;
			}
			ctx.fillStyle = color("gridText", label.val*t);
			drawDateLabel(label.i);		
		}

		ctx.fillStyle = color("gridText", t);
		for (var i = 0; i < 10; ++i) {
			var xI = start + xDiff*i;
			if (xI == 0 || xI >= chart.length-1)
				continue;
			drawDateLabel(xI, 1);
		}

		function drawDateLabel(i) {
			if (rendered.indexOf(i)>=0)return;
			rendered.push(i);
			var xDate = new Date(chart.data.x[i]);
			var str = isZoom ? z(xDate.getUTCHours()) + ":" + z(xDate.getUTCMinutes()) : shortMonths[xDate.getUTCMonth()] + ' ' + xDate.getUTCDate();
			if (chart.percentage)
				i += 0.5;
			if (chart.types.y0=='bar')
				i += 0.5;
			// var xP = (i / (L+(chart.types.y0=='bar'?1:0)));
			// var xC = ((xP - o.L) / (o.R - o.L) / (1-O.P/O.W*2) + O.P/O.W) * O.W;
			var xC = (i - fromP) / (toP - fromP) * (O.W-2*O.P) + O.P;
			var textSize = ctx.measureText(str);
			var x = xC-textSize.width/2;
			if (xC > O.W) return;

			ctx.fillText(str, x, O.cH + g);
		}
	}
	function error(input) {
		var start = Date.now();
		function frame() {
			var t = (Date.now()-start)/500;
			if (t < 1)
				requestAnimationFrame(frame);
			else t = 1;
			var x = Math.sin((t+0.2)*PI)*Math.sin((t+0.2)*PI*5)*0.5;
			input.style.transform = 'translateX(' + x*10 + 'px)';
		}
		frame();
	}
	function hoverCircles(O, chart, t, o) {
		var ctx = O.legendCtx;
		var length = chart.length;
		var axes = chart.axes;
		var fromP = o.L * length, toP = o.R * length;
		var l = toP - fromP;
		var _fromP = range(fromP-O.P/O.W*l, 0, chart.length-1);
		var _toP = range(toP+O.P/O.W*l, 0, chart.length-1);
		var x = (o.hover - fromP+(chart.percentage?1:0)) / (toP-fromP+(chart.percentage?1:0)) * (O.W-O.P*2) + O.P;
		if (chart.types.y0 != 'bar') {
			ctx.strokeStyle = color('gridLines', t);
			ctx.lineWidth = 1;
			ctx.beginPath();
			// if (chart.percentage)
			// 	x += (0.5-fromP)/(toP-fromP-1)*O.W;
			ctx.moveTo(x, 0);
			ctx.lineTo(x, O.cH);
			ctx.stroke();
		}
		
		var Or = (O.zoom.chart&&O.zoom.value&&O.zoom.chart.types.y0!=O.chart.types.y0&&O.zoom.selected ? O.zoom : O);
		if (!chart.percentage && !chart.stacked && chart.types.y0 != 'bar') {
			ctx.lineWidth = 2 * scale();
			for (var a = 0; a < axes.length; ++a) {
				if (Or.alpha[axes[a]] == 0)
					continue;
				var y = (1-(chart.data[axes[a]][o.hover] * (chart.y_scaled&&a == 1?o[0].lastS:1) - o[0].lastMin) / (o[0].lastMax - o[0].lastMin));
				ctx.beginPath();
				ctx.arc(x, y * O.cH, 4*scale(), 0, PI*2);
				ctx.strokeStyle = chart.colors[axes[a]].rgba(Or.alpha[axes[a]]*t);
				ctx.fillStyle = color('background', Or.alpha[axes[a]]*t);
				ctx.fill();
				ctx.stroke();
			}
		}
	}
	function radialChart(O, T) {
		var chart = O.zoom.chart;
		var R = Math.min(O.cH/2,O.W/2)*0.8;
		var oy = -0.05*O.H;

		var x1 = O.zoom.L;
		var x2 = O.zoom.R;
		
		var sum = 0;
		var arr = O.zoom.arr = new Array(chart.axes.length);
		var asum = 0;
		var aarr = O.zoom.aarr = new Array(chart.axes.length);
		for (var i = 0; i < arr.length; ++i)
			arr[i] = 0;
		for (var i = 0; i < aarr.length; ++i)
			aarr[i] = 0;

		for (var i = 0; i < chart.axes.length; ++i) {
			for (var g = x1; g <= x2; ++g) {
				arr[i] += chart.data[chart.axes[i]][g] * O.alpha[chart.axes[i]];
				sum += chart.data[chart.axes[i]][g] * O.alpha[chart.axes[i]];
				aarr[i] += chart.data[chart.axes[i]][g] * (O.selected[chart.axes[i]]);
				asum += chart.data[chart.axes[i]][g] * (O.selected[chart.axes[i]]);
			}
		}
		O.zoom.sum = sum;
		O.zoom.asum = asum;
		
		var ctx = O.legendCtx;

		var lp = 0;
		var ls = 0;
		var S = 0;
		for (var i = 0; i < chart.axes.length; ++i) {
			var p = arr[i] / sum;
			var pr = p * PI * 2;
			var ap = aarr[i] / asum;
			var A = S+lp+pr/2;
			var s = O.zoom.c == i;

			ctx.beginPath();
			ctx.moveTo(O.W/2+Math.cos(A)*s*10, O.cH/2-oy+Math.sin(A)*s*10);
			ctx.arc(O.W/2+Math.cos(A)*s*10,	   O.cH/2-oy+Math.sin(A)*s*10, R, S+lp, S+lp+pr);
			ctx.lineTo(O.W/2+Math.cos(A)*s*10, O.cH/2-oy+Math.sin(A)*s*10);
			ctx.fillStyle = chart.colors[chart.axes[i]].rgba(O.zoom.t);
			ctx.fill();
			
			var h = R*0.08+(R*0.15)*p;
			var v = Math.round(p*1000)/10;
			if (i == chart.axes.length-1)
				v = 100 - ls;
			var text = (v).toFixed(1)+'%';
			ls += v;
			var boundaries;
			if (ap < 0.1 && O.selected[chart.axes[i]]) {
				h = 15 * scale() * O.alpha[chart.axes[i]];
				ctx.font = 'bold ' + h + 'px Roboto';
				boundaries = ctx.measureText(text)
				ctx.strokeStyle = ctx.fillStyle = O.chart.colors[chart.axes[i]].rgba(O.alpha[chart.axes[i]]*O.zoom.t);
				ctx.beginPath();
				ctx.moveTo(O.W/2+Math.cos(A)*s*10 + Math.cos(A)*R*0.9,
						   O.cH/2-oy+Math.sin(A)*s*10 + Math.sin(A)*R*0.9);
				ctx.lineTo(O.W/2+Math.cos(A)*s*10 + Math.cos(A)*R*1.1,
						   O.cH/2-oy+Math.sin(A)*s*10 + Math.sin(A)*R*1.1);
				ctx.lineWidth = 1 * scale();
				ctx.stroke();
				ctx.fillText(text, O.W/2+Math.cos(A)*s*10 + Math.cos(A) * R * 1.3 - boundaries.width/2, 
							       O.cH/2-oy+Math.sin(A)*s*10 + Math.sin(A) * R * 1.3 + h / 2);
			} else if (O.alpha[chart.axes[i]] > 0.5) {
				h *= O.alpha[chart.axes[i]];
				ctx.font = 'bold ' + h + 'px Roboto';
				boundaries = ctx.measureText(text)
				ctx.fillStyle = 'rgba(255,255,255,'+O.alpha[chart.axes[i]]*O.zoom.t+')';
				if (ap == 1) {
					ctx.fillText(text, O.W/2+Math.cos(A)*s*10 - boundaries.width/2, 
									   O.cH/2-oy+Math.sin(A)*s*10 + h / 2);
				} else
					ctx.fillText(text, O.W/2 + Math.cos(A) * R * 0.6 - boundaries.width/2, 
									   O.cH/2-oy + Math.sin(A) * R * 0.6 + h / 2);
			}
			lp += pr;
		}
	}
	function yAxis(O, o, t, T) {
		var chart = o.chart?o.chart:O.chart;
		var ctx = O.legendCtx;
		var l = (o[0].maxShouldBe - o[0].minShouldBe)
		var u = l / 5;
		var yDiff = Math.round(u / d(u)) * d(u);
		var start = o[0].minShouldBe;
		var end = o[0].maxShouldBe;
		if (chart.percentage&&O.zoom.t==1-t)
			yDiff = 0.25;

		if (!isNaN(yDiff) && (yDiff > 1 || (chart.percentage&&O.zoom.t==1-t))) {

			if (!o.iY)
				o.iY = [];

			if (typeof o._yStart == 'number' &&
				typeof o._yEnd == 'number' &&
				typeof o._yDiff == 'number' &&
				(o._yStart != start || o._yEnd != end || o._yDiff != yDiff)) {
				for (var y = start; y <= end; y += yDiff) {
					if ((y-o._yStart)%o._yDiff != 0 && y <= o._yEnd && y >= o._yStart)
						o.iY.push({y: y, diff: yDiff, val: 0, v: 1});
				}

				for (var y = o._yStart; y <= o._yEnd; y += o._yDiff) {
					if ((y-start)%yDiff != 0 && y <= end && y >= start)
						o.iY.push({y: y, diff: yDiff, val: 1, v: -1});
				}
			}
			o._yStart = start;
			o._yEnd = end;
			o._yDiff = yDiff;

			var g = 10 * scale();
			ctx.font = g + 'px Roboto';

			var rendered = [];
			for (var i = 0; i < o.iY.length; ++i) {
				var label = o.iY[i];
				if ((label.y) % yDiff != 0 && label.v > 0)
					label.v *= -1;
				if ((label.y) % yDiff == 0 && label.v < 0)
					label.v *= -1;
				label.val += label.v * T * 0.01;
				if (label.val <= 0 || label.val >= 1) {
					o.iY.splice(i, 1);
					i--;
					continue;
				}
				drawYLabel(label.y, label.val*t);		
			}

			for (var y = start; y <= end; y += yDiff)
				drawYLabel(y, t);

			function drawYLabel(y, alpha) {
				if (rendered.indexOf(y) >= 0)
					return;
				rendered.push(y);
				var Y = (y - o[0].lastMin) / (o[0].lastMax - o[0].lastMin);
				if (chart.stacked)
					Y *= 0.95;
				ctx.strokeStyle = color('gridLines', alpha);
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(O.P, (1 - Y) * O.cH);
				ctx.lineTo(O.W-O.P, (1 - Y) * O.cH);
				ctx.stroke();

				ctx.fillStyle = color('gridText', alpha);
				if (Y < -0.1 || Y > 1.1)
					return;
					
				if (chart.y_scaled) {
					ctx.fillStyle = chart.colors.y0.rgba(O.alpha.y0*alpha);
					ctx.strokeStyle = color('background', O.alpha.y0*alpha);
				}
				
				if ((chart.y_scaled && O.alpha.y0>0) || !chart.y_scaled) {
					var text = chart.percentage ? (y*100).toFixed(0) + '%' : format(y);
					// ctx.strokeText(text, g/2, (1 - Y) * O.cH-g/2);
					ctx.fillText(text, O.P + g/2, (1 - Y) * O.cH-g/2);
				}

				if (chart.y_scaled && O.alpha.y1) {
					var S = o[0].lastS;
					ctx.fillStyle = chart.colors.y1.rgba(O.alpha.y1*alpha);
					ctx.strokeStyle = color('background', O.alpha.y1*alpha);
					var textBounds = ctx.measureText(format(y/S));
					ctx.fillText(format(y/S), O.W - g/2 - textBounds.width - O.P, (1 - Y) * O.cH-g/2);
				}
			}
		}
	}
	function format(v) {
		if (v >= 1000000)
			return Math.round(v/100000)/10 + 'M';
		if (v >= 1000)
			return Math.round(v/100)/10 + 'K'
		return Math.round(v)+'';
	}


	/* preparing charts */
	function prepare(chart) {
		var axes = Object.keys(chart.names);
		var data = {};
		var length;
		for (var i = 0; i < chart.columns.length; ++i) {
			var column = chart.columns[i];
			var key = column[0];
			data[key] = column.slice(1);
			length = data[key].length;
			if (key != 'x' && !(chart.stacked && chart.percentage)) {
				data[key].getMax = generateSegmentTree(data[key], Math.max, -Infinity);
				data[key].getMin = generateSegmentTree(data[key], Math.min, Infinity);
				data[key].max = data[key].getMax(0, length-1);
				data[key].min = data[key].getMin(0, length-1);
			}
		}
		if (chart.y_scaled) {
			chart.S = data.y0.max / data.y1.max;
		}
		var colors = {};
		for (var i = 0; i < axes.length; ++i)
			colors[axes[i]] = prepareColor(chart.colors[axes[i]]);
		delete chart.columns;
		return Object.assign(chart, {length: length, axes: axes, data: data, colors: colors});
	}
	function prepareColor(hex) {
		var raw = [parseInt(hex.substring(1,3),16),
				   parseInt(hex.substring(3,5),16),
				   parseInt(hex.substring(5,7),16)];
		var rgb = 'rgb('+raw.join()+')';
		var floatRaw = Array.from(raw, function (x) {return x / 255});
		return {
			rgb: rgb,
			rgba: function (a) {return 'rgba('+raw.join()+','+a+')'},
			float: floatRaw,
			floata: function (a) {return floatRaw.concat(a)}
		};
	}
	function generateSegmentTree(array, func, d) {
		var length = array.length;
		var segTreeLength = (2 * (Math.pow(2, (Math.floor(log2(length))) + 1))) - 1;
		var tree = new Array(segTreeLength);
		for (var i = 0; i < segTreeLength; ++i)
			tree[i] = null;

		buildTree(0, length-1, 0);
		function buildTree(l, r, p) {
			if (l == r) {
				tree[p] = array[l];
				return;
			}
			var middle = Math.floor((l+r)/2);
			buildTree(l, middle, (2 * p) + 1);
			buildTree(middle+1, r, (2 * p + 2));

			tree[p] = func(tree[2 * p + 1], tree[2 * p + 2]);
		}

		function range(ql, qr, l, r, p) {
			if (ql <= l && qr >= r)
				return tree[p];
			if (ql > r || qr < l)
				return d;
			var middle = Math.floor((l+r)/2);
			var left = range(ql, qr, l, middle, p * 2 + 1);
			var right = range(ql, qr, middle+1, r, p * 2 + 2);
			return func(left, right);
		}

		return function (l, r) {
			return range(l, r, 0, length-1, 0);
		}
	}
})();
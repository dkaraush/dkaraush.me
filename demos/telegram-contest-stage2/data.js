window.data = [];
var chartsCount = 5;
var loaded = 0;

function loadChartOverview(i) {
    request('data/' + (i+1) + '/overview.json', function (chartObject) {
		data[i] = prepare(chartObject, i);

		loaded++;
		if (loaded == chartsCount) {
			chartsLoaded();
		}
    });
}
for (var i = 0; i < chartsCount; ++i)
    loadChartOverview(i);
function loadZoomed(i, t, callback) {
	var date = new Date(t);
	request('data/' + (i+1) + '/' + date.getFullYear() + '-' + z(date.getMonth()+1) + '/' + z(date.getDate()) + '.json', function (chart) {
		callback(prepare(chart, -1));
	});
}
function z(str, n) {
	n = n || 2;
	str = str + '';
	if (str.length < n)
		return '0'.repeat(n - str.length) + str;
	return str+'';
}
function request(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onreadystatechange = function () {
        if (request.readyState != 4)
            return;
        
        if (request.status == 200) {
            var chartObject = JSON.parse(request.responseText);
			callback(chartObject)
        }
    }
    request.send();
}
function prepare(chart, id) {
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
    for (var i = 0; i < axes.length; ++i) {
        colors[axes[i]] = prepareColor(chart.colors[axes[i]]);
    }
    delete chart.columns;
    return Object.assign(chart, {length: length, axes: axes, data: data, id: id, colors: colors});
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
	var segTreeLength = (2 * (2 ** (Math.floor(Math.log2(length)) + 1))) - 1;
	var tree = new Array(segTreeLength).fill(null);

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
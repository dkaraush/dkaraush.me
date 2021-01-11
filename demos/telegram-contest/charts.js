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
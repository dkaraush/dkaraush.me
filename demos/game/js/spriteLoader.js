function loadSprites(callback) {

	var spritesContent = document.querySelector("sprites");
	var data = JSON.parse(spritesContent.innerHTML);

	var sprites = {};
	Object.keys(data).forEachEnd(function (spriteName, cb) {
		var image = new Image;
		var spriteData = data[spriteName];
		image.onload = function () {
			if (typeof spriteData.type === "undefined" || spriteData.type === "single") {
				sprites[spriteName] = {
					type: "single",
					image: image,
					width: image.width,
					height: image.height,
					pivot: spriteData.pivot || {x: image.width/2, y: image.height/2},
					colliders: getColliders(spriteData),
					filters: getFilters(spriteData, image)
				};
				cb();
			} else if (spriteData.type === "multiple") {
				var keys = Object.keys(spriteData).filter(function (k) {return ["type","pivot","source","collider","colliders","filters"].indexOf(k) == -1});
				var filters = getFilters(spriteData, image);
				keys.forEachEnd(function (subimage, next) {
					sprites[spriteName + "_" + subimage] = {
						type: "multiple",
						image: image,
						width: c(spriteData[subimage].w, {w: image.width, h: image.height}),
						height: c(spriteData[subimage].h, {w: image.width, h: image.height}),
						pivot: spriteData.pivot,
						length: c(spriteData[subimage].length),
						x: function(i) {return c(spriteData[subimage].x, {w: image.width, h: image.height, i: i})},
						y: function(i) {return c(spriteData[subimage].y, {w: image.width, h: image.height, i: i})},
						colliders: getColliders(spriteData[subimage], spriteData),
						filters: filters
					};
					next();
				}, cb);
			}
		}
		image.src = spriteData.source;
	}, function () {
		callback(sprites);
	});
}

function c (str, data) {
	if (typeof str === "number")
		return str;
	for (var key in data)
		str = str.replace(new RegExp(key, "g"), data[key]);
	return eval(str);
}

function getFilters(sprite, image) {
	if (!sprite.filters)
		return undefined;
	var result = {};
	if (sprite.filters.indexOf("silhouetteWhite")>=0)
		result.silhouetteWhite = (silhouetteWhite(image));
	if (sprite.filters.indexOf("silhouetteBlack")>=0)
		result.silhouetteBlack = (silhouetteBlack(image));

	return result;
}

var workspace = document.querySelector("canvas#workspace");
var wspctx = workspace.getContext('2d');
function silhouetteWhite(image) {
	workspace.width = image.width;
	workspace.height = image.height;
	wspctx.drawImage(image, 0, 0);
	var img = wspctx.getImageData(0, 0, image.width, image.height);
	var length = img.data.length;
	for(var i=0; i < length; i+=4){
		if (img.data[i+3]>0) {
	    	img.data[i] = 255;
	    	img.data[i+1] = 255;
	    	img.data[i+2] = 255;
	    	img.data[i+3] = 255*0.1;
		}
	}
	wspctx.putImageData(img, 0, 0);
	var newimage = new Image;
	newimage.src = workspace.toDataURL();
	return newimage;
}
function silhouetteBlack(image) {
	workspace.width = image.width;
	workspace.height = image.height;
	wspctx.drawImage(image, 0, 0);
	var img = wspctx.getImageData(0, 0, image.width, image.height);
	var length = img.data.length;
	for(var i=0; i < length; i+=4){
		if (img.data[i+3]>0) {
	    	img.data[i] = 0;
	    	img.data[i+1] = 0;
	    	img.data[i+2] = 0;
	    	img.data[i+3] = 255*0.1;
		}
	}
	wspctx.putImageData(img, 0, 0);
	var newimage = new Image;
	newimage.src = workspace.toDataURL();
	return newimage;
}

CanvasRenderingContext2D.prototype.drawSprite = function (sprite, x, y, i, filter) {
	if (sprite.type == "multiple")
		i = ~~(i % sprite.length);

	this.drawImage(filter ? sprite.filters[filter] : sprite.image, 
				   sprite.type == "multiple" ? sprite.x(i) : 0, 
				   sprite.type == "multiple" ? sprite.y(i) : 0, 
				   sprite.width, sprite.height, 
				   x - sprite.pivot.x, 
				   y - sprite.pivot.y, 
				   sprite.width, sprite.height);
}

Array.prototype.forEachEnd = function (cb, end) {
	function t (arr, i) {
		if (i == arr.length)
			end();
		else
			cb(arr[i], function() {t(arr, i+1);});
	}
	t(this, 0);
}
if (!Array.from) {
	Array.from = function (arr, f) {
		var newarr = [];
		for (var i = 0; i < arr.length; ++i)
			newarr.push(f(arr[i], i));
		return newarr;
	}
}

function getColliders() {
	var res = [];
	for (var i = 0; i < arguments.length; ++i) {
		if (arguments[i].colliders)
			res = res.concat(Array.from(arguments[i].colliders, processCollider));
		if (arguments[i].collider)
			res.push(processCollider(arguments[i].collider));
	}
	return res;
}
function processCollider(col) {
	if (!col.x2) col.x2 = col.x + col.w;
	if (!col.y2) col.y2 = col.y + col.h;
	return col;
}
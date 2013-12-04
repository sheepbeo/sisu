var LANG = 'fin';
var langs = ['fin','en','swe'];
var flags = {
		fin:'user/img/flag_fin.jpg',
		swe:'user/img/flag_swe.GIF',
		en:'user/img/flag_eng.GIF',
};


var ELLIPSIS_LENGTH = 300;



function getLang(){		
	LANG= $('.langselect').attr('lang');
	return LANG;
}
// function getLangList(callback){
// 	var e = $('<div class="langselect" />');
	
// 	for (var i in langs){
// 		e.append( $('<img class="flag" lang="'+langs[i]+'" src="'+flags[langs[i]]+'" />' ) );
// 		//e.append( $('<p class="lang">'+langs[i]+'</p>' ) );
// 	}

// 	e.find('.flag:first-child').addClass('selected');
// 	onTap(e);

// 	e.find('.flag').click(function(){
// 		e.find('.selected').removeClass('selected');
// 		$(this).addClass('selected');
// 		e.attr('lang',$(this).text());

// 		if (typeof(callback)=='function'){
// 			callback($(this).attr('lang'));
// 		}
// 	});
// 	return e;
// }

function onTouch(e,callback){
	if (e instanceof jQuery){
		e = e[0];
	}
	if (Modernizr.touch){
		e.addEventListener('touchstart',function(e){
			callback(e);
		});
	} else {
		e.addEventListener('mousedown',function(e){
			callback(e);
		});	
	}

}



var resize = new resizer();
window.onresize = function(){
		resize.run();
}



function getTileLayerNames(){
	var names = Array();

	for (var i in tileLayers){
		names.push(tileLayers[i].name)
	}

	return names;
}


function getTileLayer(name){
	var layer = tileLayers[name.toLowerCase()].map();
	return layer;
}

function getText(obj){	
	if (typeof(obj) == 'object'){
		if (LANG!=undefined && typeof(LANG)=='string'){		
			if (typeof(obj[LANG]) == 'string'){				
				return obj[LANG];
			} else {
				return 'not available';
			}
		} else {
			return 'not available';
		}
	} else if (typeof(obj) == 'string'){
		return obj;
	}
}

function isObj(obj){
	 return (typeof(obj) == 'object' && obj!=undefined && obj != null && obj!='');
}
function isPresentationItem(obj){
	var is = false;
	if (isObj(obj)){
		if (obj._id != undefined && obj._id != ''){
			is = true;
		}
	}

	return is;
}

var getDirection = function(position){
	switch (position){
		case 'left':
		case 'right':
			return 'vertical';
		break;
		case 'top':
		case 'bottom':
			return 'horizontal';
		break;
		default:
			return false;
		break;
	}
}
// cunning opposite direction function
function opposite(what){
	var result = false;
	switch (what){
		case'left':
			result = 'right';
			break;
		case 'right':
			result = 'left';
			break;
		case 'top':
			result = 'bottom';
			break;
		case 'bottom':
			result = 'top';
			break;
	}
	return result;
}

// cunning opposite direction function
function widthIn(what){
	var result = false;
	switch (what){
		case'left':
		case 'right':
			result = 'height';
			break;
		case 'top':
		case 'bottom':
			result = 'width';
			break;
	}
	return result;
}

function heightIn(what){
	var result = false;
	switch (what){
		case'left':
		case 'right':
			result = 'width';
			break;
		case 'top':
		case 'bottom':
			result = 'height';
			break;
	}
	return result;
}


function distance(a,b){
	var dist = Math.sqrt( Math.pow(a,2) + Math.pow(b,2) );
	return dist;
}

var setProperties = function(layer,object){
	layer.properties = {};
	for (var i in object){
		if (i != 'items' && layer[i] == undefined){			
			layer.properties[i] = object[i];
		}
	}
	return layer;
}


function copy(from){
	var to = {};
	for (var i in from){
		if (typeof(from[i]) == 'object'){
			to[i]= copy(from[i]);
		} else {
			to[i] = from[i];
		}
	}
	return to;
}


function setTransition(el,time){
	var t  = time/1000;
	el.css({
		'-webkit-transition-duration':t+'s'
	});
}

var getBounds = function(points){
	var mLat = -6000000,
		mLng = -6000000,
		minLat = 6000000,
		minLng = 6000000;


	for (var i in points){
		if (points[i].type == 'marker'){
			points[i] = points[i].getLatLng();
		}

		if (points[i].lat > mLat){
			mLat = points[i].lat;
		}

		if (points[i].lng > mLng){
			mLng = points[i].lng;
		}

		if (points[i].lat < minLat){
			minLat = points[i].lat;
		}

		if (points[i].lng < minLng){
			minLng = points[i].lng;
		}
	}

	if (minLat!=-6000000 && minLng != 6000000 && mLat != 6000000 && mLng != 6000000){
		return [[minLat,minLng],[mLat,mLng]];
	} else {
		return false;
	}
}

function len(obj){
	var c=0;
	for (var i in obj){
		c++;
	}

	return c;
}

function resizer(){
	this._queue = Array();
}

resizer.prototype.add = function(fn){
	this._queue.push(fn);
}

resizer.prototype.run = function(){
	for (var i in this._queue){
		this._queue[i]();
	}
}


function addClasses(element,classes){
	if (typeof(classes) == 'string'){

		classes = classes.split(',');
	}

	for ( var i in classes){
		element.addClass(classes[i]);		
	}

	return element;
}


function getCss(str){
	var result = false;
	if (str != undefined && typeof(str) == 'string'){
		result = Array();
		var items = str.split(';');
		for (var i in items){
			var t = items.split(':'),
				obj = {};

			obj[t[0]] = t[1];
			result.push(obj);
		}		
	}
	return result;
}

// finds img-elements, triggers callback when loaded
function imagesReady(e,callback){
	var imgs = e.find('img');
	var count = imgs.length;

	if (imgs.length > 0){
		$.each(imgs,function(){
			$(this).load(function(){
				count--;
				
				if (count == 0){							
					callback();
				}
			})

		});

	} else {
		callback();
	}

}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function hexToRgbString(hex,alpha){
	var rgb = hexToRgb(hex),
		str = false;
	if (rgb != null && alpha != undefined) {		
		str = 'RGBA('+rgb.r+','+rgb.g+','+rgb.b+','+alpha+')';
	} else {
		str = 'RGB('+rgb.r+','+rgb.g+','+rgb.b+')';
	}
	return str;
}

function getRgba(hex,alpha){
	return hexToRgbString(hex,alpha);
}
// style obj

var style = function(data){
	for (var i in data){
		this[i] = data[i];
	}
}
style.prototype.showLogo =function(){
	if (this.presentation.showlogo == true || this.presentation.showlogo == 'true'){
		return true;
	} else {
		return false;
	}
}

style.prototype.getTextColor =function(name){
	if (this[name].color != undefined){
		return getRgba(this[name].color);
	} else {
		return this.getColorByTag('p');
	}
}

style.prototype.getColorByTag = function(tagName){
	if (this.colors[tagName]!=undefined){
		return getRgba(this.colors[tagName]);
	} else {
		return getRgba('#000');
	}
}

style.prototype.getTextSize = function(name){
	if (this[name].text_size != undefined){
		return this[name].text_size;
	} else {
		return this.fonts.p.size;
	}
}

style.prototype.getStyle = function(name){	
	var css = {};

	if (this[name].width == undefined|| this[name].height == undefined){
		css = this.setSize(parseInt(this[name].size),this[name].position);
	} else {
		css.width = this[name].width +'px';
		css.height = this[name].height +'px';
	}

	if (this[name].css != undefined){		
		var c = this.getCss(this[name].css);		
		css = $.extend(css,c);
	}

	css = $.extend(css,this.getPosition(this[name].position,parseInt(this[name].size)));	
	css =$.extend(css,this.getBackground(name));	

	var style = {
		css:css,
		classes:this.setClasses(name),
		data:this[name]

	}
	return style;
}

style.prototype.setClasses = function(e){
	var cls = Array();
	if (this[e].classes){
		cls = this[e].classes.split(',');
		if (this[e].style){
			cls.push(this[e].style);
		}
	}
	return cls;
}

style.prototype.getBackground = function(e){
	var css = {};
	
	if (this[e].background_color){
		if (this[e].background_opacity==undefined){
			this[e].background_opacity = 0;
		}
		css['background-color'] = getRgba(this[e].background_color,this[e].background_opacity);
	}
	if (this[e].background_image){		
		if (this[e].background_image.name != '' && this[e].background_image.name != 'image'){
			css['background-image'] = 'url("'+getFullImage(this[e].background_image)+'")';//'url('+image_path+'/'+this[e].background_image.path+')';
		}
	}
	return css;
}

style.prototype.getPosition = function(position,offset){
	if (position!=undefined){
		var css = {
			position:'absolute',		
		}

		if (offset == undefined){
			offset =0;
		}

		switch (position){
			case 'left':
				css.top = 0;
				css.left = 0;
			break;
			case 'right':
				css.top = 0;
				css.left = window.innerWidth - offset;
			break;
			case 'top':
				css.top = 0;
				css.left = 0;
			break;
			case 'bottom':
				css.top = window.innerHeight -offset;
				css.left = 0;
			break;

		}
		return css;
	}
}

style.prototype.getDirection = function(position){
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



style.prototype.setSize = function(size,position){
	if (position!=undefined){
		var w = {
			horizontal:{
				width:window.innerWidth,
				height:size
			},
			vertical:{
				width:size,
				height:window.innerHeight
			},
		}	
		return w[ this.getDirection(position) ];
	} else {
		return {
				width:size,
				height:size
			}
	}
}

style.prototype.showMainmenu = function(){
	if ( this.presentation.showmainmenu == 'false'
		|| this.presentation.showmainmenu == '0'){
		return false
	} else {
		return true;
	}
}
	
style.prototype.showLayerselector = function(){
	if ( this.presentation.showlayerselector == 'false'
		|| this.presentation.showlayerselector == '0'){
		return false
	} else {
		return true;
	}
}


style.prototype.showBreadcrumbs = function(){
	var b = this.presentation.showbreadcrumbs;
	if (b == 'false' || b =='0'){
		return false;
	} else {
		return true
	}
}

style.prototype.getMenuOffset = function(){	
	if (this.showMainmenu() == true && this.mainmenu.style != 'draggable'){
		var ofs = {};	
		ofs[this.mainmenu.position] = this.mainmenu.size;

		return ofs;
	} else {
		return 0;
	}
}


style.prototype.getCss = function(str){
	var css = {};
	
	if (typeof(str) == 'string' && str != ''){
		var items = str.split(';');

		
		for (var i in items){
			var t = items[i].split(':'),
				item = {};

			item[t[0]] = t[1];
			$.extend(css,item);
		}

	
	}

	return css;
}



style.prototype.parse = function(){
	var objs = {};
	for (var t in this){
		var obj = {};
		if (typeof(this[t])=='object'){
			for (var i in this[t]){
				//var b = i.replace(/\_/gi,'-');
				var b = this.parseOne(i);
				obj[b] = this[t][i];
			}
			objs[t] = obj;
		}
	}
	return objs;
}

style.prototype.parseOne = function(str){
	var b = str.replace(/\_/gi,'-');	
	return b;
}
// simple breadCrumbs toolbar object tryout vision
//
// makes a list from array and provides onclick callback
// from each item object

function breadCrumbs(){
	this._element = $('<div class="breadcrumbs-list shadow"></div>');
	this._listeners = Array();
	this.reset();
}

breadCrumbs.prototype.setOffset = function(offset){
	this._offset = offset;


}

breadCrumbs.prototype.getOffsetValue =function(){
	var value = 0;
	for (var i in this._offset){
		value = parseInt(this._offset[i]);

		if (this._position == 'right' && i == 'left' ||
			this._position == 'left' && i == 'right' ||
			this._position == 'top' && i == 'bottom' ||
			this._position == 'bottom' && i=='top'){

			value = 0;
		}
	}	
	return value;
}

breadCrumbs.prototype.getOffsetDirection = function(){
	for (var i in this._offset){
		return i;
		break;
	}
}

// reset the bar
breadCrumbs.prototype.reset = function(){
	this._list = Array();
	this._items = Array();
	this._element.empty();
}

breadCrumbs.prototype.scale = function(){	
	this.setStyle( this._style.getStyle('breadcrumbs'));
}

// set css to this object
breadCrumbs.prototype.setStyle = function(css){	
	if (css != undefined){
		
		this._css = css;
		this._position = css.data.position;
		this._size = css.data.size;
		this._itemColor = css.data.item_background_color;

		var offset = this.getOffsetValue();

		if (offset != 0){	
			$.extend(this._css.css,this._offset);
			if (this._css.css.width != undefined){
				this._css.css.width = this._css.css.width - offset;
			}
		}
	}

	if (this._css != undefined){

		this._element.css(this._css.css)
		addClasses(this._element,this._css.classes);
	}
}


// onitemclick
breadCrumbs.prototype.onItemClick = function(id){
	
}

// creates one list item for this list
breadCrumbs.prototype.createListItem = function(item){
	var me = this;

	var e = $('<div class="breadcrumbs-item"></div>'),
		name = $('<p></p>'),
		css = {
				'opacity':0,
				};

	css[heightIn(this._position)] = this._size - this._size/4;
	
	name.css({
		color:this._style.getTextColor('breadcrumbs'),		
	});

	e.css(css);
	e.css('background-color',this._itemColor);
	name.append(item.name);
	e.attr('id',item.id);
	e.append(name);
	this._element.append(e);

	e.animate({
		opacity:1,
	},250)

	e.click(function(){
		//me.onItemClick(e.attr('id'));
		me.fire('click',e.attr('id'));
	});
}

// sets list to match given array
breadCrumbs.prototype.setList = function(nList){	
	//this.reset();
	for (var i in nList){
		if (!this.hasItem(nList[i].id)){
			this.add(nList[i]);
		}	
	}
	for (var i in this._list){

		var found = false;
		for (var d in nList){
			if (nList[d]!=undefined && this._list[i]!=undefined){			
				if(nList[d].id == this._list[i].id){
					found = true;
				}
			}
		}

		if (found == false && this._list[i]!=undefined){
			this.remove(this._list[i].id);
		}
	}
}

// return list
breadCrumbs.prototype.getList = function(){
	return this._list;
}
// return element
breadCrumbs.prototype.getElement = function(){
	return this._element;

}
// add items into current list
breadCrumbs.prototype.addItems = function(data){
	for (var i in data){
		this.add(data[i]);
	}
}

// does this list already has that item
breadCrumbs.prototype.hasItem = function(id){
	var found = false;
	for (var i in this._list){
		if (this._list[i].id == id){
			found = true;
		}
	}
	return found;
}
// add new item
breadCrumbs.prototype.add = function(data){
	if (!this.hasItem(data.id)){
		this._list.push(data);
		this.createListItem(data);
		return true;		
	} else {
		return false;
	}
}
// remove an item
breadCrumbs.prototype.remove = function(id){
	var nlist = Array();
	if (this.hasItem(id)){
		for (var i in this._list){
			if (this._list[i].id != id){
				nlist.push(this._list[i]);
			}
		}

		this._list = nlist;
		this.removeElement(id);
	}
}
breadCrumbs.prototype.removeElement = function(id){
	var e = this._element.find('#'+id);
	e.animate({
		opacity:0,
	},250,function(){
		e.remove();
	});

}

breadCrumbs.prototype.fire = function(evt,data){
	if (this._listeners[evt]!=undefined){
		if (this._listeners[evt].length>0){
			for (var i in this._listeners[evt]){
				if (typeof(this._listeners[evt][i])=='function'){
					this._listeners[evt][i](data);
				}
			}
		}
	}
}
breadCrumbs.prototype.off = function(name){
	this._listeners[name] = undefined;
}

// subscribe to events
// usage .on(event_name,function)
breadCrumbs.prototype.on = function(listener,fn){
	if (this._listeners[listener]== undefined){
		this._listeners[listener]=Array();
	}
	this._listeners[listener].push(fn);
}

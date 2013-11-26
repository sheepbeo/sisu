function polyEditor(layer){
	this._layer = layer;

	this._element = $('<div class="polyEditor" />');
	this._listeners = Array();
	this._layer = layer;
	this._nametext = $('<div class="nameheader"><input placeholder="name" name="name" type="text"></input></div>')
	
	//this._colorselect = $('<div name="color" class="colorlist colorpick" />');
	//this._imageinput = $('<div name="image" class="imageinput dropinput" title="select or drop in an image for this place icon"></div>');
	this._targetinput = new targetInput();
	
	this._bottomBar = $('<div class="bottombar" />');
	this.acceptButton = $('<img class="ok button" src="img/check-alt.png"></img>');
	this.removeButton = $('<img class="delete button" src="img/cancel.png"></img>');
	
	this._element
				.append(this._nametext)
				.append(this._targetinput.element)
				.append(this._bottomBar);

	this._bottomBar.append(this.acceptButton).append(this.removeButton);
}

polyEditor.prototype = {
	show:function(){

	},
	hide:function(){

	},
	load:function(item){
		for (var i in item){
			this[i] = item[i];
		}
		this.update();
	},
	makeLayer:function(){
		var layer = new L.Polygon(this.items,this.properties);		
		return layer;
	},
	update:function(){
		if (this._item != undefined){
			this._layer.removeLayer(this._item);
		}
		this._item = this.makeLayer();
		this._layer.addLayer(this._item);
	},
	getData:function(){
		var data = {

		}
	},
	parseKML:function(item){
		var e = $(item);
		var coords = e.find('coordinates').text();
		var style = $( e.find('style').first().text() );		
		var color = $(style.find('color')[0]).text();
		var fillColor = $(style.find('color')[1]).text();
		var points = [];

		if (coords != ''){
			coords = coords.split(' ');
		}

		if (coords instanceof Array && coords.length > 0){

			for (var i in coords){
				var point = coords[i].split(',');

				var latlng = {
					lat:parseFloat(point[1]),
					lng:parseFloat(point[0])
				}

				if ($.isNumeric(latlng.lat) && $.isNumeric(latlng.lng)){
					points.push(latlng);
				}
			}
			
			var item = {
				items:points,
				properties:{
					color:'#'+color.substr(2,8),
					opacity:parseInt(color.substr(0,2),16)/255,
					fillColor:'#'+fillColor.substr(2,8),
					fillOpacity:parseInt(fillColor.substr(0,2),16)/255
				}
			}

			//var item = new L.Polygon(points,{color:'#'+color.substr(2,8),opacity:parseInt(color.substr(0,2),16)/255, fillColor:'#'+fillColor.substr(2,8),fillOpacity:parseInt(fillColor.substr(0,2),16)/255});
			//item.addTo(map);
			//return item;
			this.load(item);
		} else {
			return false;
		}
	},
	on:function(name,fn){		
		console.log(name)
		if (this._listeners[name] == undefined){
			this._listeners[name] = Array();
		}	
		this._listeners[name].push(fn);		
	},
	_fire : function(evt,data,e){		
		for (var i in this._listeners['all']){			
			if (this._listeners['all'][i]!=undefined && typeof(this._listeners['all'][i])== 'function'){						
				this._listeners['all'][i](evt,data,e);
			}
		}
		if (this._listeners[evt]!=undefined){
			for (var i in this._listeners[evt]){
				if (typeof(this._listeners[evt][i])=='function'){
					this._listeners[evt][i](data,e);
				}
			}			
		}
	},
	off:function(evt){
		delete this._listeners[evt];
	}	
}
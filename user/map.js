/*
	 Leaflet map controller object


	this controls the leaflet base map,
	->layer manipulation is performed through this object only

	methods (publicly usable)
		getLayerList
			return a list of layers in controller(this)
		getState
			return the current state of map, zoom, center etc.
		setState
			sets map state to given state
		scale
			scale the div in wich the map is contained	
		clearLayers
			remove all layers (except for the base map layer)
		getLayer(id)
			return layer wich has the id
		
		setLimiter(L.LatLngBounds)
			sets new limiter for map
		
		zoomIntoLayer(id)
			sets map to show the layer of desired id number
		
		zoomInto(L.Layer)
			zooms the map to the layer
		
		showLayer(id,callback)
			shows certain layer, loads it from database, callback returns true if layer is set
			to the map, if same id is already on map, the layer of that id is removed, callback then
			returns false.

		hideLayer(id,callback)
			hides the layer, if it exists in handler. returns true
			if layer is removed, false is layer is not found.

		hasLayer(id)
			query, if this controller has the layer of desired id.
			returns true if layer is found, if not, false is returned.
	

	events
		layeradd 
			fired when new layer is added to the map (layergroup)
		
		layerremove
			when layer is removed from controller
		
		clearlayers
			when all layers are removed at once
			fires multiple layerremove events
		
		zoomend
			zoom ends
		
		setlimiter
			limiter is set
		
		zoominto
			map is panned & zoomed into layer
		
		fitbounds
			map is scaled to show bounds
		
		layerloaded
			layer is loaded (not shown)
			fired before show

*/


var map = function(presentation,opts){
	var me = this;
	this._mapPane = 'map'; 
	this._layers = {};
	this._markerGroups = Array();
	this._listeners = {};	// event listeners
	this._presentation = presentation; // the presentation in wich this obj is linked to
	this._onTransition = false;

	if (opts.center == undefined){
		/*
		if (navigator.geolocation && opts.maxbounds == undefined){
			navigator.geolocation.getCurrentPosition(function(position){


				var lat = position.coords.latitude,
					lon = position.coords.longitude;

				me._map.setView([lat,lon], 10);
			},function(error){

				me._map.setView([60.24587,25],10)
			});
		}
		*/
		
		$.extend(opts, {
			center:[60.24587,25],
			zoom:'10',
		});
	}

	this._opts = opts;
	this.scale();
	this._map = new L.Map(this._mapPane,this._opts);
	resize.add(this.scale);

	if (!opts.maxbounds){
		this._maxbounds = new L.LatLngBounds([[-90,-180],[90,180]])
		this._map.setMaxBounds(this._maxbounds);


	} else {
		this.maxbounds = opts.maxbounds;
		this._map.setMaxBounds(opts.maxbounds);
	}


	// Back to current slide click handler
	this._handlerMoveEnd = function (e) {
		//alert(data);
		console.log(e.data);
		me.zoomInto(e.data);
	};

	// Back to current slide logic
	this._map.on('moveend', function(e){
		if (me.getLayerList().length !== 0 && !me._onTransition) {
			var curLayer = me.getLayer(me.getLayerList()[0].id);

			// check if the map is in the current slide view ...
			if ( me._map.getZoom()-1 == me._map.getBoundsZoom(curLayer.bounds) && curLayer.bounds.contains(me._map.getBounds())) {
				// ... if yes, hide the back button, unbind the event handler
				$('#backToCurrentSlideButton').css('display','none');
				$('#backToCurrentSlideButton').unbind('click', me._handlerMoveEnd);
			} else {
				// ... if no, show the back button, unbind and bind again the event handler
				$('#backToCurrentSlideButton').unbind('click', me._handlerMoveEnd);
				$('#backToCurrentSlideButton').css('display','');
				$('#backToCurrentSlideButton').bind('click', curLayer.bounds, me._handlerMoveEnd);
			}
		}
	});
};

map.prototype.setMaxBounds = function(bounds){
	if (bounds != undefined){
		this._maxbounds = bounds;
	}
	this._map.setMaxBounds(this._maxbounds);
}

map.prototype.getState = function(){
	var state = {
		center:this._map.getCenter(),
		zoom:this._map.getZoom(),
		minzoom:this._map.getMinZoom(),
		maxzoom:this._map.getMaxZoom(),
		bounds:this._map.getBounds(),
		limiter:this._limiter,
		layers:this.getLayerList()
	}

	return state;
}

map.prototype.setState = function(state){
	this.setLimiter(state.limiter.bounds);
	this._map.setView(state.center,state.zoom);
	for (var i in state.layers){
		this.showLayer(state.layers[i].id);
	}
}

map.prototype.checkBounds = function(sw,ne){
	//console.log(this._limiter)
}

// return list of visible layers on map
map.prototype.getLayerList = function(){
	var layers = this._layers;
	var list = Array();

	for (var i in layers){
		if (layers[i].properties!=undefined && i != 'baselayer'){
				
			list.push({
				name:getText(layers[i].properties.name),
				type:layers[i].type,
				id:layers[i]._id,
			});
		}
	}
	return list;
}

// window scaling
map.prototype.scale = function(){
	$('#' + this._mapPane).css({
		'width':window.innerWidth,
		'height':window.innerHeight,
	});
}

// remove all layers, except the base tile layer
map.prototype.clearLayers = function(){
	for (var i in this._layers){
		if (this._layers[i].type != 'baselayer'){
			this.removeLayer(this._layers[i])
		}
	}
	this.fire('clearlayers')
}
// returns layer with requested id
map.prototype.getLayer = function(id){
	return this._layers[id];
}

//apply a limiter to a map
map.prototype.setLimiter = function(limiter){
	if (limiter instanceof Array){
		limiter = new L.LatLngBounds(limiter);
	}

	if (this._limiter){
		if (this._limiter.layer){
			this._map.removeLayer(this._limiter.layer);
		}
	}

	if (limiter != undefined){

		//console.log(limiter.getCorners());
		
		var bounds = this.drawLine(limiter.getCorners(), {
			closed:true,
			weight:10,
			color:'#000',
			opacity:'1'
		});


		this._map.addLayer(bounds);
		this._map.setMaxBounds(limiter);

		this._limiter ={
			bounds:limiter,
			layer:bounds
		}

		this.fire('setlimiter');
	}
}

map.prototype.removeLimiter = function(){
	this._map.removeLayer(this._limiter.layer);

}

// zooms map into layer by id, finds a correct
// zoom and map center and applies it to leaflet map
map.prototype.zoomIntoLayer = function(id){	
	var layer = this.getLayer(id);
	if (layer != undefined){		
		if (layer.type == 'marker'){
			var markers = this.getMarkers(layer);
			bounds = getBounds(markers);
			this.zoomInto(bounds);
		} else if (layer.type == 'limiter'){
			this.zoomInto(layer);
		} else if (layer.type =='overlay'){
			this.zoomInto(layer.getBounds())
		} else  if (layer.type == 'itemlayerGroup'){

		}
		this.fire('zoominto',layer)
		return true;
	} else {
		return false;
	}
}

// zooms map into bounds
map.prototype.zoomInto = function(bounds){
	if (bounds!= undefined && bounds != false){
		var zoom = this._map.getBoundsZoom(bounds,true);

		this._map.setView(bounds.getCenter(), zoom );//, this._map.getBoundsZoom(bounds,true));
		//this.jumpFromTo(this._map.getCenter(), bounds.getCenter(), zoom);
		//console.log(this._map);

		this.fire('fitbounds',bounds);
	}
}

map.prototype.zoomIntoZoomPanZoom = function(bounds){
	if (bounds!= undefined && bounds != false){
		var zoom = this._map.getBoundsZoom(bounds,true);

		//this._map.setView(bounds.getCenter(), zoom );//, this._map.getBoundsZoom(bounds,true));
		this._onTransition = true;
		this.jumpFromTo(this._map.getCenter(), bounds.getCenter(), zoom);
		//console.log(this._map);

		this.fire('fitbounds',bounds);
	}
}

map.prototype.zoomIntoPan = function(bounds){
	var me = this;

	if (bounds!= undefined && bounds != false){
		var zoom = this._map.getBoundsZoom(bounds,true);

		var options = {
			animate: true,
			duration: 1,
			easeLinearity: 0.5
		};

		me._onTransition = true;

		this._map.panTo(bounds.getCenter(), options);
		setTimeout(function() { me._onTransition = false; me._map.setZoomAround(bounds.getCenter(), zoom, options); }, 1*1000 + 100);

		this.fire('fitbounds',bounds);
	}
}

// make a "jump" from one coordinate to another. Does not include interpolation (smooth transition) .. "yet" ?!
map.prototype.jumpFromTo = function(origLL, destLL, finalZoom) {
	var options = {
		animate: true,
		duration: 1,
		easeLinearity: 0.5
	};
	var me = this;
	var zoomMin = Math.min(me._map.getZoom(), finalZoom);

	var waitTime = 0;
	setTimeout(function() { me._map.setZoomAround(origLL, zoomMin - 1, options); }, waitTime);
	waitTime += 1 * 1000;
	setTimeout(function() { me._map.panTo(destLL, options); }, waitTime);
	waitTime += options.duration * 1000 + 500;
	setTimeout(function() { me._onTransition = false; me._map.setZoomAround(destLL, finalZoom, options);  }, waitTime);
};

// return all markers from layer
map.prototype.getMarkers = function(layer){
	var result = Array();
	for (var i in layer._layers){
		if (layer._layers[i].type == 'marker'){
			result.push(layer._layers[i]);
		}
	}
	return result;
}

// if this has layer with that id visible
map.prototype.hasLayer =function(id){
	if (this._layers[id]!=undefined){
		return true;
	} else {
		return false;
	}
}

// remove visible layer, if no layer is removed, false is returned
map.prototype.removeLayer = function(layer){	
	if (this.hasLayer(layer.id)){
		this._map.removeLayer(layer);
		delete this._layers[layer.id];
		this.fire('removelayer',layer);
		this.fire('layerremove',this.getLayerList())
		return true;
	} else {
		return false;
	}
}
// removes layer by its id number
map.prototype.removeLayerById = function(id){
	if(this._layers[id]) this.removeLayer(this._layers[id])
}

map.prototype.drawLine = function(line,opts){
	if (opts.closed == true){
		line.push(line[0]);
	}
	var layer = new L.polyline(line,opts);
	return layer;
}

// adds one item layer to the map, if it is limiter type (no content), the map is panned
map.prototype.addLayer =function(layer){
	if (!this.hasLayer(layer._id)){
		
		if (layer.type != 'boundingbox' && layer){
			var id = this._map.addLayer(layer);
			this._layers[layer._id] = layer;

			//console.log(layer);

			if (this._layers[layer._id].bounds != undefined){
				if (layer.properties.animatedtransition == undefined) {
					this.zoomInto(this._layers[layer._id].bounds);
				} else if (layer.properties.animatedtransition == 'zoom-pan-zoom') {
					this.zoomIntoZoomPanZoom(this._layers[layer._id].bounds);
				} else if (layer.properties.animatedtransition == 'instant') {
					this.zoomInto(this._layers[layer._id].bounds);
				} else if (layer.properties.animatedtransition == 'pan') {
					this.zoomIntoPan(this._layers[layer._id].bounds);
				}
			}
	
			this.fire('layeradd',this.getLayerList());
			this.fire('addlayer',layer);
		} else {
			this.zoomInto(layer);
		}		
		return id;
	} else {
		return false
	}
}
// shows layer on map
// returns (callback) true if layer is loaded and put on map,
// false if layer is removed
map.prototype.showLayer = function(id,callback){
	var me = this;
	// if there is no that id visible, layer is loaded from database
	if (this.hasLayer(id) == false){

		this.loadLayer(id,function(layer){
			// add layer to map

			for (var i in me._layers){
				if (me._layers[i]._shownOnly == true){
					me.hideLayer(me._layers[i]._id);
				}
			}

			me.addLayer(layer);
			// if callback exists, callback is called
			if (typeof(callback)=='function'){
				callback(true);
			}
		});
	} else { // if there was a layer with same id, only the visible layer is removed, no data is retrieved from db
		this.removeLayerById(id);
		if (typeof(callback)=='function'){
			callback(false);
		}
	}
}

map.prototype.loadLayer = function(id,callback){
	layerLoader.load(id,this._presentation,function(layer){
		callback(layer);
	});
}

map.prototype.setLayerOn = function(id,callback){	
	if (this.hasLayer(id) == false){
		this.showLayer(id,callback);
	} else {		
		if (typeof(callback) == 'function'){
			callback(false);
		}
	}
}

map.prototype.setLayerOpacity = function(id,value){
	if (this.hasLayer(id)){
		var layer = this.getLayer(id);
		layer.setOpacity(value);		
	}
}

map.prototype.setLayerOff = function(id,callback){
	this.hideLayer(id,callback);	
}

// hides layer by id from map,callback because of reasons.
map.prototype.hideLayer = function(id,callback){
	var me =this;
	if (this.hasLayer(id)){		
		var layer = this.getLayer(id);
		this.removeLayer( this._layers[id] );

		if (layer._shownASView == true){
			this.hideAll();
			this.setState(layer._beforeView);
		}

		this.fire('removelayer',this._layers[id]);

		if (typeof(callback) == 'function'){
			callback(true);
		}
		return true;
	} else {
		return false;
	}
}

map.prototype.hideAll = function(id){
	for (var i in this._layers){			
		if (this._layers[i]._id != id && this._layers[i].type != 'baselayer'){
			this.setLayerOff(this._layers[i]._id);
		}
	}		
}

map.prototype.showOnly = function(id,callback){
	var me = this;
	this.showLayer(id,function(result){
		if (result){
			me.hideAll(id);
			var layer = me.getLayer(id);			
			
			if (layer){
				layer._shownOnly = true;
			} else {
				// some kind of error
			}
		}
		callback(result);
	});
}

map.prototype.showAsView = function(id,callback){
	if (typeof(id) == 'object'){
		id = id._id;		
	}
	var me = this;
	var state = me.getState();

	this.showOnly(id,function(result){
		if (result){
			var layer = me.getLayer(id);
			if (layer){
				if (layer.bounds){
					me.zoomInto(layer.bounds);
					me.setLimiter(layer.bounds);
				} else {
					layer.createBounds();
				}
				layer._beforeView = state;
				layer._shownASView = true;
				callback(true,me._beforeView);
			} else {
				callback(false);
			}
		} else {			
			callback(false);
		}
	});
}


// sets tilelayer as a base layer
// layers are stored in tilelayer array in wich they can be brought up from
map.prototype.setBaseLayer = function(name){
	var layer = getTileLayer(name);//tileLayers[name].map();
	layer.type = 'baselayer';
	layer._id = 'baselayer';
	this.addLayer(layer);
}


//
// map controller event listener firing
// custom events for simplifying event count, ie. when leaflet launches one event for every marker added,
// this fires only once while layergroup is added to the map
//
// just so, that i dont fire ex breadcrumbs refresh 4053 times for adding one layer
map.prototype.fire = function(evt,data){
	if (this._listeners[evt]!=undefined){
		if (this._listeners[evt].length>0){
			for (var i in this._listeners[evt]){
				if (typeof(this._listeners[evt][i])=='function'){
					this._listeners[evt][i](data,this);
				}
			}
		}
	}
}
map.prototype.off = function(name){
	this._listeners[name] = undefined;
}

// subscribe to map events
// usage map.on(event_name,function)
map.prototype.on = function(listener,fn){
	if (this._listeners[listener]== undefined){
		this._listeners[listener]=Array();
	}
	this._listeners[listener].push(fn);
}

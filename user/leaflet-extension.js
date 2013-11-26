L.Marker.prototype._initInteraction = function () {
	if (!this.options.clickable) {
		return;
	}

	var icon = this._icon,
		events = ['dblclick', 'mousedown', 'mouseover', 'mouseout'];

	L.DomUtil.addClass(icon, 'leaflet-clickable');
	L.DomEvent.on(icon, 'click', this._onMouseClick, this);

	var me = this;
	onTap(icon,function(evt){
		me.fire('click',evt);
	});

	for (var i = 0; i < events.length; i++) {
		L.DomEvent.on(icon, events[i], this._fireMouseEvent, this);
	}

	if (L.Handler.MarkerDrag) {
		this.dragging = new L.Handler.MarkerDrag(this);

		if (this.options.draggable) {
			this.dragging.enable();
		}
	}
}

L.ImageOverlay.prototype.getBounds = function(){
	var bounds = new L.LatLngBounds([[this._bounds._northEast.lat,this._bounds._northEast.lng],[this._bounds._southWest.lat,this._bounds._southWest.lng]]);
	return bounds;
}

L.Marker.prototype.setAction = function(presentation){
	this.on('click',function(){

	});
}

L.LatLngBounds.prototype.getCorners = function(){
	
	var points = [[this._northEast.lat,this._northEast.lng],
				[this._northEast.lat,this._southWest.lng],
				[this._southWest.lat,this._southWest.lng],
				[this._southWest.lat,this._northEast.lng]];

	return points;
}


L.LatLng.prototype.toArray = function(){
	return [this.lat,this.lng];
}

L.LatLngBounds.prototype.getEdges = function(){
	
	var line = [this.getSouthWest().toArray(),
				this.getSouthEast().toArray(),
				this.getNorthEast().toArray(),
				this.getNorthWest().toArray()];

	return line;
}

L.LatLngBounds.prototype.shrink = function(point){
	var ne = this.getNorthEast();
	var sw = this.getSouthWest();

	var plat = this.point.getLatLng().lat,
		plng = this.point.getLatLng().lng;

	var npng = (plng < ne.lng) ? plng : ne.lng,
		nplat = (plat < ne.lat) ? plat : ne.lat,

		epng = (plng > sw.lng) ? plng : sw.lng,
		eplat = (eplat > sw.lat) ? eplat : sw.lat;

//	this.setBounds([[nlat,npng],[elat,epng]]);
}

L.LatLngBounds.prototype.drawEdges = function(opts){
	var linestr = this.getEdges();
	linestr.push(linestr[0]);
	return new L.Polyline(linestr,opts);	
}

L.LatLngBounds.prototype.unpad = function(val){
	var num = parseInt(val)/100;

	var ne = this.getNorthEast(),
		sw = this.getSouthWest();

	if (num){
		var d1 = ne.lng - sw.lng,
			d2 = ne.lat - sw.lat;

		d1 = num*d1;
		d2 = num*d2;

		ne.lng = ne.lng-d1;
		ne.lat = ne.lat-d2;

		sw.lng = sw.lng+d1;
		sw.lat = sw.lat+d2;

		this.setBounds(sw,ne);
	}

	return this;
}

L.LayerGroup.prototype.createBounds = function(){
	for (var i in this._layers){
	}
}

L.LatLngBounds.prototype.setBounds = function(sw,ne){
	this._southWest = sw;
	this._northEast = ne;
}


L.LayerGroup.prototype.toggle = function(){
	if (this._map == null){		
		map.addLayer(this);
		return true;
	} else {
		map.removeLayer(this);
		return false;
	}
}

L.LayerGroup.prototype.show = function(){
	if (this._map == null){
		map.addLayer(this);
		return true;
	} else {
		return false;
	}
}

L.LayerGroup.prototype.hide = function(){
	if (this._map != null){
		map.removeLayer(this);
		return true;
	} else {
		return false;
	}
}

L.LayerGroup.prototype.isVisible = function(){
	if (map.hasLayer(this)){
		return true;
	} else {
		return false;
	}
}


/*
L.Map.prototype.removeLayerByPresentationId = function(id){
	var layer = this.getLayerByPresentationId(id);

	if (layer != false){
		this.removeLayer(layer);
		return true;
	} else {
		return false;
	}
}



// if leaflet map has an layer with an desired id number
L.Map.prototype.hasLayerId = function(id){
	var l = this.getLayerById(id);
	
	if (l!=false){
		l = true;
	}

	return l;
}


// returns the layer by presentation id
L.Map.prototype.getLayerByPresentationId = function(id){
	var found = false;
	for (var i in this._layers){
		if (this._layers[i].properties != undefined){		
			if (this._layers[i].properties.id == id){
				found = this.this._layers[i];
			}
		}
	}
	return found;
}


L.Map.prototype.getLayerById =function(id){
	for (var i in this._layers){
		if (this._layers[id]!=undefined && this._layers[id]!=null){
			return this._layers[id];
		}
	}
}

// seeks certain types of layers from leaflet map
// when custom properties are set
L.Map.prototype.getMapLayersByType = function(type){
	var layers = Array();

	for (var i in this._map._layers){
		if (this._layers[i].properties!=undefined){		
			if (this._layers[i].properties.type == type){			
				layers.push(this._map._layers[i]);
			}
		}
	}
	return layers;
}

// finds all marker layers from leaflet map
L.Map.prototype.getMarkers = function(){
	var markers = this.getMapLayersByType('marker');
	var markerGroups = this.getMapLayersByType('groupmarker');

	if (markerGroups.length > 0 ){
		for (var i in markerGroups){			
			var m = markerGroups[i].group.getMarkers();
			for (var d in m){
				markers.push(m[d])
			}
		}
	}
	return markers;
}
*/
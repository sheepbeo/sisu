
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

L.LatLngBounds.prototype.getData = function(){
	return
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

L.LatLngBounds.prototype.setBounds = function(sw,ne){
	this._southWest = sw;
	this._northEast = ne;
}


L.LayerGroup.prototype.hasLayer = function(layer){
	var id = L.Util.stamp(layer);	
	return this._layers.hasOwnProperty(id);
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
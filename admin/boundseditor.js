

function boundsEditor(layer,lineopts){
	this._sw = false;
	this._ne = false;
	this._swMarker = false;
	this._neMarker = false;
	this._lineopts = lineopts;
	this._line = false;
	this._layer = new L.LayerGroup();
	this._baseLayer = layer;
	
	this._baseLayer.addLayer(this._layer);
}


boundsEditor.prototype  = {
	isVisible:function(){
		return map.hasLayer(this._layer);
	},
	toggle:function(is){
		if (is == undefined){

			if (!map.hasLayer(this._layer)){		
				this._baseLayer.addLayer(this._layer);
				return true;
			} else {
				this._baseLayer.removeLayer(this._layer);
				return false;
			}

		} else if (is){
			this._baseLayer.addLayer(this._layer);
			return true;
		} else {
			this._baseLayer.removeLayer(this._layer);
			return false;
		}
	},
	load:function(data){
		if (data.type == 'boundingbox'){
			this.setBounds(new L.LatLngBounds( data.coordinates ));
			this.toggle(data.enabled);
		}
	},
	getData:function(){
		var dta = {
			type:'boundingbox',
			coordinates:this._bounds.getEdges(),
			enabled:map.hasLayer(this._layer)
		}


		return dta;
	},
	setBounds:function(bounds){
		this._bounds = bounds;
		this._ne = bounds.getNorthEast();
		this._sw = bounds.getSouthWest();

		if (!this._neMarker && !this._swMarker){
			this.addCornerMarkers();
		}
		this.update();
	},
	addCornerMarkers:function(){
		if (this._bounds){

			var icon = new L.Icon({
				iconUrl:'img/location.png',
				size:[48,48],
				iconAnchor:[24,24]
			})

			var opts = {draggable:true};


			this._neMarker = new L.Marker(this._bounds.getNorthEast(),opts);
			this._swMarker = new L.Marker(this._bounds.getSouthWest(),opts);

			this._neMarker.setIcon(icon);
			this._swMarker.setIcon(icon);

			var me = this;
			
			this._neMarker.on('drag',function(){me.update()});
			this._swMarker.on('drag',function(){me.update()});			
			this._layer.addLayer(this._neMarker)
						//.addLayer(this._nwMarker)
						.addLayer(this._swMarker);
						//.addLayer(this._seMarker);
		}
	},
	drawLine:function(){
		if (this._bounds != false){

			if (map.hasLayer(this._line)){
				this._layer.removeLayer(this._line);
			}

			this._line = this._bounds.drawEdges(this._lineopts);
			this._layer.addLayer(this._line);
		}
	},

	update:function(){
		if (this._bounds){
			this._bounds.setBounds(this._swMarker.getLatLng(),this._neMarker.getLatLng());
			this.drawLine();
		}
	}
}
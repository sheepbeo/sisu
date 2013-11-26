var map = {
		point : new L.LatLng(60.18728115859684,24.935531616210938),

		layers:Array(),
			hasLayer:function(layer){
				return this.map.hasLayer(layer);
			},

			addLayer : function(layer){
				this.map.addLayer(layer);
			},

			removeLayer: function(layer){
				if (layer != undefined){
						
					if (this.map.hasLayer(layer)){
						this.map.removeLayer(layer);
					}
				}
			},

			getLayer : function(prop,param){
				for (i in this.layers){
					if (i == prop && this.layer[i] == param){
						return this.layer[i];
					}
				}
			},

			setbaselayer:function(name){
				if (this._baselayer != undefined){
					if (this.map.hasLayer(this._baselayer)){
						this.map.removeLayer(this._baselayer);
					}
				}
				this._baselayer = tileLayers[name].map();
				this.map.addLayer(this._baselayer);
			},

			set : function(div){
				var me = this;
				this.map = new L.Map(div,{maxZoom:18,minZoom:1,zoomControl:false,}),
				//	osm = new L.TileLayer('http://a.www.toolserver.org/tiles/osm/{z}/{x}/{y}.png'),
				//	ms = new L.BingLayer("AknWxnuhEculwqZVnAOZ8IINcG08774F5tmeyEnHbEzIwYwvXH2LUJg0JWBIX-uv",{type:'road'});
						
				//	this.map.addLayer(ms);
				this.map.setView(this.point,13);
				this.map.on('click',function(e){

					me.click(e.latlng,e);
				});	

			},

			show : function(){
				var me = this;
				this.element = $('<div id="map"></div>');


				this.element.ready(function(){
					/*
					me.element.css({
						width:me.element.parent().width(),
						height:me.element.parent().height(),
						left:me.element.parent().position().left
					});

					*/
					me.set();
				});
				return this.element;		
			},
			
			move : function(point){
				this.map.setView(point,this.map.getZoom());
			},
			
			click : function(e){
				
			},
			
			getMarker : function(point){
				var marker = new L.Marker(point,{draggable:true});
				return marker;
			},
			getMarkerByLatLng : function(lat,lng){
				var point = new L.LatLng(lat,lng);
				var marker = new L.Marker(point,{draggable:true});
				return marker;
			},			
			getLatLng : function(marker){

				var point = marker.getLatLng();

				return point;
			},
			setLatLng : function(marker,lat,lng){

				var point = new L.LatLng(lat,lng);
				marker.setLatLng(point);
			},
			getLine : function(points,opts){

				var line = new L.Polyline(points,opts);

				return line;
			},
			getOverlay : function(p1,p2,image,opacity){

				var bounds = new L.LatLngBounds(p1,p2);
				var image = new L.ImageOverlay(image,bounds,{'opacity':opacity});

				return image;
			},


}
function imageMarkerEditor(layer,point,img,type){
	this._layer = layer;
	this._image = img;
	this._point = point;
	this.type = 'imagemarker';
	this._listeners = [];

	if (this._layer && this._point && this._image){
		this.init();
	}
}

imageMarkerEditor.prototype = {
	setEdit:function(){

	},
	remove:function(){
		map.removeLayer(this._marker);
	},
	showItem:function(){
		this._layer.addLayer(this._marker);
	},
	init:function(){
		if (this._marker){
			if (map.hasLayer(this._marker)){
				map.removeLayer(this._marker);
			}
		}

		this._img = getImage(this._image,[64,64]);
		this.setMarker();
		this.setIcon();
		this._layer.addLayer(this._marker);
	},
	setMarker:function(){
		this._marker = new L.Marker(this._point,{draggable:true});
	},
	setIcon:function(){
		
		this._icon = new L.DivIcon({
			iconSize:[64,64],
			iconAnchor:[32,32],
			size:[64,64],
			className:'imageMarker',
			html:'<img src="'+this._img+'"></img>'
		});		

		if (this._marker){
			this._marker.setIcon(this._icon);
		}
	},
	getData:function(){
		var data=  {
			type:'imagemarker',
			coordinates:this._marker.getLatLng(),
			properties:{
				name:'',
				image:this._image,
			}
		}
		return data;
	},
	load:function(data){
		this._image = data.properties.image;
		this._name = data.properties.name;
		this._point = data.coordinates;
		this._img = getImage(data.properties.image,[64,64]);
		this.init();
	},
	on:function(name,fn){		
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
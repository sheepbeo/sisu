function overlayEditor(layer){
	this._sw = false;
	this._ne = false;
	this._swMarker = false;
	this._neMarker = false;

	this._line = false;
	this._layer = new L.LayerGroup();
	this._markerLayer = new L.LayerGroup();	
	this._baseLayer = layer;
	
	this._baseLayer.addLayer(this._layer);
	this._listeners = [];

	this._element = $('<div class="markerEditor" />');
	this._nametext = $('<div class="nameheader"><input title="name" placeholder="name" name="name" type="text"></input></div>');
	this._rotationtext = $('<div class="input-container"><img class="input-icon" src="img/rotation.png" /><input class="half" title="rotation" placeholder="0" name="rotation" type="number"></input></div>');
	this._opacitytext = $('<div class="input-container"><img class="input-icon" src="img/view.png" /><input class="half" title="opacity" value="100" min="1" max="100" name="opacity" type="number"></input></div>');

	this._imageinput = new imgInput();		
	
	this._bottomBar = $('<div class="bottombar" />');
	this.acceptButton = $('<img class="ok button" src="img/check-alt.png"></img>');
	this.removeButton = $('<img class="delete button" src="img/trash-empty.png"></img>');

	this._element
				.append(this._nametext)
				.append(this._opacitytext)
				.append(this._rotationtext)
				.append(this._imageinput.element)
				.append(this._bottomBar);

	this._bottomBar.append(this.acceptButton).append(this.removeButton);
	
	this.removeButton.click(function(){
		me.remove();
		me._fire('delete',me);
	});

	this.acceptButton.click(function(){		
		me.update();
	});

	var me =this;
	this._imageinput.on('addimage',function(imginput){
		me.setImage(me._imageinput.getData().name);
	});
}


overlayEditor.prototype  = {
	setEdit:function(is){
		this._edit = is;
		this.update();
	},
	showItem:function(){
		this.show();
		this.update();
	},
	show:function(){
		if (!map.hasLayer(this._layer)){
			map.addLayer(this._layer);
			return true;
		} else {
			return false;
		}
	},
	hide:function(){
		if (map.hasLayer(this._layer)){
			map.removeLayer(this._layer);
			return true;
		} else {
			return false;
		}
	},
	/*
	toggle:function(){
		if (map.hasLayer(this._layer)){
			this.hide();
			return false;
		} else {
			this.show();
			return true;
		}		
	},
	*/
	remove:function(){
		map.removeLayer(this._layer);		
		this._fire('remove',this);
	},
	getImage:function(name){
		return IMGURL + '?img='+name+'&full=true';
	},
	getRotation:function(){
		this._rotation = parseFloat(this._rotationtext.find('input').val());
		return this._rotation;
	},
	getOpacity:function(){
		this._opacity = parseInt(this._opacitytext.find('input').val() / 100);
		return this._opacity;
	},
	setOpacity:function(){
		this._opacitytext.find('input').val( this._opacity * 100 )
	},
	createBounds:function(bounds){
		if (!bounds){
			this.setBounds(map.map.getBounds().unpad(15));		 
		} else {
			this.setBounds(bounds);
		}
	},
	setImage:function(name){
		if (name){
			this._imgurl = name;
		}
		if (this._imgLayer){
			if (map.hasLayer(this._imgLayer)){
				this._layer.removeLayer(this._imgLayer);
			}
		}
		if (this._bounds && this._imgurl){

			//this._imgLayer = new L.ImageOverlay(this.getImage(this._imgurl),this._bounds,{opacity:parseInt(this._opacitytext.find('input').val())/100});
			//console.log(this._bounds);
			this._imgLayer = new RotatedImageOverlay(
											this.getImage(this._imgurl),
											this._bounds,
											this.getRotation(),
											false,
											{
												opacity:this.getOpacity()
											}
								);


			this._layer.addLayer(this._imgLayer);
			this._fire('imageset',this);
			
			//this.setOpacity(this._opacitytext.find('input').val());
			return true;
		} else {
			return false;
		}
	},
	setOpacity:function(opacity){
		opacity = parseInt(opacity)/100;		
		if ($.isNumeric(opacity) && this._imgLayer!=undefined){
			if (map.hasLayer(this._imgLayer)){
				this._imgLayer.setOpacity(opacity);
			}

			return opacity;
		} else {
			return false;
		}
	},
	isVisible:function(){
		return map.hasLayer(this._layer);
	},
	toggle:function(is){
		if (is == undefined){
			if (!map.hasLayer(this._layer)){		
				this._baseLayer.addLayer(this._layer);
				this._fire('show',this);
				return true;
			} else {
				this._baseLayer.removeLayer(this._layer);
				this._fire('hide',this);
				return false;
			}
		} else if (is){
			this._baseLayer.addLayer(this._layer);
			this._fire('show',this);
			return true;
		} else {
			this._baseLayer.removeLayer(this._layer);
			this._fire('hide',this);
			return false;
		}
	},
	load:function(data){
		if (data.type == 'imageoverlay'){			
			this.setBounds(new L.LatLngBounds( data.coordinates ));
			this._imageinput.load(data.properties.image);
			this._nametext.find('input').val(data.properties.name.fin);
			this._opacitytext.find('input').val(data.properties.opacity || 100);			
			this.setImage(data.properties.image.name);
		}

		setStamp(this,data);
	},
	getData:function(){
		var dta = {
			type:'imageoverlay',
			coordinates:this._bounds.getEdges(),
			properties:{
				image:this._imageinput.getData(),
				name:{
						fin:this._nametext.find('input').val()
				},
				opacity:this._opacitytext.find('input').val()
			}
		}
		stamp(this,dta);
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
			});

			var opts = {draggable:true};

			this._neMarker = new L.Marker(this._bounds.getNorthEast(),opts);
			this._swMarker = new L.Marker(this._bounds.getSouthWest(),opts);

			this._neMarker.setIcon(icon);
			this._swMarker.setIcon(icon);

			var me = this;
			
			this._neMarker.on('drag',function(){me.update()});
			this._swMarker.on('drag',function(){me.update()});			
			this._markerLayer.addLayer(this._neMarker)
							.addLayer(this._swMarker);
			
			if (!this._layer.hasLayer(this._markerLayer) && this._edit){
				this._layer.addLayer(this._markerLayer);
			}
		}
	},
	drawLine:function(){
		if (this._bounds != false){
			if (map.hasLayer(this._line)){
				this._layer.removeLayer(this._line);
			}
			this._line = this._bounds.drawEdges();
			this._line.setStyle({color:'#000',weight:10})
			
			if (this._edit){
				this._layer.addLayer(this._line);
			}
			this._line.bindPopup(this._element[0]);
		}
	},
	update:function(){		
		if (this._bounds){
			this._bounds.setBounds(this._swMarker.getLatLng(),this._neMarker.getLatLng());
			this.setImage();
		}

		if (!this._edit){
			this._layer.removeLayer(this._line);				
			this._layer.removeLayer(this._markerLayer);
		} else {
			this.drawLine();			
			if (!map.hasLayer(this._line)){
				this._layer.addLayer(this._line);				
			}
			if (!map.hasLayer(this._markerLayer)){
				this._layer.addLayer(this._markerLayer);
			}
		}

		this._fire('update',this);
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
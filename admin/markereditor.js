
function markerEditor(e,layer){
	this._element = $('<div class="markerEditor" />');
	this._listeners = Array();
	this._layer = layer;
	this._nametext = $('<div class="nameheader"><input placeholder="Place name" name="name" type="text"></input></div>')
	this._iconselect = $('<div name="icon" class="horizontal_selectlist" />');
	//this._colorselect = $('<div name="color" class="colorlist colorpick" />');
	//this._imageinput = $('<div name="image" class="imageinput dropinput" title="select or drop in an image for this place icon"></div>');
	this._imageinput = new imgInput();	
	this._targetinput = new targetDropInput();
	this._bottomBar = $('<div class="bottombar" />');
	this.acceptButton = $('<img class="ok button" src="img/check-alt.png"></img>');
	this.removeButton = $('<img class="delete button" src="img/trash-empty.png"></img>');

	this._latlnginputContainer = $('<div class="latlnginput-container"></div>');	
	this._latInput = $('<input type="text" class="latlnginput" />');
	this._lngInput = $('<input type="text" class="latlnginput" />');

	this._inputContainer = $('<div class="dropinput-container"></div>');

	this._element
				.append(this._nametext)
				.append(this._latlnginputContainer
					.append('<p>Latitude:</p>')
					.append(this._latInput)
					.append('<p>Longitude:</p>')
					.append(this._lngInput)
				)
	//			.append(this._colorselect)
				.append(this._iconselect)

				.append(this._inputContainer
					.append(this._imageinput.element)
					.append(this._targetinput.getElement())
				)
				
				.append(this._bottomBar);

	this._bottomBar
			//.append(this.acceptButton)
			.append(this.removeButton);
	this._iconList = new markerList();
	this._iconselect.append(this._iconList.element);

	var me = this;

	this.setItem(e);

	this._marker.on('click',function(){
		me._targetinput.update();
	});

	this.removeButton.click(function(){
		me.remove();
		me._fire('delete',me);
	});

	this._iconList.on('select',function(){
		me.setIcon();
	});

	
	this._imageinput.on('addimage',function(){
		me.setIcon();
	});

	this.setIcon();

	this._element.find('input').on('keyup',function(e){
		if (e.keyCode == 13){
			me.setPosition();
		}
	});
}


markerEditor.prototype = {
	setEdit:function(is){
		if (is){
			this.enableEdit();
		} else {
			this.disableEdit();
		}
	},
	disableEdit:function(){
		if (this._marker != undefined){	
			//this._marker.options.draggable = false;
			//this._marker.unbindPopup();		
		}
	},
	enableEdit:function(){
		if (this._marker != undefined){	
			//console.log(this)
			//this._marker.dragging.enable();
			//this._marker.options.draggable = true;
			//this._marker.bindPopup(this._element[0]);
		}
	},
	setItem:function(e){		
		var me = this;
		this._marker = new L.Marker(e,{draggable:true});
	
		if (this._marker){			
			this._marker.on('drag',function(){
				me.update();
			});

			this._marker.bindPopup( this._element[0])
			this.showItem();
		}

		this.update();
	},
	load:function(data){
		if (data.type == 'marker'){
			/*
			if (data._id != undefined){
				this._id = data._id;
				this.timeStamp = data.timeStamp;
			}*/
			setStamp(this,data);
			this._marker.setLatLng(data.coordinates);
			this._iconList.load(data.markericon);
			this._imageinput.load(data.icon);
			this._targetinput.load(data.target);
			this._description = data.properties.description;

			for (var i in data.properties){
				this._element.find('[name="'+i+'"]').val(getText(data.properties[i]));
			}

			this.setIcon();
		}
	},
	showItem:function(){
		if (!map.hasLayer(this._marker)){
			this._layer.addLayer(this._marker);
		}
	},
	hideItem:function(){
		map.removeLayer(this._marker);
	},
	remove:function(){
		this._layer.removeLayer(this._marker);				
		this._fire('remove',this);		
	},
	setIcon:function(){
		var icon = this._iconList.getData();
		
		if ( icon != false && icon != ''){
			/*
			var micon = new L.Icon({
				size: icon.icon.size,
				iconAnchor: icon.icon.offset,
				iconUrl: icon.icon.url,
				shadowUrl: icon.shadow.url,
				shadowAnchor: icon.shadow.offset
				//className:'marker-icon',
				//html:'<img width="'+icon.size[0]+'px" height="'+icon.size[1]+'px" src="'+getImage(icon)+'"></img>'
			});
			*/
			var img = this._imageinput.getImage(icon.icon.size);			
			var css = '';

			for (var i in icon.css){
				css += i +':'+icon.css[i] +';';
			}
			
			
			var iconimage = '';
			if (img.name != 'image'){
				iconimage = getImage(img);
			}


			var micon = new L.divIcon({
				iconSize:icon.icon.size,
				iconAnchor:icon.icon.offset,
				className:'marker-icon',
				html:'<div style="position:relative;overflow:hidden;background-image:url(../'+markerIconsURL+'/'+icon.icon.url+'); width:'+icon.icon.size[0]+'px; height:'+icon.icon.size[1]+'px" class="marker-icon-imagecontainer"><img class="marker-icon-image" style="'+css+'" src="'+iconimage+'"></img></div>'
			});

			this._marker.setIcon(micon);
		}
	},
	getData:function(){
		var props = {};

		this._element.find('input, select, textarea').each(function(){			
			props[$(this).attr('name')] = getInputText( $(this) );
		});
		

		var point = this._marker.getLatLng();
			props.tags = [];


		var data = {
			coordinates:point,
			properties:props,
			type:'marker',
			markericon:this._iconList.getData()._id,
			icon:this._imageinput.getData(),
			target:this._targetinput.getData(),
		}		

		data.properties.description = this._description;
		
		data = stamp(this,data);

		return data;		
	},
	update:function(){
		this._latInput.val( this._marker.getLatLng().lat);
		this._lngInput.val( this._marker.getLatLng().lng);
	},
	setPosition:function(){
		var lat = this._latInput.val();
		var lng = this._lngInput.val();

		this._marker.setLatLng([lat,lng]);
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
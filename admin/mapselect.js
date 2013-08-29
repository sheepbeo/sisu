function basemapselect(callback){
	editorwindow.call(this);

	this.setSize(550,600);
	this.setPosition('center');
	this.applyOverlay();

	this.setHeader('presentation','basemap');

	this.maplist = new list();

	for (var i in tileLayers){
		var l = tileLayers[i];

		var item = {
			_id:i,
			properties:{
				name:{fin:l.name},
				description:{fin:l.description},
				image:{
						name:l.image,
						path:'img/',
						size:[96,96],
						icon:true
				}			
			},
			action:'selectbasemap',
			removable:false,
			edit:false
		}

		this.maplist.addItem(item);
	}

	this.append(this.maplist.getElement());
	this._container.css({
		width:'500px',
		'margin-left':'25px'
	});
}

basemapselect.prototype = new editorwindow();
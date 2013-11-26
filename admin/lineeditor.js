function lineEditor(maplayer){
	editorwindow.call(this);
	this.init();	
	this.setSize(320,350);
	this.setPosition('center');
	this._element.addClass('lineeditor');
	this.setHeader('line','options');
	this._layer = maplayer;
	this._lineLayer = new L.LayerGroup();

	this._layer.addLayer(this._lineLayer);

	this.line = false;
	this.points = Array();

	this.inputs = {
		nameinput:$('<input type="text" name="name" placeholder="name" />'),
		opacitylabel:$('<p class="label">Opacity</p>'),
		opacity:$('<input type="text" name="opacity" value="1"></input'),
		weightlabel:$('<p class="label">Line thickness</p>'),
		lineWeight:$('<input type="text" name="lineweight" value="5"></input'),
		colorlabel:$('<p class="label">Line color</p>'),
		color:getColorList(),
		removeButton : $('<img class="delete button" src="img/cancel.png"></img>')
	}

	for (var i in this.inputs){
		this.append(this.inputs[i]);
	}

	var me = this;	
	this.on('hide',function(){
		me.update();
	});

	this.inputs.removeButton.click(function(){
		me.remove();
		me.delete();
	});
}

lineEditor.prototype = new editorwindow();


lineEditor.prototype.setEdit = function(s){
	if (s){
		this.enableEdit();
	} else {
		this.disbaleEdit();
	}
}

lineEditor.prototype.enableEdit = function() {
	// todo
}

lineEditor.prototype.disbaleEdit = function(){
	// todo
}

lineEditor.prototype.showEditor = function(){
	this.applyOverlay(true);
	this.show();
}

lineEditor.prototype.createMarker = function(e){
	var lineMarker = new L.icon({
		iconUrl:'img/line_pointmarker.png',
		iconSize:[32,32],
		iconAnchor:[16,16]
	});

	var point = new L.Marker(e,{draggable:true,icon:lineMarker});
	return point;
}

lineEditor.prototype.isOnPoint = function(e){
	for (var i in this.points){
		
		var p  = this.points[i].getPoint();
		
		if (e[0] == p[0] && e[1] == p[1]){
			return this.points[i];
		}
	}
	return false;
}

lineEditor.prototype.addItem = function(e,preventUpdate){
	var me = this,
		el = this.isOnPoint(e);

	var endLine = function(e){		
		me.endLine(e.target);
	}

	if (el){
		me.endLine(el);

	} else {
		var point = this.createMarker(e);

		point.on('click',endLine);
		
		point.on('drag',function(){
			me.update();
		});

		if (this.points.length > 3){
			this.points[this.points.length-2].off('click',endLine);
		}
		this.points.push(point);
	}
	if (!preventUpdate){
		this.update();
	}
}

lineEditor.prototype.endLine = function(point){
	map.click = function(){
		return false;
	}

	if (point == this.points[0]){
		this.points.push(this.points[0]);
		this.update();
	}

	this._fire('end',this);
}

lineEditor.prototype.getLine = function(){
	var line = Array();
	for (var i in this.points){
		line.push( this.points[i].getPoint() );
	}
	return line;
}

lineEditor.prototype.showItems = function(){
	for (var i in this.points){
		if (!map.hasLayer(this.points[i])){
			this._lineLayer.addLayer(this.points[i]);
		}

		
		if (this.line != false && !map.hasLayer(this.line)){
			this._lineLayer.addLayer(this.line);
		}
		
	}
}

lineEditor.prototype.update = function(){
	if (this.points.length > 1){
		if (map.hasLayer(this.line)){
			this._lineLayer.removeLayer(this.line);
		}
		this.line =new L.polyline(this.getLine(),this.getOptions());	
		var me = this;
		this.line.on('click',function(){
			me.showEditor();
		});
	}
	this.showItems();
	this._fire('update',this);
}

lineEditor.prototype.delete = function(){
	map.removeLayer(this._lineLayer);
	delete this._lineLayer;
	this._fire('delete',this);
}

lineEditor.prototype.load = function(data){	
	this.timeStamp = data.timeStamp;
	this._id =  data._id;

	if (data.options != undefined && data.options != null){
		this.inputs.opacity.val(data.options.opacity);
		this.inputs.lineWeight.val(data.options.weight);
		selectFromList(this.inputs.color,data.options.color);
	}

	if (data.items != undefined){

		for (var i in data.items){
			this.addItem(data.items[i],true);
		}
	}
}


lineEditor.prototype.getOptions = function(){
	var opts = false;
	if ($.isNumeric(this.inputs.opacity.val()) && $.isNumeric(this.inputs.lineWeight.val())){

		opts = {
			color:getDataValue(this.inputs.color.find('.selected')).color,
		//	fillColor:getDataValue(this.inputs.fillcolor.find('.selected')).color,
			opacity:this.inputs.opacity.val(),
			weight:this.inputs.lineWeight.val()
		}
	}	

	return opts;
}

lineEditor.prototype.getData = function(){
	var line = {
		items:this.getLine(),
		options:this.getOptions(),
		properties:{
			name:this.inputs.nameinput.val(),
			tags:[]
		},
		type:'polyline'
	}

	if (this._id != undefined){
		line._id = this._id;
	}

	if (this.timeStamp == undefined){
		line.timeStamp = Date.now();
	}else {
		line.timeStamp = this.timeStamp;
	}

	return line;
}

L.Marker.prototype.getPoint = function(){
	return [this._latlng.lat,this._latlng.lng];
}
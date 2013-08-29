// icon creators
function groupIcon(count){
	var _opts = {
			x:64,
			y:64,
			offsetx:32,
			offsety:32,
	},
	cx = _opts.x / 2,
	cy = _opts.y /2,
	cy = cy-16,
	_classes = ['round','markericon','shadow','marker-icon-group'],
	_imgclasses = ['round','markericon'],
	_text = '<h2 style="position:relative;top:'+cy+';" class="groupCount">'+count._childCount+'</h2>',
	_point = '<div class="markericon-point arrow-down"></div>',
	_html = '<div class="marker-icon-group" style="width:'+_opts.x+'px; height: '+_opts.y+'px;">'+_text+'</div>';

	return new L.DivIcon({
		html:_html,
			iconSize:new L.Point(_opts.x,_opts.y),
			iconAnchor:new L.Point(_opts.offsetx,_opts.offsety),
			className:'leaflet-div-icon ' + _classes.join(' '),
	});	
}


function markerIcon(marker){
	var _opts = {
			x:64,
			y:64,
			offsetx:32,
			offsety:80,
	},
	_classes = ['round','markericon','shadow'],
	_imgclasses = ['round','markericon'],
	_style = 'style="width:'+_opts.x+'px; height: '+_opts.y+'px;"',
	_nametext = '<span class="nametext markericon-label shadow">'+getText(marker.properties.name)+'</span>',
	_image = '<img class="'+_imgclasses.join(' ')+'" '+_style+' src="'+getImage(marker.properties.image)+'"></img>'
	_html = '<div class="markericon" '+_style+'>'+_image+'</div><div class="markericon-point arrow-down"></div>';


	if (getText(marker.properties.name) != ''){
		_html += _nametext;
	}
	
	return new L.DivIcon({
		html:_html,
			iconSize:new L.Point(_opts.x,_opts.y),
			iconAnchor:new L.Point(_opts.offsetx,_opts.offsety),
			className:'leaflet-div-icon ' + _classes.join(' '),
	});
}

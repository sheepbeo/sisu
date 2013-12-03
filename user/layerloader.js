var image = function(data){
	for (var i in data){
		this[i]= data[i];
	}

	this._elementClasses = ['border','shadow','container','touchable']
	this._element = $('<div class="imagecontainer"></div>')	
	this._image = $('<img></img>');
}


image.prototype = {
	init:function(){
		this.setImage();
		this.enableTouch();
	},

	show : function(parent){
		if (parent!= undefined){
			parent.append(this.getElement());

		}else {
			$('#wrapper').append(this.getElement());
		}
	},

	getElement : function(){
		return this._touchable;
	},

	setImage : function(){
		this._image.attr('src',dbURL + '/'+ this.path);		
	},

	enableTouch : function(){
		var t = new touchable( this._element )
		this._touchable = t;
	},
}


var itemLoader = {	
	page:function(pg){
			return new page(pg);
	},
	image:function(img){
			return new image(img);
	},
	
	load:function(data,callback){				
		getData(data._id,function(dta){			
			if (itemLoader[dta.type]!=undefined){
				callback(itemLoader[dta.type](dta));
			} else {
				callback(false);
			}

		});
	},
}


// queue loader, loads mulitple items from db
// returns array of results when all items are loaded
var loader = function (items,callback){
	var me = this;
	this.items = items;
	this.callback = callback;
	this.results = Array();
	this.load = function(){
		$.each(items,function(){
			getData(this,function(data){
				me.results.push(data);
				items.shift();
				if (me.items.length == 0){
					me.callback(me.results);
				}
				me.onComplete(data);
			});
		});

	}
	// on single file complete
	this.onComplete = function(data){

	}
	// add more items to queue
	this.add = function(item){
		this.items.push(item);
	}
	this.load();
}


// marker clusterer options
var _clusterOpts = {
		maxClusterRadius:80,
		iconCreateFunction: groupIcon,
		spiderfyOnMaxZoom:false,
		showCoverageOnHover:false,
		zoomToBoundsOnClick:true,
	}

// layerloader
// loads layers for map program to use
// returns leaflet layers for direct use
// all layer data is loaded through this function, for future alternations

var layerLoader = {
	// extend, if for some reason there is a need to dynamically extend loader
	extend : function(name,loader){
		this._loaders[name] = loader;
	},
	
	// commence loading,
	// the return should be leaflet format, if it is not, false is returned
	// this is only checked by data.type, no other
	// checks are performed
	load:function(id,presentation,callback){
		var me = this;
		
		this.presentation = presentation;

		
		getData(id,function(data){
			if (me._loaders[data.type]!=undefined){			
				me._loaders[data.type](data,function(layer){
					layer.id = data._id;
					layer.type = data.type;
					callback(layer);
				});

			} else {
				callback(false);
			}

		});
	},
	loadData:function(data,presentation,callback){
		if (presentation != undefined){
			this.presentation = presentation;
		}		
		this._loaders[data.type](data,callback);
	},
	// TODO: check data integrity, add error handling
	_loaders:{
		itemcollection:function(data,callback){
			loadItemCollection(data,function(collection){
				var layer = new L.LayerGroup();
				var me = this;

				layer._id = data._id;
				layer.properties = data.properties;
				layer.type = 'itemcollection';

				if (data.properties.bounds){
					if (data.properties.bounds.enabled == true || data.properties.bounds.enabled == 'true'){
						var bbx = new L.LatLngBounds(data.properties.bounds.coordinates);

						layer.bounds = bbx;
					}
				}

				for (var i =0 ; i<collection.items.length; i++) {
					if (typeof(layerLoader._loaders[collection.items[i].type])=='function'){
						layerLoader._loaders[collection.items[i].type](collection.items[i], function(l){							
							if (l != false){
								layer.addLayer(l);
							}
						});
					}
				}

				var sidebar = $('<div id="sidebar-content" style="position:absolute; right:0px; top:0px; background:white; padding:10px;">Sidbar:</div>');
				$('#sidebar-content').remove();
				$('#wrapper').append(sidebar);
				var buttonNext = $('<div id="buttonNext-sidebar">Next</div>');
				
				// get page view on slide bar
				if (collection.properties.pagelinked != undefined && collection.properties.pagelinked._id != undefined) {
					getData(collection.properties.pagelinked._id, function(page) {
						if (page != undefined) {
							var pagecontent = pagebuilder.plainContent(page);
							//console.log(pagecontent);
							sidebar.append(pagecontent.html());

							sidebar.append(buttonNext);
						}

					});
				}

				// next button link to next slide
				if (collection.properties.nextSlide != undefined && collection.properties.nextSlide._id != 'NONE') {
					buttonNext.on("click", function() {

						layerLoader.presentation._map.removeLayerById(layer._id);

						var target = collection.properties.nextSlide;
						layerLoader.presentation.showItem(target, function(result) {

							if (result) {
								layerLoader.presentation._fire('addlayer', target);
							} else {
								layerLoader.presentation._fire('removelayer', target);
							}
						});
					});
				} else {
					buttonNext.css('display', 'none');
				}
				
				layerLoader.presentation.itemGroup = layer;
				callback(layer);
			});
		},
		// create map overlay image from dataset
		imageoverlay:function(data,callback){
			
			var bounds = new L.LatLngBounds(data.coordinates);
			var image = getFullImage(data.properties.image);
			var layer = new L.ImageOverlay(image,bounds,{opacity:data.properties.opacity/100});
			layer.properties = data.properties;
			layer.type = 'imageoverlay';
			callback(layer);
		},

		// polyline, wich is just an array of numbers
		polyline:function(data,callback){
			var layer = new L.Polyline(data.items,data.opts);
			layer.type = 'polyline';
			layer.properties = data.properties;
			callback(layer);
		},

		marker:function(data,callback){
			var point = new L.LatLng(data.coordinates.lat,data.coordinates.lng),
				marker = new L.Marker(point);

			marker.properties  = data.properties;
			
			
			var img = getImage(data.icon);			
			var css = '';
			var icon = getIcon(data.markericon);
			var style = layerLoader.presentation._style.presentation.markerstyle;

			for (var i in icon.css){
				css += i +':'+icon.css[i] +';';
			}

			var divimg = '';
			var textcontainer = '';
			if (data.properties.description){
				textcontainer= '<div class="marker-textcontainer"><div class="arrow-small-left"></div><p class="marker-text" ></p></div>';
			}

			if (data.icon.name != '' && data.icon.name != 'image'){
				divimg = '<img class="marker-icon-image" style="'+css+'" src="'+img+'"></img>';
			} 
			
			var html = '<div style="position:relative;overflow:hidden;background-image:url('+markerIconsURL+'/'+icon.icon.url+'); width:'+icon.icon.size[0]+'px; height:'+icon.icon.size[1]+'px" class="marker-icon-imagecontainer">'+divimg+'</div>';
			html += textcontainer;

			if (getText(data.properties.name) != ''){
				html += '<div class="hide-on-zoom arrow-small-up"></div>';				
				html += '<span class="hide-on-zoom marker_name_text">'+getText(data.properties.name)+'</span>';
			}

			var micon = new L.divIcon({
				iconSize:icon.icon.size,
				iconAnchor:icon.icon.offset,
				className:'marker-icon '+data._id +' '+style,
				html:html
			});

			marker._id = data._id;
			marker.properties = data.properties;
			marker.properties.action = 'showFromMarker';
			marker.properties.target = data.target;

			if (data.target._id == undefined){
				if (data.properties.description){
					marker.properties.action = 'showtext';
					marker.properties.target = data.properties.description;
				}
			}

			marker.setIcon(micon);
			layerLoader.presentation.setAction(marker);
			
			callback(marker);
		},
	

		// map limiter (LatLngBounds)
		boundingbox:function(data,callback){
			if (data.type == 'boundingbox'){
				var layer = new L.LatLngBounds(data.coordinates);
				callback(layer);
			} else {
				callback(false);
			}
		},

		// creates a Leaflet tilelayer
		tilelayer:function(data,callback){
			var layer = new L.TileLayer(data.url,data.opts || {});
			layer.type = 'tilelayer';
			if ($.isNumeric(data.opacity)){
				layer.setOpacity(data.opacity);
			}
			callback(layer);
		},
	}
}

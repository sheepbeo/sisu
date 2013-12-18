/*
	presentation, the main program disguised as an object
	with prototypes and stuff.
	(so i may have many of these maybe....)


	new presentation(id) immediately inits loading of data from es database
	and subscribes to  certain map events
*/
var presentation = function(id,opts){
	this._minTextZoom = 12;

	var me = this;
	this.id = id;
	this.pane = 'wrapper';
	this._resetIndex = [];
	this._listeners = [];

	if (opts == undefined){
		opts = {}
	}
	this._opts = opts;
	this._mapLayerTypes = ['itemcollection','markerlayer','boundingbox','overlay','tilelayer','marker','polyline'];

	this._mapOptions = {
					doubleClickZoom:false,
					scrollWheelZoom:true,
					boxZoom:false,
					zoomControl:false,
					worldCopyJump:true,
					markerZoomAnimation:true,
					zoomAnimation:true,
					fadeAnimation:true,
					minZoom:0,
					maxZoom:18,
					inertiaDeceleration:2000,
					inertiaMaxSpeed:1500,
					inertiaThreshold:32
				},
	this._map = new map(this,this._mapOptions);	
	resize.add(function(){me.scale()})
	this.load();
	this.history = new history(this);

	this.on('addlayer',function(layer){
		me.history.add(layer);
	});

	this.on('removelayer',function(layer){
		me.history.add(layer);
	});

}

presentation.prototype = {
	getState : function(){
		var state = {
			map:this._map.getState(),
			location:window.location,
		}
		return state;
	},
	setState:function(state){
		if (state){			
			this._map.setState(state.map);
			return true;
		}
	},

	scale : function(){
		if (this._list!=undefined){
			this._list.scale();
		}

		if (this._mainmenu!=undefined){
			this._mainmenu.scale();
			this._mainmenu.setSize(this._style.getStyle('mainmenu'));
			//this._mainmenu.setStyle(this._style.getStyle('mainmenu'));
			//this._mainmenu.setButtonStyle(this._style.getStyle('buttons'));
		}

		this._map.scale();	
	},

	getLanguage : function(){
		return this._opts.lang;
	},

	isMapLayer : function(layer){	
		var found = false;
		for (var i in this._mapLayerTypes){
			if (this._mapLayerTypes[i] == layer.type){
				found = true;
			}
		}
		return found;
	},
	
	// initalize breadcrumbs
	initBreadcrumbs : function(){
		this._list.setOffset(this._style.getMenuOffset());
		this._list.setStyle(this._style.getStyle('breadcrumbs'));
		this._list._style = this._style;
	},

	// refresh breadCrumbs list (fired on layer change)
	refreshList : function(){
	
		//var list = this._map.getLayerList();
		var list = this.history.getList();
		if (this._list != undefined){
			this._list.setList(list);	
			this.initBreadcrumbs();			
		}
		if (this._mainmenu!=undefined){
			this._mainmenu.updateSelected(list);
		}
		
	},

	// refresh
	rf : function(d){
		console.log('asdfaslkdflkasjd ljsadlf jsadj fljasdlfklas jlzdfl skladjf lsjadlf jaslkdfjlasjdlkjlajljasdlfkjasldkf')
	},


	//select appropriate action for an item, in this case marker,
	//menubuttons etc are capable of setting their actions on their own
	setAction : function(item){
		var me = this;
		if (item.properties.action != undefined){		
			item.on('click',function(){			
				me.action(item.properties.action,item.properties.target,item);
			});			
		}
	},

	// when an action is taken from either menu button, marker etc
	// this should guide the action to take correct functionality
	action : function(action,target,context,callback){
		var me = this;	

		if (isPresentationItem(target) && target.type != 'NONE' && target._id != 'NONE' || action == 'showtext'){
	
			var caller = function(data){
				if (typeof(callback) == 'function'){
					callback(data);
				}
			}
			
			if (target.name == undefined){
				if (context.text){
					target.name = context.text;
				} else if (context.properties.name){
					target.name = context.properties.name;
				}
			}

			switch (action){
				case 'show':
				case 'toggle':
					this.showItem(target,function(result){						
						
						if (result){
							me._fire('addlayer',target);
						} else {
							me._fire('removelayer',target);
						}
						caller(result);
					});
				break;
				case 'showasview':			
					var text = '';
					if (this.isMapLayer(target)){
						if (context.type == 'menuitem'){
							text = getText(context.text);
						} else {
							if (context.properties){
								text = getText(context.properties.name);
							}
						}
						me._map.showAsView(target,function(result,view){
							caller(result);

							if (result){						
								me._fire('addlayer',target);
								me.showBackPane(text,function(){
									me._map.hideLayer(target._id);
									me._fire('removelayer',target);
								});
							} else {
								me._fire('removelayer',target);
							}
						});
					} else {
						this.showItem(target,caller);
					}
				break;

				case 'showFromMarker':
					me._map.clearLayers();
					me.showItem(target,function(result){
						if (result){
							me._fire('addlayer',target);
						} else {
							me._fire('removelayer',target);
						}
						caller(result);
					});

				break;

				case 'showonly':					
					if (target.type == 'itemcollection'){						
						me._map.showOnly(target._id,function(result){
							if (result){
								me._fire('addlayer',target);
							} else {
								me._fire('removelayer',target);
							}						

							caller(result);
						});
					} else {
						this.showItem(target,function(result){
							caller(result);
						});
					}

				break;
				case 'showtext':										
					if (context.getLatLng){
						var e = $('.'+context._id).find('.marker-textcontainer');
						
						if (e.hasClass('visible-hide-text')){
							this.hideTexts();
							context.setZIndexOffset(0);
						} else {
							context.setZIndexOffset(100);
							
							this.hideTexts();
							this._resetIndex.push(context);
							
							var point = context.getLatLng();
							var zoom = this._map._map.getZoom();
							var state = this._map.getState();
							this._map._map.setView(point,zoom);
							e.addClass('visible-hide-text');					
							e.find('p').text(getText(target));
						}
					}


				break;
			}
		}
	},
	hideTexts:function(){
		for (var i in this._resetIndex){
			this._resetIndex[i].setZIndexOffset(0);
			delete this._resetIndex[i];
		}
		$('.visible-hide-text').removeClass('visible-hide-text');
	},
	showLayerInfo:function(data){

		if (data.name && data.description){
			var name = getText(data.name),
				desc = getText(data.description);

			var e = $('<div class="layerInfoDisplay"></div>');
			e.append('<h4>'+name+'</h4>').append('<p>'+desc+'</p>');

			$('#'+this.pane).append(e);

			e.css({
				position:'absolute',
				left:(window.innerWidth/2)-(e.outerWidth(true)/2),
				top:'0px',
			});

			return true;
		} else {
			return false;
		}
	},
	hasInfo:function(){
		if ($('.layerInfoDisplay').length > 0){
			return $('.layerInfoDisplay');
		} else {
			return false;
		}
	},
	// shows some item, any item
	showItem : function(item,callback){	
		var me = this;

		if (isObj(item)){
			// if item is a map layer, then it will be shown  on map,
			// the map controller has its own loading functions
			// no action is required here
			if (this.isMapLayer(item)){
				this._map.showLayer(item._id,function(result){
					if (me.hasInfo()){
						var info = me.hasInfo();
						info.remove();


					}

					if (result){
						
						var layer = me._map.getLayer(item._id);
						if (layer.properties){
							me.showLayerInfo(layer.properties);
						}

					}
					callback(result);
				});	
			} else {
				//if not maplayer itemLoader gets the item
				// (layerloader.js)
				itemLoader.load(item,function(ditem){					
					ditem.show();
				});			
			}
		} else {
			if (typeof(callback) == 'function'){
				callback(false);			
			}
		}
	},


	// load presentation data
	load : function(id){		
		var me = this;		
		if (id || this.id){
			if (id) this.id = id;
			loadPresentation(this.id,function(data){					
				if (data){
					me.data = data;
					me.setItems(data);
				} else {
					return false;
				}
			});
		}
	},

	error:function(msg){
		console.log(msg);
	},

	// set some items, like mainmenu, style and limiter
	setItems : function(data){
		var me = this;
		this._map.setBaseLayer(data.properties.map);

		if (true) { //!TODO change this to data.properties.hasMinimap
			this.buildMinimap(data.properties.map);
		}
		
		if(data.properties.overviewslide) {
			this._overviewslide = data.properties.overviewslide;
		} else 
			alert("A presentation does not have a landing slide, but must have!");

		if(data.properties.termsandconditions) {
			this._termsandconditions = data.properties.termsandconditions;
		}

		if (data.properties.theme){
			this._style = new style(data.properties.theme);
		} else {
			this.error('no theme is set');
		}
		
// 		if (this._style.showLogo()){
// 			this.buildLogo();
// 		}
	
		if(data.properties.menu){
			var menustyle = this._style.getStyle('mainmenu').data.style;
			
			//if (menustyle == 'buttons'){
			this._mainmenu = new menu(data.properties.menu);
			//} else if (menustyle == 'draggable'){
			//	this._mainmenu = new dragmenu(data.properties.menu);
			//}
		}

		if (data.properties.limiter){
			if (data.properties.limiter.enabled == true || data.properties.limiter.enabled == 'true'){
				this._map.setLimiter(data.properties.limiter.coordinates);
			}
		}

		this.ready();
	},

	buildMinimap: function(mapName) {
		// snippet for quick adding minimap onto the server
		
		var mapData = tileLayers[mapName];
		/*
		var osmUrl= 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		var osmAttrib='Map data &copy; OpenStreetMap contributors';
		var osm2 = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: 13, attribution: osmAttrib });
		*/

		var osm2 = mapData.map();
		var miniMap = new L.Control.MiniMap(osm2, { width: '240', height:'171', position:'bottomleft',toggleDisplay: true }).addTo(this._map._map);
	},
	
	buildLogo:function(){
		var me = this;
		var e = $('<div id="logo" class="small-shadow logocontainer" />'),
			img = getImageElement(this.data.properties.image,[64,64]);

			if (this._style.presentation.showbackbutton == 'true' || this._style.presentation.showbackbutton == true){
				var text = $('<a href="index.html"><h2>'+getText(this.data.properties.name)+'</h2></a>');
			} else {
				var text = $('<a href="index.html?'+escape(this.data.properties.name)+'"><h2>'+getText(this.data.properties.name)+'</h2></a>');
				text.append('<p class="smallLogoText">'+this.data.properties.description+'</p>');
			}

			e.append(img).append(text);
			e.addClass(this._style.presentation.logoposition);
			this.addToPane(e);
	},
	addToPane : function(element){
		$('#'+this.pane).append(element);
	},
	showBackPane:function(text, onclick){
		if (this._mainmenu){
			var me =this;
			var backpane = $('<div class="backpane" />');
			var menu = $('.mainmenu');
			
			menu.addClass('menu hidden-left');
			$('.menu').append(backpane);


			backpane.css({
				position:'absolute',
				top:0,
				left:0,
				width:menu.width(),
				height:menu.height(),
			});

			backpane.append('<h3>'+text+'</h3>');

			onTap(backpane);

			backpane.click(function(e){
				e.stopPropagation();

				onclick();
				
				backpane.remove();
				menu.removeClass('hidden-left');
				//$('#buttonscroll').removeClass('hidden').css('display','block');
			});
		}
	},

	menuSelectButton:function(id,is){
		if (this._mainmenu != undefined){			
			this._mainmenu.selectButton(id,is);
		}
	},
	// fired when all loading is completed
	getTextVisibility:function(){
		var zoom = this._map.getState().zoom;
		if (zoom < this._minTextZoom){
			return false;
		} else {
			return true;
		}
	},
	hideItems:function(show){		
		if (!show){
			$('.hide-on-zoom').addClass('hidden');
		} else {
			$('.hide-on-zoom').removeClass('hidden');
		}
	},
	chkItemVisible:function(){
		this.hideItems(this.getTextVisibility());
	},
	ready : function(){
		var me = this;
		
		this._map.on('removelayer',function(e){	
			if (e){
				me.menuSelectButton(e._id,false);
			}
		});
		this._map.on('addlayer',function(e){
			me.menuSelectButton(e._id,true);
			//me.chkItemVisible();
		});

		this._map._map.on('zoomend',function(e){
			me.chkItemVisible();
		});

		if (this._opts.breadcrumbs != false && this._style.showBreadcrumbs() != false){
			this._list = new breadCrumbs(); // new breadcrumbs object
			this.initBreadcrumbs();	
			this._list.on('click',function(id){ // breadcrumbs list item click
				/*
				me._map.hideLayer(id);
				if (me._mainmenu!=undefined){
					me._mainmenu.selectButton(id,false);				
				}
				*/
				//me.showItem(id);
			});

			/*
			this._map.on('layeradd',function(evt){ // layer is added to map, update breadcrumbs list
				me.refreshList();
			});
			this._map.on('layerremove',function(evt){ // and when removed
				me.refreshList();
			});
			*/
			this.on('addlayer',function(){
				me.refreshList();
			});

			this.on('removelayer',function(){
				me.refreshList();
			});
			// add breadcrumbs to map pane
			this.addToPane(this._list.getElement());
		}
			
		if (this._mainmenu != undefined && this._style.showMainmenu() != false){		
			this._mainmenu._style = this._style;
			this._mainmenu.setStyle(this._style.getStyle('mainmenu'));
			this._mainmenu.setButtonStyle(this._style.getStyle('buttons'));
			this._mainmenu.setActions(this);
			this._mainmenu.show();
		}
		
		$('#TermNCondLink').appendTo('.leaflet-bottom.leaflet-left:first');
		// attach the terms and conditions page to the link:
		$('#TermNCondLinkText').click(function() {
			if (me._termsandconditions != undefined) {
				me.action("showonly", {_id: me._termsandconditions, type: "page"}, {properties:{}});
			}
		});

		//go to langing slide - first slide
		this.action("showonly", {_id: this._overviewslide, type: "itemcollection"}, {properties:{}});		
	},


	// presentation start
	// all initialization has been completed and the show is now ready to go on (it must)
	start : function(){

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





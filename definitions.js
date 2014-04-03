var presentation_actions = ['toggle','showasview','showonly',''];
var itemcollection_transition_types = ['instant', 'zoom-pan-zoom', 'pan'];

var dbURL = 'http://touch.mobile.metropolia.fi/es/susi';
var baseURL = 'http://touch.mobile.metropolia.fi/es';
var repositoryURL = 'http://touch.mobile.metropolia.fi/es/susi/marker/';
// var dbURL = 'http://localhost:9200/susi';
// var baseURL = 'http://localhost:9200';
// var repositoryURL = 'http://localhost:9200/susi/marker/';

var IMGURL = 'http://touch.mobile.metropolia.fi/image.php';
var IMGFOLDER = 'http://touch.mobile.metropolia.fi/img/';
var iconURL = 'http://touch.mobile.metropolia.fi/icons/';
var musicURL = 'http://touch.mobile.metropolia.fi/music/';
var PAGESTYLES = ['normal','page','gallery'];
var markerIconsURL = 'markericons';

// idle time counted for refreshing the presentation
var refresh_idle_time = 300; // in seconds

var markericons = [
	{
		name:'square white',
		icon: {
			url:'marker_square_white_128.png',
			offset:[85,200],
			size:[200,200]
		},
		_id:'markericon_square_white',
		css:{
			'width':'165px',
			'height':'126px',
			'border-radius':'0px',
			'position':'absolute',
			'top':'17px',
			'left':'17px'
		},

		textcss:{
			'bottom': '26px'
		}
	},
	{
		name:'Gray square',
		icon:{
			url:'marker_square_gray64.png',
			offset:[32,64],
			size:[64,64]
		},
		shadow:{
			url:'marker_square_gray64_shadow.png',
			offset:[32,64],
			size:[64,64]
		},
		_id:'markericon_square_gray',
		css:{
			'width':'42px',
			'height':'40px',
			'border-radius':'0px',
			'position':'absolute',
			'top':'7px',
			'left':'11px'
		}

	},
	{
		name:'Gray round',
		icon:{
			url:'marker_round_gray64.png',
			offset:[32,64],
			size:[64,64]
		},
		_id:'markericon_round_gray',
		css:{
			'width':'42px',
			'height':'40px',
			'border-radius':'40px',
			'position':'absolute',
			'top':'6px',
			'left':'11px'
		}
	},

	{
		name:'Blue square',
		icon:{
			url:'marker_square_blue64.png',
			offset:[32,64],
			size:[64,64]
		},
		_id:'markericon_square_blue',
		css:{
			'width':'42px',
			'height':'40px',
			'border-radius':'0px',
			'position':'absolute',
			'top':'7px',
			'left':'11px'
		}

	},
	{
		path:'img',
		name:'Red square',
		icon:{
			url:'marker_square_red64.png',
			offset:[32,64],
			size:[64,64]
		},
		_id:'markericon_square_red',
		css:{
			'width':'42px',
			'height':'40px',
			'border-radius':'0px',
			'position':'absolute',
			'top':'7px',
			'left':'11px'
		}

	},
	{
		name:'Green square',
		icon:{
			url:'marker_square_green64.png',
			offset:[32,64],
			size:[64,64]
		},
		_id:'markericon_square_green',
		css:{
			'width':'42px',
			'height':'40px',
			'border-radius':'0px',
			'position':'absolute',
			'top':'7px',
			'left':'11px'
		}

	}



]

var tileLayerOptions = {
				updateWhenIdle:true,
				tileSize:256
			}

var tileLayers = {
	/*
				google:{
						name:'Google maps tiekartta',
						description:'Googlen karttapalvelut',
						image:'google_maps_logo.jpg',				
						map:function(){
									var layer = new L.Google('ROADMAP');
									return layer;
							}
				},
				googleterrain:{
						name:'Google maps maastokartta',
						description:'Googlen karttapalvelut',
						image:'google_maps_logo.jpg',				
						map:function(){
									var layer = new L.Google('TERRAIN');
									return layer;					
						}
				},
				googlesatellite:{
						name:'Google maps satelliitti',
						description:'Googlen karttapalvelut',
						image:'google_maps_logo.jpg',				
						map: function(){
									var layer = new L.Google('SATELLITE');
									return layer;					
						}
				},
	*/
	//88265298bb2d4874a18dea0e4b817e64
	/*
				cloudmade:{
					name:'Cloudmade',
					description:'Cloudmade mapping services, commercial license',
					image:'cloudmade_logo.jpg',
					map:function(){
						var layer = new L.TileLayer('http://{s}.tile.cloudmade.com/88265298bb2d4874a18dea0e4b817e64/997/256/{z}/{x}/{y}.png',tileLayerOptions);
						return layer;
					}
				},
	*/
	
				mapbox: {
					name:'MapBox',
					description:'Mapbox mapping service, commercial license',
					image:'',
					map:function(){
						var layer = new L.TileLayer('https://{s}.tiles.mapbox.com/v3/mapoutanen.hm3emn52/{z}/{x}/{y}.png', tileLayerOptions);
						return layer;
					}
				},
				
				mapbox_old: {
					name:'MapBox',
					description:'Mapbox mapping service, commercial license',
					image:'',
					map:function(){
						var layer = new L.TileLayer('https://{s}.tiles.mapbox.com/v3/kettula.ggkmnf24/{z}/{x}/{y}.png', tileLayerOptions);
						return layer;
					}
				},
				
				mapboxtest: {
					name:'MapBoxTest',
					description:'Mapbox mapping service, commercial license',
					image:'',
					map:function(){
						var layer = new L.TileLayer('https://{s}.tiles.mapbox.com/v3/susimap.h45eflg4/{z}/{x}/{y}.png', tileLayerOptions);
						return layer;
					}
				},
				
				cloudmade:{
					name:'Cloudmade',
					description:'Cloudmade mapping services, commercial license',
					image:'cloudmade_logo.jpg',
					map:function(){
						var layer = new L.TileLayer('http://{s}.tile.cloudmade.com/0ff1ddf9bd18447db4dc9f1c37bd3667/997/256/{z}/{x}/{y}.png',tileLayerOptions);
						return layer;
					}
				},
				mapquest:{
					name:'mapQuest',
					description:'Mapquest openStreetMap base layer',
					image:'MQ_Icon_Large.png',
					map:function(){
							var opts = $.extend(tileLayerOptions,{subdomains: [1,2,3,4]});
							var layer = new L.TileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',opts);
							return layer;
					}
				},
				/*
				mapquestsatellite:{
					name:'mapQuest satellite imagery',
					description:'Mapquest openStreetMap',
					image:'MQ_Icon_Large.png',						
					map:function(){
							var opts = $.extend(tileLayerOptions,{subdomains: [1,2,3,4]});
							var layer = new L.TileLayer('http://oatile{s}.mqcdn.com/naip/{z}/{x}/{y}.jpg',opts);
							return layer;
					}

				},
				*/
				msaerial:{
						name:'Microsoft aerial imagery',
						description:'Bing maps aerial',
						image:'bing-downtown-san-diego-250x250.jpg',
						map:function(){
							var layer = new L.BingLayer("AknWxnuhEculwqZVnAOZ8IINcG08774F5tmeyEnHbEzIwYwvXH2LUJg0JWBIX-uv");
							return layer;
						}
				},
				msroadmap:{
						name:'Microsoft bing roadmap',
						description:'Bing maps roadmap',
						image:'bing-downtown-san-diego-250x250.jpg',
						map:function(){
							var layer = new L.BingLayer("AknWxnuhEculwqZVnAOZ8IINcG08774F5tmeyEnHbEzIwYwvXH2LUJg0JWBIX-uv",{type:'road'});
							return layer;
						}
				},				
	
				openstreetmap:{
					name:'openStreetMap',
					description:'Open street map, free, opensource maps',
					image:'Openstreetmap_logo.svg',
					map:function(){
							var layer = new L.TileLayer('http://a.www.toolserver.org/tiles/osm/{z}/{x}/{y}.png',tileLayerOptions);
							return layer;
						}
				},
				flsbasemap:{
					name:'Maanmittauslaitos Basemap',
					description:'finnish landscape survey basemap layer',
					image:'mml_logo.png',
					map:function(){
							var layer = new L.TileLayer('http://tiles.kartat.kapsi.fi/peruskartta/{z}/{x}/{y}.jpg',tileLayerOptions);
							return layer;
						}
				},				
				flsbackgroundmap:{
					name:'Maanmittauslaitos Taustakartta',
					description:'finnish landscape survey background map',
					image:'mml_logo.png',
					map:function(){
							var layer = new L.TileLayer('http://tiles.kartat.kapsi.fi/taustakartta/{z}/{x}/{y}.jpg',tileLayerOptions);
							return layer;
						}
				},
				flsaerial:{
					name:'Maanmittauslaitos Ilmakuva',
					image:'mml_logo.png',
					map:function(){
							var layer = new L.TileLayer('http://tiles.kartat.kapsi.fi/ortokuva/{z}/{x}/{y}.jpg',tileLayerOptions);
							return layer;
						}
				},
				/*		
				testi:{
					name:'KANADA',
					description:'',
					image:'Public-images-osm_logo.png',
					map:function(){
														//http://ntile1.navici.com/t/retkikartta/maps/2393x264.639239x47x98.png										
							var layer = new L.TileLayer('http://ntile1.navici.com/t/retkikartta/maps/2393x794.034895x{z}x{x}.png?cid=a9e9a1840ee69e32d59af86dd1ffeb44',presentation.map.tileLayerOptions);
							return layer;
						}
				},*/		

				
		}



function onTap(e,callback){
	if (e instanceof jQuery){
		e = e[0];
	}

	if (Modernizr.touch){
		e.addEventListener('touchstart',function(evt){
			evt.stopPropagation();
			var time = Date.now();

			var tend = function(evt){
				if (Date.now()-500 < time){
	
					if (typeof(callback) == 'function'){
						callback(evt);
					} else {
						
					$(e).trigger('click');
					}
				}

				e.removeEventListener(tend);

			}

			e.addEventListener('touchend',tend);

		});
	}
}

function getIcon(id){
	for (var i in markericons){
		if (markericons[i]._id == id){
			return markericons[i];
		}
	}
}

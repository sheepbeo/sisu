var presentation_actions = ['show','showasview','showonly'];

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
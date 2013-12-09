
var select = {
	basemaplayer:function(){
		var e = new basemapselect();
		e.show();
	},
	theme:function(){
		var e = new styleEditor(function(data){
			actions.setTheme(data);
		});

		if ($('#theme').attr('data-result') != undefined){
			getData($('#theme').attr('data-result'),function(data){
				e.load(data);				
			});
		}

		e.show();
	},
	menu:function(){		
		var e = new menuEditor(function(result){
			actions.setMenu(result);
		});


		e.applyOverlay();
		e.show();



		if (actions.menu == false){
			//e.getButtons();
		} else {
			e.load(actions.menu);
		}
	},
	limiter:function(e,data){
		if ($('#maplimiter').hasClass('green')){
			this.setLimiter(false);
		} else {
			if (actions.boundsLayer == undefined){
				actions.boundsLayer = new L.LayerGroup();
			}

			if (!map.hasLayer(actions.boundsLayer)){
				if (actions.boundsEditor==undefined){
					actions.boundsEditor = new boundsEditor(actions.boundsLayer,{color:'#d00',weight:16,opacity:1});
					
					
					if (data){												
						if (data.type == 'boundingbox'){
							actions.boundsEditor.load(data);
						} else actions.boundsEditor.setBounds(map.map.getBounds().unpad(8));
					} else actions.boundsEditor.setBounds(map.map.getBounds().unpad(8));


				}

				map.addLayer(actions.boundsLayer);
				this.setLimiter(true);				
			}
		}
	},
	setLimiter:function(is){
		if (is){			
			$('#limiter_status').text('enabled');
			$('#maplimiter').addClass('green');

			if (!map.hasLayer(actions.boundsLayer)){
				map.addLayer(actions.boundsLayer);
			}
		} else {
			map.removeLayer(actions.boundsLayer);

			$('#limiter_status').text('disabled');
			$('#maplimiter').removeClass('green');
		}
	},
	
	overviewslide: function() {
		var e = new overviewslideselect(function(id) {
			actions.selectOverviewSlide(id);
		});
		e.show();
	},

	termsandconditions: function() {
		var e = new termsandconditionsselect(function(id) {
			actions.selectTermsAndConditions(id);
		});
		e.show();
	}
};

var actions = {
		items:Array(),
		editor:false,
		menu:false,
		theme:false,
		layerList : new list('',{draggable:true,addClass:'itemlistitem'}),
		getName:function(){
			var text = $('#title').text();
			if (text){
				return text;
			} else {
				return 'error';
			}
		},
		setImageInput:function(){
			this.titleImage = new imgInput();
			$('#header').prepend(this.titleImage.element);
		},
		pageedit:function(id){			
			var page = this.getItem(id);
			//page.editor = this.editors.page();
			//page.editor.load(page);
			page.editor.applyOverlay();
			page.editor.show();			
		},
		getTheme:function(){
			if ($('#theme').attr('data-result') != undefined){
				return $('#theme').attr('data-result');
			} else {
				return '';
			}
		},
		setTheme:function(data){
			var me = this;
			if (typeof(data) == 'string'){			
				getData(data,function(result){
					me.setTheme(result);
				});
			} else if (data.type == 'style'){
				$('#theme').attr('data-result',data._id);
				$('#themename').text(data.properties.name);
				this.theme = data;
			}
		},
		setMenu:function(data){	
			if (typeof(data)=='string')	{
				var me = this;

				getData(data,function(menudata){
					me.setMenu(menudata);
				});

			} else if (data.type == 'menu'){
				$('#menuname').text(data.properties.name);
				$('#menu').attr('data-result',data._id);
				this.menu = data;
			} else {
				return false;
			}
		},
		dropImage:function(e){
			var point = map.map.mouseEventToLatLng(e);
			var me = this;

			if (this.editor == false){				
				alert('create an item collection first');	
			} else {
				me.editor.dropItem(e);
			}
		},
		editors:{
			page:function(){return new pageEditor();},
			itemcollection:function(){return new layerEditor();},
			overlay:function(){return new overlayEditor();}
		},
		createItem:function(type){
			var editor = false;
			switch(type){
				case 'pages':
					editor = new pageEditor();
				break;				
			}
			if (editor != false){
				editor.applyOverlay();
				editor.show();

				var me = this;
				editor.on('save',function(){
					me.addItem(editor.getListItem());
				});
			}
		},
		hasItem:function(item){
			var found = false;
			for (var i in this.items){
				if (this.items[i]._id == item._id){
					found= this.items[i];
				}
			}

			return found;
		},
		addItem:function(item){
			var me = this;
			if (item != false && item!=undefined && !this.hasItem(item)){
				this.items.push(item);
				this.layerList.addItem(item);
			}
		},
		getItem:function(id){
			var found = false;
			for (var i in this.items){
				if (this.items[i]._id == id){
					found = this.items[i];
				}
			}
			return found;
		},
		editoradd:function(type,e){
			if (type){
				this.editor.setEditor(type);
				if (e.attr('data-action-type') == 'toggle'){
					this.selectToolbarButton(e);
				}
			} else {
				map.click = function(){
					return false;
				}
			}
		},
		editorSetBounds:function(is){			
			var btn = $('#layertools').find('[data-action="editorToggleBounds:bounds"]');
			if (is){
				btn.addClass('selected');
			} else {
				btn.removeClass('selected');
			}
		},
		editorToggleBounds:function(type,e){
			var result = this.editor.toggleBounds();
			if (result) {
				this.selectToolbarButton(e);
			} else {
				this.unselectToolbarButton(e);
			}
		},
		selectToolbarButton:function(button){
			button.parent().find('.selected').removeClass('selected');
			button.addClass('selected');
		},
		unselectToolbarButton:function(button){
			button.removeClass('selected');
		},
		select:function(what,attr){
			select[what](attr);
		},
		showtoolbar:function(id){
			$('#toolbar').children().hide();
			$('#toolbar').children().find('.selected').removeClass('selected');
			$('#'+id).show();
			$('#'+id).find('.selected').removeClass('selected');
		},
		toggle:function(id){
			$(id).toggle();
		},
		layeredit:function(id){
			var l = this.getItem(id);
			if (l != undefined && l!=false){

				if (this.editor){
					this.editor.close();
				}
				this.editor = l.editor;
				this.editor.edit();
				return true;
			} else {
				return false;
			}
		},
		layertoggle:function(id,button){
			var item = this.getItem(id);
			if (item != false){
				var result = item.layer.toggle();				
				if (result == false && item.editor == this.editor ){
					this.editor.hide();
				}
				return result;
			}
		},
		itemdelete:function(id){			
			if (confirm('remove this item?')){
				var found = false;
				for (var i in this.items){
					if (this.items[i]._id == id){
						this.items[i].editor.remove();
						this.layerList.removeItem(this.items[i]);
						if (this.items[i].layer != undefined){
							map.removeLayer(this.items[i].layer);
						}
						delete this.items[i];
					}
				}			
				return found;
			}
		},
		showEditor:function(){
			this.editor.setEditor();
			this.hidewindows();			
			this.editor.show();			
		},
		addLayer:function(){
			var me = this;
			this.editor = this.editors.itemcollection();//new layerEditor();
			this.showEditor();
			this.editor.edit();
			this.editor.on('add',function(editor){
				var item = editor.getListItem();				
				me.addItem(item);				
				actions.showwindow('layers');
				delete me.editor;
				me.editor = false;
			});
		},
		hidewindows:function(){			
			$('.border-toggler').each(function(){
				$(this).parent().addClass( $(this).parent().attr('data'));
			});

			$('.itemwindow').each(function(){
				$(this).addClass($(this).attr('data'));
			});
		},
		getwindowstate:function(){
			//  todo
		},
		togglewindows:function(){
			// todo
		},
		showwindow:function(id){
			$('#'+id).removeClass($('#'+id).attr('data'));
		},
		showwindows:function(){
			$('.border-toggler').each(function(){
				$(this).parent().removeClass( $(this).parent().attr('data'));
			});

			$('.itemwindow').each(function(){
				$(this).removeClass($(this).attr('data'));
			});

		},
		showListWindow:function(){
			var e = $('#layers');

			if (e.hasClass(e.attr('data'))){
				e.removeClass(e.attr('data'));
			}
		},
		selectbasemap:function(name){
			var e = $('#basemap');
			$('#basemapname').text(name);
			$('#basemapimage').attr('src','img/'+tileLayers[name].image);
			$('#basemapdescription').text(tileLayers[name].description);

			e.attr('data-result',name);

			map.setbaselayer(name);
		},
		selectOverviewSlide: function(id) {
			getData(id, function(data) {
				$('#overviewslidename').text(data.properties.name.fin);
			});
			$('#overviewslide').attr('data-result',id);
		},

		selectTermsAndConditions: function(id) {
			getData(id, function(data) {
				$('#termsandconditionsname').text(data.properties.name.fin);
			});
			$('#termsandconditions').attr('data-result',id);
		},

		loadItem:function(id){
			if (id instanceof Array){
				for (var i in id){
					this.loadItem(id[i]);
				}
			} else {
				var me = this;
				if (id instanceof Array){
					for (var i in id){
						this.loadItem(id[i]);
					}
				} else if (typeof(id) == 'string'){

					getItem(id,function(item){
						
						if( typeof(me.editors[item.type]) == 'function'){
							var editor = me.editors[item.type]();
							editor.load(item);
							me.addItem(editor.getListItem());
							if (editor.setEdit){
								editor.setEdit(false);	
							}
						} else {
							return false;
						}

					});
				}
			}
		},
		loadProject:function(id){
			var me = this;
			if (id instanceof Array){
				this.loadProject(id[0]);
			} else {
				getData(id,function(data){
					me._id = data._id;
					me.timeStamp = data.timeStamp;
					if (data.type == 'presentation'){
						$('#title').text( data.properties.name);
						setName(data.properties.name);
						$('#description').text( data.properties.description);					

						me.titleImage.load(data.properties.image);					
						me.loadItem(data.items);				
						if (data.properties.theme){
							me.setTheme(data.properties.theme);
						}
						
						if (data.properties.menu){
							me.setMenu(data.properties.menu);
						}

						if (data.properties.map){
							me.selectbasemap(data.properties.map);
						}

						if(data.properties.overviewslide) {
							me.selectOverviewSlide(data.properties.overviewslide);
						} else
							alert("Overview slide was not selected, but must have been!");

						if(data.properties.termsandconditions) {
							me.selectTermsAndConditions(data.properties.termsandconditions);
						}
						
						if (data.public == true ||data.public == 'true'){
							me.publish();
						}

						if (data.properties.limiter){
							if (data.properties.limiter.enabled == 'true' || data.properties.limiter.enabled == true){
								select.limiter('',data.properties.limiter);
							}
						}
					}
				});
			}
		},
		saveProject:function(){
			var data = this.getData(),
				me = this;
			
			try{
				saveItem(data,function(result){
					if (result.ok == true){
						me._id = result._id;
						me.timeStamp = result.dataTimeStamp;
					}

					alert('ok');
				});
				
			} catch(e){

			}
		},
		publish:function(is){			
			if (is == 'this'){
				is = $('#publish').attr('data-result');
			}

			if (is == undefined){
				is = $('#publish').attr('data-result');
			}

			if (is == 'true'){
				is = 'false'
				$('#publish').removeClass('green');
			} else {
				is = 'true';
				$('#publish').addClass('green');
			}
			$('#publish').attr('data-result',is);
			$('#ispublic').text(is);
		},
		getData:function(){
			var proj = {				
				properties:{
					name:$('#title').text(),
					description:$('#description').text(),
					map:$('#basemap').attr('data-result') || {},
					overviewslide: $('#overviewslide').attr('data-result'),
					termsandconditions: $('#termsandconditions').attr('data-result'),
					image:this.titleImage.getImage() || {},
					//theme:actions.getTheme()._id,//actions.getTheme(),
					theme:actions.getTheme(),
					menu:$('#menu').attr('data-result') || '',
					limiter:{
						enabled:$('#maplimiter').hasClass('green')
					}
				},
				items:this.getItemsId() || {},
				type:'presentation',			
				public:$('#publish').attr('data-result') || false
			}

			if ($('#maplimiter').hasClass('green')){
				if (actions.boundsEditor){					
					proj.properties.limiter.coordinates = actions.boundsEditor.getData().coordinates;
					proj.properties.limiter.type = actions.boundsEditor.getData().type;
				}
			}



			stamp(this,proj);
			
			return proj;
		},
		getItemsId:function(){
			var ids = [];
			for (var i in this.items){
				if (this.items[i]._id){
					ids.push(this.items[i]._id);
				}
			}
			return ids;
		},
		getItems:function(){
			return this.items;
		},
		getLayers:function(){
			var result = Array();
			for (var i in this.items){
				if (this.items[i].type == 'itemcollection'){
					if (this.items[i]._id != undefined){
						result.push(this.items[i]._id);
					}
				}
			}
			return result;
		},
		browser:function(action,button){
			var b = new repoBrowser({getItemsByType:action});
			b.show();

			
			if (button.attr('data-callback')!=undefined){
				b.callback = actions[button.attr('data-callback')];
			}
		},
		picker:function(action,button){
			var options = {type:action};
			if (button.attr('data-opts')!=undefined){
					var opt = button.attr('data-opts').split(',');					

					for (var i in opt){
						options[opt[i].split(':')[0]] = opt[i].split(':')[1];
					}
			}

			if (button.attr('data-callback')!=undefined){
				var callback = function(e){actions[button.attr('data-callback')](e);}
			}			

			var b = new picker(options,callback);
			b.show();
		},
		

		importItems:function(type,button){			
			var editor = this.editor;
			if (this.editor != undefined){
				var b = new repoBrowser({getItemsByType:type},function(list,data){
					
					for (var i in list){
						getData(list[i],function(item){							
							$.extend(item,data);
							console.log(item)
							actions.itemImport(item);
						});
					}

				});
				b.show();			
			}
		},

		itemImport:function(item){
			if (this.editor){
				this.editor.loadItemCopy(item);
			}
		},

		imgupload:function(type){
			var img = new imageUpload();
			img.show();
		},

	}


function getAction(item){
	var act = item.attr('data-action').split(':');
	return act;
}
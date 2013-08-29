function layerEditor(){
	var me = this;
	
	this._layer = new L.LayerGroup();
	//map.addLayer(this._layer);	
	this.editmode = true;
	this.editors  = Array();
	this._listeners = Array();

	this.inputwindow = new editorwindow();
	this.inputwindow.setSize(480);
	this.inputwindow.setPosition({left:(window.innerWidth/2)-225,top:5});		
	this.inputwindow.setHeader('new','collection')


	this.nameinput = $('<input type="text" placeholder="name" class="layernameinput" />');
	this.descriptions = $('<textarea class="layerdescinput" placeholder="description" />');
	
	this.buttons = $('<div class="buttoncontainer">');
	
	this.addButton = $('<img class="button accept circle" src="img/check-alt.png"></img>');
	this.removeButton = $('<img class="button delete circle" src="img/trash-empty.png"></img>');
	this.langSelector = new langSelector();
	
	this.buttons.append(this.addButton).append(this.removeButton);

	this.imgInput = new imgInput();
	
	// this is not jquery append,btw
	this.inputwindow.append( this.langSelector.getElement());
	this.inputwindow.append(this.imgInput.element)
	

	this.inputwindow.append( this.nameinput );
	this.inputwindow.append( this.descriptions);
	this.inputwindow.append( this.buttons);
	
	this.inputwindow._container.css('height','150px');
	this.inputwindow.addClass('layereditor');

	this._descriptionText = {};
	this._nameText = {};

	this.inputwindow.setToggle();

	var me = this;

	
	this.langSelector.change(function(e){		
		me.setLang(e);
	});

	this.on('remove',function(){
		actions.showtoolbar('tools');
	});

	this.on('show',function(){
		me.addButton.unbind();
		me.removeButton.unbind();

		me.addButton.click(function(){
			me.addItem();		
		});

		me.removeButton.click(function(){
			if (me._id != undefined){
				actions.itemdelete(me._id);
			} else {
				me.remove();
				delete me;
			}
		});


	});
}

layerEditor.prototype = {
	setLang:function(lang){
		if (!lang){
			lang = this.langSelector.getData();
		}
		this._descriptionText[this._lang] = this.descriptions.val();
		this._nameText[this._lang] = this.nameinput.val();

		this._lang = lang;

		this.descriptions.val( this._descriptionText[lang] );
		this.nameinput.val( this._nameText[lang] );
	},
	addItem:function(){
		var me = this;
		if (this.chkLayer()){
			var wait = new loadingDialog('database','saving items...');
			wait.show();
			this.save(function(result){
				if (result != false){
					me.remove();					
					map.addLayer(me._layer);
					me.showItems();
					map.click = function(){
						return false;			
					}

					me._fire('add',me);
				} else {
					alert('error on save');
				}
				wait.remove();
			});
		} else {
			alert('Not enough information, either the name too short, or no items to save');
		}

	},
	toggleBounds:function(){
		if (this._bounds){
			var r = this._bounds.toggle();
		} else {
			this.createBounds();
			var r = true;
		}

		return r;
	},
	createBounds:function(bounds){		
		this._bounds = new boundsEditor(this._layer);

		if (bounds){
			this._bounds.load(bounds);
		} else {			
			this._bounds.setBounds(map.map.getBounds().unpad(8));		 
		}
	},
	showItems:function(){
		for (var i in this.editors){
			this.editors[i].showItem();
		}
	},
	setEdit:function(is){
		if (is != undefined){
			this.editmode = is;
		}

		for (var i in this.editors){
			this.editors[i].setEdit(this.editmode);
		}		
	},
	edit:function(){
		this.show();
		this.inputwindow.show();		
		actions.showtoolbar('layertools');
		actions.hidewindows();
		this.editmode = true;
		this.setEdit(true);
		
		if (this._bounds){
			if (this._bounds.isVisible()){
				actions.editorSetBounds(true);
			}
		}
	},
	toggle:function(){
		if (map.hasLayer(this._layer)){
			this.hide();
			return false;
		} else {
			this.show();
			//map.addLayer(this._layer);
			return true;
		}
	},
	show:function(){
		this._layer.show();
		
		if (this._bounds != undefined){			
			map.map.fitBounds(this._bounds._bounds);
		}

		this._fire('show',this);
	},
	hide:function(){
		this.editmode = false;
		this.setEdit();
		this._layer.hide();
		this.inputwindow.hide();		
		actions.showtoolbar('tools');
		this._fire('hide',this);
	},
	getListItem:function(){
		var item  = this.getData();
		item.layer = this._layer;
		item.editor = this;
		item.toggle = true;
		item.edit = 'layeredit';
		item.removable = true;
		item.action  = 'layertoggle';
		item._id = this._id;		
		return item;
	},
	chkLayer:function(){
		if (this.nameinput.val() != '' && this.nameinput.val().length > 3 && this.editors.length > 0){
			return true;
		} else {
			return false;
		}
	},
	save:function(callback){
		var me = this;
		var layer = me.getData();
		this.setLang();

		saveItemCollection(layer,function(result){

			if (result != false){
				me._layer._id = result._id;
				me._id = result._id;
				me.timeStamp = result.dataTimeStamp;

				me._fire('save',me);
			} else {
				me._fire('error',me);
			}

			if (typeof(callback) == 'function'){
				callback(result);
			}

		});
	},
	close:function(){
		this.inputwindow.hide();
		map.removeLayer(this._layer);
		this._fire('close');
	},
	remove:function(){
		map.removeLayer(this._layer);
		this.inputwindow.remove();
		this._fire('remove');

		for (var i in this.editors){
			this.editors[i].remove();
		}
	},
	addEditor:function(editor){
		var me = this;
		
		editor.on('delete',function(e){			
			me.removeEditor(e);			
		});

		me.on('remove',function(){
			editor.remove();
		});
		this.editors.push(editor);
	},
	removeEditor:function(editor){
		var found = false;
		for (var i in this.editors){			
			if (this.editors[i] == editor){
				delete this.editors[i];				
				
				found =true;
			}
		}
		return found;
	},
	getData : function(){
		var collection = {};
		var items = Array();
		
		this.setLang();

		for (var i in this.editors){
			items.push(this.editors[i].getData());
		}
		
		collection.items = items;
		collection.properties = {			
			name:this._nameText,
			description:this._descriptionText,
			image:this.imgInput.getData(),			
			tags:[]
		}
		collection.type = 'itemcollection';

		if (this._bounds){
			collection.properties.bounds = this._bounds.getData();			
		}


		if (this.timeStamp == undefined){
			collection.timeStamp = Date.now();
		} else {
			collection.timeStamp = this.timeStamp;
		}

		if(this._id != undefined){
			collection._id = this._id;
		}

		return collection;
	},

	load:function(data){
		if (data.type == 'itemcollection'){
			for (var i in data.items){
				var item = this.loadItem(data.items[i]);				
				
			}			
			//this.nameinput.val( setInputText(data.properties.name));
			//this.descriptions.val( setInputText(data.properties.description));
			this._nameText = data.properties.name;
			this._descriptionText = data.properties.description;
			this.setLang(langs[0]);


			this.imgInput.load(data.properties.image);
			this.timeStamp = data.timeStamp;
			
			if (data.properties.bounds != undefined){
				this.createBounds(data.properties.bounds);
			}

			if (data._id != undefined){
				this._id = data._id;
			}			
		} else {
			return false;
		}
	},
	loadItemCopy:function(item){
		if (item._id){
			delete item._id;
			delete item._timeStamp;
		}

		this.loadItem(item);
	},	
	loadItem:function(item){
		var result = false;
		switch (item.type){
			case 'marker':
				result = new markerEditor(item.coordinates,this._layer);
			break;
			case 'polyline':
				result = new lineEditor(this._layer);
			break;
			case 'imagemarker':
				result = new imageMarkerEditor(this._layer);
			break;
			case 'imageoverlay':
				result = new overlayEditor(this._layer);
			break;

		}

		if (result != false){			
			result.load(item);
			this.addEditor(result);
		}

		return result;
	},

	dropItem:function(e){
		var me = this;
		var point = map.map.mouseEventToLatLng(e);
		var files =e.dataTransfer.files;

		if (files.length > 0){			
			var imgs = [];

			for (var i in files){
				if (isImage(files[i])){
					imgs.push(files[i]);
				}
			}

			if (imgs.length > 0){
				sendImages(imgs,function(data){
					var e = new imageMarkerEditor(me._layer,point,data[0]);

					if (e){
						me.addEditor(e);
					}
				});
			}
		}
	},
	setEditor : function(type){
		var me = this;

		if (type!= false){
			if (type == 'marker'){
				map.click = function(e,f){					
					var editor = new markerEditor(e,me._layer);
					me.addEditor(editor);
				}
			} else if (type == 'polyline'){
				var editor = new lineEditor(me._layer);
				map.click = function(e,f){
					editor.addItem(e);
				}
				editor.on('end',function(){
					me.addEditor(editor);
					me.setEditor('polyline');
				});				
			} else if (type=='overlay'){				
				var editor = new overlayEditor(me._layer);
				editor.createBounds();
				editor.show();
				editor.setEdit(true);
				me.addEditor(editor);
			} else {
				map.click = function(){
					return false;
				}
			}

		} else {
			map.click = function(){
				return false;
			}
		}
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
	
function dragmenu(data){
	this._items = Array();
	this._listeners = {};
	this._elementClasses = [];
	this._itemClasses = [];

	/*
	this._itemStyle = {					
					'float':'left',
					overflow:'hidden',
					'margin':'15px',
					'color':'#fff',
					'background-color':'#fff',
					width:128,
					height:128
				}
	*/
	
	addClasses(this._element,this._elementClasses);

	if (data!=undefined){
		this.load(data);
	}
}


dragmenu.prototype = {
	show : function(parent){
		var items = this.getItems();
		
		for (var i in items){
			$('#wrapper').append(items[i].getElement())
			items[i].init();
		}
	},

	hide : function(){
		this._element.remove();
	},
	load:function(data){
		this._id = data._id;
		this._properties = data.properties;

		for (var i in data.items){
			this.loadItem(data.items[i]);
		}

	},

	selectButton:function(){

	},

	getItems : function(){
		//console.log(this._items)
		return this._items;
	},

	setStyle : function(style){
		//console.log(style)
		return false;
	},

	setButtonStyle:function(style){
		for (var i in this._items){
			this._items[i]._element.css(style.css);
			this._items[i]._element.css('overflow','hidden');

			this._items[i]._element.find('p').css({
				color:style.data.color,
				'font-size':style.data.text_size +'px',
				position:'absolute',
				'width':this._items[i]._element.width(),
				'overflow':'hidden',
				top:(this._items[i]._element.height()/2) - style.data.text_size/2,
				left:'0px'
			});
		}
		this._itemStyle = style.css;		
	},

	setActions:function(presentation){
		this._presentation = presentation;
		//console.log(a)
		var me = this;
		for (var i in this._items){			
			(function(){
				var item = me._items[i];
		
				/*
				if (data.type == 'tilelayer' || data.type == 'overlay'){
						var dr = new draggable(item,{scalable:false,rotate:true});

						dr.on('transformend',function(e){	
							me.presentation._map.setLayerOpacity(item.attr('id'),e.angle)					
						});
					} else {				
						var dr = new draggable(item,{scalable:false,rotate:false});
					
				}
				*/

				item.on('leave',function(e){
					//me.presentation._map.setLayerOff(item.attr('id'));
				});
		
				item.on('collision',function(e){
					if (e.edge == 'right' ||e.edge == 'left'){
						//me.presentation._map.setLayerOn(item.attr('id'));
						me._presentation.action(item.action,item.target,item,function(reply){
							//me.actionResponse(reply);					
						});	
					}			
				});

			})();
		}
		
		var me = this;
	},
	updateSelected:function(){

	},

	actionResponse:function(que){
		console.log('wtf')
	},

	loadItem : function(data){
		var me = this;

		var item = $('<div class="dragmenu_item"></div>'),
			image = $('<img class="dragmenu_image" src="'+getImage(data.image)+'"></img>'),
			text = $('<p>'+getText(data.name)+'</p>');
			
		//item.css(this._itemStyle);
		addClasses(item,this._itemClasses);

		item.attr('id',data._id);
		item.attr('type',data.type)

		//item.append(image);
		item.append(text);
		var dr = new draggable(item,{scalable:false,rotate:false});
		dr.action = data.action;
		dr.target = data.target;		
		this._items.push(dr);
		
	},

	makeResponse : function(item){
		var data = {
			type:item.attr('type'),
			id:item.attr('id')
		}

		return data;
	},

	ready : function(fn){
		this._ready = fn;
	},

	_fire : function(evt,data){
		if (this._listeners[evt]!=undefined){
			if (this._listeners[evt].length>0){
				for (var i in this._listeners[evt]){
					if (typeof(this._listeners[evt][i])=='function'){
						this._listeners[evt][i](data);
					}
				}
			}
		}
	},

	off : function(name){
		this._listeners[name] = undefined;
	},

	on : function(listener,fn){		
		if (this._listeners[listener]== undefined){
			this._listeners[listener]=Array();
		}
		this._listeners[listener].push(fn);
	}

}


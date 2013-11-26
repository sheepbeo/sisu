function markerList(){
	this.list = $('<ul>');	
	this.element = this.list;
	this._items = Array();
	this._listeners = Array();

	for (var i in markericons){
		this.addItem(markericons[i]);
	}

	this.select(markericons[0]._id);
}

markerList.prototype = {
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
	},
	select : function(id){
		var e =this.list.find('#'+id);
		if (e.length >0){
			this.list.find('.selected').removeClass('selected');
			e.addClass('selected');
			this._fire('select',this);
		}
	},
	getItem : function(id){	
		for (var i in this._items){
			if (this._items[i]._id == id){			
	 			return this._items[i];
			}
		}
		return false;
	},
	load :function(data){
		if (typeof(data) == 'string'){
			this.select(data);
		} else {
			this.select(data._id);
		}
		this._fire('load',this);
	},
	getData : function(){
		if (this.list.find('.selected').length == 0){
			this.list.children().first().addClass('selected');
		}
		return this.getItem( this.list.find('.selected').attr('id') );
	},
	addItem : function(item){
		var e_item = $('<li>')
		this._items.push(item);
		e_item.append('<img width="40px" heigth="40px" src="../'+markerIconsURL+'/'+item.icon.url+'" title="'+item.name+'"></img>')
		e_item.attr('id',item._id)

		var me = this;
		e_item.click(function(){			
			if (!$(this).hasClass('selected')){								
				me.list.find('.selected').removeClass('selected');
				$(this).addClass('selected');
				me._fire('select');
			}
		});		

		this.list.append(e_item);
	}
}

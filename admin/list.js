function list(callback,opts){
	this._items = Array();
	this._element = $('<div class="listtable">');
	this._listeners = Array();
	if (typeof(callback) == 'function'){
		this.callback = callback;	
	}

	this._opts = opts || {};

	//this._element.append('<tr><th>icon</th><th>name</th><th>startup</th><th></th></tr>');
}

list.prototype = {
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
	setDraggable:function(el){		
		var helper = $('<div class="listtable-dragitem" />');
		

		helper.css({
			'position':'absolute',
			'border-radius':'64px',
			border:'4px solid #000',
			width:'64px',
			height:'64px',
			display:'none'	
		})

		el.draggable({
			revert:true,
			revertDuration:100,
			helper:function(){
				return helper;
			},
			start:function(e){				
				helper.detach();
				$('#wrapper').append(helper);
			},
			drag:function(e){
			},
			stop:function(){
				
			}
		});
	},
	update:function(item){
		console.log(item);
	},
	hasItem:function(id){
		var found = false;
		for (var i in this._items){
			if (this._items[i]._id == id){
				found = true;
			}
		}
		return found;
	},
	removeItem:function(item){
		if (this.hasItem(item._id)){
			var found = this._element.find('[data-id="'+item._id+'"]');
			if (found.length > 1){
				throw 'same id in multiple objects';

			} else {
				found.remove();
				for (var i in this._items){
					if (this._items[i]._id == item._id){
						delete this._items[i];
					}
				}
			}
		}
	},
	addItem:function(item){
		if (item instanceof Array){
			for (var i in item){
				this.addItem(item[i]);
			}
		} else {

			if (item.properties){


			var response = item._id;

			var img = $('<img>'),
				imgcell = $('<div class="img">'),
				propcell  = $('<div class="item_buttons">'),
				cell = $('<div class="text">'),
				tr = $('<div class="row btn" data-action="'+item.action+':'+response+'" data-result="'+item.type+':'+item._id+'">'),
				h = $('<h3>'),
				txt = $('<p class="grey">');
				

				if (item.toggle == true){
					tr.addClass('togglebutton');
				}

				if (item.properties.image){
					img.attr('src',getImage(item.properties.image));
				}
				h.text(getText(item.properties.name));
				txt.text(getText(item.properties.description) || item.type);
				imgcell.append(img);
				cell.append(h).append(txt);
				
				if (item.edit != false){
					pb_visible = $('<img class="btn edit" data-action="'+item.edit+':'+response+'" src="img/edit-document.png">');
					propcell.append(pb_visible);
				}

				if (item.removable == true){
					var pb_delete = $('<img class="btn delete" data-action="itemdelete:'+response+'" src="img/trash-empty.png">');
					propcell.append(pb_delete);
				}


				tr.append(imgcell).append(cell).append(propcell);
				tr.attr('data-id',item._id);

				if (this._opts.draggable == true){
					this.setDraggable(tr);
				}

				if (this._opts.addClass){
					tr.addClass(this._opts.addClass);
				}

				this._element.append(tr);
				this._items.push(item);
				this._fire('add',item);
			} else {
				return false;
			}
		}
	},

	getElement:function(to){
		if (to != undefined){
			to.append(this._element);
		} else return this._element;
	},
	addTo:function(to){
		$(to).append(this.getElement());
	}

}

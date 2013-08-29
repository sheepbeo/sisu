
function targetDropInput(){
	var me = this;
	this.element = $('<div name="target" class="tooltip targetinput dropinput" title="link items for this point, they will be shown when this point is clicked" />');
	this.tname = $('<span>drag & drop target into this</span>');
	
	this.element.click(function(){
		//alert('todo')
		if (!me.target){
			actions.showListWindow();
		} else {
			if (me.target.type =='page'){
				actions.pageedit(me.target._id);
			}
			
		}
		return false;
	});

	this.element.droppable({
		accept:'.itemlistitem',
		hoverClass:'targetinput-hover',
		drop:function(e,ui){
				
			var e = $(ui.draggable);

			var item = {
				type:e.attr('data-result').split(':')[0],
				_id:e.attr('data-result').split(':')[1],
				name:e.find('.text>h3').text(),
				image:e.find('img').attr('src')
			} 			
			me.addTarget(item);
		},
		over:function(e,ui){
		}
	});


	this.target = false;
	this.update();
	this.element.append(this.tname);
}

targetDropInput.prototype = {
	hasTarget:function(item){

	},
	addTarget:function(item){
		if (item){
			if (item._id != 'NONE'){
				this.target = item;
				this.tname.text(item.name);
				if (this.target){				
					this.element.addClass('targeted');
					this.element.css({
						'background-image':'url("'+item.image+'")',
						'opacity':'1'
					});
				}
			}
		}

	},
	getElement:function(){
		return this.element;
	},
	update:function(){
		this.tname.text(this.target.name)
	},
	getData:function(){
		if (this.target == false){
			return {name:"NONE",type:"NONE",_id:'NONE'};
		} else return this.target;
	},	
	load:function(data){
		this.addTarget(data);
	}
}


function targetInput(type){
	this._el = $('<select class="targetinput" name="target"></select');		
	this.update();
}

targetInput.prototype = {
	update:function(){
		var stats = this.getData();
		this.clearList();
		this.addnull();
		this.getTargets();		
		if (stats._id != undefined && stats._id != ''){
			this.load(stats);
		} else {
			this.selectNull();
		}
	},
	selectNull:function(){
		this._el.find('option[val="NONE"]').attr('selected','selected');
	},
	clearList:function(){
		this._el.empty();
	},
	getTargets:function(){
	 	this._targets = actions.getItems();
	 	this.addTarget(this._targets);
	},
	addnull:function(){
		var opt = $('<option val="NONE" targettype="NONE">none</option>');
		this._el.append(opt);
	},
	addTarget:function(target){
		if (target instanceof Array){
			for (var i in target){
				this.addTarget(target[i]);
			}
		} else {
			if (target.properties != undefined){				
				var opt = $('<option val="'+target._id+'" targettype="'+target.type+'">'+getText(target.properties.name)+'</option>');
				this._el.append(opt);
			}
		}
	},
	getElement:function(){		
		return this._el;
	},
	load:function(item){
		var id = item;
		if (typeof(item) == 'object'){
			id = item._id;
		}
		this._el.find('option[val="'+id+'"]').attr('selected','selected');
	},
	getData:function(){
		var item =this._el.find('option:selected').attr('val');
		var type = this._el.find('option[val="'+item+'"]').attr('targettype');

		return {
				_id:item,
				type:type
			}
	}
}








function actionSelect(){
	this._el = $('<select name="action"></select');
	for (var i in presentation_actions){
		this._el.append('<option value="'+presentation_actions[i]+'">'+presentation_actions[i]+'</option<');
	}
}

actionSelect.prototype = {
	getData:function(){
		return this._el.val();
	},
	getElement:function(){
		return this._el;
	},
	load : function(val){
		this._el.find('option[selected="selected"]').removeAttr('selected');
		this._el.find('option[value="'+val+'"]').attr('selected','selected');
	}
}
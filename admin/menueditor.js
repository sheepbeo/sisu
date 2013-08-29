function menuEditor(callback){
	editorwindow.call(this);

	var me = this;
	this.callback = callback;
	this.items = [];
	this.setSize(window.innerWidth*0.95,window.innerHeight*0.9);
	this.setPosition('center');
	this.setHeader('new','Menu');
	this.inputcontainer = $('<div class="editorwindow_inputcontainer" />');
	this.inputList = $('<ul id="menuelementlist" class="menuinput">');
	
	this.props = $('<div class="editorwindow_properties" />');
	this.nameInput = $('<input type="text" name="name" placeholder="name"/>');

	this.nameInput.val('menu '+actions.getName());

	this.addToolbar();
	this.addTool('img/check-alt.png','save','save and exit');	
	this.addTool('img/add.png','addItem','add new button');
	this.addTool('img/rotation.png','getButtons','create buttons from items');
	//this.addTool('img/save.png','save','save changes');
	this.addTool('img/cancel.png','remove','discard');

	/*
	for (var i in this.styles){
		this.styleSelect.append('<option value="'+this.styles[i]+'">'+this.styles[i]+'</option>')
	}
	for (var i in this.types){
		this.typeSelect.append('<option value="'+this.types[i]+'">'+this.types[i]+'</option>')
	}
	*/

	this.langselect = new langSelector();

	this.props
		.append(this.nameInput)
		//.append(this.typeSelect)
		//.append(this.styleSelect)
		.append(this.langselect.getElement());

	this.append(this.props);
	this.append(this.inputcontainer.append(this.inputList));
	this.addClass('pageeditor');
	this.inputList.sortable({axis:'y'}).disableSelection();

	this.inputcontainer.css({
		height:this._container.height()-(96+198)
	});

	
	this.langselect.change(function(lang){
		me.setLang(lang);
	});
	
	this.langselect.select(langs[0]);
}

menuEditor.prototype = new editorwindow();


menuEditor.prototype.setLang = function(lang){
	for (var i in this.items){
		this.items[i].setLang(lang);
	}
}

menuEditor.prototype.save = function(){
	var data = this.getData();
	var me = this;

	saveItem(data,function(result){
		if (result.ok == true){
			me._id = result._id;
			me.timeStamp = result.dataTimeStamp;


			me.callback(me.getData());
			me.remove();
		}
	});
	
	this._fire('save',this);
}

menuEditor.prototype.getData = function(){

	var itemslist = [];

	for (var i in this.items){
		itemslist.push(this.items[i].getData());
	}

	itemslist.sort(function(a,b){return a.index - b.index});

	var data = {
		type:'menu',
		properties:{
			name:this.nameInput.val(),
			//type:this.typeSelect.val(),
			//style:this.styleSelect.val()
		},
		items:itemslist
	}

	data = stamp(this,data);

	return data;
}

menuEditor.prototype.load = function(data){
	setStamp(this,data);

	this._type = 'menu';
	this.nameInput.val(data.properties.name);
	//selectFromList(this.typeSelect,data.properties.type);
	//selectFromList(this.styleSelect,data.properties.style);
	
	data.items.sort(function(a,b){return a.index - b.index});

	for (var i in data.items){
		this.addItem(data.items[i]);
	}
}

menuEditor.prototype.loadButton = function(data){

	var item = {
		text:data.properties.name,		
		target:data._id,
		action:'show',
		image:data.properties.image
	}


	if (data.properties.image){
		item.image = data.properties.image;
	}


	this.addItem(item);	
}

menuEditor.prototype.getButtons = function(){
	var list = actions.getLayers();
	var me = this;

	for (var i in list){
		getData(list[i],function(result){
			if (result){
				me.loadButton(result);
			}
		});
	}
}

menuEditor.prototype.removeItem = function(item){
	for (var i in this.items){
		if (this.items[i] == item){
			delete this.items[i];
		}
	}
}


menuEditor.prototype.addItem = function(item){
	var i = new menuItem();
	var me = this;
	if (item != undefined){
		i.load(item);
	}

	this.inputList.append(i.getElement());
	this.items.push(i);

	i.onremove = function(){
		var b = i;
		me.removeItem(b);
	}

	i.setLang(this.getLang());
}


menuEditor.prototype.getLang = function(){
	return 'fin';
}











function menuItem(){
	this._el = $('<li class="menuiteminput"></li>');
	this._inputcontainer = $('<div class="menuiteminputcontainer" />');
	this._txt = $('<input type="text" name="name" />'); 
	this._id = $('<input type="hidden" name="_id" />');	
	this._action = new actionSelect(), //$('<input type="text" name="action" />');
	//this._target = $('<input type="text" name="target" />');
	this._target = new targetInput();
	this._rm = $('<button class="removefield" >X</button>');
	this._img = new imgInput();


	this._el.append( this._img.getElement()).append(this._inputcontainer);

	this._inputcontainer.append(this._txt).append(this._id).append(this._action.getElement()).append(this._target.getElement()).append(this._rm);

	var me =this;

	this._img.setSize([64,64]);

	this._rm.click(function(){
		me._el.remove();
		me.onremove();
	});

	this.text = {};
}

menuItem.prototype = {
	setLang:function(lang){
		if (this._lang != undefined){			
			this.getText();
		}
		this._lang = lang;
		
		if (this.text){
			this._txt.val(this.text[lang] || '');
		}
	},
	getText:function(){
		if (this.text == undefined){
			this.text = {};
		}
		this.text[this._lang] = this._txt.val();
	},
	getData:function(){
		this.getText();

		var dta = {
			type:'menuitem',
			_id:this._id.val(),
			action:this._action.getData(),
			target:this._target.getData(),
			image:this._img.getData(),
			text:this.text,
			index:this._el.index()
		}
		return dta;
	},
	getElement:function(){
		return this._el;
	},
	onremove:function(){

	},
	load:function(item){
		this.text = item.text;
		this._id.val(item._id);
		this._target.load(item.target);

		if (item.image){
			this._img.load(item.image);
		}
		this._action.load(item.action);		
	}
}

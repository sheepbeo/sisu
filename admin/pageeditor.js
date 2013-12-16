function pageEditor(){
	editorwindow.call(this);

	var me = this;
	
	this.setSize(window.innerWidth*0.95,window.innerHeight*0.9);
	this.setPosition('center');
	this.setHeader('new','page');
	this.inputcontainer = $('<div class="editorwindow_inputcontainer" />');
	this.inputList = $('<ul id="pageelementlist" class="pageinput">');
	this.imglist = $('<ul id="pageeditor_images" class="pageeditor_imgcontainer"/>')

	this.props = $('<div class="editorwindow_properties" />');
	this.nameInput = $('<input type="text" name="name" placeholder="name"/>');
	this.typeSelect = $('<select name="style" />');
	this.styles = PAGESTYLES;

	this.addToolbar();
	this.addTool('img/check-alt.png','save','save and exit');
	this.addTool('img/announce.png','createInput:h2','create header');
	this.addTool('img/script.png','createInput:p','add paragraph');
	this.addTool('img/MD-photo.png','createInput:img','add image');
	this.addTool('img/music.png','createInput:music','add music');
	this.addTool('img/video.png','createInput:video','add video');
	//this.addTool('img/save.png','save','save');
	this.addTool('img/cancel.png','remove','cancel');


	for (var i in this.styles){
		this.typeSelect.append('<option value="'+this.styles[i]+'">'+this.styles[i]+'</option>')
	}

	this.langSelect = new langSelector();
	this.props.append(this.nameInput).append(this.typeSelect).append(this.langSelect.getElement());


	this.langSelect.change(function(lang){
		me.setLang(lang);
	});

	this.append(this.props);
	this.append(this.inputcontainer.append(this.inputList));
	this.addClass('pageeditor');
	this.inputList.sortable({axis:'y'}).disableSelection();

	this.inputcontainer.css({
		height:this._container.height()-(96+198)
	});

	this.items = [];
	
	this.setLang(langs[0]);
	this.langSelect.select(langs[0]);
}

pageEditor.prototype = new editorwindow();


pageEditor.prototype.getLang = function(){
	return this.langSelect.getData() || this._lang;
}

pageEditor.prototype.setLang = function(lang){	
	for (var i in this.items){
		this.items[i].setLang(lang);
	}
	this._lang = lang;
}

pageEditor.prototype.getListItem = function(){
	
	var item  = this.getData();	
	
	if (item){
		item.editor = this;
		item.toggle = true;
		item.edit = 'pageedit';
		item.removable = true;
		item.action  = 'pageedit';
		item._id = this._id;		
		item.properties.image = {path : 'img',name:'book.png',icon:true};
	}
	return item;
}


pageEditor.prototype.getData = function(){
	var items = Array();
	if (this.nameInput.val() != '' && this.nameInput.val().length > 4){

		var items = [];
		
		this.sortItems();
		console.log(this._id);
		

		for (var i in this.items){
			items.push(this.items[i].getData());

			console.log(this.items[i].getData());
		}

		var props = {
			name:{fin:this.nameInput.val()},
			style:this.typeSelect.val(),
			description:{fin:this.typeSelect.val()}
		}

		var page = {
			type:'page',
			properties:props,
			items:items		
		}

		if (this.timeStamp != undefined && this.timeStamp != ''){
			page.timeStamp = this.timeStamp;
		} else {
			page.timeStamp = Date.now();
		}

		if (this._id  != undefined){
			page._id  = this._id;
		}
		
		return page;
	} else {
		
		return false;
	}
}


pageEditor.prototype.load = function(data){
	if (data.type == 'page'){
		this._id = data._id;
		this.timeStamp = data.timeStamp;		

		this.nameInput.val(getText(data.properties.name));
		this.typeSelect.find('option[value="'+data.properties.style+'"]').attr('selected','true');

		data.items.sort(function(a,b){return a.index > b.index;})

		for (var i in data.items){
			var input = this.createInput(data.items[i].tag);
			
			if (input){
				input.load(data.items[i]);	
				input.setText(this.getLang());
			}
		}
		this.setLang(langs[0]);
	}

	this._fire('load',this);
}

pageEditor.prototype.sortItems = function(){
	var sorter = function(a,b){
		return a.index > b.index;
	}
	this.items.sort(sorter);
}

pageEditor.prototype.save = function(){
	var data = this.getData();
	var me =this;
	console.log(data);

	saveItem(data,function(result){		
		if (result.ok == true){
			me._id = result._id;
			me.timeStamp = data.dataTimeStamp;
			me._fire('save',me);
			me.remove();
		} else {
			result.context = this;
			me._fire('error',result,'data save error');
		}
	});
}


pageEditor.prototype.removeField = function(field){
	for (var i in this.items){
		if (this.items[i] == field){
			this.items[i]._element.remove();
			delete this.items[i];
			this._fire('removeitem',field);
		}
	}
}

pageEditor.prototype.update = function(){
	
}


pageEditor.prototype.createInput = function(tag){
	var me = this;
	var field = new pageInput(tag,this);
	

	if (field){
		field.setLang(this.getLang());

		this.items.push(field);	
		this.inputList.append(field.getElement());
		this._fire('add',field);
		this.update();	
	}
	return field;
}


function pageInput(tag,page){
	this._page = page;
	this._tag = tag;
	this.text = {};
	var success = this.build();
	
	if (success){
		this._lang = langs[0];		
	} else {
		return false;
	}
} 

pageInput.prototype = {
	load:function(data){
		this.text = data.text;
		
		if (this._tag == 'img'){
			var e = data.img;
			
			if (typeof(e) == 'string'){
				e = JSON.parse(e);			
			}
			
			this._field.empty();
			
			for (var i in e){
				this._field.append('<img src="'+getImage(e[i],[96,96])+'" />');
			}

			this._field.attr('data',escape(JSON.stringify(e)));
		} else if (this._tag == 'music') {
			this.musicurl = data.musicurl;
			console.log(data.musicurl);
		} else if (this._tag == 'video') {
			this.videourl = data.videocurl;
			console.log(data.videourl);
		}

	},
	getText:function(){
		if (this._tag != 'img'){
			this.text[this._lang] = this._field.val();
		}
	},
	getData:function(){
		this.getText();
		if (this._tag == 'img'){
			return {
				tag:this._tag,
				index:this._element.index(),
				img:JSON.parse( unescape(this._field.attr('data')))
			};
		} else if (this._tag == 'music') {
			return {
				tag:this._tag,
				index:this._element.index(),
				text:this.text,
				musicurl:this.text
			};
		} else if (this._tag == 'video') {
			return {
				tag:this._tag,
				index:this._element.index(),
				text:this.text,
				videourl:this.text
			};
		} else {
			return {
				tag:this._tag,
				index:this._element.index(),
				text:this.text
			};
		}
	},
	setText:function(lang){
		this._lang = lang;
		if (this.text){
			this._field.val(this.text[lang]);
		}
	},
	setLang:function(lang){
		
		if (this._tag != 'img' && lang){						
			this.text[this._lang] = this._field.val();	
			this._lang = lang;
		
			if (this.text[lang]!=undefined){
				this._field.val(this.text[lang]);
			} else {
				if (this._field){
					this._field.val('');
				}
			}
		}

	},
	build:function(){
		var container = $('<li/>'),
			rmbutton = $('<button class="removeField" >X</button>');
			//taginput = $('<input class="taginput" type="text" />');

		var field = false;

		switch (this._tag){
			case 'h2':
			case 'h3':
			case 'h1':
				field = $('<input type="text" class="'+this._tag+'"/>');
			break;
			case 'img':
				field = $('<div class="imagepickerfield multi-image '+this._tag+'"/>');
			break;
			//field = $('<div class="pageeditor_imginput" contentEditable="true" />');
			//break;
			case 'music':
				field = $('<textarea class="'+this._tag+'"/>');
			break;

			case 'video':
				field = $('<textarea class="'+this._tag+'"/>');
			break;

			case 'p':
				field = $('<textarea class="'+this._tag+'"/>');
			break;
		}

		var me = this;
		
		if (field != false){
			
			rmbutton.click(function(){
				me._element.remove();
				me._page.removeField(me);
			});

			//taginput.val(tag);
			field.attr('data-type',this._tag);
			field.addClass('pageinputfield');
			container.append(field).append(rmbutton);
			
			this._field = field;
		}
		this._element = container;
		return this._field;
	},
	getElement:function(){
		return this._element;
	}
};



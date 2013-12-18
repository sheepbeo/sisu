function picker(opts,callback){
	editorwindow.call(this);
	this.opts= opts;
	this.callback = callback;
	this.list = $('<ul />');
	this.setSize(window.innerWidth*0.95,window.innerHeight*0.9);

	this.setPosition('center');
	
	this.searchstr = '';
	if (opts.type.match(/[,]/)){
		var types = opts.type.split(',');		
		this.searchstr = 'type:'+types.join(' OR type:')		
	} else {
		this.searchstr = 'type:'+opts.type;
	}

	this.setHeader('pick',opts.type);
	this.append(this.list);

	this.addToolbar();		
	
	if (this.opts.multi == true ||this.opts.multi == 'true'){
		this.opts.multi = true;
		this.addTool('img/check-alt.png','export','ok');	
	}	

	this.addTool('img/cancel.png','remove','discard');

	this.list.css({
		'height':this.getInnerSize().height,
		'overflow-y':'scroll'
	});
	this.getList(opts.type);
	this.applyOverlay();
	this.show();
}

picker.prototype = new editorwindow();


picker.prototype.getList = function(type){
	var me = this;
	
	
	search(this.searchstr,function(data){
		if (data){
			if (data[0].timeStamp){
				data = sortByTimestamp(data);
			}
			for (var i in data){
				me.addItem(data[i]);
			}
		}
	}, 10000);
};

picker.prototype.addItem = function(item){
	var me = this;

	var container = $('<li class="pickeritem" />');
		var e = $('<div class="pickeritem-container"></div>');

		if (item.properties.image){
			var img = getImageElement(item.properties.image,[96,96]);
			e.append(img);
		}

		var name = item.properties.name;

		if (typeof(name)=='object'){
			name = getText(name);
		}

		e.attr('name',name);
		e.attr('id',item._id);
		e.append('<p>'+name+'</p>');
		e.append('<p class="picker-small">'+item.type+'</p>');

		if (item.properties.description){
			e.addClass('tooltip');
			e.append('<span>'+getText(item.properties.description)+'</span>');
		}


		var me = this;
		e.click(function(){
			if (me.opts.multi !== true){
				$(this).addClass('selected');
				me.callback([$(this).attr('id')]);
				me.remove();
			} else {
				$(this).toggleClass('selected');
			}
		});

		var buttonDelete = $('<div class="picker-button-delete picker-button"></div>');
		var buttonConfirm = $('<div class="picker-button-confirm picker-button" style="display:none;"></div>');
		var buttonCancel = $('<div class="picker-button-cancel picker-button" style="display:none"></div>');

		buttonDelete.click(function(e) {
			buttonDelete.css('display', 'none');
			buttonConfirm.css('display', 'block');
			buttonCancel.css('display', 'block');
		});

		buttonConfirm.click(function(e) {
			container.css('display', 'none');
			deleteData(item, function(result) {
			});
		});

		buttonCancel.click(function(e) {
			buttonDelete.css('display', 'block');
			buttonConfirm.css('display', 'none');
			buttonCancel.css('display', 'none');
		});


	container.append(e);
	container.append(buttonDelete);
	container.append(buttonConfirm);
	container.append(buttonCancel);
	this.list.append(container);
};

picker.prototype.export = function(){
	var me = this;
	var result = [];
	
	if (this.list.find('.selected').length > 0){

		this.list.find('.selected').each(function(){
			result.push($(this).attr('id'));
		});

		me.callback(result);
	}

	me.remove();
};


function imgPicker(opts,callback){
	editorwindow.call(this);
	var me = this;
	this.opts= opts;
	this.callback = callback;
	this.list = $('<ul class="imagelist" />');
	this.setSize(window.innerWidth*0.95 < 600 ? 600 : window.innerWidth*0.95,window.innerHeight*0.9);
	this.setPosition('center');
	this.setHeader('pick','images');
	this.append(this.list);
	this._opts = opts || {};

	this.addToolbar();
	if (this._opts.multi == true){
		this.addTool('img/check-alt.png','export','ok');	
	}

	this.addTool('img/trash-empty.png','returnFalse','clear the image');
	this.addTool('img/cancel.png','remove','cancel');


	this.applyOverlay();
	this.show();
	
	this.list.css({
		height:this._container.height()-(96)
	});

	//this.update();
	this.getImages();

	droppable(this.list,function(evt,files){
		
		if (files.length > 0){
				
			var count = files.length;
			var d = new loadingDialog('imgs','upload');
			d.show();

			for (var i in files){
				me.uploadFile(files[i],function(e){
					count--;

					if (count == 0){
						me.update();
						d.remove();
					}
				});
			}
		}
	});
}

imgPicker.prototype = new editorwindow();

imgPicker.prototype.uploadFile = function(file,callback){
	var f = new imagefile(file);	
	f.upload();

	f.complete(function(e){
		if (typeof(callback) == 'function'){
			callback(e);
		}
	});
}

imgPicker.prototype.update = function(){	
	var me = this;
	this.getImages(function(items){

		for (var i in items){
			if (!me.hasImage(items[i])){
				me.addItem(items[i]);
			}
		}
	});	
}

imgPicker.prototype.hasImage = function(name){
	if (typeof(name) == 'object' && name.name){
		name = name.name;
	}

	var e = this.list.find('[name="'+name+'"]');
	if (e.length < 1){
		return false;
	} else {
		return e;
	}
}

imgPicker.prototype.load = function(items){
	if (items instanceof Array){
	
		for (var i in items){
			this.list.find('[name="'+items[i]+'"]').addClass('selected');
		}

		this._selectitems = items;
	}
}

imgPicker.prototype.export = function(){
	var items = this.list.find('.selected');
	var result = [];

	$.each(items,function(){		
		result.push($(this).attr('name'));
	});

	if (typeof(this.callback) == 'function'){
		this.callback(result);
	}
	this.remove();
}


imgPicker.prototype.makeList = function(list){	
	for (var i in list){
		this.addItem(list[i]);
	}

	if (this._selectitems){
		this.load(this._selectitems);
	}
}

imgPicker.prototype.itemClick = function(item){	
	if ($(item) instanceof jQuery){
		$(item).toggleClass('selected');
	}
	
	if (this._opts.multi != true){
		this.export();
		this.list.find('.selected').removeClass('selected');
	}
}

imgPicker.prototype.addItem = function(item){
	var e = $('<li class="imglistitem" />');
	var me = this;

	e.append('<img src="'+getImage(item.name,[128,128])+'"/>');
	//e.append('<span>'+item.name+'</span>')
	e.attr('name',item.name);
	e.append('<p>'+item.name+'</p>');
	e.css('opacity',0);

	e.animate({
		opacity:1
	},300);

	e.click(function(){
		me.itemClick($(this));
	});
	this.list.append(e);
}

imgPicker.prototype.getImages = function(callback){
	var me = this;

	$.ajax({
		url:IMGURL,
		method:'GET',
		data:{
			get:'filelist'
		},
		dataType:'json',
		success:function(data){
			if (callback){
				callback(data); 
			} else {
				me.makeList(data);				
			}
		},
		error:function(){

		}

	});
}

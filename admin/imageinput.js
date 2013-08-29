function imgInput(){
	this._listeners = [];
	this.element = $('<img name="image" class="tooltip imageinput dropinput" title="select or drop in an image for this place icon"></img>');
	var me = this;
	
	droppable(this.element,function(e,files){
		me.readFile(files);
	});

	this.element.click(function(){
		me.picker();
	});
}

imgInput.prototype = {
	getElement:function(){
		return this.element;
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
	},
	picker:function(){
		var me = this;
		
		var p = new imgPicker({},function(img){			
			if (img== false){
	
				me.unload();
			} else {			
				img = img[0];


				var dta  = {
					path:getImage(img,this._size),
					name:img,
					//size:me._size || [128,128]
				}

				me.load(dta);
				me._fire('addimage',me);
			}
		});
	},
	setSize:function(size){
		if (size instanceof Array && size.length == 2){
			this.size = true;
			this._size = size;			
			
			this.element.css({
				width:size[0],
				height:size[1]
			});
		}
	},
	setOutputsize:function(size){
		if (size instanceof Array && size.length == 2){
			this._outSize = size;
		}
	},
	unload:function(){
		this.element.attr('name','').attr('type','').attr('src','blank.jpg');
		this.element.attr('style','');
		console.log('asdfasdfasfd')
	},
	load:function(data){
		if (data.size != undefined)	{
			
			if (data.size[0] > 0 && data.size[1] > 0 && this.size != true){
				this.element.css({
					width:data.size[0],
					height:data.size[1]
				});
			}
		}
		this.element.attr('name',data.name).attr('type',data.type).attr('src',getImage(data,data.size));
		this.element.css({
			opacity:1,
			'background-image':'none'
		});
		
	},
	getData:function(){		
		return this.getImage(this._size);
	},
	
	getImage:function(size){
		var s = size;
		if (!s){
			if (this._size){
				s = this._size;
			}
		}
		var img ={
			size:s || [this.element.width(),this.element.height()],
			name:this.element.attr('name'),
			type:this.element.attr('type')			
		} 

		return img;
	},
	readFile:function(files,callback){
		var me = this;
		var size = this._size ||[128,128];

		sendImages(files,function(result){			
			if (result.length > 0){
				me.element				
					.attr('src',getImage(result[0],size))
					.css('opacity',1)
					.css('background-image','none')
					.attr('name',result[0]);



				me._fire('addimage',me);

				if (typeof(callback) == 'function'){
					callback(me);				
				}

			} else {
				if (typeof(callback) == 'function'){
					callback(false);
				}
			}
		});
		/*
		readFiles(files[0],function(img){
			me.element
				.attr('name',files[0].name)
				.attr('type',files[0].type)
				.attr('src',img)
				.css('opacity',1)
				.css('background-image','none');

			me._fire('addimage',me);
		});
		*/
	}
}

function imageUpload(){
	editorwindow.call(this);

	this.setSize(window.innerWidth*0.8,window.innerHeight*0.8);
	this.setPosition('center');
	this.applyOverlay();

	this.imgs = $('<div class="images dragbox"/>');
	this.setHeader('upload','Images');
	
	this.toolbar = $('<ul class="tools bottom_tools" />');
	
	this.tools = [
		'<li class="tooltip" data-action="uploadAll"><img src="img/check-alt.png"></img><span>Upload images</span></li>',
		'<li class="tooltip" data-action="remove"><img src="img/cancel.png"></img><span>Cancel</span></li>'
	]

	for (var i in this.tools){
		this.toolbar.append(this.tools[i]);
	}


	this.append(this.imgs);
	this.append(this.toolbar);

	this.toolbar.css({
		display:'block'
	});

	this.imgs.css({
		'margin-left':'10px',
		width:this._element.width()-24,
		height:this._element.height()-220
	});

	var me = this;

	this.toolbar.find('li').click(function(){
		me[$(this).attr('data-action')]();
	});

	this.imgs[0].addEventListener('drop',function(e){
		e.stopPropagation();
		e.preventDefault();
		me.drop(e);
	},false);


	this.files = Array();
	this.addClass('imageupload');
}

imageUpload.prototype = new editorwindow()

imageUpload.prototype.uploadAll = function(){
	var me = this;
	var count = this.files.length;
	var wait = new loadingDialog('uploading','images');
	wait.show();

	for (var i in this.files){
		this.files[i].upload();

		this.files[i].complete(function(fil){			
			count--;
			me.removeFile(fil);

			if (count == 0){
				wait.remove();
			}
		});
	}
}

imageUpload.prototype.removeFile = function(file){
	for (var i in this.files){
		if (this.files[i] == file){

			this.files[i].remove();

			delete this.files[i];
		}
	}
}

imageUpload.prototype.complete = function(){
	console.log('sladf');
}




imageUpload.prototype.drop = function(e){
	for (var i in e.dataTransfer.files){
		if (e.dataTransfer.files[i].name != undefined && i != 'length'){			
			var file = e.dataTransfer.files[i];

			var filetype = file.name.substr(-3);

			if (filetype == 'png' || filetype == 'jpg'){

				this.addFile(e.dataTransfer.files[i]);
			}
		}
	}	
}

imageUpload.prototype.hasFile = function(file){
	var found = false;
	for (var i in this.files){
		if (this.files[i].name == file.name){
			found = true;
			return found;
		}
	}
	return found;
}

imageUpload.prototype.addFile = function(file){
//	var imgObj = $('<div class="img_listobject">');

	if (typeof(file) != 'function' && !this.hasFile(file)){

		var imgfile = new imagefile(file);
		this.files.push(imgfile);
/*		
		this.files.push(file);
		var src ='';

		var textcontainer = $('<div class="textcontainer" />');
		textcontainer
			.append('<h3>'+file.name+'</h3>')
			.append('<p class="grey">'+file.type+'</p>')
			.append('<p class="black">'+Math.round(file.size/1024)+'kbytes</p>');


		imgObj
			.append('<img src="'+src+'"></img>')
			.append(textcontainer)
*/		
		img = imgfile.getListitem();
		img.css({
				width:(this.imgs.width()/3)-70,
				height:76,
			});

		this.imgs.append(img);
	}
}

function imagefile(file){
	if (file.name){		
		this._originalFile = file;
		for (var i in file){
			this[i] = file[i];
		}
	}
}

imagefile.prototype.getListitem = function(){
	this.imgObj = $('<div class="img_listobject">');
	var src ='';

	var textcontainer = $('<div class="textcontainer" />');
	textcontainer
		.append('<h3>'+this.name+'</h3>')
		.append('<p class="grey">'+this.type+'</p>')
		.append('<p class="black">'+Math.round(this.size/1024)+'kbytes</p>');


	this.imgObj
		.append('<img src="'+src+'"></img>')
		.append(textcontainer)

	
	this.readFile();
	return this.imgObj;
}
imagefile.prototype.remove = function(){
	this.imgObj.remove();
}

imagefile.prototype.setImage = function(img){
	this.imgObj.find('img').attr('src',img);
}

imagefile.prototype.readFile = function(){
	var me = this;	
	readFiles(this._originalFile,function(data){		
		me.setImage(data);
		me._uploaded = false;
	});
}

imagefile.prototype.complete = function(callback){
	this._uploaded = true;

	if (typeof(callback) == 'function'){
		this._complete = callback;
	}
}

imagefile.prototype.upload = function(){
	var me = this;
	sendImages([this._originalFile],function(){
		me._uploaded = true;

		if (typeof(me._complete)=='function'){
			me._complete(me);
		}
	});
}
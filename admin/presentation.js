function editorwindow(callback){
	this._element = $('<div class="editorwindow" />');	
	this._headercontainer = $('<div class="header" />');
	this._header = $('<h3></h3>');
	this._element.append(this._headercontainer.append(this._header));

	this.callback = callback;
}

editorwindow.prototype = {
	init:function(){

	},
	setSize:function(width,heigth){
		this._element.css({			
			width:width,
			heigth:heigth
		});
	},
	setPosition:function(pos){		
		if (pos.left && pos.top){
			this._element.css({
				position:'absolute',
				top:'0px',
				left:'0px',
				'-webkit-transform':'translate('+top+'px ' + left+'px'
			});

		}
	},
	show:function(){
		$('body').append(this._element);
		this.setPosition(100,100);
	},
}
function editorwindow(callback){	
	this._element = $('<div class="editorwindow" />');	
	this._headercontainer = $('<div class="header" />');
	this._beforeHeader = $('<h3></h3>');
	this._header = $('<h3 class="light"></h3>');
	this._container = $('<div class="container" />');
	this._element.append(this._headercontainer.append(this._beforeHeader).append(this._header)).append(this._container);
	this._overlay = $('<div class="overlay"/>');
	this.callback = callback;
	this._listeners = Array();
	
	this._element.css('display','none');
	$('body').append(this._element);

}

editorwindow.prototype = {
	setToggle:function(){
		var me = this;
		this._headercontainer.click(function(){
			me._element.toggleClass('hidden');
		});
	},
	addToolbar:function(){
		this.toolbar = $('<div class="editorwindow_toolbar" />');
		this.toolslist = $('<ul id="editorwindow_tools">');

		this.toolbar.append(this.toolslist);
		this.append(this.toolbar);
	},
	addTool:function(img,action,tooltip){
		var me = this;
		if (tooltip){
			var tool = $('<li class="tooltip" data-action="'+action+'"><img src='+img+'></img><span>'+tooltip+'</span></li>');
		} else {
			var tool = $('<li data-action="'+action+'"><img src="'+img+'"></img></li>');
		}

		tool.on('click',function(e){
			var act = $(this).attr('data-action');
			var data = '';

			if (act.split(':').length > 1){
				data = act.split(':')[1];
				act = act.split(':')[0];
			}

			if (typeof(me[act]) == 'function'){				
				me[act](data);
			}

			me._fire('tooluse',$(this).attr('data-action'));
		});

		this.toolslist.append(tool);
	},
	addClass:function(classes){
		this._element.addClass(classes);
	},
	setHeader:function(before,text){
		this._header.text(text);
		this._beforeHeader.text(before +'/');
	},
	applyOverlay:function(hides){
		$('body').append(this._overlay);

		var me = this;
		
		this._overlay.click(function(){
			if (hides != true){
				me.remove();
			} else {
				me.hide();
			}
		});	
	},
	hide:function(){
		this._overlay.remove();
		this._element.css('display','none');
		this._fire('hide',this);
	},
	remove:function(){
		this._fire('remove',this);
		//this._element.remove();
		this._element.detach();
		this._overlay.remove();
	},
	returnFalse:function(){
		this.callback(false);
		this.remove();
	},
	append:function(item){
		if (item instanceof jQuery){
			this._container.append(item);
		} else if (item instanceof Array || typeof(item) == 'object'){
			for (var i in item){
				this._container.append(item[i]);
			}
		}
		this._fire('append',this);
	},
	init:function(){

	},
	setSize:function(width,height){
		this._element.css({			
			width:width,
			height:height
		});

		this._container.css({
			position:'relative',
			top:'0px',
			left:'0px',
			height:height-59,
			width:width
		})
	},
	getInnerSize:function(){
		var tb = 0;
		if (this.toolbar){
			tb = this.toolbar.height();
		}
		return {
				width:this._container.width(),
				height:this._container.height()-tb
			}
	},
	setPosition:function(pos){				
		if (pos.left && pos.top){
			this._element.css({
				position:'absolute',
				top:Math.round(pos.top)+'px',//'0px',
				left:Math.round(pos.left)+'px'//'0px',

				//top:'0px',
				//left:'0px',
				//'-webkit-transform':'translate('+pos.left+'px,' + pos.top+'px)'
			});
		} else if (pos == 'center'){
			var top = (window.innerHeight/2)-(this._element.height()/2),
				left = (window.innerWidth/2)-(this._element.width()/2);
			
			this._element.css({
				position:'absolute',
				top:top,//'0px',
				left:left,//'0px',
				//'-webkit-transform':'translate('+left+'px,' + top+'px)'
			});			
		}
	},
	show:function(){

		this._element.css('display','block');
		var me = this;
		this._element.ready(function (){
			me._fire('show',me);
			me._fire('ready',me);
		});
		 if (!this._element.is(':visible')){
		 	$('#wrapper').append(this._element);
		 }
	},
	draggable:function(){

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
	}
}
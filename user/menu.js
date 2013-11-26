var menu = function(data){
	this._buttons = Array();
	this._element = $('<div class="mainmenu menu"></div>');
	this._buttonScroll = $('<div id="buttonscroll"></div>');
	this._buttonContainer = $('<ul class="buttoncontainer"></ul>');
	
	this._width = 200;	
	this._classes = ['container','shadow','iscroll','mainmenu']
	addClasses(this.element,this.classes);

	
	this._element.append(this._buttonScroll);
	this._buttonScroll.append(this._buttonContainer);

	if (data != undefined){
		this.load(data);
	}
}


menu.prototype.getElement = function(){
	return this._element;
}

menu.prototype.findButtonTarget = function(val){
	for (var i in this.buttons){
		if (this._buttons[i].target.id == val){
			return this._buttons[i];
			break;
		}
	}
}

menu.prototype.deSelect =function(){
	for (var i in this._buttons){
		this._buttons[i].select(false);
	}
}

menu.prototype.setActions = function(presentation){
	for (var i in this._buttons){		
		this._buttons[i].setAction(presentation)
	}

}

menu.prototype.setSize = function(style){
	this._element.css(style.css);
}

menu.prototype.setStyle = function(style){
	var css = {};	
	this.css = style;	
	this._element.css(style.css);
	
	this._element.addClass(style.data.position);
	addClasses(this._element,style.classes);
	addClasses(this._buttonContainer,[style.data.style]);

	if (style.data.button_rotate == 'true'){
		this.buttonRotate();
	}
}

menu.prototype.buttonRotate = function(){

	for (var i in this._buttons){
		var deg = (Math.random()*10)-5;

		this._buttons[i]._element.css({
			'-webkit-transform':'rotate('+deg+'deg)'
		});
	}
}


menu.prototype.scale = function(){
	this._scrollDirection = getDirection(this.css.data.position);

	if (this._scrollDirection == 'horizontal'){
		s = 0;
		for (var i in this._buttons){
			s += this._buttons[i].getSize().width;
			this._buttons[i].getElement().css('float','left');
		}
		this._buttonContainer.css('width',s*1.3);
	
		this._buttonScroll.css({
			width:this._element.width(),
			height:this._element.height(),
		});		
	}

	if (this._scrollDirection == 'vertical'){
		this._buttonScroll.css({
			width:this._element.width(),
			height:this._element.height(),
		});

	}


	this._buttonScroll.addClass(this._scrollDirection);
	this._element.addClass(this._scrollDirection);
}

menu.prototype.setButtonStyle =function(style){
	
	if (style!=undefined){
		this._buttonstyle = style;
	}
	
	for (var i in this._buttons){
		this._buttons[i]._style = this._style;
		this._buttons[i].setStyle(this._buttonstyle);
		this._buttons[i]._element.addClass(this.properties.style);
	}

	this.scale();
}

menu.prototype.addButton = function(buttonData){
	var btn = new button(this._position,buttonData);
		btn._menu = this;
	
	var e =$('<a></a>').append( btn.getElement() );


		this._buttonContainer.append(e);
		this._buttons.push(btn);
}

menu.prototype.load = function(data){		
		for (var i in data){
			if (i!= 'items') this[i] = data[i];
		}

		
		data.items.sort(function(a,b){			
			return a.index - b.index;
		});
		

		for (var i in data.items){
			this.addButton(data.items[i]);
		}

		this._element.attr('id',this._id);
		this._element.addClass(data.properties.style);	
		this._element.addClass(this.position);

		$.each(this._element.children(),function(){
			$(this).addClass(this.style);
		});
}


menu.prototype.show = function(){	
		$('#wrapper').append(this._element);				
		if (this._scrollDirection == 'vertical'){
			this._scroll = new iScroll('buttonscroll',{hScroll:false,hScrollbar:false,vScrollbar:false});
		} else {
			this._scroll = new iScroll('buttonscroll',{vScroll:false,hScrollbar:false,vScrollbar:false});
		}
}


menu.prototype.hide = function(){
	this._element.remove();
}

menu.prototype.findButton = function(id){	
	var result = [];
	for (var i in this._buttons){
		if (this._buttons[i].target._id == id){
			result.push(this._buttons[i]);
		}
	}

	return result;
}

menu.prototype.selectButton = function(id,select){
	var button = this.findButton(id);	
	if (button!=undefined){	
		for (var i in button){
			button[i].select(select);
		}
		return true;
	} else {
		return false;
	}
}

menu.prototype.unselectAll = function(){
	for (var i in this._buttons){
		this._buttons[i].select(false);
	}
}

menu.prototype.updateSelected =function(list){
	this.unselectAll();

	for (var i in list){
		for (var d in this._buttons){
			if (this._buttons[d].target.id == list[i].id){
				this._buttons[d].select(true);
			}
		}

	}
}








var button =  function(position,data){
	this._element = $('<li class="button"></li>');
	this._text = $('<span class="buttontext"></span>');
	
	this._position = position;

	this._element.addClass(this._position);
	if (data != undefined){
		this.load(data);
	}
	this.set();
}

button.prototype.getElement = function(){
	return this._element;
}

button.prototype.actionResponse = function(status){
	this.select(status);
}

button.prototype.setBusy = function(busy){
	//setLoading(this._element,busy);
	if (busy){
		this._element.addClass('busy');
	} else {
		this._element.removeClass('busy');
	}
}


button.prototype.setAction = function(presentation){
	var me =this;
	this._presentation = presentation;
	/*
	this._element.hammer();

	this._element.on('tap',function(){
		me.setBusy(true);
		presentation.action(me.action,me.target,me,function(reply){
			me.actionResponse(reply);
			me.setBusy(false);
		});
	});*/
	var e = this._element[0];


	/*
	e.addEventListener('touchstart',function(evt){
		this._startEvent = evt;
	});

	e.addEventListener('touchend',function(evt){
		if (evt.timeStamp - this._startEvent.timeStamp < 800){
			me.takeAction();
		}
	});
	*/
	onTap(e);
	this._element.click(function(){
		me.takeAction();
	});
}

button.prototype.takeAction = function(){
	var me = this;
	me.setBusy(true);
	this._presentation.action(me.action,me.target,me,function(reply){
		me.actionResponse(reply);
		me.setBusy(false);
	});
}

button.prototype.select = function(isselected){
	if (isselected == true){
		this._element.addClass('selected');
	}
	if (isselected == false && this._element.hasClass('selected')){
		this._element.removeClass('selected');
	}
}

button.prototype.set = function(){
	var me = this;
	if (this.action != undefined){
		this._element.attr('action',this.action);
		this._element.attr('target',this.target.id);
		this._element.attr('id',this.id);
	}

	this._text.html(getText(this.text));
		

}

button.prototype.getSize = function(){
	return {
		width:this._element.outerWidth(true),
		height:this._element.outerHeight(true)
	}
}

button.prototype.setImage = function(){
	
	this._img = getImageElement(this.image,[this._element.width(),this._element.height()]);
	
	this._img.css({
		width:this._element.width(),
		height:this._element.height(),
		position:'relative',
		left:'0px',
		right:'0px'
	});

	this._element.append(this._img);
	
	if (this._style.buttons.overlay == 'true' || this._style.buttons.overlay == true){
		this._overlayImage  = $('<img class="button-overlay" src="img/button_glossy_overlay.png"></img>')
		this._overlayImage.css({
			width:this._element.width(),
			height:this._element.height(),
			position:'absolute',
			left:'0px',
			right:'0px'
		});
		this._element.append(this._overlayImage);
	}

}

button.prototype.setText = function(){
	this._text.css({
		'position':'absolute',
		'z-index':'1000',
		'width':this._css.css.width,
		'overflow':'hidden',
		'color':this._style.getTextColor('buttons'),
		'font-size':this._style.getTextSize('buttons'),
		'background-color':getRgba(this._css.data.text_background_color,this._css.data.text_background_opacity)

	});			
	

	this._element.append(this._text);
}

button.prototype.setStyle = function(style){
	this._element.css(style.css);
	this._element.css('border-color',style.data.border_color);

	this._css = style;
	addClasses(this._element,style.classes);
	this.setText();
	if (this._css.data.showimages != "false" && this._css.data.showimages != '0'){
		this.setImage();
	}
}


button.prototype.load =function(data){
	for (var i in data){
		this[i] = data[i];		
	}	

	if (this.target._id != 'NONE'){
		this._id =  this.target._id;
		this._element.attr('id',this._id);	
	}
}
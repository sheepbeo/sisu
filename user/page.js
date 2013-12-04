var pagebuilder = {
	getBase : function(){
		var el = {
				container:$('<div class="page shadow pagecontainer"></div>'),
				header : $('<div class="headercontainer"></div>'),
				textcontainer : $('<div class="textcontainer"></div>'),
				imagecontainer : $('<div class="imagecontainer"></div>'),
				textscroll : $('<div id="pageTextscroll" class="textscroll iscroll"></div>'),
				imagescroll : $('<div id="pageImagescroll" class="imagescroll iscroll" zoom="true"></div>')
		}
	
		el.container
				
				.append(el.imagescroll.append(el.imagecontainer))
				.append(el.textscroll.append(el.textcontainer))

		return el;
	},
	page:function(data){
		var container = $('<div class="pagecontainer page />');

		var menu = $('.mainmenu');


		el.container.css({
			width:window.innerWidth - menu.width(),
			height:window.innerHeight,
			overflow:'hidden',
			position:'absolute',
			top:0,
			left:menu.width(),
		});

		container.css({
			width:window.innerWidth
		})

	},
	gallery:function(data){
		
		var pagecontainer = $('<div id="gallerycontainer" style="width:0%;height:0%;"></div>');			
		var textwrapper  = $('<div id="gallerytext" class="gallerytext iscroll" />');
		var textcontainer = $('<div class="textcontainer" />')
		
		pagecontainer.append(textwrapper.append(textcontainer));


		textwrapper.css({
			width:'350px',
			height:window.innerHeight,
			position:'absolute',
			top:'0px',
			left:window.innerWidth-390+'px'
		})

		for (var i in data.items){
			
			var item = this.makeItem(data.items[i]);			
			
			if (item instanceof Array){

				for (var c in item){
					if (item[c] != false){
						pagecontainer.append(item[c]);
						item[c].addClass('user-draggable drag-rotate drag-scale gallery-image random-position');
						item[c].find('img').css({
							'max-width':window.innerWidth*0.5,
							'max-height':window.innerHeight*0.5
						});

						item[c].css({
							position:'absolute',
							top:'10%',
							left:'10%'
						})
					}
				}

			} else {
				if (item != false){
					textcontainer.append(item);
					//item.addClass('user-draggable random-position');
				}
			}
		}
		
		return pagecontainer;
	},

	normal: function(data){
		var el = pagebuilder.getBase();

		for (var i in data.items){
			var e = pagebuilder.makeItem(data.items[i]);
			
			if (data.items[i].tag == 'img'){
				var imgs = getPageImages(data.items[i].img);

				for (var i in imgs){
					el.imagecontainer.append(imgs[i]);
				}

				el.imagecontainer.addClass('imagescroller');
			} else {
				el.textcontainer.append(e);
			}
		}

		el.container.css({
			width:window.innerWidth*0.95,
			height:window.innerHeight*0.95,
			overflow:'hidden',
			position:'absolute',
			top:window.innerHeight*0.025,
			left:window.innerWidth*0.025,
		});

		el.container.addClass('onepage');


		if (el.imagecontainer.find('img').length > 0){
			el.textscroll.css({			
				height:window.innerHeight/3+'px',
				overflow:'hidden'			
			});

			el.imagescroll.css({
				height:(el.container.height()-el.textscroll.height())-30
			})

			el.imagecontainer.css({
				height:el.imagescroll.height()-30,
				'margin-top':'15px'
			});
		} else {
			el.textscroll.css({			
				height:el.container.height()-30,
				overflow:'hidden'			
			});			
		}

		el.imagecontainer.find('img').each(function(){
			$(this).css({
				'height':el.imagecontainer.height()-50,
				'margin-top':'25px'
			});

			$(this).addClass('imagescroll-image')
		});

		return el.container;
	},

	plainContent: function(data) {
		var pagecontainer = $('<div id="plainContentContainer"></div>');			
		var textwrapper  = $('<div id="plainContentTextWrapper" class="iscroll" />');
		var textcontainer = $('<div class="textcontainer" />');

		pagecontainer.append(textwrapper.append(textcontainer));

		for (var i in data.items){
			
			var item = this.makeItem(data.items[i]);
			
			if (item instanceof Array){

				for (var c in item){
					if (item[c] != false){
						pagecontainer.append(item[c]);
						item[c].addClass('user-draggable drag-rotate drag-scale gallery-image random-position');
						item[c].find('img').css({
							'max-width':window.innerWidth*0.5,
							'max-height':window.innerHeight*0.5
						});

						item[c].css({
							position:'absolute',
							top:'10%',
							left:'10%'
						})
					}
				}

			} else {
				if (item != false){
					textcontainer.append(item);
					//item.addClass('user-draggable random-position');
				}
			}
		}
		
		return pagecontainer;
	},

	makeItem:function(item){
		
		if (item.tag == 'img'){
			var c = [];			
			
			for (var i in item.img){
				var a = $('<div class="imagecontainer" />');
				var imgs = getPageImages(item.img[i]);
				a.append(imgs);
				c.push(a);			
			}

			return c;

		} else {
			var tag =item.tag,
				eitem = $('<'+tag+'>'+getText(item.text)+'</'+tag+'>');
			
			
				setTextData(eitem,item.text);				
			
		}
		return eitem;
	}
}

function chLang(element,lang){
	element.find('.multilanguage-text').each(function(){
		var text = $(this).attr(lang);

		if (text){
			$(this).text(text);
		}
	});
}

function setTextData(element,text){	
	for (var i in text){
		element.attr(i,text[i]);
	}
	element.addClass('multilanguage-text');
}

function page(data){
	this._style = data.properties.style;

	if (data.items){
		if (data.items instanceof Array){
			data.items.sort(function(a,b){
				return a.index - b.index;
			})
		}
	}

	if (pagebuilder[data.properties.style]!=undefined){
		this._element = pagebuilder[data.properties.style](data);		
	} else {
		return false;
	}
}

page.prototype = {
	applyOverlay:function(){
		var overlay = $('<div class="overlay"></div>');
		overlay.css({
			width:'100%',
			height:'100%',
			position:'fixed',
			left:'0px',
			top:'0px',
			'background-color':'rgba(0,0,0,0.7)',
			'opacity':0
		});

		$('#wrapper').append(overlay);


		overlay.animate({
			opacity:1
		},500);

		onTap(overlay);

		var me = this;
		overlay.click(function(){
			me.remove();
		})

		this._overlay = overlay;
	},
	remove : function(){
		this._element.addClass('hidden-zoomed');
		
		var me = this;
		
		this._overlay.animate({
			opacity:0
		},500);

		setTimeout(function(){
			me._element.remove();
			me._overlay.remove();
		},500);

	},
	setLang:function(lang){
		chLang(this._element,lang);
	},
// 	addLangList:function(){
// 		var me = this;
// 		this._langList = getLangList(function(e){
// 			me.setLang(e);
// 		});
// 		$('body').append(this._langList);
// 	},
	show : function(){
		this.applyOverlay();
		$('body').append(this._element);
// 		this.addLangList();

		this._element.css({
			opacity:0
		}).addClass('hidden-zoomed');


		var me = this;
		
		this._overlay.append('<h2>LOADING</h2>');

		this.loaded(function(){
			me.setImageContainerWidth();
			
			
			me._element.find('.imagecontainer').css('opacity',0);
			
			me._element.find('.imagecontainer').animate({
				opacity:1
			},500);

			setTimeout(function(){
				ready();
			},700);
			
			me._element.css({
				opacity:1
			}).removeClass('hidden-zoomed')
			
		});

		function ready(){
			me.fittext();			
			me.setZoom();
			me.setIscroll();
			me.setDraggable();			
			me._overlay.find('h2').remove();
		}
	},
	randomizePosition:function(){

		var midx = window.innerWidth/2,
			midy = window.innerHeight/2;

		this._element.find('.random-position').each(function(){
			var size = {x: $(this).width(),y:$(this).height()},
				pos = {
						position:'absolute',
						top: Math.random()*(window.innerHeight-size.x),
						left:Math.random()*(window.innerWidth-size.y)
					};

			$(this).css(pos);

			console.log(size);

		});
	},
	setDraggable:function(){
		this._element.find('.user-draggable').each(function(){
			var deg = (Math.random()*20)-10;
			var dr = new draggable($(this),{
				rotation:{
					min:-90,
					max:90,					
					start:deg
				},
				scalable:false
			});
			dr.init();	
		});
	},
	setZoom:function(){
		
		this._element.find('.zoomtarget').each(function(){

			tap(this);
			n = Math.random()*10;
			if (n < 5){
				n = -10-n;
			}

			$(this).attr('data-closeclick','true').zoomTarget();

		});
	},
	fittext:function(){
		this._element.find('.textfit').children().each(function(){
			$(this).css({
				width:$(this).parent().width()-20,
				height:140
			});			
			$(this).textFit({alignHoriz:true, alignVert:true,multiLine:true});
		});

	},
	setIscroll:function(){
		this._element.find('.iscroll').each(function(){

			if ($(this).attr('zoom') =='true'){
				var sc = new iScroll($(this).attr('id'),{zoom:true,lockDirection:false,hideScrollbar:true});
			} else {
				var sc = new iScroll($(this).attr('id'),{lockDirection:false,hideScrollbar:true});
			}
		})

	},
	loaded:function(callback){
		var images = this._element.find('img'),
			me = this,
			count = images.length,
			el = this._element;
			this._element.css('display','none');
		if (images !=undefined && count>0){
			$.each(images,function(){
				$(this).load(function(){
					count--;
					if (count == 0){
						me._element.css('display','block');						
						callback();
					}			
				});
			});
		} else {
			me._element.css('display','block');						
			callback();
		}
	},
	setImageContainerWidth:function(){
		//el.css('display','block');
		var el = this._element.find('.imagescroller');
		
		if (el.length > 0){
			var total_width = 0,
				images = el.find('img');

			$.each(images,function(){
				total_width += $(this).outerWidth(true);
			});

			el.css('width',total_width);
		}
	}
}



function langSelector(){
	this._element = $('<div class="langselector container" />');
	this.makeButtons();
	this.select(langs[0]);
}

langSelector.prototype = {
	getData:function(){
		var e = this._element.find('.selected');
		if (e.length == 1){
			return e.attr('data-value');
		} else {
			return false;
		}
	},
	select:function(lang){
		var e = this._element.find('[data-value="'+lang+'"]');

		if (e.length > 0){
			this._element.find('button').removeClass('selected');
			e.addClass('selected');
			this.onchange(lang);			
		}
	},
	getElement:function(){
		return this._element;
	},
	makeButtons:function(){
		for (var i in langs){
			this.makeButton(langs[i]);
		}
	},
	makeButton:function(lang){
		this.addButton($('<button class="langbutton" data-value="'+lang+'">'+lang+'</button>'));
	},
	addButton:function(btn){
		var me = this;
		btn.click(function(){
			if (!$(this).hasClass('selected')){			
				me.select($(this).attr('data-value'));
			}
		});

		this._element.append(btn);
	},
	onchange:function(val){
		if (typeof(this._callback)=='function'){
			this._callback(val);
		}
	},
	change:function(callback){
		this._callback = callback;
	}
}

function inputset(obj){
	this._inputs = {};
	this._element = $('<div class="inputset" />');

	if (obj.header){
		this._element.append('<h3 class="inputset_header">'+obj.header+'</h3>');
	}

	this.name = obj.name;

	for (var i in obj.inputs){		
		var field = new input(obj.inputs[i]);
		this._element.append(field.getElement());
		this._inputs[field.name] = field;
	}
}

inputset.prototype = {
	load:function(data){
		for (var i in data){
			this._inputs[i].load(data[i]);
		}
	},
	getData : function(){
		var result = {};
		for (var i in this._inputs){
			var d = this._inputs[i].getArray();			
			result[d[0]] = d[1];
		}
		return result;
	},
	getElement:function(){
		return this._element;
	}
}

function input(obj){
	for (var i in obj){
		this[i] = obj[i];
	}
	
	this._element = $('<div class="inputcontainer" />');
	
	if (obj.type == 'select' ||obj.type=='boolean'){
		this._input = $('<select />');
		
		if (obj.type =='boolean'){
			this._input.append( $('<option value="true">true</option>') )
						.append( $('<option value="false">false</option>') );

		} else if (obj.src){
			for (var i in obj.src){
				this._input.append('<option value="'+obj.src[i]+'">'+obj.src[i]+'</option');
			}
		}

	}  else if (obj.type == 'image') {
			this._input = $('<div class="inputitem" />');
			this._inputObj = new imgInput();
			this._inputObj.setSize([128,128]);
			this._input.append(this._inputObj.getElement());
	} else {
		this._input= $('<input type="'+obj.type+'" />');
	}

	if (obj.tooltip){
		//this._element.append('<span>'+obj.tooltip+'</span>');
		//this._element.addClass('tooltip');
	}

	this._input.attr('name',obj.name);

	if (obj.default){
		this.select(obj.default);
	}

	if (obj.caption){
		this.setCaption(obj.caption);
	}

	this._element.append(this._input);
}

input.prototype = {
	setData:function(data){
		var str = JSON.stringify(data).escape();
		this._input.attr('data',str);
	},
	getElement : function(){
		return this._element;
	},
	load:function(data){
		if (typeof(data) == 'string'){
			this.select(data);
		} else {
			if (this.type == 'image'){
				this._inputObj.load(data);
			}
		}
	},
	select : function(value){
		if (this.type == 'select' || this.type == 'boolean'){
			this._input.find('option[value="'+value+'"]').attr('selected','selected');		
		} else if (this.type == 'image'){			
			this._inputObj.load(value);
		} else {
			this._input.val(value);
		}
	},
	getArray : function(){
		if (this.type != 'image'){
			if (this._input.attr('data') == '' || this._input.attr('data') == undefined){
				return [this._input.attr('name'),this._input.val()];
			} else {
				return [this._input.attr('name'), JSON.parse( this._input.attr('data')) ];
			}
		} else {
			return [this.name,this._inputObj.getData()];
		}
	},
	getData : function(){
		var result = {};
		if (this.type != 'image'){
			result[this.name] = this._input.val();
		} else {
			result[this.name] = this._inputObj.getData();
		}		
		return result;
	},
	setCaption:function(text){
		this._element.prepend('<p class="input_caption">'+text+'</p>');
	}
}


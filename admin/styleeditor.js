function styleEditor(callback){
	editorwindow.call(this);
	this.callback = callback;

	
	this.setSize(window.innerWidth*0.45 < 700 ? 700 : window.innerWidth*0.45,window.innerHeight*0.9);
	this.setPosition('center');
	this.setHeader('presentation','style');

	this.props = $('<div class="editorwindow_properties" />');
	this.nameInput = $('<input type="text" name="name" placeholder="name"/>');
	this.inputcontainer = $('<div class="editorwindow_inputcontainer" />');

	this.nameInput.val('style '+actions.getName());

	var me = this;
	this.on('show',function(){
		me.applyOverlay();
	});
	
	this.props.append(this.nameInput);
	this.append(this.props);
	this.append(this.inputcontainer);

	this.addToolbar();
	this.addTool('img/save.png','saveas','save as a new style');
	this.addTool('img/check-alt.png','accept','apply this style');
	this.addTool('img/database-download.png','import','import from database');
	this.addTool('img/cancel.png','discard','discard this style');

	this.addClass('styleeditor');
	//, new inputset(breadcrumbs)
	this.inputs = [new inputset(presentationStyle), new inputset(menustyle), new inputset(buttonstyle)];

	for (var i in this.inputs){
		this.inputcontainer.append(this.inputs[i].getElement());
	}
	this.props.css({
		height:'96px'
	})

	this.inputcontainer.css({
		top:'106px',
		height:this._container.height()-210
	});
}


styleEditor.prototype = new editorwindow();

styleEditor.prototype.saveas = function(){
	delete this._id;
	delete this._rev;
	this.accept();
}

styleEditor.prototype.accept = function(){
	var me = this;
	this.save(function(data) {
		if (typeof(me.callback) == 'function'){
			me.callback(me.getData());
		}
		me.remove();
	});
}

styleEditor.prototype.load = function(data){
	this.nameInput.val(data.properties.name);
	this._id = data._id;
	this.timeStamp = data.timeStamp;
	for (var i in data){
		for (var c in this.inputs){
			if (this.inputs[c].name == i){
				this.inputs[c].load(data[i]);
			}
		}
	}
}

styleEditor.prototype.chkInput = function(){
	// soon-to-be-bigger
	var txt = this.nameInput.val();	
	if (txt.length > 4){
		return true;
	} else {
		return false;
	}
}

styleEditor.prototype.save = function(callback){
	var me = this;
	if (this.chkInput()){	
		var data = this.getData();

		saveItem(data,function(result){
			
			me._id = result._id;
			me.timeStamp = result.dataTimeStamp;
			me._fire('save',me.getData());

			if (typeof(callback) == 'function'){
				callback(result);
			}
		});
		
		return data;
	} else {
		return false;
	}
}

styleEditor.prototype.import = function(){
	var me = this;
	var p = new picker({type:'style'},function(result){
		
		getData(result,function(data){
			me.load(data);
		});
	});
}

styleEditor.prototype.discard = function(){
	this.remove();
}

styleEditor.prototype.getData = function(){
	var style = {};

	for (var i in this.inputs){
		var d = this.inputs[i].getData();
		style[this.inputs[i].name] = d;		
	}

	style.properties = {
		name:this.nameInput.val()		
	}

	style.type = 'style';
	
	if (this.timeStamp == undefined){
		style.timeStamp = Date.now();
	} else {
		style.timeStamp = this.timeStamp;
	}

	if (this._id != undefined){
		style._id = this._id;
	}

	return style;
}



var presentationStyle = {
	name:'presentation',
	header:'Presentation',						
	inputs:[
	{							
		name:'style',
		type:'hidden',		
		value:'normal'		
	},/*
	{							
		name:'markernamezoom',
		type:'text',
		default:'10',
		caption:'Marker name text zoom',
		tooltip:'zoom level when marker name texts are show when zooming in, and hidden when zooming out'
	},*/
	{							
		name:'showlogo',
		type:'boolean',
		default:'true',
		caption:'Show presentation logo',
		tooltip:'show presentation logo and name text on presentation window, acts as a home button for presentation'
	},
	{							
		name:'showbackbutton',
		type:'boolean',
		default:'false',
		caption:'Back button to get back in to the main list view',
		tooltip:'lka sfglkafg'
	},
	{								
		name:'logoposition',
		src:['left-top','right-top','left-bottom','right-bottom'], //,'center-top','center-bottom'],
		caption:'logo position',
		type:'select',
		title:'presentation logo positioning on screen'
	},

	{							
		name:'showmainmenu',
		type:'boolean',
		default:'false',
		caption:'Show mainmenu',
		tooltip:'show mainmenu, if attached to presentation'
	},
	{							
		name:'showbreadcrumbs',
		type:'hidden',
		default:'false',
		/*
		caption:'show breadcrumbs',
		tooltip:'show breadcrumbs toolbar on presentation'
		*/
	},
	{								
		name:'markerstyle',
		type:'select',
		src:['gray-border','white-border','white-noborder','gray-noborder'],
		caption:'Marker style',
	}

	]};

var menustyle = {
		name:'mainmenu',
		header:'MainMenu',
		inputs:[
		/*
			{
				name:'mode',
				type:'select',
				src:['normal','draggable'],
				caption:'menu mode'
			},
		*/
			{
				name:'mode',
				type:'hidden',
				value:'normal'
			},
			{								
				name:'style',
				type:'select',
				src:['buttons','slider','tiles'],
				caption:'Menu style',							
			},
			{								
				name:'position',
				src:['left','right','top','bottom'],
				caption:'Location',
				type:'select',
				title:'main menu location on screen'
			},
			{
				name:'button_rotate',
				type:'boolean',
				caption:'rotate buttons',
				default:'true',
				title:'randomly rotate menu buttons'
			},
			{								
				name:'size',
				default:170,
				type:'text',
				caption:'Size',
				title:'width / height of menu on screen (depends on orientation) (thickness?)'
			},
			{
				name:'background_image',
				placeholder:'background image',
				type:'image',
				//picker:'images',
				caption:'Background image',
				title:'main menu background image url'
			},
			{
				name:'background_color',
				type:'color',
				placeholder:'Background color',
				default:'#000000',
				caption:'Background color',
				title:'color for menu background'
			},
			{
				name:'background_opacity',
				//placeholder:'1.0',
				default:'1',
				caption:'Background opacity',
				type:'text',
				title:'background transparency, 1 is opaque, 0 completely transparent'
			},
			{
				name:'css',
				type:'textarea',
				caption:'css',
				placeholder:'property:value;property:value;',
				title:'css code to apply on element on presentation,example: property:value;property:value;'
			},														
		]
}




var buttonstyle = {
	name:'buttons',
	header:'MainMenu buttons',
	inputs:[
	{
		name:'width',
		type:'text',
		placeholder:'128',
		default:128,
		caption:'Width'
	},
	{
		name:'height',
		type:'text',
		placeholder:'128',
		default:128,
		caption:'Height'
	},
	{
		name:'border_color',
		type:'color',
		caption:'Border color'
	},
	{
		name:'text_size',
		type:'text',
		default:16,
		caption:'Text size'
	},
	{
		name:'color',
		type:'color',
		caption:'Text Color'
	},
	{
		name:'text_background_color',
		type:'color',
		caption:'Text Background Color',
		default:'#ffffff'
	},
	{
		name:'text_background_opacity',
		type:'text',
		default:'0',
		caption:'Text Background opacity'
	},
	{
		name:'background_color',
		type:'color',
		caption:'Background Color'
	},
	{
		name:'background_opacity',
		type:'text',
		default:'1',
		caption:'Background opacity'
	},
	{
		name:'showimages',
		type:'boolean',
		default:'1',
		caption:'Show images',
		title:'will the assigned images be shown on presentation'
	},
	{
		name:'overlay',
		type:'boolean',
		default:'1',
		caption:'Show glossy overlay',
		title:'show glossy effect overlay image on button'
	},
	{
		name:'css',
		type:'textarea',
		caption:'css',
		placeholder:'property:value;property:value;',
		title:'css code for element'
	},														


	]
};
/*
var	breadcrumbs = {
	name:'breadcrumbs',
	header:'Layers (breadcrumbs)',
	inputs:[
		{
			name:'position',
			type: 'select',
			src:['top','bottom'],
			caption:'Location',
			title:'position on screen, note: does not take account menu position, so you have to be careful with it if menu is also visible'
		},
		{
			name:'size',
			type:'text',								
			default:'20',
			caption:'Size',
			title:'toolbar size, widh or height depending on position'
		},
		{
			name:'background_color',
			type:'color',
			default:'#000000',
			caption:'Background color'
		},
		{
			name:'background_image',
			type:'image',								
			caption:'Background image'
		},
		{
			name:'background_opacity',
			type:'text',								
			default:'0.5',
			caption:'Background opacity'
		},
		{
			name:'item_background_color',
			type:'color',
			default:'#000000',
			caption:'item Background color'
		},
		{
			name:'color',
			type:'color',
			default:'#ffffff',
			caption:'text color'
		},
		{
			name:'css',
			type:'textarea',
			caption:'css',
			placeholder:'property:value;property:value;',
			title:'css code'
		},														
													
	]						
}
*/
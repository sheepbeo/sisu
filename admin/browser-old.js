function repoBrowser(opts,callback){
	editorwindow.call(this);
	this.callback = callback;
	this.setSize(window.innerWidth*0.95 < 600 ? 600 : window.innerWidth*0.95 ,window.innerHeight*0.9);
	this.setPosition('center');
	this.opts = opts;
	this.setHeader('repo',opts.getItemsByType);
	this.applyOverlay();

	this.srch = $('<div class="reposearchbar" />');
	this.limit = $('<input type="text" name ="limit" value="100" id="repoquerysize"/>')
	this.input = $('<input type="text" name="search" id="reposearch" />');
	this.imageinput = new imgInput();
	this.imageinput.setSize([96,96])

	this.resultcontainer = $('<div class="reporesult" />');
	this.resultTable = $('<table class="reporesultTable" />')

	this.resultcontainer.css({
		height:this._element.height()-380
	});

	this.addToolbar();
	this.addTool('img/arrow-3-down.png','import','import items');
	this.addTool('img/cancel.png','remove','cancel');

	this.srch.append(this.limit).append(this.input);	
	
	this._iconList = new markerList();
	this.srch.append( $('<div class="browser horizontal_selectlist" />').append(this.imageinput.getElement()).append(this._iconList.element) );

	this._iconList.element.addClass('repo_markericonlist');

	this.append(this.srch);
	this.append(this.resultcontainer);
	this.append(this.toolbar);
	this.resultcontainer.append(this.resultTable);
	this.addClass('repobrowser');
	
	this.getItemsByType(opts.getItemsByType);

	var me = this;
	this.input.on('keypress',function(e){
		if (e.keyCode == 13){
			me.search();
		}
	});
}

repoBrowser.prototype = new editorwindow();


repoBrowser.prototype.search = function(str){
	var me = this;
	var str = this.getSearchString();
	var extra = '';
/*
	if (this.opts.getItemsByType){
		extra =  ' AND type:'+this.opts.getItemsByType;
	}
*/
	var data = {
		'q':str + extra //,
		//'size':this.getLimit()
	}

	searchRepo(data,function(e){		
		me.createTable(e);		
	});

}

repoBrowser.prototype.getItemsByType = function(type){
	var me = this;

	var data = {
		q:'type:'+type,		
		'size':this.getLimit()
	}

	searchRepo(data,function(e){
		me.createTable(e);		
	});

}

repoBrowser.prototype.createTable = function(data){	
	this.resultTable.empty();
	//this._headers = {};

	for (var i in data){			
		var row = this.createRow(data[i]);
		if (row){
			this.resultTable.append(row);
		}
	}
	this.createHeaders();

}


repoBrowser.prototype.createHeaders  =function(){
	var row = $('<tr>');
	var cell = $('<th></th>');
	row.append(cell);
	//this._headers = ['sitename','city','x','y','description','timeperiod','type','subtype','excavated'];
	this._headers = ['type','lat','lng','sitename','city','x','y','description','timeperiod','type','subtype','excavated'];

	for (var i in this._headers){
		var cell = $('<th>');
		cell.text(this._headers[i]);		
		row.append(cell);
	}
	this.resultTable.prepend(row);
}

repoBrowser.prototype.getSelected = function(){
	var result = Array();
	
	if (this.resultTable.find('input:checked').length > 0){

		this.resultTable.find('input:checked').each(function(){
			result.push( $(this).parent().parent().attr('id') );
		});
	}
	return result;
}

repoBrowser.prototype.createRow = function(data){
	var me = this;
	
	if (data._id != undefined){
		var row = $('<tr>');
		row.attr('id',data._id);

		for (var i in data){	

			if (typeof(data[i]) != 'object'){
				var item = this.createCell(data[i]);				
				//this._headers[i] = i;
			} else {
				var item = '';
				for (var c in data[i]){
					item += this.createCell(data[i][c]);
					//this._headers[c] = c;
				}
			}
			
			if (item){
				row.append(item);
			}
		}


		row.prepend('<td><input type="checkbox" name="select"></input></td>');


		row.click(function(){
			var bx = $(this).find('input');
			if (bx.length > 0){
				bx.prop('checked', !bx[0].checked);
			}
		});

		row.dblclick(function(){
			me.resultTable.find('tr').each(function(){
				var bx = $(this).find('input');
				if (bx.length > 0){
					bx.prop('checked', !bx[0].checked);	
				}
			})
		});

		return row;
	} else {
		return false;
	}
}

repoBrowser.prototype.createCell = function(item){
	var text ='';	
	if (typeof(item) == 'object'){

		for (var i in item){
			if (typeof(item[i]) != 'object'){
				text = item[i]
			}
		}		
	} else {
		text = item;
	}

	if (item != ''){
		return '<td>'+ellipsify(text)+'</td>';
	} else {
		return false;
	}

}


repoBrowser.prototype.import = function(){
	var items = this.getSelected();
	var yes = true;

	if (items.length > 0){
		if (items.length > 50){
			yes = confirm('really import '+items.length+' items??');
		}
		
		if(typeof(this.callback) == 'function' && yes){
			this.callback(items,{icon:this.imageinput.getData(),markericon:this._iconList.getData()._id});		
			this._fire('import',items);
			this.remove();
		}

	} else {
		alert('cannot import 0 items')
	}

}

repoBrowser.prototype.getLimit = function(){
	if ($.isNumeric(this.limit.val())){
		return this.limit.val();
	} else {
		return 100;
	}
}


repoBrowser.prototype.getSearchString = function(){
	
	var size = 100;
	if (this.getLimit()){
		size = this.getLimit();
	}
	return this.input.val() + '&size='+size;
	/**/
	//return this.input.val();
}


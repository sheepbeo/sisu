
function ellipsify(text,length){
	if (!length){
		length = 64;
	}
	var _text = text;

	if (typeof(text) == 'string'){
		if (text.length > length){
			_text = text.substr(0,length-3);
			_text += '...';
		}
	}
	return _text; 
}



function stamp(obj,data){
	if (obj._id != undefined){
		data._id =  obj._id;
	}


	if (obj.timeStamp == undefined){
		data.timeStamp = Date.now();
	} else {
		data.timeStamp = obj.timeStamp;
	}

	return data;
}

function setStamp(obj,data){
	if (data._id != undefined){
		obj._id = data._id;
		obj.timeStamp = data.timeStamp;
	}	
}

function selectFromList(listobj,value){
	$(listobj).find('option[value="'+value+'"]').attr('selected','selected');
}


var colors = [
	[169,209,64,1],
	[147,200,138,1],
	[140,207,202,1],
	[92,126,194,1],
	[128,128,201,1],
	[201,125,200,1],
	[194,73,73,1]
]




function setInputText(text){
	var txt = '';
	if (typeof(text) == 'object'){

		for (var i in text){
			//txt += '['+i+']: '+text[i]+' ';
			txt = text[i];
			break;
		}
	}
	return txt;
}

// to be multilanguage
function getInputText(input){
	return {fin:input.val()};
}

function getText(data){
	if (data != undefined){
		if (data.fin != undefined){
			return data.fin;
		} else {
			return 'n/a';
		}
	} else {
		return '';
	}
}

function getColorList(){
	var list = $('<ul class="colorlist">');

	for (var i in colors){		
		var color = $('<li>');
	
		color.css('background-color','rgba('+ colors[i].join(',')+')');
		color.addClass('colorpick_item');
		color.attr('data-value','color:'+'rgba('+ colors[i].join(',')+')');
		list.append(color);

		color.click(function(){			
			list.find('.selected').removeClass('selected');
			$(this).addClass('selected');
	});		
	}

	color.addClass('selected')


	return list;
}

function getDataValue(item){
	var val = item.attr('data-value').split(':');

	var result = {};
	result[val[0]] = val[1];
	return result;
}


function selectFromList(list,value){
	var item = list.find('[data-value="'+value+'"]');

	if (item != undefined && item.length > 0){
		if (!item.hasClass('selected')){
			list.find('selected').removeClass('selected');
			item.addClass('selected');
			return true;
		} else return false;
	} else	 return false;
}



function droppable(element,callback){
	if (element instanceof jQuery){
		element = element[0];
	}

	element.addEventListener('dragover',function(e){
		e.preventDefault();
		e.stopPropagation();
		e.dataTransfer.dropEffect = 'copy';
	});

	element.addEventListener('drop',function(e){
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer.files.length > 0 ){
			callback(e,e.dataTransfer.files);
		}
	});
}

function readFiles(file,callback){
	
	if (file instanceof Array){
		var result = Array();
		var c = file.length;

		for (var i in file){
			c--;
			
			readFiles(file[i],function(f,type){
				result.push([f,type]);
			});

			if (c==0){
				callback(result);
			}
		}
	} else {
		var reader = new FileReader();

		reader.onload = function(tfile){
			var type = file.name.split('.');
			type = type[type.length-1];
			file.name = file.name.replace(/\./g,'');
			
			callback(tfile.currentTarget.result,type);
		};
		
		if (file.name.substr(-4) == '.kml'){
			reader.readAsText(file);
		} else {
			reader.readAsDataURL(file);
		//reader.readAsBinaryString(file);
		}
		//https://developer.mozilla.org/en-US/docs/DOM/FileReader
	}
}




/*
function getMarkerIconList(){
	var list = $('<ul>');

	for (var i in markericons){
		var m = $('<li>');

		m.append('<img width="64px" heigth="64px" src="'+markericons[i].path +'/'+ markericons[i].name+'"></img>')
		list.append(m);
		m.attr('data-value',escape(JSON.stringify(markericons[i])));
		m.attr('id',markericons[i]._id)
		
		m.css({
			width:'64px',
			heigth:'64px'
		});

		m.click(function(){			
			if (!$(this).hasClass('selected')){								
				list.find('.selected').removeClass('selected');
				$(this).addClass('selected');
			}
		});		
	}
	list.css('width',markericons.length  * (64 + 10));

	m.addClass('selected');

	return list;
}
*/


function bulkUpload(data,callback){	
	var uData = '';
	for (var i in data){		
		var index = data[i].type;
		uData += '{index:"'+index+'"}\n'+JSON.stringify(data[i])+'\n';
	}	

	$.ajax({
		url: DBURL + index + '/_bulk',
	    type: 'POST',
	    data: uData,
	    dataType: 'JSON',
   		contentType: 'application/json',
	    success: function(response){
	    	callback(response);
	   	},
	    error:function(data){
	    	callback(data);
	    }            
	});

}










function sendImages(files,callback,oneach){
	var count = files.length;
	var result = [];

	function rf(tfile,callback){		
		var reader = new FileReader();		
		reader.onload = function(file){
			callback(file.currentTarget.result,tfile);
		};
		//reader.readAsBinaryString(tfile);
		reader.readAsDataURL(tfile);
	}

	for (var i in files){		

		rf(files[i],function(e,f){

			f.name.replace(/\ /g,'');
			var tfile = f.name.split('.');
			var type = tfile.pop();	

			var file = {
				data:e.split(',')[1],
				type:f.type,
				size:f.size,
				name:tfile.join('')+'.'+type,//f.name,
				origheader:e.split(',')[0]
			};
			
			var data = {
				files:[file],
				//resize:[[128,128],[512,512],[256,256],[1024,1024]]
			}


			$.ajax({
				url:IMGURL,
				type:'POST',				
				data:data,
				dataType:'json',
				success:function(e){
					count--;
					result.push(f.name)

					if (typeof(oneach)=='function'){
						oneach(f);
					}

					if (count == 0){						
						callback(result);
					}
				},
				error:function(e){
					console.log(e);	
					callback(false);
				}
			})
		});

	}
}

function sortByTimestamp(data){
	data.sort(function(a,b){return b.timeStamp - a.timeStamp})
	return data;
}

function bulkUpload(data,callback){	
	var uData = '';
	for (var i in data){		
		var index = data[i].type;
		uData += '{index:"'+index+'"}\n'+JSON.stringify(data[i])+'\n';
	}

	$.ajax({
		url: dbURL +'/'+ index + '/_bulk',
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

function getPageImages(names){
	
	if (names instanceof Array){
		var imgs = [];
		for (var i in names){
			imgs.push(getPageImages(names[i]));
		}
		return imgs;

	} else {		
		var img =$('<img src="'+IMGURL + '?img='+names+'&full=true"></img>');
		return img;
	}
}

function getFullImage(name){
	if (typeof(name) == 'object'){
		name = name.name;
	}

	return IMGURL + '?img='+name+'&full=true';
}

function isGif(name){
	if (typeof(name) == 'string'){
		return name.substr(-3) == 'gif';
	} else {
		return false;
	}
}

function getImage(name,size){
	if (isGif(name)){
		return IMGFOLDER + 'ORIGIM.'+name;
	} else {
		if (size == undefined || size[0] == 0 || size[1] == 0 || name.size == undefined){
			size = [128,128];
		}

		if (name.size && !size){
			size = name.size;
		} else {
			name.size = size;	
		}

		if (typeof(name) == 'object') {
			if (name.icon == true){
				return name.path + '/' + name.name;
			}

			if (name.size == undefined || name.size[0] == 0 || name.size[1] == 0){
				name.size = size;
			}			

			if (name.name){			
				if (isGif(name.name)){
					return IMGFOLDER + 'ORIGIM.'+name.name;
				} else {
					return IMGURL + '?img='+name.name+'&x='+name.size[0]+'&y='+name.size[1];						
				}
			} else {
				return name.path;
			}	
		} else return IMGURL + '?img='+name+'&x='+size[0]+'&y='+size[1];
	}
}

function getImageElement(name,size){
	if (size == undefined){
		size = [128,128];
	}
	var img = $('<img src="'+getImage(name,size)+'" />');
	return img;
}


function isImage(file){
	var is = false;
	if (file.type){
		var f = file.type.split('/');

		if (f[0] == 'image'){
			is = true;
		}
	}
	return is;
}


function loadItemCollection(collectiondata,callback){
	var items = [];

	for (var i in collectiondata.items)	{
		items.push(collectiondata.items[i]._id);
	}

	getMany(items,function(result){
		collectiondata.items = result;

		callback(collectiondata);
	});

}


function loadPresentation(id,callback){
	getData(id,function(base){		
		if (base){
			if (base.properties.menu && base.properties.theme){
				
				getData(base.properties.menu,function(menu){		

					menu.items.sort(function(a,b){return a.index > b.index});

					base.properties.menu = menu;
					getData(base.properties.theme,function(theme){				
						base.properties.theme =  theme;
						callback(base);
					});
				});
			} else {
				callback(false);
			}
		} else {
			callback(false);
		}
	}); 
}


function deleteItem(id,callback){
	$.ajax({		
		url:DBURL+'/_query?q=_id:"'+id+'"',
		type:'DELETE',
		datatype:'JSON',			
		success:function(result){			
			callback(result);
		},
		error:function(result){
			callback(false);
		}
	});	
}

function getId(id){

	if (id instanceof Array){
		id = id[0];
	} else if (typeof(id) == 'object' ){
		if (id._id){
			id = id._id;
		} else {
			throw 'error at id with getData';
		}
	}

	return id;
}

function getData(id,callback){
	
	id = getId(id);

	$.ajax({
			//url:dbURL + '/_search?q=_id:'+id,
			url:baseURL + '/_search',
			
			data:{
				q:'_id:"'+id+'"'
			},
			
			method:'GET',
			datatype:'JSON',			
			success:function(result){
				//console.log(result);
				callback(parseReply(result)[0]);
			},
			error:function(result){
				//console.log(result);
				callback(false);
			}
	});
}

function parseReply(reply){	
	var result = Array();
	
	if (reply.hits != undefined){
		if (reply.hits.hits != undefined){
			if (reply.hits.hits.length > 0){
				for (var i in reply.hits.hits){
					var item = reply.hits.hits[i]._source;
					item._id = reply.hits.hits[i]._id;
					result.push(item);
				}
			}
		}
	}

	if (result.length == 0) result = false;
	return result;
}

function searchbyUrl(obj,callback){
	
	if (obj.limit == undefined){
		obj.limit = 100;
	}

	if (obj.url == undefined){
		obj.url = dbURL;
	}

	if (obj.q != undefined){
		$.ajax({
				url:obj.url + '/_search?q='+obj.q+'&size='+obj.limit,
				method:'GET',
				datatype:'JSON',
				success:function(result){				
					var items = parseReply(result);
					callback(items);
				},
				error:function(result){
					callback(false);
				}
		});
	} else {
		callback(false);
	}
}

function search(str,callback,limit){
	if (limit == undefined){
		limit = 100;
	}
	$.ajax({
			url:dbURL + '/_search?q='+str+'&size='+limit,
			method:'GET',
			datatype:'JSON',
			success:function(result){				
				var items = parseReply(result);
				callback(items);
			},
			error:function(result){
				callback(false);
			}
	});

}

function getTimeStamp(id,callback){	
	getData(id,function(item){
		callback(item.timeStamp);
	});
}

function uploadMany(data,callback){
	var count = data.length,
		result = Array();


	for (var i in data){
		saveItem(data[i],function(ur){
			if (ur != false){
				data[i].timeStamp = data.dataTimeStamp;
				result.push(ur);
			} else {
				throw 'itemsaveerror';
				
			}

			count--;

			if (count == 0){
				callback(result);
			}
		})
	}
}

function getMany(data,callback){
	var count = data.length,
		result = Array();

	for (var i in data){
		getData(data[i],function(res){			
			
			result.push(res);

			if (result.length == count){
				callback(result);
			}
		})
	}
}


function getItem(id,callback){
	getData(id,function(data){

		if (data.type == 'itemcollection'){
			var items =Array();
			for (var i in data.items){
				items.push(data.items[i]._id);				
			}

			getMany(items,function(itemsdata){

				data.items = itemsdata;
				callback(data);
			});			
		} else {
			callback(data);
		}
	});
}

function getItemCollection(id,callback){
	getData(id,function(collection){
		if (collection.type == 'itemcollection'){

		}
	})
}

function saveItemCollection(collection,callback){	
	uploadMany(collection.items,function(result){
		collection.items = result;

		saveItem(collection,function(res){			
			
			callback(res);
		});
	});
}

function saveItem(data,callback){	
	var mode = 'POST';

	if (data.type != undefined && data.type != '' && data.type != null && typeof(callback) == 'function'){		
		if (data._id != undefined && data.timeStamp != undefined){
			mode = 'PUT';			
			/*
			getTimeStamp(data._id,function(time){
				
				if (data.timeStamp == time){
					data.timeStamp = Date.now();


				} else {
					console.log(data.timeStamp)
					console.log(time)

					alert('somebody else has changed the data')
					callback(false);
					return;
				}
			});
			*/
			upload(mode,data,callback);
		} else {
			upload(mode,data,callback);
		}


	} else {
		throw('save function failure');
	}
}




function searchRepo(data,callback){
		//console.log(data);
		$.ajax({
			url:repositoryURL + '/_search',
			type:'GET',
			dataType:'JSON',
			data:data,
			contentType: 'application/json',
			success:function(result){					
				callback(parseReply(result));
			},
			error:function(result){
				callback(false);
			}
	});	
}

function searchData(data,callback){
		$.ajax({
			url:dbURL + '/_search',
			type:'POST',
			dataType:'JSON',
			data:JSON.stringify(data),
			contentType: 'application/json',
			success:function(result){					
				callback(parseReply(result));
			},
			error:function(result){
				callback(false);
			}
	});	
}

function upload(mode,data,callback){
	var ext = data.type,
		theUrl = dbURL;
	
	if (mode == 'PUT'){
		ext = data.type + '/' + escape(data._id);
	}

	if (ext){
		theUrl += '/'+ext;
	}

	$.ajax({
		url:theUrl,
		type:mode,
		dataType:'JSON',
		data:JSON.stringify(data),
		contentType: 'application/json',
		success:function(result){					
			if (result.ok == true || result.ok == 'true'){
				result.dataTimeStamp = data.timeStamp;
				callback(result);
			} else {
				callback(false);
			}
		},
		error:function(result){
			callback(false);
		}
	});
}

function deleteData(data,callback) {
	var	theUrl = dbURL;

	ext = data.type + '/' + escape(data._id);

	if (ext){
		theUrl += '/'+ext;
	}

	$.ajax({
		url:theUrl,
		type:'DELETE',
		dataType:'JSON',
		contentType: 'application/json',
		success:function(result){					
			if (result.ok == true || result.ok == 'true'){
				result.dataTimeStamp = data.timeStamp;
				callback(result);
			} else {
				callback(false);
			}
		},
		error:function(result){
			callback(false);
		}
	});
}


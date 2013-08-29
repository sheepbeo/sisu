function history(presentation){
	this._presentation = presentation;
	this._history = [];
}

history.prototype = {
	add:function(layer){
		var state = this._presentation.getState();
		//console.log(layer)
		this._history.push({
			state:state,
			layer:layer,
			id:Date.now()
		});

		if (this._history.length > 7){
			this._history.shift();
		}
	},
	prev:function(){

	},

	getState:function(id){
		var found = false;
		for (var i in this._history){
			if (this._history[i].id == id){
				found = this._history[i];
			}
		}
		return found;
	},
	getList:function(){
		var list = [];
		for (var i in this._history){
			list.push({
				//id:this._history[i].layer._id,
				id:this._history[i].id,
				name:getText(this._history[i].layer.name)
			});
		}
		console.log(list);
		return list;
	}

}

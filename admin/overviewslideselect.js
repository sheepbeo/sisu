function overviewslideselect(callback){
	editorwindow.call(this);

	this.setSize(300,400);
	this.setPosition('center');
	this.setHeader('overviewslide','select');
	
	this._targetinput = new targetDropInput();
	this.append(this._targetinput.getElement());
	
	this.addToolbar();
	this.addTool('img/check-alt.png','save','save and exit');	
	this.addTool('img/cancel.png','remove','discard');
}

overviewslideselect.prototype = new editorwindow();

overviewslideselect.prototype.save = function() {
	console.log("Saved");
	this.remove();
}
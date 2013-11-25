function overviewslideselect(callback){
	editorwindow.call(this);

	this.setSize(550,600);
	this.setPosition('center');
	this.applyOverlay();

	this.setHeader('overviewslide','select');
	
	this._targetinput = new targetDropInput();
	this.append(this._targetinput.getElement());
	
	this._overlay.hide(); //removing overlay effect, so we can drop other pages
	
	this.addToolbar();
	this.addTool('img/check-alt.png','save','save and exit');	
	this.addTool('img/cancel.png','remove','discard');
}

overviewslideselect.prototype = new editorwindow();

overviewslideselect.prototype.save = function() {
	console.log("Saved");
	this.remove();
}
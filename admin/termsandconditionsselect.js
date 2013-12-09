function termsandconditionsselect(callback){
	editorwindow.call(this);
	
	this.callback = callback;

	this.setSize(300,400);
	this.setPosition('center');
	this.setHeader('Terms and Conditions','select');
	
	this._targetinput = new targetDropInput('.itemlistitem[data-result*="page"]'); //
	$(this._targetinput.getElement()).addClass("centered");

	this.append($('<h3 class="inputset_header">Drag&amp;Drop the terms and conditions page</h3>'));
	this.append(this._targetinput.getElement());
	this.addToolbar();
	this.addTool('img/check-alt.png','save','save and exit');	
	this.addTool('img/cancel.png','remove','discard');
}

termsandconditionsselect.prototype = new editorwindow();

termsandconditionsselect.prototype.save = function() {
	console.log("Saved");
	this.remove();
	this.callback(this._targetinput.getData()._id);
}
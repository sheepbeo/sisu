function loadingDialog(text,text2){
	editorwindow.call(this);

	this.setSize(300,300);
	this.setPosition('center');
	this.setHeader(text,text2);

	this.img = $('<img>');
	this.img.attr('src','img/loading_wh.gif');
	this.img.css({
		width:'95%',
		heigth:'95%'
	});

	this.append(this.img);
	this.applyOverlay();
	this._overlay.unbind();
}

loadingDialog.prototype = new editorwindow();
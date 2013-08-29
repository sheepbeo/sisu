/*


	tekee html elementistä kosketuskäyttöisen

	palauttaa toiminnoilla varustetun html elementin käytettäväksi.
*/

var touchable = function(element,opts){
	var me = this;

	this.opts = {
		scalable:true,						// can it be scaled
		draggable:true,						// can it be dragged
		rotate:true,						// intial rotation
		inertia:true,						// does it use inertia? .. travel when released
		maxScale : 2.5,						// maximum scale
		minScale : 0.3,						// minimum scale of element
		maxScaleStep : 0.1,					// maximum scale per step
		rotation : 0,						// initial rotation
		maxRotateStep:2,					// maximum rotation per step
		scale : 1.000000000000000000000001,	// initial scale
		limited: false,						// limited to screen size
		removeOnOut:true,					// if outside screen, remove element
		screenMargin:-200, 					// margin
		setcenter: true,					// center on startup
		randomPosition: false,				// randomize startup positions
		touchmove:1,						// how many touchpoints on screen required to move object
		autosize:true,						// auto resize elements on startup to fit screen?

		onremove:function(){},				// callback when element removed
		onload:function(){},				// callback when element is ready to be used

	}


	this.opts = $.extend(this.opts,opts);


	this.container = $('<div></div>'); // container jonka sisässä kaikki pyörii
		

	
	this.element = element;
	this.container.append(this.element);
	

	this.container.css({
				position:'absolute',
				left:'0px',
				top:'0px',
				'z-index':'1000',
				opacity:1,
		});




	// animaatiodummy, mahdollistaa elementin animoinnin.
	// jqueryn animate liikuttaa tätä objektia
		
		this.dummy = $('<div class="dummy" style="display:none;"></div>')

	


	// kun imaget ladataan, suoritetaan koonmuutos
	imagesReady(this.element,function(){
			me.resize();
		});



	// classi
	this.container.addClass('touchable');

	this.containerheight = this.element.height(); // containerin aloituskoko
	this.containerwidth = this.element.width();

	this.scale = this.opts.scale;	// aloitus scale

	this.rotation = this.opts.rotation;	// aloitus rotaatio

	this.maxStep = 100;	// paljonko voi liikkua yhden stepin aikana
	this.maxRotateStep = 2;	// paljonko voi pyöriä yhdellä stepillä

	this.originx = this.containerheight/2;	// aloitus webkit transform origin
	this.originy = this.containerwidth/2;

	this.x = (window.innerWidth/2) - (this.element.width()/2);	// ikkunan keskitys
	this.y = (window.innerHeight/2)- (this.element.height()/2);


	this.originalposition = this.getPosition();	// hakee position objektin
	// edellä olleet arvot liitetään position objektiin

	// maksimi liikkumisvarat
	this.max = {
			x: window.innerWidth - this.originalposition.w,
			y: window.innerHeight - this.originalposition.h
		}


	// asetttaa arvot kodilleen.
	this.setPosition(this.originalposition);




	// jos randomize on päällä, sekotetaan pakka
	if (this.opts.randomPosition == true){
		me.randomPosition();		
	}
	



// hammer - touch eventtien käsittelijä
	this.element.hammer();
	this.element.bind('hold tap swipe doubletap transformstart transform transformend dragstart drag dragend swipe release',function(e){		
		e.preventDefault();
		me.transform(e);

	});


	// viimeisimmät transformeventit
	this.transformLastE = Array();



	// palautetaan container ohjelmaan pyörimään
	return this.container;
}

touchable.prototype.randomPosition = function(){

	var me = this,
		pos =me.getPosition(),
		
		centerX = (window.innerWidth - (window.innerWidth-me.max.x))/2 -200,
		centerY = (window.innerHeight - (window.innerHeight-me.max.y))/2 -200;

	pos.x = Math.random()*(centerX)+200;
	pos.y = Math.random()*(centerY)+200;

	pos.rotation = (Math.random()*10)-5

	this.setPosition(pos);

}



// yrittää sovittaa elementin kokoa sivun kokoon
// ja mahdollisesti keskittää ehkä sen jopa

touchable.prototype.resize = function(){
	

	var pos = this.getPosition();

	if (this.opts.autosize == true && this.opts.scalable == true){
		
		
		var origW = this.element.width() / pos.scale,
			origH = this.element.height() / pos.scale,
		
			scalex = (window.innerWidth/2)/(origW/1.2),
			scaley = (window.innerHeight/2)/(origH/1.2);

			
		
		if (scalex< scaley){
			pos.scale = scalex;			
		}  else {
			pos.scale = scaley;
		}

		pos.originx = this.element.width()*pos.scale /2;
		pos.originy = this.element.height()*pos.scale /2;


		var y =  (window.innerHeight)/origH;
		var x = (window.innerWidth)/origW;

		if (y<x) this.opts.maxScale = y;
		if (x>y) this.opts.maxScale = x;
	}


	if (this.opts.setcenter == true){
	
		pos.x = (window.innerWidth/2) - (this.element.width()/2);	// ikkunan keskitys
		pos.y = (window.innerHeight/2)- (this.element.height()/2);

	}

	this.setPosition(pos)

}




// z-indexin lisääminen elementtiä liikutellessa
// kasvaa joka kerta kun liikutetaan, mutta...
touchable.prototype.stack = function(){

	var z = 0;
	var me = this;

	$('.touchable').each(function(i){
		
		var zi = parseInt($(this).css('z-index'));
		
		if (zi>z && $(this) != $(me.container)){
		 	
		 	z = zi;

		}
	});

	
	this.container.css('z-index',z+1);
	

}



// animoitu liike tiettyyn scale kokoon tai rotatioon
touchable.prototype.translate = function(a){
		
	var p = {
		rotation:0,
		scale:1,
		x:0,
		y:0,
	}

	$.extend(p,a);


	if (this.opts.scalable == true){
			var onex = p.touchevent.touches[0].x - this.x,
				oney = p.touchevent.touches[0].y - this.y;


			this.dummy.stop();
			this.container.stop();

			
			var scalediff = this.scale-p.scale,
				currentScale = this.scale,

				rot = this.rotation;


			if (scalediff!= 0){


			var me = this;
			this.dummy.css("text-indent", 100);
			this.dummy.animate({
			             textIndent: 0
			             }, {
			                  duration: 200*Math.abs(scalediff),
			                  step: function(currentStep) {

			                  	var pos = me.getPosition(p.touchevent);
			                  	
			                  	if (scalediff<1){
				                  	pos.originy = oney;
				                  	pos.originx = onex;
			                  	}

			                  	pos.x = pos.x + (p.x/100)*(100-currentStep);
			                  	pos.y = pos.y + (p.y/100)*(100-currentStep);
			                  	pos.scale = currentScale - scalediff/100 * (100-currentStep);
			                  	pos.rotation = rot+p.rotation - rot/100 * (100-currentStep);

			                  	me.setPosition(pos);

			                 }
			 });
		}
	}
}

touchable.prototype.getPoints = function(e){

	var t1onEx = e.touches[0].x-this.beforetransform.x, // touch 1 position on element
		t1onEy = e.touches[0].y-this.beforetransform.y,

		t2onEx = e.touches[1].x-this.beforetransform.x, // touch 2 position on element
		t2onEy = e.touches[1].y-this.beforetransform.y,
		
		conEx = (t1onEx+t2onEx)/2,	// center on Element x-axis
		conEy = (t1onEy+t2onEy)/2,

		distX = t1onEx-t2onEx,	// distance between the two touches
		distY = t1onEy-t2onEy,

		centerY = (e.touches[0].y + e.touches[1].y)/2,
		centerX = (e.touches[0].x + e.touches[1].x)/2, // current center on screen

		movex = 0,
		movey = 0,
		dist = 0,
		scale = this.scale;


		return {
			t1onEx:t1onEx,
			t1onEy:t1onEy,
			t2onEx:t2onEx,
			t2onEy:t2onEy,

			conEx:conEx,
			conEy:conEy,

			distX:distX,
			distY:distY,

			centerY:centerY,
			centerX:centerX,
			movex:movex,
			movey:movey,

			dist:dist,
			scale:scale
		}
}


// hiplaustoiminnot
touchable.prototype.transform = function(e){
	

	if (e != undefined){
	
			this.stack(); // pinon päällimmäiseksi
			if (e.touches != undefined){
				var touches = e.touches.length;

			} else {
				var touches = 0;
			}


			var me = this;

			switch (e.type){
				case 'tap':
					this.translate({
						touchevent:e,
						scale:this.opts.scale,
						rotation:0
					});
					
				break;

				case 'doubletap':
					this.translate({
						touchevent:e,
						scale:this.opts.maxScale,
						rotation:0
					});

				break;
				
				case 'dragstart':

					
					this.container.addClass('touch-drag')

					// liikutetaan obj jos draggable
					// 	aloitusarvot kohdalleen ennen kuin mitään tapahtuu
					if (this.opts.draggable == true){

						this.dummy.stop();
						this.element.stop(); // animaatiot seis

						this.beforedrag = this.getPosition(e);
						this.lastPosition = this.getPosition(e); // edellinen positio

						if (touches>1){
							if (e.touches[1] == undefined){
								e.touches[1] = e.touches[0];
							}

							var x = e.touches[0].x - e.touches[1].x,
								y = e.touches[0].y - e.touches[1].y;


							var dist = Math.sqrt(Math.pow(x,2)+Math.pow(y,2)); // pytakoonialainen mies olisi iloinen

							this.lastDist = dist;			
						}

					}
					break;

				

				case 'drag':

					// objekti
					// liikkeessä
					if (this.opts.draggable == true){



						this.dummy.stop();
						this.ondrag = e;
						this.ondragPosition = this.getPosition(e);

						if (touches >= this.opts.touchmove){
							this.move(e) // varsinainen move funktio
						}
						
						this.lastPosition = this.getPosition(e);

					}
					break;

				

				case 'dragend':


					// drag loppuu
					// 	--> inertia

					// alkup. koodi stackoverflow / joku
					if (this.beforedrag != undefined && this.opts.draggable == true && this.opts.inertia == true){

						this.dummy.stop();
						    var x1, x2, y1, y2, t1, t2, // Posititons/Time
						        minDistance = 50,       // Minimum px distance object must be dragged to enable momentum.
						        friction = 1;     


								this.dummy.css("text-indent", 100);

						          //var lastE = $d.data("mouseEvents").shift();
						          var lastE = this.beforedrag;//Position,
						          	currentPos = this.getPosition(e);

						            x1 = lastE.x;
						            y1 = lastE.y;
						            t1 = lastE.timeStamp;
						            x2 = currentPos.x;
						            y2 = currentPos.y;
						            t2 = currentPos.timeStamp;

						            
						            var dX = x2 - x1,
						                dY = y2 - y1,
						                dMs = Math.max(t2 - t1, 1);

						            // nopeus
						            var speedX = Math.max(Math.min(dX / dMs, 1), -1),
						                speedY = Math.max(Math.min(dY / dMs, 1), -1);

						            
						            // kuljettu matka
						            var distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

						            

						            if (distance > minDistance) {
						                // Momentum
						                var lastStepTime = new Date();
						                
						                var maxLeft = this.max.x,
						                    maxTop =this.max.y;

						                this.dummy.animate({
						                    textIndent: 0
						                }, {
						                    duration: Math.max(Math.abs(speedX), Math.abs(speedY))*2000,
						                    step: function(currentStep) {
						                        speedX *= (currentStep / 100);
						                        speedY *= (currentStep / 100);

						                        var now = new Date();
						                        var stepDuration = now.getTime() - lastStepTime.getTime();

						                        lastStepTime = now;

						                        var pos = me.getPosition(e);

						                        // uusi positio
						                        var newLeft = (pos.x + (speedX * stepDuration / friction)),
						                            newTop = (pos.y + (speedY * stepDuration / friction));

						                       // rajoitus
						                       newLeft = newLeft > maxLeft ? maxLeft : newLeft < 10 ? 10 : newLeft;
						                       newTop  = newTop  > maxTop  ? maxTop  : newTop  < 10 ? 10 : newTop;

						                       
						                        
						                        pos.x = newLeft;
						                        pos.y = newTop;
						                        

						                        me.setPosition(pos);	// asetetaan liikuttu matka positioksi			                        
						                    }
						                });
						            }

						}
						this.container.removeClass('touch-drag')
					break;



				case 'transformstart':
				
					// pyöritys & skaalaus
					// alkuarvot kohdalleen, jatketaan on transform eventissä

					if (this.opts.rotate == true ||this.opts.scalable == true){
						this.container.addClass('touch-transform')
						
						this.container.stop();
						this.dummy.stop();

						this.beforetransform = this.getPosition(e);
						this.previousScale = this.beforetransform.scale;



						this.transformLastE = Array( this.getPoints(e) );

					break;
				}
				



				case 'transform':
					

					// varsin jäätävä transformausfunktio

				if (this.opts.rotate == true ||this.opts.scalable == true){
						this.onscale = this.getPosition(e);
						

						// touches > 2 aloitetaan skaalaus

						if( touches >= 2){
							e.preventDefault();

							// viimeisimmät 10 eventtiä, jos on enemmän, heivataan ylim. pois
							// oli tarkoitus tehdä keskiarvolaskuri isolle kosketusnäytölle..
							// vaatii korkeamman tason matikkaa....
							
							if (this.transformLastE.length>10){ 
								this.transformLastE.shift();
							}

							var lastE = this.transformLastE[this.transformLastE.length-1];
							var pos = this.getPosition(e); // positio


							var now = Date.now(); // aikaleima

							// kaksi ensimmäistä kosketuspistettä, oli ne sitten missä tahansa,
							// oikeastaan pitäisi ottaa ne kaksi jotka koskettaa tätä elementtiä

							var t1 = e.touches[0],
								t2 = e.touches[1],


								t1onEx = e.touches[0].x-pos.x, // touch 1 sijainti elementissä
								t1onEy = e.touches[0].y-pos.y,

								t2onEx = e.touches[1].x-pos.x, // touch 2 sijainti
								t2onEy = e.touches[1].y-pos.y,
								
								conEx = (t1onEx+t2onEx)/2,	// keskipiste Elementin x akselilla
								conEy = (t1onEy+t2onEy)/2,

								distX = t1onEx-t2onEx,	// kosketusten välimatka
								distY = t1onEy-t2onEy,

								currentCenterX = (t1.x + t2.x)/2, // kosketusten keskipiste näytöllä
								currentCenterY = (t1.y + t2.y)/2,					

								t1moveX = t1onEx - lastE.t1onEx, // touch1 move edellisen stepin jälkeen
								t1moveY = t1onEy - lastE.t1onEy,

								t2moveX = t2onEx - lastE.t2onEx, // touch2 move
								t2moveY = t2onEy - lastE.t2onEy,

								moveX = currentCenterX - lastE.centerX, // liikuttu matka edelliseen verrattuna
								moveY = currentCenterY - lastE.centerY;
									
					
								if (moveX > 2 || moveX < -2){
									pos.x = pos.x + moveX;	// uusi sijainti objektille
								}
								if (moveY > 2 || moveY < -2){
									pos.y = pos.y + moveY;
								}


								pos.originx = conEx; // uusi transform origin
								pos.originy = conEy;

						var filter = 1;
						var rotFilter = 0.2;


						// filtteröintiä, ettei nyt aivan holtittomasti pyöri
						// ipadilla ei tarvita, isolla näytöllä kyllä.
						if (t1moveX > filter || t2moveX > filter || t1moveY > filter || t2moveY>filter  ||
							t1moveX < 0-filter || t2moveX < 0-filter ||t1moveY < 0-filter ||t2moveY < 0-filter){

									var dist = Math.sqrt(Math.pow(distX,2) + Math.pow(distY,2)), // total distance between touches
										//pdist = Math.sqrt(Math.pow(lastE.distX,2) + Math.pow(lastE.distY,2)),

										diff = dist-lastE.dist, // difference between distances

										diffPerc = dist/lastE.dist;								


									if (diffPerc > 1.02 || diffPerc < 0.98 && this.opts.scalable == true){
										
										if (diffPerc > 1 + this.opts.maxScaleStep) diffPerc = 1+ this.opts.maxScaleStep;
										if (diffPerc < 1- this.opts.maxScaleStep) diffPerc = 1- this.opts.maxScaleStep;
										
										
										pos.scale = pos.scale*diffPerc; 
										
									}
									
									var rotation = this.beforetransform.rotation + e.rotation;

									
									if (rotation > pos.rotation +this.opts.maxRotateStep){
									 	rotation = pos.rotation +this.opts.maxRotateStep;						 
									}

									if (rotation < pos.rotation -this.opts.maxRotateStep){
										rotation = pos.rotation -this.opts.maxRotateStep;
									}
									
									

									if (e.rotation > pos.rotation+rotFilter || rotation<pos.rotation-rotFilter && this.opts.rotate == true){
											
											pos.rotation = rotation;

										}
									

									
									this.setPosition(pos);

									

									// last event
									var tramsforme = {
										scale:diffPerc,
										movex:moveX,
										movey:moveY,
										dist:dist,
										distX:distX,
										distY:distY,
										t1onEx:t1onEx,
										t1onEy:t1onEy,
										t2onEx:t2onEx,
										t2onEy:t2onEy,
										conEx:conEx,
										conEy:conEy,
										centerX:currentCenterX,
										centerY:currentCenterY
									}

									this.transformLastE.push(tramsforme);								
										//this.previousScale = nscale;
								}
						}
					
					}
					break;



				case 'transformend':

					this.container.removeClass('touch-transform')

				
					break;

				case 'release':

					break;

				case 'swipe':
		//			console.log(e);
					break;
			}

		}
}



// set position
// asettaa objektin sijainnin, tietyillä rajoituksilla
touchable.prototype.setPosition = function(position){

	if (position.scale>this.opts.maxScale) position.scale = this.opts.maxScale;
	if (position.scale<this.opts.minScale) position.scale = this.opts.minScale;
	

	if(position.scale == undefined){
		position.scale = 1.00000000001; // scale on kokoajan päällä => ei töki
	}

	this.containerwidth = this.element.width()*position.scale;
	this.containerheight = this.element.height()*position.scale;

	this.scale = position.scale;
	this.rotation = position.rotation;

// limits	
	this.max = {
			x: window.innerWidth - this.containerwidth,
			y: window.innerHeight - this.containerheight
	}

	this.min = {
			x: 0,
			y: 0,
	}


	this.x = position.x;
	this.y = position.y;



	this.originx = position.originx;
	this.originy = position.originy;


// movement limitation
	if (this.opts.limited == true){

/*
		if (this.x > this.max.x){
			this.x = this.max.x;
		}

		if (this.x < this.min.x){
			this.x = this.min.x;
		}

		if (this.y > this.max.y){
			this.y = this.max.y;
		}

		if (this.y < this.min.y){
			this.y = this.min.y;
		}
*/
	}

// remove object when offscreen
	if (this.opts.removeOnOut == true){

			var overx = 0,
				overy = 0;

			if ( this.x < this.min.x){
				overx = Math.abs(this.x - this.min.x);
			}
			if ( this.x > this.max.x){
				overx = this.max.x - this.x;
			}

			if ( this.y < this.min.y){
				overy = Math.abs(this.y - this.min.y);
			}
			if ( this.y > this.max.y){
				overy = this.max.y - this.y;
			}

			

			var rmpointx = (this.containerwidth/1.5),
				rmpointy = (this.containerheight/1.5),
				op = 1;


			

			if (Math.abs(overx/rmpointx)>Math.abs(overy/rmpointy)){
				
				op = 1.5-Math.abs(overx/rmpointx)	
				
			} else {


				op = 1.5-Math.abs(overy/rmpointy)


			}

			if (Math.abs(overy/rmpointy) >= 1 || Math.abs(overx/rmpointx) >= 1){
				this.container.remove();
				this.opts.onremove();
			}
	}

	//console.log('M['+this.max.x +':'+this.max.y+']'+this.x+'/'+overx+' :  '+this.y +'/'+overy+ ' ASDFSADF:'+rmpointx)
	if (position.w > window.innerWidth) position.w = window.innerWidth;
	if (position.h > window.innerWidth) position.h = window.innerHeight;


	this.container.css({
		position:'absolute',
		opacity: op,		
		'-webkit-transform':'translate3d('+this.x + 'px ,' + this.y +'px ,0px) scale3d('+position.scale+','+position.scale+',1) rotate3d(0,0,1,'+position.rotation+'deg)',
		'-webkit-transform-origin': position.originx + 'px '+position.originy+'px',
		'-webkit-transform-style':'preserve-3d',
	});


	
}


// get Position, return element position data
touchable.prototype.getPosition = function(e) {

	return {
			x:this.x,
			y:this.y,
			w:this.element.width(),
			h:this.element.height(),
			containerwidth:this.containerwidth,
			containerheight:this.containerheight,
			rotation:this.rotation,
			scale:this.scale,
			originx:this.originx,
			originy:this.originy,
			event:e,
			timeStamp:Date.now()
			}
	}


// move object as touches move
touchable.prototype.move = function(e){		
		if (this.beforedrag != undefined){
			var nx = this.beforedrag.x + e.distanceX,
				ny = this.beforedrag.y + e.distanceY,
				position = this.ondragPosition;


			if (nx>this.ondragPosition.x+this.maxStep){
				nx = this.ondragPosition.x+this.maxStep;
			}

			if (nx<this.ondragPosition.x-this.maxStep){
				nx = this.ondragPosition.x-this.maxStep;
			}

			if (ny > this.ondragPosition.y+this.maxStep){
				ny = this.ondragPosition.y+this.maxStep
			}

			if (ny < this.ondragPosition.y-this.maxStep){
				ny = this.ondragPosition.y-this.maxStep;
			}



			var p = this.getPosition(e);

			p.x = nx;
			p.y = ny;

			this.setPosition(p);
	}

	}

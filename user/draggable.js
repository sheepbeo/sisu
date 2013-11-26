/*
	jqueryDRAGGABLE
		by heikki pesonen
		3d-transform (=fast) draggable objects with inertia animation, uses
		jquery hammer as touch event library. (eightmedia)
		inertia base code by simshaun at stack overflow. Altered by me to fit into this object.

		almost real multitouch object (can move multiple objects at once,
		no multiple object transform though) for modern web browsers (webkit),
		support for other browsers coming in distant future
		for ie: never.

		this sourcecode is free as is, no guarantee is made by me if it will work or not,
		feel free to modify and alter the code but mention me as the original author.



		usage:
			var obj = new draggable( jquery htmlElement, optionsObject );

			use .getElement() to place objects html element to dom,
			run init function to initialize operation

			if you need to dynamically move object, use 
			this objects moveTo (animated) or move(x offset,y offset) functions

			
		events:
			obj.on('event',function(eventdata){
			
			});
		

		object needs to be ready in DOM before init function is run
*/

function draggable(element,options){
	this._element = $(element);	
	this._listeners = {};	// event listeners
	this._hasMoved = false; // object has moved since last event
	this._hasCollided = false;	// object has collided, but has not been moved

	// options
	this._opts = {
		dragTouches:1,	// how many touches to enable drag
		draggable:true,
		rotate:true,
		scalable:true,
		moveTolerance:5, // 
		margin:5,	// margins for autoscale limiter
		autofit:true,	// limits automatically object movement to window limits
		stack:'.draggable, .user-draggable',
		inertia:{
			enabled:true, // inertia animation enabled
			friction:1.5,	// friction for inertia
			minDistance:10,	// minimum distance to drag to enable inertia
			minThrowDistance:0,	// minumum distance to drag before throw event is fired
			maxSpeed:1.5, // px per millisecond
		},
		// object movement restrictions
		limit:{
			min:{
				x:10,
				y:10,
			},
			max:{
				x:window.innerWidth-110,
				y:window.innerHeight-110
			}
		},
		scale:{
			max:2,
			min:1,
			start:1 // scale at startup
		},
		rotation:{
			min:-45,
			max:45,
			start:0 // rotation at startup
		}
	}

	if (options != undefined){
		for (var i in options){
			this._opts[i] = options[i];
		}
	}
	//this._opts = $.extend(this._opts,options);

	// animation dummy object
	this._dummy = $('<div style="display:none;"></div>');
	this._element.hammer({prevent_default:true}); // init jquery hammer

	var pos = this.getPosition();
	pos.rotation = this._opts.rotation.start;
	this.setPosition(pos);

}

draggable.prototype = {
	destroy:function(){
		this._element.unbind('transformstart transform transformend dragstart dragend drag');
	},
	getElement : function(){
		return this._element;
	},

	init : function(){
		// just add some of jquery hammers event to this objects functions
		// as if convert events, to detach this from hammer, so maybe could be someday
		// without the hammer library...
		var me = this;
		
		/*
		this._element[0].addEventListener('touchstart',function(e){
			console.log(e);
		});


		this._element[0].addEventListener('touchend',function(e){
			console.log(e);
		});

		this._element[0].addEventListener('touchmove',function(e){
			console.log(e);
		});
		*/

		onTouch(this._element,function(){
			me.stack();
		});

		if (this._opts.rotate == true || this._opts.scale == true ){
			this._element.on('transformstart',function(e){
					me.transformstart(e);			
			});
			this._element.on('transform',function(e){			
					me.transform(e);			
			});
			this._element.on('transformend',function(e){
					me.transformend(e);
			});
		}
		if (this._opts.draggable == true){		
			this._element.on('dragstart',function(e){
				me.dragstart(e);
			});
			this._element.on('drag',function(e){
				me.ondrag(e);				
			});
			this._element.on('dragend',function(e){
				me.dragend(e);
			});
		}
		// position initialization
		var initPos = this.getPosition();
			
			initPos.x = this.getOffset().x; // object real offset on screen
			initPos.y = this.getOffset().y;

		this.setPosition( initPos ); // apply position
		if (this._opts.autofit == true){
			this.autofit();
		}
		this._fire('ready');		
	},

	stack:function(){		
		var z = 0;
		var e = $(this._opts.stack);
		var me = this;

			e.each(function(){
				
				if ($(this).css('z-index')){
					var num  = parseInt($(this).css('z-index'));

					if (num > z) z=num;
				}
			});		

			me._element.css('z-index',z+1);

	},
	autofit:function(){
		var sz = this.getSize(),
			mx = (window.innerWidth - sz.x)-this._opts.margin,
			my = (window.innerHeight - sz.y)-this._opts.margin;
			this.setLimit({x:this._opts.margin,y:this._opts.margin},{x:mx,y:my});


		if (sz.x == 0){
			console.log('fail')
		}
	},

	// ie for rescaling
	setLimit:function(min_point,max_point){
		this._opts.limit.min = min_point;
		this._opts.limit.max = max_point;
	},


	// when user starts dragging element
	dragstart:function(e){		
		this._lastEvent = e; // last touch event
		this._lastTouches = this.getTouchesOnElement(e); // previous touch event touches on this element
		this._fire('dragstart',e);		
		
		this._hasMoved = true;
	},

	dragend:function(e){
		if (this._opts.inertia.enabled == true){
			this.inertia();	// inertial animation
		}
		this._fire('dragend',e);
	},

	ondrag:function(e){	
		if (e.touches != undefined){		
			this._event = e;

			if (e.touches.length >= this._opts.dragTouches){
				var offsets = this.getTouchOffset();
				if (offsets.length > 0){					
					this.move(offsets[0]);
				}

				this.getSpeed(e,offsets); // store speed value into event object
				this._lastOffsets = offsets;
				this._lastTouches = this.getTouchesOnElement(e);			
				this._lastEvent = e;
				this._fire('drag',e);
			}
		}
	},

	transformstart:function(e){
		this._lastEvent = e;
		this._lastTouches = this.getTouchesOnElement(e);
		this._lastTransform = this.getTransformOffset();	
		this._fire('transformstart',e);
	},

	// object transforming, scale, rotate etc
	transform:function(e){
		this._event = e;
		var offset = this.getTransformOffset(e);
		if (offset!=undefined){		
			this.move(offset);
			this._fire('transform',offset);
			this._lastEvent = e;
		}
	},

	transformend:function(e){
		this._fire('transformend',this.getTransformOffset(e));
	},


	// detect edge collision
	getEdge:function(point,tolerance){
		var max = this._opts.limit.max,
			min = this._opts.limit.min,
			edge = false;
		
		if (tolerance == undefined){
			tolerance = this._opts.moveTolerance;
		}

		if (point.x >= max.x){
			edge = 'right';
		}
		if(point.x <= min.x){
			edge = 'left';
		}
		if (point.y >= max.y){
			edge = 'bottom';
		}
		if (point.y <= min.y){
			edge = 'top';
		}
		return edge;
	},
	// collision event, collision has happened with edge and object is formed,
	// then this method fires events and changes booleans.
	setCollision:function(collision){
		this._collision = collision;
		this._fire('collision',this._collision);		
		this._hasCollided = true; // used for disabling multiple collisions from same event
	},
	// when object leaves from collision position
	leaveCollision:function(){		
		if (this._hasCollided == true){	// if collision has happened with edge
			this._fire('leave',this);	// leave can be initialized
			this._hasCollided = false;	// fgds?
		}
	},
	// check collision of object to limits
	chkCollision:function(point){
		var edge = this.getEdge(point);	// if touches edge, edge name is returned, else false
		if (edge != false){				
			if (this._hasCollided == false){
				// collision object
				var collision = {
									x:point.x, // current object coordinates
									y:point.y,
									edge:edge, // edge name
									element:this,	// for references to the event catchers
									timeStamp:Date.now() // timestamp for event
								}					
				this.setCollision(collision); // if there is some collision
			}
		} else {
			this.leaveCollision();	// if there are no collsion, collision is reset
		}
	},

	// check limits
	chkLimit:function(point){
		// get limits from options
		var p2 = {};
		for (var i in point){
			p2[i] = point;
		}
		var max = this._opts.limit.max,
			min = this._opts.limit.min,
			mxR = this._opts.rotation.max,
			mnR = this._opts.rotation.min,
			mxS = this._opts.scale.max,
			mnS = this._opts.scale.min;		
			// check limits,
			// if x > max.x then x = max.x, also if x < min.x x=min.x
			p2.x = point.x > max.x ? max.x : point.x < min.x ? min.x : point.x;
			p2.y = point.y > max.y ? max.y : point.y < min.y ? min.y : point.y;
			if (this._opts.rotate != false){
				p2.rotation = point.rotation > mxR ? mxR : point.rotation < mnR ? mnR : point.rotation;
			} else {
				p2.rotation = this._opts.rotation.start;
			}
			
			if (this._opts.scalable != false){
				p2.scale = point.scale > mxS ? mxS : point.scale < mnS ? mnS : point.scale;
			} else {
				p2.scale = this._opts.scale.start;
			}
			this.chkCollision(p2); /// check if collision occurs, this does its own business.
	
		return p2;
	},

	// animation functionality provider
	animate:function(data){
		var me = this;
		this._fire('animstart');
		this._dummy.stop();
		this._dummy.css("text-indent", 100);
		this._dummy.animate({
			'text-indent':0,
		},{
			duration:data.duration,
			step:function(step){
				data.step(step);
			},
			complete:function(){
				me._fire('animend');
			}
		})
	},

	inertia:function(){
		// inertia animation for object
		// original code by simshaun at stack overflow
		// variable definition
		if (this._lastEvent.speed != undefined){
			var me = this,
				minDistance = this._opts.inertia.minDistance,     // Minimum px distance object must be dragged to enable momentum.
				friction = this._opts.inertia.friction, // how much object is slown down
				maxSpeed = this._opts.inertia.maxSpeed, // maximum speed
				e = this._lastEvent,
				// speed limits
				speedX = e.speed.x > maxSpeed ? maxSpeed : e.speed.x < 0-maxSpeed ? 0-maxSpeed : e.speed.x,
				speedY = e.speed.y > maxSpeed ? maxSpeed : e.speed.y < 0-maxSpeed ? 0-maxSpeed : e.speed.y,
				
				distance = e.distance;
			// throw event detection
			if (Math.abs(e.speed.x) > maxSpeed || Math.abs(e.speed.y) > maxSpeed){
				if (distance >= this._opts.inertia.minThrowDistance){
					this._fire('throw',this);
				}
			}

			if (distance > minDistance) {
			    var lastStepTime = new Date();   
			    var maxLeft = window.innerWidht,
			        maxTop = window.innerHeight;

			    this.animate({
			        duration: Math.max(Math.abs(speedX), Math.abs(speedY))*1000,
			    	
			        step: function(currentStep) {
			            speedX *= (currentStep / 100);
			            speedY *= (currentStep / 100);
			            var now = new Date(),
			            	stepDuration = now.getTime() - lastStepTime.getTime(),
			            	pos = me.getPosition(),
			            	newLeft = (pos.x + (speedX * stepDuration / friction)),
			                newTop = (pos.y + (speedY * stepDuration / friction));
			                pos.x = newLeft;
			                pos.y = newTop;

			            me.setPosition(pos);		            
			            lastStepTime = now;            
			        }
			    });		    
			}

		}
	},

	// return dragging speed, px / ms	
	getSpeed:function(e,offsets){
		// time difference between events
		var td = e.timeStamp - this._lastEvent.timeStamp;				
		if (offsets==undefined){
			var touches = this.getTouchOffset();			
		} else {
			var touches = offsets;
		}
		if (touches.length > 0){
			var dist = touches[0].distance, // only the distance of first touch is used
				result = {
							x: touches[0].x / td,
							y: touches[0].y / td,
							distance:dist,
							dv:dist / td
						};

				e.speed = result;
				return result;	
		} else {
			return false;
		}
	},

	// get touch points touching this element
	// since all points are in event regardless of element they are touching
	// true multitouch
	getTouchesOnElement:function(e){
		var bounds = this.getBounds(), // element boundaries
			touchesOnElement = Array();	// touches on element
		// loop through touch points
		for (var i in e.touches){
			if (e.touches[i].x >= bounds.min.x && e.touches[i].x <= bounds.max.x 
				&& e.touches[i].y >= bounds.min.y && e.touches[i].y <= bounds.max.y){
				// if touches are within limits, they are pushed into array
				touchesOnElement.push(e.touches[i]);
			}
		}
		return touchesOnElement;
	},

	// get object bounds on screen
	getBounds:function(){
		return {min:this.getPosition(),max:{x:this.getSize().x+this.getPosition().x, y: this.getSize().y + this.getPosition().y}}
	},

	// get object size on screen
	getSize:function(){		
		var pos = this.position;
		if (pos==undefined){
			pos = {};
		}
		
		if (pos.scale == undefined){
			pos.scale = 1;
		}
		return  {x:this._element.width()*pos.scale,y:this._element.height()*pos.scale};
	},

	// get real offset (not 3d-transform)
	getOffset:function(){		
		return {x:this._element.offset().left,y:this._element.offset().top};
	},

	// calculate difference between two x,y points and the total distance between
	// also midpoint is returned for scaling and rotating (transform-origin)
	getDiff:function(p1,p2){		
	
		var	dx = p1.x - p2.x, // difference x
			dy = p1.y-p2.y,	 // y
			np = {
				x:dx,
				y:dy,
				distance:distance(dx,dy), // distance between points
				mid:{	
					x:(p1.x + p2.x)/2, // midpoint x between two points
					y:(p1.y + p2.y)/2 // midpoint y
				}
			};

		return np;
	},
	// calculate differences between two touch events in array
	// the distance moved and x & y positions relative to one another
	getTouchOffset:function(){
		var offsets = Array();

		if (this._lastEvent != undefined && this._event != undefined){			
			var touches = this.getTouchesOnElement(this._event); // touches on this object			
			if (touches.length >= this._opts.dragTouches){ // if touch count is enough to move the object
				for (var i in touches){
					if (this._lastTouches[i] != undefined && touches[i] != undefined){					
						var diff = this.getDiff(touches[i],this._lastTouches[i]);
						offsets.push(diff);
					}
				}
			}
		}
		return offsets;
	},
	scaleTo:function(factor){
		var p = this.getPosition();

	},

	moveTo:function(point){
		var p = this.chkLimit(point),
			pos = this.getPosition(),		
			diff = this.getDiff(p,pos);

		this.animate({
			duration:parseInt(diff.dist),
			step:function(currentStep){              	              	
              	var x = pos.x + (p.x/100)*(100-currentStep),
              		y = pos.y + (p.y/100)*(100-currentStep);
              	//pos.scale = currentScale - scalediff/100 * (100-currentStep);
              	//pos.rotation = rot+p.rotation - rot/100 * (100-currentStep);
              	this.move({x:x,y:y});
              },
		})
	},
	// move (additive) object
	// eats position objects (look getPosition)
	move:function(obj){
		var p = this.getPosition(),
			n = p;

			
		for (var i in obj){
			n[i] = p[i] + obj[i];
		}
			
		this._fire('move',n)
		this.setPosition(n);
	},

	getTransformOffset:function(){
		if (this._event != undefined){ // current event
			var e = this._event,
				le = this._lastEvent,
				offsets = this.getTouchOffset(),
				size = this.getSize(),
				r = e.rotation - le.rotation;

			if (this._lastOffsets!=undefined && this._lastOffsets[0]!=undefined){
				if (offsets.length > 0 && offsets[0]!=undefined){
					var offset = offsets[0],
						sz = distance(size.x,size.y), // object size, from corner to corner			
						old_prc = ((this._lastOffsets[0].distance)/sz);  // old scale percentage
						prc = (offset.distance / sz), // new percentage
						td = this.getDiff(offset.mid,this._lastOffsets[0].mid) // get difference between this, and previous location

					var tr = this._opts.rotation.max - this._opts.rotation.min, // total rotation
						rp = (this.getPosition().rotation / tr) + 0.5; // current rotation (0-1)
				
					// create transform object (returned in events, and used to move the object)
					var transformOffset = {
						x:td.x,
						y:td.y,
						scale:prc - old_prc,
						rotation:r,
						angle:rp,
						timeStamp:Date.now()
					};						

					this._lastOffsets = offsets;
					return transformOffset;
				}
			} else if (offsets!=undefined){
				this._lastOffsets = offsets;
			}
				
		} else {
			return false;
		}
	},

	// get useful position,
	// if transformed position is not defined, absolute position is returned
	getPosition:function(){
		if (this.position != undefined){
			return this.position;
		} else {
			this._originalPosition = {
					x:this.getOffset().x,
					y:this.getOffset().y,
					rotation:this._opts.rotation.start,
					scale:this._opts.scale.start,
					originx:this.getSize().x / 2,
					originy:this.getSize().y / 2
				};
			return this._originalPosition;
		}
	},

	// set position of element
	setPosition:function(position){			
		position = this.chkLimit(position); // restrict movement
		var x = position.x - this._originalPosition.x, // movement is relative to original position
			y = position.y - this._originalPosition.y;	// 3d -transform is a lie


		for (var i in position){
			if (position[i] == undefined){
				position[i] = this.position[i];
			}
		}

		this.position = position; // set up position

		// apply movement
		this._element.css({
			'-webkit-transform':'translate3d('+x+'px,'+y+'px,0px) scale3d('+position.scale+','+position.scale+',1) rotate3d(0,0,1,'+position.rotation+'deg)',
			//'-webkit-transform-origin': position.originx + 'px '+position.originy+'px',
			'-webkit-transform-origin': '50% 50%',
			'-webkit-transform-style':'preserve-3d'
		});
	},

	// event system
	_fire : function(evt,data){		
		if (this._listeners[evt]!=undefined){
			if (this._listeners[evt].length>0){
				for (var i in this._listeners[evt]){
					if (typeof(this._listeners[evt][i])=='function'){
						this._listeners[evt][i](data);
					}
				}
			}
		}
	},

	// needs fancier system
	off : function(name){
		delete this._listeners[name];
	},

// subscribe to events
	on : function(listener,fn){
		if (this._listeners[listener]== undefined){
			this._listeners[listener]=Array();
		}
		this._listeners[listener].push(fn);
	},

}
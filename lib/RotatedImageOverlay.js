/**
 * Created with JetBrains WebStorm.
 * User: maxim
 * Date: 2/18/13
 * Time: 5:11 PM
 * To change this template use File | Settings | File Templates.
 */

// @TODO make rotation around corners, not center
RotatedImageOverlay = L.ImageOverlay.extend({

    //rotation angle - rotation around the center, bounds - northwest and southeast of rotated image
    initialize: function (url, bounds, rotation, saveProportions, options) { // (String, LatLngBounds, Float, Object)
        //save original dimensions
        var img = new Image();

        //@TODO probably this is a global var, should get rid of that
        var This=this;
        img.onload = function() {
            //alert(this.width + 'x' + this.height);
            //alert(this._rotation);
            This._origImageWidth=this.width;
            This._origImageHeight=this.height;

            This._scaleImage();
            This.img=null;
        }
        img.src = url;

        //internal _bounds will be stored as of unrotated image, but we will change them later, when we know the _map
        L.ImageOverlay.prototype.initialize.call(this,url, bounds, options);

        this.boundsRotated = false;//to rotate once only in onAdd

        this._rotation=rotation;
        this._saveProportions=saveProportions;


    },

    convertProportionPositionToLatLng: function (point){
        //relative to floor unrotated
        var bounds=  this._getUnrotatedBounds();
        var pixSW = this._map.project(bounds.getSouthWest());
        var pixNE = this._map.project(bounds.getNorthEast());

        var unrotRelPixX= point.x * (pixNE.x-pixSW.x);
        var unrotRelPixY= point.y * (pixSW.y - pixNE.y);

        //SW corner
        var pixSW = this._map.project(this._bounds.getSouthWest())
        var pixNW = this._map.project(this._bounds.getNorthWest())

        //using cos, sin  and corner - rotate
        var unrotAbsPixPoint = pixNW.add( new L.Point(unrotRelPixX, unrotRelPixY) )
        //LDebug.drawPixelPoint(unrotAbsPixPoint)

        //get center: TODO put this in method
        var centerDist= pixSW.subtract(pixNE);
        centerDist.x/=2;
        centerDist.y/=2;

        //we got center now let's rotate SE and NW around it by _rotation
        var center= pixSW.subtract(centerDist);

        //TODO avoid multiplying rotation
        this._rotation*=-1

        var pixPoint = this.rotatePoint(unrotAbsPixPoint, center)
        LDebug.drawPixelPoint(pixPoint)

        this._rotation*=-1

        //var rotRelPixX = unrotRelPixX * Math.cos(this._rotation);
        // rotRelPixY = unrotRelPixY * Math.sin(this._rotation);

        return this._map.unproject(pixPoint)

    },


    onAdd: function (map) {
        L.ImageOverlay.prototype.onAdd.call(this,map);

        //now we know _map -> get unrotated bounds;
        //can be added removed several times - rotate only once
        if(! this.boundsRotated)
        {
            this.boundsRotated = true;

            this._bounds=this._convertToUnrotatedBounds(this._bounds);
            this._reset();
        }
    },

//    initialize: function (url, bounds, rotation, saveProportions, options) { // (String, LatLngBounds, Float, Object)
//        //save original dimensions
//        var img = new Image();
//
//        //@TODO probably this is a global var, should get rid of that
//        This=this;
//        img.onload = function() {
//            //alert(this.width + 'x' + this.height);
//            //alert(this._rotation);
//            This._origImageWidth=this.width;
//            This._origImageHeight=this.height;
//            This._scaleImage();
//        }
//        img.src = url;
//
//
//        L.ImageOverlay.prototype.initialize.call(this,url, bounds, options);
//
//        this._rotation=rotation;
//        this._saveProportions=saveProportions;
//    },

    _scaleImage : function () {
        if(this._saveProportions && this._map)
        {
            var bounds=  this._getUnrotatedBounds();

            var pixSE = this._map.project(bounds.getSouthEast());
            var pixNW = this._map.project(bounds.getNorthWest());

            //var curHeight= pixSE.y-pixNW.y;
            var curWidth= pixSE.x-pixNW.x;

            var origProp= this._origImageWidth/this._origImageHeight;
            var newHeight= curWidth/origProp;

            this.pixelWidth = curWidth ; //save it, useful in the future
            this.pixelHeight = newHeight ; //save it, useful in the future

            var pixNewNW = new L.Point(pixNW.x,pixNW.y); //we clone because we will need the difference between those two

            // new y coord adjust
            pixNewNW.y= pixSE.y - newHeight;

            var pixNewSE = pixSE;

            //now lets center the image

            var delta=(pixNW.y-pixNewNW.y)/2;

            pixNewNW.y+=delta;
            pixNewSE.y+=delta;


            // @TODO this is more dimensinal bounds, cause we won't get same image by rotating it around center with these coords
            this._setUnrotatedBounds( new L.LatLngBounds(this._map.unproject(pixNewSE), this._map.unproject(pixNewNW)));
            this._reset();
        }
    },

    _getUnrotatedBounds: function()
    {
        return this._bounds;
    },

    /// convert given bounds as would be of rotated image to as would be to unrotated one, rotation is around center
     _convertToUnrotatedBounds: function(bounds)
    {
        //@TODO probably rotation in coords or latlng is implemented in some library?
        //as lat, lng are not straight as pixels, lets convert them to absolute pixels
        var pixSW = this._map.project(bounds.getSouthWest());
        var pixNE = this._map.project(bounds.getNorthEast());

        //when we draw, css rotates around center, so we will here
        //@TODO check signs!
        var centerDist= pixSW.subtract(pixNE);
        centerDist.x/=2;
        centerDist.y/=2;

        //we got center now let's rotate SE and NW around it by _rotation
        var center= pixSW.subtract(centerDist);

        var pixUnrotSW = this.rotatePoint(pixSW, center);

       // LDebug.drawPixelPoint(pixUnrotSW);

        var pixUnrotNE = this.rotatePoint(pixNE, center);

//        LDebug.drawPixelPoint(pixUnrotNE);
    
        var newSW=this._map.unproject(pixUnrotSW);
        var newNE=this._map.unproject(pixUnrotNE);


        //since now e.g. pixUnrotSW might be abouve pixUnrotNE due to big angle, we need to check for that and convert everything to SW, NE
        //But Leaflet will do it for us!
        var newBounds= new L.LatLngBounds(newSW, newNE);
       // LDebug.drawBounds(newBounds);

        return newBounds;

    },

    rotatePoint: function(point, center) //(L.Point, L.Point) -> (L.Point)
    {
        //we will rotate bounds in opposite angle to which we rotate the image, so it will stay same place
        var rot=-this._rotation;

        center =  new  OpenLayers.Geometry.Point(center.x, center.y);
        var p = new  OpenLayers.Geometry.Point(point.x, point.y);
        p.rotate(rot, center);
        return new L.point(p.x, p.y);
    },

    _setUnrotatedBounds: function(bounds)// (L.LatLongBounds)
    {
        this._bounds=bounds;
    },

    _onImageLoad: function () {
        L.ImageOverlay.prototype._onImageLoad.call(this);
    },

    _reset: function () {
        L.ImageOverlay.prototype._reset.call(this);

        //rotate the image after resetting, cause transform is cleared in parent method
        this._rotate();

    },

    _animateZoom: function (e) {
        L.ImageOverlay.prototype._animateZoom.call(this,e);

        //rotate the image after resetting, cause transform is cleared in parent method
        this._rotate();
    },

    _rotate: function() {
         this._image.style.transform+="rotate(" +this._rotation +"deg)";
    },

    pixelHeight: 0,
    pixelWidth: 0

});
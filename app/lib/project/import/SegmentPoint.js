define([
    'metapolator/math/Vector'
], function(
    Vector
) {
    "use strict";
    
    function SegmentPoint(xy, smooth, name, kwargs) {
        var k;
        this.vector = Vector.from.apply(null, xy);
        
        this.smooth = smooth;
        this.name = name;
        
        // I expect the 'identifier' keyword here, but that kwds syntax
        // could bring in even more names.
        this.kwargs = kwargs || {};
    }
  
    SegmentPoint.factory = function(xy, smooth, name, kwargs) {
        return new SegmentPoint(xy, smooth, name, kwargs);
    };
    
    var _p = SegmentPoint.prototype
      , _xProperty = {
            get: function(){ return this.vector.x; }
          , set: function(x) {
                this.vector = new Vector(x, this.vector.y);
            }
        }
      , _yProperty = {
            get: function(){ return this.vector.y; }
          , set: function(y) {
                this.vector = new Vector(this.vector.x, y);
            }
        }
      ;
    
    _p.toString = function() {
        return '<SegmentPoint'
            + (this.name ? ' ' + this.name : '')
            + ' ' + this.vector.valueOf() +'>';
    };
    
    Object.defineProperty(_p, 'x', _xProperty);
    Object.defineProperty(_p, 'y', _yProperty);
    // array interface
    Object.defineProperty(_p, 'length', {
        value: 2
      , writable: false
    });
    Object.defineProperty(_p, '0', _xProperty);
    Object.defineProperty(_p, '1', _yProperty);
    
    return SegmentPoint;
});

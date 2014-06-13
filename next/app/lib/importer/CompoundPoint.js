define([
    'metapolator/errors'
  , './Vector'
], function(
    errors
  , Vector
) {
    "use strict";
    
    var ValueError = errors.Value;
    
    function CompoundPoint(xy /*, ... vector components */) {
        this._vector = xy instanceof Array
            ? Vector.from.apply(null, xy)
            : Vector.from(xy)
            ;
        this._components = Array.prototype.slice.call(arguments, 1);
        this._intrinsic = new IntrinsicValue(this);
    }
    
    var _p = CompoundPoint.prototype;
    _p.constructor = CompoundPoint;
    
    /**
     * This proxies the 'vector' of CompoundPoint
     */
    function IntrinsicValue(compoundPoint) {
        Object.defineProperty(this, 'vector', {
            get: function(){ return compoundPoint._vector; }
        })
        Object.defineProperty(this, 'compoundPoint', {
            get: function(){ return compoundPoint; }
        })
    }
    
    // we can use this for instanceof checks
    _p.IntrinsicValue = IntrinsicValue;
    
    Object.defineProperty(_p, 'intrinsic', {
        get: function() {
            return this._intrinsic
        }
    })
    
    /**
     * the vector of a CompoundPoint is the some of its 'intrinsic' value
     * and all of it's components.
     */
    Object.defineProperty(_p, 'vector', {
        get: function() {
            var i = 0, result;
            
            result = this._vector;
            for(;i<this._components.length;i++)
                // if it has a 'vector' we simply assume that there
                // is an instance of Vector or anything that can be added
                // to an Vector. See the  source of the 'complex/Complex'
                // module for how adding to complex Numbers works.
                result = result['+'](this._components[i].vector || this._components[i])
            
            // just as a watchguard, may be removed when the software matures
            // because the check might happen fairly often and so be expensive
            if(result.x !== result.x || result.y !== result.y)
                throw new ValueError('Vector has a NAN value' + result)
            return result;
        }
    })
    
    _p.toString = function() {
        return '<CompoundPoint'
            + ' i: ' + this._vector.valueOf()
            + ' v: ' + this.vector.valueOf()
            + ' with ' + this._components.length + ' components'
            +'>';
    }
    
    return CompoundPoint;
});

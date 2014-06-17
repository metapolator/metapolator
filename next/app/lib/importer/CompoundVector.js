define([
    'metapolator/errors'
  , './Vector'
  , './IntrinsicValue'
], function(
    errors
  , Vector
  , IntrinsicValue
) {
    "use strict";
    
    var ValueError = errors.Value;
    
    function CompoundVector(intrinsic /*, ... vector components */) {
        this._value = intrinsic instanceof Array
            ? Vector.from.apply(null, intrinsic)
            : Vector.from(intrinsic)
            ;
        this._components = Array.prototype.slice.call(arguments, 1);
        this._intrinsic = new IntrinsicValue(this);
        for(var i=0;i<this._components.length;i++)
            if(this._components[i] === undefined)
                throw new ValueError('A component is undefined, index: ' + i)
    }
    
    var _p = CompoundVector.prototype;
    _p.constructor = CompoundVector;
    
    // we can use this for instanceof checks
    _p.IntrinsicValue = IntrinsicValue;
    
    Object.defineProperty(_p, 'intrinsic', {
        get: function() {
            return this._intrinsic
        }
    })
    
    /**
     * the value of a CompoundVector is the sum of its 'intrinsic' value
     * and all of it's components.
     */
    Object.defineProperty(_p, 'value', {
        get: function() {
            var i = 0, result;
            
            result = this._value;
            for(;i<this._components.length;i++)
                // if it has a 'value' we simply assume that there
                // is an instance of Vector or anything that can be added
                // to an Vector. See the  source of the 'complex/Complex'
                // module for how adding to complex Numbers works.
                result = result['+'](this._components[i].value || this._components[i]);
            
            // just as a watchguard, may be removed when the software matures
            // because the check might happen fairly often and so be expensive
            if(result.x !== result.x || result.y !== result.y)
                throw new ValueError('Vector has a NaN value: ' + result)
            return result;
        }
    })
    
    _p.toString = function() {
        return '<' + this.constructor.name
            + ' i: ' + this._value.valueOf()
            + ' v: ' + this.value.valueOf()
            + ' with ' + this._components.length + ' components'
            +'>';
    }
    
    return CompoundVector;
});

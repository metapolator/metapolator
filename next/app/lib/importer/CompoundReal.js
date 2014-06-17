define([
    'metapolator/errors',
    './IntrinsicValue'
], function(
    errors
  , IntrinsicValue
) {
    "use strict";
    
    var ValueError = errors.Value;
    
    
    
    function CompoundReal(intrinsic /*, ... value components */) {
        if(intrinsic !== intrinsic)
            throw new ValueError('The intrinsic value is NaN.');
        this._value = intrinsic;
        this._components = Array.prototype.slice.call(arguments, 1);
        this._intrinsic = new IntrinsicValue(this);
        for(var i=0;i<this._components.length;i++)
            if(this._components[i] === undefined)
                throw new ValueError('A component is undefined, index: ' + i)
    }
    
    var _p = CompoundReal.prototype;
    _p.constructor = CompoundReal;
    
    // we can use this for instanceof checks
    _p.IntrinsicValue = IntrinsicValue;
    
    Object.defineProperty(_p, 'intrinsic', {
        get: function() {
            return this._intrinsic
        }
    })
    
    /**
     * the value of a CompoundReal is the sum of its 'intrinsic' value
     * and all of it's components.
     */
    Object.defineProperty(_p, 'value', {
        get: function() {
            var i = 0, result;
            
            result = this._value;
            for(;i<this._components.length;i++) {
                result += this._components[i] instanceof this.constructor
                    ? this._components[i].value
                    : this._components[i]
                    ;
            }
            
            // just as a watchguard, may be removed when the software matures
            // because the check might happen fairly often and so be expensive
            if(result !== result)
                throw new ValueError('CompoundReal has a NaN value: ' + result)
            return result;
        }
    })
    
    _p.toString = function() {
        return '<' + this.constructor.name
            + ' i: ' + this._value
            + ' v: ' + this.value
            + ' with ' + this._components.length + ' components'
            +'>';
    }
    
    return CompoundReal;
});

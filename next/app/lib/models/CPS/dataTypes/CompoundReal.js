define([
    'metapolator/errors',
    './IntrinsicValue'
], function(
    errors
  , IntrinsicValue
) {
    "use strict";
    
    var ValueError = errors.Value;
    
    function CompoundReal(intrinsic, getCPSValueAPI, postfixComponentStack) {
        if(intrinsic !== intrinsic)
            throw new ValueError('The intrinsic value is NaN.');
        this._value = intrinsic;
        this._getCPSValueAPI = getCPSValueAPI;
        this._components = postfixComponentStack || [];
        this._intrinsic = new IntrinsicValue(this);
        this._executionRoot = undefined
    }
    
    var _p = CompoundReal.prototype;
    _p.constructor = CompoundReal;
    
    Object.defineProperty(_p, 'intrinsic', {
        get: function() {
            return this._intrinsic;
        }
    })
    
    Object.defineProperty(_p, 'getCPSValueAPI', {
        get: function() {
            return this._getCPSValueAPI;
        }
    })
    
    /**
     * the value of a CompoundReal is its 'intrinsic' value
     * plus the value of its components, which can be a simple algebraic
     * expression, see compoundRealCPSFactory and the algebra module
     */
    Object.defineProperty(_p, 'value', {
        get: function() {
            var stack = []
              , i = 0
              , result
              ;
            if(this.executionRoot === undefined)
                this.executionRoot = true;
            else
                // this thing ended up requesting it's own value
                return 0
            for(;i<this._components.length;i++) {
                var val;
                if(typeof this._components[i].getValue === 'function') {
                    // time to resolve the value
                    val = this._components[i].getValue(this._getCPSValueAPI);
                    stack.push(val);
                }
                // it's an Operator
                else {
                    stack.push(
                        this._components[i].execute.apply(this._components[i],
                                stack.splice(-this._components[i].consumes))
                    );
                }
            }
            if(!this._components.length)
                val = 0;
            else if(stack.length !== 1)
                throw new ValueError('The components of this CompoundReal '
                                + 'didn\'t resolve to a a stack with '
                                + 'length 1. Length is :' + stack.length
                                + ' stack: '+ stack.join('|'));
            else
                val = stack.pop();
            // returns a number
            if(typeof val.getValue === 'function')
                val = val.getValue(this._getCPSValueAPI);
            else if(val instanceof this.constructor)
                val = val.value;
            if(typeof val !== 'number')
                throw new ValueError('The components of this CompoundReal '
                                + 'doesn\'t resolve to a number: ' + val
                                +' typeof ' +  typeof val);
            
            // add the intrinsic value
            // TODO: do we wan't to do something else than just adding it
            result = this._value + val;
            // just as a watchguard, may be removed when the software matures
            // because the check might happen fairly often and so be expensive
            if(result !== result)
                throw new ValueError('CompoundReal has a NaN value: ' + result)
            this.executionRoot = undefined;
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

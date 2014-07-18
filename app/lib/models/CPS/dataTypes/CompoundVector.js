define([
    'metapolator/errors'
  , './Vector'
  , './IntrinsicVectorValue'
], function(
    errors
  , Vector
  , IntrinsicValue
) {
    "use strict";
    
    var ValueError = errors.Value;
    
    function CompoundVector(intrinsic, getCPSValueAPI, postfixComponentStack) {
        this._value = intrinsic instanceof Vector
            ? intrinsic
            : (intrinsic instanceof Array
                ? Vector.from.apply(null, intrinsic)
                : Vector.from(intrinsic)
            )
            ;
        
        this._getCPSValueAPI = getCPSValueAPI;
        this._components = postfixComponentStack || [];
        this._intrinsic = new IntrinsicValue(this);
    }
    
    var _p = CompoundVector.prototype;
    _p.constructor = CompoundVector;
    
    
    Object.defineProperty(_p, 'intrinsic', {
        get: function() {
            return this._intrinsic;
        }
    })
    
    Object.defineProperty(_p, 'getCPSValueAPI', {
        get: function() {
            return this._getCPSValueAPI
        }
    })
    
    Object.defineProperty(_p, 'x', { get: function(){return this.value.x; }})
    Object.defineProperty(_p, 'y', { get: function(){return this.value.y; }})
    
    /**
     * the value of a CompoundVector is its 'intrinsic' value
     * plus the value of its components, which can be a simple algebraic
     * expression, see compoundVectorCPSFactory and the algebra module
     */
    Object.defineProperty(_p, 'value', {
        get: function() {
            var stack = []
              , i = 0
              , result
              , val
              ;
            if(this.executionRoot === undefined)
                this.executionRoot = true;
            else
                // this thing ended up requesting it's own value
                return 0
            
            for(;i<this._components.length;i++) {
                var args;
                // it's an Operator
                if(typeof this._components[i].execute === 'function') {
                    args = [this._getCPSValueAPI];
                    Array.prototype.push.apply(
                            args
                          , stack.splice(-this._components[i].consumes)
                    )
                    stack.push(this._components[i].execute
                                        .apply(this._components[i], args));
                }
                // it's a Value
                else
                    stack.push(this._components[i]);
            }
            if(!this._components.length)
                val = new Vector(0, 0);
            else if(stack.length !== 1)
                throw new ValueError('The components of this CompoundVectors '
                                + 'didn\'t resolve to a a stack with '
                                + 'length 1. Length is :' + stack.length
                                + ' stack: '+ stack.join('|'));
            else
                val = stack.pop();
            // returns a Vector
            
            if(!(val instanceof Vector) && typeof val.getValue === 'function')
                val = val.getValue(this._getCPSValueAPI);
            
            if(!(val instanceof Vector) && (val instanceof this.constructor))
                    val = val.value;
            
            // now it must be a Vector
            if(!(val instanceof Vector))
                throw new ValueError('The components of this CompoundVector '
                                + 'dont\'t resolve to a Vector: "'+ val
                                +'" typeof '+  typeof val);
            // add the intrinsic value
            // TODO: do we wan't to do something else than just adding it?
            result = this._value['+'](val);
            // just as a watchguard, may be removed when the software matures
            // because the check might happen fairly often and so be expensive
            if(result.x !== result.x || result.y !== result.y)
                throw new ValueError('CompundVector has a NaN value: ' + result)
            this.executionRoot = undefined;
            return result;
        }
    })
    
    _p.toString = function() {
        return '<' + this.constructor.name
            + ' i: ' + this._value.valueOf()
            + ' v: ' + this.value.valueOf()
            + ' with ' + this._components.length + ' components:'
            + ' ' +  this._components.join('|')
            +'>';
    }
    
    return CompoundVector;
});

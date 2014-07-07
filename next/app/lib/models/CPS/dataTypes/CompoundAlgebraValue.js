define([
    'metapolator/errors'
  , 'ufojs/main'
  , './algebra'
], function(
    errors
  , ufoJS
  , algebra
) {
    "use strict";
    
    var Parent = algebra.Value.prototype
      , ValueError = errors.Value
        // maybe we should make a common tools module shared between ufoJS
        // and metapolator
      , isFloatString = ufoJS.isFloatString
      ;
    
    /** 
     * This class parses tokens from algebra.Engine into numeric values
     * or, if this is not possible, looks up 'names' using getCPSValueAPI
     * and resolves to all sub-properties divided by a colon :
     * 
     * It is currently shared between:
     *      compoundRealCPSFactory
     *  and compoundVectorCPSFactory
     */
    function CompoundAlgebraValue(literal) {
        algebra.Value.apply(this, Array.prototype.slice.call(arguments));
        this._numericValue = undefined;
        
        var value;
        if(typeof this.literal === 'string' && isFloatString(value = this.literal.trim())) {
            value = parseFloat(value);
            if(value === value) // it's not NaN
                this._numericValue = value;
        }
    }
    
    var _p = CompoundAlgebraValue.prototype = Object.create(Parent);
    _p.constructor = CompoundAlgebraValue;
    
    _p.toString = function() {
        return (this._numericValue !== undefined)
            ? this._numericValue
            : this.literal;
    }
    
    _p.getValue = function(getCPSValueAPI) {
        var value, names, name;
        if(this._numericValue !== undefined)
            // it was parsed on construction already
            return this._numericValue;
        if(this.literal.indexOf(':') !== -1) {
            names = this.literal.split(':').reverse();
            name = names.pop();
            value = getCPSValueAPI(name);
            // dig into the returned item
            while(name = names.pop()) {
                if(typeof value === 'function') {
                    // expect it to be another getCPSValueAPI
                    // Although, it could be anything! there is no real
                    // guarding at the moment. When having an vector and
                    // asking it for 'add', the add method of that vector
                    // is returned ... when the concept is good, we need to
                    // improve the input validation!
                    value = value(name);
                    continue;
                }
                try {
                    value = value[name];
                }
                catch(error) {
                    // make the error a ValueError, this should be handled
                    // in the future
                    throw new ValueError('Searched for "' + name + '" of "'
                                        + this.literal + '" but got: '
                                        + error
                                    , error.stack);
                }
            }
        }
        else
            value = getCPSValueAPI(this.literal);
        return value;
    }
    
    return CompoundAlgebraValue;
});

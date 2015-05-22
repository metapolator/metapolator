define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * A Parameter: name and value
     *
     * This is essentially immutable, to change it replace it with a new
     * Parameter via its parent (ParameterDict).
     */
    function Parameter(parameterName, parameterValue, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._value = parameterValue;

        Object.defineProperties(this, {
            'name': {
                value: parameterName.name
              , enumerable: true
            }
          , 'value': {
                value: parameterValue
              , enumerable: true
            }
          , 'invalid': {
                value: parameterValue.invalid
              , enumerable: true
          }
        });

        // Use this for cases where the Parameter should be identified
        // this represents the value of this parameter, don't use it
        // for representation. Note: toString is similar, but used
        // for serialization, not for comparison. The implementation of
        // this could change to be just a checksum.
        // Probably only "immutable" cps-nodes will have a `hash` property.
        // In turn only mutable cps-nodes will have a nodeID.
        Object.defineProperty(this, 'hash', {
            value: [this.name, ': ', this._value].join('')
          , enumerable: true
        });
    }
    var _p = Parameter.prototype = Object.create(Parent.prototype);
    _p.constructor = Parameter;

    _p.toString = function() {
        return [this.name, ': ', this._value,';'].join('');
    };

    Object.defineProperty(_p, 'message', {
        get: function(){ return this._value.message; }
    });

    return Parameter;
});

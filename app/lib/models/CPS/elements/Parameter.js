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

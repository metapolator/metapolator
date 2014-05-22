define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * A Parameter: name and nalue
     */
    function Parameter(parameterName, parameterValue, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._name = parameterName;
        this._value = parameterValue;
    }
    var _p = Parameter.prototype = Object.create(Parent.prototype)
    _p.constructor = Parameter;
    
    _p.toString = function() {
        return [this._name, ': ', this._value,';'].join('');
    }
    
    Object.defineProperty(_p, 'name', {
        get: function(){ return this._name; }
    })
    
    Object.defineProperty(_p, 'value', {
        get: function(){ return this._value; }
    })
    
    return Parameter;
})

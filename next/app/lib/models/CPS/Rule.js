define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * The container for selectors and parameters.
     */
    function Rule(selectorList, parameterDict, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._selectorList = selectorList;
        this._parameters = parameterDict;
    }
    var _p = Rule.prototype = Object.create(Parent.prototype)
    _p.constructor = Rule;
    
    _p.toString = function() {
        return [this._selectors, ' ', this._parameters].join('');
    }
    
    Object.defineProperty(_p, 'selectorList', {
        get: function(){ return this._selectorList; }
    })
    
    Object.defineProperty(_p, 'parameters', {
        get: function(){ return this._parameters; }
    })
    
    return Rule;
})

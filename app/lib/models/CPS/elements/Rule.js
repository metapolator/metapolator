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
        return [this._selectorList, ' ', this._parameters].join('');
    }
    
    /**
     * If no namespaces are provided, the result of this method equals
     * this._selectorList.
     */
    _p.getSelectorList = function(namespaces) {
        var selectorList = this._selectorList
          , i = 0
          ;
        // Multiply the selectorList on the left by each namespace in turn
        if (namespaces !== undefined) {
            for(;i<namespaces.length;i++)
                if(namespaces[i] !== null)
                    selectorList = namespaces[i].multiply(selectorList);
        }
        return selectorList;
    }
    
    Object.defineProperty(_p, 'parameters', {
        get: function(){ return this._parameters; }
    })
    
    return Rule;
})

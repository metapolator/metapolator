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
        
        this._nameSpaces = [];
        this._nameSpaceCache = undefined;
    }
    
    var _p = Rule.prototype = Object.create(Parent.prototype)
    _p.constructor = Rule;
    
    _p.toString = function() {
        return [this._selectorList, ' ', this._parameters].join('');
    }
    
    /**
     * If there is no item in this._nameSpaces the result of
     * this method equals this._selectorList.
     */
    _p._getNameSpacedSelectorList = function() {
        var selectorList = this._selectorList
          , i = 0
          ;
        // having [a, b, c] and [d, e, f]
        // we get back [ad, ae, af, bd, be, bf, cd, ce, cf]
        // this._nameSpaces[i] must be on the left hand!
        for(;i<this._nameSpaces.length;i++)
            selectorList = this._nameSpaces[i].multiply(selectorList);
        return selectorList;
    }
    
    Object.defineProperty(_p, 'selectorList', {
        get: function() {
            if(!this._nameSpaceCache)
                this._nameSpaceCache = this._getNameSpacedSelectorList();
            return this._nameSpaceCache;
        }
    })
    
    Object.defineProperty(_p, 'parameters', {
        get: function(){ return this._parameters; }
    })
    
    _p.addNamespace = function(selectorList) {
        // kill the old cache if there is any
        this._nameSpaceCache = undefined;
        // namespaces are added bottom first, so that the topmost applying
        // namespace is added last.
        this._nameSpaces.push(selectorList);
    }
    
    return Rule;
})

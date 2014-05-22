define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * A list of selectors
     */
    function SelectorList(selectors, source, lineNo){
        Parent.call(this, source, lineNo);
        this._selectors = [];
        if(selectors.length)
            this.push.apply(this, selectors);
    }
    var _p = SelectorList.prototype = Object.create(Parent.prototype)
    _p.constructor = SelectorList;
    
    _p.toString = function() {
        return this._selectors.join(',\n');
    }
    
    Object.defineProperty(_p, 'selectors', {
        get: function(){ return this._selectors.slice(); }
    })
    
    Object.defineProperty(_p, 'length', {
        get: function(){ return this._selectors.length }
    })
    
    /**
     * Add selectors to this SelectorList.
     */
    _p.push = function(selector /*, ... selectors */) {
        var selectors = Array.prototype.slice.call(arguments)
        return this._selectors.push.apply(this._selectors, selectors);
    }
    
    return SelectorList;
})

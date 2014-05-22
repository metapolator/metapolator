define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * A list of Rules and Comments
     */
    function ParameterCollection(items, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._items = [];
        if(items.length)
            this.push.apply(this, items);
    }
    var _p = ParameterCollection.prototype = Object.create(Parent.prototype)
    _p.constructor = ParameterCollection;
    
    _p.toString = function() {
        return this._items.join('\n\n');
    }
    
    Object.defineProperty(_p, 'items', {
        get: function(){ return this._items.slice(); }
    })
    
    Object.defineProperty(_p, 'length', {
        get: function(){ return this._items.length }
    })
    
    /**
     * Add items to this PropertyCollection.
     */
    _p.push = function(item /*, ... items */) {
        var newItems = Array.prototype.slice.call(arguments)
        return this._items.push.apply(this._items, newItems);
    }
    
    return ParameterCollection;
})

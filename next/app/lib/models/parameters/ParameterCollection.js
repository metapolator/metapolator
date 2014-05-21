define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * A list of Rules and Comments
     */
    function PropertyCollection() {
        Parent.call(this)
        this._items = [];
    }
    var _p = PropertyCollection.prototype = Object.create(Parent.prototype)
    _p.constructor = PropertyCollection;
    
    _p.toString = function() {
        return this._items.join('\n');
    }
    
    Object.defineProperty(_p, 'items', {
        get: function(){ return this._items.slice(); }
    })
    
    Object.defineProperty(_p, 'length', {
        get: function(){ return this._items.length }
    })
    
    /**
     * Add items to this PropertyCollection. The item should resemble the
     * Interface of ./_BaseRule to be compatible.
     */
    _p.push = function(item /*, ... items */) {
        var newItems = Array.prototype.slice.call(arguments)
        return this._items.push.apply(this._items, newItems);
    }
    
    return PropertyCollection;
})

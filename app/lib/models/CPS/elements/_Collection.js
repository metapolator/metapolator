define([
    'metapolator/errors'
  , './_Node'
  , './Rule'
], function(
    errors
  , Parent
  , Rule
) {
    "use strict";
    var CPSError = errors.CPS;
    /**
     * A Base for a Collection of Rules and Comments
     */
    function _Collection(items, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._items = [];
        if(items.length)
            Array.prototype.push.apply(this._items, items);
    }
    var _p = _Collection.prototype = Object.create(Parent.prototype)
    _p.constructor = _Collection;
    
    _p.toString = function() {
        return this._items.join('\n\n');
    }
    
    Object.defineProperty(_p, 'items', {
        get: function(){return this._items.slice(); }
    })
    
    function _filterRules(item) {
        return item instanceof Rule;
    }
    Object.defineProperty(_p, 'rules', {
        get: function(){return this._items.filter(_filterRules);}
    })
    
    Object.defineProperty(_p, 'length', {
        get: function(){ return this._items.length }
    })
    
    return _Collection;
})

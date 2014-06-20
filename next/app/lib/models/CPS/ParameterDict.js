define([
    './_Node'
  , './GenericCPSNode'
], function(
    Parent
  , GenericCPSNode
) {
    "use strict";
    
    // TODO:
    // Make this an ordered dict. Ordered to keep the comments where
    // they belong. Dict for access to the Parameters themselves!
    // There is the possibility to declare two parameters of the same
    // name. We merge multiply defined Parameter like so:
    // the last one wins, the other previous ones are getting dumped.
    // If this is not fancy enough we can still think of another approach.
    
    /**
     * A dictionary of parameters and a list of parameters, comments and
     * GenericCPSNodes
     */
     
    function ParameterDict(items, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._items = [];
        if(items.length)
            this.push.apply(this, items);
    }
    var _p = ParameterDict.prototype = Object.create(Parent.prototype)
    _p.constructor = ParameterDict;
    
    _p.toString = function() {
        var prepared = this._items.map(function(item) {
            if(item instanceof GenericCPSNode)
                return ['    ', item, ';'].join('')
            return '    ' + item;
        })
        
        prepared.unshift('{');
        prepared.push('}');
        return prepared.join('\n');
    }
    
    Object.defineProperty(_p, 'items', {
        get: function(){ return this._items.slice(); }
    })
    
    Object.defineProperty(_p, 'length', {
        get: function(){ return this._items.length; }
    })
    
    /**
     * Add items
     */
    _p.push = function(item /*, ... items */) {
        var items = Array.prototype.slice.call(arguments)
        return this._items.push.apply(this._items, items);
    }
    
    return ParameterDict;
})

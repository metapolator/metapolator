define([
    'metapolator/errors'
  , './_Node'
  , './GenericCPSNode'
  , './Parameter'
], function(
    errors
  , Parent
  , GenericCPSNode
  , Parameter
) {
    "use strict";
    
    // TODO:
    // Make this an ordered dict. Ordered to keep the comments where
    // they belong. Dict for access to the Parameters themselves!
    // There is the possibility to declare two parameters of the same
    // name. We merge multiply defined Parameter like so:
    // the last one wins, the other previous ones are not available via
    // keys, the index interface would work.
    // If this is not fancy enough we can still think of another approach.
    
    /**
     * A dictionary of parameters and a list of parameters, comments and
     * GenericCPSNodes
     */
     
    function ParameterDict(items, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._items = items.slice();
        this._dict = undefined;
        this._keys = undefined;
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
    
    
    function _filterParameters(item) {
        return (item instanceof Parameter && !item.invalid);
    }
    
    Object.defineProperty(_p, 'items', {
        get: function() {
            return this._items.filter(_filterParameters);
        }
    })
    
    _p._getAllItems = function() {
        return this._items.slice();
    }
    
    Object.defineProperty(_p, 'length', {
        get: function(){ return this.items.length; }
    })
    
    _p._buildIndex = function() {
        var items = this.items
          , i=items.length-1
          , key
          ;
        this._dict = Object.create(null);
        // searching backwards, because the last item with key === name has
        // the highest precedence
        for(;i>=0;i--) {
            key = this.items[i].name;
            if(!(key in this._dict))
                this._dict[key] = items[i].value;
        }
        this._keys = Object.keys(this._dict);
    };

    _p.keys = function() {
        if(!this._keys)
            this._buildIndex();
        return this._keys;
    };

    _p.get = function(key) {
        if(!this._dict)
            this._buildIndex();
        if(!(key in this._dict))
            throw new errors.Key('Key "'+key+'" not in ParameterDict');
        return this._dict[key];
    };

    _p.has = function(key) {
        if(!this._dict)
            this._buildIndex();
        return key in this._dict;
    };
    
    _p.find = function(key) {
        var items = this.items
          , i = 0
          , indexes = []
          ;
        for(;i<items.length;i++) {
            if(key === items[i].name);
                indexes.push(i);
        }
        return indexes;
    }
    
    _p.itemValue = function(index) {
        return this._items[index].value;
    }
    
    return ParameterDict;
})

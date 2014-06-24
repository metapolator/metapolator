define([
    'metapolator/errors'
  , './_Node'
  , './Rule'
  , './StyleDict'
  , './selectorEngine'
], function(
    errors
  , Parent
  , Rule
  , StyleDict
  , selectorEngine
) {
    "use strict";
    var CPSError = errors.CPS;
    /**
     * A list of Rules and Comments
     */
    function ParameterCollection(parameterRegistry, items, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._parameterRegistry = parameterRegistry;
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
        get: function(){return this._items.slice(); }
    })
    
    function _filterRules(item){
        return item instanceof Rule;
    }
    Object.defineProperty(_p, 'rules', {
        get: function(){return this._items.filter(_filterRules);}
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
    
    /**
     * returns a single interface to read the final cascaded, computed
     * style for that element.
     * 
     * Note: this interface element could be based on the result of
     * rulesForElement and just search that rules up to the end
     */
    _p.getComputedStyle = function(element) {
        var rules = selectorEngine.getMatchingRules(this.rules, element);
        return new StyleDict(this._parameterRegistry, rules, element);
    }
    
    return ParameterCollection;
})

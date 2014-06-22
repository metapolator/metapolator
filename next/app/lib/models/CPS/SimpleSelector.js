define([
    'metapolator/errors'
  , './_Node'
  , './GenericCPSNode'
], function(
    errors
  , Parent
  , GenericCPSNode
) {
    "use strict";
    
    var CPSError = errors.CPS
    /**
     * This may become an interface for enhancement via plugins. 
     * 
     * simple selectors:
     *          universal, type, id, class, id, pseudo-class pseudo-element
     * 
     * A selector may be alien, which means we ignore it, because we don't
     * understand it. An alien selector is not invalid, thus its SelectorList
     * is still valid.
     */
    function SimpleSelector(element, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._element = element;
        this._invalid = false;
        this._alien = false;
        this._message = undefined;
        
        if(!(element instanceof GenericCPSNode))
            throw new CPSError('Element has the wrong type: "' + element
                                + '" should be a GenericCPSNode.')
        this._type = this._getType(element);
        if(this._type === undefined) {
            this._alien = true;
            this._message = 'Type of simple selector is unsupported: ' + element
        }
        // todo: process the values. especially for items where the value
        // is  'function'
    }
    
    var _p = SimpleSelector.prototype = Object.create(Parent.prototype)
    _p.constructor = SimpleSelector;
    
    _p.toString = function() {
        return this._element + '';
    }
    
    Object.defineProperty(_p, 'invalid', {
        get: function(){ return this._invalid;}
    });
    Object.defineProperty(_p, 'alien', {
        get: function(){ return this._alien;}
    });
    Object.defineProperty(_p, 'message', {
        get: function(){ return this._message;}
    });
    Object.defineProperty(_p, 'type', {
        get: function(){ return this._type;}
    });
    _p._getType = function(element) {
        switch(element.type){
          case 'ident':
            if(element._ast[1] === '*')
                return 'universal';
            return 'type';
          case 'clazz':
            return 'class';
          case 'shash':
            return 'id';
        // pseudo class is a very special case!
          case 'pseudoc':
            return 'pseudo-class';
        // pseudo element is very special, too!
          case 'pseudoe':
            return 'pseudo-element';
        }
        return undefined;
    }
    
    return SimpleSelector;
})

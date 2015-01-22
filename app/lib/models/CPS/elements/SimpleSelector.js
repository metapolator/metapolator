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
    function SimpleSelector(type, name, value, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._invalid = false;
        this._alien = false;
        this._message = undefined;
        this._value = undefined;
        
        if(!(type in this._supportedTypes)) {
            this._alien = true;
            this._message = 'Type of SimpleSelector is unsupported:' + type;
        }
        this._type = type;
        
        if(name === undefined) {
            this._invalid = true;
            this._message = 'Name of SimpleSelector is unkown!';
            return;
        }
        this._name = name;
        
        if(this._type === 'pseudo-class' && this._name === 'i') {
            if(value === undefined || value !== value || typeof value !== 'number') {
                this._invalid = true;
                this._message = 'No valid value for pseudoclass "i": ('
                                            + typeof value +') '  + value;
                return;
            }
            this._value = value;
        }
    }
    
    var _p = SimpleSelector.prototype = Object.create(Parent.prototype)
    _p.constructor = SimpleSelector;
    
    _p.toString = function() {
        switch(this.type) {
            case 'universal':
            case 'type':
                return this.name;
            case 'class':
                return '.'+this.name;
            case 'id':
                return '#'+this.name;
            case 'pseudo-element':
                return '::'+this.name;
            case 'pseudo-class':
                return ':' + this.name
                            + (this._value !== undefined
                                    ? '('+this._value+')'
                                    : '');
        }
        
    }
    
    _p._supportedTypes = {
        'universal': null
      , 'type': null
      , 'class': null
      , 'id': null
      , 'pseudo-class': null
      , 'pseudo-element': null
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
    Object.defineProperty(_p, 'name', {
        get: function(){ return this._name;}
    });
    Object.defineProperty(_p, 'value', {
        get: function(){ return this._value;}
    });
    Object.defineProperty(_p, 'specificity', {
        get: function() {
            var a, b, c;
            a = b = c = 0;
            switch(this._type) {
                case 'id':
                    a = 1;
                    break;
                case 'class':
                case 'attribute': // unsupported at the moment
                case 'pseudo-class':
                    b = 1;
                    break;
                case 'type':
                case 'pseudo-element':
                    c = 1;
                    break;
            }
            return [a, b, c];
        }
    });
    
    return SimpleSelector;
})

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
        this._type = this._getType();
        if(this._type === undefined) {
            this._alien = true;
            this._message = 'Type of SimpleSelector is unsupported: ' + element;
        }
        this._name = this._getName();
        if(this._name === undefined) {
            this._invalid = true;
            this._message = 'Name of SimpleSelector is unkown: ' + element;
            return;
        }
        
        if(this._type === 'pseudo-class' && this._name === 'i') {
            this._value = this._getPseudoClassValueForIndex();
            if(this._value === undefined) {
                this._invalid = true;
                this._message = 'Can\'t get value for pseudoclass "i": ' + element;
                return;
            }
        }
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
    
    _p._getType = function() {
        switch(this._element.type){
          case 'ident':
            if(this._element._ast[1] === '*')
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
    
    _p._getName = function() {
        var name = name;
        if(typeof this._element._ast[1] === 'string') {
            name = this._element._ast[1];
        }
        else if(this._element._ast[1] instanceof Array) {
            if(this._element._ast[1][0] === 'ident')
                name = this._element._ast[1][1];
            else if(this._element._ast[1][0] === 'funktion'
                    && this._element._ast[1][1] instanceof Array
                    && this._element._ast[1][1][0] === 'ident')
                name = this._element._ast[1][1][1];
        }
        if(typeof name !== 'string' && name !== undefined)
            throw new CPSError('Can\'t find a name for SimpleSelector (' 
                            + this._element + ')')
        return name;
    }
    
    _p._getPseudoClassValueForIndex = function(){
        console.log('_getPseudoClassValueForIndex', this._element._ast[1]);
        if(this._element._ast[1][0] !== 'funktion'
                || this._element._ast[1][2][0] !== 'functionBody')
            return;
        var body
          , number
          ;
        body = this._element._ast[1][2].slice(1)
            .filter(function(item) {
                return !(item[0] in {'s':null,'comment':null});
            })
        if(body.length === 1 && body[0][0] === 'number')
            number = parseInt(body[0][1], 10);
            // if the result is NaN return undefined
            return (number === number) ? number : undefined;
    }
    
    return SimpleSelector;
})

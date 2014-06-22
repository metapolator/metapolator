define([
    'metapolator/errors'
  , './_Node'
  , './GenericCPSNode'
  , './SimpleSelector'
], function(
    errors
  , Parent
  , GenericCPSNode
  , SimpleSelector
) {
    "use strict";
    
    var CPSError = errors.CPS
    /**
     * A CompoundSelector is a chain of one or more compound selectors
     * 
     * a compound selector is invalid if
     *      - it has more than one of universal or type selector
     *      - a universal or type selector occurs at a later than
     *        the first position
     *      - if it is empty
     * 
     * simple selectors:
     *          universal, type, id, class, id, pseudo-class pseudo-element
     * 
     *  reasons for invalid selectors:
     *
     * A selector may be alien, which means we ignore it, because we don't
     * understand it. an alien selector is not invalid, thus its selectorlist
     * is still valid.
     */
    function CompoundSelector(elements, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._elements = elements;
        
        var status = this._parseSelector(elements);
        
        this._invalid = status.invalid || false;
        this._alien = status.alien || false;
        this._message = status.message || undefined;
        this._value = status.value || undefined;
    }
    
    var _p = CompoundSelector.prototype = Object.create(Parent.prototype)
    _p.constructor = CompoundSelector;
    
    _p.toString = function() {
        if(!this.selects)
            return this._elements.join('');
        // don't serialize the first item if it's marked as implicit
        return (this._value[0] && this._value[0].___implicit
                    ? this._value.slice(1)
                    : this._value
            ).join('')
    }
    
    Object.defineProperty(_p, 'selects', {
        get: function(){ return !this._invalid && !this._alien; }
    });
    Object.defineProperty(_p, 'invalid', {
        get: function(){ return this._invalid;}
    });
    Object.defineProperty(_p, 'alien', {
        get: function(){ return this._alien;}
    });
    Object.defineProperty(_p, 'message', {
        get: function(){ return this._message;}
    });
    Object.defineProperty(_p, 'value', {
        get: function() {
            // if _value is truthy return a copy of the _value array
            // if value is falsy, return its falsy value (probably undefiend)
            return this._value && this._value.slice();}
    });
    
    
    _p._getImplicitUniversalSelector = function() {
        var ast = new GenericCPSNode(['ident', '*'])
          , selector = new SimpleSelector(ast, this._source, this._lineNo)
          ;
          // mark as implicit, so we can let it out when serializing again
          // this is not very 'clean' but very 'practical'
          Object.defineProperty(selector, '___implicit', {value: true});
        return selector;
    }
    
    _p._parseSelector = function(elements) {
        var status = {
                ivalid: false
              , alien: false
              , message: undefined
              // will be set when it is valid
              , value: undefined
            }
          , i = 0
          , item
          , selector
          , selectors = []
        ;
        for(;i<elements.length;i++) {
            item = elements[i];
            if(!(item instanceof GenericCPSNode)) {
                status.alien = true;
                status.message = ['Unknown type for a simple selector:'
                                  ,item, 'typeof:', typeof item].join(' ');
                // no break, this can still become invalid
                continue;
            }
            
            selector = new SimpleSelector(item);
            if(selector.alien) {
                status.alien = true;
                status.message = 'Unknown selector: ' + item.type + ' ' + selector;
            }
            if(selector.invalid) {
                status.invalid = true;
                status.message = 'Invalid selector: ' + selector;
                break;
            }
            else if(selectors.length !== 0
                    && selector.type in {'universal': null, 'type': null}) {
                status.invalid = true;
                status.message = ['Type Selector and Universal selector'
                                , 'can only be the first in a CompoundSelector'
                                , 'but found "'+ selector +'" at position:'
                                , (i+1)].join(' ');
                break;
            }
            else if(selectors.length === 0
                    && !(selector.type in {'universal': null, 'type': null})) {
                    // add the 'implicit' universal selector
                selectors.push(this._getImplicitUniversalSelector());
                this._hasTypeSelector = true;
            }
            selectors.push(selector);
        }
        if(selectors.length === 0) {
            status.invalid = true;
            status.message = 'CompoundSelector has no SimpleSelector items';
        }
        if(!status.alien || !status.invalid)
            status.value = selectors;
        return status;
    }
    
    return CompoundSelector;
})

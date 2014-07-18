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
    function CompoundSelector(selectors, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._alien = false;
        this._invalid = false;
        this._message = undefined;
        this._specificity = undefined;
        
        if(selectors.length === 0)
            throw new CPSError('CompoundSelector has no SimpleSelector items');
        
        this._value = selectors.slice();
        if(!(this._value[0].type in {'universal': null, 'type': null})) {
            this._value.unshift(new SimpleSelector('universal', '*',
                                            undefined, source, lineNo));
            this._value[0].___implicit = true;
        }
        
        var i=0
          , selector
          ;
        for(;i<this._value.length;i++) {
            selector = this._value[i];
            if(selector.alien) {
                this._alien = true;
                this._message = 'Unknown selector: ' + selector.type + ' ' + selector.name;
            }
            if(selector.invalid) {
                this._invalid = true;
                this._message = 'Invalid selector: ' + selector;
                break;
            }
            if(i !== 0
                    && selector.type in {'universal': null, 'type': null}) {
                this._invalid = true;
                this._message = ['Type Selector and Universal selector'
                                , 'can only be the first in a CompoundSelector'
                                , 'but found "'+ selector +'" at position:'
                                , (i+1)].join(' ');
                break;
            }
        }
    }
    
    var _p = CompoundSelector.prototype = Object.create(Parent.prototype)
    _p.constructor = CompoundSelector;
    
    _p.toString = function() {
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
    Object.defineProperty(_p, 'specificity', {
        get: function() {
            var a, b, c, i=0, specificity;
            a = b = c = 0;
            for(;i<this._value.length;i++) {
                specificity = this._value[i].specificity;
                a += specificity[0];
                b += specificity[1];
                c += specificity[2];
            }
            return [a, b, c];
        }
    })
    
    return CompoundSelector;
})

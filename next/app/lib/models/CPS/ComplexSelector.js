define([
    'metapolator/errors'
  , './_Node'
  , './GenericCPSNode'
  , './Comment'
  , './Combinator'
  , './CompoundSelector'
], function(
    errors
  , Parent
  , GenericCPSNode
  , Comment
  , Combinator
  , CompoundSelector
) {
    "use strict";
    
    var CPSError = errors.CPS
    /**
     * A ComplexSelector is a chain of one or more compound selectors
     * separated by combinators. 
     * 
     * TODO: we will need to extract the meaning of the elements
     * 
     * so far, we extract:
     * 
     * simple selectors:
     *          universal, type, id, class, id, pseudo-class pseudo-element
     * 
     * 
     * A selector may be invalid, which would mark its selectorList invalid
     * (and thus all selectors in that list)
     * 
     *  reasons for invalid selectors:
     *      it's empty
     *      a child of it is invalid
     *      it has two combinators followng after each other
     *          only possible for > at the moment
     *          invalid: master>>penstroke
     *          valid: master>*>penstroke
     * 
     * a compound selector is invalid if
     *      - it has more than one of universal or type selector
     *      - a universal or type selector occurs not as first 
     * 
     * 
     * A selector may be alien, which means we ignore it, because we don't
     * understand it. an alien selector is not invalid, thus its selectorlist
     * is still valid.
     * 
     * 
     */
    function ComplexSelector(elements, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._elements = elements;
        
        var status = this._parseSelector(elements);
        
        this._invalid = status.invalid || false;
        this._alien = status.alien || false;
        this._message = status.message || undefined;
        this._value = status.value || undefined;
    }
    
    var _p = ComplexSelector.prototype = Object.create(Parent.prototype)
    _p.constructor = ComplexSelector;
    
    _p.toString = function() {
        if(this._value)
            return this._value.join('');
        return this._elements.join('');
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
        get: function(){ return this._value;}
    });
    
    
    /* combinators that are not alien */
    _p._combinators = {
        // the child combinator
        'child' : true
        // whitespace is the descendant combinator, but we have to detect
        // this another way
    }
    
    _p._parseSelector = function(elements) {
        var status = {
                ivalid: false
              , alien: false
              , message: undefined
              // will be set when it is valid
              , value: undefined
            }
          , value = []
          , i=0
          , item
          , CompoundSelectorElements = null
          , isWhitespace
          ;
        
        var util = require.nodeRequire('util');
        for(; i<elements.length; i++) {
            item = elements[i];
            isWhitespace = (item instanceof GenericCPSNode && item.type === 's');
            if(isWhitespace && value.length === 0)
                // skip all whitespaces at the beginning
                continue;
            else if(item instanceof Comment)
                // skip all comments
                continue;
            
            if(item instanceof Combinator) {
                if(!(item.type in this._combinators)) {
                    status.alien = true;
                    status.message = 'The combinator type "'+ item.type
                                  +'" is alien to us';
                }
                // keep on parsing, this can still become invalid
                if(value.length === 0) {
                    status.invalid = true;
                    status.message = 'The first item in a selector must '
                                                +'not be a combinator';
                    break;
                }
                // if this is a combinator and the last item in values is a
                // combinator, too, this is inavlid
                else if(value[value.length-1] instanceof Combinator) {
                    status.invalid = true;
                    status.message = ['Two subsequent combinators in a'
                                     , 'selector are not valid. Found:'
                                     , value[value.length-1].value
                                     , 'followed by:' + item.value
                                     ].join(' ');
                    break;
                }
                // close the current simple selector
                CompoundSelectorElements = null;
                value.push(item);
                continue;
            }
            // may be whitespace, or a simple selector
            if(isWhitespace) {
                // close the current simple selector
                CompoundSelectorElements = null;
                continue;
            }
            // must be a simple selector (or invalid/alien)
            if(CompoundSelectorElements === null) {
                // if no other combinator is already there:
                if(value.length && !(value[value.length-1] instanceof Combinator))
                    // push a simple 'descendant' Combinator
                    // it's somehow pointless to use this._source, this._lineNo
                    // in this case. we could have remembered the source and line
                    // of the last whitespace
                    value.push(new Combinator(' ', this._lineNo, this._source));
                
                // make a new one
                CompoundSelectorElements = [];
                value.push(CompoundSelectorElements);
            }
            CompoundSelectorElements.push(item);
        }
        
        if(!value.length) {
            status.invalid = true;
            status.message = 'A selector must not be empty'
        }
        else if(value[value.length-1] instanceof Combinator) {
            status.invalid = true;
            status.message = 'The last item of a selector must not be a '
                             +' combinator, found: ' + value[value.length-1].value
        }
        else {
            // build the CompoundSelectors
            for(i=0; i<value.length; i++) {
                if(value[i] instanceof Combinator)
                    continue;
                
                value[i] = new CompoundSelector(value[i], value[i][0]._lineNo,
                                                        value[i][0]._source);
                if(value[i].alien || value[i].invalid) {
                    status.invalid = value[i].invalid || status.invalid;
                    status.alien = value[i].alien || status.alien;
                    status.message = value[i].message;
                    if(status.invalid)
                        break;
                }
            }
        }
        
        if(!status.invalid && !status.alien)
            status.value = value;
        return status;
    }
    
    return ComplexSelector;
})

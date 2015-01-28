define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * A list of ComplexSelectors
     */
    function SelectorList(selectors, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._selectors = [];
        this._value = [];
        this._multiplyCache = new WeakMap();
        if(selectors.length)
            Array.prototype.push.apply(this._selectors, selectors);
        
        // Maybe we'll need to determine the following on demand, not on init??
        var i, l, selector, count=0;
        for(i=0,l=this._selectors.length;i<l;i++) {
            selector = this._selectors[i];
            if(selector.invalid) {
                this._invalid = true;
                this._message = selector.message;
                break;
            }
            if(!selector.selects)
                continue;
            this._value.push(selector)
            count +=1;
        }
        if(!count) {
            this._invalid = true;
            this._message = 'SelectorList has no selecting selector';
        }
    }
    
    /**
     * A factory that creates one selectorlist from two input
     * selectorLists
     * 
     * This uses the value property of the input selectorLists,
     * so the result uses only selecting ComplexSelectors
     * 
     * The ComplexSelectors are combined using the descendant combinator.
     */
    SelectorList.multiply = function(a, b) {
        var x, y, l, ll
          , selectorsA = a._selectors
          , selectorsB = b._selectors
          , result = []
          ;
        for(x=0,l=selectorsA.length;x<l;x++) {
            for(y=0, ll=selectorsB.length;y<ll;y++)
                result.push(selectorsA[x].add(selectorsB[y]));
        }
        return new SelectorList(result);
    }
    
    var _p = SelectorList.prototype = Object.create(Parent.prototype)
    _p.constructor = SelectorList;
    
    
    var _filterNotInvalid = function(selector) {
        return !selector.invalid;
    }
    
    var _filterSelecting = function(selector) {
        return selector.selects;
    }
    
    _p.toString = function() {
        return this._selectors.filter(_filterNotInvalid).join(',\n') || 'invalidSelectorList';
    }
    
    Object.defineProperty(_p, 'selectors', {
        get: function(){ return this._selectors.slice(); }
    })
    
    Object.defineProperty(_p, 'length', {
        get: function(){ return this._selectors.length }
    })
    
    Object.defineProperty(_p, 'selects', {
        get: function(){ return !this._invalid; }
    });
    Object.defineProperty(_p, 'invalid', {
        get: function(){ return this._invalid;}
    });
    Object.defineProperty(_p, 'message', {
        get: function(){ return this._message;}
    });
    Object.defineProperty(_p, 'value', {
        get: function(){ return this._value.slice(); }
    });
    
    _p.multiply = function(selectorList) {
        var r = this._multiplyCache.get(selectorList);
        if(!r) {
            r = this.constructor.multiply(this, selectorList);
            this._multiplyCache.set(selectorList, r);
        }
        return r;
    }
    
    /**
     * Add selectors to this SelectorList.
     */
    //_p.push = function(selector /*, ... selectors */) {
    //    var selectors = Array.prototype.slice.call(arguments)
    //    return this._selectors.push.apply(this._selectors, selectors);
    //}
    
    return SelectorList;
})

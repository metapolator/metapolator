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
        if(selectors.length)
            Array.prototype.push.apply(this._selectors, selectors);
        
        // Maybe we'll need to determine the following on demand, not on init??
        var i=0, count=0;
        for(;i<this._selectors.length;i++) {
            if(this._selectors[i].invalid) {
                this._invalid = true;
                this._message = this._selectors[i].message;
                break;
            }
            if(!this._selectors[i].selects)
                continue;
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
        var x=0
          , y
          , selectorsA = a.selectors
          , selectorsB = b.selectors
          , result = []
          ;
        for(;x<selectorsA.length;x++) {
            y=0;
            for(;y<selectorsB.length;y++)
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
        get: function(){ return this._selectors.filter(_filterSelecting); }
    });
    
    _p.multiply = function(selectorList) {
        return this.constructor.multiply(this, selectorList);
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

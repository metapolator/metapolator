define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * A list of ComplxSelectors
     */
    function SelectorList(selectors, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._selectors = [];
        if(selectors.length)
            this.push.apply(this, selectors);
        
        // Maybe we'll need to determine the following on demand, not on init??
        var i=0, count=0;
        for(;i<this.selectors.length;i++) {
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
    var _p = SelectorList.prototype = Object.create(Parent.prototype)
    _p.constructor = SelectorList;
    
    _p.toString = function() {
        return this._selectors.join(',\n');
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
    Object.defineProperty(_p, 'alien', {
        get: function(){ return this._alien;}
    });
    Object.defineProperty(_p, 'message', {
        get: function(){ return this._message;}
    });
    
    var _filterSelecting = function(selector) {
        return selector.selects;
    }
    Object.defineProperty(_p, 'value', {
        get: function(){ return this._selectors.filter(_filterSelecting); }
    });
    
    
    /**
     * Add selectors to this SelectorList.
     */
    _p.push = function(selector /*, ... selectors */) {
        var selectors = Array.prototype.slice.call(arguments)
        return this._selectors.push.apply(this._selectors, selectors);
    }
    
    return SelectorList;
})

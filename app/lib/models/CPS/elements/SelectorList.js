define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * A list of ComplexSelectors
     *
     * An instance of this must be treated as immutable, it will not
     * change its content/selectors.
     */
    function SelectorList(selectors, source, lineNo) {
        Parent.call(this, source, lineNo);
        // Keeping this private. The value property returns a copy of
        // the this._selectors array and that's the public interface.
        this._selectors = selectors.slice();
        this._multiplyCache = new WeakMap();

        var i, l, selector, count=0, invalid=false, message;

        for(i=0,l=this._selectors.length;i<l;i++) {
            selector = this._selectors[i];
            if(selector.invalid) {
                invalid = true;
                message = selector.message;
                break;
            }
            if(!selector.selects)
                continue;
            count +=1;
        }
        if(!invalid && !count) {
            invalid = true;
            message = 'SelectorList has no valid selector';
        }
        Object.defineProperties(this,{
            'selects': {
                value: !invalid
              , enumerable: true
            }
          , 'invalid': {
                value: invalid
              , enumerable: true
            }
          , 'length': {
                value: selectors.length
              , enumerable: true
            }
          , 'message': {
                value: message
              , enumerable: true
            }
        });
        Object.freeze(this);
        Object.freeze(this._selectors);
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
    };

    var _p = SelectorList.prototype = Object.create(Parent.prototype);
    _p.constructor = SelectorList;

    Object.defineProperty(_p, 'value', {
        get: function(){ return this._selectors.slice(); }
    });

    var _filterValid = function(selector) {
        return !selector.invalid;
    };

    _p.toString = function() {
        return this._selectors.filter(_filterValid).join(',\n') || 'invalidSelectorList';
    };

    _p.multiply = function(selectorList) {
        // the cache is a WeakMap, so it will clean itself
        var r = this._multiplyCache.get(selectorList);
        if(!r) {
            r = this.constructor.multiply(this, selectorList);
            this._multiplyCache.set(selectorList, r);
        }
        return r;
    };

    return SelectorList;
});

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
        var i, l, selector, count=0, invalid=false, message;
        Parent.call(this, source, lineNo);

        // Keeping this private. The value property returns a copy of
        // the this._selectors array and that's the public interface.
        this._selectors = selectors.slice();

        for(i=0,l=selectors.length;i<l;i++) {
            selector = selectors[i];
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
                value: !!invalid
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
    var _p = SelectorList.prototype = Object.create(Parent.prototype);
    _p.constructor = SelectorList;

    Object.defineProperty(_p, 'value', {
        get: function(){ return this._selectors.slice(); }
    });

    var _filterValid = function(selector) {
        return !selector.invalid;
    };

    _p.toString = function() {
        return this._selectors.join(',\n');
        //.filter(_filterValid).join(',\n') || 'invalidSelectorList';
    };

    return SelectorList;
});

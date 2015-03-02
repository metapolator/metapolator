define([
    './_Node'
], function(
    Parent
) {
    "use strict";
    /**
     * Any Combinator in the CPS is part of a ComplexSelector.
     */
    function Combinator(value, source, lineNo) {
        Parent.call(this, source, lineNo);
        Object.defineProperties(this, {
            'type': {
                value: this._types[value] || 'unknown'
              , enumerable: true
            }
          , 'value': {
                value: value
              , enumerable: true
            }
        });
    }
    var _p = Combinator.prototype = Object.create(Parent.prototype);
    _p.constructor = Combinator;

    _p.toString = function() {
        return (this.value === ' '
             ? ' '
             : ' ' + this.value + ' '
        );
    };

    _p._types = {
        '>': 'child'
      , ' ': 'descendant'
      , '+': 'next-sibling'
      , '~': 'following-sibling'
    };

    return Combinator;
});

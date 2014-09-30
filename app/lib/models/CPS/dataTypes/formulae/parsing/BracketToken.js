define([
    'metapolator/errors'
  , './_ValueToken'
], function(
    errors
  , Parent
) {
    "use strict";

    /**
     * Literal is a string, one of '(' , ')', '[', ']'
     * There is no value, the parser interpretes this kind of token
     * by using its literal
     */
    function BracketToken(literal) {
        Parent.call(this, literal, 0, 0);

        var counterparts = {
                '(': ')'
              , ')': '('
              , '[': ']'
              , ']': '['
        };

        Object.defineProperty(this, 'opening', {
            value: '(['.indexOf(this.literal) !== -1
          , enumerable: true
        });

        Object.defineProperty(this, 'closing', {
            value: !this.opening
          , enumerable: true
        });

        Object.defineProperty(this, 'counterpart', {
            value: counterparts[this.literal]
          , enumerable: true
        });
    }

    var _p = BracketToken.prototype = Object.create(Parent.prototype);
    _p.constructor = BracketToken;

    _p.matches = function(val) {
        return val === this.counterpart;
    };


    return BracketToken;
});

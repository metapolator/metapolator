define([
    'metapolator/errors'
  , './_ValueToken'
], function(
    errors
  , Parent
) {
    "use strict";

    /**
     * Literal is a string representing a number.
     * Value is the result of applying parseFloat on literal.
     *
     * value should never be NaN. If this ever happens I strongly recommend
     * to improve the reqular expression of CPS/dataTypes/formulae/parsing
     */
    function NumberToken(literal) {
        Parent.call(this, literal, 0, 0);
        this._value = parseFloat(this.literal);
    }

    var _p = NumberToken.prototype = Object.create(Parent.prototype);
    _p.constructor = NumberToken;

    _p.getValue = function() {
        return this._value;
    };

    return NumberToken;
});

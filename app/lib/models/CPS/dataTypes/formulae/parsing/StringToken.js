define([
    'metapolator/errors'
  , './_ValueToken'
], function(
    errors
  , Parent
) {
    "use strict";

    /**
     * Literal is a string representing itself as a string.
     * Value equals literal.
     */
    function StringToken(literal) {
        Parent.call(this, literal, 0, 0);
    }

    var _p = StringToken.prototype = Object.create(Parent.prototype);
    _p.constructor = StringToken;

    _p.getValue = function() {
        return this.literal;
    };

    return StringToken;
});

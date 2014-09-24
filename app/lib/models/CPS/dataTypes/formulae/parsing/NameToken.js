define([
    'metapolator/errors'
  , './_ValueToken'
], function(
    errors
  , Parent
) {
    "use strict";

    function NameToken(literal) {
        Parent.call(this, literal, 0, 0);
    }

    /**
     * Literal is a string representing a name/key.
     * Value is looked up using the get method of the StyleDict of the
     * host element or in the context of another host element value may
     * be looked up differntly.
     */
    var _p = NameToken.prototype = Object.create(Parent.prototype);
    _p.constructor = NameToken;

    _p.getValue = function() {
        return this.literal;
    };

    return NameToken;
});

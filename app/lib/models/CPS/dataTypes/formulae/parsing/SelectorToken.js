define([
    'metapolator/errors'
  , './_ValueToken'
  , 'metapolator/models/CPS/parsing/parseSelectorList'
], function(
    errors
  , Parent
  , parseSelectorList
) {
    "use strict";

    /**
     * Literal is a string representing a CPS selector.
     * Value is a CPS/elements/SelectorList as produced by the
     * CPS/parsing/parseSelectorList module.
     *
     * FIXME: value should maybe rather be the result of query(this.selectorList)
     *
     * Raises a CPSParserError if literal can't be parsed into a selector
     *
     * selectorEngine is optional, it will cause a selector to be compiled
     * immediately, contrary to beeing compiled when first used.
     */
    function SelectorToken(literal, selectorEngine) {
        Parent.call(this, literal, 0, 0);
        this._value = parseSelectorList.fromString(this.literal, undefined, selectorEngine);
    }

    var _p = SelectorToken.prototype = Object.create(Parent.prototype);
    _p.constructor = SelectorToken;

    _p.getValue = function() {
        return this._value;
    };

    return SelectorToken;
});

define([
    'metapolator/errors'
  , './_FormulaeValue'
  , './SharedFormulaeFactory'
], function(
    errors
  , Parent
  , SharedFormulaeFactory
) {
    "use strict";

    var ValueError = errors.Value;

    function CPSGeneric(getAPI, stack) {
        Parent.call(this, getAPI, stack);
    }

    var _p = CPSGeneric.prototype = Object.create(Parent.prototype);
    _p.constructor = CPSGeneric;
    CPSGeneric.factory = new SharedFormulaeFactory(CPSGeneric);

    _p.getValue = function() {
        var result = this._stack.execute(this._getAPI);
        // result MUST not be undefined
        if(result === undefined)
            throw new ValueError('The formula of this CPS did returns "undefined" which is never valid: ' + this);
        return result;
    };

    return CPSGeneric;
});

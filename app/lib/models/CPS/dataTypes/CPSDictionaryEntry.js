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

    function CPSDictionaryEntry(getAPI, stack) {
        Parent.call(this, getAPI, stack);
    }

    var _p = CPSDictionaryEntry.prototype = Object.create(Parent.prototype);
    _p.constructor = CPSDictionaryEntry;
    CPSDictionaryEntry.factory = new SharedFormulaeFactory(CPSDictionaryEntry);

    _p.getValue = function() {
        var result = this._stack.execute(this._getAPI);
        // result MUST not be undefined
        if(result === undefined)
            throw new ValueError('The formula of this CPS did returns "undefined" which is never valid: ' + this);
        return result;
    };

    return CPSDictionaryEntry;
});

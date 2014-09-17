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
        return this._stack.execute(this._getAPI);
    };

    _p.toString = function() {
        return '<' + this.constructor.name
             + ' v: ' + this.value.valueOf()
             + ' with stack' + this._stack + '>';
    };

    return CPSDictionaryEntry;
});

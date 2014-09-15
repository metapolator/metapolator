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
        // Here used to be a recursion detection, but I doubt that returning
        // 0 is a good measure for debugging also, we should move this to
        // a more central place. _FormulaeValue *MAY* be a good fit.
        // if(this.executionRoot === undefined)
        //     this.executionRoot = true;
        // else
        //     // this thing ended up requesting it's own value
        //     return 0

        // result can be anything
        return this._stack.execute(this._getAPI);
    };

    _p.toString = function() {
        return '<' + this.constructor.name
             + ' v: ' + this.value.valueOf()
             + ' with stack' + this._stack + '>';
    };

    return CPSDictionaryEntry;
});

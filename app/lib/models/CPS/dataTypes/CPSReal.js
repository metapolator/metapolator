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

    function CPSReal(getAPI, stack) {
        Parent.call(this, getAPI, stack);
    }

    var _p = CPSReal.prototype = Object.create(Parent.prototype);
    _p.constructor = CPSReal;
    CPSReal.factory = new SharedFormulaeFactory(CPSReal);

    _p.getValue = function() {
        // Here used to be a recursion detection, but I doubt that returning
        // 0 is a good measure for debugging also, we should move this to
        // a more central place. _FormulaeValue *MAY* be a good fit.
        // if(this.executionRoot === undefined)
        //     this.executionRoot = true;
        // else
        //     // this thing ended up requesting it's own value
        //     return 0
        var result = this._stack.execute(this._getAPI);
        // result MUST be a number
        if(typeof result !== 'number' || result !== result)
            throw new ValueError('The formula of this CPSReal did '
                + (result !== result
                    ? 'result in NaN (happens with division by 0 for example)'
                    : 'not result in a number: "'+ val
                        + '" typeof: ' +  typeof val +
                        + (typeof val.constructor === 'function'
                                ? ' a: ' + val.constructor.name
                                : ''
                        )
                )
            );
        return result;
    };

    _p.toString = function() {
        return '<' + this.constructor.name
             + ' v: ' + this.value.valueOf()
             + ' with stack' + this._stack + '>';
    };

    return CPSReal;
});

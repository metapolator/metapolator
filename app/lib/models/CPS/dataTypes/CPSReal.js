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
        var result = this._stack.execute(this._getAPI);
        // result MUST be a number
        if(typeof result !== 'number' || result !== result)
            throw new ValueError('The formula of this CPSReal did '
                + (result !== result
                    ? 'result in NaN (happens with division by 0 for example)'
                    : 'not result in a number: "'+ result
                        + '" typeof: ' +  typeof result +
                        + (typeof result.constructor === 'function'
                                ? ' a: ' + result.constructor.name
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

define([
    'metapolator/errors'
  , './_FormulaeValue'
  , './SharedFormulaeFactory'
  , 'metapolator/math/Vector'
], function(
    errors
  , Parent
  , SharedFormulaeFactory
  , Vector
) {
    "use strict";

    var ValueError = errors.Value;

    function CPSVector(getAPI, stack) {
        Parent.call(this, getAPI, stack);
    }

    var _p = CPSVector.prototype = Object.create(Parent.prototype);
    _p.constructor = CPSVector;
    CPSVector.factory = new SharedFormulaeFactory(CPSVector);

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
        //result MUST be a vector
        if(!(result instanceof Vector))
            throw new ValueError('The formula of this CPSVector '
                            + 'didn\'t resolve to a Vector: "'+ result
                            + '" typeof ' +  typeof result);
        return result;
    };

    _p.toString = function() {
        return '<' + this.constructor.name
             + ' v: ' + this.value.valueOf()
             + ' with stack' + this._stack + '>';
    };

    return CPSVector;
});

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
        var result = this._stack.execute(this._getAPI);
        //result MUST be a vector
        if(!(result instanceof Vector))
            throw new ValueError('The formula of this CPSVector '
                            + 'didn\'t resolve to a Vector: "'+ result
                            + '" typeof ' +  typeof result);
        return result;
    };

    return CPSVector;
});

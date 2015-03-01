define([
    'metapolator/errors'
  , './_FormulaeValue'
  , './SharedFormulaeFactory'
  , 'ufojs/tools/misc/transform'
], function(
    errors
  , Parent
  , SharedFormulaeFactory
  , transform
) {
    "use strict";

    var ValueError = errors.Value
    , Transformation = transform.Transform
    ;

    function CPSTransformation(getAPI, stack) {
        Parent.call(this, getAPI, stack);
    }

    var _p = CPSTransformation.prototype = Object.create(Parent.prototype);
    _p.constructor = CPSTransformation;
    CPSTransformation.factory = new SharedFormulaeFactory(CPSTransformation);

    _p.getValue = function() {
        var result = this._stack.execute(this._getAPI);
        //result MUST be a ufoJS Transform
        if(!(result instanceof Transformation))
            throw new ValueError('The formula of this CPSTransformation '
                            + 'didn\'t resolve to a ufoJS Transform: "'+ result
                            + '" typeof ' +  typeof result + "  json:" + JSON.stringify(result));
        return result;
    };

    return CPSTransformation;
});

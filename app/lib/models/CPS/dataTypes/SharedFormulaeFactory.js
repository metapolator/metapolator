define([
    'metapolator/errors'
  , './formulae/formulaEngine'
], function(
    errors
  , formulaEngine
) {
    "use strict";

    var CPSFormulaeError = errors.CPSFormulae;

    function SharedFormulaeFactory(TypeConstructor) {
        this.TypeConstructor = TypeConstructor;
    }

    var _p = SharedFormulaeFactory.prototype;

    _p.defaultFactory =  function(name, element, getAPI) {
        throw new errors.Deprecated('We will implement defaults within CPS.');
        // return new this.TypeConstructor(getAPI);
    };

    _p.init = function(parameterValue, setFactoryAPI, setInvalidAPI) {
        var invalidParamterMessage = false
          , stack
          ;

        try {
            stack = formulaEngine.parse(parameterValue.valueString);
        }
        catch(error) {
            // Let's see it fail, the usage of invalidParamterMessage
            // would make it possible to react more gracefully and
            // skip invalid values, but right now we have no good way
            // to tell the user that this happened.

            // if(error instanceof CPSFormulaeError)
            //    invalidParamterMessage = error.message;
            // else
                // reraise in all other cases
                throw error;
        }
        if(invalidParamterMessage) {
            setInvalidAPI(invalidParamterMessage);
            return;
        }
        setFactoryAPI(function(name, element, getAPI) {
            return new this.TypeConstructor(getAPI, stack);
        }.bind(this));
    };

    return SharedFormulaeFactory;
});

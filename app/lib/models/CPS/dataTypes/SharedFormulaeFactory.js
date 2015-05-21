define([
    'metapolator/errors'
  , './formulae/formulaEngine'
], function(
    errors
  , formulaEngine
) {
    "use strict";

    var CPSFormula = errors.CPSFormula;

    function SharedFormulaeFactory(TypeConstructor) {
        this.TypeConstructor = TypeConstructor;
    }

    var _p = SharedFormulaeFactory.prototype;

    _p.init = function(parameterValue, setFactoryAPI, setInvalidAPI) {
        var invalidParamterMessage = false
          , stack
          ;
        try {
            stack = formulaEngine.parse(parameterValue.valueString);
        }
        catch(error) {
            if(!(error instanceof CPSFormula))
                throw error;
            invalidParamterMessage = error.message;
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

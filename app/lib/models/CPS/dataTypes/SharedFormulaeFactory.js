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

    _p.init = function(parameterValue, setFactoryAPI, setInvalidAPI) {
        var invalidParamterMessage = false
          , stack
          ;
        // Throws CPSFormulaeError on fail
        // We let it fail on purpose by now. Catching CPSFormulaeError
        // and using invalidParamterMessage = error.message;
        // would make it possible to react more gracefully by skipping
        // invalid values, but right now we have no good way to tell the
        // user that this happened.
        // setInvalidAPI(invalidParamterMessage) will be the way to do so.
        stack = formulaEngine.parse(parameterValue.valueString);

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

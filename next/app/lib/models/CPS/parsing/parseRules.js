define([
    'metapolator/errors'
  , 'gonzales/gonzales'
  , './curry'
  , './engine'
  , './parameterFactories'
  , './atDictionaryFactories'
], function (
    errors
  , gonzales
  , curry
  , parserEngine
  , parameterFactoriesModule
  , atDictionaryFactories
) {
    "use strict";
    var CPSError = errors.CPS
      , parameterFactories = parameterFactoriesModule.factories
      ;
    
    var factorySwitches = [
            atDictionaryFactories.atDictionaryParsingSwitch
        ]
      , rulesFromAST = curry(parserEngine, parameterFactories, factorySwitches);
      ;
    /**
     * Create a ParameterCollection from a CSS-string
     */
    function rulesFromString(css, sourceName, parameterRegistry) {
        var ast = gonzales.srcToCSSP(css);
        return rulesFromAST(ast, sourceName, parameterRegistry)
    }
     
    return {
        fromString: rulesFromString
      , fromAST: rulesFromAST
    }
})

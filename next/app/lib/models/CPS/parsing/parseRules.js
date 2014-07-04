define([
    'metapolator/errors'
  , 'gonzales/gonzales'
  , './curry'
  , './engine'
  , './parameterFactories'
  , './atDictionaryFactories'
  , 'metapolator/models/CPS/elements/Rule'
  , 'metapolator/models/CPS/elements/Comment'
  
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
    
    function test_switchToAtDictionary(data) {
        return (data[0] === 'atruler'
              && data[1] && data[1][0] === 'atkeyword'
              && data[1][1] && data[1][1][0] === 'ident'
              && data[1][1][1] === 'dictionary'
        );
    }
    
    var factorySwitches = [
            [test_switchToAtDictionary, atDictionaryFactories]
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

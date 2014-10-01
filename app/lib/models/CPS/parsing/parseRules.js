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
      , CPSParserError = errors.CPSParser
      , parameterFactories = parameterFactoriesModule.factories
      ;
    
    var factorySwitches = [
            atDictionaryFactories.atDictionaryParsingSwitch
        ]
      , rulesFromAST = curry(parserEngine, parameterFactories, factorySwitches);
      ;
    /**
     * Create a ParameterCollection from a CSS string
     */
    function rulesFromString(css, sourceName, parameterRegistry) {
        var ast;
        try {
            ast = gonzales.srcToCSSP(css);
        }
        catch (error) {
            // gonzales throws a pure JavaScript Error, but we want more
            // certainty in the rest of our application
            throw new CPSParserError(error.message, error.stack);
        }
        
        return rulesFromAST(ast, sourceName, parameterRegistry)
    }
     
    return {
        fromString: rulesFromString
      , fromAST: rulesFromAST
    }
})

define([
    // the special 'exports' module helps us around circular dependency
    // issues with the 'atImportFactories' module
    'exports'
  , 'metapolator/errors'
  , 'gonzales/gonzales'
  , './curry'
  , './engine'
  , './parameterFactories'
  , './atDictionaryFactories'
  , './atImportFactories'
], function (
    exports
  , errors
  , gonzales
  , curry
  , parserEngine
  , parameterFactoriesModule
  , atDictionaryFactories
  , atImportFactories
) {
    "use strict";
    var CPSError = errors.CPS
      , CPSParserError = errors.CPSParser
      , parameterFactories = parameterFactoriesModule.factories
      ;
    
    var factorySwitches = [
            atDictionaryFactories.atDictionaryParsingSwitch,
            atImportFactories.atImportParsingSwitch
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
            throw new CPSParserError("("+sourceName+") "+error.message, error.stack);
        }
        
        return rulesFromAST(ast, sourceName, parameterRegistry)
    }
    
    exports.fromString = rulesFromString;
    exports.fromAST = rulesFromAST;
})

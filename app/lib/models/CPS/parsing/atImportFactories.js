define([
    // the special 'exports' module helps us around circular dependency
    // issues with the parseRules module
    'exports'
  , 'metapolator/errors'
  , './curry'
  , './parameterFactories'
  , 'metapolator/models/CPS/elements/Parameter'
  , 'metapolator/models/CPS/elements/AtRuleCollection'
  , 'metapolator/models/CPS/elements/AtRuleName'
  , 'metapolator/models/CPS/elements/GenericCPSNode'
  
  , 'ufojs/tools/io/static'
  , 'metapolator/project/parameters/registry'
  , 'metapolator/models/CPS/parsing/parseRules'
    
], function (
    exports
  , errors
  , curry
  , parameterFactories
  , Parameter
  , AtRuleCollection
  , AtRuleName
  , GenericCPSNode
  
  , io
  , parameterRegistry
  , parseRules
) {
    "use strict";
    var CPSError = errors.CPS
      , genericNameFactory = parameterFactories.genericNameFactory
      ;
      
    /**
     * override constructors for the purpose of @import.
     * This means for all children of @import we can define other rules.
     * If we don't do so, the regular rules apply. JavaScript Prototype
     * Inheritance.
     *
     * like a module pattern, to not pollute the namespace with
     * temporary variables
     */
    var atImportFactories = Object.create(parameterFactories.factories)
      , atImportParsingSwitch
      ;
    (function(factories) {
            var k;
            for(k in factories) atImportFactories[k] = factories[k];
    })({
        /**
         * Find the name of the resource to load and return a ParameterCollection
         */
        'atrules': function(node, source) {
            var args, resource;
            
            // filter all whitespace
            args = node.children.slice(1).filter(function(child) {
                if(child.instance instanceof GenericCPSNode && child.instance.type === 's')
                    return false;
                return true;
            });
            
            // accept only one argument which must be a string
            if(args.length !== 1
                || !(args[0].instance instanceof GenericCPSNode
                                    && args[0].instance.type === 'string'))
                return this,['__GenericAST__'](node, source);
            resource = args[0].data.slice(1,-1);
            
            // TODO:
            // at this point: at least "io" and "parameterRegistry"
            // should be somehow given by the code that invoked the parser
            // in the first place!
            // Also, it would be interesting to create and return a special
            // subclass of ParameterCollection => AtImportCollection,
            // this would be a good marker for us!
            // This could be done by using a (sub-)version of parameterFactories
            // that overides the "stylesheet" factory, which is declared in
            // baseFactories.
            
            //parse the file and return the resulting ParameterCollection
            var cpsString = io.readFile(false, resource);
            return parseRules.fromString(cpsString, resource, parameterRegistry);
        }
      , 'atkeyword': curry(genericNameFactory, AtRuleName)
    });

    function test_switchToAtImport(data) {
        return (data[0] === 'atrules'
              && data[1] && data[1][0] === 'atkeyword'
              && data[1][1] && data[1][1][0] === 'ident'
              && data[1][1][1] === 'import'
        );
    }

    atImportParsingSwitch = [test_switchToAtImport, atImportFactories];

    exports.factories = atImportFactories;
    exports.atImportParsingSwitch = atImportParsingSwitch;
});

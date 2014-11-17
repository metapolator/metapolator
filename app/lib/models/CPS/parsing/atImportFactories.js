define([
    'metapolator/errors'
  , './curry'
  , './parameterFactories'
  , 'metapolator/models/CPS/elements/Parameter'
  , 'metapolator/models/CPS/elements/AtRuleCollection'
  , 'metapolator/models/CPS/elements/AtRuleName'
  , 'metapolator/models/CPS/elements/GenericCPSNode'
], function (
    errors
  , curry
  , parameterFactories
  , Parameter
  , AtRuleCollection
  , AtRuleName
  , GenericCPSNode
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
        'atrules': function(node, source, ruleController) {
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
                return this['__GenericAST__'](node, source);
            resource = args[0].data.slice(1,-1);
            
            // TODO:
            // * It is desired to create and return a special
            //   subclass of ParameterCollection => AtImportCollection,
            //   This will be a good marker for us and allow for all kinds
            //   of specialization!
            //   This could be done by using a (sub-)version of parameterFactories
            //   that overides the "stylesheet" factory, which is declared in
            //   baseFactories.
            // * The new subclass of ParameterCollection will stringify as the
            //   original @import directive
            
            //parse the file and return the resulting ParameterCollection
            return ruleController.getRule(false, resource);
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

    return {
        factories: atImportFactories
      , atImportParsingSwitch: atImportParsingSwitch
    };
});

require([
  , 'metapolator/errors'
  , 'metapolator/project/parameters/registry'
  , 'metapolator/models/CPS/elements/ParameterValue'
  , 'metapolator/models/CPS/elements/Parameter'
  , 'metapolator/models/CPS/elements/ParameterDict'
  , 'metapolator/models/CPS/elements/Rule'
  , 'metapolator/models/CPS/elements/AtImportCollection'
  , 'metapolator/models/CPS/parsing/parseSelectorList'
],
function (
  , errors
  , parameterRegistry
  , ParameterValue
  , Parameter
  , ParameterDict
  , Rule
  , AtImportCollection
  , parseSelectorList
) {
    "use strict";
    // TODO: let this grow into a useful collection of tools, then make
    // a module out of it.
    // It's hard to know in advance what's going to be needed
    return {
        /**
         * Set `value` to the parameter `name` of `parameterDict`.
         *
         * Arguments:
         * parameterDict: an instance of ParameterDict as returned
         *                by Rule.parameters
         * name: a string with the parameter name
         * value: a string (of cps-formulae-language¹)
         *
         * return value: nothing.
         * raises: potentially a lot.
         *
         * ¹ Actually this depends on which type is registered for `name`
         *   but at the time of this writing there is only cps-formulae-language.
         *   There are, however, parameters that check their return type,
         *   after evaluation of the cps-formulae-language.
         */
        setParameter: function setParameter(parameterDict, name, value) {
            var _value = new ParameterValue([value], [])
                , parameter
                , factory = parameterRegistry.getFactory(name)
                ;
            _value.initializeTypeFactory(name, factory);
            parameter = new Parameter({name:name}, _value);
            parameterDict.setParameter(parameter);
        }
      , addNewRule: function addNewRule(parameterCollection, index, selectorListString) {
            var source = 'generated'
              , selectorList = parseSelectorList.fromString(selectorListString)
              , parameterDict = new ParameterDict([], source, 0)
              , rule = new Rule(selectorList, parameterDict, source, 0)
              ;
            // returns the actual index at which the rule was created
            return parameterCollection.splice(index, 0, rule)[0];
        }
        /**
         * CAUTION: Here an intersting dependency to ruleController emerges.
         * Probably this method should be part of the stateful interface,
         * because this way a ruleController from a different project can
         * be used which is not intended right now and was never tested!
         */
      , addNewAtImport: function addNewAtImport(async, parameterCollection
                                    , index, ruleController, resourceName) {
            var collection = new AtImportCollection(ruleController, 'generated')
                // it's only a promise if `async` is true
              , promise = collection.setResource(async, resourceName)
              ;

            function resolve() {
                return parameterCollection.splice(index, 0, collection)[0];
            }

            return async
                 ? promise.then(resolve, errors.unhandledPromise)
                 : resolve()
                 ;
        }
    };
});

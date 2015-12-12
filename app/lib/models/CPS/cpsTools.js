define([
    'metapolator/errors'
    // TODO: bad reference. Maybe this has to be a class instanciated by
    // project (or any entity that is entitled to know about the valid
    // parameters/registry setup).
  , 'metapolator/project/parameters/registry'
  , 'metapolator/models/CPS/elements/ParameterValue'
  , 'metapolator/models/CPS/elements/Parameter'
  , 'metapolator/models/CPS/elements/ParameterDict'
  , 'metapolator/models/CPS/elements/Rule'
  , 'metapolator/models/CPS/elements/AtImportCollection'
  , 'metapolator/models/CPS/parsing/parseSelectorList'
],
function (
    errors
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
    //
    // THIS MODULE IS STILL searching it's place to be. Partially because
    // there are dependencies that need more knowledge about the actual
    // project/implementation/user than there should be.
    // especially: "metapolator/project/parameters/registry"
    //             and in addNewAtImport "ruleController"
    //
    // FIXME: move this to a central place/make a higher level API
    // also: take care of the dependencies of this module:
    // ParameterValue, parameterRegistry, Parameter

    function makeProperty(name, value) {
        var _value = new ParameterValue([value], [])
          , factory = parameterRegistry.getFactory(name)
          ;
        _value.initializeTypeFactory(name, factory);
        return new Parameter({name:name}, _value);
    }

    // this are just shortcuts for propertyDict.splice
    // use makeProperty to create the property argument
    function updateProperty(propertyDict, index, property) {
        propertyDict.splice(index, 1, [property]);
    }

    function appendProperty(propertyDict, property) {
        propertyDict.splice(propertyDict.length, 0, [property]);
    }

    function moveCPSElement(source, sourceIndex, target, targetIndex) {
        var property, items;
        if(source === target) {
            // if source and target are identical we can make
            // one atomic replace of all items, instead of two actions.
            // This is done by resetting all items in a new order.
            // This triggers less events so I guess it is cheaper.
            // I may be wrong! So if you have too much time, please measure ;-)
            items = target.items;
            property = items.splice(sourceIndex, 1)[0];
            items.splice(targetIndex, 0, property);
            // now replace all at once
            target.splice(0, items.length, items);
            return;
        }
        // remove
        property = source.splice(sourceIndex, 1)[3][0];
        // insert
        target.splice(targetIndex, 0, property);
    }

    function isProperty(item) {
        return item instanceof Parameter;
    }

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
    function setProperty(propertyDict, name, value) {
        var property = makeProperty(name, value);
        propertyDict.setParameter(property);
    }
    // legacy! find and remove all users
    // use setProperty instead
    var setParameter = setProperty;

    function addNewRule(parameterCollection, index, selectorListString) {
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
    function addNewAtImport(async, parameterCollection
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

    /**
     * Will rewrite the whole propertyDict!
     */
    function setElementProperties(element, data) {
        setProperties(element.properties, data);
    }

    /**
     * Will rewrite the whole propertyDict!
     */
    function setProperties(propertyDict, data) {
        var newProperties
          , name
          ;
        if(!data)
            return;
        newProperties = [];
        for(name in data)
            newProperties.push(makeProperty(name, data[name]));
        propertyDict.splice(0, propertyDict.length, newProperties);
    }

    return {
        makeProperty: makeProperty
      , appendProperty: appendProperty
      , updateProperty: updateProperty
      , moveCPSElement: moveCPSElement
      , isProperty: isProperty
      , setProperty: setProperty
      // deprecated! use the identical setProperty instead
      , setParameter: setParameter
      , addNewRule: addNewRule
      , addNewAtImport: addNewAtImport
      , setProperties: setProperties
      , setElementProperties: setElementProperties
    };
});

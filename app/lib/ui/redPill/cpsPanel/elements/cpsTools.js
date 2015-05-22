define([
    'metapolator/models/CPS/elements/ParameterValue'
  , 'metapolator/models/CPS/elements/Parameter'
  , 'metapolator/project/parameters/registry'
], function(
    ParameterValue
  , Parameter
  , parameterRegistry
) {
    "use strict";
    // THIS MODULE IS NOT INTENDED TO LIVE HERE FOREVER
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

    function moveProperty(sourceDict, sourceIndex, targetDict, targetIndex) {
        var property, items;
        if(sourceDict === targetDict) {
            // if sourceDict and targetDict are identical we can make
            // one atomic replace of all items, instead of two actions.
            // This is done by resetting all items in a new order.
            // This triggers less events so I guess it is cheaper.
            // I may be wrong! So if you have too much time, please measure ;-)
            items = targetDict.items;
            property = items.splice(sourceIndex, 1)[0];
            items.splice(targetIndex, 0, property);
            // now replace all at once
            targetDict.splice(0, items.length, items);
            return;
        }
        property = sourceDict.splice(sourceIndex, 1)[0];
        targetDict.splice(targetIndex, 0, property);
    }

    return {
        makeProperty: makeProperty
      , appendProperty: appendProperty
      , updateProperty: updateProperty
      , moveProperty: moveProperty
    };
});

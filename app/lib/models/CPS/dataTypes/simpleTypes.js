define([
    'metapolator/errors'
  , 'ufojs/main'
  , './Vector'
], function(
    errors
  , ufoJS
  , Vector
) {
    "use strict";
    
    var isFloatString = ufoJS.isFloatString;
    
    return {
        string: {
            init: function(parameterValue, setFactoryAPI, setInvalidAPI) {
                // parse here ... parameterValue
                var invalidParamter = typeof parameterValue.valueString !== 'string';
                // do this if the parameter is bad:
                if(invalidParamter) {
                    setInvalidAPI('The Parameter does not look like a string');
                    return;
                }
                //else
                var value = parameterValue.valueString.trim();
                setFactoryAPI(function(name, element) {
                    return value;
                });
            }
          , defaultFactory: function(name, element) {
                return '(empty)';
            }
          , is: function(value) {
                return typeof value === 'string';
            }
        }
      , real: {
            init: function(parameterValue, setFactoryAPI, setInvalidAPI) {
                var invalidParamter = false
                  , value
                  ;
                // parse and check
                invalidParamter = (
                       !isFloatString(value = parameterValue.valueString.trim())
                    || !isFinite(value = parseFloat(value))
                    );
                // do this if the parameter is bad:
                if(invalidParamter) {
                    setInvalidAPI('The Parameter does not look like a number');
                    return;
                }
                //else
                setFactoryAPI(function(name, element) {
                    return value;
                });
            }
          , defaultFactory: function(name, element) {
                return 0;
            }
          , is: function(value) {
                return typeof value === 'number' && isFinite(value);
            }
        }
      , vector: {
            init: function(parameterValue, setFactoryAPI, setInvalidAPI) {
                var invalidParamter = false
                  , value
                  ;
                // parse and check
                value = parameterValue.valueString.split(',');
                // must be two items separated by ','
                if(value.length !== 2)
                    invalidParamter = true;
                    
                value = value.map(function(item){return item.trim();})
                    // looks like a number
                    .filter(isFloatString)
                    // parse to a number
                    .map(function(item){return parseFloat(item);})
                    // it became a usable number
                    .filter(isFinite);
                // must still be 2
                if(value.length !== 2)
                    invalidParamter = true;
                
                // do this if the parameter is bad:
                if(invalidParamter) {
                    setInvalidAPI('The Parameter does not look like a Vector');
                    return;
                }
                //else
                setFactoryAPI(function(name, element) {
                    return new Vector(value[0], value[1]);
                });
            }
          , defaultFactory: function(name, element) {
                return new Vector(0, 0);
            }
          , is: function(value) {
                return value instanceof Vector;
            }
        }
    }
});

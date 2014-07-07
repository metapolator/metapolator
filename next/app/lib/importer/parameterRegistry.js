define([
    'metapolator/errors'
  , 'metapolator/models/CPS/Registry'
], function(
    errors
  , Registry
) {
    "use strict";
    
    var parameterRegistry = new Registry();
    
    parameterRegistry.register('value', {
                type: 'string'
              , description: 'this is a stub for the parameter description!'
    });
    
    parameterRegistry.register('height', {
                type: 'compoundReal'
              , description: 'the relative value of height'
    });
    
    parameterRegistry.register('heightIntrinsic', {
                type: 'real'
              , description: 'the intrinsic value of the height'
    });
    
    parameterRegistry.register('width', {
                type: 'compoundReal'
              , description: 'the relative value of width'
    });
    
    parameterRegistry.register('widthIntrinsic', {
                type: 'real'
              , description: 'the intrinsic value of the width'
    });
    
    parameterRegistry.register('zon', {
                type: 'compoundVector'
              , description: 'The center on curve point of a skeleton point'
    })
    parameterRegistry.register('zonIntrinsic', {
                type: 'vector'
              , description: 'the intrinsic value of the zon'
    })
    
    return {
        registry: parameterRegistry
      , defaultCPS: defaultCPS
    };
});

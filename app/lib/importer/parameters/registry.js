define([
    'metapolator/errors'
  , 'metapolator/models/CPS/Registry'
], function(
    errors
  , Registry
) {
    "use strict";
    
    var parameterRegistry = new Registry();
    
    parameterRegistry.register('on', {
                type: 'compoundVector'
              , description: 'An On-Curve Point.'
    })
    parameterRegistry.register('onIntrinsic', {
                type: 'vector'
              , description: 'The intrinsic value of an On-Curve Point.'
    })
    
    parameterRegistry.register('in', {
                type: 'compoundVector'
              , description: 'An incoming Control Point.'
    })
    parameterRegistry.register('inIntrinsic', {
                type: 'vector'
              , description: 'The intrinsic value of an incoming Control Point.'
    })
    
    parameterRegistry.register('out', {
                type: 'compoundVector'
              , description: 'An outgoing Control Point.'
    })
    parameterRegistry.register('outIntrinsic', {
                type: 'vector'
              , description: 'The intrinsic value of an outgoing Control Point.'
    })
    
    
    parameterRegistry.register('inTension', {
                type: 'real'
              , description: 'The tension value of an incoming Control Point.'
    });
    
    parameterRegistry.register('outTension', {
                type: 'real'
              , description: 'The tension value of an outgoing Control Point.'
    });
    
    parameterRegistry.register('inDir', {
                type: 'compoundVector'
              , description: 'Direction vector of an incoming Control Point.'
    });
    
    parameterRegistry.register('inDirIntrinsic', {
                type: 'vector'
              , description: 'The intrinsic value of the direction of an '
                                                + 'incomimg Control Point.'
    })
    
    parameterRegistry.register('outDir', {
                type: 'compoundVector'
              , description: 'Direction vector of an outgoing Control Point.'
    });
    
    parameterRegistry.register('outDirIntrinsic', {
                type: 'vector'
              , description: 'The intrinsic value of the direction of an '
                                                + 'outgoing Control Point.'
    });
    
    return parameterRegistry;
});

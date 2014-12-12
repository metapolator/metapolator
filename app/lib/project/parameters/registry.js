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
                type: 'vector'
              , description: 'An On-Curve Point.'
    })

    parameterRegistry.register('in', {
                type: 'vector'
              , description: 'An incoming Control Point.'
    })

    parameterRegistry.register('out', {
                type: 'vector'
              , description: 'An outgoing Control Point.'
    })

    parameterRegistry.register('inTension', {
                type: 'real'
              , description: 'The tension value of an incoming Control Point.'
    });

    parameterRegistry.register('outTension', {
                type: 'real'
              , description: 'The tension value of an outgoing Control Point.'
    });

    parameterRegistry.register('onLength', {
                type: 'real'
              , description: 'The distance from center point to left or '
                            + 'right on curve point'
    })

    parameterRegistry.register('inLength', {
                type: 'real'
              , description: 'The distance from on-curve point to the Control Point'
                            + 'usually unused in favor of inTension'
    })

    parameterRegistry.register('outLength', {
                type: 'real'
              , description: 'The distance from on-curve point to the Control Point'
                            + 'usually unused in favor of outTension'
    })

    parameterRegistry.register('onDir', {
                type: 'real'
              , description: 'The direction in radians from center point '
                            + 'to left or right on curve point'
    })

    parameterRegistry.register('inDir', {
                type: 'real'
              , description: 'Direction of an incoming Control Point in radians.'
    });

    parameterRegistry.register('inDirIntrinsic', {
                type: 'real'
              , description: 'The intrinsic value of the direction of an '
                                                + 'incomimg Control Point.'
    })

    parameterRegistry.register('outDir', {
                type: 'real'
              , description: 'Direction of an outgoing Control Point in radians.'
    });

    parameterRegistry.register('outDirIntrinsic', {
                type: 'real'
              , description: 'The intrinsic value of the direction of an '
                                                + 'outgoing Control Point.'
    });

    parameterRegistry.register('transformation', {
                type: 'transformation'
              , description: 'Affine 2D transformation matrix.'
    });

    parameterRegistry.register('advanceWidth', {
                type: 'real'
              , description: 'The advance width of a glyph.'
    });
    parameterRegistry.register('advanceHeight', {
                type: 'real'
              , description: 'The advance height of a glyph.'
    });

    return parameterRegistry;
});

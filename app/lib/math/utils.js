/* Shared math functions */
define([], function() {
    "use strict";

    /**
     * Normalize `angle` given in radians between 0 and 2*PI
     */
    function normalizeAngle(angle) {
        var result = angle % (2*Math.PI);
        if(result < 0)
            result += (2*Math.PI);
        return result;
    }

    return {
        normalizeAngle: normalizeAngle
    };
});

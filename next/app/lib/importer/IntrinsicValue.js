define([
], function(
) {
    "use strict";
    /**
     * This proxies the 'intrinsic' value of CompoundReal and CompoundVector
     */
    function IntrinsicValue(instance) {
        Object.defineProperty(this, 'value', {
            get: function(){ return instance._value; }
        })
        // this is a back reference
        Object.defineProperty(this, 'instance', {
            get: function(){ return instance; }
        })
    }
    return IntrinsicValue;
});

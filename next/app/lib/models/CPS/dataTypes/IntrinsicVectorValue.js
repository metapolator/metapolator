define([
    './IntrinsicValue'
], function(
    Parent
) {
    "use strict";
    /**
     * This proxies the 'intrinsic' value of CompoundVector
     * 
     * it just adds x and y, so they can be acessed directly
     */
     
    function IntrinsicVectorValue(instance){
        Parent.call(this, instance);
    }
    var _p = IntrinsicVectorValue.prototype = Object.create(Parent.prototype);
    
    Object.defineProperty(_p, 'x', { get: function(){return this.value.x; }})
    Object.defineProperty(_p, 'y', { get: function(){return this.value.y; }})
    
    return IntrinsicVectorValue;
});

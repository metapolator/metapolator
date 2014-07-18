define([  

], function (

) {
    "use strict";
    /**
     * similar to function.prototype.bind, but it doesn't set
     * the value of 'this'
     * 
     */
    function curry(func/* args */) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function() {
           return func.apply(this, args.concat(
                        Array.prototype.slice.call(arguments)));
        }
    }
    return curry;
})

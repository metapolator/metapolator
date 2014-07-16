define([
    'complex/Complex'
], function(
    Parent
) {
    "use strict";
    
    /**
     * Add access with geometry names "x" and "y" and a minimal
     * array interface with length (== 2), 0, 1; 
     */
    function Vector(x, y) {
        Parent.call(this, x, y)
    }
    var _p = Vector.prototype = Object.create(Parent.prototype);
    _p.constructor = Vector;
    
    Vector.fromArray = function(arr) {
        return new _p.constructor(arr[0], arr[1]);
    }
    
    function _getReal() {
        return this.real;
    }
    
    function _getImaginary() {
        return this.imag;
    }
    
    Object.defineProperty(_p, 'x', {get: _getReal})
    Object.defineProperty(_p, 'y', {get: _getImaginary})
    
    // array interface
    Object.defineProperty(_p, 'length', {
        value: 2
      , writable: false
      , enumerable: true
    })
    Object.defineProperty(_p, '0', {get: _getReal})
    Object.defineProperty(_p, '1', {get: _getImaginary})
    
    _p.valueOf = function() {
        return Array.prototype.slice.call(this);
    }
    
    _p.toString = function() {
        return '<Vector ' + this.valueOf() +'>';
    }
    
    // factories and constants
    Vector.i = new Vector(0, 1),
    Vector.one = new Vector(1, 0)
    
    Vector.from = function(x, y) {
        // just map to Parent and then convert
        var complex = Parent.from(x, y);
        return new Vector(complex.real, complex.imag);
    },

    Vector.fromPolar = function(r, phi) {
        return new Vector(1, 1).fromPolar(r, phi);
    }
    
    return Vector;
})

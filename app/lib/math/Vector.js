define([
    'complex/Complex'
  , 'metapolator/models/CPS/whitelistProxies'
], function(
    Parent
  , whitelistProxies
) {
    "use strict";

    /**
     * Add access with geometry names "x" and "y" and a minimal
     * array interface with length (== 2), 0, 1;
     */
    function Vector(x, y) {
        Parent.call(this, x, y);
        this.cps_proxy = whitelistProxies.generic(this, this._cps_whitelist);
    }
    var _p = Vector.prototype = Object.create(Parent.prototype);
    _p.constructor = Vector;

    _p._cps_whitelist = {
        x: 'x'
      , y: 'y'
      , length: 'len'
      , angle: 'rad'
    }


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


    // Some getters, so we can use these easily with CPS. At the moment
    // CPS doesn't provide facilities to call external methods, i.e.
    // methods that are not defined as operators but properties of the
    // element at hand. I think this would make more problems than it
    // would solve, so getters is the way.

    /**
     * A getter for the "length" of the vector, however "length" is already
     * used for an array like interface of Vector. So "len" it is, because
     * its short and often used to abbreviate "length".
     */
    Object.defineProperty(_p, 'len', {
        get: Parent.prototype.magnitude
    })

    /**
     * A getter for the angle of the vector in radians.
     */
    Object.defineProperty(_p, 'rad', {
        get: Parent.prototype.angle
    });

    return Vector;
})

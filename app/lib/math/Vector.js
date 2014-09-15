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
        Parent.call(this, x, y);
    }
    var _p = Vector.prototype = Object.create(Parent.prototype);
    _p.constructor = Vector;

    _p.cps_whitelist = {
        x: true
      , y: true
      , len: 'length'
      , rad: 'angle'
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
        //OLD:
        return new Vector(1, 1).fromPolar(r, phi);

        // uses this.constructor, but that is defined on
        // Vector.prototype, so it should work as expexted
        // return new Vector.prototype.fromPolar(r, phi);

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
     *
     * FIXME: we should have proper whitelisting facilities in CPS
     * to overcome 'accidential' access to properties that weren't meant
     * to be used in CPS. Also, this could add a re-mapping of names
     * to getter methods (or getters). This would make the namespace
     * less crowded and allow a better names for he CPS user!
     * then: rename this to 'length'
     */
    Object.defineProperty(_p, 'len', {
        get: function() {
            return Parent.prototype.magnitude.call(this);
        }
    })

    /**
     * A getter for the angle of the vector in radians.
     * FIXME: see the fixme comment in property "len" above, then: rename
     * this to 'angle'
     */
    Object.defineProperty(_p, 'rad', {
        get: function() {
            return Parent.prototype.angle.call(this);
        }
    })

    return Vector;
})

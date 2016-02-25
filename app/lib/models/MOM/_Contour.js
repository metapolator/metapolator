define([
    'metapolator/errors'
  , './_Node'
], function(
    errors
  , Parent
) {
    "use strict";

    var MOMError = errors.MOM;

    /**
     * All children of a MOM Glyph have to inherit from MOM _Contour.
     */
    function _Contour() {
        /*jshint validthis:true*/
        Parent.call(this);
        if(this.constructor.prototype === _p)
            throw new MOMError('MOM _Contour must not be instantiated '
                +'directly');
    }
    var _p = _Contour.prototype = Object.create(Parent.prototype);
    _p.constructor = _Contour;

    _p._interpolationCompatibilityTests = [
        function isSameType(other, collect, strictlyCompatible) {
            if(other.type !== this.type)
                return [false, this + ':i(' + this.index + '): types are different: '
                                    + other];
            return true;
        }
      , function checkStructure(other, collect, strictlyCompatible) {
            var messages = []
              , compatible
              ;
            // At the moment it's easy, we have always the same structure
            // within the children of any _Contour, so it's enough to count
            // children:
            //      contour -> p
            //      penstroke -> point -> left/center/right
            //      component
            // A more complex node can implement its own tests.

            var difference = other.children.length - this._children.length;
            if(difference !== 0)
                return [false, this + ':i('+this.index+'): '
                        + (difference > 0 ? 'too many' : 'too few')
                         + ' child elements' + ' (' + difference
                         + ') in other '+other.type+'.'];


            return true;
        }
    ];

    Object.defineProperty(_p, 'glyph', {
        get: function() {
            return this._parent;
        }
    });

    return _Contour;
});

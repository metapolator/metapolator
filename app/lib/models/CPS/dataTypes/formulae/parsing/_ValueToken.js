define([
    'metapolator/errors'
  , './_Token'
], function(
    errors
  , Parent
) {
    "use strict";

    function _ValueToken(literal) {
        /*jshint validthis:true */
        Parent.call(this, literal, 0, 0);
    }
    var _p = _ValueToken.prototype = Object.create(Parent.prototype);
    _p.constructor = _ValueToken;

    /**
     * Implement this method for children of this class
     */
    _p.getValue = function() {
        throw new errors.NotImplementedError('The getValue interface needs '
                        + ' implementation in child classes of _ValueToken.');
    };

    return _ValueToken;
});

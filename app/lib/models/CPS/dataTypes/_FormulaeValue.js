define([
    'metapolator/errors'
], function(
    errors
) {
    "use strict";

    var NotImplementedError = errors.NotImplemented;

    function _FormulaeValue(getAPI, stack) {
        /*jshint validthis:true */
        this._getAPI = getAPI;
        this._stack = stack;
    }

    var _p = _FormulaeValue.prototype;
    _p.constructor = _FormulaeValue;

    _p.getValue = function() {
        throw new NotImplementedError('The getValue Interface must be '
                        +'implemented by the children of _FormulaeValue');
    };

    _p.toString = function() {
        return '<' + this.constructor.name
             + ' v: ' + this.value.valueOf()
             + ' with stack' + this._stack + '>';
    };

    return _FormulaeValue;
});

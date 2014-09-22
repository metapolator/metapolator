define([
    'metapolator/errors'
], function(
    errors
) {
    "use strict";

    /**
     * Abstract base class for *StyleDict.
     */
    function _StyleDict() {
    }
    var _p = _StyleDict.prototype;
    _p.constructor = _StyleDict;

    /**
     * Look up a parameter in the StyleDict.
     *
     * Throw an instance of KeyError if not found.
     */
    _p.get = function(name) {
        throw new errors.NotImplemented('Abstract class _StyleDict must be sub-classed!');
    }

    return _StyleDict;
});

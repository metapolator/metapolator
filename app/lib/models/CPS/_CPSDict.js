define([
    'metapolator/errors'
], function(
    errors
) {
    "use strict";

    var NotImplementedError = errors.NotImplemented;

    /**
     * Common methods shared between ReferenceDict and StyleDict
     */
    function _CPSDict(controller, rules, element) {
        /*jshint validthis:true */
        this._rules = rules;
        this._element = element;
        this._controller = controller;
        this._dict = undefined;
    }

    var _p = _CPSDict.prototype;
    _p.constructor = _CPSDict;

    _p._buildIndex = function() {
        var i=0, j, keys, key;
        this._dict = Object.create(null);
        for(;i<this._rules.length;i++) {
            keys = this._rules[i].parameters.keys();
            for(j=0; j<keys.length; j++) {
                key = keys[j];
                if(!(key in this._dict))
                    this._dict[key] = this._rules[i].parameters.get(key);
            }
        }
    };

    _p.get = function(name) {
        throw new NotImplementedError('The `get` method is missing in this '
                                        +'implementation of _CPSDict');
    };

    return _CPSDict;
});

define([
    'errors'
], function(
    errors
) {
    "use strict";

    var AssertionError = errors.Assertion
      , KeyError = errors.Key
      ;

    function DragDataService() {
        this._type = null;
        this._data = null;
    }

    var _p = DragDataService.prototype;

    _p.set = function(type, data) {
        if(this._type !== null)
            // We expect to have only one drag running at a time.
            // on dragStart set is used on dragend remove both events
            // are guarnteed to happen (by the standard)
            // This enforces cleaning the global DragDataService when
            // done using it :-)
            throw new AssertionError('Data is already set, but it should be '
                            + 'removed before using the set method again.');
        this._type = type;
        this._data = data;
        return this._key;
    };

    _p.get = function(type) {
        if(!this._type || this._type !== type)
            return null;
        return this._data;
    };

    _p.remove = function(type) {
        if(this._type === null)
            return;
        if(this._type !== type)
            throw new KeyError('Wrong type: ' + type + ' got: ' + this._type);
        this._type = null;
        this._data = null;
    };

    return DragDataService;
});

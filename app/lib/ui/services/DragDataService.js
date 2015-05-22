define([
    'errors'
], function(
    errors
) {
    "use strict";

    var AssertionError = errors.Assertion
      , KeyError = errors.Key
      , counter = 0
      ;
    function getKey() {
        return 'key-' + (counter++);
    }

    function DragDataService() {
        this._data = null;
        this._key = null;
    }

    var _p = DragDataService.prototype;

    _p.set = function(data) {
        if(this._key !== null)
            // We expect to have only one drag running at a time.
            // on dragStart set is used on dragend remove both events
            // are guarnteed to happen (by the standard)
            // This enforces cleaning the global DragDataService when
            // done using it :-)
            throw new AssertionError('A key is already set, but it should be '
                            + 'removed before using the set method again.');
        this._key = getKey();
        this._data = data;
        return this._key;
    };

    _p.get = function(key) {
        if(this._key === null)
            throw new KeyError('No key set.');
        if(this._key !== key)
            throw new KeyError('Wrong key: '+ key);
        return this._data;
    };

    _p.remove = function(key) {
        if(this._key !== key)
            throw new KeyError('Wrong key: '+ key+' got: ', this._key);
        this._key = null;
        this._data = null;
    };

    return DragDataService;
});

define([
    'metapolator/errors'
  , 'es6/Proxy'
  , 'ufojs/main'
], function(
    errors
  , proxy
  , ufoJSUtils
) {
    "use strict";

    var CPSError = errors.CPS
      , KeyError = errors.Key
      , isInt = ufoJSUtils.isInt
      , isIntString = ufoJSUtils.isIntString
      ;


    function _handlerFactory(target, whitelist) {
        return proxy(target, new this(whitelist));
    }

    function _get(target, name, receiver) {
        /* jshint validthis: true */
        var result = this._validate(target, name);
        if(!result[0])
            throw new KeyError(result[1]);

        return target[result[1]];
    }

    function _set(target, name) {
        throw new CPSError('Can\'t set "'+name+'". It\'s not allowed '
                                        +'to set values on this object.');
    }

    function _has (target, name, receiver) {
        /* jshint validthis: true */
        return this._validate(target, name)[0];
    }

    /**
     * "whitelist" is an object where the keys are the public names
     * and the values are the names on the target.
     * In the most cases key and value will equal. But this is also a
     * mechanism to create mappings to properties with other names.
     */
    function GenericHandler(whitelist) {
        this._whitelist = whitelist;
        this.get = _get;
        this.has = _has;
        this.set = _set;
    }

    GenericHandler.prototype._validate = function(target, name) {
        if(typeof name !== 'string')
            return [false, 'name must be string but it is: '+ typeof name];

        if(!this._whitelist.hasOwnProperty(name))
            return [false ,'Name "'+ name +'" is not whitelisted '
                            + 'for item "'+ target +'" '
                            + Object.keys(this._whitelist).join(', ')];
        return [true, this._whitelist[name]];

    };

    function ArrayHandler() {
        this.get = _get;
        this.has = _has;
        this.set = _set;
    }

    ArrayHandler.prototype._validate = function(target, key) {
        if(isIntString(key))
            key = parseInt(key, 10);
        if(key === 'length')
            return [true, key];
        else if(!isInt(key))
            return [false, 'Key must be "length" or an integer but it is: '
                                            + key + ' '+ typeof key];
        else if(key<0 || key>=target.length)
             throw new KeyError('The index "'+ key +'" is not in the array. '
                                        + 'Length: ' + target.length);
        return [true, key];
    };

    return {
        generic: _handlerFactory.bind(GenericHandler)
      , array: _handlerFactory.bind(ArrayHandler)
    };
});

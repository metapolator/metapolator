define([
    'metapolator/errors'
  , './_StyleDict'
], function(
    errors
  , Parent
) {
    "use strict";

    var KeyError = errors.Key
      ;

    /**
     * FailoverStyleDict is a wrapper for *StyleDict that implements value
     * source failover when an instance of KeyError is thrown.
     */
    function FailoverStyleDict(styleDicts) {
        this._styleDicts = styleDicts;
    }

    var _p = FailoverStyleDict.prototype = Object.create(Parent.prototype);
    _p.constructor = FailoverStyleDict;

    /**
     * Look up a parameter in each of the wrapped StyleDicts in turn; if we
     * get an instance of KeyError, go to the next one. If no lookup
     * succeeds, throw KeyError.
     */
    _p.get = function(name) {
        for(var i = 0; i < this._styleDicts.length; i++) {
            var result;
            try {
                return this._styleDicts[i].get(name);
            }
            catch(error) {
                if(!(error instanceof KeyError))
                    throw error;
            }
        }
        throw new KeyError('FailoverStyleDict failed to find ' + name);
    }

    return FailoverStyleDict;
});

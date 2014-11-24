define([
    'metapolator/errors'
  , 'metapolator/models/CPS/selectorEngine'
  , 'metapolator/models/CPS/parsing/parseRules'
  , 'obtain/obtain'
], function(
    errors
  , selectorEngine
  , parseRules
  , obtain
) {
    "use strict";
    var KeyError = errors.Key
      , CPSRecursionError = errors.CPSRecursion
      ;

    // FIXME: note that we have a race condition in here:
    //        One request with an older result can respond after
    //        a newer result was cached, the most obvious example
    //        is:
    //              ruleController.getRule(true, name)
    //              ruleController.getRule(false, name)
    //
    //        The second call will write the cache before the first call.
    //        This problem exists with all asynchronous requests, of
    //        course, but in this case it is more probable.
    //        See the implementation of `getRule` (the `rule` getter)
    //        for an attempt to improve the situation, and a further comment.

    function RuleController(io, parameterRegistry, cpsDir) {
        this._io = io;
        this._parameterRegistry = parameterRegistry;
        this._cpsDir = cpsDir;
        this._commissionIdCounter = 0;
        this._rules = Object.create(null);
        this._importing = Object.create(null);
    }
    var _p = RuleController.prototype;

    Object.defineProperty(_p, 'parameterRegistry', {
        get: function() {
            return this._parameterRegistry;
        }
    });

    _p._isCached = function(sourceName) {
        return (sourceName in this._rules) && this._rules[sourceName].cached;
    };

    _p._set = function(sourceName, rule, commissionId) {
        var record;
        if(!(sourceName in this._rules))
            record = this._rules[sourceName] = {parameterCollection: rule};
        else {
            record = this._rules[sourceName];
            record.parameterCollection.reset(rule.items, rule.source, rule.lineNo);
        }
        record.commissionId = commissionId;
        record.cached = true;
    };

    _p._readFile = function(async, fileName) {
                            return this._io.readFile(async, fileName); };

    _p.getRule = obtain.factory(
        {
            fileName: ['sourceName', function(sourceName) {
                // Detect recursive definition (by @import)
                if(sourceName in this._importing)
                    throw new CPSRecursionError(sourceName + ' @imports itself');
                this._importing[sourceName] = true;
                return [this._cpsDir, sourceName].join('/');}]
          , cps: [false, 'fileName', 'commissionId', _p._readFile]
          , rule: ['cps', 'sourceName', 'commissionId' ,
                function(cps, sourceName, bypassCache, commissionId) {
                    if(!this._isCached(sourceName)
                            // There is a current cache but it was commissioned
                            // before this request, and finished loading before it.
                            // FIXME: a maybe better alternative would be
                            //        to fail here!
                            || this._isCached(sourceName) && commissionId >= this._rules[sourceName].commissionId)
                    {
                        var rule = parseRules.fromString(cps, sourceName, this);
                        this._set(sourceName, rule, commissionId);
                    }
                    delete this._importing[sourceName];
                    return this._rules[sourceName].parameterCollection;
                }]
          , isCached: ['sourceName', _p._isCached]
          , commissionId:[function(){ return this._commissionIdCounter++;}]
        }
      , {cps: [true, 'fileName', 'commissionId', _p._readFile]}
      , ['sourceName']
      , function(obtain, sourceName) {
            if(!obtain('isCached'))
                return obtain('rule');
            return this._rules[sourceName].parameterCollection;
        }
    );

    /**
     * Reload an existing CPS rule
     */
    _p.reloadRule = function(async, sourceName) {
        if(!(sourceName in this._rules))
            throw new KeyError('Can\'t reload rule "'+ sourceName
                                +'" because it\'s not in this controller');
        // mark as uncached
        this._rules[sourceName].cached = false;
        return this.getRule(async, sourceName);
    };
    return RuleController;
});

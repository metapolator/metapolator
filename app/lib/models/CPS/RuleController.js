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
    var KeyError = errors.Key;

    function RuleController(io, parameterRegistry, cpsDir) {
        this._io = io;
        this._parameterRegistry = parameterRegistry;
        this._cpsDir = cpsDir;
        this._rules = [];
        this._ruleIndex = {};
    }

    var _p = RuleController.prototype;

    Object.defineProperty(_p, 'parameterRegistry', {
        get: function() {
            return this._parameterRegistry;
        }
    })

    _p.addRule = function(parameterRule) {
        var ownRule
          , name = parameterRule.source.name
          ;
        try {
            ownRule = this.getRule(name);
        }
        catch(error){
            if(!(error instanceof KeyError))
                throw error;
        }
        if(!ownRule)
            // we don't have a rule named like that yet
            this._ruleIndex[name] = this._rules.push(parameterRule) - 1;
        else if(ownRule !== parameterRule)
            throw new KeyError('A parameterRule object with the '
                + 'name "'+name+'" exists already. Use replaceRule to '
                +'change a rule object?');
        // else: pass, we aleady have that rule
        return;
    }

    Object.defineProperty(_p, 'rules', {
        get: function() {
            return Object.keys(this._ruleIndex)
        }
    })

    /**
     * Asynchronously replace the old cps rule with the new cps rule
     */
    _p.replaceRule = function(sourceName) {
        var index = this._ruleIndex[sourceName];
        if(index === undefined)
            throw new KeyError('Can\'t replace rule "'+ sourceName
                                +'" because it\'s not in this controller');
        delete this._ruleIndex[sourceName]; // Invalidate cache
        return this.parse(true, sourceName);
    }

    _p.getRule = function(rule) {
        var index = this._ruleIndex[rule];
        if(index === undefined)
            throw new KeyError(['The Rule with name "', rule ,'" was '
                    , 'not found in: ',this.rules.join(', ')].join(''));
        return this._rules[index];
    }

    var obtainId = obtain.factory({}, {}, ['x'], function(obtain, x) { return x; });

    _p.parse = function (async, sourceName) {
        try {
            return obtainId(async, this.getRule(sourceName));
        } catch (error) {
            if(!(error instanceof KeyError))
                throw error;
            var fileName = [this._cpsDir, sourceName].join('/');
            var f = function (result) { return parseRules.fromString(result, sourceName, this); }.bind(this);
            var result = this._io.readFile(async, fileName);
            if (async)
                return result.then(f);
            return f(result);
        }
    }

    return RuleController;
})

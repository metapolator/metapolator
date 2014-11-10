define([
    'metapolator/errors'
  , 'metapolator/models/CPS/selectorEngine'
  , 'metapolator/models/MOM/Multivers'
  , 'metapolator/models/MOM/Univers'
  , 'metapolator/models/CPS/StyleDict'
  , 'metapolator/models/CPS/ReferenceDict'
  , 'metapolator/models/CPS/parsing/parseRules'
  , 'obtain/obtain'
], function(
    errors
  , selectorEngine
  , Multivers
  , Univers
  , StyleDict
  , ReferenceDict
  , parseRules
  , obtain
) {
    "use strict";
    var CPSError = errors.CPS
      , KeyError = errors.Key
      ;
    
    function Controller(io, parameterRegistry, cpsDir) {
        this._io = io;
        this._parameterRegistry = parameterRegistry;
        this._cpsDir = cpsDir;
        this._rules = [];
        this._ruleIndex = {};
        // rule names of the masters
        this._masters = {};
        
        this._MOM = new Multivers(this);
        this._univers = new Univers();
        this._MOM.add(this._univers);
        
        this._caches = undefined;
        this._resetCaches();
    }
    
    var _p = Controller.prototype;
    
    /**
     * StyleDict constructor, can be changed by inheritance or
     * monkey patched on instances
     */
    _p.StyleDict = StyleDict;
    _p.ReferenceDict = ReferenceDict;
    
    /**
     * TODO: see if it's possible to invalidate only parts of the cache:
     * when only one master is affected by a change, it is overkill
     * to delete all the other items as well.
     */
    _p._resetCaches = function() {
        this._caches = {
            styleDicts: {}
          , referenceDicts: {}
        }
    };
    
    _p._addRule = function(parameterRule) {
        var ownRule
          , name = parameterRule.source.name
          ;
        try {
            ownRule = this._getRule(name);
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
     * inform all *consumers* of these rules that there was an update
     * this might involve pruning some caches of ModelControllers.
     */
    _p.replaceRule = function(sourceName) {
        var index = this._ruleIndex[sourceName];
        if(index === undefined)
            throw new KeyError('Can\'t replace rule "'+ sourceName
                                +'" because it\'s not in this controller');
        delete this._ruleIndex[sourceName]; // Invalidate cache for readCPS
        this.readCPS(true, sourceName).then(function (result) {
            this._rules[index] = result;
            this._resetCaches();
        }.bind(this));
    }
    
    _p._getRule = function(rule) {
        var index = this._ruleIndex[rule];
        if(index === undefined)
            throw new KeyError(['The Rule with name "', rule ,'" was '
                    , 'not found in: ',this.rules.join(', ')].join(''));
        return this._rules[index];
    }
    
    _p.addMaster = function(master, cpsFile) {
        var rule = this.readCPS(false, cpsFile);
        this._addRule(rule);
        this._masters[master.id] = rule.source.name;
        this._univers.add(master);
    }
    
    _p.hasMaster = function (master) {
        return master in this._masters;
    }
    
    _p.getMasterRule = function (master) {
        if(!(master in this._masters))
            throw new KeyError('Master "'+ master +'" not found in '
                                + Object.keys(this._masters).join(', '));
        return this._masters[master];
    }
    
    Object.defineProperty(_p, 'parameterRegistry', {
        get: function() {
            return this._parameterRegistry;
        }
    })
    
    /**
    * returns a single StyleDict to read the final cascaded, computed
    * style for that element.
    * 
    * Note: this interface element could be based on the result of
    * rulesForElement and just search that rules up to the end
    */
    _p._getComputedStyle = function(element) {
        var masterRules = element.master
                ? this._getRule(this.getMasterRule(element.master.id)).rules
                : []
          , rules = selectorEngine.getMatchingRules(masterRules, element);
        return new this.StyleDict(this, rules, element);
    }
    
    _p.getComputedStyle = function(element) {
        if(element.multivers !== this._MOM)
            throw new CPSError('getComputedStyle with an element that is not '
                + 'part of the multivers is not supported' + element);
        if(!this._caches.styleDicts[element.nodeID])
            this._caches.styleDicts[element.nodeID] = this._getComputedStyle(element);
        return this._caches.styleDicts[element.nodeID];
    }
    
    _p._getReferenceDictionary = function(element) {
        var masterRules = element.master
                ? this._getRule(this.getMasterRule(element.master.id)).dictionaryRules
                : []
        var rules = selectorEngine.getMatchingRules(masterRules, element);
        return new this.ReferenceDict(this, rules, element);
    }
    
    /**
     * A reference dictionary is the interface to the values referenced
     * by the @dictionary CPS rules
     */
    _p.getReferenceDictionary = function(element) {
        if(element.multivers !== this._MOM)
            throw new CPSError('getReferenceDictionary with an element that is not '
                + 'part of the multivers is not supported' + element);
        
        if(!this._caches.referenceDicts[element.nodeID])
            this._caches.referenceDicts[element.nodeID] = this._getReferenceDictionary(element);
        return this._caches.referenceDicts[element.nodeID];
    }
    
    _p._checkScope = function(scope) {
        var i=0;
        if(scope) {
            if(!(scope instanceof Array))
                scope = [scope];
            for(;i<scope.length;i++)
                if(scope[i].multivers !== this._MOM)
                    throw new CPSError('Query with a scope that is not '
                        +'part of the multivers is not supported '
                        + scope[i].particulars);
        }
        else
            scope = [this._MOM];
        return scope;
    }

    _p.queryAll = function(selector, scope) {
        var result = selectorEngine.queryAll(this._checkScope(scope), selector);
        // monkey patching the returned array.
        // it may become useful to invent an analogue to Web API NodeList
        result.query = selectorEngine.queryAll.bind(selectorEngine, result);
        return result;
    }
    
    _p.query = function(selector, scope) {
        return selectorEngine.query(this._checkScope(scope), selector);
    }

    var obtainId = obtain.factory({}, {}, ['x'], function(obtain, x) { return x; });

    _p.readCPS = function (async, sourceName) {
        try {
            return obtainId(async, this._getRule(sourceName));
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

    return Controller;
})

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
    
    function Controller(ruleController) {
        this.ruleController = ruleController;
        this._rules = [];
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
    
    /**
     * Asynchronously replace the old cps rule with the new cps rule and
     * inform all *consumers* of these rules that there was an update
     * this might involve pruning some caches of ModelControllers.
     * FIXME: actually inform consumers
     */
    _p.replaceRule = function(sourceName) {
        this.ruleController.replaceRule(sourceName).then(function (result) {
            this._rules[index] = result;
            this._resetCaches();
        }.bind(this));
    }
    
    _p.addMaster = function(master, rule) {
        this.ruleController.addRule(rule);
        this._masters[master.id] = rule.source.name;
        this._univers.add(master);
    }
    
    _p.hasMaster = function (master) {
        return master in this._masters;
    }
    
    _p._getMasterRule = function (master) {
        if(!(master in this._masters))
            throw new KeyError('Master "'+ master +'" not found in '
                                + Object.keys(this._masters).join(', '));
        return this._masters[master];
    }
    
    /**
    * returns a single StyleDict to read the final cascaded, computed
    * style for that element.
    * 
    * Note: this interface element could be based on the result of
    * rulesForElement and just search that rules up to the end
    */
    _p._getComputedStyle = function(element) {
        var masterRules = element.master
                ? this.ruleController.getRule(this._getMasterRule(element.master.id)).rules
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
                ? this.ruleController.getRule(this._getMasterRule(element.master.id)).dictionaryRules
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

    return Controller;
})

define([
    'metapolator/errors'
  , 'metapolator/models/CPS/selectorEngine'
  , 'metapolator/models/MOM/Multivers'
  , 'metapolator/models/MOM/Univers'
  , 'metapolator/models/CPS/StyleDict'
  , 'metapolator/models/CPS/ReferenceDict'
  , 'metapolator/models/CPS/parsing/parseRules'
], function(
    errors
  , selectorEngine
  , Multivers
  , Univers
  , StyleDict
  , ReferenceDict
  , parseRules
) {
    "use strict";
    var CPSError = errors.CPS
      , KeyError = errors.Key
      ;
    
    function Controller(io, parameterRegistry, cpsDir) {
        this._io = io;
        this._parameterRegistry = parameterRegistry;
        this._cpsDir = cpsDir;
        this._sources = [];
        this._sourceIndex = {};
        // source names of the masters
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
    
    
    _p._rebuildSourceIndex = function() {
        this._sourceIndex = {};
        var i=0
          , name
          ;
        for(;i<this._sources.length;i++) {
            name = this._sources[i].source.name;
            this._sourceIndex[name] = i;
        }
    }
    
    /**
     * todo: check if deleting only parts of the cache is possible
     * when only one master is affected by a change, it is overkill
     * to delete all the other items as well.
     */
    _p._resetCaches = function() {
        this._caches = {
            styleDicts: {}
          , referenceDicts: {}
          , mergedRules: {}
          , ruleFiles: this._caches ? this._caches.ruleFiles : {}
          , dictionaries: {}
        }
    };
    
    _p.addSource = function(parameterSource) {
        var ownSource
          , name = parameterSource.source.name
          ;
        try {
            ownSource = this.getSource(name);
        }
        catch(error){
            if(!(error instanceof KeyError))
                throw error;
        }
        if(!ownSource)
            // we don't have a source named like that yet
            this._sourceIndex[name] = this._sources.push(parameterSource) - 1;
        else if(ownSource !== parameterSource)
            throw new KeyError('A parameterSource object with the same '
                + 'name  "'+name+'" exists already. Use replaceSource to '
                +'change a source objcet?');
        // else: pass, we aleady have that source
        return;
    }
    
    _p.addSources = function(sources) {
        sources.map(this.addSource, this);
    }
    
    Object.defineProperty(_p, 'sources', {
        get: function() {
            return Object.keys(this._sourceIndex)
        }
    })
    
    _p.replaceSource = function(collection) {
        var source = collection.source.name
          , index = this._sourceIndex[source]
          ;
        if(index === undefined)
            throw new KeyError('Can\'t replace source "'+ source
                                +'" because it\'s not in this controller');
        this._sources[index] = collection;
        this._resetCaches();
    }
    
    _p.getSource = function(source) {
        var index = this._sourceIndex[source];
        if(index === undefined)
            throw new KeyError(['The Source with name "', source ,'" was '
                    , 'not found in: ',this.sources.join(', ')].join(''));
        return this._sources[index];
    }
    
    _p.addMaster = function(master, sources) {
        var i=0, sourceSet = {};
        
        this.addSources(sources);
        for(;i<sources.length;i++)
            sourceSet[sources[i].source.name] = null;
        this._masters[master.id] = sourceSet;
        this._univers.add(master);
    }
    
    _p.hasMaster = function (master) {
        return master in this._masters;
    }
    
    _p.getMasterSources = function (master) {
        if(!(master in this._masters))
            throw new KeyError('Master "'+ master +'" not found in '
                                + Object.keys(this._masters).join(', '));
        return Object.keys(this._masters[master]);
    }
    
    
    /**
     * getComputedStyle returns the matching rules in the correct
     * order by specificity, so all rules should be included. The 
     * order of the rules is important, too, and used as last weighting
     * information, if all other specificity numbers equal.
     */
    _p._getMergedRules = function(master) {
        return Array.prototype.concat.apply([]
                    , this.getMasterSources(master)
                            .map(this.getSource, this)
                            .map(function(item){return item.rules;}));
    }
    _p.getMergedRules = function(master) {
        if(!this._caches.mergedRules[master])
            this._caches.mergedRules[master] = this._getMergedRules(master);
        return this._caches.mergedRules[master];
    }
    
    /**
     * get all @dictionary rules for master
     */
    _p._getMergedDictionaries = function(master) {
        return Array.prototype.concat.apply([]
                    , this.getMasterSources(master)
                            .map(this.getSource, this)
                            .map(function(item){return item.dictionaryRules; }));
    }
    _p.getMergedDictionaries = function(master) {
        if(!this._caches.dictionaries[master])
            this._caches.dictionaries[master] = this._getMergedDictionaries(master);
        return this._caches.dictionaries[master];
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
                ? this.getMergedRules(element.master.id)
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
                ? this.getMergedDictionaries(element.master.id)
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
    
    _p.queryAll = function(selector, scope) {
        var i=0
          , result
          ;
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
        result = selectorEngine.queryAll(scope, selector);
        // monkey patching the returned array.
        // it may become useful to invent an analogue to Web API NodeList
        result.query = selectorEngine.queryAll.bind(selectorEngine, result);
        return result;
    }
    
    _p.query = function(selector, scope) {
        var i=0
          , result
          ;
        if(scope) {
            if(!(scope instanceof Array))
                scope = [scope];
            for(;i<scope.length;i++)
                if(scope[i].multivers !== this._MOM)
                    throw new CPSError('Query with a scope that is not '
                        +'part of the multivers is not supported: '
                        + scope[i].pariculars);
        }
        else
            scope = [this._MOM];
        return selectorEngine.query(scope, selector);
    }
    
    _p._readCPS = function (async, sourceName) {
        var fileName = [this._cpsDir, sourceName].join('/');
        return this._io.readFile(async, fileName);
    }

    _p._getCPSRules = function(sourceName) {
        var cpsString = this._readCPS(false, sourceName);
        return parseRules.fromString(cpsString, sourceName, this);
    }

    _p.getCPSRules = function(sourceName) {
        if(!this._caches.ruleFiles[sourceName])
            this._caches.ruleFiles[sourceName] = this._getCPSRules(sourceName);
        return this._caches.ruleFiles[sourceName];
    }

    /**
     * parse the doc content
     * if it parses, replace the old cps rule with the new cps rule
     * inform all *consumers* of these rules that there was an update
     * this might involve pruning some caches of ModelControllers.
     *
     * If this doesn't parse, a CPSParserError is thrown
     *
     * FIXME: rename into "updateCPSRules" to match related api function names
     */
    _p.updateCPSRule = function(sourceName, cpsString) {
        if(!this._caches.ruleFiles[sourceName])
            throw new KeyError('There is no CPS Rule named: ' + sourceName + '.');
        var source = parseRules.fromString(cpsString, sourceName, this);
        // if we are still here parsing was a success
        this._caches.ruleFiles[sourceName] = source;
        this.replaceSource(source);
    }

    /**
     * async is propagated to the obtain API
     * if async is true a promise is returned, otherwise nothing
     */
    _p.refreshCPSRules = function(async, sourceName) {
        if(!this._caches.ruleFiles[sourceName])
            throw new KeyError('There is no CPS Rule named: ' + sourceName + '.');
        var result = this._readCPS(async, sourceName);
        if(async)
            return result.then(this.updateCPSRule.bind(this, sourceName));
        this.updateCPSRule(sourceName);
    }

    return Controller;
})
